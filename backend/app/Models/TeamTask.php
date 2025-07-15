<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class TeamTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'workspace_id',
        'created_by',
        'assigned_to',
        'title',
        'description',
        'module',
        'priority',
        'status',
        'due_date',
        'completed_at',
        'metadata',
        'tags'
    ];

    protected $casts = [
        'metadata' => 'array',
        'tags' => 'array',
        'due_date' => 'datetime',
        'completed_at' => 'datetime'
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

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // Scopes
    public function scopeForWorkspace($query, $workspaceId)
    {
        return $query->where('workspace_id', $workspaceId);
    }

    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    public function scopeCreatedBy($query, $userId)
    {
        return $query->where('created_by', $userId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeByModule($query, $module)
    {
        return $query->where('module', $module);
    }

    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())
            ->whereNotIn('status', ['completed', 'cancelled']);
    }

    public function scopeDueToday($query)
    {
        return $query->whereDate('due_date', now()->toDateString())
            ->whereNotIn('status', ['completed', 'cancelled']);
    }

    public function scopeUpcoming($query, $days = 7)
    {
        return $query->whereBetween('due_date', [now(), now()->addDays($days)])
            ->whereNotIn('status', ['completed', 'cancelled']);
    }

    // Helper methods
    public static function createTask($workspaceId, $createdBy, $assignedTo, $title, $description = null, $module = null, $priority = 'normal', $dueDate = null, $metadata = [], $tags = [])
    {
        return self::create([
            'workspace_id' => $workspaceId,
            'created_by' => $createdBy,
            'assigned_to' => $assignedTo,
            'title' => $title,
            'description' => $description,
            'module' => $module,
            'priority' => $priority,
            'status' => 'pending',
            'due_date' => $dueDate,
            'metadata' => $metadata,
            'tags' => $tags
        ]);
    }

    public static function getTaskSummary($workspaceId, $userId = null)
    {
        $query = self::forWorkspace($workspaceId);
        
        if ($userId) {
            $query->assignedTo($userId);
        }
        
        $tasks = $query->get();
        
        return [
            'total' => $tasks->count(),
            'pending' => $tasks->where('status', 'pending')->count(),
            'in_progress' => $tasks->where('status', 'in_progress')->count(),
            'completed' => $tasks->where('status', 'completed')->count(),
            'overdue' => $tasks->filter(function ($task) {
                return $task->due_date && $task->due_date < now() && !in_array($task->status, ['completed', 'cancelled']);
            })->count(),
            'due_today' => $tasks->filter(function ($task) {
                return $task->due_date && $task->due_date->isToday() && !in_array($task->status, ['completed', 'cancelled']);
            })->count(),
            'by_priority' => $tasks->groupBy('priority')->map->count(),
            'by_module' => $tasks->groupBy('module')->map->count()
        ];
    }

    public function updateStatus($status, $userId = null)
    {
        $this->status = $status;
        
        if ($status === 'completed') {
            $this->completed_at = now();
        } elseif ($this->status === 'completed' && $status !== 'completed') {
            $this->completed_at = null;
        }
        
        $this->save();
        
        // Log activity
        if ($userId) {
            TeamActivity::logActivity(
                $this->workspace_id,
                $userId,
                'task_update',
                $this->module ?? 'team',
                'status_change',
                'task',
                $this->id,
                "Changed task status to {$status}",
                ['old_status' => $this->getOriginal('status'), 'new_status' => $status]
            );
        }
        
        return $this;
    }

    public function assignTo($userId, $assignedBy = null)
    {
        $oldAssignee = $this->assigned_to;
        $this->assigned_to = $userId;
        $this->save();
        
        // Create notification for new assignee
        if ($userId !== $oldAssignee) {
            TeamNotification::createNotification(
                $this->workspace_id,
                $userId,
                $assignedBy ?? $this->created_by,
                'task_assigned',
                'New Task Assigned',
                "You have been assigned a new task: {$this->title}",
                "/tasks/{$this->id}",
                ['task_id' => $this->id, 'old_assignee' => $oldAssignee],
                $this->priority === 'high' ? 'high' : 'normal'
            );
        }
        
        // Log activity
        if ($assignedBy) {
            TeamActivity::logActivity(
                $this->workspace_id,
                $assignedBy,
                'task_assignment',
                $this->module ?? 'team',
                'assign',
                'task',
                $this->id,
                "Assigned task to user",
                ['old_assignee' => $oldAssignee, 'new_assignee' => $userId]
            );
        }
        
        return $this;
    }

    public function isOverdue()
    {
        return $this->due_date && $this->due_date < now() && !in_array($this->status, ['completed', 'cancelled']);
    }

    public function isDueToday()
    {
        return $this->due_date && $this->due_date->isToday() && !in_array($this->status, ['completed', 'cancelled']);
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

    public function getStatusColor()
    {
        $colors = [
            'pending' => 'yellow',
            'in_progress' => 'blue',
            'completed' => 'green',
            'cancelled' => 'red'
        ];

        return $colors[$this->status] ?? 'gray';
    }
}