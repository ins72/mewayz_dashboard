<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\PaymentTransaction;
use App\Models\SocialMediaPost;
use App\Models\LinkInBioPage;
use App\Models\EmailCampaign;
use App\Models\CrmContact;
use App\Models\Course;
use App\Models\Product;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics for a workspace
     */
    public function getStats($workspaceId)
    {
        $workspace = Workspace::findOrFail($workspaceId);
        
        // Check if user has access to this workspace
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        // Get various statistics
        $stats = [
            'totalRevenue' => PaymentTransaction::where('workspace_id', $workspaceId)
                ->where('payment_status', 'paid')
                ->sum('amount'),
            'totalPosts' => SocialMediaPost::where('workspace_id', $workspaceId)->count(),
            'activeLinks' => LinkInBioPage::where('workspace_id', $workspaceId)
                ->where('is_active', true)
                ->count(),
            'emailCampaigns' => EmailCampaign::where('workspace_id', $workspaceId)->count(),
            'crmContacts' => CrmContact::where('workspace_id', $workspaceId)->count(),
            'courses' => Course::where('workspace_id', $workspaceId)->count(),
            'products' => Product::where('workspace_id', $workspaceId)->count(),
            'monthlyRevenue' => PaymentTransaction::where('workspace_id', $workspaceId)
                ->where('payment_status', 'paid')
                ->whereMonth('created_at', now()->month)
                ->sum('amount'),
            'totalViews' => LinkInBioPage::where('workspace_id', $workspaceId)
                ->sum('total_views'),
            'totalClicks' => LinkInBioPage::where('workspace_id', $workspaceId)
                ->sum('total_clicks')
        ];

        return response()->json([
            'success' => true,
            'stats' => $stats
        ]);
    }

    /**
     * Get recent activity for a workspace
     */
    public function getRecentActivity($workspaceId, Request $request)
    {
        $workspace = Workspace::findOrFail($workspaceId);
        
        // Check if user has access to this workspace
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $limit = $request->input('limit', 10);

        $activities = ActivityLog::where('workspace_id', $workspaceId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'activities' => $activities
        ]);
    }

    /**
     * Get quick stats for dashboard
     */
    public function getQuickStats($workspaceId)
    {
        $workspace = Workspace::findOrFail($workspaceId);
        
        // Check if user has access to this workspace
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $stats = [
            'totalPosts' => SocialMediaPost::where('workspace_id', $workspaceId)->count(),
            'activeLinks' => LinkInBioPage::where('workspace_id', $workspaceId)
                ->where('is_active', true)
                ->count(),
            'coursesCreated' => Course::where('workspace_id', $workspaceId)->count(),
            'totalSales' => PaymentTransaction::where('workspace_id', $workspaceId)
                ->where('payment_status', 'paid')
                ->sum('amount'),
            'leadsCaptured' => CrmContact::where('workspace_id', $workspaceId)
                ->where('status', 'lead')
                ->count()
        ];

        return response()->json([
            'success' => true,
            'stats' => $stats
        ]);
    }

    /**
     * Get workspace overview
     */
    public function getWorkspaceOverview($workspaceId)
    {
        $workspace = Workspace::findOrFail($workspaceId);
        
        // Check if user has access to this workspace
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $overview = [
            'workspace' => $workspace,
            'members_count' => $workspace->members()->count(),
            'features' => [
                'social_media' => [
                    'posts' => SocialMediaPost::where('workspace_id', $workspaceId)->count(),
                    'accounts' => $workspace->socialMediaAccounts()->count()
                ],
                'link_in_bio' => [
                    'pages' => LinkInBioPage::where('workspace_id', $workspaceId)->count(),
                    'total_views' => LinkInBioPage::where('workspace_id', $workspaceId)->sum('total_views')
                ],
                'email' => [
                    'campaigns' => EmailCampaign::where('workspace_id', $workspaceId)->count(),
                    'total_sent' => EmailCampaign::where('workspace_id', $workspaceId)->sum('sent_count')
                ],
                'crm' => [
                    'contacts' => CrmContact::where('workspace_id', $workspaceId)->count(),
                    'leads' => CrmContact::where('workspace_id', $workspaceId)->where('status', 'lead')->count()
                ],
                'courses' => [
                    'total' => Course::where('workspace_id', $workspaceId)->count(),
                    'published' => Course::where('workspace_id', $workspaceId)->where('status', 'published')->count()
                ],
                'products' => [
                    'total' => Product::where('workspace_id', $workspaceId)->count(),
                    'active' => Product::where('workspace_id', $workspaceId)->where('status', 'active')->count()
                ]
            ]
        ];

        return response()->json([
            'success' => true,
            'overview' => $overview
        ]);
    }

    /**
     * Log activity
     */
    public function logActivity(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'type' => 'required|string',
            'description' => 'required|string',
            'entity_type' => 'nullable|string',
            'entity_id' => 'nullable|string'
        ]);

        $workspace = Workspace::findOrFail($request->workspace_id);
        
        // Check if user has access to this workspace
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $activity = ActivityLog::create([
            'id' => Str::uuid(),
            'workspace_id' => $request->workspace_id,
            'user_id' => auth()->id(),
            'type' => $request->type,
            'description' => $request->description,
            'entity_type' => $request->entity_type,
            'entity_id' => $request->entity_id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent')
        ]);

        return response()->json([
            'success' => true,
            'activity' => $activity,
            'message' => 'Activity logged successfully'
        ], 201);
    }
}