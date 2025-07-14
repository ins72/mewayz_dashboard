import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req) => {
  // ✅ CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }

  try {
    // Parse request body
    const { invitationId, email, personalMessage, template = 'professional' } = await req.json();

    if (!invitationId || !email) {
      return new Response(JSON.stringify({
        error: "Missing required fields: invitationId and email"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(JSON.stringify({
        error: "Resend API key not configured"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // Prepare email templates
    const templates = {
      professional: {
        subject: "You're invited to join {{workspace_name}} on Mewayz",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
            <div style="background: #1f2937; padding: 40px 30px; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 28px;">You're Invited!</h1>
              <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 16px;">Join {{workspace_name}} on Mewayz</p>
            </div>
            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">Hi there,</p>
              <p style="font-size: 16px; color: #374151; line-height: 1.5; margin: 0 0 20px 0;">
                {{inviter_name}} has invited you to join <strong>{{workspace_name}}</strong> as a {{role}}.
              </p>
              ${personalMessage ? `
                <div style="background: #f9fafb; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
                  <p style="font-style: italic; color: #374151; margin: 0;">${personalMessage}</p>
                </div>
              ` : ''}
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{invitation_url}}" style="background: #3b82f6; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Accept Invitation</a>
              </div>
              <p style="font-size: 14px; color: #6b7280; margin: 20px 0 0 0;">
                This invitation expires on {{expiry_date}}. If you have any questions, feel free to reach out to {{inviter_name}}.
              </p>
            </div>
          </div>
        `
      },
      casual: {
        subject: "Come join us at {{workspace_name}}! 🎉",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 32px;">Hey! 👋</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">You're invited to join the team!</p>
            </div>
            <div style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #374151; margin: 0 0 20px 0;">
                {{inviter_name}} thinks you'd be a great addition to <strong>{{workspace_name}}</strong>! 🚀
              </p>
              ${personalMessage ? `
                <div style="background: #fef3c7; border-radius: 12px; padding: 20px; margin: 20px 0;">
                  <p style="color: #92400e; margin: 0; font-size: 16px;">💬 ${personalMessage}</p>
                </div>
              ` : ''}
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{invitation_url}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: 600; display: inline-block; font-size: 16px;">Join the Team! 🎯</a>
              </div>
              <p style="font-size: 14px; color: #6b7280; margin: 20px 0 0 0; text-align: center;">
                Invitation expires {{expiry_date}} ⏰
              </p>
            </div>
          </div>
        `
      }
    };

    // Get template
    const selectedTemplate = templates[template] || templates.professional;

    // Prepare email data with placeholder values
    const emailHtml = selectedTemplate.html
      .replace(/{{workspace_name}}/g, 'Your Workspace')
      .replace(/{{inviter_name}}/g, 'Team Admin')
      .replace(/{{role}}/g, 'team member')
      .replace(/{{invitation_url}}/g, `https://your-app.com/accept-invitation/${invitationId}`)
      .replace(/{{expiry_date}}/g, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString());

    const emailSubject = selectedTemplate.subject
      .replace(/{{workspace_name}}/g, 'Your Workspace');

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: [email],
        subject: emailSubject,
        html: emailHtml,
        tags: [
          { name: 'category', value: 'team_invitation' },
          { name: 'invitation_id', value: invitationId },
          { name: 'template', value: template }
        ]
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      return new Response(JSON.stringify({
        error: `Failed to send email: ${resendData.message || 'Unknown error'}`
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      messageId: resendData.id,
      email: email,
      template: template,
      invitationId: invitationId
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});