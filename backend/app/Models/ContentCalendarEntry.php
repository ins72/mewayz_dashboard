<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ContentCalendarEntry extends Model
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
        'content_calendar_id',
        'workspace_id',
        'title',
        'description',
        'content_type',
        'scheduled_date',
        'scheduled_time',
        'platform',
        'content_data',
        'status',
        'created_by',
        'tags',
        'media_urls',
        'hashtags',
        'target_audience',
        'campaign_id',
        'notes',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'id' => 'string',
            'content_calendar_id' => 'string',
            'workspace_id' => 'string',
            'created_by' => 'string',
            'scheduled_date' => 'date',
            'scheduled_time' => 'time',
            'content_data' => 'array',
            'tags' => 'array',
            'media_urls' => 'array',
            'hashtags' => 'array',
            'target_audience' => 'array',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($entry) {
            if (empty($entry->id)) {
                $entry->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the content calendar that owns this entry.
     */
    public function contentCalendar(): BelongsTo
    {
        return $this->belongsTo(ContentCalendar::class);
    }

    /**
     * Get the workspace that owns this entry.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the user who created this entry.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check if the entry is scheduled.
     */
    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    /**
     * Check if the entry is published.
     */
    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    /**
     * Check if the entry is a draft.
     */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Get the scheduled datetime.
     */
    public function getScheduledDateTime(): ?string
    {
        if ($this->scheduled_date && $this->scheduled_time) {
            return $this->scheduled_date->format('Y-m-d') . ' ' . $this->scheduled_time;
        }
        return null;
    }

    /**
     * Get formatted hashtags as a string.
     */
    public function getFormattedHashtags(): string
    {
        if (!$this->hashtags || !is_array($this->hashtags)) {
            return '';
        }

        return implode(' ', array_map(function ($hashtag) {
            return '#' . ltrim($hashtag, '#');
        }, $this->hashtags));
    }
}