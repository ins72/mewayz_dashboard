<?php

namespace App\Http\Controllers;

use App\Models\InstagramStory;
use App\Models\HashtagAnalytics;
use App\Models\InstagramAnalytics;
use App\Models\CompetitorAnalysis;
use App\Models\ContentCalendar;
use App\Models\SocialMediaAccount;
use App\Models\SocialMediaPost;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class InstagramManagementController extends Controller
{
    /**
     * Get Instagram content calendar
     */
    public function getContentCalendar(Request $request)
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

        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = Carbon::create($year, $month, 1)->endOfMonth();

        // Get posts for the calendar
        $postsQuery = SocialMediaPost::with(['socialMediaAccount', 'creator'])
            ->where('workspace_id', $workspaceId)
            ->whereBetween('scheduled_at', [$startDate, $endDate])
            ->orderBy('scheduled_at');

        $posts = $postsQuery->get();

        // Get stories for the calendar
        $storiesQuery = InstagramStory::with(['socialMediaAccount', 'creator'])
            ->where('workspace_id', $workspaceId)
            ->whereBetween('scheduled_at', [$startDate, $endDate])
            ->orderBy('scheduled_at');

        $stories = $storiesQuery->get();

        // Get content calendar entries
        $calendarEntries = ContentCalendar::where('workspace_id', $workspaceId)
            ->where('start_date', '<=', $endDate)
            ->where('end_date', '>=', $startDate)
            ->get();

        // Calendar statistics
        $stats = [
            'total_posts' => $posts->count(),
            'total_stories' => $stories->count(),
            'scheduled_posts' => $posts->where('status', 'scheduled')->count(),
            'published_posts' => $posts->where('status', 'published')->count(),
            'draft_posts' => $posts->where('status', 'draft')->count(),
            'active_calendars' => $calendarEntries->where('status', 'active')->count(),
        ];

        return response()->json([
            'success' => true,
            'calendar' => [
                'posts' => $posts,
                'stories' => $stories,
                'calendars' => $calendarEntries,
                'stats' => $stats,
                'period' => [
                    'start' => $startDate->format('Y-m-d'),
                    'end' => $endDate->format('Y-m-d'),
                    'month' => $month,
                    'year' => $year
                ]
            ]
        ]);
    }

    /**
     * Get Instagram stories
     */
    public function getStories(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        $accountId = $request->input('account_id');
        $status = $request->input('status');
        
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

        $query = InstagramStory::with(['workspace', 'socialMediaAccount', 'creator']);
        
        if ($workspaceId) {
            $query->where('workspace_id', $workspaceId);
        }

        if ($accountId) {
            $query->where('social_media_account_id', $accountId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $stories = $query->orderBy('created_at', 'desc')
                        ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'stories' => $stories
        ]);
    }

    /**
     * Create Instagram story
     */
    public function createStory(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'social_media_account_id' => 'required|uuid|exists:social_media_accounts,id',
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'media_url' => 'nullable|url',
            'story_type' => ['required', Rule::in(['photo', 'video', 'carousel', 'text'])],
            'status' => ['nullable', Rule::in(['draft', 'scheduled', 'published'])],
            'scheduled_at' => 'nullable|date|after:now',
            'is_highlight' => 'boolean',
            'highlight_category' => 'nullable|string|max:100',
            'stickers' => 'nullable|array',
            'links' => 'nullable|array',
        ]);

        // Validate workspace access
        $workspace = Workspace::find($request->workspace_id);
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        // Validate social media account belongs to workspace
        $socialMediaAccount = SocialMediaAccount::find($request->social_media_account_id);
        if (!$socialMediaAccount || $socialMediaAccount->workspace_id !== $request->workspace_id) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid social media account for this workspace'
            ], 422);
        }

        $status = $request->input('status', 'draft');
        
        // If scheduled_at is provided, set status to scheduled
        if ($request->has('scheduled_at') && $request->scheduled_at) {
            $status = 'scheduled';
        }

        $story = InstagramStory::create([
            'id' => Str::uuid(),
            'workspace_id' => $request->workspace_id,
            'social_media_account_id' => $request->social_media_account_id,
            'title' => $request->title,
            'content' => $request->content,
            'media_url' => $request->media_url,
            'story_type' => $request->story_type,
            'status' => $status,
            'scheduled_at' => $request->scheduled_at,
            'is_highlight' => $request->input('is_highlight', false),
            'highlight_category' => $request->highlight_category,
            'stickers' => $request->stickers,
            'links' => $request->links,
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'story' => $story->load(['workspace', 'socialMediaAccount', 'creator']),
            'message' => 'Instagram story created successfully'
        ], 201);
    }

    /**
     * Get hashtag research and analytics
     */
    public function getHashtagResearch(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        $search = $request->input('search');
        $category = $request->input('category');
        $trending = $request->input('trending');
        $difficulty = $request->input('difficulty');
        
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

        $query = HashtagAnalytics::where('workspace_id', $workspaceId);

        if ($search) {
            $query->where('hashtag', 'LIKE', '%' . $search . '%');
        }

        if ($category) {
            $query->where('category', $category);
        }

        if ($trending !== null) {
            $query->where('is_trending', $trending);
        }

        if ($difficulty) {
            $difficultyRange = match($difficulty) {
                'easy' => [0, 30],
                'medium' => [30, 60],
                'hard' => [60, 80],
                'very_hard' => [80, 100],
                default => null
            };
            
            if ($difficultyRange) {
                $query->whereBetween('difficulty_score', $difficultyRange);
            }
        }

        $hashtags = $query->orderBy('trending_score', 'desc')
                         ->orderBy('engagement_rate', 'desc')
                         ->paginate($request->input('per_page', 20));

        // Get trending hashtags
        $trendingHashtags = HashtagAnalytics::where('workspace_id', $workspaceId)
            ->where('is_trending', true)
            ->orderBy('trending_score', 'desc')
            ->limit(10)
            ->get();

        // Get categories
        $categories = HashtagAnalytics::where('workspace_id', $workspaceId)
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return response()->json([
            'success' => true,
            'hashtags' => $hashtags,
            'trending' => $trendingHashtags,
            'categories' => $categories,
            'stats' => [
                'total_hashtags' => HashtagAnalytics::where('workspace_id', $workspaceId)->count(),
                'trending_count' => $trendingHashtags->count(),
                'avg_engagement' => HashtagAnalytics::where('workspace_id', $workspaceId)->avg('engagement_rate'),
                'last_updated' => HashtagAnalytics::where('workspace_id', $workspaceId)->max('last_updated')
            ]
        ]);
    }

    /**
     * Create or update hashtag analytics
     */
    public function updateHashtagAnalytics(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'hashtag' => 'required|string|max:100',
            'platform' => ['required', Rule::in(['instagram', 'twitter', 'facebook', 'linkedin', 'tiktok'])],
            'post_count' => 'required|integer|min:0',
            'engagement_rate' => 'required|numeric|min:0|max:100',
            'trending_score' => 'required|numeric|min:0|max:100',
            'difficulty_score' => 'required|numeric|min:0|max:100',
            'category' => 'nullable|string|max:100',
            'related_hashtags' => 'nullable|array',
            'is_trending' => 'boolean',
            'popularity_rank' => 'nullable|integer|min:1',
            'usage_metrics' => 'nullable|array',
        ]);

        // Validate workspace access
        $workspace = Workspace::find($request->workspace_id);
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $hashtag = HashtagAnalytics::updateOrCreate(
            [
                'workspace_id' => $request->workspace_id,
                'hashtag' => $request->hashtag,
                'platform' => $request->platform,
            ],
            [
                'id' => Str::uuid(),
                'post_count' => $request->post_count,
                'engagement_rate' => $request->engagement_rate,
                'trending_score' => $request->trending_score,
                'difficulty_score' => $request->difficulty_score,
                'category' => $request->category,
                'related_hashtags' => $request->related_hashtags,
                'is_trending' => $request->input('is_trending', false),
                'popularity_rank' => $request->popularity_rank,
                'usage_metrics' => $request->usage_metrics,
                'last_updated' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'hashtag' => $hashtag,
            'message' => 'Hashtag analytics updated successfully'
        ]);
    }

    /**
     * Get Instagram analytics dashboard
     */
    public function getAnalyticsDashboard(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        $accountId = $request->input('account_id');
        $period = $request->input('period', '30d'); // 7d, 30d, 90d, 1y
        
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

        $days = match($period) {
            '7d' => 7,
            '30d' => 30,
            '90d' => 90,
            '1y' => 365,
            default => 30
        };

        $startDate = now()->subDays($days);
        $endDate = now();

        $query = InstagramAnalytics::where('workspace_id', $workspaceId)
            ->whereBetween('date', [$startDate, $endDate]);

        if ($accountId) {
            $query->where('social_media_account_id', $accountId);
        }

        $analytics = $query->orderBy('date', 'desc')->get();

        // Calculate overview metrics
        $latestAnalytics = $analytics->first();
        $overview = [
            'followers' => $latestAnalytics?->getFollowerCount() ?? 0,
            'following' => $latestAnalytics?->getFollowingCount() ?? 0,
            'posts' => $latestAnalytics?->getPostsCount() ?? 0,
            'engagement_rate' => $latestAnalytics?->getEngagementRate() ?? 0,
            'total_reach' => $analytics->sum('post_metrics.reach') ?? 0,
            'total_impressions' => $analytics->sum('post_metrics.impressions') ?? 0,
        ];

        // Get growth metrics
        $growthMetrics = $analytics->map(function ($item) {
            return [
                'date' => $item->date,
                'followers' => $item->getFollowerCount(),
                'engagement_rate' => $item->getEngagementRate(),
                'reach' => $item->getReach(),
                'impressions' => $item->getImpressions(),
            ];
        });

        // Get best posting times
        $bestPostingTimes = $latestAnalytics?->best_posting_times ?? [];

        // Get top hashtags
        $topHashtags = $latestAnalytics?->getTopHashtags(10) ?? [];

        return response()->json([
            'success' => true,
            'analytics' => [
                'overview' => $overview,
                'growth_metrics' => $growthMetrics,
                'best_posting_times' => $bestPostingTimes,
                'top_hashtags' => $topHashtags,
                'period' => $period,
                'date_range' => [
                    'start' => $startDate->format('Y-m-d'),
                    'end' => $endDate->format('Y-m-d')
                ]
            ]
        ]);
    }

    /**
     * Get competitor analysis
     */
    public function getCompetitorAnalysis(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        $platform = $request->input('platform', 'instagram');
        
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

        $competitors = CompetitorAnalysis::where('workspace_id', $workspaceId)
            ->where('platform', $platform)
            ->orderBy('follower_count', 'desc')
            ->get();

        // Calculate comparison metrics
        $totalCompetitors = $competitors->count();
        $avgEngagement = $competitors->avg('engagement_rate');
        $avgFollowers = $competitors->avg('follower_count');
        $topPerformers = $competitors->take(5);

        return response()->json([
            'success' => true,
            'competitors' => $competitors,
            'insights' => [
                'total_competitors' => $totalCompetitors,
                'avg_engagement_rate' => round($avgEngagement, 2),
                'avg_followers' => round($avgFollowers),
                'top_performers' => $topPerformers,
                'platform' => $platform
            ]
        ]);
    }

    /**
     * Add competitor for analysis
     */
    public function addCompetitor(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'competitor_username' => 'required|string|max:255',
            'competitor_name' => 'nullable|string|max:255',
            'platform' => ['required', Rule::in(['instagram', 'twitter', 'facebook', 'linkedin', 'tiktok'])],
            'follower_count' => 'required|integer|min:0',
            'following_count' => 'required|integer|min:0',
            'posts_count' => 'required|integer|min:0',
            'engagement_rate' => 'required|numeric|min:0|max:100',
            'tracking_status' => ['nullable', Rule::in(['active', 'inactive', 'paused'])],
        ]);

        // Validate workspace access
        $workspace = Workspace::find($request->workspace_id);
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        // Check if competitor already exists
        $existingCompetitor = CompetitorAnalysis::where('workspace_id', $request->workspace_id)
            ->where('competitor_username', $request->competitor_username)
            ->where('platform', $request->platform)
            ->first();

        if ($existingCompetitor) {
            return response()->json([
                'success' => false,
                'message' => 'Competitor already exists for this workspace and platform'
            ], 422);
        }

        $competitor = CompetitorAnalysis::create([
            'id' => Str::uuid(),
            'workspace_id' => $request->workspace_id,
            'competitor_username' => $request->competitor_username,
            'competitor_name' => $request->competitor_name,
            'platform' => $request->platform,
            'follower_count' => $request->follower_count,
            'following_count' => $request->following_count,
            'posts_count' => $request->posts_count,
            'engagement_rate' => $request->engagement_rate,
            'tracking_status' => $request->input('tracking_status', 'active'),
            'last_analyzed' => now(),
        ]);

        return response()->json([
            'success' => true,
            'competitor' => $competitor,
            'message' => 'Competitor added successfully'
        ], 201);
    }

    /**
     * Get optimal posting times
     */
    public function getOptimalPostingTimes(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        $accountId = $request->input('account_id');
        
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

        $query = InstagramAnalytics::where('workspace_id', $workspaceId);

        if ($accountId) {
            $query->where('social_media_account_id', $accountId);
        }

        $latestAnalytics = $query->orderBy('date', 'desc')->first();

        if (!$latestAnalytics) {
            // Return default optimal times if no analytics available
            $defaultTimes = [
                'monday' => ['09:00', '15:00', '19:00'],
                'tuesday' => ['09:00', '15:00', '19:00'],
                'wednesday' => ['09:00', '15:00', '19:00'],
                'thursday' => ['09:00', '15:00', '19:00'],
                'friday' => ['09:00', '15:00', '19:00'],
                'saturday' => ['10:00', '14:00', '18:00'],
                'sunday' => ['10:00', '14:00', '18:00'],
            ];

            return response()->json([
                'success' => true,
                'optimal_times' => $defaultTimes,
                'source' => 'default',
                'message' => 'Using default optimal posting times. Run analytics to get personalized recommendations.'
            ]);
        }

        $optimalTimes = $latestAnalytics->best_posting_times ?? [];

        return response()->json([
            'success' => true,
            'optimal_times' => $optimalTimes,
            'source' => 'analytics',
            'last_updated' => $latestAnalytics->date,
            'recommendations' => [
                'peak_engagement_day' => $this->getPeakEngagementDay($optimalTimes),
                'best_overall_time' => $this->getBestOverallTime($optimalTimes),
                'avoid_times' => $this->getAvoidTimes($optimalTimes)
            ]
        ]);
    }

    /**
     * Helper method to get peak engagement day
     */
    private function getPeakEngagementDay($times)
    {
        // This would typically analyze the data to find the best day
        // For now, returning a default recommendation
        return 'wednesday';
    }

    /**
     * Helper method to get best overall time
     */
    private function getBestOverallTime($times)
    {
        // This would typically analyze the data to find the best time
        // For now, returning a default recommendation
        return '15:00';
    }

    /**
     * Helper method to get times to avoid
     */
    private function getAvoidTimes($times)
    {
        // This would typically analyze the data to find low-engagement times
        // For now, returning default recommendations
        return ['02:00-06:00', '22:00-24:00'];
    }
}