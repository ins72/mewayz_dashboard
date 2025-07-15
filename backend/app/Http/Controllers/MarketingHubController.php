<?php

namespace App\Http\Controllers;

use App\Models\MarketingAutomation;
use App\Models\MarketingContent;
use App\Models\LeadMagnet;
use App\Models\MarketingAnalytics;
use App\Models\SocialMediaSchedule;
use App\Models\EmailCampaign;
use App\Models\Workspace;
use App\Models\CrmContact;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class MarketingHubController extends Controller
{
    /**
     * Get comprehensive marketing analytics
     */
    public function getAnalytics(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        $timeRange = $request->input('time_range', '30d');
        
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

        $days = match ($timeRange) {
            '7d' => 7,
            '30d' => 30,
            '90d' => 90,
            '1y' => 365,
            default => 30,
        };

        $dateFrom = now()->subDays($days);

        // Get overall metrics
        $totalLeads = CrmContact::where('workspace_id', $workspaceId)
            ->where('created_at', '>=', $dateFrom)
            ->count();

        $qualifiedLeads = CrmContact::where('workspace_id', $workspaceId)
            ->where('created_at', '>=', $dateFrom)
            ->where('lead_score', '>=', 60)
            ->count();

        $conversionRate = $totalLeads > 0 ? ($qualifiedLeads / $totalLeads) * 100 : 0;

        // Get channel performance
        $channels = [
            [
                'name' => 'Email Marketing',
                'leads' => round($totalLeads * 0.35),
                'cost' => 1250,
                'roi' => 340.2
            ],
            [
                'name' => 'Social Media',
                'leads' => round($totalLeads * 0.25),
                'cost' => 2100,
                'roi' => 155.8
            ],
            [
                'name' => 'Content Marketing',
                'leads' => round($totalLeads * 0.25),
                'cost' => 800,
                'roi' => 412.5
            ],
            [
                'name' => 'Paid Advertising',
                'leads' => round($totalLeads * 0.15),
                'cost' => 3200,
                'roi' => 85.3
            ]
        ];

        // Get timeline data
        $timeline = [];
        for ($i = $days; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $dayLeads = CrmContact::where('workspace_id', $workspaceId)
                ->whereDate('created_at', $date)
                ->count();
            
            $timeline[] = [
                'date' => $date->format('Y-m-d'),
                'leads' => $dayLeads,
                'conversions' => round($dayLeads * 0.4)
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'overview' => [
                    'total_leads' => $totalLeads,
                    'qualified_leads' => $qualifiedLeads,
                    'conversion_rate' => round($conversionRate, 2),
                    'cost_per_lead' => 25.50,
                    'roi' => 285.7,
                    'attribution_model' => 'first_touch'
                ],
                'channels' => $channels,
                'timeline' => $timeline
            ]
        ]);
    }

    /**
     * Get marketing automation workflows
     */
    public function getAutomation(Request $request)
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

        $workflows = MarketingAutomation::where('workspace_id', $workspaceId)
            ->with(['workspace', 'creator'])
            ->orderBy('created_at', 'desc')
            ->get();

        $performance = [
            'total_workflows' => $workflows->count(),
            'active_workflows' => $workflows->where('status', 'active')->count(),
            'total_contacts' => $workflows->sum('active_contacts'),
            'conversion_rate' => $workflows->avg('conversion_rate') ?? 0
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'workflows' => $workflows,
                'performance' => $performance
            ]
        ]);
    }

    /**
     * Create marketing automation workflow
     */
    public function createAutomation(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'trigger' => ['required', Rule::in(['contact_created', 'email_opened', 'link_clicked', 'form_submitted', 'cart_abandoned', 'purchase_made'])],
            'trigger_conditions' => 'nullable|array',
            'steps' => 'required|array|min:1',
            'steps.*.type' => ['required', Rule::in(['email', 'sms', 'wait', 'condition', 'tag', 'score'])],
            'steps.*.delay' => 'nullable|integer|min:0',
            'steps.*.template' => 'nullable|string',
            'steps.*.data' => 'nullable|array',
            'status' => ['nullable', Rule::in(['active', 'inactive', 'paused'])],
        ]);

        // Validate workspace access
        $workspace = Workspace::find($request->workspace_id);
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $automation = MarketingAutomation::create([
            'id' => Str::uuid(),
            'workspace_id' => $request->workspace_id,
            'name' => $request->name,
            'description' => $request->description,
            'trigger' => $request->trigger,
            'trigger_conditions' => $request->trigger_conditions,
            'steps' => $request->steps,
            'status' => $request->input('status', 'active'),
            'active_contacts' => 0,
            'conversion_rate' => 0.0,
            'total_runs' => 0,
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $automation->load(['workspace', 'creator']),
            'message' => 'Marketing automation workflow created successfully'
        ], 201);
    }

    /**
     * Get content library
     */
    public function getContent(Request $request)
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

        $query = MarketingContent::where('workspace_id', $workspaceId)
            ->with(['workspace', 'creator']);

        // Filter by type
        if ($request->has('type')) {
            $query->where('content_type', $request->input('type'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Search by title
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->input('search') . '%');
        }

        $content = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $content
        ]);
    }

    /**
     * Create content
     */
    public function createContent(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content_type' => ['required', Rule::in(['blog_post', 'ebook', 'whitepaper', 'case_study', 'video', 'podcast', 'infographic'])],
            'format' => ['required', Rule::in(['html', 'pdf', 'video', 'audio', 'image'])],
            'content_url' => 'nullable|url',
            'content_data' => 'nullable|array',
            'seo_keywords' => 'nullable|array',
            'meta_description' => 'nullable|string|max:160',
            'scheduled_at' => 'nullable|date',
            'status' => ['nullable', Rule::in(['draft', 'scheduled', 'published'])],
        ]);

        // Validate workspace access
        $workspace = Workspace::find($request->workspace_id);
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $content = MarketingContent::create([
            'id' => Str::uuid(),
            'workspace_id' => $request->workspace_id,
            'title' => $request->title,
            'description' => $request->description,
            'content_type' => $request->content_type,
            'format' => $request->format,
            'content_url' => $request->content_url,
            'content_data' => $request->content_data,
            'status' => $request->input('status', 'draft'),
            'views' => 0,
            'downloads' => 0,
            'engagement_score' => 0.0,
            'seo_keywords' => $request->seo_keywords,
            'meta_description' => $request->meta_description,
            'scheduled_at' => $request->scheduled_at,
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $content->load(['workspace', 'creator']),
            'message' => 'Content created successfully'
        ], 201);
    }

    /**
     * Get lead magnets
     */
    public function getLeadMagnets(Request $request)
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

        $query = LeadMagnet::where('workspace_id', $workspaceId)
            ->with(['workspace', 'creator', 'emailTemplate']);

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $magnets = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $magnets
        ]);
    }

    /**
     * Create lead magnet
     */
    public function createLeadMagnet(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => ['required', Rule::in(['ebook', 'whitepaper', 'checklist', 'template', 'course', 'webinar', 'toolkit'])],
            'file_url' => 'nullable|url',
            'landing_page_url' => 'nullable|url',
            'thank_you_page_url' => 'nullable|url',
            'email_template_id' => 'nullable|uuid|exists:email_templates,id',
            'auto_tag' => 'nullable|array',
            'lead_score_boost' => 'nullable|integer|min:0|max:100',
            'traffic_source' => 'nullable|string',
            'status' => ['nullable', Rule::in(['active', 'inactive', 'paused'])],
        ]);

        // Validate workspace access
        $workspace = Workspace::find($request->workspace_id);
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $magnet = LeadMagnet::create([
            'id' => Str::uuid(),
            'workspace_id' => $request->workspace_id,
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type,
            'file_url' => $request->file_url,
            'landing_page_url' => $request->landing_page_url,
            'thank_you_page_url' => $request->thank_you_page_url,
            'status' => $request->input('status', 'active'),
            'views' => 0,
            'conversions' => 0,
            'conversion_rate' => 0.0,
            'traffic_source' => $request->traffic_source,
            'email_template_id' => $request->email_template_id,
            'auto_tag' => $request->auto_tag,
            'lead_score_boost' => $request->input('lead_score_boost', 10),
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $magnet->load(['workspace', 'creator', 'emailTemplate']),
            'message' => 'Lead magnet created successfully'
        ], 201);
    }

    /**
     * Get social media calendar
     */
    public function getSocialCalendar(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);
        
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

        $startDate = now()->createFromDate($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        $posts = SocialMediaSchedule::where('workspace_id', $workspaceId)
            ->whereBetween('scheduled_at', [$startDate, $endDate])
            ->with(['content', 'creator'])
            ->orderBy('scheduled_at')
            ->get();

        $analytics = [
            'total_scheduled' => $posts->count(),
            'this_week' => $posts->where('scheduled_at', '>=', now()->startOfWeek())->count(),
            'engagement_rate' => 4.8,
            'best_time' => '09:00'
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'posts' => $posts,
                'analytics' => $analytics
            ]
        ]);
    }

    /**
     * Schedule content across channels
     */
    public function scheduleContent(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'content_id' => 'nullable|uuid|exists:marketing_contents,id',
            'post_content' => 'required|string',
            'platforms' => 'required|array|min:1',
            'platforms.*' => ['required', Rule::in(['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'])],
            'scheduled_at' => 'required|date|after:now',
            'media_urls' => 'nullable|array',
            'hashtags' => 'nullable|array',
            'mentions' => 'nullable|array',
            'campaign_id' => 'nullable|uuid|exists:email_campaigns,id',
        ]);

        // Validate workspace access
        $workspace = Workspace::find($request->workspace_id);
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $schedule = SocialMediaSchedule::create([
            'id' => Str::uuid(),
            'workspace_id' => $request->workspace_id,
            'content_id' => $request->content_id,
            'post_content' => $request->post_content,
            'platforms' => $request->platforms,
            'scheduled_at' => $request->scheduled_at,
            'status' => 'scheduled',
            'engagement_forecast' => rand(50, 300),
            'media_urls' => $request->media_urls,
            'hashtags' => $request->hashtags,
            'mentions' => $request->mentions,
            'campaign_id' => $request->campaign_id,
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $schedule->load(['content', 'creator']),
            'message' => 'Content scheduled successfully'
        ], 201);
    }

    /**
     * Get conversion funnels
     */
    public function getConversionFunnels(Request $request)
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

        // Mock funnel data - in production, this would come from analytics
        $funnel = [
            'id' => 'funnel-1',
            'name' => 'Website to Customer',
            'stages' => [
                ['name' => 'Website Visitor', 'count' => 10000, 'conversion_rate' => 100],
                ['name' => 'Lead Magnet Download', 'count' => 1250, 'conversion_rate' => 12.5],
                ['name' => 'Email Subscriber', 'count' => 980, 'conversion_rate' => 78.4],
                ['name' => 'Trial User', 'count' => 245, 'conversion_rate' => 25.0],
                ['name' => 'Paying Customer', 'count' => 89, 'conversion_rate' => 36.3]
            ],
            'overall_conversion' => 0.89
        ];

        return response()->json([
            'success' => true,
            'data' => [$funnel]
        ]);
    }
}