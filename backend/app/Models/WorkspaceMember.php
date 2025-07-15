<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class WorkspaceMember extends Model
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
        'user_id',
        'role_id',
        'status',
        'permissions',
        'invited_by',
        'invited_at',
        'joined_at',
        'last_activity_at',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'id' => 'string',
            'workspace_id' => 'string',
            'user_id' => 'string',
            'role_id' => 'string',
            'invited_by' => 'string',
            'permissions' => 'array',
            'invited_at' => 'datetime',
            'joined_at' => 'datetime',
            'last_activity_at' => 'datetime',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($member) {
            if (empty($member->id)) {
                $member->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the workspace that owns the member.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the user that owns the member.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the role associated with the member.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(TeamRole::class, 'role_id');
    }

    /**
     * Get the user who invited this member.
     */
    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }
}
