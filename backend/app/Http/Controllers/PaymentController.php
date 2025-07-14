<?php

namespace App\Http\Controllers;

use App\Models\PaymentTransaction;
use App\Models\Workspace;
use App\Models\User;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PaymentController extends Controller
{
    private $stripeService;
    
    public function __construct()
    {
        $this->stripeService = new \Stripe\StripeClient(config('services.stripe.secret'));
    }

    /**
     * Get available subscription packages
     */
    public function getPackages()
    {
        $packages = [
            'basic' => [
                'amount' => 29.99,
                'currency' => 'usd',
                'name' => 'Basic Plan',
                'features' => ['5 Workspaces', 'Basic Support', 'Social Media Tools'],
                'stripe_price_id' => 'price_basic_monthly'
            ],
            'professional' => [
                'amount' => 79.99,
                'currency' => 'usd',
                'name' => 'Professional Plan',
                'features' => ['15 Workspaces', 'Priority Support', 'Advanced Analytics', 'CRM Tools'],
                'stripe_price_id' => 'price_professional_monthly'
            ],
            'enterprise' => [
                'amount' => 199.99,
                'currency' => 'usd',
                'name' => 'Enterprise Plan',
                'features' => ['Unlimited Workspaces', '24/7 Support', 'Custom Integrations', 'API Access'],
                'stripe_price_id' => 'price_enterprise_monthly'
            ]
        ];

        return response()->json([
            'success' => true,
            'packages' => $packages
        ]);
    }

    /**
     * Create a checkout session for subscription payment
     */
    public function createCheckoutSession(Request $request)
    {
        $request->validate([
            'package_id' => 'required|string|in:basic,professional,enterprise',
            'workspace_id' => 'required|uuid|exists:workspaces,id',
        ]);

        try {
            // Get package details
            $packages = $this->getPackagesArray();
            $package = $packages[$request->package_id];

            // Validate workspace access
            $workspace = Workspace::find($request->workspace_id);
            if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to workspace'
                ], 403);
            }

            // Generate URLs
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:4028');
            $successUrl = $frontendUrl . '/payment/success?session_id={CHECKOUT_SESSION_ID}';
            $cancelUrl = $frontendUrl . '/payment/cancel';

            // Create Stripe checkout session
            $session = $this->stripeService->checkout->sessions->create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => $package['currency'],
                        'product_data' => [
                            'name' => $package['name'],
                            'description' => implode(', ', $package['features']),
                        ],
                        'unit_amount' => intval($package['amount'] * 100), // Convert to cents
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'subscription',
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
                'metadata' => [
                    'package_id' => $request->package_id,
                    'user_id' => auth()->id(),
                    'workspace_id' => $request->workspace_id,
                    'payment_type' => 'subscription',
                    'package_name' => $package['name']
                ],
            ]);

            // Store transaction in database
            $transaction = PaymentTransaction::create([
                'id' => Str::uuid(),
                'user_id' => auth()->id(),
                'workspace_id' => $request->workspace_id,
                'package_id' => $request->package_id,
                'amount' => $package['amount'],
                'currency' => $package['currency'],
                'session_id' => $session->id,
                'payment_status' => 'pending',
                'metadata' => [
                    'package_id' => $request->package_id,
                    'user_id' => auth()->id(),
                    'workspace_id' => $request->workspace_id,
                    'payment_type' => 'subscription',
                    'package_name' => $package['name']
                ],
            ]);

            return response()->json([
                'success' => true,
                'url' => $session->url,
                'session_id' => $session->id,
                'transaction_id' => $transaction->id,
                'package' => $package
            ]);

        } catch (\Exception $e) {
            Log::error('Payment session creation failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment session'
            ], 500);
        }
    }

    /**
     * Get checkout session status
     */
    public function getCheckoutStatus($sessionId)
    {
        try {
            // Get session from Stripe
            $session = $this->stripeService->checkout->sessions->retrieve($sessionId);
            
            // Find transaction in database
            $transaction = PaymentTransaction::where('session_id', $sessionId)->first();
            
            if (!$transaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaction not found'
                ], 404);
            }

            // Update transaction status if payment is complete
            if ($session->payment_status === 'paid' && $transaction->payment_status !== 'paid') {
                $transaction->update(['payment_status' => 'paid']);
                
                // Process successful payment
                $this->processSuccessfulPayment($transaction);
            } elseif ($session->status === 'expired') {
                $transaction->update(['payment_status' => 'expired']);
            }

            return response()->json([
                'success' => true,
                'status' => $session->status,
                'payment_status' => $session->payment_status,
                'amount_total' => $session->amount_total,
                'currency' => $session->currency,
                'metadata' => $session->metadata,
                'transaction' => $transaction
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get checkout status: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get checkout status'
            ], 500);
        }
    }

    /**
     * Handle Stripe webhooks
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $signature, $endpointSecret);
            
            switch ($event->type) {
                case 'checkout.session.completed':
                    $this->handleCheckoutSessionCompleted($event->data->object);
                    break;
                    
                case 'invoice.payment_succeeded':
                    $this->handleInvoicePaymentSucceeded($event->data->object);
                    break;
                    
                case 'invoice.payment_failed':
                    $this->handleInvoicePaymentFailed($event->data->object);
                    break;
                    
                case 'customer.subscription.deleted':
                    $this->handleSubscriptionDeleted($event->data->object);
                    break;
                    
                default:
                    Log::info('Unhandled webhook event: ' . $event->type);
            }

            return response()->json(['success' => true]);

        } catch (\UnexpectedValueException $e) {
            Log::error('Invalid webhook payload: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            Log::error('Invalid webhook signature: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid signature'], 400);
        } catch (\Exception $e) {
            Log::error('Webhook processing error: ' . $e->getMessage());
            return response()->json(['error' => 'Processing error'], 500);
        }
    }

    /**
     * Handle checkout session completed
     */
    private function handleCheckoutSessionCompleted($session)
    {
        $transaction = PaymentTransaction::where('session_id', $session->id)->first();
        
        if ($transaction) {
            $transaction->update(['payment_status' => 'paid']);
            $this->processSuccessfulPayment($transaction);
        }
    }

    /**
     * Handle invoice payment succeeded
     */
    private function handleInvoicePaymentSucceeded($invoice)
    {
        // Handle recurring subscription payments
        $subscriptionId = $invoice->subscription;
        $subscription = Subscription::where('stripe_subscription_id', $subscriptionId)->first();
        
        if ($subscription) {
            $subscription->update([
                'status' => 'active',
                'current_period_end' => Carbon::createFromTimestamp($invoice->lines->data[0]->period->end),
            ]);
        }
    }

    /**
     * Handle invoice payment failed
     */
    private function handleInvoicePaymentFailed($invoice)
    {
        $subscriptionId = $invoice->subscription;
        $subscription = Subscription::where('stripe_subscription_id', $subscriptionId)->first();
        
        if ($subscription) {
            $subscription->update(['status' => 'past_due']);
        }
    }

    /**
     * Handle subscription deleted
     */
    private function handleSubscriptionDeleted($stripeSubscription)
    {
        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription->id)->first();
        
        if ($subscription) {
            $subscription->update(['status' => 'cancelled']);
        }
    }

    /**
     * Process successful payment
     */
    private function processSuccessfulPayment(PaymentTransaction $transaction)
    {
        try {
            DB::beginTransaction();

            // Create or update subscription
            $subscription = Subscription::updateOrCreate(
                ['workspace_id' => $transaction->workspace_id],
                [
                    'user_id' => $transaction->user_id,
                    'package_id' => $transaction->package_id,
                    'status' => 'active',
                    'current_period_start' => now(),
                    'current_period_end' => now()->addMonth(),
                    'amount' => $transaction->amount,
                    'currency' => $transaction->currency,
                ]
            );

            // Update workspace limits based on package
            $this->updateWorkspaceLimits($transaction->workspace_id, $transaction->package_id);

            // Send confirmation email
            $this->sendPaymentConfirmationEmail($transaction);

            DB::commit();

            Log::info('Payment processed successfully', [
                'transaction_id' => $transaction->id,
                'user_id' => $transaction->user_id,
                'package_id' => $transaction->package_id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to process payment: ' . $e->getMessage());
        }
    }

    /**
     * Update workspace limits based on package
     */
    private function updateWorkspaceLimits($workspaceId, $packageId)
    {
        $limits = [
            'basic' => ['max_workspaces' => 5, 'max_team_members' => 10],
            'professional' => ['max_workspaces' => 15, 'max_team_members' => 50],
            'enterprise' => ['max_workspaces' => -1, 'max_team_members' => -1], // Unlimited
        ];

        $workspace = Workspace::find($workspaceId);
        if ($workspace) {
            $workspace->update([
                'subscription_package' => $packageId,
                'subscription_limits' => $limits[$packageId] ?? $limits['basic']
            ]);
        }
    }

    /**
     * Send payment confirmation email
     */
    private function sendPaymentConfirmationEmail(PaymentTransaction $transaction)
    {
        // Integration with email service will be implemented
        Log::info('Payment confirmation email sent', [
            'transaction_id' => $transaction->id,
            'user_id' => $transaction->user_id
        ]);
    }

    /**
     * Get user's payment transactions
     */
    public function getTransactions(Request $request)
    {
        $transactions = PaymentTransaction::where('user_id', auth()->id())
            ->with(['workspace', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 10));

        return response()->json([
            'success' => true,
            'transactions' => $transactions
        ]);
    }

    /**
     * Get workspace subscription details
     */
    public function getSubscription($workspaceId)
    {
        $workspace = Workspace::find($workspaceId);
        
        if (!$workspace || !$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $subscription = Subscription::where('workspace_id', $workspaceId)->first();

        return response()->json([
            'success' => true,
            'subscription' => $subscription,
            'workspace' => $workspace
        ]);
    }

    /**
     * Get packages array
     */
    private function getPackagesArray()
    {
        return [
            'basic' => [
                'amount' => 29.99,
                'currency' => 'usd',
                'name' => 'Basic Plan',
                'features' => ['5 Workspaces', 'Basic Support', 'Social Media Tools']
            ],
            'professional' => [
                'amount' => 79.99,
                'currency' => 'usd',
                'name' => 'Professional Plan',
                'features' => ['15 Workspaces', 'Priority Support', 'Advanced Analytics', 'CRM Tools']
            ],
            'enterprise' => [
                'amount' => 199.99,
                'currency' => 'usd',
                'name' => 'Enterprise Plan',
                'features' => ['Unlimited Workspaces', '24/7 Support', 'Custom Integrations', 'API Access']
            ]
        ];
    }
}