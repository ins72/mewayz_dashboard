<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class EmailCampaign extends Model
{
    /**
     * Indicates if the IDs are auto-incrementing.
     */
    public $incrementing = false;

    /**
     * The "type" of the auto-incrementing ID.
     */
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'id',
        'workspace_id',
        'subject',
        'sender',
        'template',
        'audience',
        'content',
        'status',
        'schedule_at',
        'sent_at',
        'sent_count',
        'delivered_count',
        'opened_count',
        'clicked_count',
        'bounce_count',
        'open_rate',
        'click_rate',
        'bounce_rate',
        'created_by',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'id' => 'string',
            'workspace_id' => 'string',
            'created_by' => 'string',
            'schedule_at' => 'datetime',
            'sent_at' => 'datetime',
            'sent_count' => 'integer',
            'delivered_count' => 'integer',
            'opened_count' => 'integer',
            'clicked_count' => 'integer',
            'bounce_count' => 'integer',
            'open_rate' => 'decimal:2',
            'click_rate' => 'decimal:2',
            'bounce_rate' => 'decimal:2',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($campaign) {
            if (empty($campaign->id)) {
                $campaign->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the workspace that owns the campaign.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the user who created the campaign.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check if the campaign is sent.
     */
    public function isSent(): bool
    {
        return $this->status === 'sent';
    }

    /**
     * Check if the campaign is scheduled.
     */
    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    /**
     * Check if the campaign is draft.
     */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Get the formatted send date.
     */
    public function getFormattedSentDate(): string
    {
        return $this->sent_at ? $this->sent_at->format('M d, Y H:i') : 'Not sent';
    }

    /**
     * Scope for sent campaigns.
     */
    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    /**
     * Scope for scheduled campaigns.
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    /**
     * Scope for draft campaigns.
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }
}