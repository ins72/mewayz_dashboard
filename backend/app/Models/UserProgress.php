<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class UserProgress extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'user_id',
        'workspace_id',
        'module',
        'action',
        'current_value',
        'target_value',
        'progress_percentage',
        'streak_count',
        'last_activity',
        'metadata'
    ];

    protected $casts = [
        'current_value' => 'decimal:2',
        'target_value' => 'decimal:2',
        'progress_percentage' => 'decimal:2',
        'streak_count' => 'integer',
        'last_activity' => 'datetime',
        'metadata' => 'array'
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (!$model->id) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    // Scopes
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForWorkspace($query, $workspaceId)
    {
        return $query->where('workspace_id', $workspaceId);
    }

    public function scopeForModule($query, $module)
    {
        return $query->where('module', $module);
    }

    // Helper methods
    public static function updateProgress($userId, $workspaceId, $module, $action, $increment = 1, $targetValue = null, $metadata = [])
    {
        $progress = self::firstOrCreate([
            'user_id' => $userId,
            'workspace_id' => $workspaceId,
            'module' => $module,
            'action' => $action
        ], [
            'current_value' => 0,
            'target_value' => $targetValue ?? 100,
            'progress_percentage' => 0,
            'streak_count' => 0,
            'metadata' => []
        ]);

        $progress->current_value += $increment;
        $progress->progress_percentage = ($progress->current_value / $progress->target_value) * 100;
        $progress->last_activity = now();
        $progress->metadata = array_merge($progress->metadata, $metadata);

        // Update streak for daily activities
        if ($action === 'daily_login') {
            $lastActivity = $progress->last_activity;
            $yesterday = now()->subDay();
            
            if ($lastActivity && $lastActivity->isSameDay($yesterday)) {
                $progress->streak_count++;
            } elseif (!$lastActivity || !$lastActivity->isSameDay(now())) {
                $progress->streak_count = 1;
            }
        }

        $progress->save();
        
        return $progress;
    }

    public static function getUserProgress($userId, $workspaceId = null)
    {
        $query = self::forUser($userId);
        
        if ($workspaceId) {
            $query->forWorkspace($workspaceId);
        }
        
        return $query->get()->groupBy('module');
    }

    public static function getProgressSummary($userId, $workspaceId)
    {
        $progress = self::forUser($userId)->forWorkspace($workspaceId)->get();
        
        return [
            'total_activities' => $progress->count(),
            'completed_goals' => $progress->where('progress_percentage', '>=', 100)->count(),
            'average_progress' => $progress->avg('progress_percentage'),
            'longest_streak' => $progress->max('streak_count'),
            'last_activity' => $progress->max('last_activity'),
            'by_module' => $progress->groupBy('module')->map(function ($items) {
                return [
                    'activities' => $items->count(),
                    'avg_progress' => $items->avg('progress_percentage'),
                    'completed' => $items->where('progress_percentage', '>=', 100)->count()
                ];
            })
        ];
    }
}