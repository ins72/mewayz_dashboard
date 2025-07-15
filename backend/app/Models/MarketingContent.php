<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MarketingContent extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'workspace_id',
        'title',
        'description',
        'content_type',
        'format',
        'content_url',
        'content_data',
        'status',
        'views',
        'downloads',
        'engagement_score',
        'seo_keywords',
        'meta_description',
        'scheduled_at',
        'published_at',
        'created_by',
    ];

    protected $casts = [
        'id' => 'string',
        'workspace_id' => 'string',
        'content_data' => 'array',
        'views' => 'integer',
        'downloads' => 'integer',
        'engagement_score' => 'decimal:2',
        'seo_keywords' => 'array',
        'scheduled_at' => 'datetime',
        'published_at' => 'datetime',
        'created_by' => 'string',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function analytics(): HasMany
    {
        return $this->hasMany(ContentAnalytics::class);
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('content_type', $type);
    }

    public function scopeByFormat($query, $format)
    {
        return $query->where('format', $format);
    }

    public function incrementViews()
    {
        $this->increment('views');
    }

    public function incrementDownloads()
    {
        $this->increment('downloads');
    }

    public function updateEngagementScore($score)
    {
        $this->update(['engagement_score' => $score]);
    }

    public function publish()
    {
        $this->update([
            'status' => 'published',
            'published_at' => now()
        ]);
    }

    public function schedule($dateTime)
    {
        $this->update([
            'status' => 'scheduled',
            'scheduled_at' => $dateTime
        ]);
    }

    public function getIsPublishedAttribute()
    {
        return $this->status === 'published';
    }

    public function getIsScheduledAttribute()
    {
        return $this->status === 'scheduled';
    }
}