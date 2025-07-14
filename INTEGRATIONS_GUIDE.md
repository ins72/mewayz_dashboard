# 🔗 Third-Party Integrations Guide - Mewayz

## Overview

This guide covers all third-party service integrations implemented in the Mewayz Enterprise Business Suite, including setup instructions, configuration details, and troubleshooting tips.

## 🔐 Authentication Integrations

### Google OAuth 2.0 Integration

#### Setup Process
1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API and Google OAuth2 API

2. **Create OAuth 2.0 Credentials**
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:8001/api/auth/google/callback` (development)
     - `https://yourdomain.com/api/auth/google/callback` (production)

3. **Configure Backend**
   ```bash
   # In backend/.env
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```

4. **Laravel Configuration**
   ```php
   // config/services.php
   'google' => [
       'client_id' => env('GOOGLE_CLIENT_ID'),
       'client_secret' => env('GOOGLE_CLIENT_SECRET'),
       'redirect' => env('APP_URL') . '/api/auth/google/callback',
   ],
   ```

#### Implementation Details
```php
// AuthController.php
public function redirectToGoogle()
{
    return Socialite::driver('google')
        ->scopes(['email', 'profile'])
        ->redirect();
}

public function handleGoogleCallback()
{
    try {
        $googleUser = Socialite::driver('google')->user();
        
        // Find or create user
        $user = User::where('email', $googleUser->email)->first();
        
        if (!$user) {
            $user = User::create([
                'name' => $googleUser->name,
                'email' => $googleUser->email,
                'google_id' => $googleUser->id,
                'avatar' => $googleUser->avatar,
                'password' => bcrypt(str_random(16)),
            ]);
        } else {
            $user->update([
                'google_id' => $googleUser->id,
                'avatar' => $googleUser->avatar,
            ]);
        }
        
        $token = $user->createToken('auth_token')->plainTextToken;
        
        // Redirect to frontend with token
        return redirect()->to(config('app.frontend_url') . '/dashboard?token=' . $token);
        
    } catch (Exception $e) {
        return redirect()->to(config('app.frontend_url') . '/login?error=google_auth_failed');
    }
}
```

#### Frontend Integration
```javascript
// utils/googleAuthService.js
export const signInWithGoogle = () => {
  window.location.href = `${process.env.REACT_APP_BACKEND_URL}/auth/google`;
};

// components/ui/GoogleOAuthButton.jsx
import React from 'react';

const GoogleOAuthButton = ({ onSuccess, onError, text = "Sign in with Google" }) => {
  const handleGoogleSignIn = () => {
    try {
      signInWithGoogle();
    } catch (error) {
      onError?.(error);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        {/* Google icon SVG */}
      </svg>
      {text}
    </button>
  );
};

export default GoogleOAuthButton;
```

#### Testing Google OAuth
```bash
# Test OAuth redirect
curl -I http://localhost:8001/api/auth/google

# Expected response: 302 redirect to Google
```

#### Troubleshooting
- **Invalid redirect URI**: Ensure URLs match exactly in Google Console
- **OAuth consent screen**: Configure OAuth consent screen in Google Console
- **API quotas**: Check Google Cloud Console for API usage limits
- **CORS issues**: Ensure frontend domain is whitelisted

---

## 💳 Payment Integration - Stripe

