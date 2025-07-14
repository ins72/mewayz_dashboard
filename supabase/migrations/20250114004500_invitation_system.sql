-- Location: supabase/migrations/20250114004500_invitation_system.sql
-- Advanced Invitation System & User Onboarding - Building upon existing enterprise schema

-- 1. Invitation Types and Status Enums
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired', 'cancelled');
CREATE TYPE public.auth_provider AS ENUM ('email', 'google', 'apple', 'microsoft', 'sso');

-- 2. Main Invitations Table
CREATE TABLE public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role public.workspace_member_role DEFAULT 'member'::public.workspace_member_role,
    permissions JSONB DEFAULT '{}',
    department TEXT,
    position TEXT,
    invited_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    personal_message TEXT,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    status public.invitation_status DEFAULT 'pending'::public.invitation_status,
    reminders_sent INTEGER DEFAULT 0,
    accepted_at TIMESTAMPTZ,
    declined_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- 3. Invitation Analytics Table
CREATE TABLE public.invitation_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'sent', 'opened', 'clicked', 'accepted', 'declined' event_data JSONB DEFAULT'{}',
    ip_address TEXT,
    user_agent TEXT,
    occurred_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Invitation Templates Table
CREATE TABLE public.invitation_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    template_type TEXT DEFAULT 'professional', -- 'professional', 'casual', 'branded'
    html_content TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bulk Invitation Batches Table
CREATE TABLE public.invitation_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    total_invitations INTEGER DEFAULT 0,
    successful_invitations INTEGER DEFAULT 0,
    failed_invitations INTEGER DEFAULT 0,
    batch_data JSONB DEFAULT '{}',
    status TEXT DEFAULT 'processing', -- 'processing', 'completed', 'failed'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- 6. User Onboarding Progress Table
CREATE TABLE public.user_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    invitation_id UUID REFERENCES public.invitations(id) ON DELETE SET NULL,
    onboarding_step TEXT DEFAULT 'welcome',
    completed_steps JSONB DEFAULT '[]',
    progress_percentage INTEGER DEFAULT 0,
    welcome_shown BOOLEAN DEFAULT FALSE,
    profile_completed BOOLEAN DEFAULT FALSE,
    first_action_taken BOOLEAN DEFAULT FALSE,
    tour_completed BOOLEAN DEFAULT FALSE,
    onboarding_data JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    
    UNIQUE(user_id, workspace_id)
);

-- 7. Essential Indexes for Performance
CREATE INDEX idx_invitations_workspace_id ON public.invitations(workspace_id);
CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_status ON public.invitations(status);
CREATE INDEX idx_invitations_expires_at ON public.invitations(expires_at);
CREATE INDEX idx_invitations_invited_by ON public.invitations(invited_by);
CREATE INDEX idx_invitation_analytics_invitation_id ON public.invitation_analytics(invitation_id);
CREATE INDEX idx_invitation_analytics_event_type ON public.invitation_analytics(event_type);
CREATE INDEX idx_invitation_templates_workspace_id ON public.invitation_templates(workspace_id);
CREATE INDEX idx_invitation_batches_workspace_id ON public.invitation_batches(workspace_id);
CREATE INDEX idx_user_onboarding_user_workspace ON public.user_onboarding(user_id, workspace_id);

-- 8. Enable RLS on All Tables
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

-- 9. Helper Functions for Invitation Access Control
CREATE OR REPLACE FUNCTION public.can_manage_invitations(workspace_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.workspace_id = workspace_uuid 
    AND wm.user_id = auth.uid()
    AND wm.role IN ('owner'::public.workspace_member_role, 'admin'::public.workspace_member_role, 'manager'::public.workspace_member_role)
    AND wm.is_active = true
)
$$;

CREATE OR REPLACE FUNCTION public.can_view_invitation(invitation_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.invitations i
    WHERE i.id = invitation_uuid
    AND (
        public.can_manage_invitations(i.workspace_id) OR
        (i.email IN (
            SELECT email FROM public.user_profiles WHERE id = auth.uid()
        ))
    )
)
$$;

