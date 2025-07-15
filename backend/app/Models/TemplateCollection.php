<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class TemplateCollection extends Model
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
        'creator_id',
        'title',
        'description',
        'cover_image',
        'price',
        'discount_percentage',
        'is_featured',
        'is_active',
        'tags',
        'template_count',
        'purchase_count',
        'rating_average',
        'rating_count',
        'created_by',
        'metadata',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'id' => 'string',
            'creator_id' => 'string',
            'created_by' => 'string',
            'price' => 'decimal:2',
            'discount_percentage' => 'decimal:2',
            'rating_average' => 'decimal:2',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'tags' => 'array',
            'metadata' => 'array',
            'template_count' => 'integer',
            'purchase_count' => 'integer',
            'rating_count' => 'integer',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($collection) {
            if (empty($collection->id)) {
                $collection->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the creator of the collection.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    /**
     * Get the user who created this collection.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the templates in this collection.
     */
    public function templates(): BelongsToMany
    {
        return $this->belongsToMany(Template::class, 'template_collection_items')
                    ->withPivot('sort_order')
                    ->withTimestamps()
                    ->orderBy('pivot_sort_order');
    }

    /**
     * Check if the collection is active.
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Check if the collection is featured.
     */
    public function isFeatured(): bool
    {
        return $this->is_featured;
    }

    /**
     * Get the discounted price.
     */
    public function getDiscountedPrice(): float
    {
        if ($this->discount_percentage > 0) {
            return $this->price * (1 - ($this->discount_percentage / 100));
        }
        return $this->price;
    }

    /**
     * Get the total original price of templates.
     */
    public function getOriginalTemplatePrice(): float
    {
        return $this->templates()->sum('price');
    }

    /**
     * Get the savings amount.
     */
    public function getSavingsAmount(): float
    {
        return $this->getOriginalTemplatePrice() - $this->getDiscountedPrice();
    }

    /**
     * Get the savings percentage.
     */
    public function getSavingsPercentage(): float
    {
        $originalPrice = $this->getOriginalTemplatePrice();
        if ($originalPrice > 0) {
            return (($originalPrice - $this->getDiscountedPrice()) / $originalPrice) * 100;
        }
        return 0;
    }

    /**
     * Update template count.
     */
    public function updateTemplateCount(): void
    {
        $this->update([
            'template_count' => $this->templates()->count()
        ]);
    }

    /**
     * Update rating average.
     */
    public function updateRatingAverage(): void
    {
        // This would typically be calculated from collection reviews
        // For now, we'll use the average of template ratings
        $avgRating = $this->templates()->avg('rating_average');
        $ratingCount = $this->templates()->sum('rating_count');
        
        $this->update([
            'rating_average' => $avgRating ? round($avgRating, 2) : 0,
            'rating_count' => $ratingCount
        ]);
    }

    /**
     * Scope for active collections.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for featured collections.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope for popular collections.
     */
    public function scopePopular($query)
    {
        return $query->orderBy('purchase_count', 'desc')
                    ->orderBy('rating_average', 'desc');
    }
}