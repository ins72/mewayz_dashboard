<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmAutomationRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'workspace_id',
        'name',
        'description',
        'trigger',
        'conditions',
        'actions',
        'is_active',
        'run_count',
        'last_run_at',
        'created_by',
    ];

    protected $casts = [
        'id' => 'string',
        'workspace_id' => 'string',
        'conditions' => 'array',
        'actions' => 'array',
        'is_active' => 'boolean',
        'run_count' => 'integer',
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

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByTrigger($query, $trigger)
    {
        return $query->where('trigger', $trigger);
    }

    public function incrementRunCount()
    {
        $this->increment('run_count');
        $this->update(['last_run_at' => now()]);
    }

    public function activate()
    {
        $this->update(['is_active' => true]);
    }

    public function deactivate()
    {
        $this->update(['is_active' => false]);
    }

    public function evaluateConditions($data)
    {
        if (empty($this->conditions)) {
            return true;
        }

        foreach ($this->conditions as $condition) {
            $field = $condition['field'];
            $operator = $condition['operator'];
            $value = $condition['value'];
            
            $fieldValue = data_get($data, $field);
            
            $result = match ($operator) {
                'equals' => $fieldValue == $value,
                'not_equals' => $fieldValue != $value,
                'contains' => str_contains($fieldValue, $value),
                'greater_than' => $fieldValue > $value,
                'less_than' => $fieldValue < $value,
                'greater_than_or_equal' => $fieldValue >= $value,
                'less_than_or_equal' => $fieldValue <= $value,
                'is_empty' => empty($fieldValue),
                'is_not_empty' => !empty($fieldValue),
                default => false,
            };
            
            if (!$result) {
                return false;
            }
        }
        
        return true;
    }
}