CREATE OR REPLACE FUNCTION public.is_invitation_valid(invitation_token TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.invitations i
    WHERE i.token = invitation_token
    AND i.status = 'pending'::public.invitation_status
    AND i.expires_at > CURRENT_TIMESTAMP
)
$$;

-- 10. Secure Token Generation Function
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    token_length INTEGER := 64;
    possible_chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    token TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..token_length LOOP
        token := token || substr(possible_chars, floor(random() * length(possible_chars) + 1)::INTEGER, 1);
    END LOOP;
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.invitations WHERE token = token) LOOP
        token := '';
        FOR i IN 1..token_length LOOP
            token := token || substr(possible_chars, floor(random() * length(possible_chars) + 1)::INTEGER, 1);
        END LOOP;
    END LOOP;
    
    RETURN token;
END;
$$;

-- 11. Invitation Lifecycle Functions
CREATE OR REPLACE FUNCTION public.create_invitation(
    workspace_uuid UUID,
    invitation_email TEXT,
    invitation_role public.workspace_member_role DEFAULT 'member'::public.workspace_member_role,
    invitation_department TEXT DEFAULT NULL,
    invitation_position TEXT DEFAULT NULL,
    personal_msg TEXT DEFAULT NULL,
    expiry_days INTEGER DEFAULT 7
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    invitation_id UUID;
    invitation_token TEXT;
BEGIN
    -- Check permissions
    IF NOT public.can_manage_invitations(workspace_uuid) THEN
        RAISE EXCEPTION 'Insufficient permissions to create invitations';
    END IF;
    
    -- Generate unique token
    invitation_token := public.generate_invitation_token();
    
    -- Create invitation
    INSERT INTO public.invitations (
        workspace_id,
        email,
        role,
        department,
        position,
        invited_by,
        personal_message,
        token,
        expires_at
    ) VALUES (
        workspace_uuid,
        lower(invitation_email),
        invitation_role,
        invitation_department,
        invitation_position,
        auth.uid(),
        personal_msg,
        invitation_token,
        CURRENT_TIMESTAMP + (expiry_days || ' days')::INTERVAL
    ) RETURNING id INTO invitation_id;
    
    -- Log analytics event
    INSERT INTO public.invitation_analytics (invitation_id, event_type, event_data)
    VALUES (invitation_id, 'created', jsonb_build_object('invited_by', auth.uid()));
    
    RETURN invitation_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    invitation_record RECORD;
    user_uuid UUID;
    member_id UUID;
    onboarding_id UUID;
BEGIN
    -- Get current user
    user_uuid := auth.uid();
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to accept invitation';
    END IF;
    
    -- Get invitation details
    SELECT * INTO invitation_record
    FROM public.invitations
    WHERE token = invitation_token
    AND status = 'pending'::public.invitation_status
    AND expires_at > CURRENT_TIMESTAMP;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or expired invitation token';
    END IF;
    
    -- Check if user is already a member
    IF EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = invitation_record.workspace_id
        AND user_id = user_uuid
        AND is_active = true
    ) THEN
        RAISE EXCEPTION 'User is already a member of this workspace';
    END IF;
    
    -- Accept invitation
    UPDATE public.invitations
    SET status = 'accepted'::public.invitation_status,
        accepted_at = CURRENT_TIMESTAMP
    WHERE id = invitation_record.id;
    
    -- Add user to workspace
    INSERT INTO public.workspace_members (
        workspace_id,
        user_id,
        role,
        department,
        position,
        invited_by
    ) VALUES (
        invitation_record.workspace_id,
        user_uuid,
        invitation_record.role,
        invitation_record.department,
        invitation_record.position,
        invitation_record.invited_by
    ) RETURNING id INTO member_id;
    
    -- Create onboarding record
    INSERT INTO public.user_onboarding (
        user_id,
        workspace_id,
        invitation_id
    ) VALUES (
        user_uuid,
        invitation_record.workspace_id,
        invitation_record.id
    ) RETURNING id INTO onboarding_id;
    
    -- Log analytics
    INSERT INTO public.invitation_analytics (invitation_id, event_type, event_data)
    VALUES (invitation_record.id, 'accepted', jsonb_build_object('user_id', user_uuid));
    
    RETURN jsonb_build_object(
        'success', true,
        'workspace_id', invitation_record.workspace_id,
        'member_id', member_id,
        'onboarding_id', onboarding_id,
        'role', invitation_record.role
    );
