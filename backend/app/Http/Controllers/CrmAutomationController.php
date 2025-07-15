<?php

namespace App\Http\Controllers;

use App\Models\CrmAutomationRule;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CrmAutomationController extends Controller
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

        $query = CrmAutomationRule::with(['workspace', 'creator']);
        
        if ($workspaceId) {
            $query->where('workspace_id', $workspaceId);
        } else {
            $userWorkspaceIds = auth()->user()->workspaces()->pluck('workspaces.id');
            $query->whereIn('workspace_id', $userWorkspaceIds);
        }

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Filter by trigger
        if ($request->has('trigger')) {
            $query->where('trigger', $request->input('trigger'));
        }

        // Search by name
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        // Order by
        $orderBy = $request->input('order_by', 'created_at');
        $orderDirection = $request->input('order_direction', 'desc');
        $query->orderBy($orderBy, $orderDirection);

        $rules = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $rules
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'trigger' => ['required', Rule::in(['contact_created', 'deal_created', 'deal_stage_changed', 'task_created', 'task_completed', 'communication_added'])],
            'conditions' => 'nullable|array',
            'conditions.*.field' => 'required|string',
            'conditions.*.operator' => ['required', Rule::in(['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal', 'is_empty', 'is_not_empty'])],
            'conditions.*.value' => 'nullable',
            'actions' => 'required|array|min:1',
            'actions.*.type' => ['required', Rule::in(['create_task', 'send_email', 'send_notification', 'update_field', 'add_tag', 'remove_tag', 'assign_user'])],
            'actions.*.data' => 'required|array',
            'is_active' => 'boolean',
        ]);

        // Validate workspace access
        $workspace = Workspace::find($request->workspace_id);
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $rule = CrmAutomationRule::create([
            'id' => Str::uuid(),
            'workspace_id' => $request->workspace_id,
            'name' => $request->name,
            'description' => $request->description,
            'trigger' => $request->trigger,
            'conditions' => $request->conditions,
            'actions' => $request->actions,
            'is_active' => $request->input('is_active', true),
            'run_count' => 0,
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $rule->load(['workspace', 'creator']),
            'message' => 'Automation rule created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(CrmAutomationRule $crmAutomationRule)
    {
        // Check if user has access to this rule's workspace
        if (!$crmAutomationRule->workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to automation rule'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $crmAutomationRule->load(['workspace', 'creator'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CrmAutomationRule $crmAutomationRule)
    {
        // Check if user has access to this rule's workspace
        $workspace = $crmAutomationRule->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to update automation rule'
            ], 403);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'trigger' => ['sometimes', Rule::in(['contact_created', 'deal_created', 'deal_stage_changed', 'task_created', 'task_completed', 'communication_added'])],
            'conditions' => 'nullable|array',
            'conditions.*.field' => 'required|string',
            'conditions.*.operator' => ['required', Rule::in(['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal', 'is_empty', 'is_not_empty'])],
            'conditions.*.value' => 'nullable',
            'actions' => 'sometimes|required|array|min:1',
            'actions.*.type' => ['required', Rule::in(['create_task', 'send_email', 'send_notification', 'update_field', 'add_tag', 'remove_tag', 'assign_user'])],
            'actions.*.data' => 'required|array',
            'is_active' => 'boolean',
        ]);

        $crmAutomationRule->update($request->only([
            'name', 'description', 'trigger', 'conditions', 'actions', 'is_active'
        ]));

        return response()->json([
            'success' => true,
            'data' => $crmAutomationRule->load(['workspace', 'creator']),
            'message' => 'Automation rule updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CrmAutomationRule $crmAutomationRule)
    {
        // Check if user has access to this rule's workspace
        $workspace = $crmAutomationRule->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to delete automation rule'
            ], 403);
        }

        $crmAutomationRule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Automation rule deleted successfully'
        ]);
    }

    /**
     * Activate/deactivate automation rule.
     */
    public function toggleStatus(CrmAutomationRule $crmAutomationRule)
    {
        // Check if user has access to this rule's workspace
        $workspace = $crmAutomationRule->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to modify automation rule'
            ], 403);
        }

        $crmAutomationRule->is_active = !$crmAutomationRule->is_active;
        $crmAutomationRule->save();

        return response()->json([
            'success' => true,
            'data' => $crmAutomationRule->load(['workspace', 'creator']),
            'message' => 'Automation rule status updated successfully'
        ]);
    }
}