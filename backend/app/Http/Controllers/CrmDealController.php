<?php

namespace App\Http\Controllers;

use App\Models\CrmDeal;
use App\Models\CrmPipelineStage;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CrmDealController extends Controller
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

        $query = CrmDeal::with(['workspace', 'contact', 'pipelineStage', 'creator', 'assignedUser']);
        
        if ($workspaceId) {
            $query->where('workspace_id', $workspaceId);
        } else {
            $userWorkspaceIds = auth()->user()->workspaces()->pluck('workspaces.id');
            $query->whereIn('workspace_id', $userWorkspaceIds);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by pipeline stage
        if ($request->has('pipeline_stage_id')) {
            $query->where('pipeline_stage_id', $request->input('pipeline_stage_id'));
        }

        // Filter by contact
        if ($request->has('contact_id')) {
            $query->where('contact_id', $request->input('contact_id'));
        }

        // Filter by assigned user
        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->input('assigned_to'));
        }

        // Search by title
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('title', 'like', "%{$search}%");
        }

        // Order by
        $orderBy = $request->input('order_by', 'created_at');
        $orderDirection = $request->input('order_direction', 'desc');
        $query->orderBy($orderBy, $orderDirection);

        $deals = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'deals' => $deals
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
            'pipeline_stage_id' => 'required|uuid|exists:crm_pipeline_stages,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'value' => 'required|numeric|min:0',
            'probability' => 'nullable|integer|min:0|max:100',
            'expected_close_date' => 'nullable|date',
            'status' => ['nullable', Rule::in(['active', 'won', 'lost'])],
            'source' => 'nullable|string|max:100',
            'custom_fields' => 'nullable|array',
            'assigned_to' => 'nullable|uuid|exists:users,id',
        ]);

        // Validate workspace access
        $workspace = Workspace::find($request->workspace_id);
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $deal = CrmDeal::create([
            'id' => Str::uuid(),
            'workspace_id' => $request->workspace_id,
            'contact_id' => $request->contact_id,
            'pipeline_stage_id' => $request->pipeline_stage_id,
            'title' => $request->title,
            'description' => $request->description,
            'value' => $request->value,
            'probability' => $request->input('probability', 50),
            'expected_close_date' => $request->expected_close_date,
            'status' => $request->input('status', 'active'),
            'source' => $request->source,
            'custom_fields' => $request->custom_fields,
            'created_by' => auth()->id(),
            'assigned_to' => $request->assigned_to ?? auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'deal' => $deal->load(['workspace', 'contact', 'pipelineStage', 'creator', 'assignedUser']),
            'message' => 'Deal created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(CrmDeal $crmDeal)
    {
        // Check if user has access to this deal's workspace
        if (!$crmDeal->workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to deal'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'deal' => $crmDeal->load(['workspace', 'contact', 'pipelineStage', 'creator', 'assignedUser', 'tasks', 'communications'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CrmDeal $crmDeal)
    {
        // Check if user has access to this deal's workspace
        $workspace = $crmDeal->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to update deal'
            ], 403);
        }

        $request->validate([
            'contact_id' => 'sometimes|required|uuid|exists:crm_contacts,id',
            'pipeline_stage_id' => 'sometimes|required|uuid|exists:crm_pipeline_stages,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'value' => 'sometimes|required|numeric|min:0',
            'probability' => 'nullable|integer|min:0|max:100',
            'expected_close_date' => 'nullable|date',
            'actual_close_date' => 'nullable|date',
            'status' => ['nullable', Rule::in(['active', 'won', 'lost'])],
            'source' => 'nullable|string|max:100',
            'custom_fields' => 'nullable|array',
            'assigned_to' => 'nullable|uuid|exists:users,id',
        ]);

        $crmDeal->update($request->only([
            'contact_id', 'pipeline_stage_id', 'title', 'description', 'value', 
            'probability', 'expected_close_date', 'actual_close_date', 'status', 
            'source', 'custom_fields', 'assigned_to'
        ]));

        return response()->json([
            'success' => true,
            'deal' => $crmDeal->load(['workspace', 'contact', 'pipelineStage', 'creator', 'assignedUser']),
            'message' => 'Deal updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CrmDeal $crmDeal)
    {
        // Check if user has access to this deal's workspace
        $workspace = $crmDeal->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to delete deal'
            ], 403);
        }

        $crmDeal->delete();

        return response()->json([
            'success' => true,
            'message' => 'Deal deleted successfully'
        ]);
    }

    /**
     * Update deal stage.
     */
    public function updateStage(Request $request, CrmDeal $crmDeal)
    {
        // Check if user has access to this deal's workspace
        $workspace = $crmDeal->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to update deal'
            ], 403);
        }

        $request->validate([
            'stage_id' => 'required|uuid|exists:crm_pipeline_stages,id',
        ]);

        $stage = CrmPipelineStage::find($request->stage_id);
        
        // If moving to a closing stage, update the close date
        if ($stage->is_closing_stage && !$crmDeal->actual_close_date) {
            $crmDeal->actual_close_date = now();
            $crmDeal->status = $stage->name === 'Closed Won' ? 'won' : 'lost';
        }

        $crmDeal->pipeline_stage_id = $request->stage_id;
        $crmDeal->save();

        return response()->json([
            'success' => true,
            'deal' => $crmDeal->load(['workspace', 'contact', 'pipelineStage', 'creator', 'assignedUser']),
            'message' => 'Deal stage updated successfully'
        ]);
    }
}