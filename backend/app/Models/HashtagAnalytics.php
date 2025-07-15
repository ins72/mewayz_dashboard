<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class HashtagAnalytics extends Model
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
        'hashtag',
        'platform',
        'post_count',
        'engagement_rate',
        'trending_score',
        'difficulty_score',
        'related_hashtags',
        'category',
        'last_updated',
        'is_trending',
        'popularity_rank',
        'usage_metrics',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'id' => 'string',
            'workspace_id' => 'string',
            'post_count' => 'integer',
            'engagement_rate' => 'float',
            'trending_score' => 'float',
            'difficulty_score' => 'float',
            'related_hashtags' => 'array',
            'usage_metrics' => 'array',
            'last_updated' => 'datetime',
            'is_trending' => 'boolean',
            'popularity_rank' => 'integer',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($hashtag) {
            if (empty($hashtag->id)) {
                $hashtag->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the workspace that owns the hashtag analytics.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Check if the hashtag is trending.
     */
    public function isTrending(): bool
    {
        return $this->is_trending;
    }

    /**
     * Get the difficulty level based on difficulty score.
     */
    public function getDifficultyLevel(): string
    {
        if ($this->difficulty_score <= 30) {
            return 'easy';
        } elseif ($this->difficulty_score <= 60) {
            return 'medium';
        } elseif ($this->difficulty_score <= 80) {
            return 'hard';
        } else {
            return 'very_hard';
        }
    }

    /**
     * Get the popularity level based on post count.
     */
    public function getPopularityLevel(): string
    {
        if ($this->post_count < 10000) {
            return 'low';
        } elseif ($this->post_count < 100000) {
            return 'medium';
        } elseif ($this->post_count < 1000000) {
            return 'high';
        } else {
            return 'very_high';
        }
    }
}