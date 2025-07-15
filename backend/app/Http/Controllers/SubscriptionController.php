<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\Workspace;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Stripe\Stripe;
use Stripe\Customer;
use Stripe\PaymentMethod;
use Stripe\Subscription as StripeSubscription;
use Stripe\Price;
use Stripe\Product;
use Stripe\Webhook;

class SubscriptionController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Get current subscription for user/workspace
     */
    public function getCurrentSubscription(Request $request)
    {
        $workspaceId = $request->get('workspace_id');
        
        if ($workspaceId) {
            $subscription = Subscription::where('workspace_id', $workspaceId)
                ->where('user_id', auth()->id())
                ->with('workspace')
                ->first();
        } else {
            $subscription = Subscription::where('user_id', auth()->id())
                ->with('workspace')
                ->first();
        }

        return response()->json([
            'success' => true,
            'subscription' => $subscription,
            'has_active_subscription' => $subscription && $subscription->isActive()
        ]);
    }

    /**
     * Get subscription plans with feature-based pricing
     */
    public function getSubscriptionPlans()
    {
        $plans = [
            [
                'id' => 'free',
                'name' => 'Free Plan',
                'description' => 'Perfect for getting started',
                'pricing_model' => 'fixed',
                'price_monthly' => 0,
                'price_yearly' => 0,
                'max_features' => 10,
                'features' => [
                    'Up to 10 features',
                    'Basic functionality',
                    'Community support',
                    'Mewayz branding on external content'
                ],
                'stripe_price_id_monthly' => null,
                'stripe_price_id_yearly' => null,
                'popular' => false
            ],
            [
                'id' => 'professional',
                'name' => 'Professional Plan',
                'description' => 'For growing businesses',
                'pricing_model' => 'feature_based',
                'price_monthly' => 1.00,
                'price_yearly' => 10.00,
                'max_features' => 50,
                'features' => [
                    '$1 per feature per month',
                    '$10 per feature per year',
                    'Advanced functionality',
                    'Priority support',
                    'Advanced analytics'
                ],
                'stripe_price_id_monthly' => env('STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID'),
                'stripe_price_id_yearly' => env('STRIPE_PROFESSIONAL_YEARLY_PRICE_ID'),
                'popular' => true
            ],
            [
                'id' => 'enterprise',
                'name' => 'Enterprise Plan',
                'description' => 'For large organizations',
                'pricing_model' => 'feature_based',
                'price_monthly' => 1.50,
                'price_yearly' => 15.00,
                'max_features' => 100,
                'features' => [
                    '$1.50 per feature per month',
                    '$15 per feature per year',
                    'White-label capabilities',
                    'Custom branding',
                    'Dedicated support',
                    'Advanced security'
                ],
                'stripe_price_id_monthly' => env('STRIPE_ENTERPRISE_MONTHLY_PRICE_ID'),
                'stripe_price_id_yearly' => env('STRIPE_ENTERPRISE_YEARLY_PRICE_ID'),
                'popular' => false
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $plans
        ]);
    }

    /**
     * Create Stripe checkout session for subscription
     */
    public function createCheckoutSession(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|in:free,professional,enterprise',
            'billing_cycle' => 'required|in:monthly,yearly',
            'feature_count' => 'required|integer|min:1',
            'workspace_id' => 'required|exists:workspaces,id',
            'success_url' => 'required|url',
            'cancel_url' => 'required|url'
        ]);

        $user = auth()->user();
        $workspace = Workspace::findOrFail($request->workspace_id);
        
        // Check if user has permission to manage workspace
        $member = $workspace->members()->where('user_id', $user->id)->first();
        $isOwner = $workspace->owner_id === $user->id;
        $isAdmin = $member && in_array($member->role, ['owner', 'admin']);
        
        if (!$isOwner && !$isAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions. Only workspace owners and admins can manage subscriptions.'
            ], 403);
        }

        // Free plan doesn't need payment
        if ($request->plan_id === 'free') {
            return $this->createFreeSubscription($request, $workspace);
        }

        try {
            // Create or get Stripe customer
            $customer = $this->createOrGetStripeCustomer($user);

            // Calculate amount based on features
            $amount = $this->calculateSubscriptionAmount($request->plan_id, $request->billing_cycle, $request->feature_count);

            // Create Stripe checkout session
            $session = \Stripe\Checkout\Session::create([
                'customer' => $customer->id,
                'payment_method_types' => ['card'],
                'mode' => 'subscription',
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => ucfirst($request->plan_id) . ' Plan - ' . $request->feature_count . ' Features',
                            'description' => 'Feature-based subscription for ' . $workspace->name
                        ],
                        'unit_amount' => $amount * 100, // Convert to cents
                        'recurring' => [
                            'interval' => $request->billing_cycle === 'yearly' ? 'year' : 'month'
                        ]
                    ],
                    'quantity' => 1
                ]],
                'metadata' => [
                    'user_id' => $user->id,
                    'workspace_id' => $workspace->id,
                    'plan_id' => $request->plan_id,
                    'billing_cycle' => $request->billing_cycle,
                    'feature_count' => $request->feature_count
                ],
                'success_url' => $request->success_url,
                'cancel_url' => $request->cancel_url
            ]);

            return response()->json([
                'success' => true,
                'checkout_url' => $session->url,
                'session_id' => $session->id
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create checkout session: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create free subscription
     */
    private function createFreeSubscription(Request $request, Workspace $workspace)
    {
        // Check feature limits for free plan
        if ($request->feature_count > 10) {
            return response()->json([
                'success' => false,
                'message' => 'Free plan is limited to 10 features'
            ], 400);
        }

        $subscription = Subscription::create([
            'id' => Str::uuid(),
            'user_id' => auth()->id(),
            'workspace_id' => $workspace->id,
            'package_id' => 'free',
            'status' => 'active',
            'current_period_start' => now(),
            'current_period_end' => now()->addYear(), // Free plan is yearly
            'amount' => 0,
            'currency' => 'usd',
            'quantity' => $request->feature_count,
            'metadata' => [
                'plan_id' => 'free',
                'feature_count' => $request->feature_count,
                'billing_cycle' => 'yearly'
            ]
        ]);

        return response()->json([
            'success' => true,
            'subscription' => $subscription,
            'message' => 'Free subscription created successfully'
        ]);
    }

    /**
     * Calculate subscription amount based on plan and features
     */
    private function calculateSubscriptionAmount($planId, $billingCycle, $featureCount)
    {
        $rates = [
            'professional' => [
                'monthly' => 1.00,
                'yearly' => 10.00
            ],
            'enterprise' => [
                'monthly' => 1.50,
                'yearly' => 15.00
            ]
        ];

        return $rates[$planId][$billingCycle] * $featureCount;
    }

    /**
     * Create or get Stripe customer
     */
    private function createOrGetStripeCustomer(User $user)
    {
        if ($user->stripe_customer_id) {
            try {
                return Customer::retrieve($user->stripe_customer_id);
            } catch (\Exception $e) {
                // Customer not found, create new one
            }
        }

        $customer = Customer::create([
            'email' => $user->email,
            'name' => $user->name,
            'metadata' => [
                'user_id' => $user->id
            ]
        ]);

        $user->update(['stripe_customer_id' => $customer->id]);

        return $customer;
    }

    /**
     * Update subscription (change plan or feature count)
     */
    public function updateSubscription(Request $request, $subscriptionId)
    {
        $request->validate([
            'plan_id' => 'sometimes|in:free,professional,enterprise',
            'feature_count' => 'sometimes|integer|min:1',
            'billing_cycle' => 'sometimes|in:monthly,yearly'
        ]);

        $subscription = Subscription::findOrFail($subscriptionId);
        
        // Check permissions
        if ($subscription->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            // If it's a Stripe subscription, update it
            if ($subscription->stripe_subscription_id) {
                $stripeSubscription = StripeSubscription::retrieve($subscription->stripe_subscription_id);
                
                // Update subscription items if needed
                if ($request->has('feature_count') || $request->has('plan_id')) {
                    $newAmount = $this->calculateSubscriptionAmount(
                        $request->get('plan_id', $subscription->package_id),
                        $request->get('billing_cycle', $subscription->metadata['billing_cycle'] ?? 'monthly'),
                        $request->get('feature_count', $subscription->quantity)
                    );

                    // Update the subscription
                    StripeSubscription::update($subscription->stripe_subscription_id, [
                        'items' => [[
                            'id' => $stripeSubscription->items->data[0]->id,
                            'price_data' => [
                                'currency' => 'usd',
                                'product_data' => [
                                    'name' => ucfirst($request->get('plan_id', $subscription->package_id)) . ' Plan'
                                ],
                                'unit_amount' => $newAmount * 100,
                                'recurring' => [
                                    'interval' => $request->get('billing_cycle', 'monthly') === 'yearly' ? 'year' : 'month'
                                ]
                            ]
                        ]],
                        'proration_behavior' => 'create_prorations'
                    ]);
                }
            }

            // Update local subscription
            $subscription->update([
                'package_id' => $request->get('plan_id', $subscription->package_id),
                'quantity' => $request->get('feature_count', $subscription->quantity),
                'amount' => $this->calculateSubscriptionAmount(
                    $request->get('plan_id', $subscription->package_id),
                    $request->get('billing_cycle', $subscription->metadata['billing_cycle'] ?? 'monthly'),
                    $request->get('feature_count', $subscription->quantity)
                ),
                'metadata' => array_merge($subscription->metadata ?? [], [
                    'plan_id' => $request->get('plan_id', $subscription->package_id),
                    'feature_count' => $request->get('feature_count', $subscription->quantity),
                    'billing_cycle' => $request->get('billing_cycle', $subscription->metadata['billing_cycle'] ?? 'monthly')
                ])
            ]);

            return response()->json([
                'success' => true,
                'subscription' => $subscription->fresh(),
                'message' => 'Subscription updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update subscription: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel subscription
     */
    public function cancelSubscription($subscriptionId)
    {
        $subscription = Subscription::findOrFail($subscriptionId);
        
        // Check permissions
        if ($subscription->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            // Cancel Stripe subscription if exists
            if ($subscription->stripe_subscription_id) {
                StripeSubscription::update($subscription->stripe_subscription_id, [
                    'cancel_at_period_end' => true
                ]);
            }

            // Update local subscription
            $subscription->cancel();

            return response()->json([
                'success' => true,
                'message' => 'Subscription cancelled successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel subscription: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get subscription usage statistics
     */
    public function getSubscriptionUsage(Request $request)
    {
        $workspaceId = $request->get('workspace_id');
        
        $subscription = Subscription::where('workspace_id', $workspaceId)
            ->where('user_id', auth()->id())
            ->first();

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'No subscription found'
            ], 404);
        }

        $featureCount = $subscription->quantity;
        $maxFeatures = $subscription->getPackageDetails()['limits']['max_features'] ?? 10;
        $usagePercentage = $maxFeatures > 0 ? ($featureCount / $maxFeatures) * 100 : 0;

        return response()->json([
            'success' => true,
            'usage' => [
                'features_used' => $featureCount,
                'features_limit' => $maxFeatures,
                'usage_percentage' => round($usagePercentage, 2),
                'plan' => $subscription->package_id,
                'billing_cycle' => $subscription->metadata['billing_cycle'] ?? 'monthly',
                'amount' => $subscription->amount,
                'currency' => $subscription->currency,
                'current_period_end' => $subscription->current_period_end,
                'is_active' => $subscription->isActive()
            ]
        ]);
    }

    /**
     * Handle Stripe webhooks
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');
        $endpoint_secret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sig_header, $endpoint_secret);
        } catch (\UnexpectedValueException $e) {
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Handle the event
        switch ($event['type']) {
            case 'checkout.session.completed':
                $this->handleCheckoutSessionCompleted($event['data']['object']);
                break;
            case 'invoice.payment_succeeded':
                $this->handleInvoicePaymentSucceeded($event['data']['object']);
                break;
            case 'customer.subscription.deleted':
                $this->handleSubscriptionDeleted($event['data']['object']);
                break;
            case 'customer.subscription.updated':
                $this->handleSubscriptionUpdated($event['data']['object']);
                break;
            default:
                \Log::info('Unhandled Stripe webhook event: ' . $event['type']);
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Handle successful checkout session
     */
    private function handleCheckoutSessionCompleted($session)
    {
        $metadata = $session['metadata'];
        
        // Create subscription record
        $subscription = Subscription::create([
            'id' => Str::uuid(),
            'user_id' => $metadata['user_id'],
            'workspace_id' => $metadata['workspace_id'],
            'package_id' => $metadata['plan_id'],
            'stripe_subscription_id' => $session['subscription'],
            'stripe_customer_id' => $session['customer'],
            'status' => 'active',
            'current_period_start' => now(),
            'current_period_end' => now()->addMonth(),
            'amount' => $this->calculateSubscriptionAmount(
                $metadata['plan_id'],
                $metadata['billing_cycle'],
                $metadata['feature_count']
            ),
            'currency' => 'usd',
            'quantity' => $metadata['feature_count'],
            'metadata' => $metadata
        ]);

        // Update workspace status
        $workspace = Workspace::find($metadata['workspace_id']);
        if ($workspace) {
            $workspace->update(['status' => 'active']);
        }
    }

    /**
     * Handle successful invoice payment
     */
    private function handleInvoicePaymentSucceeded($invoice)
    {
        $subscription = Subscription::where('stripe_subscription_id', $invoice['subscription'])->first();
        
        if ($subscription) {
            $subscription->update([
                'status' => 'active',
                'current_period_end' => now()->addMonth()
            ]);
        }
    }

    /**
     * Handle subscription deletion
     */
    private function handleSubscriptionDeleted($stripeSubscription)
    {
        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription['id'])->first();
        
        if ($subscription) {
            $subscription->update([
                'status' => 'cancelled',
                'cancelled_at' => now()
            ]);
        }
    }

    /**
     * Handle subscription updates
     */
    private function handleSubscriptionUpdated($stripeSubscription)
    {
        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription['id'])->first();
        
        if ($subscription) {
            $subscription->update([
                'status' => $stripeSubscription['status'],
                'current_period_start' => \Carbon\Carbon::createFromTimestamp($stripeSubscription['current_period_start']),
                'current_period_end' => \Carbon\Carbon::createFromTimestamp($stripeSubscription['current_period_end'])
            ]);
        }
    }
}