END;
$$;

-- 12. Auto-Update Triggers
CREATE TRIGGER invitations_updated_at 
BEFORE UPDATE ON public.invitations
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER invitation_templates_updated_at 
BEFORE UPDATE ON public.invitation_templates
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 13. RLS Policies

-- Invitations Access Control
CREATE POLICY "workspace_managers_view_invitations"
ON public.invitations
FOR SELECT
TO authenticated
USING (public.can_manage_invitations(workspace_id));

CREATE POLICY "workspace_managers_manage_invitations"
ON public.invitations
FOR ALL
TO authenticated
USING (public.can_manage_invitations(workspace_id))
WITH CHECK (public.can_manage_invitations(workspace_id));

CREATE POLICY "users_view_own_invitations"
ON public.invitations
FOR SELECT
TO authenticated
USING (
    email IN (
        SELECT email FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- Invitation Analytics Access
CREATE POLICY "workspace_managers_view_analytics"
ON public.invitation_analytics
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.invitations i
        WHERE i.id = invitation_id
        AND public.can_manage_invitations(i.workspace_id)
    )
);

CREATE POLICY "workspace_managers_manage_analytics"
ON public.invitation_analytics
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.invitations i
        WHERE i.id = invitation_id
        AND public.can_manage_invitations(i.workspace_id)
    )
);

-- Invitation Templates Access
CREATE POLICY "workspace_managers_manage_templates"
ON public.invitation_templates
FOR ALL
TO authenticated
USING (public.can_manage_invitations(workspace_id))
WITH CHECK (public.can_manage_invitations(workspace_id));

-- Invitation Batches Access
CREATE POLICY "workspace_managers_manage_batches"
ON public.invitation_batches
FOR ALL
TO authenticated
USING (public.can_manage_invitations(workspace_id))
WITH CHECK (public.can_manage_invitations(workspace_id));

-- User Onboarding Access
CREATE POLICY "users_own_onboarding"
ON public.user_onboarding
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "workspace_managers_view_onboarding"
ON public.user_onboarding
FOR SELECT
TO authenticated
USING (public.can_manage_invitations(workspace_id));

-- 14. Default Invitation Templates
DO $$
DECLARE
    existing_workspace_id UUID;
