<?php

namespace App\Http\Controllers;

use App\Models\Achievement;
use App\Models\UserAchievement;
use App\Models\UserProgress;
use App\Models\Analytics;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class GamificationController extends Controller
{
    /**
     * Get user's gamification dashboard
     */
    public function getDashboard(Request $request)
    {
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        if (!$user->workspaces()->where('workspaces.id', $workspaceId)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        // Get user achievements
        $achievements = UserAchievement::getUserAchievements($user->id, $workspaceId);
        
        // Get user progress
        $progress = UserProgress::getUserProgress($user->id, $workspaceId);
        
        // Get progress summary
        $progressSummary = UserProgress::getProgressSummary($user->id, $workspaceId);
        
        // Get leaderboard position
        $leaderboard = UserAchievement::getLeaderboard($workspaceId, 50);
        $userRank = $leaderboard->search(function ($item) use ($user) {
            return $item->user_id === $user->id;
        });
        
        // Get recent achievements
        $recentAchievements = UserAchievement::forUser($user->id)
            ->forWorkspace($workspaceId)
            ->completed()
            ->with('achievement')
            ->orderByDesc('earned_at')
            ->limit(5)
            ->get();
        
        // Get next achievable milestones
        $nextMilestones = $this->getNextMilestones($user->id, $workspaceId);
        
        return response()->json([
            'achievements' => [
                'completed' => $achievements->get(true, collect()),
                'in_progress' => $achievements->get(false, collect()),
                'total_points' => $achievements->get(true, collect())->sum('achievement.points'),
                'recent' => $recentAchievements
            ],
            'progress' => [
                'by_module' => $progress,
                'summary' => $progressSummary,
                'next_milestones' => $nextMilestones
            ],
            'leaderboard' => [
                'user_rank' => $userRank !== false ? $userRank + 1 : null,
                'total_participants' => $leaderboard->count(),
                'user_points' => $leaderboard->get($userRank)?->total_points ?? 0
            ]
        ]);
    }
    
    /**
     * Get achievements list
     */
    public function getAchievements(Request $request)
    {
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        if (!$user->workspaces()->where('workspaces.id', $workspaceId)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $category = $request->input('category');
        $type = $request->input('type');
        
        $query = Achievement::active()->with(['userAchievements' => function ($query) use ($user, $workspaceId) {
            $query->where('user_id', $user->id)->where('workspace_id', $workspaceId);
        }]);
        
        if ($category) {
            $query->forCategory($category);
        }
        
        if ($type) {
            $query->forType($type);
        }
        
        $achievements = $query->get()->map(function ($achievement) {
            $userAchievement = $achievement->userAchievements->first();
            
            return [
                'id' => $achievement->id,
                'name' => $achievement->name,
                'description' => $achievement->description,
                'icon' => $achievement->icon,
                'category' => $achievement->category,
                'type' => $achievement->type,
                'points' => $achievement->points,
                'criteria' => $achievement->criteria,
                'user_progress' => $userAchievement ? [
                    'progress' => $userAchievement->progress,
                    'is_completed' => $userAchievement->is_completed,
                    'earned_at' => $userAchievement->earned_at
                ] : [
                    'progress' => 0,
                    'is_completed' => false,
                    'earned_at' => null
                ]
            ];
        });
        
        return response()->json([
            'achievements' => $achievements,
            'categories' => Achievement::active()->distinct()->pluck('category'),
            'types' => Achievement::active()->distinct()->pluck('type')
        ]);
    }
    
    /**
     * Get leaderboard
     */
    public function getLeaderboard(Request $request)
    {
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        if (!$user->workspaces()->where('workspaces.id', $workspaceId)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $period = $request->input('period', 'all');
        $limit = $request->input('limit', 20);
        
        $leaderboard = UserAchievement::getLeaderboard($workspaceId, $limit);
        
        $leaderboardData = $leaderboard->map(function ($item, $index) {
            return [
                'rank' => $index + 1,
                'user' => $item->user->only(['id', 'name', 'email']),
                'total_points' => $item->total_points,
                'total_achievements' => $item->total_achievements,
                'last_achievement' => $item->user->userAchievements()
                    ->where('workspace_id', $item->workspace_id)
                    ->completed()
                    ->latest('earned_at')
                    ->with('achievement')
                    ->first()
            ];
        });
        
        // Get user's position
        $userRank = $leaderboard->search(function ($item) use ($user) {
            return $item->user_id === $user->id;
        });
        
        return response()->json([
            'leaderboard' => $leaderboardData,
            'user_rank' => $userRank !== false ? $userRank + 1 : null,
            'total_participants' => $leaderboard->count(),
            'period' => $period
        ]);
    }
    
    /**
     * Get user progress
     */
    public function getUserProgress(Request $request)
    {
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        if (!$user->workspaces()->where('workspaces.id', $workspaceId)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $module = $request->input('module');
        
        $query = UserProgress::forUser($user->id)->forWorkspace($workspaceId);
        
        if ($module) {
            $query->forModule($module);
        }
        
        $progress = $query->get();
        $summary = UserProgress::getProgressSummary($user->id, $workspaceId);
        
        return response()->json([
            'progress' => $progress,
            'summary' => $summary,
            'next_targets' => $this->getNextTargets($user->id, $workspaceId, $module)
        ]);
    }
    
    /**
     * Update user progress
     */
    public function updateProgress(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid',
            'module' => 'required|string|max:100',
            'action' => 'required|string|max:100',
            'increment' => 'nullable|numeric|min:0',
            'target_value' => 'nullable|numeric|min:1',
            'metadata' => 'nullable|array'
        ]);
        
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        if (!$user->workspaces()->where('workspaces.id', $workspaceId)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $progress = UserProgress::updateProgress(
            $user->id,
            $workspaceId,
            $request->input('module'),
            $request->input('action'),
            $request->input('increment', 1),
            $request->input('target_value'),
            $request->input('metadata', [])
        );
        
        // Check for new achievements
        $newAchievements = $this->checkForNewAchievements($user->id, $workspaceId);
        
        return response()->json([
            'progress' => $progress,
            'new_achievements' => $newAchievements
        ]);
    }
    
    /**
     * Check and process achievements
     */
    public function checkAchievements(Request $request)
    {
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        if (!$user->workspaces()->where('workspaces.id', $workspaceId)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $newAchievements = $this->checkForNewAchievements($user->id, $workspaceId);
        
        return response()->json([
            'new_achievements' => $newAchievements,
            'total_new' => count($newAchievements)
        ]);
    }
    
    /**
     * Get achievement statistics
     */
    public function getAchievementStats(Request $request)
    {
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        if (!$user->workspaces()->where('workspaces.id', $workspaceId)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $achievements = Achievement::active()->get();
        $userAchievements = UserAchievement::forUser($user->id)
            ->forWorkspace($workspaceId)
            ->with('achievement')
            ->get();
        
        $stats = [
            'total_achievements' => $achievements->count(),
            'completed_achievements' => $userAchievements->where('is_completed', true)->count(),
            'in_progress' => $userAchievements->where('is_completed', false)->count(),
            'total_points' => $userAchievements->where('is_completed', true)->sum('achievement.points'),
            'completion_rate' => $achievements->count() > 0 ? 
                round(($userAchievements->where('is_completed', true)->count() / $achievements->count()) * 100, 2) : 0,
            'by_category' => $achievements->groupBy('category')->map(function ($items, $category) use ($userAchievements) {
                $categoryIds = $items->pluck('id');
                $userCategoryAchievements = $userAchievements->whereIn('achievement_id', $categoryIds);
                
                return [
                    'total' => $items->count(),
                    'completed' => $userCategoryAchievements->where('is_completed', true)->count(),
                    'points' => $userCategoryAchievements->where('is_completed', true)->sum('achievement.points'),
                    'completion_rate' => $items->count() > 0 ? 
                        round(($userCategoryAchievements->where('is_completed', true)->count() / $items->count()) * 100, 2) : 0
                ];
            }),
            'recent_achievements' => $userAchievements->where('is_completed', true)
                ->sortByDesc('earned_at')
                ->take(5)
                ->values()
        ];
        
        return response()->json(['stats' => $stats]);
    }
    
    /**
     * Initialize default achievements
     */
    public function initializeAchievements()
    {
        $defaultAchievements = Achievement::getDefaultAchievements();
        
        foreach ($defaultAchievements as $achievementData) {
            Achievement::firstOrCreate(
                ['name' => $achievementData['name']],
                $achievementData
            );
        }
        
        return response()->json([
            'message' => 'Default achievements initialized',
            'count' => count($defaultAchievements)
        ]);
    }
    
    // Helper methods
    private function getNextMilestones($userId, $workspaceId)
    {
        $userProgress = UserProgress::forUser($userId)->forWorkspace($workspaceId)->get();
        $achievements = Achievement::active()->get();
        
        $nextMilestones = [];
        
        foreach ($achievements as $achievement) {
            $userAchievement = UserAchievement::forUser($userId)
                ->forWorkspace($workspaceId)
                ->where('achievement_id', $achievement->id)
                ->first();
            
            if (!$userAchievement || !$userAchievement->is_completed) {
                $criteria = $achievement->criteria;
                $action = $criteria['action'];
                
                $progress = $userProgress->where('action', $action)->first();
                
                if ($progress) {
                    $nextMilestones[] = [
                        'achievement' => $achievement,
                        'current_progress' => $progress->current_value,
                        'target' => $criteria['count'] ?? $criteria['value'] ?? $criteria['streak'] ?? 0,
                        'progress_percentage' => $userAchievement ? $userAchievement->progress : 0
                    ];
                }
            }
        }
        
        return collect($nextMilestones)->sortBy('progress_percentage')->take(5)->values();
    }
    
    private function getNextTargets($userId, $workspaceId, $module = null)
    {
        $query = UserProgress::forUser($userId)->forWorkspace($workspaceId);
        
        if ($module) {
            $query->forModule($module);
        }
        
        return $query->where('progress_percentage', '<', 100)
            ->orderByDesc('progress_percentage')
            ->take(5)
            ->get()
            ->map(function ($progress) {
                return [
                    'module' => $progress->module,
                    'action' => $progress->action,
                    'current' => $progress->current_value,
                    'target' => $progress->target_value,
                    'percentage' => $progress->progress_percentage,
                    'remaining' => $progress->target_value - $progress->current_value
                ];
            });
    }
    
    private function checkForNewAchievements($userId, $workspaceId)
    {
        $achievements = Achievement::active()->get();
        $userStats = $this->getUserStats($userId, $workspaceId);
        $newAchievements = [];
        
        foreach ($achievements as $achievement) {
            $userAchievement = UserAchievement::forUser($userId)
                ->forWorkspace($workspaceId)
                ->where('achievement_id', $achievement->id)
                ->first();
            
            if (!$userAchievement || !$userAchievement->is_completed) {
                if ($achievement->checkEligibility($userStats)) {
                    $userAchievement = UserAchievement::trackProgress(
                        $userId,
                        $workspaceId,
                        $achievement->id,
                        100,
                        ['auto_completed' => true]
                    );
                    
                    $newAchievements[] = [
                        'achievement' => $achievement,
                        'earned_at' => $userAchievement->earned_at,
                        'points' => $achievement->points
                    ];
                }
            }
        }
        
        return $newAchievements;
    }
    
    private function getUserStats($userId, $workspaceId)
    {
        $analytics = Analytics::forUser($userId)->forWorkspace($workspaceId)->get();
        $progress = UserProgress::forUser($userId)->forWorkspace($workspaceId)->get();
        
        $stats = [];
        
        // Build stats from analytics
        foreach ($analytics->groupBy('action') as $action => $items) {
            $stats[$action] = [
                'count' => $items->count(),
                'value' => $items->sum('value'),
                'streak' => $progress->where('action', $action)->first()?->streak_count ?? 0
            ];
        }
        
        // Add progress-specific stats
        foreach ($progress as $progressItem) {
            if (!isset($stats[$progressItem->action])) {
                $stats[$progressItem->action] = [
                    'count' => $progressItem->current_value,
                    'value' => $progressItem->current_value,
                    'streak' => $progressItem->streak_count
                ];
            }
        }
        
        return $stats;
    }
}