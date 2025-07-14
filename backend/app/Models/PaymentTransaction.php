<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class PaymentTransaction extends Model
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
        'amount',
        'currency',
        'session_id',
        'stripe_payment_intent_id',
        'payment_status',
        'payment_method',
        'metadata',
        'processed_at',
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
            'metadata' => 'array',
            'processed_at' => 'datetime',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($transaction) {
            if (empty($transaction->id)) {
                $transaction->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the user that owns the transaction.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the workspace that owns the transaction.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Check if the transaction is successful.
     */
    public function isSuccessful(): bool
    {
        return $this->payment_status === 'paid';
    }

    /**
     * Check if the transaction is pending.
     */
    public function isPending(): bool
    {
        return $this->payment_status === 'pending';
    }

    /**
     * Check if the transaction has failed.
     */
    public function hasFailed(): bool
    {
        return in_array($this->payment_status, ['failed', 'expired', 'cancelled']);
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
                'features' => ['5 Workspaces', 'Basic Support', 'Social Media Tools']
            ],
            'professional' => [
                'name' => 'Professional Plan',
                'features' => ['15 Workspaces', 'Priority Support', 'Advanced Analytics', 'CRM Tools']
            ],
            'enterprise' => [
                'name' => 'Enterprise Plan',
                'features' => ['Unlimited Workspaces', '24/7 Support', 'Custom Integrations', 'API Access']
            ]
        ];

        return $packages[$this->package_id] ?? [];
    }

    /**
     * Mark transaction as processed.
     */
    public function markAsProcessed(): void
    {
        $this->update([
            'payment_status' => 'paid',
            'processed_at' => now()
        ]);
    }

    /**
     * Scope for successful transactions.
     */
    public function scopeSuccessful($query)
    {
        return $query->where('payment_status', 'paid');
    }

    /**
     * Scope for pending transactions.
     */
    public function scopePending($query)
    {
        return $query->where('payment_status', 'pending');
    }

    /**
     * Scope for failed transactions.
     */
    public function scopeFailed($query)
    {
        return $query->whereIn('payment_status', ['failed', 'expired', 'cancelled']);
    }
}