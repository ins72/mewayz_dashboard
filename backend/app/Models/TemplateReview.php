<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class TemplateReview extends Model
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
        'template_id',
        'template_collection_id',
        'user_id',
        'workspace_id',
        'rating',
        'title',
        'review',
        'pros',
        'cons',
        'is_verified_purchase',
        'is_approved',
        'helpful_count',
        'reported_count',
        'status',
        'reviewed_at',
        'metadata',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'id' => 'string',
            'template_id' => 'string',
            'template_collection_id' => 'string',
            'user_id' => 'string',
            'workspace_id' => 'string',
            'rating' => 'integer',
            'pros' => 'array',
            'cons' => 'array',
            'is_verified_purchase' => 'boolean',
            'is_approved' => 'boolean',
            'helpful_count' => 'integer',
            'reported_count' => 'integer',
            'reviewed_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($review) {
            if (empty($review->id)) {
                $review->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the template that was reviewed.
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    /**
     * Get the template collection that was reviewed.
     */
    public function templateCollection(): BelongsTo
    {
        return $this->belongsTo(TemplateCollection::class);
    }

    /**
     * Get the user who wrote the review.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the workspace where the review was written.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Check if the review is approved.
     */
    public function isApproved(): bool
    {
        return $this->is_approved;
    }

    /**
     * Check if the review is from a verified purchase.
     */
    public function isVerifiedPurchase(): bool
    {
        return $this->is_verified_purchase;
    }

    /**
     * Check if the review is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the review is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if the review is reported.
     */
    public function isReported(): bool
    {
        return $this->reported_count > 0;
    }

    /**
     * Get the rating display with stars.
     */
    public function getRatingDisplay(): string
    {
        return str_repeat('★', $this->rating) . str_repeat('☆', 5 - $this->rating);
    }

    /**
     * Get the rating percentage.
     */
    public function getRatingPercentage(): float
    {
        return ($this->rating / 5) * 100;
    }

    /**
     * Increment helpful count.
     */
    public function incrementHelpfulCount(): void
    {
        $this->increment('helpful_count');
    }

    /**
     * Increment reported count.
     */
    public function incrementReportedCount(): void
    {
        $this->increment('reported_count');
    }

    /**
     * Scope for approved reviews.
     */
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    /**
     * Scope for active reviews.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for verified purchase reviews.
     */
    public function scopeVerifiedPurchase($query)
    {
        return $query->where('is_verified_purchase', true);
    }

    /**
     * Scope for reviews with specific rating.
     */
    public function scopeWithRating($query, int $rating)
    {
        return $query->where('rating', $rating);
    }

    /**
     * Scope for reviews with rating above threshold.
     */
    public function scopeWithRatingAbove($query, int $rating)
    {
        return $query->where('rating', '>', $rating);
    }

    /**
     * Scope for reviews with rating below threshold.
     */
    public function scopeWithRatingBelow($query, int $rating)
    {
        return $query->where('rating', '<', $rating);
    }

    /**
     * Scope for helpful reviews.
     */
    public function scopeHelpful($query)
    {
        return $query->where('helpful_count', '>', 0)
                    ->orderBy('helpful_count', 'desc');
    }

    /**
     * Scope for recent reviews.
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('reviewed_at', 'desc');
    }
}