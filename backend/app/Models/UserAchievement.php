<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class UserAchievement extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'user_id',
        'workspace_id',
        'achievement_id',
        'earned_at',
        'progress',
        'is_completed',
        'metadata'
    ];

    protected $casts = [
        'earned_at' => 'datetime',
        'progress' => 'decimal:2',
        'is_completed' => 'boolean',
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

    public function achievement()
    {
        return $this->belongsTo(Achievement::class);
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('is_completed', true);
    }

    public function scopeInProgress($query)
    {
        return $query->where('is_completed', false);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForWorkspace($query, $workspaceId)
    {
        return $query->where('workspace_id', $workspaceId);
    }

    // Helper methods
    public static function trackProgress($userId, $workspaceId, $achievementId, $progress = 0, $metadata = [])
    {
        $userAchievement = self::firstOrCreate([
            'user_id' => $userId,
            'workspace_id' => $workspaceId,
            'achievement_id' => $achievementId
        ]);

        $userAchievement->progress = $progress;
        $userAchievement->metadata = $metadata;
        
        if ($progress >= 100) {
            $userAchievement->is_completed = true;
            $userAchievement->earned_at = now();
        }
        
        $userAchievement->save();
        
        return $userAchievement;
    }

    public static function getUserAchievements($userId, $workspaceId = null)
    {
        $query = self::forUser($userId)->with('achievement');
        
        if ($workspaceId) {
            $query->forWorkspace($workspaceId);
        }
        
        return $query->get()->groupBy('is_completed');
    }

    public static function getLeaderboard($workspaceId, $limit = 10)
    {
        return self::forWorkspace($workspaceId)
            ->completed()
            ->with(['user', 'achievement'])
            ->join('achievements', 'user_achievements.achievement_id', '=', 'achievements.id')
            ->selectRaw('user_id, SUM(achievements.points) as total_points, COUNT(*) as total_achievements')
            ->groupBy('user_id')
            ->orderByDesc('total_points')
            ->limit($limit)
            ->get();
    }
}