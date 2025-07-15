<?php

namespace App\Http\Controllers;

use App\Models\CrmPipelineStage;
use App\Models\CrmDeal;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CrmPipelineController extends Controller
{
    /**
     * Get pipeline with stages and deals.
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

        $query = CrmPipelineStage::with(['deals.contact', 'deals.assignedUser']);
        
        if ($workspaceId) {
            $query->where('workspace_id', $workspaceId);
        } else {
            $userWorkspaceIds = auth()->user()->workspaces()->pluck('workspaces.id');
            $query->whereIn('workspace_id', $userWorkspaceIds);
        }

        $stages = $query->active()->ordered()->get();

        // Transform the stages to include deal statistics
        $pipelineData = $stages->map(function ($stage) {
            $activeDeals = $stage->deals()->where('status', 'active')->get();
            
            return [
                'id' => $stage->id,
                'name' => $stage->name,
                'description' => $stage->description,
                'order' => $stage->order,
                'color' => $stage->color,
                'is_closing_stage' => $stage->is_closing_stage,
                'probability' => $stage->probability,
                'deals_count' => $activeDeals->count(),
                'total_value' => $activeDeals->sum('value'),
                'weighted_value' => $activeDeals->sum('weighted_value'),
                'deals' => $activeDeals->map(function ($deal) {
                    return [
                        'id' => $deal->id,
                        'title' => $deal->title,
                        'contact_id' => $deal->contact_id,
                        'contact_name' => $deal->contact ? $deal->contact->first_name . ' ' . $deal->contact->last_name : null,
                        'company' => $deal->contact ? $deal->contact->company : null,
                        'value' => $deal->value,
                        'probability' => $deal->probability,
                        'expected_close_date' => $deal->expected_close_date,
                        'assigned_to' => $deal->assignedUser ? $deal->assignedUser->name : null,
                        'created_at' => $deal->created_at,
                        'updated_at' => $deal->updated_at,
                    ];
                }),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'stages' => $pipelineData,
                'summary' => [
                    'total_deals' => $stages->sum('deals_count'),
                    'total_value' => $stages->sum('total_value'),
                    'weighted_value' => $stages->sum('weighted_value'),
                ]
            ]
        ]);
    }

    /**
     * Create default pipeline stages for a workspace.
     */
    public function createDefaultStages(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
        ]);

        // Validate workspace access
        $workspace = Workspace::find($request->workspace_id);
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        // Check if stages already exist
        $existingStages = CrmPipelineStage::where('workspace_id', $request->workspace_id)->count();
        if ($existingStages > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Pipeline stages already exist for this workspace'
            ], 400);
        }

        // Create default stages
        $defaultStages = [
            ['name' => 'Lead', 'order' => 1, 'color' => '#3b82f6', 'probability' => 10],
            ['name' => 'Qualified', 'order' => 2, 'color' => '#8b5cf6', 'probability' => 25],
            ['name' => 'Proposal', 'order' => 3, 'color' => '#f59e0b', 'probability' => 50],
            ['name' => 'Negotiation', 'order' => 4, 'color' => '#10b981', 'probability' => 75],
            ['name' => 'Closed Won', 'order' => 5, 'color' => '#059669', 'probability' => 100, 'is_closing_stage' => true],
            ['name' => 'Closed Lost', 'order' => 6, 'color' => '#dc2626', 'probability' => 0, 'is_closing_stage' => true],
        ];

        $createdStages = [];
        foreach ($defaultStages as $stageData) {
            $stage = CrmPipelineStage::create([
                'id' => Str::uuid(),
                'workspace_id' => $request->workspace_id,
                'name' => $stageData['name'],
                'order' => $stageData['order'],
                'color' => $stageData['color'],
                'probability' => $stageData['probability'],
                'is_closing_stage' => $stageData['is_closing_stage'] ?? false,
                'is_active' => true,
            ]);
            $createdStages[] = $stage;
        }

        return response()->json([
            'success' => true,
            'stages' => $createdStages,
            'message' => 'Default pipeline stages created successfully'
        ], 201);
    }
}