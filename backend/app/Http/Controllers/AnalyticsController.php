<?php

namespace App\Http\Controllers;

use App\Models\Analytics;
use App\Models\Workspace;
use App\Models\User;
use App\Events\AnalyticsUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    /**
     * Get unified analytics dashboard
     */
    public function getDashboard(Request $request)
    {
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        // Validate workspace access
        if (!$user->workspaces()->where('workspaces.id', $workspaceId)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $period = $request->input('period', '30d');
        $modules = $request->input('modules', []);
        
        $startDate = $this->getStartDate($period);
        
        // Get overview metrics
        $overview = $this->getOverviewMetrics($workspaceId, $startDate);
        
        // Get module-specific analytics
        $moduleAnalytics = $this->getModuleAnalyticsData($workspaceId, $startDate, $modules);
        
        // Get timeline data
        $timeline = $this->getTimelineData($workspaceId, $startDate, $period);
        
        // Get top performers
        $topPerformers = $this->getTopPerformers($workspaceId, $startDate);
        
        // Get goal progress
        $goalProgress = $this->getGoalProgress($workspaceId, $startDate);
        
        return response()->json([
            'overview' => $overview,
            'modules' => $moduleAnalytics,
            'timeline' => $timeline,
            'top_performers' => $topPerformers,
            'goal_progress' => $goalProgress,
            'period' => $period,
            'date_range' => [
                'start' => $startDate->toDateString(),
                'end' => now()->toDateString()
            ]
        ]);
    }
    
    /**
     * Get module-specific analytics
     */
    public function getModuleAnalytics(Request $request, $module)
    {
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        if (!$user->workspaces()->where('workspaces.id', $workspaceId)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $period = $request->input('period', '30d');
        $startDate = $this->getStartDate($period);
        
        $analytics = Analytics::getModuleAnalytics($workspaceId, $module, $period);
        
        // Get detailed metrics for the module
        $detailedMetrics = $this->getDetailedModuleMetrics($workspaceId, $module, $startDate);
        
        return response()->json([
            'module' => $module,
            'analytics' => $analytics,
            'detailed_metrics' => $detailedMetrics,
            'period' => $period,
            'date_range' => [
                'start' => $startDate->toDateString(),
                'end' => now()->toDateString()
            ]
        ]);
    }
    
    /**
     * Track analytics event
     */
    public function trackEvent(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid',
            'module' => 'required|string|max:100',
            'action' => 'required|string|max:100',
            'entity_type' => 'nullable|string|max:100',
            'entity_id' => 'nullable|uuid',
            'metadata' => 'nullable|array',
            'value' => 'nullable|numeric'
        ]);
        
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        if (!$user->workspaces()->where('workspaces.id', $workspaceId)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $analytics = Analytics::trackEvent(
            $workspaceId,
            $user->id,
            $request->input('module'),
            $request->input('action'),
            $request->input('entity_type'),
            $request->input('entity_id'),
            $request->input('metadata', []),
            $request->input('value', 0)
        );
        
        return response()->json([
            'success' => true,
            'event' => $analytics
        ]);
    }
    
    /**
     * Get analytics export
     */
    public function exportAnalytics(Request $request)
    {
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        if (!$user->workspaces()->where('workspaces.id', $workspaceId)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $period = $request->input('period', '30d');
        $format = $request->input('format', 'json');
        $modules = $request->input('modules', []);
        
        $startDate = $this->getStartDate($period);
        
        $query = Analytics::forWorkspace($workspaceId)
            ->forPeriod($startDate, now())
            ->with('user:id,name,email');
        
        if (!empty($modules)) {
            $query->whereIn('module', $modules);
        }
        
        $analytics = $query->orderBy('timestamp', 'desc')->get();
        
        if ($format === 'csv') {
            return $this->exportToCsv($analytics);
        }
        
        return response()->json([
            'analytics' => $analytics,
            'total_events' => $analytics->count(),
            'total_value' => $analytics->sum('value'),
            'date_range' => [
                'start' => $startDate->toDateString(),
                'end' => now()->toDateString()
            ]
        ]);
    }
    
    /**
     * Get real-time analytics
     */
    public function getRealTimeAnalytics(Request $request)
    {
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        if (!$user->workspaces()->where('workspaces.id', $workspaceId)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $minutes = $request->input('minutes', 60);
        $startTime = now()->subMinutes($minutes);
        
        $analytics = Analytics::forWorkspace($workspaceId)
            ->where('timestamp', '>=', $startTime)
            ->orderBy('timestamp', 'desc')
            ->limit(100)
            ->get();
        
        $liveMetrics = [
            'total_events' => $analytics->count(),
            'unique_users' => $analytics->pluck('user_id')->unique()->count(),
            'modules_active' => $analytics->pluck('module')->unique()->count(),
            'total_value' => $analytics->sum('value'),
            'events_per_minute' => $analytics->groupBy(function ($item) {
                return $item->timestamp->format('Y-m-d H:i');
            })->map->count(),
            'recent_events' => $analytics->take(10)->map(function ($event) {
                return [
                    'id' => $event->id,
                    'module' => $event->module,
                    'action' => $event->action,
                    'user' => $event->user->name ?? 'Unknown',
                    'timestamp' => $event->timestamp,
                    'value' => $event->value
                ];
            })
        ];
        
        return response()->json([
            'live_metrics' => $liveMetrics,
            'time_range' => [
                'start' => $startTime->toDateTimeString(),
                'end' => now()->toDateTimeString()
            ]
        ]);
    }
    
    /**
     * Get custom reports
     */
    public function getCustomReport(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'modules' => 'nullable|array',
            'actions' => 'nullable|array',
            'users' => 'nullable|array',
            'group_by' => 'nullable|string|in:date,module,action,user',
            'metrics' => 'nullable|array'
        ]);
        
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        if (!$user->workspaces()->where('workspaces.id', $workspaceId)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $startDate = Carbon::parse($request->input('start_date'));
        $endDate = Carbon::parse($request->input('end_date'));
        
        $query = Analytics::forWorkspace($workspaceId)
            ->forPeriod($startDate, $endDate)
            ->with('user:id,name,email');
        
        if ($request->filled('modules')) {
            $query->whereIn('module', $request->input('modules'));
        }
        
        if ($request->filled('actions')) {
            $query->whereIn('action', $request->input('actions'));
        }
        
        if ($request->filled('users')) {
            $query->whereIn('user_id', $request->input('users'));
        }
        
        $analytics = $query->get();
        
        $groupBy = $request->input('group_by', 'date');
        $groupedData = $this->groupAnalyticsData($analytics, $groupBy);
        
        return response()->json([
            'report' => $groupedData,
            'summary' => [
                'total_events' => $analytics->count(),
                'unique_users' => $analytics->pluck('user_id')->unique()->count(),
                'total_value' => $analytics->sum('value'),
                'date_range' => [
                    'start' => $startDate->toDateString(),
                    'end' => $endDate->toDateString()
                ]
            ]
        ]);
    }
    
    // Helper methods
    private function getStartDate($period)
    {
        switch ($period) {
            case '7d':
                return now()->subDays(7);
            case '30d':
                return now()->subDays(30);
            case '90d':
                return now()->subDays(90);
            case '1y':
                return now()->subYear();
            default:
                return now()->subDays(30);
        }
    }
    
    private function getOverviewMetrics($workspaceId, $startDate)
    {
        $analytics = Analytics::forWorkspace($workspaceId)
            ->forPeriod($startDate, now())
            ->get();
        
        return [
            'total_events' => $analytics->count(),
            'unique_users' => $analytics->pluck('user_id')->unique()->count(),
            'total_value' => $analytics->sum('value'),
            'active_modules' => $analytics->pluck('module')->unique()->count(),
            'avg_events_per_user' => $analytics->count() > 0 ? round($analytics->count() / $analytics->pluck('user_id')->unique()->count(), 2) : 0,
            'top_modules' => $analytics->groupBy('module')->map->count()->sortDesc()->take(5),
            'top_actions' => $analytics->groupBy('action')->map->count()->sortDesc()->take(5)
        ];
    }
    
    private function getModuleAnalyticsData($workspaceId, $startDate, $modules = [])
    {
        $query = Analytics::forWorkspace($workspaceId)
            ->forPeriod($startDate, now());
        
        if (!empty($modules)) {
            $query->whereIn('module', $modules);
        }
        
        return $query->get()
            ->groupBy('module')
            ->map(function ($items) {
                return [
                    'total_events' => $items->count(),
                    'unique_users' => $items->pluck('user_id')->unique()->count(),
                    'total_value' => $items->sum('value'),
                    'top_actions' => $items->groupBy('action')->map->count()->sortDesc()->take(3),
                    'timeline' => $items->groupBy(function ($item) {
                        return $item->timestamp->format('Y-m-d');
                    })->map->count()
                ];
            });
    }
    
    private function getTimelineData($workspaceId, $startDate, $period)
    {
        $format = $period === '7d' ? 'Y-m-d H:00' : 'Y-m-d';
        
        return Analytics::forWorkspace($workspaceId)
            ->forPeriod($startDate, now())
            ->get()
            ->groupBy(function ($item) use ($format) {
                return $item->timestamp->format($format);
            })
            ->map(function ($items) {
                return [
                    'events' => $items->count(),
                    'value' => $items->sum('value'),
                    'users' => $items->pluck('user_id')->unique()->count()
                ];
            });
    }
    
    private function getTopPerformers($workspaceId, $startDate)
    {
        return Analytics::forWorkspace($workspaceId)
            ->forPeriod($startDate, now())
            ->with('user:id,name,email')
            ->get()
            ->groupBy('user_id')
            ->map(function ($items) {
                $user = $items->first()->user;
                return [
                    'user' => $user ? $user->only(['id', 'name', 'email']) : null,
                    'total_events' => $items->count(),
                    'total_value' => $items->sum('value'),
                    'modules' => $items->pluck('module')->unique()->count(),
                    'last_activity' => $items->max('timestamp')
                ];
            })
            ->sortByDesc('total_events')
            ->take(10)
            ->values();
    }
    
    private function getGoalProgress($workspaceId, $startDate)
    {
        // This would be customized based on workspace goals
        return [
            'revenue_goal' => [
                'target' => 10000,
                'current' => Analytics::forWorkspace($workspaceId)
                    ->forPeriod($startDate, now())
                    ->forAction('revenue_generated')
                    ->sum('value'),
                'progress' => 0
            ],
            'engagement_goal' => [
                'target' => 1000,
                'current' => Analytics::forWorkspace($workspaceId)
                    ->forPeriod($startDate, now())
                    ->forModule('instagram')
                    ->count(),
                'progress' => 0
            ]
        ];
    }
    
    private function getDetailedModuleMetrics($workspaceId, $module, $startDate)
    {
        return Analytics::forWorkspace($workspaceId)
            ->forModule($module)
            ->forPeriod($startDate, now())
            ->get()
            ->groupBy('action')
            ->map(function ($items) {
                return [
                    'count' => $items->count(),
                    'total_value' => $items->sum('value'),
                    'avg_value' => $items->avg('value'),
                    'unique_users' => $items->pluck('user_id')->unique()->count(),
                    'recent_activity' => $items->sortByDesc('timestamp')->take(5)->values()
                ];
            });
    }
    
    private function groupAnalyticsData($analytics, $groupBy)
    {
        switch ($groupBy) {
            case 'date':
                return $analytics->groupBy(function ($item) {
                    return $item->timestamp->format('Y-m-d');
                })->map->count();
            case 'module':
                return $analytics->groupBy('module')->map->count();
            case 'action':
                return $analytics->groupBy('action')->map->count();
            case 'user':
                return $analytics->groupBy('user_id')->map->count();
            default:
                return $analytics->groupBy('module')->map->count();
        }
    }
    
    private function exportToCsv($analytics)
    {
        $csv = "ID,Workspace,User,Module,Action,Entity Type,Entity ID,Value,Timestamp\n";
        
        foreach ($analytics as $item) {
            $csv .= sprintf(
                "%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                $item->id,
                $item->workspace_id,
                $item->user->name ?? 'Unknown',
                $item->module,
                $item->action,
                $item->entity_type ?? '',
                $item->entity_id ?? '',
                $item->value,
                $item->timestamp
            );
        }
        
        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="analytics_export.csv"'
        ]);
    }
}