<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InvitationBatch extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'workspace_id',
        'created_by',
        'name',
        'total_invitations',
        'successful_invitations',
        'failed_invitations',
        'status',
        'batch_data',
        'completed_at'
    ];

    protected $casts = [
        'batch_data' => 'array',
        'completed_at' => 'datetime'
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(WorkspaceInvitation::class, 'batch_id');
    }

    public function markAsCompleted(): void
    {
        $this->update([
            'status' => $this->failed_invitations === 0 ? 'completed' : 'completed_with_errors',
            'completed_at' => now()
        ]);
    }

    public function markAsFailed(): void
    {
        $this->update([
            'status' => 'failed',
            'completed_at' => now()
        ]);
    }

    public function incrementSuccessful(): void
    {
        $this->increment('successful_invitations');
    }

    public function incrementFailed(): void
    {
        $this->increment('failed_invitations');
    }

    public function getSuccessRate(): float
    {
        if ($this->total_invitations === 0) {
            return 0;
        }
        
        return ($this->successful_invitations / $this->total_invitations) * 100;
    }

    public function isCompleted(): bool
    {
        return in_array($this->status, ['completed', 'completed_with_errors', 'failed']);
    }

    public function scopeByWorkspace($query, $workspaceId)
    {
        return $query->where('workspace_id', $workspaceId);
    }

    public function scopeCompleted($query)
    {
        return $query->whereIn('status', ['completed', 'completed_with_errors', 'failed']);
    }

    public function scopeProcessing($query)
    {
        return $query->where('status', 'processing');
    }
}