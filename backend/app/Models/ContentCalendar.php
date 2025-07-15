<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ContentCalendar extends Model
{
    /**
     * Indicates if the IDs are auto-incrementing.
     */
    public $incrementing = false;

    /**
     * The "type" of the auto-incrementing ID.
     */
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'id',
        'workspace_id',
        'title',
        'description',
        'start_date',
        'end_date',
        'calendar_type',
        'status',
        'content_themes',
        'publishing_schedule',
        'campaign_goals',
        'target_audience',
        'hashtag_strategy',
        'content_pillars',
        'created_by',
        'settings',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'id' => 'string',
            'workspace_id' => 'string',
            'created_by' => 'string',
            'start_date' => 'date',
            'end_date' => 'date',
            'content_themes' => 'array',
            'publishing_schedule' => 'array',
            'campaign_goals' => 'array',
            'target_audience' => 'array',
            'hashtag_strategy' => 'array',
            'content_pillars' => 'array',
            'settings' => 'array',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($calendar) {
            if (empty($calendar->id)) {
                $calendar->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the workspace that owns the content calendar.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the user who created this calendar.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the calendar entries.
     */
    public function entries(): HasMany
    {
        return $this->hasMany(ContentCalendarEntry::class);
    }

    /**
     * Check if the calendar is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if the calendar is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Get the calendar duration in days.
     */
    public function getDurationInDays(): int
    {
        return $this->start_date->diffInDays($this->end_date);
    }

    /**
     * Get the progress percentage.
     */
    public function getProgressPercentage(): float
    {
        $totalDays = $this->getDurationInDays();
        $passedDays = $this->start_date->diffInDays(now());
        
        if ($totalDays <= 0) {
            return 0;
        }
        
        return min(100, round(($passedDays / $totalDays) * 100, 2));
    }
}