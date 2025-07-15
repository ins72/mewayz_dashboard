<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeadMagnet extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'workspace_id',
        'title',
        'description',
        'type',
        'file_url',
        'landing_page_url',
        'thank_you_page_url',
        'status',
        'views',
        'conversions',
        'conversion_rate',
        'traffic_source',
        'email_template_id',
        'auto_tag',
        'lead_score_boost',
        'created_by',
    ];

    protected $casts = [
        'id' => 'string',
        'workspace_id' => 'string',
        'email_template_id' => 'string',
        'views' => 'integer',
        'conversions' => 'integer',
        'conversion_rate' => 'decimal:2',
        'auto_tag' => 'array',
        'lead_score_boost' => 'integer',
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

    public function emailTemplate(): BelongsTo
    {
        return $this->belongsTo(EmailTemplate::class);
    }

    public function conversions(): HasMany
    {
        return $this->hasMany(LeadMagnetConversion::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByTrafficSource($query, $source)
    {
        return $query->where('traffic_source', $source);
    }

    public function incrementViews()
    {
        $this->increment('views');
        $this->updateConversionRate();
    }

    public function incrementConversions()
    {
        $this->increment('conversions');
        $this->updateConversionRate();
    }

    public function updateConversionRate()
    {
        if ($this->views > 0) {
            $rate = ($this->conversions / $this->views) * 100;
            $this->update(['conversion_rate' => $rate]);
        }
    }

    public function activate()
    {
        $this->update(['status' => 'active']);
    }

    public function deactivate()
    {
        $this->update(['status' => 'inactive']);
    }

    public function pause()
    {
        $this->update(['status' => 'paused']);
    }

    public function getIsActiveAttribute()
    {
        return $this->status === 'active';
    }

    public function getFormattedConversionRateAttribute()
    {
        return number_format($this->conversion_rate, 2) . '%';
    }
}