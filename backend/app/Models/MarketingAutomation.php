<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MarketingAutomation extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'workspace_id',
        'name',
        'description',
        'trigger',
        'trigger_conditions',
        'steps',
        'status',
        'active_contacts',
        'conversion_rate',
        'total_runs',
        'last_run_at',
        'created_by',
    ];

    protected $casts = [
        'id' => 'string',
        'workspace_id' => 'string',
        'trigger_conditions' => 'array',
        'steps' => 'array',
        'conversion_rate' => 'decimal:2',
        'total_runs' => 'integer',
        'last_run_at' => 'datetime',
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

    public function runs(): HasMany
    {
        return $this->hasMany(MarketingAutomationRun::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByTrigger($query, $trigger)
    {
        return $query->where('trigger', $trigger);
    }

    public function incrementRuns()
    {
        $this->increment('total_runs');
        $this->update(['last_run_at' => now()]);
    }

    public function updateConversionRate($rate)
    {
        $this->update(['conversion_rate' => $rate]);
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
}