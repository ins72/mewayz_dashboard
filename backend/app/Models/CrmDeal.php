<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmDeal extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'workspace_id',
        'contact_id',
        'pipeline_stage_id',
        'title',
        'description',
        'value',
        'probability',
        'expected_close_date',
        'actual_close_date',
        'status',
        'source',
        'custom_fields',
        'created_by',
        'assigned_to',
    ];

    protected $casts = [
        'id' => 'string',
        'workspace_id' => 'string',
        'contact_id' => 'string',
        'pipeline_stage_id' => 'string',
        'value' => 'decimal:2',
        'probability' => 'integer',
        'expected_close_date' => 'date',
        'actual_close_date' => 'date',
        'custom_fields' => 'array',
        'created_by' => 'string',
        'assigned_to' => 'string',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(CrmContact::class, 'contact_id');
    }

    public function pipelineStage(): BelongsTo
    {
        return $this->belongsTo(CrmPipelineStage::class, 'pipeline_stage_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(CrmTask::class, 'deal_id');
    }

    public function communications(): HasMany
    {
        return $this->hasMany(CrmCommunication::class, 'deal_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeWon($query)
    {
        return $query->where('status', 'won');
    }

    public function scopeLost($query)
    {
        return $query->where('status', 'lost');
    }

    public function getWeightedValueAttribute()
    {
        return $this->value * ($this->probability / 100);
    }
}