<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class TeamActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'workspace_id',
        'user_id',
        'activity_type',
        'module',
        'action',
        'entity_type',
        'entity_id',
        'description',
        'metadata',
        'visibility',
        'created_at'
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime'
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
    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeForWorkspace($query, $workspaceId)
    {
        return $query->where('workspace_id', $workspaceId);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForModule($query, $module)
    {
        return $query->where('module', $module);
    }

    public function scopePublic($query)
    {
        return $query->where('visibility', 'public');
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Helper methods
    public static function logActivity($workspaceId, $userId, $activityType, $module, $action, $entityType = null, $entityId = null, $description = null, $metadata = [], $visibility = 'public')
    {
        return self::create([
            'workspace_id' => $workspaceId,
            'user_id' => $userId,
            'activity_type' => $activityType,
            'module' => $module,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'description' => $description,
            'metadata' => $metadata,
            'visibility' => $visibility
        ]);
    }

    public static function getWorkspaceActivity($workspaceId, $limit = 50, $days = 7)
    {
        return self::forWorkspace($workspaceId)
            ->public()
            ->recent($days)
            ->with('user')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    public static function getUserActivity($userId, $workspaceId = null, $limit = 20)
    {
        $query = self::forUser($userId)->with('workspace');
        
        if ($workspaceId) {
            $query->forWorkspace($workspaceId);
        }
        
        return $query->orderByDesc('created_at')->limit($limit)->get();
    }

    public static function getModuleActivity($workspaceId, $module, $limit = 20)
    {
        return self::forWorkspace($workspaceId)
            ->forModule($module)
            ->public()
            ->with('user')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    public function getActivityIcon()
    {
        $icons = [
            'create' => '➕',
            'update' => '✏️',
            'delete' => '🗑️',
            'publish' => '📢',
            'share' => '🔗',
            'comment' => '💬',
            'like' => '👍',
            'view' => '👀',
            'download' => '⬇️',
            'upload' => '⬆️',
            'invite' => '👥',
            'join' => '🤝',
            'leave' => '👋',
            'complete' => '✅',
            'start' => '🚀',
            'pause' => '⏸️',
            'resume' => '▶️',
            'cancel' => '❌'
        ];

        return $icons[$this->action] ?? '📝';
    }

    public function getActivityColor()
    {
        $colors = [
            'create' => 'green',
            'update' => 'blue',
            'delete' => 'red',
            'publish' => 'purple',
            'share' => 'indigo',
            'comment' => 'yellow',
            'like' => 'pink',
            'view' => 'gray',
            'download' => 'teal',
            'upload' => 'cyan',
            'invite' => 'orange',
            'join' => 'green',
            'leave' => 'red',
            'complete' => 'green',
            'start' => 'blue',
            'pause' => 'yellow',
            'resume' => 'green',
            'cancel' => 'red'
        ];

        return $colors[$this->action] ?? 'gray';
    }
}