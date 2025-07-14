<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ElasticMailService
{
    private $apiKey;
    private $baseUrl = 'https://api.elasticemail.com/v2';
    private $fromEmail;
    private $fromName;

    public function __construct()
    {
        $this->apiKey = config('services.elasticmail.api_key');
        $this->fromEmail = config('services.elasticmail.from_email');
        $this->fromName = config('services.elasticmail.from_name');
    }

    /**
     * Send a single email
     */
    public function sendEmail($to, $subject, $body, $options = [])
    {
        try {
            $data = [
                'apikey' => $this->apiKey,
                'from' => $options['from'] ?? $this->fromEmail,
                'fromName' => $options['fromName'] ?? $this->fromName,
                'to' => $to,
                'subject' => $subject,
                'bodyHtml' => $body,
                'isTransactional' => true,
            ];

            // Add optional parameters
            if (isset($options['replyTo'])) {
                $data['replyTo'] = $options['replyTo'];
            }

            if (isset($options['cc'])) {
                $data['cc'] = $options['cc'];
            }

            if (isset($options['bcc'])) {
                $data['bcc'] = $options['bcc'];
            }

            $response = Http::asForm()->post($this->baseUrl . '/email/send', $data);

            if ($response->successful()) {
                $result = $response->json();
                
                if ($result['success']) {
                    Log::info('Email sent successfully', [
                        'to' => $to,
                        'subject' => $subject,
                        'transaction_id' => $result['data']['transactionid']
                    ]);
                    
                    return [
                        'success' => true,
                        'transaction_id' => $result['data']['transactionid'],
                        'message' => 'Email sent successfully'
                    ];
                } else {
                    Log::error('ElasticMail API error', [
                        'error' => $result['error'],
                        'to' => $to,
                        'subject' => $subject
                    ]);
                    
                    return [
                        'success' => false,
                        'error' => $result['error']
                    ];
                }
            } else {
                Log::error('ElasticMail HTTP error', [
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                
                return [
                    'success' => false,
                    'error' => 'Failed to send email'
                ];
            }
        } catch (\Exception $e) {
            Log::error('ElasticMail service error', [
                'message' => $e->getMessage(),
                'to' => $to,
                'subject' => $subject
            ]);
            
            return [
                'success' => false,
                'error' => 'Email service error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Send welcome email to new user
     */
    public function sendWelcomeEmail($user)
    {
        $subject = 'Welcome to Mewayz!';
        $body = $this->getWelcomeEmailTemplate($user);
        
        return $this->sendEmail($user->email, $subject, $body, [
            'fromName' => 'Mewayz Team'
        ]);
    }

    /**
     * Send password reset email
     */
    public function sendPasswordResetEmail($user, $resetUrl)
    {
        $subject = 'Reset Your Password - Mewayz';
        $body = $this->getPasswordResetEmailTemplate($user, $resetUrl);
        
        return $this->sendEmail($user->email, $subject, $body, [
            'fromName' => 'Mewayz Security'
        ]);
    }

    /**
     * Send payment confirmation email
     */
    public function sendPaymentConfirmationEmail($user, $transaction)
    {
        $subject = 'Payment Confirmation - Mewayz';
        $body = $this->getPaymentConfirmationEmailTemplate($user, $transaction);
        
        return $this->sendEmail($user->email, $subject, $body, [
            'fromName' => 'Mewayz Billing'
        ]);
    }

    /**
     * Send subscription renewal reminder
     */
    public function sendSubscriptionReminderEmail($user, $subscription)
    {
        $subject = 'Subscription Renewal Reminder - Mewayz';
        $body = $this->getSubscriptionReminderEmailTemplate($user, $subscription);
        
        return $this->sendEmail($user->email, $subject, $body, [
            'fromName' => 'Mewayz Billing'
        ]);
    }

    /**
     * Send team invitation email
     */
    public function sendTeamInvitationEmail($inviteeEmail, $inviterName, $workspaceName, $invitationUrl)
    {
        $subject = "You've been invited to join {$workspaceName} on Mewayz";
        $body = $this->getTeamInvitationEmailTemplate($inviteeEmail, $inviterName, $workspaceName, $invitationUrl);
        
        return $this->sendEmail($inviteeEmail, $subject, $body, [
            'fromName' => 'Mewayz Team'
        ]);
    }

    /**
     * Send bulk emails
     */
    public function sendBulkEmail($recipients, $subject, $body, $options = [])
    {
        try {
            $data = [
                'apikey' => $this->apiKey,
                'from' => $options['from'] ?? $this->fromEmail,
                'fromName' => $options['fromName'] ?? $this->fromName,
                'to' => implode(',', $recipients),
                'subject' => $subject,
                'bodyHtml' => $body,
                'isTransactional' => false,
            ];

            $response = Http::asForm()->post($this->baseUrl . '/email/send', $data);

            if ($response->successful()) {
                $result = $response->json();
                
                if ($result['success']) {
                    return [
                        'success' => true,
                        'transaction_id' => $result['data']['transactionid'],
                        'message' => 'Bulk email sent successfully'
                    ];
                } else {
                    return [
                        'success' => false,
                        'error' => $result['error']
                    ];
                }
            } else {
                return [
                    'success' => false,
                    'error' => 'Failed to send bulk email'
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Bulk email service error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get account statistics
     */
    public function getAccountStats()
    {
        try {
            $response = Http::get($this->baseUrl . '/account/profileoverview', [
                'apikey' => $this->apiKey
            ]);

            if ($response->successful()) {
                $result = $response->json();
                
                if ($result['success']) {
                    return [
                        'success' => true,
                        'data' => $result['data']
                    ];
                } else {
                    return [
                        'success' => false,
                        'error' => $result['error']
                    ];
                }
            } else {
                return [
                    'success' => false,
                    'error' => 'Failed to get account statistics'
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Account stats service error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get email sending history
     */
    public function getEmailHistory($limit = 100, $offset = 0)
    {
        try {
            $response = Http::get($this->baseUrl . '/log/summary', [
                'apikey' => $this->apiKey,
                'limit' => $limit,
                'offset' => $offset
            ]);

            if ($response->successful()) {
                $result = $response->json();
                
                if ($result['success']) {
                    return [
                        'success' => true,
                        'data' => $result['data']
                    ];
                } else {
                    return [
                        'success' => false,
                        'error' => $result['error']
                    ];
                }
            } else {
                return [
                    'success' => false,
                    'error' => 'Failed to get email history'
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Email history service error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Welcome email template
     */
    private function getWelcomeEmailTemplate($user)
    {
        return "
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
                .content { line-height: 1.6; color: #333; }
                .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <div class='logo'>Mewayz</div>
                    <h1>Welcome to Mewayz!</h1>
                </div>
                
                <div class='content'>
                    <p>Hi {$user->name},</p>
                    
                    <p>Welcome to Mewayz! We're excited to have you join our community of business owners and entrepreneurs.</p>
                    
                    <p>With Mewayz, you can:</p>
                    <ul>
                        <li>📱 Manage your social media presence</li>
                        <li>🔗 Create beautiful link-in-bio pages</li>
                        <li>👥 Manage your customers and leads</li>
                        <li>📚 Create and sell courses</li>
                        <li>🛍️ Run your online store</li>
                    </ul>
                    
                    <p>Ready to get started?</p>
                    
                    <a href='" . env('FRONTEND_URL') . "/dashboard-screen' class='button'>Go to Dashboard</a>
                    
                    <p>If you have any questions, don't hesitate to reach out to our support team.</p>
                    
                    <p>Best regards,<br>The Mewayz Team</p>
                </div>
                
                <div class='footer'>
                    <p>© 2025 Mewayz. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>";
    }

    /**
     * Password reset email template
     */
    private function getPasswordResetEmailTemplate($user, $resetUrl)
    {
        return "
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
                .content { line-height: 1.6; color: #333; }
                .button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
                .warning { background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <div class='logo'>Mewayz</div>
                    <h1>Reset Your Password</h1>
                </div>
                
                <div class='content'>
                    <p>Hi {$user->name},</p>
                    
                    <p>We received a request to reset your password for your Mewayz account.</p>
                    
                    <p>Click the button below to reset your password:</p>
                    
                    <a href='{$resetUrl}' class='button'>Reset Password</a>
                    
                    <div class='warning'>
                        <strong>Security Notice:</strong> This link will expire in 1 hour for security reasons.
                    </div>
                    
                    <p>If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.</p>
                    
                    <p>Best regards,<br>The Mewayz Security Team</p>
                </div>
                
                <div class='footer'>
                    <p>© 2025 Mewayz. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>";
    }

    /**
     * Payment confirmation email template
     */
    private function getPaymentConfirmationEmailTemplate($user, $transaction)
    {
        $packageDetails = $transaction->getPackageDetails();
        
        return "
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
                .content { line-height: 1.6; color: #333; }
                .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
                .invoice { background-color: #f8fafc; padding: 20px; border-radius: 5px; margin: 20px 0; }
                .invoice-row { display: flex; justify-content: space-between; margin: 10px 0; }
                .total { font-weight: bold; border-top: 1px solid #ddd; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <div class='logo'>Mewayz</div>
                    <h1>Payment Confirmation</h1>
                </div>
                
                <div class='content'>
                    <p>Hi {$user->name},</p>
                    
                    <p>Thank you for your payment! Your subscription has been activated successfully.</p>
                    
                    <div class='invoice'>
                        <h3>Invoice Details</h3>
                        <div class='invoice-row'>
                            <span>Package:</span>
                            <span>{$packageDetails['name']}</span>
                        </div>
                        <div class='invoice-row'>
                            <span>Amount:</span>
                            <span>{$transaction->getFormattedAmount()}</span>
                        </div>
                        <div class='invoice-row'>
                            <span>Transaction ID:</span>
                            <span>{$transaction->session_id}</span>
                        </div>
                        <div class='invoice-row'>
                            <span>Date:</span>
                            <span>{$transaction->created_at->format('F j, Y')}</span>
                        </div>
                        <div class='invoice-row total'>
                            <span>Total Paid:</span>
                            <span>{$transaction->getFormattedAmount()}</span>
                        </div>
                    </div>
                    
                    <p>Your subscription includes:</p>
                    <ul>";
        
        foreach ($packageDetails['features'] as $feature) {
            $body .= "<li>{$feature}</li>";
        }
        
        $body .= "
                    </ul>
                    
                    <a href='" . env('FRONTEND_URL') . "/dashboard-screen' class='button'>Access Your Dashboard</a>
                    
                    <p>If you have any questions about your subscription, please contact our support team.</p>
                    
                    <p>Best regards,<br>The Mewayz Team</p>
                </div>
                
                <div class='footer'>
                    <p>© 2025 Mewayz. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>";
        
        return $body;
    }

    /**
     * Subscription reminder email template
     */
    private function getSubscriptionReminderEmailTemplate($user, $subscription)
    {
        $packageDetails = $subscription->getPackageDetails();
        
        return "
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
                .content { line-height: 1.6; color: #333; }
                .button { display: inline-block; background-color: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
                .reminder { background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <div class='logo'>Mewayz</div>
                    <h1>Subscription Renewal Reminder</h1>
                </div>
                
                <div class='content'>
                    <p>Hi {$user->name},</p>
                    
                    <p>This is a friendly reminder that your Mewayz subscription will renew soon.</p>
                    
                    <div class='reminder'>
                        <strong>Subscription Details:</strong><br>
                        Plan: {$packageDetails['name']}<br>
                        Amount: {$subscription->getFormattedAmount()}<br>
                        Renewal Date: {$subscription->current_period_end->format('F j, Y')}
                    </div>
                    
                    <p>Your subscription will automatically renew unless you cancel before the renewal date.</p>
                    
                    <a href='" . env('FRONTEND_URL') . "/dashboard-screen/billing' class='button'>Manage Subscription</a>
                    
                    <p>If you have any questions about your subscription, please contact our support team.</p>
                    
                    <p>Best regards,<br>The Mewayz Team</p>
                </div>
                
                <div class='footer'>
                    <p>© 2025 Mewayz. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>";
    }

    /**
     * Team invitation email template
     */
    private function getTeamInvitationEmailTemplate($inviteeEmail, $inviterName, $workspaceName, $invitationUrl)
    {
        return "
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
                .content { line-height: 1.6; color: #333; }
                .button { display: inline-block; background-color: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
                .invitation { background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <div class='logo'>Mewayz</div>
                    <h1>Team Invitation</h1>
                </div>
                
                <div class='content'>
                    <p>Hi there,</p>
                    
                    <p>{$inviterName} has invited you to join the <strong>{$workspaceName}</strong> workspace on Mewayz.</p>
                    
                    <div class='invitation'>
                        <h3>You're invited to join</h3>
                        <h2>{$workspaceName}</h2>
                        <p>on Mewayz</p>
                    </div>
                    
                    <p>Mewayz is a comprehensive business management platform that helps teams collaborate and grow their business together.</p>
                    
                    <a href='{$invitationUrl}' class='button'>Accept Invitation</a>
                    
                    <p>If you don't want to accept this invitation, you can simply ignore this email.</p>
                    
                    <p>Best regards,<br>The Mewayz Team</p>
                </div>
                
                <div class='footer'>
                    <p>© 2025 Mewayz. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>";
    }
}