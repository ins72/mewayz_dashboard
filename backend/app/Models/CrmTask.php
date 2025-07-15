<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'workspace_id',
        'contact_id',
        'deal_id',
        'title',
        'description',
        'type',
        'priority',
        'status',
        'due_date',
        'completed_at',
        'created_by',
        'assigned_to',
        'custom_fields',
    ];

    protected $casts = [
        'id' => 'string',
        'workspace_id' => 'string',
        'contact_id' => 'string',
        'deal_id' => 'string',
        'due_date' => 'datetime',
        'completed_at' => 'datetime',
        'created_by' => 'string',
        'assigned_to' => 'string',
        'custom_fields' => 'array',
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

    public function deal(): BelongsTo
    {
        return $this->belongsTo(CrmDeal::class, 'deal_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())->where('status', 'pending');
    }

    public function scopeHighPriority($query)
    {
        return $query->where('priority', 'high');
    }

    public function markAsCompleted()
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    public function getIsOverdueAttribute()
    {
        return $this->due_date < now() && $this->status === 'pending';
    }
}