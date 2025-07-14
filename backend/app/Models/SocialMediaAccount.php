<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class SocialMediaAccount extends Model
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
        'platform',
        'account_id',
        'username',
        'display_name',
        'profile_picture',
        'access_tokens',
        'status',
        'connected_at',
        'last_sync_at',
        'account_info',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'id' => 'string',
            'workspace_id' => 'string',
            'access_tokens' => 'array',
            'account_info' => 'array',
            'connected_at' => 'datetime',
            'last_sync_at' => 'datetime',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($account) {
            if (empty($account->id)) {
                $account->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the workspace that owns the social media account.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the social media posts for this account.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(SocialMediaPost::class);
    }

    /**
     * Check if the account is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if the account tokens are expired.
     */
    public function isExpired(): bool
    {
        return $this->status === 'expired';
    }

    /**
     * Get the platform display name.
     */
    public function getPlatformDisplayName(): string
    {
        return match($this->platform) {
            'instagram' => 'Instagram',
            'facebook' => 'Facebook',
            'twitter' => 'Twitter',
            'linkedin' => 'LinkedIn',
            'tiktok' => 'TikTok',
            'youtube' => 'YouTube',
            default => ucfirst($this->platform),
        };
    }
}