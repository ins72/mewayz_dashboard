<?php

namespace App\Http\Controllers;

use App\Models\EmailCampaign;
use App\Models\EmailTemplate;
use App\Models\EmailAudience;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class EmailController extends Controller
{
    /**
     * Get email statistics for a workspace
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

        $stats = DB::table('email_campaigns')
            ->where('workspace_id', $workspaceId)
            ->select([
                DB::raw('SUM(sent_count) as totalSent'),
                DB::raw('SUM(delivered_count) as totalDelivered'),
                DB::raw('SUM(opened_count) as totalOpened'),
                DB::raw('SUM(clicked_count) as totalClicked')
            ])
            ->first();

        $totalSent = $stats->totalSent ?? 0;
        $totalDelivered = $stats->totalDelivered ?? 0;
        $totalOpened = $stats->totalOpened ?? 0;
        $totalClicked = $stats->totalClicked ?? 0;

        return response()->json([
            'success' => true,
            'stats' => [
                'totalSent' => $totalSent,
                'totalDelivered' => $totalDelivered,
                'totalOpened' => $totalOpened,
                'totalClicked' => $totalClicked,
                'openRate' => $totalDelivered > 0 ? round(($totalOpened / $totalDelivered) * 100, 1) : 0,
                'clickRate' => $totalDelivered > 0 ? round(($totalClicked / $totalDelivered) * 100, 1) : 0
            ]
        ]);
    }

    /**
     * Get email campaigns for a workspace
     */
    public function getCampaigns(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        $page = $request->input('page', 1);
        $limit = $request->input('limit', 10);

        $workspace = Workspace::findOrFail($workspaceId);
        
        // Check if user has access to this workspace
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $campaigns = EmailCampaign::where('workspace_id', $workspaceId)
            ->orderBy('created_at', 'desc')
            ->paginate($limit, ['*'], 'page', $page);

        return response()->json([
            'success' => true,
            'campaigns' => $campaigns
        ]);
    }

    /**
     * Create email campaign
     */
    public function createCampaign(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'subject' => 'required|string|max:255',
            'sender' => 'required|email',
            'template' => 'required|string',
            'audience' => 'required|string',
            'content' => 'nullable|string',
            'schedule_at' => 'nullable|date'
        ]);

        $workspace = Workspace::findOrFail($request->workspace_id);
        
        // Check if user has access to this workspace
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $campaign = EmailCampaign::create([
            'id' => Str::uuid(),
            'workspace_id' => $request->workspace_id,
            'subject' => $request->subject,
            'sender' => $request->sender,
            'template' => $request->template,
            'audience' => $request->audience,
            'content' => $request->content,
            'status' => $request->schedule_at ? 'scheduled' : 'draft',
            'schedule_at' => $request->schedule_at,
            'created_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'campaign' => $campaign,
            'message' => 'Campaign created successfully'
        ], 201);
    }

    /**
     * Update email campaign
     */
    public function updateCampaign(Request $request, $campaignId)
    {
        $campaign = EmailCampaign::findOrFail($campaignId);
        
        // Check if user has access to this workspace
        if (!$campaign->workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $request->validate([
            'subject' => 'sometimes|required|string|max:255',
            'sender' => 'sometimes|required|email',
            'template' => 'sometimes|required|string',
            'audience' => 'sometimes|required|string',
            'content' => 'nullable|string',
            'schedule_at' => 'nullable|date'
        ]);

        $campaign->update($request->only([
            'subject', 'sender', 'template', 'audience', 'content', 'schedule_at'
        ]));

        return response()->json([
            'success' => true,
            'campaign' => $campaign,
            'message' => 'Campaign updated successfully'
        ]);
    }

    /**
     * Delete email campaign
     */
    public function deleteCampaign($campaignId)
    {
        $campaign = EmailCampaign::findOrFail($campaignId);
        
        // Check if user has access to this workspace
        if (!$campaign->workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $campaign->delete();

        return response()->json([
            'success' => true,
            'message' => 'Campaign deleted successfully'
        ]);
    }

    /**
     * Get email templates for a workspace
     */
    public function getTemplates(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        $workspace = Workspace::findOrFail($workspaceId);
        
        // Check if user has access to this workspace
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $templates = EmailTemplate::where('workspace_id', $workspaceId)
            ->orWhere('is_global', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'templates' => $templates
        ]);
    }

    /**
     * Create email template
     */
    public function createTemplate(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'required|string',
            'category' => 'required|string'
        ]);

        $workspace = Workspace::findOrFail($request->workspace_id);
        
        // Check if user has access to this workspace
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $template = EmailTemplate::create([
            'id' => Str::uuid(),
            'workspace_id' => $request->workspace_id,
            'name' => $request->name,
            'description' => $request->description,
            'content' => $request->content,
            'category' => $request->category,
            'created_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'template' => $template,
            'message' => 'Template created successfully'
        ], 201);
    }

    /**
     * Get email audiences for a workspace
     */
    public function getAudiences(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        $workspace = Workspace::findOrFail($workspaceId);
        
        // Check if user has access to this workspace
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $audiences = EmailAudience::where('workspace_id', $workspaceId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'audiences' => $audiences
        ]);
    }

    /**
     * Create email audience
     */
    public function createAudience(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'criteria' => 'required|array'
        ]);

        $workspace = Workspace::findOrFail($request->workspace_id);
        
        // Check if user has access to this workspace
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $audience = EmailAudience::create([
            'id' => Str::uuid(),
            'workspace_id' => $request->workspace_id,
            'name' => $request->name,
            'description' => $request->description,
            'criteria' => $request->criteria,
            'created_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'audience' => $audience,
            'message' => 'Audience created successfully'
        ], 201);
    }

    /**
     * Send email campaign
     */
    public function sendCampaign($campaignId)
    {
        $campaign = EmailCampaign::findOrFail($campaignId);
        
        // Check if user has access to this workspace
        if (!$campaign->workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        // Update campaign status
        $campaign->update([
            'status' => 'sent',
            'sent_at' => now()
        ]);

        // Here you would integrate with ElasticMail or other email service
        // For now, we'll just return success

        return response()->json([
            'success' => true,
            'message' => 'Campaign sent successfully'
        ]);
    }

    /**
     * Get campaign analytics
     */
    public function getCampaignAnalytics($campaignId)
    {
        $campaign = EmailCampaign::findOrFail($campaignId);
        
        // Check if user has access to this workspace
        if (!$campaign->workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'analytics' => [
                'sent' => $campaign->sent_count ?? 0,
                'delivered' => $campaign->delivered_count ?? 0,
                'opened' => $campaign->opened_count ?? 0,
                'clicked' => $campaign->clicked_count ?? 0,
                'bounce_rate' => $campaign->bounce_rate ?? 0,
                'open_rate' => $campaign->open_rate ?? 0,
                'click_rate' => $campaign->click_rate ?? 0
            ]
        ]);
    }
}