<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use Carbon\Carbon;

class Subscription extends Model
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
        'user_id',
        'workspace_id',
        'package_id',
        'stripe_subscription_id',
        'stripe_customer_id',
        'status',
        'current_period_start',
        'current_period_end',
        'cancelled_at',
        'trial_ends_at',
        'amount',
        'currency',
        'quantity',
        'metadata',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'id' => 'string',
            'user_id' => 'string',
            'workspace_id' => 'string',
            'amount' => 'decimal:2',
            'quantity' => 'integer',
            'metadata' => 'array',
            'current_period_start' => 'datetime',
            'current_period_end' => 'datetime',
            'cancelled_at' => 'datetime',
            'trial_ends_at' => 'datetime',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($subscription) {
            if (empty($subscription->id)) {
                $subscription->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the user that owns the subscription.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the workspace that owns the subscription.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Check if the subscription is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active' && $this->current_period_end > now();
    }

    /**
     * Check if the subscription is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if the subscription is past due.
     */
    public function isPastDue(): bool
    {
        return $this->status === 'past_due';
    }

    /**
     * Check if the subscription is on trial.
     */
    public function isOnTrial(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at > now();
    }

    /**
     * Check if the subscription has expired.
     */
    public function hasExpired(): bool
    {
        return $this->current_period_end < now();
    }

    /**
     * Get the remaining days in the current period.
     */
    public function getRemainingDays(): int
    {
        return max(0, now()->diffInDays($this->current_period_end, false));
    }

    /**
     * Get the formatted amount.
     */
    public function getFormattedAmount(): string
    {
        return strtoupper($this->currency) . ' ' . number_format($this->amount, 2);
    }

    /**
     * Get the package details.
     */
    public function getPackageDetails(): array
    {
        $packages = [
            'basic' => [
                'name' => 'Basic Plan',
                'features' => ['5 Workspaces', 'Basic Support', 'Social Media Tools'],
                'limits' => ['max_workspaces' => 5, 'max_team_members' => 10]
            ],
            'professional' => [
                'name' => 'Professional Plan',
                'features' => ['15 Workspaces', 'Priority Support', 'Advanced Analytics', 'CRM Tools'],
                'limits' => ['max_workspaces' => 15, 'max_team_members' => 50]
            ],
            'enterprise' => [
                'name' => 'Enterprise Plan',
                'features' => ['Unlimited Workspaces', '24/7 Support', 'Custom Integrations', 'API Access'],
                'limits' => ['max_workspaces' => -1, 'max_team_members' => -1]
            ]
        ];

        return $packages[$this->package_id] ?? [];
    }

    /**
     * Cancel the subscription.
     */
    public function cancel(): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now()
        ]);
    }

    /**
     * Renew the subscription.
     */
    public function renew(): void
    {
        $this->update([
            'status' => 'active',
            'current_period_start' => now(),
            'current_period_end' => now()->addMonth(),
            'cancelled_at' => null
        ]);
    }

    /**
     * Scope for active subscriptions.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
                    ->where('current_period_end', '>', now());
    }

    /**
     * Scope for expired subscriptions.
     */
    public function scopeExpired($query)
    {
        return $query->where('current_period_end', '<', now());
    }

    /**
     * Scope for cancelled subscriptions.
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    /**
     * Scope for trial subscriptions.
     */
    public function scopeOnTrial($query)
    {
        return $query->whereNotNull('trial_ends_at')
                    ->where('trial_ends_at', '>', now());
    }

    /**
     * Get billing information
     */
    public function getBillingInfo()
    {
        return [
            'plan' => $this->package_id,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'billing_cycle' => $this->metadata['billing_cycle'] ?? 'monthly',
            'feature_count' => $this->quantity,
            'next_billing_date' => $this->current_period_end,
            'is_active' => $this->isActive()
        ];
    }
}