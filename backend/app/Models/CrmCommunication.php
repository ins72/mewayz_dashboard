<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmCommunication extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'workspace_id',
        'contact_id',
        'deal_id',
        'type',
        'direction',
        'subject',
        'content',
        'summary',
        'duration',
        'outcome',
        'next_action',
        'created_by',
        'scheduled_at',
        'completed_at',
        'custom_fields',
    ];

    protected $casts = [
        'id' => 'string',
        'workspace_id' => 'string',
        'contact_id' => 'string',
        'deal_id' => 'string',
        'duration' => 'integer',
        'created_by' => 'string',
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
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

    public function scopeInbound($query)
    {
        return $query->where('direction', 'inbound');
    }

    public function scopeOutbound($query)
    {
        return $query->where('direction', 'outbound');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function getDurationFormattedAttribute()
    {
        if (!$this->duration) return null;
        
        $hours = floor($this->duration / 60);
        $minutes = $this->duration % 60;
        
        if ($hours > 0) {
            return "{$hours}h {$minutes}m";
        }
        
        return "{$minutes}m";
    }
}