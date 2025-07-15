<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class TeamNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'workspace_id',
        'user_id',
        'sender_id',
        'type',
        'title',
        'message',
        'action_url',
        'metadata',
        'priority',
        'is_read',
        'read_at',
        'expires_at',
        'created_at'
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'expires_at' => 'datetime',
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

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
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

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', now());
        });
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Helper methods
    public static function createNotification($workspaceId, $userId, $senderId, $type, $title, $message, $actionUrl = null, $metadata = [], $priority = 'normal', $expiresAt = null)
    {
        return self::create([
            'workspace_id' => $workspaceId,
            'user_id' => $userId,
            'sender_id' => $senderId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'action_url' => $actionUrl,
            'metadata' => $metadata,
            'priority' => $priority,
            'expires_at' => $expiresAt
        ]);
    }

    public static function notifyTeamMembers($workspaceId, $senderId, $type, $title, $message, $actionUrl = null, $metadata = [], $priority = 'normal', $excludeUserIds = [])
    {
        $workspaceUsers = WorkspaceUser::where('workspace_id', $workspaceId)
            ->whereNotIn('user_id', array_merge([$senderId], $excludeUserIds))
            ->get();

        foreach ($workspaceUsers as $workspaceUser) {
            self::createNotification(
                $workspaceId,
                $workspaceUser->user_id,
                $senderId,
                $type,
                $title,
                $message,
                $actionUrl,
                $metadata,
                $priority
            );
        }
    }

    public static function getUserNotifications($userId, $workspaceId = null, $limit = 20, $unreadOnly = false)
    {
        $query = self::forUser($userId)
            ->active()
            ->with(['sender', 'workspace']);

        if ($workspaceId) {
            $query->forWorkspace($workspaceId);
        }

        if ($unreadOnly) {
            $query->unread();
        }

        return $query->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    public static function getNotificationCounts($userId, $workspaceId = null)
    {
        $query = self::forUser($userId)->active();

        if ($workspaceId) {
            $query->forWorkspace($workspaceId);
        }

        $total = $query->count();
        $unread = $query->unread()->count();
        $priority = $query->byPriority('high')->unread()->count();

        return [
            'total' => $total,
            'unread' => $unread,
            'high_priority' => $priority
        ];
    }

    public function markAsRead()
    {
        $this->is_read = true;
        $this->read_at = now();
        $this->save();
    }

    public function markAsUnread()
    {
        $this->is_read = false;
        $this->read_at = null;
        $this->save();
    }

    public function getNotificationIcon()
    {
        $icons = [
            'team_invite' => '👥',
            'role_change' => '🔄',
            'achievement' => '🏆',
            'task_assigned' => '📋',
            'task_completed' => '✅',
            'mention' => '💬',
            'comment' => '💭',
            'like' => '👍',
            'share' => '🔗',
            'system' => '⚙️',
            'warning' => '⚠️',
            'info' => 'ℹ️',
            'success' => '✅',
            'error' => '❌'
        ];

        return $icons[$this->type] ?? '🔔';
    }

    public function getPriorityColor()
    {
        $colors = [
            'low' => 'gray',
            'normal' => 'blue',
            'high' => 'orange',
            'urgent' => 'red'
        ];

        return $colors[$this->priority] ?? 'blue';
    }
}