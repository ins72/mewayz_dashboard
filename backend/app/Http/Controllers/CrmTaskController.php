<?php

namespace App\Http\Controllers;

use App\Models\CrmTask;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CrmTaskController extends Controller
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

        $query = CrmTask::with(['workspace', 'contact', 'deal', 'creator', 'assignedUser']);
        
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

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by priority
        if ($request->has('priority')) {
            $query->where('priority', $request->input('priority'));
        }

        // Filter by contact
        if ($request->has('contact_id')) {
            $query->where('contact_id', $request->input('contact_id'));
        }

        // Filter by deal
        if ($request->has('deal_id')) {
            $query->where('deal_id', $request->input('deal_id'));
        }

        // Filter by assigned user
        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->input('assigned_to'));
        }

        // Filter overdue tasks
        if ($request->has('overdue') && $request->input('overdue')) {
            $query->overdue();
        }

        // Filter by due date range
        if ($request->has('due_date_from')) {
            $query->where('due_date', '>=', $request->input('due_date_from'));
        }

        if ($request->has('due_date_to')) {
            $query->where('due_date', '<=', $request->input('due_date_to'));
        }

        // Search by title
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('title', 'like', "%{$search}%");
        }

        // Order by
        $orderBy = $request->input('order_by', 'due_date');
        $orderDirection = $request->input('order_direction', 'asc');
        $query->orderBy($orderBy, $orderDirection);

        $tasks = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'tasks' => $tasks
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'contact_id' => 'nullable|uuid|exists:crm_contacts,id',
            'deal_id' => 'nullable|uuid|exists:crm_deals,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => ['required', Rule::in(['call', 'email', 'meeting', 'task', 'follow_up', 'other'])],
            'priority' => ['required', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'status' => ['nullable', Rule::in(['pending', 'in_progress', 'completed', 'cancelled'])],
            'due_date' => 'required|date',
            'assigned_to' => 'nullable|uuid|exists:users,id',
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

        $task = CrmTask::create([
            'id' => Str::uuid(),
            'workspace_id' => $request->workspace_id,
            'contact_id' => $request->contact_id,
            'deal_id' => $request->deal_id,
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type,
            'priority' => $request->priority,
            'status' => $request->input('status', 'pending'),
            'due_date' => $request->due_date,
            'created_by' => auth()->id(),
            'assigned_to' => $request->assigned_to ?? auth()->id(),
            'custom_fields' => $request->custom_fields,
        ]);

        return response()->json([
            'success' => true,
            'task' => $task->load(['workspace', 'contact', 'deal', 'creator', 'assignedUser']),
            'message' => 'Task created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(CrmTask $crmTask)
    {
        // Check if user has access to this task's workspace
        if (!$crmTask->workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to task'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'task' => $crmTask->load(['workspace', 'contact', 'deal', 'creator', 'assignedUser'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CrmTask $crmTask)
    {
        // Check if user has access to this task's workspace
        $workspace = $crmTask->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to update task'
            ], 403);
        }

        $request->validate([
            'contact_id' => 'nullable|uuid|exists:crm_contacts,id',
            'deal_id' => 'nullable|uuid|exists:crm_deals,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'type' => ['sometimes', Rule::in(['call', 'email', 'meeting', 'task', 'follow_up', 'other'])],
            'priority' => ['sometimes', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'status' => ['sometimes', Rule::in(['pending', 'in_progress', 'completed', 'cancelled'])],
            'due_date' => 'sometimes|required|date',
            'assigned_to' => 'nullable|uuid|exists:users,id',
            'custom_fields' => 'nullable|array',
        ]);

        // Auto-set completed_at when status changes to completed
        if ($request->has('status') && $request->status === 'completed' && !$crmTask->completed_at) {
            $crmTask->completed_at = now();
        }

        $crmTask->update($request->only([
            'contact_id', 'deal_id', 'title', 'description', 'type', 'priority', 
            'status', 'due_date', 'assigned_to', 'custom_fields'
        ]));

        return response()->json([
            'success' => true,
            'task' => $crmTask->load(['workspace', 'contact', 'deal', 'creator', 'assignedUser']),
            'message' => 'Task updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CrmTask $crmTask)
    {
        // Check if user has access to this task's workspace
        $workspace = $crmTask->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to delete task'
            ], 403);
        }

        $crmTask->delete();

        return response()->json([
            'success' => true,
            'message' => 'Task deleted successfully'
        ]);
    }

    /**
     * Update task status.
     */
    public function updateStatus(Request $request, CrmTask $crmTask)
    {
        // Check if user has access to this task's workspace
        $workspace = $crmTask->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to update task'
            ], 403);
        }

        $request->validate([
            'status' => ['required', Rule::in(['pending', 'in_progress', 'completed', 'cancelled'])],
        ]);

        // Auto-set completed_at when status changes to completed
        if ($request->status === 'completed' && !$crmTask->completed_at) {
            $crmTask->completed_at = now();
        }

        $crmTask->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'task' => $crmTask->load(['workspace', 'contact', 'deal', 'creator', 'assignedUser']),
            'message' => 'Task status updated successfully'
        ]);
    }
}