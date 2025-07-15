<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Workspace Invitation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            text-decoration: none;
        }
        .invitation-card {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 30px;
            margin: 20px 0;
        }
        .invitation-title {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 15px;
        }
        .workspace-name {
            font-size: 18px;
            font-weight: 500;
            color: #3b82f6;
            margin-bottom: 10px;
        }
        .role-badge {
            display: inline-block;
            background: #dbeafe;
            color: #1e40af;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            margin-bottom: 15px;
        }
        .personal-message {
            background: #ffffff;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
            font-style: italic;
        }
        .action-button {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
        }
        .action-button:hover {
            background: #2563eb;
        }
        .decline-link {
            color: #6b7280;
            text-decoration: none;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .expiry-notice {
            background: #fef3c7;
            color: #92400e;
            padding: 10px;
            border-radius: 4px;
            font-size: 14px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <a href="{{ config('app.frontend_url') }}" class="logo">Mewayz</a>
    </div>

    <div class="invitation-card">
        <h2 class="invitation-title">You've been invited to join a workspace</h2>
        
        <div class="workspace-name">{{ $workspace->name }}</div>
        
        <div class="role-badge">{{ ucfirst($invitation->role) }}</div>
        
        @if($invitation->personal_message)
        <div class="personal-message">
            "{{ $invitation->personal_message }}"
        </div>
        @endif
        
        <p>
            <strong>{{ $invitation->inviter->name }}</strong> has invited you to join their workspace on Mewayz.
        </p>
        
        <p>
            As a <strong>{{ ucfirst($invitation->role) }}</strong>@if($invitation->department) in the <strong>{{ $invitation->department }}</strong> department@endif, you'll have access to:
        </p>
        
        <ul>
            @if($invitation->role === 'owner')
                <li>Full workspace administration</li>
                <li>Billing and subscription management</li>
                <li>Team and role management</li>
            @elseif($invitation->role === 'admin')
                <li>Platform management</li>
                <li>Team management</li>
                <li>Content moderation</li>
            @elseif($invitation->role === 'editor')
                <li>Content creation and editing</li>
                <li>Campaign management</li>
                <li>Analytics access</li>
            @else
                <li>Content creation</li>
                <li>Basic analytics</li>
                <li>Collaboration tools</li>
            @endif
        </ul>
        
        <div class="expiry-notice">
            ⏰ This invitation expires on {{ $invitation->expires_at->format('F j, Y \a\t g:i A') }}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $inviteUrl }}" class="action-button">Accept Invitation</a>
        </div>
        
        <p style="text-align: center; margin-top: 20px;">
            <a href="{{ $inviteUrl }}" class="decline-link">or decline this invitation</a>
        </p>
    </div>

    <div class="footer">
        <p>
            If you didn't expect this invitation, you can safely ignore this email.
        </p>
        <p>
            This invitation was sent to {{ $invitation->email }} by {{ $invitation->inviter->name }}.
        </p>
        <p>
            © {{ date('Y') }} Mewayz Technologies Inc. All rights reserved.
        </p>
    </div>
</body>
</html>