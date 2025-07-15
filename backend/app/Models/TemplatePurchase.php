<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class TemplatePurchase extends Model
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
        'purchase_type',
        'price',
        'discount_amount',
        'total_amount',
        'currency',
        'payment_method',
        'payment_id',
        'status',
        'license_type',
        'usage_limit',
        'usage_count',
        'download_count',
        'expires_at',
        'purchased_at',
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
            'price' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'usage_limit' => 'integer',
            'usage_count' => 'integer',
            'download_count' => 'integer',
            'expires_at' => 'datetime',
            'purchased_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($purchase) {
            if (empty($purchase->id)) {
                $purchase->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the template that was purchased.
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    /**
     * Get the template collection that was purchased.
     */
    public function templateCollection(): BelongsTo
    {
        return $this->belongsTo(TemplateCollection::class);
    }

    /**
     * Get the user who made the purchase.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the workspace where the purchase was made.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Check if the purchase is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if the purchase is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the purchase is failed.
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Check if the purchase is refunded.
     */
    public function isRefunded(): bool
    {
        return $this->status === 'refunded';
    }

    /**
     * Check if the purchase is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Check if the purchase is active.
     */
    public function isActive(): bool
    {
        return $this->isCompleted() && !$this->isExpired();
    }

    /**
     * Check if the purchase has usage limit.
     */
    public function hasUsageLimit(): bool
    {
        return $this->usage_limit > 0;
    }

    /**
     * Check if the purchase has reached usage limit.
     */
    public function hasReachedUsageLimit(): bool
    {
        return $this->hasUsageLimit() && $this->usage_count >= $this->usage_limit;
    }

    /**
     * Check if the purchase can be used.
     */
    public function canBeUsed(): bool
    {
        return $this->isActive() && !$this->hasReachedUsageLimit();
    }

    /**
     * Increment usage count.
     */
    public function incrementUsageCount(): void
    {
        $this->increment('usage_count');
    }

    /**
     * Increment download count.
     */
    public function incrementDownloadCount(): void
    {
        $this->increment('download_count');
    }

    /**
     * Get the purchase type display name.
     */
    public function getPurchaseTypeDisplayName(): string
    {
        return match($this->purchase_type) {
            'template' => 'Template',
            'collection' => 'Collection',
            'bundle' => 'Bundle',
            default => ucfirst($this->purchase_type),
        };
    }

    /**
     * Get the license type display name.
     */
    public function getLicenseTypeDisplayName(): string
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
     * Scope for completed purchases.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for active purchases.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'completed')
                    ->where(function ($query) {
                        $query->whereNull('expires_at')
                              ->orWhere('expires_at', '>', now());
                    });
    }

    /**
     * Scope for template purchases.
     */
    public function scopeTemplates($query)
    {
        return $query->where('purchase_type', 'template');
    }

    /**
     * Scope for collection purchases.
     */
    public function scopeCollections($query)
    {
        return $query->where('purchase_type', 'collection');
    }
}