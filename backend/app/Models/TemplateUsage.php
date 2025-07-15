<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class TemplateUsage extends Model
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
        'template_purchase_id',
        'user_id',
        'workspace_id',
        'usage_type',
        'usage_context',
        'project_name',
        'project_id',
        'customizations',
        'output_data',
        'usage_duration',
        'success_rate',
        'feedback_rating',
        'feedback_comment',
        'used_at',
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
            'template_purchase_id' => 'string',
            'user_id' => 'string',
            'workspace_id' => 'string',
            'project_id' => 'string',
            'customizations' => 'array',
            'output_data' => 'array',
            'usage_duration' => 'integer',
            'success_rate' => 'decimal:2',
            'feedback_rating' => 'integer',
            'used_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($usage) {
            if (empty($usage->id)) {
                $usage->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the template that was used.
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    /**
     * Get the template purchase associated with this usage.
     */
    public function templatePurchase(): BelongsTo
    {
        return $this->belongsTo(TemplatePurchase::class);
    }

    /**
     * Get the user who used the template.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the workspace where the template was used.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the usage type display name.
     */
    public function getUsageTypeDisplayName(): string
    {
        return match($this->usage_type) {
            'creation' => 'Template Creation',
            'customization' => 'Template Customization',
            'export' => 'Template Export',
            'preview' => 'Template Preview',
            'download' => 'Template Download',
            default => ucfirst($this->usage_type),
        };
    }

    /**
     * Get the usage context display name.
     */
    public function getUsageContextDisplayName(): string
    {
        return match($this->usage_context) {
            'email_campaign' => 'Email Campaign',
            'link_in_bio' => 'Link in Bio Page',
            'social_media_post' => 'Social Media Post',
            'course_content' => 'Course Content',
            'marketing_material' => 'Marketing Material',
            'landing_page' => 'Landing Page',
            default => ucfirst(str_replace('_', ' ', $this->usage_context)),
        };
    }

    /**
     * Get the duration in human readable format.
     */
    public function getDurationDisplay(): string
    {
        if (!$this->usage_duration) {
            return 'N/A';
        }

        $minutes = floor($this->usage_duration / 60);
        $seconds = $this->usage_duration % 60;

        if ($minutes > 0) {
            return $minutes . 'm ' . $seconds . 's';
        }

        return $seconds . 's';
    }

    /**
     * Get the success rate display.
     */
    public function getSuccessRateDisplay(): string
    {
        if (!$this->success_rate) {
            return 'N/A';
        }

        return number_format($this->success_rate, 1) . '%';
    }

    /**
     * Get the feedback rating display with stars.
     */
    public function getFeedbackRatingDisplay(): string
    {
        if (!$this->feedback_rating) {
            return 'No rating';
        }

        return str_repeat('★', $this->feedback_rating) . str_repeat('☆', 5 - $this->feedback_rating);
    }

    /**
     * Check if the usage was successful.
     */
    public function isSuccessful(): bool
    {
        return $this->success_rate && $this->success_rate >= 80;
    }

    /**
     * Check if the usage has feedback.
     */
    public function hasFeedback(): bool
    {
        return !empty($this->feedback_rating) || !empty($this->feedback_comment);
    }

    /**
     * Check if the usage has customizations.
     */
    public function hasCustomizations(): bool
    {
        return !empty($this->customizations);
    }

    /**
     * Scope for usage by type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('usage_type', $type);
    }

    /**
     * Scope for usage by context.
     */
    public function scopeByContext($query, string $context)
    {
        return $query->where('usage_context', $context);
    }

    /**
     * Scope for successful usage.
     */
    public function scopeSuccessful($query)
    {
        return $query->where('success_rate', '>=', 80);
    }

    /**
     * Scope for usage with feedback.
     */
    public function scopeWithFeedback($query)
    {
        return $query->where(function ($query) {
            $query->whereNotNull('feedback_rating')
                  ->orWhereNotNull('feedback_comment');
        });
    }

    /**
     * Scope for recent usage.
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('used_at', 'desc');
    }
}