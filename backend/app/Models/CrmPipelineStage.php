<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmPipelineStage extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'workspace_id',
        'name',
        'description',
        'order',
        'color',
        'is_active',
        'is_closing_stage',
        'probability',
    ];

    protected $casts = [
        'id' => 'string',
        'workspace_id' => 'string',
        'order' => 'integer',
        'is_active' => 'boolean',
        'is_closing_stage' => 'boolean',
        'probability' => 'integer',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function deals(): HasMany
    {
        return $this->hasMany(CrmDeal::class, 'pipeline_stage_id');
    }

    public function getDealsCountAttribute()
    {
        return $this->deals()->count();
    }

    public function getTotalValueAttribute()
    {
        return $this->deals()->sum('value');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }
}