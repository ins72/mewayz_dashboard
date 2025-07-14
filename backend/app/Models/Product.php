<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Product extends Model
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
        'name',
        'slug',
        'description',
        'images',
        'price',
        'compare_price',
        'currency',
        'sku',
        'stock_quantity',
        'track_inventory',
        'status',
        'type',
        'categories',
        'tags',
        'weight',
        'dimensions',
        'requires_shipping',
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
            'created_by' => 'string',
            'images' => 'array',
            'price' => 'decimal:2',
            'compare_price' => 'decimal:2',
            'weight' => 'decimal:2',
            'dimensions' => 'array',
            'stock_quantity' => 'integer',
            'track_inventory' => 'boolean',
            'requires_shipping' => 'boolean',
            'categories' => 'array',
            'tags' => 'array',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($product) {
            if (empty($product->id)) {
                $product->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the workspace that owns the product.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the user who created this product.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check if the product is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if the product is draft.
     */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Check if the product is archived.
     */
    public function isArchived(): bool
    {
        return $this->status === 'archived';
    }

    /**
     * Get the product type display name.
     */
    public function getTypeDisplayName(): string
    {
        return match($this->type) {
            'physical' => 'Physical Product',
            'digital' => 'Digital Product',
            'service' => 'Service',
            default => ucfirst($this->type),
        };
    }

    /**
     * Get the product type icon.
     */
    public function getTypeIcon(): string
    {
        return match($this->type) {
            'physical' => 'package',
            'digital' => 'download',
            'service' => 'settings',
            default => 'box',
        };
    }

    /**
     * Get the product price display.
     */
    public function getPriceDisplay(): string
    {
        return "{$this->currency} {$this->price}";
    }

    /**
     * Get the product compare price display.
     */
    public function getComparePriceDisplay(): ?string
    {
        return $this->compare_price ? "{$this->currency} {$this->compare_price}" : null;
    }

    /**
     * Get the discount percentage.
     */
    public function getDiscountPercentage(): ?float
    {
        if (!$this->compare_price || $this->compare_price <= $this->price) {
            return null;
        }

        return round((($this->compare_price - $this->price) / $this->compare_price) * 100, 2);
    }

    /**
     * Check if the product is on sale.
     */
    public function isOnSale(): bool
    {
        return $this->compare_price && $this->compare_price > $this->price;
    }

    /**
     * Check if the product is in stock.
     */
    public function isInStock(): bool
    {
        if (!$this->track_inventory) {
            return true;
        }

        return $this->stock_quantity > 0;
    }

    /**
     * Check if the product is out of stock.
     */
    public function isOutOfStock(): bool
    {
        return !$this->isInStock();
    }

    /**
     * Get the stock status display.
     */
    public function getStockStatusDisplay(): string
    {
        if (!$this->track_inventory) {
            return 'Always in stock';
        }

        if ($this->stock_quantity > 10) {
            return 'In stock';
        } elseif ($this->stock_quantity > 0) {
            return 'Low stock';
        } else {
            return 'Out of stock';
        }
    }

    /**
     * Get the stock status color.
     */
    public function getStockStatusColor(): string
    {
        if (!$this->track_inventory) {
            return 'blue';
        }

        if ($this->stock_quantity > 10) {
            return 'green';
        } elseif ($this->stock_quantity > 0) {
            return 'orange';
        } else {
            return 'red';
        }
    }

    /**
     * Get formatted categories.
     */
    public function getFormattedCategories(): array
    {
        return $this->categories ?? [];
    }

    /**
     * Get formatted tags.
     */
    public function getFormattedTags(): array
    {
        return $this->tags ?? [];
    }

    /**
     * Get formatted images.
     */
    public function getFormattedImages(): array
    {
        return $this->images ?? [];
    }

    /**
     * Get the primary image.
     */
    public function getPrimaryImage(): ?string
    {
        $images = $this->getFormattedImages();
        return $images[0] ?? null;
    }

    /**
     * Get formatted dimensions.
     */
    public function getFormattedDimensions(): array
    {
        $defaults = [
            'length' => null,
            'width' => null,
            'height' => null,
            'unit' => 'cm',
        ];

        return array_merge($defaults, $this->dimensions ?? []);
    }

    /**
     * Get dimensions display.
     */
    public function getDimensionsDisplay(): ?string
    {
        $dimensions = $this->getFormattedDimensions();
        
        if (!$dimensions['length'] && !$dimensions['width'] && !$dimensions['height']) {
            return null;
        }

        $parts = [];
        if ($dimensions['length']) $parts[] = $dimensions['length'];
        if ($dimensions['width']) $parts[] = $dimensions['width'];
        if ($dimensions['height']) $parts[] = $dimensions['height'];

        return implode(' × ', $parts) . ' ' . $dimensions['unit'];
    }

    /**
     * Get weight display.
     */
    public function getWeightDisplay(): ?string
    {
        return $this->weight ? "{$this->weight} kg" : null;
    }

    /**
     * Update stock quantity.
     */
    public function updateStock(int $quantity): void
    {
        if ($this->track_inventory) {
            $this->update(['stock_quantity' => max(0, $this->stock_quantity + $quantity)]);
        }
    }

    /**
     * Reduce stock quantity.
     */
    public function reduceStock(int $quantity): bool
    {
        if (!$this->track_inventory) {
            return true;
        }

        if ($this->stock_quantity < $quantity) {
            return false;
        }

        $this->update(['stock_quantity' => $this->stock_quantity - $quantity]);
        return true;
    }

    /**
     * Increase stock quantity.
     */
    public function increaseStock(int $quantity): void
    {
        if ($this->track_inventory) {
            $this->update(['stock_quantity' => $this->stock_quantity + $quantity]);
        }
    }

    /**
     * Get the product URL.
     */
    public function getUrl(): string
    {
        return url("/products/{$this->slug}");
    }

    /**
     * Get the product public URL.
     */
    public function getPublicUrl(): string
    {
        return $this->getUrl();
    }

    /**
     * Add a category to the product.
     */
    public function addCategory(string $category): void
    {
        $categories = $this->getFormattedCategories();
        if (!in_array($category, $categories)) {
            $categories[] = $category;
            $this->update(['categories' => $categories]);
        }
    }

    /**
     * Remove a category from the product.
     */
    public function removeCategory(string $category): void
    {
        $categories = $this->getFormattedCategories();
        $categories = array_filter($categories, fn($c) => $c !== $category);
        $this->update(['categories' => array_values($categories)]);
    }

    /**
     * Add a tag to the product.
     */
    public function addTag(string $tag): void
    {
        $tags = $this->getFormattedTags();
        if (!in_array($tag, $tags)) {
            $tags[] = $tag;
            $this->update(['tags' => $tags]);
        }
    }

    /**
     * Remove a tag from the product.
     */
    public function removeTag(string $tag): void
    {
        $tags = $this->getFormattedTags();
        $tags = array_filter($tags, fn($t) => $t !== $tag);
        $this->update(['tags' => array_values($tags)]);
    }
}