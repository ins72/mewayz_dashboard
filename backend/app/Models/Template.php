<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Template extends Model
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
        'creator_id',
        'template_category_id',
        'title',
        'description',
        'template_type',
        'template_data',
        'preview_image',
        'preview_url',
        'price',
        'is_free',
        'is_premium',
        'status',
        'approval_status',
        'version',
        'tags',
        'features',
        'requirements',
        'license_type',
        'usage_limit',
        'download_count',
        'purchase_count',
        'rating_average',
        'rating_count',
        'created_by',
        'approved_by',
        'approved_at',
        'metadata',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'id' => 'string',
            'workspace_id' => 'string',
            'creator_id' => 'string',
            'template_category_id' => 'string',
            'created_by' => 'string',
            'approved_by' => 'string',
            'template_data' => 'array',
            'tags' => 'array',
            'features' => 'array',
            'requirements' => 'array',
            'metadata' => 'array',
            'price' => 'decimal:2',
            'rating_average' => 'decimal:2',
            'is_free' => 'boolean',
            'is_premium' => 'boolean',
            'approved_at' => 'datetime',
            'download_count' => 'integer',
            'purchase_count' => 'integer',
            'rating_count' => 'integer',
            'usage_limit' => 'integer',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($template) {
            if (empty($template->id)) {
                $template->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the workspace that owns the template.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the creator of the template.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    /**
     * Get the user who created this template.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who approved this template.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the template category.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(TemplateCategory::class, 'template_category_id');
    }

    /**
     * Get the template purchases.
     */
    public function purchases(): HasMany
    {
        return $this->hasMany(TemplatePurchase::class);
    }

    /**
     * Get the template reviews.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(TemplateReview::class);
    }

    /**
     * Get the template usage records.
     */
    public function usages(): HasMany
    {
        return $this->hasMany(TemplateUsage::class);
    }

    /**
     * Get the collections this template belongs to.
     */
    public function collections(): BelongsToMany
    {
        return $this->belongsToMany(TemplateCollection::class, 'template_collection_items');
    }

    /**
     * Check if the template is approved.
     */
    public function isApproved(): bool
    {
        return $this->approval_status === 'approved';
    }

    /**
     * Check if the template is pending approval.
     */
    public function isPending(): bool
    {
        return $this->approval_status === 'pending';
    }

    /**
     * Check if the template is rejected.
     */
    public function isRejected(): bool
    {
        return $this->approval_status === 'rejected';
    }

    /**
     * Check if the template is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if the template is free.
     */
    public function isFree(): bool
    {
        return $this->is_free || $this->price <= 0;
    }

    /**
     * Check if the template is premium.
     */
    public function isPremium(): bool
    {
        return $this->is_premium;
    }

    /**
     * Get the template type display name.
     */
    public function getTypeDisplayName(): string
    {
        return match($this->template_type) {
            'email' => 'Email Template',
            'link_in_bio' => 'Link in Bio Template',
            'course' => 'Course Template',
            'social_media' => 'Social Media Template',
            'marketing' => 'Marketing Template',
            'landing_page' => 'Landing Page Template',
            'newsletter' => 'Newsletter Template',
            'blog_post' => 'Blog Post Template',
            default => ucfirst(str_replace('_', ' ', $this->template_type)),
        };
    }

    /**
     * Get the license type display name.
     */
    public function getLicenseDisplayName(): string
    {
        return match($this->license_type) {
            'standard' => 'Standard License',
            'extended' => 'Extended License',
            'commercial' => 'Commercial License',
            'unlimited' => 'Unlimited License',
            default => ucfirst($this->license_type),
        };
    }

    /**
     * Increment download count.
     */
    public function incrementDownloadCount(): void
    {
        $this->increment('download_count');
    }

    /**
     * Increment purchase count.
     */
    public function incrementPurchaseCount(): void
    {
        $this->increment('purchase_count');
    }

    /**
     * Update rating average.
     */
    public function updateRatingAverage(): void
    {
        $avgRating = $this->reviews()->avg('rating');
        $ratingCount = $this->reviews()->count();
        
        $this->update([
            'rating_average' => $avgRating ? round($avgRating, 2) : 0,
            'rating_count' => $ratingCount
        ]);
    }

    /**
     * Check if user has purchased this template.
     */
    public function isPurchasedBy(string $userId): bool
    {
        return $this->purchases()
            ->where('user_id', $userId)
            ->where('status', 'completed')
            ->exists();
    }

    /**
     * Check if user can use this template.
     */
    public function canBeUsedBy(string $userId): bool
    {
        // Free templates can be used by anyone
        if ($this->isFree()) {
            return true;
        }

        // Check if user has purchased the template
        return $this->isPurchasedBy($userId);
    }

    /**
     * Scope for active templates.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for approved templates.
     */
    public function scopeApproved($query)
    {
        return $query->where('approval_status', 'approved');
    }

    /**
     * Scope for free templates.
     */
    public function scopeFree($query)
    {
        return $query->where('is_free', true);
    }

    /**
     * Scope for premium templates.
     */
    public function scopePremium($query)
    {
        return $query->where('is_premium', true);
    }

    /**
     * Scope for template type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('template_type', $type);
    }

    /**
     * Scope for templates by category.
     */
    public function scopeInCategory($query, string $categoryId)
    {
        return $query->where('template_category_id', $categoryId);
    }

    /**
     * Scope for popular templates.
     */
    public function scopePopular($query)
    {
        return $query->orderBy('download_count', 'desc')
                    ->orderBy('purchase_count', 'desc');
    }

    /**
     * Scope for highly rated templates.
     */
    public function scopeHighlyRated($query)
    {
        return $query->where('rating_average', '>=', 4.0)
                    ->where('rating_count', '>=', 5);
    }
}