<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class InstagramAnalytics extends Model
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
        'date',
        'account_metrics',
        'post_metrics',
        'story_metrics',
        'audience_metrics',
        'hashtag_performance',
        'best_posting_times',
        'competitor_data',
        'growth_metrics',
        'engagement_insights',
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
            'date' => 'date',
            'account_metrics' => 'array',
            'post_metrics' => 'array',
            'story_metrics' => 'array',
            'audience_metrics' => 'array',
            'hashtag_performance' => 'array',
            'best_posting_times' => 'array',
            'competitor_data' => 'array',
            'growth_metrics' => 'array',
            'engagement_insights' => 'array',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($analytics) {
            if (empty($analytics->id)) {
                $analytics->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the workspace that owns the analytics.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the social media account for this analytics.
     */
    public function socialMediaAccount(): BelongsTo
    {
        return $this->belongsTo(SocialMediaAccount::class);
    }

    /**
     * Get the follower count from account metrics.
     */
    public function getFollowerCount(): int
    {
        return $this->account_metrics['followers'] ?? 0;
    }

    /**
     * Get the following count from account metrics.
     */
    public function getFollowingCount(): int
    {
        return $this->account_metrics['following'] ?? 0;
    }

    /**
     * Get the total posts count from account metrics.
     */
    public function getPostsCount(): int
    {
        return $this->account_metrics['posts'] ?? 0;
    }

    /**
     * Get the overall engagement rate.
     */
    public function getEngagementRate(): float
    {
        return $this->account_metrics['engagement_rate'] ?? 0.0;
    }

    /**
     * Get the reach from post metrics.
     */
    public function getReach(): int
    {
        return $this->post_metrics['reach'] ?? 0;
    }

    /**
     * Get the impressions from post metrics.
     */
    public function getImpressions(): int
    {
        return $this->post_metrics['impressions'] ?? 0;
    }

    /**
     * Get the best posting time for a specific day.
     */
    public function getBestPostingTime(string $day): ?string
    {
        return $this->best_posting_times[$day] ?? null;
    }

    /**
     * Get the top performing hashtags.
     */
    public function getTopHashtags(int $limit = 10): array
    {
        $hashtags = $this->hashtag_performance ?? [];
        arsort($hashtags);
        return array_slice($hashtags, 0, $limit, true);
    }
}