<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SocialMediaSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'workspace_id',
        'content_id',
        'post_content',
        'platforms',
        'scheduled_at',
        'status',
        'engagement_forecast',
        'actual_engagement',
        'media_urls',
        'hashtags',
        'mentions',
        'campaign_id',
        'created_by',
    ];

    protected $casts = [
        'id' => 'string',
        'workspace_id' => 'string',
        'content_id' => 'string',
        'platforms' => 'array',
        'scheduled_at' => 'datetime',
        'engagement_forecast' => 'integer',
        'actual_engagement' => 'integer',
        'media_urls' => 'array',
        'hashtags' => 'array',
        'mentions' => 'array',
        'campaign_id' => 'string',
        'created_by' => 'string',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function content(): BelongsTo
    {
        return $this->belongsTo(MarketingContent::class, 'content_id');
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(EmailCampaign::class, 'campaign_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeByPlatform($query, $platform)
    {
        return $query->whereJsonContains('platforms', $platform);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('scheduled_at', '>', now())
                    ->where('status', 'scheduled');
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('scheduled_at', [$startDate, $endDate]);
    }

    public function publish()
    {
        $this->update(['status' => 'published']);
    }

    public function cancel()
    {
        $this->update(['status' => 'cancelled']);
    }

    public function reschedule($newDateTime)
    {
        $this->update([
            'scheduled_at' => $newDateTime,
            'status' => 'scheduled'
        ]);
    }

    public function updateEngagement($engagement)
    {
        $this->update(['actual_engagement' => $engagement]);
    }

    public function getEngagementAccuracyAttribute()
    {
        if ($this->engagement_forecast > 0) {
            return ($this->actual_engagement / $this->engagement_forecast) * 100;
        }
        return 0;
    }

    public function getFormattedPlatformsAttribute()
    {
        return implode(', ', $this->platforms);
    }

    public function getIsUpcomingAttribute()
    {
        return $this->scheduled_at > now() && $this->status === 'scheduled';
    }
}