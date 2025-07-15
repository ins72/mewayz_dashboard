<?php

namespace App\Http\Controllers;

use App\Models\CrmContact;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CrmContactController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        
        // Validate workspace access
        if ($workspaceId) {
            $workspace = Workspace::find($workspaceId);
            if (!$workspace || !$workspace->members()->where('user_id', auth()->id())->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to workspace'
                ], 403);
            }
        }

        $query = CrmContact::with(['workspace', 'creator']);
        
        if ($workspaceId) {
            $query->where('workspace_id', $workspaceId);
        } else {
            // Get contacts from all workspaces user has access to
            $userWorkspaceIds = auth()->user()->workspaces()->pluck('workspaces.id');
            $query->whereIn('workspace_id', $userWorkspaceIds);
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by tags if provided
        if ($request->has('tags')) {
            $tags = is_array($request->input('tags')) ? $request->input('tags') : [$request->input('tags')];
            $query->where(function ($q) use ($tags) {
                foreach ($tags as $tag) {
                    $q->orWhereJsonContains('tags', $tag);
                }
            });
        }

        // Search by name, email, or company
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%");
            });
        }

        // Filter by lead score range
        if ($request->has('min_lead_score')) {
            $query->where('lead_score', '>=', $request->input('min_lead_score'));
        }

        if ($request->has('max_lead_score')) {
            $query->where('lead_score', '<=', $request->input('max_lead_score'));
        }

        // Filter by lead score category
        if ($request->has('lead_category')) {
            $category = $request->input('lead_category');
            $query->where('lead_score', match ($category) {
                'hot' => ['>=', 80],
                'warm' => ['>=', 60, '<', 80],
                'cold' => ['>=', 40, '<', 60],
                'unqualified' => ['<', 40],
                default => ['>=', 0]
            });
        }

        // Order by
        $orderBy = $request->input('order_by', 'created_at');
        $orderDirection = $request->input('order_direction', 'desc');
        $query->orderBy($orderBy, $orderDirection);

        $contacts = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'contacts' => $contacts
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:crm_contacts,email',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'status' => ['nullable', Rule::in(['active', 'inactive', 'blocked'])],
            'lead_score' => 'nullable|integer|min:0|max:100',
            'custom_fields' => 'nullable|array',
        ]);

        // Validate workspace access
        $workspace = Workspace::find($request->workspace_id);
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $contact = CrmContact::create([
            'id' => Str::uuid(),
            'workspace_id' => $request->workspace_id,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'company' => $request->company,
            'job_title' => $request->job_title,
            'notes' => $request->notes,
            'tags' => $request->tags,
            'status' => $request->input('status', 'active'),
            'lead_score' => $request->input('lead_score', 0),
            'custom_fields' => $request->custom_fields,
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'contact' => $contact->load(['workspace', 'creator']),
            'message' => 'Contact created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(CrmContact $crmContact)
    {
        // Check if user has access to this contact's workspace
        if (!$crmContact->workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to contact'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'contact' => $crmContact->load(['workspace', 'creator'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CrmContact $crmContact)
    {
        // Check if user has access to this contact's workspace
        $workspace = $crmContact->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to update contact'
            ], 403);
        }

        $request->validate([
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('crm_contacts', 'email')->ignore($crmContact->id)],
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'status' => ['nullable', Rule::in(['active', 'inactive', 'blocked'])],
            'lead_score' => 'nullable|integer|min:0|max:100',
            'custom_fields' => 'nullable|array',
        ]);

        $crmContact->update($request->only([
            'first_name', 'last_name', 'email', 'phone', 'company', 'job_title', 
            'notes', 'tags', 'status', 'lead_score', 'custom_fields'
        ]));

        return response()->json([
            'success' => true,
            'contact' => $crmContact->load(['workspace', 'creator']),
            'message' => 'Contact updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CrmContact $crmContact)
    {
        // Check if user has access to this contact's workspace
        $workspace = $crmContact->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to delete contact'
            ], 403);
        }

        $crmContact->delete();

        return response()->json([
            'success' => true,
            'message' => 'Contact deleted successfully'
        ]);
    }

    /**
     * Mark contact as contacted.
     */
    public function markAsContacted(CrmContact $crmContact)
    {
        // Check if user has access to this contact's workspace
        $workspace = $crmContact->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to update contact'
            ], 403);
        }

        $crmContact->markAsContacted();

        return response()->json([
            'success' => true,
            'contact' => $crmContact->load(['workspace', 'creator']),
            'message' => 'Contact marked as contacted'
        ]);
    }

    /**
     * Update lead score.
     */
    public function updateLeadScore(Request $request, CrmContact $crmContact)
    {
        // Check if user has access to this contact's workspace
        $workspace = $crmContact->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to update contact'
            ], 403);
        }

        $request->validate([
            'lead_score' => 'required|integer|min:0|max:100',
        ]);

        $crmContact->update(['lead_score' => $request->lead_score]);

        return response()->json([
            'success' => true,
            'contact' => $crmContact->load(['workspace', 'creator']),
            'message' => 'Lead score updated successfully'
        ]);
    }

    /**
     * Add tags to contact.
     */
    public function addTags(Request $request, CrmContact $crmContact)
    {
        // Check if user has access to this contact's workspace
        $workspace = $crmContact->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to update contact'
            ], 403);
        }

        $request->validate([
            'tags' => 'required|array',
            'tags.*' => 'string|max:50',
        ]);

        $existingTags = $crmContact->getFormattedTags();
        $newTags = array_unique(array_merge($existingTags, $request->tags));
        
        $crmContact->update(['tags' => $newTags]);

        return response()->json([
            'success' => true,
            'contact' => $crmContact->load(['workspace', 'creator']),
            'message' => 'Tags added successfully'
        ]);
    }

    /**
     * Remove tags from contact.
     */
    public function removeTags(Request $request, CrmContact $crmContact)
    {
        // Check if user has access to this contact's workspace
        $workspace = $crmContact->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to update contact'
            ], 403);
        }

        $request->validate([
            'tags' => 'required|array',
            'tags.*' => 'string|max:50',
        ]);

        $existingTags = $crmContact->getFormattedTags();
        $tagsToRemove = $request->tags;
        $newTags = array_filter($existingTags, fn($tag) => !in_array($tag, $tagsToRemove));
        
        $crmContact->update(['tags' => array_values($newTags)]);

        return response()->json([
            'success' => true,
            'contact' => $crmContact->load(['workspace', 'creator']),
            'message' => 'Tags removed successfully'
        ]);
    }

    /**
     * Get contacts that need follow-up.
     */
    public function followUpNeeded(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        
        // Validate workspace access
        if ($workspaceId) {
            $workspace = Workspace::find($workspaceId);
            if (!$workspace || !$workspace->members()->where('user_id', auth()->id())->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to workspace'
                ], 403);
            }
        }

        $query = CrmContact::with(['workspace', 'creator']);
        
        if ($workspaceId) {
            $query->where('workspace_id', $workspaceId);
        } else {
            // Get contacts from all workspaces user has access to
            $userWorkspaceIds = auth()->user()->workspaces()->pluck('workspaces.id');
            $query->whereIn('workspace_id', $userWorkspaceIds);
        }

        // Filter for contacts that need follow-up
        $query->where(function ($q) {
            $q->whereNull('last_contacted_at')
              ->orWhere('last_contacted_at', '<=', now()->subDays(30));
        });

        $contacts = $query->orderBy('last_contacted_at', 'asc')
                          ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'contacts' => $contacts
        ]);
    }

    /**
     * Get CRM analytics.
     */
    public function analytics(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        
        // Validate workspace access
        if ($workspaceId) {
            $workspace = Workspace::find($workspaceId);
            if (!$workspace || !$workspace->members()->where('user_id', auth()->id())->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to workspace'
                ], 403);
            }
        }

        $query = CrmContact::query();
        
        if ($workspaceId) {
            $query->where('workspace_id', $workspaceId);
        } else {
            // Get contacts from all workspaces user has access to
            $userWorkspaceIds = auth()->user()->workspaces()->pluck('workspaces.id');
            $query->whereIn('workspace_id', $userWorkspaceIds);
        }

        $totalContacts = $query->count();
        $activeContacts = $query->where('status', 'active')->count();
        $inactiveContacts = $query->where('status', 'inactive')->count();
        $blockedContacts = $query->where('status', 'blocked')->count();

        $hotLeads = $query->where('lead_score', '>=', 80)->count();
        $warmLeads = $query->where('lead_score', '>=', 60)->where('lead_score', '<', 80)->count();
        $coldLeads = $query->where('lead_score', '>=', 40)->where('lead_score', '<', 60)->count();
        $unqualifiedLeads = $query->where('lead_score', '<', 40)->count();

        $followUpNeeded = $query->where(function ($q) {
            $q->whereNull('last_contacted_at')
              ->orWhere('last_contacted_at', '<=', now()->subDays(30));
        })->count();

        $averageLeadScore = $query->avg('lead_score') ?? 0;

        return response()->json([
            'success' => true,
            'analytics' => [
                'total_contacts' => $totalContacts,
                'active_contacts' => $activeContacts,
                'inactive_contacts' => $inactiveContacts,
                'blocked_contacts' => $blockedContacts,
                'hot_leads' => $hotLeads,
                'warm_leads' => $warmLeads,
                'cold_leads' => $coldLeads,
                'unqualified_leads' => $unqualifiedLeads,
                'follow_up_needed' => $followUpNeeded,
                'average_lead_score' => round($averageLeadScore, 2),
            ]
        ]);
    }

    /**
     * Get contact analytics.
     */
    public function contactAnalytics(Request $request, CrmContact $crmContact)
    {
        // Check if user has access to this contact's workspace
        if (!$crmContact->workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to contact'
            ], 403);
        }

        $period = $request->input('period', '30d');
        $days = match ($period) {
            '7d' => 7,
            '30d' => 30,
            '90d' => 90,
            '365d' => 365,
            default => 30,
        };

        $dateFrom = now()->subDays($days);

        // Get engagement metrics
        $communications = \App\Models\CrmCommunication::where('contact_id', $crmContact->id)
            ->where('created_at', '>=', $dateFrom)
            ->get();

        $emailsSent = $communications->where('type', 'email')->where('direction', 'outbound')->count();
        $callsMade = $communications->where('type', 'call')->count();
        $meetingsHeld = $communications->where('type', 'meeting')->count();
        $lastInteraction = $communications->max('created_at');

        // Get deal metrics
        $deals = \App\Models\CrmDeal::where('contact_id', $crmContact->id)->get();
        $totalDeals = $deals->count();
        $wonDeals = $deals->where('status', 'won')->count();
        $lostDeals = $deals->where('status', 'lost')->count();
        $activeDeals = $deals->where('status', 'active')->count();
        $totalValue = $deals->sum('value');
        $wonValue = $deals->where('status', 'won')->sum('value');

        // Get timeline
        $timeline = $communications->sortByDesc('created_at')->take(10)->map(function ($comm) {
            return [
                'date' => $comm->created_at,
                'type' => $comm->type,
                'description' => $comm->subject,
                'duration' => $comm->duration ? $comm->duration_formatted : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'contact_id' => $crmContact->id,
                'period' => $period,
                'engagement' => [
                    'total_interactions' => $communications->count(),
                    'emails_sent' => $emailsSent,
                    'calls_made' => $callsMade,
                    'meetings_held' => $meetingsHeld,
                    'last_interaction' => $lastInteraction,
                ],
                'deals' => [
                    'total_deals' => $totalDeals,
                    'won_deals' => $wonDeals,
                    'lost_deals' => $lostDeals,
                    'active_deals' => $activeDeals,
                    'total_value' => $totalValue,
                    'won_value' => $wonValue,
                ],
                'timeline' => $timeline,
            ]
        ]);
    }

    /**
     * Import contacts from e-commerce orders.
     */
    public function importFromEcommerce(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        
        // Validate workspace access
        if ($workspaceId) {
            $workspace = Workspace::find($workspaceId);
            if (!$workspace || !$workspace->members()->where('user_id', auth()->id())->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to workspace'
                ], 403);
            }
        }

        // Get orders from e-commerce system
        $orders = \App\Models\Order::where('workspace_id', $workspaceId)
            ->whereNotNull('customer_email')
            ->get();

        $importedCount = 0;
        $updatedCount = 0;

        foreach ($orders as $order) {
            // Check if contact already exists
            $existingContact = CrmContact::where('email', $order->customer_email)
                ->where('workspace_id', $workspaceId)
                ->first();

            if ($existingContact) {
                // Update existing contact
                $existingContact->update([
                    'phone' => $existingContact->phone ?: $order->customer_phone,
                    'notes' => $existingContact->notes . "\n\nImported from order #{$order->order_number}",
                    'lead_score' => min(100, $existingContact->lead_score + 10), // Increase lead score
                    'last_contacted_at' => now(),
                ]);
                $updatedCount++;
            } else {
                // Create new contact
                $nameParts = explode(' ', $order->customer_name, 2);
                $firstName = $nameParts[0] ?? '';
                $lastName = $nameParts[1] ?? '';

                CrmContact::create([
                    'id' => Str::uuid(),
                    'workspace_id' => $workspaceId,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $order->customer_email,
                    'phone' => $order->customer_phone,
                    'notes' => "Imported from e-commerce order #{$order->order_number}",
                    'tags' => ['customer', 'e-commerce'],
                    'status' => 'active',
                    'lead_score' => 50,
                    'custom_fields' => [
                        'source' => 'e-commerce',
                        'first_order_date' => $order->created_at,
                        'total_orders' => 1,
                    ],
                    'created_by' => auth()->id(),
                    'last_contacted_at' => now(),
                ]);
                $importedCount++;
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'imported_count' => $importedCount,
                'updated_count' => $updatedCount,
                'message' => 'Contacts imported successfully from e-commerce orders'
            ]
        ]);
    }
}