BEGIN
    -- Get existing workspace
    SELECT id INTO existing_workspace_id FROM public.workspaces WHERE slug = 'personal-workspace' LIMIT 1;
    
    IF existing_workspace_id IS NOT NULL THEN
        -- Professional Template
        INSERT INTO public.invitation_templates (workspace_id, name, subject, template_type, html_content, variables, is_default) VALUES
        (existing_workspace_id, 'Professional Invitation', 'Join {{workspace_name}} on Mewayz', 'professional', 
         '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
            <div style="background: #1f2937; padding: 40px 30px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 28px;">You''re Invited!</h1>
                <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 16px;">Join {{workspace_name}} on Mewayz</p>
            </div>
            <div style="padding: 40px 30px;">
                <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">Hi there,</p>
                <p style="font-size: 16px; color: #374151; line-height: 1.5; margin: 0 0 20px 0;">
                    {{inviter_name}} has invited you to join <strong>{{workspace_name}}</strong> as a {{role}}.
                </p>
                {{#if personal_message}}
                <div style="background: #f9fafb; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
                    <p style="font-style: italic; color: #374151; margin: 0;">{{personal_message}}</p>
                </div>
                {{/if}}
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{invitation_url}}" style="background: #3b82f6; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Accept Invitation</a>
                </div>
                <p style="font-size: 14px; color: #6b7280; margin: 20px 0 0 0;">
                    This invitation expires on {{expiry_date}}. If you have any questions, feel free to reach out to {{inviter_name}}.
                </p>
            </div>
        </div>',
         '{"workspace_name": "", "inviter_name": "", "role": "", "personal_message": "", "invitation_url": "", "expiry_date": ""}'::jsonb,
         true),
        
        -- Casual Template
        (existing_workspace_id, 'Casual Invitation', 'Come join us at {{workspace_name}}! 🎉', 'casual',
         '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 32px;">Hey! 👋</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">You''re invited to join the team!</p>
            </div>
            <div style="padding: 40px 30px;">
                <p style="font-size: 18px; color: #374151; margin: 0 0 20px 0;">
                    {{inviter_name}} thinks you''d be a great addition to <strong>{{workspace_name}}</strong>! 🚀
                </p>
                {{#if personal_message}}
                <div style="background: #fef3c7; border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <p style="color: #92400e; margin: 0; font-size: 16px;">💬 {{personal_message}}</p>
                </div>
                {{/if}}
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{invitation_url}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: 600; display: inline-block; font-size: 16px;">Join the Team! 🎯</a>
                </div>
                <p style="font-size: 14px; color: #6b7280; margin: 20px 0 0 0; text-align: center;">
                    Invitation expires {{expiry_date}} ⏰
                </p>
            </div>
        </div>',
         '{"workspace_name": "", "inviter_name": "", "role": "", "personal_message": "", "invitation_url": "", "expiry_date": ""}'::jsonb,
         false);
    END IF;

EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Invitation template data already exists, skipping insertion';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting invitation template data: %', SQLERRM;
END $$;

-- 15. Cleanup function for invitation system
CREATE OR REPLACE FUNCTION public.cleanup_expired_invitations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Update expired invitations
    UPDATE public.invitations
    SET status = 'expired'::public.invitation_status
    WHERE status = 'pending'::public.invitation_status
    AND expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    -- Log cleanup analytics
    IF expired_count > 0 THEN
        INSERT INTO public.invitation_analytics (invitation_id, event_type, event_data)
        SELECT id, 'expired', jsonb_build_object('cleanup_run', CURRENT_TIMESTAMP)
        FROM public.invitations
        WHERE status = 'expired'::public.invitation_status
        AND updated_at >= CURRENT_TIMESTAMP - INTERVAL '1 minute';
    END IF;
    
    RETURN expired_count;
END;
$$;

-- 16. Sample Invitation Data for Development
DO $$
DECLARE
    existing_workspace_id UUID;
    admin_user_id UUID;
    sample_invitation_id UUID;
BEGIN
    -- Get existing workspace and admin user
    SELECT id INTO existing_workspace_id FROM public.workspaces WHERE slug = 'personal-workspace' LIMIT 1;
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE email = 'admin@mewayz.com' LIMIT 1;
    
    IF existing_workspace_id IS NOT NULL AND admin_user_id IS NOT NULL THEN
        -- Create sample invitation
        sample_invitation_id := public.create_invitation(
            existing_workspace_id,
            'newuser@example.com',
            'member'::public.workspace_member_role,
            'Marketing',
            'Content Creator',
            'Welcome to our team! We are excited to have you join us and contribute to our marketing efforts.',
            14
        );
        
        -- Add some analytics events
        INSERT INTO public.invitation_analytics (invitation_id, event_type, event_data) VALUES
            (sample_invitation_id, 'sent', jsonb_build_object('email_provider', 'resend', 'template', 'professional')),
            (sample_invitation_id, 'opened', jsonb_build_object('opened_at', CURRENT_TIMESTAMP - INTERVAL '2 hours'));
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating sample invitation: %', SQLERRM;
END $$;