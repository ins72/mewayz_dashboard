<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class EmailAudience extends Model
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
        'name',
        'description',
        'criteria',
        'subscriber_count',
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
            'criteria' => 'array',
            'subscriber_count' => 'integer',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($audience) {
            if (empty($audience->id)) {
                $audience->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the workspace that owns the audience.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the user who created the audience.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Update subscriber count.
     */
    public function updateSubscriberCount(): void
    {
        // Logic to count subscribers based on criteria
        // This would depend on your subscriber model and criteria structure
        $this->update(['subscriber_count' => 0]); // Placeholder
    }
}