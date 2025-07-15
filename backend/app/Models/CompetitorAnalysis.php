<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class CompetitorAnalysis extends Model
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
        'competitor_username',
        'competitor_name',
        'platform',
        'follower_count',
        'following_count',
        'posts_count',
        'engagement_rate',
        'average_likes',
        'average_comments',
        'posting_frequency',
        'content_themes',
        'hashtag_usage',
        'best_performing_content',
        'posting_schedule',
        'growth_rate',
        'last_analyzed',
        'tracking_status',
        'competitor_metrics',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'id' => 'string',
            'workspace_id' => 'string',
            'follower_count' => 'integer',
            'following_count' => 'integer',
            'posts_count' => 'integer',
            'engagement_rate' => 'float',
            'average_likes' => 'float',
            'average_comments' => 'float',
            'posting_frequency' => 'float',
            'content_themes' => 'array',
            'hashtag_usage' => 'array',
            'best_performing_content' => 'array',
            'posting_schedule' => 'array',
            'growth_rate' => 'float',
            'last_analyzed' => 'datetime',
            'competitor_metrics' => 'array',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($analysis) {
            if (empty($analysis->id)) {
                $analysis->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the workspace that owns the competitor analysis.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Check if the competitor is being actively tracked.
     */
    public function isActivelyTracked(): bool
    {
        return $this->tracking_status === 'active';
    }

    /**
     * Get the competitor's follower to following ratio.
     */
    public function getFollowerToFollowingRatio(): float
    {
        return $this->following_count > 0 ? round($this->follower_count / $this->following_count, 2) : 0;
    }

    /**
     * Get the most used hashtags by the competitor.
     */
    public function getTopHashtags(int $limit = 10): array
    {
        $hashtags = $this->hashtag_usage ?? [];
        arsort($hashtags);
        return array_slice($hashtags, 0, $limit, true);
    }

    /**
     * Get the competitor's posting pattern.
     */
    public function getPostingPattern(): array
    {
        return $this->posting_schedule ?? [];
    }

    /**
     * Get the competitor's content themes.
     */
    public function getContentThemes(): array
    {
        return $this->content_themes ?? [];
    }

    /**
     * Get the competitor's best performing content.
     */
    public function getBestPerformingContent(): array
    {
        return $this->best_performing_content ?? [];
    }
}