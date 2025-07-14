<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class SocialMediaPost extends Model
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
        'media_urls',
        'hashtags',
        'status',
        'scheduled_at',
        'published_at',
        'external_post_id',
        'engagement_metrics',
        'created_by',
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
            'media_urls' => 'array',
            'hashtags' => 'array',
            'engagement_metrics' => 'array',
            'scheduled_at' => 'datetime',
            'published_at' => 'datetime',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($post) {
            if (empty($post->id)) {
                $post->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the workspace that owns the post.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the social media account for this post.
     */
    public function socialMediaAccount(): BelongsTo
    {
        return $this->belongsTo(SocialMediaAccount::class);
    }

    /**
     * Get the user who created this post.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check if the post is scheduled.
     */
    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    /**
     * Check if the post is published.
     */
    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    /**
     * Check if the post is a draft.
     */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Check if the post failed to publish.
     */
    public function hasFailed(): bool
    {
        return $this->status === 'failed';
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
        $engagement = ($metrics['likes'] ?? 0) + ($metrics['comments'] ?? 0) + ($metrics['shares'] ?? 0);

        return $impressions > 0 ? round(($engagement / $impressions) * 100, 2) : 0;
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