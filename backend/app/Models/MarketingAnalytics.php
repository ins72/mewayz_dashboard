<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MarketingAnalytics extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'workspace_id',
        'metric_type',
        'metric_name',
        'metric_value',
        'metric_data',
        'channel',
        'campaign_id',
        'content_id',
        'date_recorded',
        'created_by',
    ];

    protected $casts = [
        'id' => 'string',
        'workspace_id' => 'string',
        'metric_value' => 'decimal:2',
        'metric_data' => 'array',
        'campaign_id' => 'string',
        'content_id' => 'string',
        'date_recorded' => 'date',
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

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(EmailCampaign::class, 'campaign_id');
    }

    public function content(): BelongsTo
    {
        return $this->belongsTo(MarketingContent::class, 'content_id');
    }

    public function scopeByMetricType($query, $type)
    {
        return $query->where('metric_type', $type);
    }

    public function scopeByChannel($query, $channel)
    {
        return $query->where('channel', $channel);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date_recorded', [$startDate, $endDate]);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('date_recorded', '>=', now()->subDays($days));
    }

    public function getFormattedValueAttribute()
    {
        switch ($this->metric_type) {
            case 'percentage':
                return number_format($this->metric_value, 2) . '%';
            case 'currency':
                return '$' . number_format($this->metric_value, 2);
            case 'count':
                return number_format($this->metric_value);
            default:
                return $this->metric_value;
        }
    }
}