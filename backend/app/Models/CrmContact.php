<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class CrmContact extends Model
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
        'first_name',
        'last_name',
        'email',
        'phone',
        'company',
        'job_title',
        'notes',
        'tags',
        'status',
        'lead_score',
        'last_contacted_at',
        'custom_fields',
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
            'tags' => 'array',
            'custom_fields' => 'array',
            'lead_score' => 'integer',
            'last_contacted_at' => 'datetime',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($contact) {
            if (empty($contact->id)) {
                $contact->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the workspace that owns the contact.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the user who created this contact.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the contact's full name.
     */
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    /**
     * Get the contact's display name (full name or company).
     */
    public function getDisplayNameAttribute(): string
    {
        $fullName = $this->getFullNameAttribute();
        return $fullName ?: $this->company ?: $this->email;
    }

    /**
     * Check if the contact is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if the contact is blocked.
     */
    public function isBlocked(): bool
    {
        return $this->status === 'blocked';
    }

    /**
     * Get lead score category.
     */
    public function getLeadScoreCategory(): string
    {
        return match (true) {
            $this->lead_score >= 80 => 'hot',
            $this->lead_score >= 60 => 'warm',
            $this->lead_score >= 40 => 'cold',
            default => 'unqualified'
        };
    }

    /**
     * Get lead score color for UI.
     */
    public function getLeadScoreColor(): string
    {
        return match ($this->getLeadScoreCategory()) {
            'hot' => 'red',
            'warm' => 'orange',
            'cold' => 'blue',
            default => 'gray'
        };
    }

    /**
     * Update the last contacted timestamp.
     */
    public function markAsContacted(): void
    {
        $this->update(['last_contacted_at' => now()]);
    }

    /**
     * Increment lead score.
     */
    public function incrementLeadScore(int $points = 1): void
    {
        $this->increment('lead_score', $points);
    }

    /**
     * Decrement lead score.
     */
    public function decrementLeadScore(int $points = 1): void
    {
        $this->decrement('lead_score', $points);
    }

    /**
     * Get formatted tags.
     */
    public function getFormattedTags(): array
    {
        return $this->tags ?? [];
    }

    /**
     * Add a tag to the contact.
     */
    public function addTag(string $tag): void
    {
        $tags = $this->getFormattedTags();
        if (!in_array($tag, $tags)) {
            $tags[] = $tag;
            $this->update(['tags' => $tags]);
        }
    }

    /**
     * Remove a tag from the contact.
     */
    public function removeTag(string $tag): void
    {
        $tags = $this->getFormattedTags();
        $tags = array_filter($tags, fn($t) => $t !== $tag);
        $this->update(['tags' => array_values($tags)]);
    }

    /**
     * Get days since last contact.
     */
    public function getDaysSinceLastContact(): ?int
    {
        return $this->last_contacted_at ? $this->last_contacted_at->diffInDays(now()) : null;
    }

    /**
     * Check if contact needs follow-up (not contacted in 30 days).
     */
    public function needsFollowUp(): bool
    {
        $daysSinceContact = $this->getDaysSinceLastContact();
        return $daysSinceContact === null || $daysSinceContact >= 30;
    }
}