### Setup Process
1. **Create Stripe Account**
   - Sign up at [Stripe Dashboard](https://dashboard.stripe.com/)
   - Complete account verification
   - Get API keys from "Developers" → "API Keys"

2. **Configure Backend**
   ```bash
   # In backend/.env
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   STRIPE_SECRET_KEY=sk_test_your_secret_key
   ```

3. **Install Stripe Libraries**
   ```bash
   # Backend
   composer require stripe/stripe-php

   # Frontend
   yarn add @stripe/stripe-js @stripe/react-stripe-js
   ```

#### Backend Implementation
```php
// PaymentController.php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\PaymentIntent;
use Stripe\Webhook;
use App\Models\PaymentTransaction;
use App\Models\Subscription;

class PaymentController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function getPackages()
    {
        return response()->json([
            'data' => [
                [
                    'id' => 'basic',
                    'name' => 'Basic Plan',
                    'price' => 29.99,
                    'currency' => 'USD',
                    'billing_period' => 'monthly',
                    'stripe_price_id' => 'price_basic_monthly',
                    'features' => [
                        'Up to 5 social media accounts',
                        'Basic analytics',
                        'Email support'
                    ]
                ],
                [
                    'id' => 'pro',
                    'name' => 'Pro Plan',
                    'price' => 79.99,
                    'currency' => 'USD',
                    'billing_period' => 'monthly',
                    'stripe_price_id' => 'price_pro_monthly',
                    'features' => [
                        'Up to 25 social media accounts',
                        'Advanced analytics',
                        'Priority support',
                        'Custom branding'
                    ]
                ]
            ]
        ]);
    }

    public function createCheckoutSession(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid',
            'package_id' => 'required|string',
            'billing_period' => 'required|in:monthly,yearly',
            'success_url' => 'required|url',
            'cancel_url' => 'required|url'
        ]);

        try {
            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price' => $this->getPriceId($request->package_id, $request->billing_period),
                    'quantity' => 1,
                ]],
                'mode' => 'subscription',
                'success_url' => $request->success_url . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => $request->cancel_url,
                'metadata' => [
                    'workspace_id' => $request->workspace_id,
                    'user_id' => auth()->id(),
                    'package_id' => $request->package_id,
                    'billing_period' => $request->billing_period
                ]
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'session_id' => $session->id,
                    'checkout_url' => $session->url
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to create checkout session: ' . $e->getMessage()
            ], 500);
        }
    }

    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');
        $endpoint_secret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sig_header, $endpoint_secret);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Webhook signature verification failed'], 400);
        }

        switch ($event['type']) {
            case 'checkout.session.completed':
                $this->handleCheckoutCompleted($event['data']['object']);
                break;
            case 'invoice.payment_succeeded':
                $this->handlePaymentSucceeded($event['data']['object']);
                break;
            case 'customer.subscription.deleted':
                $this->handleSubscriptionDeleted($event['data']['object']);
                break;
        }

        return response()->json(['status' => 'success']);
    }

    private function handleCheckoutCompleted($session)
    {
        // Create subscription record
        $subscription = Subscription::create([
            'workspace_id' => $session['metadata']['workspace_id'],
            'user_id' => $session['metadata']['user_id'],
            'stripe_subscription_id' => $session['subscription'],
            'stripe_customer_id' => $session['customer'],
            'plan_name' => $session['metadata']['package_id'],
            'billing_period' => $session['metadata']['billing_period'],
            'status' => 'active'
        ]);

        // Create payment transaction
        PaymentTransaction::create([
            'workspace_id' => $session['metadata']['workspace_id'],
            'user_id' => $session['metadata']['user_id'],
            'subscription_id' => $subscription->id,
            'stripe_payment_intent_id' => $session['payment_intent'],
            'amount' => $session['amount_total'] / 100,
            'currency' => $session['currency'],
            'status' => 'succeeded'
        ]);
    }

    private function getPriceId($packageId, $billingPeriod)
    {
        $priceMap = [
            'basic' => [
                'monthly' => 'price_basic_monthly',
                'yearly' => 'price_basic_yearly'
            ],
            'pro' => [
                'monthly' => 'price_pro_monthly',
                'yearly' => 'price_pro_yearly'
            ]
        ];

        return $priceMap[$packageId][$billingPeriod] ?? null;
    }
}
```

#### Frontend Implementation
```javascript
// utils/paymentService.js
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export const createCheckoutSession = async (packageData) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/payments/checkout/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        workspace_id: packageData.workspaceId,
        package_id: packageData.packageId,
        billing_period: packageData.billingPeriod,
        success_url: `${window.location.origin}/payment-success`,
        cancel_url: `${window.location.origin}/payment-cancel`
      })
    });

    const session = await response.json();
    
    if (session.success) {
      const stripe = await stripePromise;
      window.location.href = session.data.checkout_url;
    } else {
      throw new Error(session.error);
    }
  } catch (error) {
    console.error('Payment error:', error);
    throw error;
  }
};

// components/SubscriptionPlan.jsx
import React from 'react';
import { createCheckoutSession } from '../utils/paymentService';

const SubscriptionPlan = ({ plan, workspaceId }) => {
  const handleSubscribe = async () => {
    try {
      await createCheckoutSession({
        workspaceId,
        packageId: plan.id,
        billingPeriod: 'monthly'
      });
    } catch (error) {
      alert('Payment failed: ' + error.message);
    }
  };

  return (
    <div className="border rounded-lg p-6">
      <h3 className="text-xl font-semibold">{plan.name}</h3>
      <p className="text-2xl font-bold">${plan.price}/month</p>
      <ul className="mt-4 space-y-2">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <button
        onClick={handleSubscribe}
        className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Subscribe Now
      </button>
    </div>
  );
};

export default SubscriptionPlan;
```

#### Testing Stripe Integration
```bash
# Test package listing
curl -X GET http://localhost:8001/api/payments/packages \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test checkout session creation
curl -X POST http://localhost:8001/api/payments/checkout/session \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workspace_id": "YOUR_WORKSPACE_ID",
    "package_id": "pro",
    "billing_period": "monthly",
    "success_url": "http://localhost:3000/success",
    "cancel_url": "http://localhost:3000/cancel"
  }'
```

#### Troubleshooting
- **Invalid API key**: Check Stripe dashboard for correct keys
- **Webhook signature**: Verify webhook endpoint secret
- **Currency mismatch**: Ensure consistent currency across application
- **Product/Price creation**: Create products and prices in Stripe dashboard

---

## 📧 Email Integration - ElasticMail

### Setup Process
1. **Create ElasticMail Account**
   - Sign up at [ElasticMail](https://elasticemail.com/)
   - Verify your domain
   - Get API key from account settings

2. **Configure Backend**
   ```bash
   # In backend/.env
   ELASTICMAIL_API_KEY=your_elasticmail_api_key
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.elasticemail.com
   MAIL_PORT=2525
   MAIL_USERNAME=your-email@yourdomain.com
   MAIL_PASSWORD=your_elasticmail_api_key
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS=noreply@yourdomain.com
   MAIL_FROM_NAME="Mewayz"
   ```

#### Backend Implementation
```php
// Services/ElasticMailService.php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ElasticMailService
{
    private $apiKey;
    private $baseUrl = 'https://api.elasticemail.com/v2';

    public function __construct()
    {
        $this->apiKey = config('services.elasticmail.api_key');
    }

    public function sendEmail($to, $subject, $body, $template = null)
    {
        try {
            $response = Http::post($this->baseUrl . '/email/send', [
                'apikey' => $this->apiKey,
                'to' => $to,
                'subject' => $subject,
                'from' => config('mail.from.address'),
                'fromName' => config('mail.from.name'),
                'bodyHtml' => $body,
                'isTransactional' => true
            ]);

            if ($response->successful()) {
                Log::info('Email sent successfully', ['to' => $to, 'subject' => $subject]);
                return true;
            } else {
                Log::error('Email sending failed', ['response' => $response->body()]);
                return false;
            }

        } catch (\Exception $e) {
            Log::error('Email service error', ['error' => $e->getMessage()]);
            return false;
        }
    }

    public function sendWelcomeEmail($user)
    {
        $subject = 'Welcome to Mewayz!';
        $body = view('emails.welcome', compact('user'))->render();
        
        return $this->sendEmail($user->email, $subject, $body);
    }

    public function sendWorkspaceInvitation($invitation)
    {
        $subject = 'You\'re invited to join ' . $invitation->workspace->name;
        $body = view('emails.workspace_invitation', compact('invitation'))->render();
        
        return $this->sendEmail($invitation->email, $subject, $body);
    }

    public function sendPasswordResetEmail($user, $token)
    {
        $subject = 'Reset Your Password';
        $resetUrl = config('app.frontend_url') . '/reset-password?token=' . $token;
        $body = view('emails.password_reset', compact('user', 'resetUrl'))->render();
        
        return $this->sendEmail($user->email, $subject, $body);
    }
}
```

#### Email Templates
```blade
{{-- resources/views/emails/welcome.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to Mewayz</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Mewayz!</h1>
        </div>
        <div class="content">
            <p>Hi {{ $user->name }},</p>
            <p>Welcome to Mewayz! We're excited to have you on board.</p>
            <p>Your account has been successfully created. You can now start using our platform to manage your social media, create link-in-bio pages, and much more.</p>
            <p>
                <a href="{{ config('app.frontend_url') }}/dashboard" class="button">
                    Get Started
                </a>
            </p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The Mewayz Team</p>
        </div>
    </div>
</body>
</html>

{{-- resources/views/emails/workspace_invitation.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Workspace Invitation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 4px; margin-right: 10px; }
        .button.secondary { background: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>You're Invited!</h1>
        </div>
        <div class="content">
            <p>Hi there,</p>
            <p>You've been invited to join <strong>{{ $invitation->workspace->name }}</strong> on Mewayz.</p>
            
            @if($invitation->personal_message)
                <blockquote style="background: #e9ecef; padding: 15px; border-left: 4px solid #007bff;">
                    {{ $invitation->personal_message }}
                </blockquote>
            @endif
            
            <p><strong>Role:</strong> {{ ucfirst($invitation->role) }}</p>
            @if($invitation->department)
                <p><strong>Department:</strong> {{ $invitation->department }}</p>
            @endif
            
            <p>This invitation expires on {{ $invitation->expires_at->format('M j, Y') }}.</p>
            
            <p>
                <a href="{{ config('app.frontend_url') }}/invitation/{{ $invitation->token }}" class="button">
                    Accept Invitation
                </a>
                <a href="{{ config('app.frontend_url') }}/invitation/{{ $invitation->token }}/decline" class="button secondary">
                    Decline
                </a>
            </p>
            
            <p>If you're not interested in this invitation, you can safely ignore this email.</p>
            
            <p>Best regards,<br>The Mewayz Team</p>
        </div>
    </div>
</body>
</html>
```

#### Testing ElasticMail
```bash
# Test email configuration
cd /app/backend
php artisan tinker

# In tinker:
Mail::to('test@example.com')->send(new \App\Mail\WelcomeEmail(User::first()));
```

#### Troubleshooting
- **Authentication failed**: Check API key and credentials
- **Domain verification**: Verify sending domain in ElasticMail
- **Rate limits**: Check API usage limits
- **Bounce handling**: Configure bounce handling in ElasticMail

---

## 📱 Social Media Integration - Instagram

### Setup Process
1. **Create Facebook App**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create new app
   - Add Instagram Basic Display product

2. **Configure Instagram Basic Display**
   - Add Instagram Basic Display to your app
   - Configure OAuth redirect URIs
   - Get App ID and App Secret

3. **Backend Configuration**
   ```bash
   # In backend/.env
   INSTAGRAM_CLIENT_ID=your_instagram_client_id
   INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
   INSTAGRAM_REDIRECT_URI=http://localhost:8001/api/instagram/callback
   ```

#### Backend Implementation
```php
// Controllers/InstagramController.php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\SocialMediaAccount;

class InstagramController extends Controller
{
    public function connect()
    {
        $clientId = config('services.instagram.client_id');
        $redirectUri = config('services.instagram.redirect_uri');
        
        $url = "https://api.instagram.com/oauth/authorize";
        $url .= "?client_id={$clientId}";
        $url .= "&redirect_uri={$redirectUri}";
        $url .= "&scope=user_profile,user_media";
        $url .= "&response_type=code";
        
        return redirect($url);
    }

    public function callback(Request $request)
    {
        $code = $request->get('code');
        
        if (!$code) {
            return redirect()->to(config('app.frontend_url') . '/dashboard?error=instagram_auth_failed');
        }

        try {
            // Exchange code for access token
            $response = Http::post('https://api.instagram.com/oauth/access_token', [
                'client_id' => config('services.instagram.client_id'),
                'client_secret' => config('services.instagram.client_secret'),
                'grant_type' => 'authorization_code',
                'redirect_uri' => config('services.instagram.redirect_uri'),
                'code' => $code
            ]);

            $data = $response->json();
            
            if (isset($data['access_token'])) {
                // Get user info
                $userResponse = Http::get("https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token={$data['access_token']}");
                $userInfo = $userResponse->json();
                
                // Store account
                SocialMediaAccount::create([
                    'workspace_id' => auth()->user()->currentWorkspace->id,
                    'platform' => 'instagram',
                    'account_name' => '@' . $userInfo['username'],
                    'account_id' => $userInfo['id'],
                    'access_token' => $data['access_token'],
                    'account_info' => [
                        'username' => $userInfo['username'],
                        'account_type' => $userInfo['account_type'],
                        'media_count' => $userInfo['media_count']
                    ],
                    'status' => 'active'
                ]);
                
                return redirect()->to(config('app.frontend_url') . '/dashboard?success=instagram_connected');
            }
            
        } catch (\Exception $e) {
            Log::error('Instagram connection failed', ['error' => $e->getMessage()]);
        }
        
        return redirect()->to(config('app.frontend_url') . '/dashboard?error=instagram_auth_failed');
    }

    public function getUserMedia(SocialMediaAccount $account)
    {
        try {
            $response = Http::get("https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,permalink&access_token={$account->access_token}");
            
            return response()->json([
                'success' => true,
                'data' => $response->json()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch media: ' . $e->getMessage()
            ], 500);
        }
    }
}
```

#### Frontend Implementation
```javascript
// utils/instagramService.js
export const connectInstagram = () => {
  window.location.href = `${process.env.REACT_APP_BACKEND_URL}/instagram/connect`;
};

export const getInstagramMedia = async (accountId) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/instagram/media/${accountId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch Instagram media:', error);
    throw error;
  }
};

// components/InstagramConnection.jsx
import React, { useState } from 'react';
import { connectInstagram, getInstagramMedia } from '../utils/instagramService';

const InstagramConnection = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectInstagram();
    } catch (error) {
      console.error('Instagram connection failed:', error);
      setIsConnecting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            {/* Instagram icon */}
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Instagram</h3>
          <p className="text-gray-600">Connect your Instagram account</p>
        </div>
      </div>
      
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
      >
        {isConnecting ? 'Connecting...' : 'Connect Instagram'}
      </button>
    </div>
  );
};

export default InstagramConnection;
```

#### Testing Instagram Integration
```bash
# Test Instagram connection
curl -I http://localhost:8001/api/instagram/connect

# Test media retrieval
curl -X GET http://localhost:8001/api/instagram/media/ACCOUNT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Troubleshooting
- **Invalid redirect URI**: Ensure URLs match in Facebook App settings
- **Permissions**: Check Instagram permissions in Facebook App
- **API limits**: Instagram Basic Display has usage limits
- **Webhook verification**: Configure webhooks for real-time updates

---

## 🔄 Database Integration - MariaDB

### Setup Process
1. **Install MariaDB**
   ```bash
   sudo apt update
   sudo apt install mariadb-server
   sudo mysql_secure_installation
   ```

2. **Create Database and User**
   ```sql
   CREATE DATABASE mewayz_local;
   CREATE USER 'mewayz'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON mewayz_local.* TO 'mewayz'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Configure Backend**
   ```bash
   # In backend/.env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=mewayz_local
   DB_USERNAME=mewayz
   DB_PASSWORD=password
   ```

#### Performance Optimization
```sql
-- Optimize MariaDB configuration
-- Add to /etc/mysql/mariadb.conf.d/50-server.cnf

[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
query_cache_size = 0
query_cache_type = 0
```

#### Backup and Recovery
```bash
# Create backup
mysqldump -u mewayz -p mewayz_local > backup.sql

# Restore backup
mysql -u mewayz -p mewayz_local < backup.sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/var/backups/mewayz"
mkdir -p $BACKUP_DIR
mysqldump -u mewayz -p"password" mewayz_local > "$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
```

---

## 🔍 Monitoring and Analytics

### Application Performance Monitoring
```php
// Install Laravel Telescope for debugging
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

### Error Tracking
```php
// Install Sentry for error tracking
composer require sentry/sentry-laravel
php artisan sentry:publish --config
```

### Performance Metrics
```javascript
// Frontend performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## 🔐 Security Considerations

### API Security
- **Rate Limiting**: Implement rate limiting for all endpoints
- **Input Validation**: Validate all input data
- **Authentication**: Use JWT tokens with proper expiration
- **CORS**: Configure CORS policies properly
- **SQL Injection**: Use parameterized queries

### Data Protection
- **Encryption**: Encrypt sensitive data at rest
- **HTTPS**: Use SSL/TLS for all communications
- **API Keys**: Store API keys securely
- **Access Control**: Implement proper access controls
- **Audit Logging**: Log all important actions

---

## 📞 Support and Resources

### Getting Help
1. **Documentation**: Check official documentation for each service
2. **Community**: Use Stack Overflow and Reddit for community help
3. **Support**: Contact service providers for technical support
4. **Testing**: Use testing environments before production

### Useful Links
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [ElasticMail API Documentation](https://elasticemail.com/developers)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Laravel Socialite Documentation](https://laravel.com/docs/socialite)

---

**Last updated: January 2025**
**Integrations Guide Version: 1.0.0**