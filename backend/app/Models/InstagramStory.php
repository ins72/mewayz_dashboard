<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class InstagramStory extends Model
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
        'social_media_account_id',
        'title',
        'content',
        'media_url',
        'story_type',
        'status',
        'scheduled_at',
        'published_at',
        'external_story_id',
        'duration',
        'engagement_metrics',
        'created_by',
        'is_highlight',
        'highlight_category',
        'stickers',
        'links',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'id' => 'string',
            'workspace_id' => 'string',
            'social_media_account_id' => 'string',
            'created_by' => 'string',
            'engagement_metrics' => 'array',
            'stickers' => 'array',
            'links' => 'array',
            'scheduled_at' => 'datetime',
            'published_at' => 'datetime',
            'is_highlight' => 'boolean',
            'duration' => 'integer',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($story) {
            if (empty($story->id)) {
                $story->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the workspace that owns the story.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the social media account for this story.
     */
    public function socialMediaAccount(): BelongsTo
    {
        return $this->belongsTo(SocialMediaAccount::class);
    }

    /**
     * Get the user who created this story.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check if the story is scheduled.
     */
    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    /**
     * Check if the story is published.
     */
    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    /**
     * Check if the story is a draft.
     */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Check if the story is expired.
     */
    public function isExpired(): bool
    {
        return $this->status === 'expired';
    }

    /**
     * Get the engagement rate if metrics are available.
     */
    public function getEngagementRate(): ?float
    {
        if (!$this->engagement_metrics) {
            return null;
        }

        $metrics = $this->engagement_metrics;
        $impressions = $metrics['impressions'] ?? 0;
        $engagement = ($metrics['taps'] ?? 0) + ($metrics['replies'] ?? 0) + ($metrics['exits'] ?? 0);

        return $impressions > 0 ? round(($engagement / $impressions) * 100, 2) : 0;
    }
}