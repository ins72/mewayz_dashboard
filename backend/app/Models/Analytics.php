<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Analytics extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'workspace_id',
        'user_id',
        'module',
        'action',
        'entity_type',
        'entity_id',
        'metadata',
        'value',
        'timestamp'
    ];

    protected $casts = [
        'metadata' => 'array',
        'value' => 'decimal:2',
        'timestamp' => 'datetime'
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

    public function scopeForModule($query, $module)
    {
        return $query->where('module', $module);
    }

    public function scopeForAction($query, $action)
    {
        return $query->where('action', $action);
    }

    public function scopeForPeriod($query, $startDate, $endDate)
    {
        return $query->whereBetween('timestamp', [$startDate, $endDate]);
    }

    // Helper methods
    public static function trackEvent($workspaceId, $userId, $module, $action, $entityType = null, $entityId = null, $metadata = [], $value = 0)
    {
        return self::create([
            'workspace_id' => $workspaceId,
            'user_id' => $userId,
            'module' => $module,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'metadata' => $metadata,
            'value' => $value,
            'timestamp' => now()
        ]);
    }

    public static function getModuleAnalytics($workspaceId, $module, $period = '30d')
    {
        $startDate = now()->subDays($period === '7d' ? 7 : ($period === '90d' ? 90 : 30));
        
        return self::forWorkspace($workspaceId)
            ->forModule($module)
            ->forPeriod($startDate, now())
            ->get()
            ->groupBy('action')
            ->map(function ($items) {
                return [
                    'count' => $items->count(),
                    'total_value' => $items->sum('value'),
                    'avg_value' => $items->avg('value'),
                    'timeline' => $items->groupBy(function ($item) {
                        return $item->timestamp->format('Y-m-d');
                    })->map(function ($dayItems) {
                        return [
                            'count' => $dayItems->count(),
                            'value' => $dayItems->sum('value')
                        ];
                    })
                ];
            });
    }
}