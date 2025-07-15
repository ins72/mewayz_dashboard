<?php

namespace App\Http\Controllers;

use App\Models\CrmCommunication;
use App\Models\CrmContact;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CrmCommunicationController extends Controller
{
    /**
     * Get communication history for a contact.
     */
    public function getContactCommunications(Request $request, CrmContact $crmContact)
    {
        // Check if user has access to this contact's workspace
        if (!$crmContact->workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to contact'
            ], 403);
        }

        $query = CrmCommunication::where('contact_id', $crmContact->id)
            ->with(['creator', 'deal']);

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by direction
        if ($request->has('direction')) {
            $query->where('direction', $request->input('direction'));
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('created_at', '>=', $request->input('date_from'));
        }

        if ($request->has('date_to')) {
            $query->where('created_at', '<=', $request->input('date_to'));
        }

        // Order by most recent first
        $communications = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $communications
        ]);
    }

    /**
     * Add communication to a contact.
     */
    public function addContactCommunication(Request $request, CrmContact $crmContact)
    {
        // Check if user has access to this contact's workspace
        $workspace = $crmContact->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to add communication'
            ], 403);
        }

        $request->validate([
            'type' => ['required', Rule::in(['call', 'email', 'meeting', 'sms', 'social', 'other'])],
            'direction' => ['required', Rule::in(['inbound', 'outbound'])],
            'subject' => 'required|string|max:255',
            'content' => 'nullable|string',
            'summary' => 'nullable|string',
            'duration' => 'nullable|integer|min:1',
            'outcome' => 'nullable|string|max:255',
            'next_action' => 'nullable|string',
            'deal_id' => 'nullable|uuid|exists:crm_deals,id',
            'scheduled_at' => 'nullable|date',
            'custom_fields' => 'nullable|array',
        ]);

        $communication = CrmCommunication::create([
            'id' => Str::uuid(),
            'workspace_id' => $crmContact->workspace_id,
            'contact_id' => $crmContact->id,
            'deal_id' => $request->deal_id,
            'type' => $request->type,
            'direction' => $request->direction,
            'subject' => $request->subject,
            'content' => $request->content,
            'summary' => $request->summary,
            'duration' => $request->duration,
            'outcome' => $request->outcome,
            'next_action' => $request->next_action,
            'created_by' => auth()->id(),
            'scheduled_at' => $request->scheduled_at,
            'completed_at' => now(),
            'custom_fields' => $request->custom_fields,
        ]);

        // Update contact's last_contacted_at
        $crmContact->update(['last_contacted_at' => now()]);

        return response()->json([
            'success' => true,
            'data' => $communication->load(['creator', 'deal']),
            'message' => 'Communication added successfully'
        ], 201);
    }

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

        $query = CrmCommunication::with(['workspace', 'contact', 'deal', 'creator']);
        
        if ($workspaceId) {
            $query->where('workspace_id', $workspaceId);
        } else {
            $userWorkspaceIds = auth()->user()->workspaces()->pluck('workspaces.id');
            $query->whereIn('workspace_id', $userWorkspaceIds);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by direction
        if ($request->has('direction')) {
            $query->where('direction', $request->input('direction'));
        }

        // Filter by contact
        if ($request->has('contact_id')) {
            $query->where('contact_id', $request->input('contact_id'));
        }

        // Filter by deal
        if ($request->has('deal_id')) {
            $query->where('deal_id', $request->input('deal_id'));
        }

        // Search by subject
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('subject', 'like', "%{$search}%");
        }

        // Order by most recent first
        $communications = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'communications' => $communications
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'contact_id' => 'required|uuid|exists:crm_contacts,id',
            'deal_id' => 'nullable|uuid|exists:crm_deals,id',
            'type' => ['required', Rule::in(['call', 'email', 'meeting', 'sms', 'social', 'other'])],
            'direction' => ['required', Rule::in(['inbound', 'outbound'])],
            'subject' => 'required|string|max:255',
            'content' => 'nullable|string',
            'summary' => 'nullable|string',
            'duration' => 'nullable|integer|min:1',
            'outcome' => 'nullable|string|max:255',
            'next_action' => 'nullable|string',
            'scheduled_at' => 'nullable|date',
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

        $communication = CrmCommunication::create([
            'id' => Str::uuid(),
            'workspace_id' => $request->workspace_id,
            'contact_id' => $request->contact_id,
            'deal_id' => $request->deal_id,
            'type' => $request->type,
            'direction' => $request->direction,
            'subject' => $request->subject,
            'content' => $request->content,
            'summary' => $request->summary,
            'duration' => $request->duration,
            'outcome' => $request->outcome,
            'next_action' => $request->next_action,
            'created_by' => auth()->id(),
            'scheduled_at' => $request->scheduled_at,
            'completed_at' => now(),
            'custom_fields' => $request->custom_fields,
        ]);

        // Update contact's last_contacted_at
        $contact = CrmContact::find($request->contact_id);
        $contact->update(['last_contacted_at' => now()]);

        return response()->json([
            'success' => true,
            'communication' => $communication->load(['workspace', 'contact', 'deal', 'creator']),
            'message' => 'Communication created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(CrmCommunication $crmCommunication)
    {
        // Check if user has access to this communication's workspace
        if (!$crmCommunication->workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to communication'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'communication' => $crmCommunication->load(['workspace', 'contact', 'deal', 'creator'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CrmCommunication $crmCommunication)
    {
        // Check if user has access to this communication's workspace
        $workspace = $crmCommunication->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to update communication'
            ], 403);
        }

        $request->validate([
            'type' => ['sometimes', Rule::in(['call', 'email', 'meeting', 'sms', 'social', 'other'])],
            'direction' => ['sometimes', Rule::in(['inbound', 'outbound'])],
            'subject' => 'sometimes|required|string|max:255',
            'content' => 'nullable|string',
            'summary' => 'nullable|string',
            'duration' => 'nullable|integer|min:1',
            'outcome' => 'nullable|string|max:255',
            'next_action' => 'nullable|string',
            'scheduled_at' => 'nullable|date',
            'custom_fields' => 'nullable|array',
        ]);

        $crmCommunication->update($request->only([
            'type', 'direction', 'subject', 'content', 'summary', 'duration', 
            'outcome', 'next_action', 'scheduled_at', 'custom_fields'
        ]));

        return response()->json([
            'success' => true,
            'communication' => $crmCommunication->load(['workspace', 'contact', 'deal', 'creator']),
            'message' => 'Communication updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CrmCommunication $crmCommunication)
    {
        // Check if user has access to this communication's workspace
        $workspace = $crmCommunication->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to delete communication'
            ], 403);
        }

        $crmCommunication->delete();

        return response()->json([
            'success' => true,
            'message' => 'Communication deleted successfully'
        ]);
    }
}