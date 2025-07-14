<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class LinkInBioPage extends Model
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
        'title',
        'slug',
        'description',
        'profile_image',
        'background_image',
        'theme_settings',
        'links',
        'is_active',
        'custom_domain',
        'total_views',
        'total_clicks',
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
            'theme_settings' => 'array',
            'links' => 'array',
            'is_active' => 'boolean',
            'total_views' => 'integer',
            'total_clicks' => 'integer',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($page) {
            if (empty($page->id)) {
                $page->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the workspace that owns the page.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the user who created this page.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the full URL for the page.
     */
    public function getFullUrlAttribute(): string
    {
        if ($this->custom_domain) {
            return "https://{$this->custom_domain}";
        }
        
        return url("/link-in-bio/{$this->slug}");
    }

    /**
     * Get the public URL for the page.
     */
    public function getPublicUrl(): string
    {
        return $this->getFullUrlAttribute();
    }

    /**
     * Check if the page is active.
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Get the click-through rate.
     */
    public function getClickThroughRate(): float
    {
        return $this->total_views > 0 ? round(($this->total_clicks / $this->total_views) * 100, 2) : 0;
    }

    /**
     * Increment the view count.
     */
    public function incrementViews(): void
    {
        $this->increment('total_views');
    }

    /**
     * Increment the click count.
     */
    public function incrementClicks(): void
    {
        $this->increment('total_clicks');
    }

    /**
     * Get the theme settings with defaults.
     */
    public function getThemeWithDefaults(): array
    {
        $defaults = [
            'background_color' => '#ffffff',
            'text_color' => '#333333',
            'link_color' => '#007bff',
            'button_style' => 'rounded',
            'font_family' => 'Inter',
            'profile_image_style' => 'circle',
        ];

        return array_merge($defaults, $this->theme_settings ?? []);
    }

    /**
     * Get active links only.
     */
    public function getActiveLinks(): array
    {
        if (!$this->links || !is_array($this->links)) {
            return [];
        }

        return array_filter($this->links, function ($link) {
            return isset($link['is_active']) ? $link['is_active'] : true;
        });
    }

    /**
     * Get formatted links for display.
     */
    public function getFormattedLinks(): array
    {
        $links = $this->getActiveLinks();
        
        return array_map(function ($link) {
            return [
                'id' => $link['id'] ?? Str::uuid(),
                'title' => $link['title'] ?? '',
                'url' => $link['url'] ?? '',
                'description' => $link['description'] ?? '',
                'icon' => $link['icon'] ?? null,
                'is_active' => $link['is_active'] ?? true,
                'click_count' => $link['click_count'] ?? 0,
                'order' => $link['order'] ?? 0,
            ];
        }, $links);
    }
}