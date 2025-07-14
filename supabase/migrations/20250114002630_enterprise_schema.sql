-- Location: supabase/migrations/20250114002630_enterprise_schema.sql
-- Mewayz Enterprise Platform Schema - Building upon existing auth system

-- 1. Additional Types for Enterprise Features
CREATE TYPE public.subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid', 'trialing');
CREATE TYPE public.billing_cycle AS ENUM ('monthly', 'yearly');
CREATE TYPE public.subscription_tier AS ENUM ('free', 'pro', 'enterprise', 'custom');
CREATE TYPE public.pricing_model AS ENUM ('feature_based', 'flat_rate', 'usage_based');
CREATE TYPE public.workspace_member_role AS ENUM ('owner', 'admin', 'manager', 'member', 'viewer');
CREATE TYPE public.goal_category AS ENUM ('social', 'commerce', 'education', 'marketing', 'business', 'analytics');

-- 2. Enhanced Workspace Features (Extending existing workspaces table)
ALTER TABLE public.workspaces 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS subscription_tier public.subscription_tier DEFAULT 'free'::public.subscription_tier,
ADD COLUMN IF NOT EXISTS billing_cycle public.billing_cycle DEFAULT 'monthly'::public.billing_cycle,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS white_label_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS custom_domain VARCHAR,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS api_keys JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS analytics_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS gamification_settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 3. Enhanced User Profiles (Extending existing user_profiles table)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS phone VARCHAR,
ADD COLUMN IF NOT EXISTS timezone VARCHAR DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS language VARCHAR DEFAULT 'en',
ADD COLUMN IF NOT EXISTS auth_provider JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 4. Workspace Members & Roles
CREATE TABLE public.workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role public.workspace_member_role NOT NULL DEFAULT 'member'::public.workspace_member_role,
    permissions JSONB DEFAULT '{}',
    department VARCHAR,
    position VARCHAR,
    invited_by UUID REFERENCES public.user_profiles(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(workspace_id, user_id)
);

-- 5. Platform Goals & Features System
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    slug VARCHAR UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR,
    icon_color VARCHAR,
    category public.goal_category,
    required_features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    slug VARCHAR UNIQUE NOT NULL,
    description TEXT,
    goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
    tier_availability JSONB DEFAULT '{}',
    usage_limits JSONB DEFAULT '{}',
    dependencies JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Workspace-Specific Goal and Feature Management
CREATE TABLE public.workspace_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT TRUE,
    configuration JSONB DEFAULT '{}',
    setup_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(workspace_id, goal_id)
);

CREATE TABLE public.workspace_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    feature_id UUID REFERENCES public.features(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    usage_limit INTEGER,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(workspace_id, feature_id)
);

-- 7. Subscription & Billing System
CREATE TABLE public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    slug VARCHAR UNIQUE NOT NULL,
    description TEXT,
    pricing_model public.pricing_model DEFAULT 'flat_rate'::public.pricing_model,
    base_price_monthly DECIMAL(10,2) DEFAULT 0,
    base_price_yearly DECIMAL(10,2) DEFAULT 0,
    feature_price_monthly DECIMAL(10,2) DEFAULT 0,
    feature_price_yearly DECIMAL(10,2) DEFAULT 0,
    max_team_members INTEGER,
    max_workspaces INTEGER DEFAULT 1,
    included_features JSONB DEFAULT '[]',
    limitations JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.workspace_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
    stripe_subscription_id VARCHAR UNIQUE,
    stripe_customer_id VARCHAR,
    status public.subscription_status DEFAULT 'active'::public.subscription_status,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    stripe_payment_method_id VARCHAR UNIQUE,
    type VARCHAR,
    last_four VARCHAR,
    brand VARCHAR,
    exp_month INTEGER,
    exp_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Enhanced Indexes for Performance
CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX idx_goals_category ON public.goals(category);
CREATE INDEX idx_goals_slug ON public.goals(slug);
CREATE INDEX idx_features_goal_id ON public.features(goal_id);
CREATE INDEX idx_features_slug ON public.features(slug);
CREATE INDEX idx_workspace_goals_workspace_id ON public.workspace_goals(workspace_id);
CREATE INDEX idx_workspace_features_workspace_id ON public.workspace_features(workspace_id);
CREATE INDEX idx_subscription_plans_slug ON public.subscription_plans(slug);
CREATE INDEX idx_workspace_subscriptions_workspace_id ON public.workspace_subscriptions(workspace_id);
CREATE INDEX idx_payment_methods_workspace_id ON public.payment_methods(workspace_id);

-- 9. Enable RLS on New Tables
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- 10. Helper Functions for Complex Access Control
CREATE OR REPLACE FUNCTION public.is_workspace_member(workspace_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.workspace_id = workspace_uuid 
    AND wm.user_id = auth.uid() 
    AND wm.is_active = true
)
$$;

CREATE OR REPLACE FUNCTION public.has_workspace_role(workspace_uuid UUID, required_role public.workspace_member_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.workspace_id = workspace_uuid 
    AND wm.user_id = auth.uid() 
    AND wm.role = required_role
    AND wm.is_active = true
)
$$;

CREATE OR REPLACE FUNCTION public.can_manage_workspace_billing(workspace_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.workspace_id = workspace_uuid 
    AND wm.user_id = auth.uid()
    AND wm.role IN ('owner'::public.workspace_member_role, 'admin'::public.workspace_member_role)
    AND wm.is_active = true
)
$$;

-- 11. Updated Timestamp Triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER goals_updated_at BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER features_updated_at BEFORE UPDATE ON public.features
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER workspace_goals_updated_at BEFORE UPDATE ON public.workspace_goals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER workspace_features_updated_at BEFORE UPDATE ON public.workspace_features
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER workspace_subscriptions_updated_at BEFORE UPDATE ON public.workspace_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 12. Comprehensive RLS Policies

-- Goals (Public read, admin write)
CREATE POLICY "public_can_read_goals"
ON public.goals
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "admins_manage_goals"
ON public.goals
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Features (Public read, admin write)
CREATE POLICY "public_can_read_features"
ON public.features
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "admins_manage_features"
ON public.features
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Workspace Members (Workspace-specific access)
CREATE POLICY "workspace_members_view_members"
ON public.workspace_members
FOR SELECT
TO authenticated
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "workspace_admins_manage_members"
ON public.workspace_members
FOR ALL
TO authenticated
USING (
    public.has_workspace_role(workspace_id, 'owner'::public.workspace_member_role) OR
    public.has_workspace_role(workspace_id, 'admin'::public.workspace_member_role)
)
WITH CHECK (
    public.has_workspace_role(workspace_id, 'owner'::public.workspace_member_role) OR
    public.has_workspace_role(workspace_id, 'admin'::public.workspace_member_role)
);

-- Workspace Goals & Features
CREATE POLICY "workspace_members_view_goals"
ON public.workspace_goals
FOR SELECT
TO authenticated
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "workspace_admins_manage_goals"
ON public.workspace_goals
FOR ALL
TO authenticated
USING (
    public.has_workspace_role(workspace_id, 'owner'::public.workspace_member_role) OR
    public.has_workspace_role(workspace_id, 'admin'::public.workspace_member_role)
)
WITH CHECK (
    public.has_workspace_role(workspace_id, 'owner'::public.workspace_member_role) OR
    public.has_workspace_role(workspace_id, 'admin'::public.workspace_member_role)
);

CREATE POLICY "workspace_members_view_features"
ON public.workspace_features
FOR SELECT
TO authenticated
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "workspace_admins_manage_features"
ON public.workspace_features
FOR ALL
TO authenticated
USING (
    public.has_workspace_role(workspace_id, 'owner'::public.workspace_member_role) OR
    public.has_workspace_role(workspace_id, 'admin'::public.workspace_member_role)
)
WITH CHECK (
    public.has_workspace_role(workspace_id, 'owner'::public.workspace_member_role) OR
    public.has_workspace_role(workspace_id, 'admin'::public.workspace_member_role)
);

-- Subscription Plans (Public read, admin write)
CREATE POLICY "public_can_read_plans"
ON public.subscription_plans
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "admins_manage_plans"
ON public.subscription_plans
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Workspace Subscriptions & Payment Methods (Billing access)
CREATE POLICY "billing_managers_view_subscriptions"
ON public.workspace_subscriptions
FOR SELECT
TO authenticated
USING (public.can_manage_workspace_billing(workspace_id));

CREATE POLICY "billing_managers_manage_subscriptions"
ON public.workspace_subscriptions
FOR ALL
TO authenticated
USING (public.can_manage_workspace_billing(workspace_id))
WITH CHECK (public.can_manage_workspace_billing(workspace_id));

CREATE POLICY "billing_managers_view_payment_methods"
ON public.payment_methods
FOR SELECT
TO authenticated
USING (public.can_manage_workspace_billing(workspace_id));

CREATE POLICY "billing_managers_manage_payment_methods"
ON public.payment_methods
FOR ALL
TO authenticated
USING (public.can_manage_workspace_billing(workspace_id))
WITH CHECK (public.can_manage_workspace_billing(workspace_id));

-- 13. Comprehensive Sample Data
DO $$
DECLARE
    -- Existing users from previous migration
    admin_user_id UUID;
    regular_user_id UUID;
    existing_workspace_id UUID;
    
    -- New entities
    goal1_id UUID := gen_random_uuid();
    goal2_id UUID := gen_random_uuid();
    goal3_id UUID := gen_random_uuid();
    goal4_id UUID := gen_random_uuid();
    goal5_id UUID := gen_random_uuid();
    goal6_id UUID := gen_random_uuid();
    
    feature1_id UUID := gen_random_uuid();
    feature2_id UUID := gen_random_uuid();
    feature3_id UUID := gen_random_uuid();
    feature4_id UUID := gen_random_uuid();
    feature5_id UUID := gen_random_uuid();
    feature6_id UUID := gen_random_uuid();
    feature7_id UUID := gen_random_uuid();
    feature8_id UUID := gen_random_uuid();
    
    free_plan_id UUID := gen_random_uuid();
    pro_plan_id UUID := gen_random_uuid();
    enterprise_plan_id UUID := gen_random_uuid();
BEGIN
    -- Get existing user and workspace IDs
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE email = 'admin@mewayz.com' LIMIT 1;
    SELECT id INTO regular_user_id FROM public.user_profiles WHERE email = 'user@mewayz.com' LIMIT 1;
    SELECT id INTO existing_workspace_id FROM public.workspaces WHERE slug = 'personal-workspace' LIMIT 1;
    
    -- Insert comprehensive goals
    INSERT INTO public.goals (id, name, slug, description, icon_name, icon_color, category, sort_order) VALUES
        (goal1_id, 'Instagram Management', 'instagram', 'Manage Instagram content, scheduling, and analytics', 'Instagram', '#FF6B6B', 'social'::public.goal_category, 1),
        (goal2_id, 'Link in Bio', 'link_in_bio', 'Create custom landing pages and link management', 'Link', '#45B7D1', 'marketing'::public.goal_category, 2),
        (goal3_id, 'Course Creation', 'courses', 'Build and sell online courses with multimedia content', 'GraduationCap', '#F9CA24', 'education'::public.goal_category, 3),
        (goal4_id, 'E-commerce', 'ecommerce', 'Manage online store, products, and inventory', 'ShoppingBag', '#6C5CE7', 'commerce'::public.goal_category, 4),
        (goal5_id, 'CRM', 'crm', 'Customer relationship management and lead tracking', 'Users', '#FF3838', 'business'::public.goal_category, 5),
        (goal6_id, 'Analytics Hub', 'analytics', 'Unified analytics and reporting across all platforms', 'BarChart3', '#26DE81', 'analytics'::public.goal_category, 6);

    -- Insert comprehensive features (40+ features across all goals)
    INSERT INTO public.features (id, name, slug, description, goal_id, tier_availability, usage_limits, sort_order) VALUES
        -- Instagram Management Features
        (feature1_id, 'Post Scheduler', 'post_scheduler', 'Schedule Instagram posts in advance', goal1_id, '{"free": true, "pro": true, "enterprise": true}'::jsonb, '{"free": 10, "pro": 100, "enterprise": -1}'::jsonb, 1),
        (feature2_id, 'Content Calendar', 'content_calendar', 'Visual content planning calendar', goal1_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 1, "enterprise": 1}'::jsonb, 2),
        (feature3_id, 'Hashtag Analytics', 'hashtag_analytics', 'Track hashtag performance and suggestions', goal1_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 50, "enterprise": -1}'::jsonb, 3),
        (feature4_id, 'Story Templates', 'story_templates', 'Pre-designed Instagram story templates', goal1_id, '{"free": true, "pro": true, "enterprise": true}'::jsonb, '{"free": 5, "pro": 50, "enterprise": -1}'::jsonb, 4),
        (feature5_id, 'Competitor Analysis', 'competitor_analysis', 'Monitor competitor Instagram activity', goal1_id, '{"free": false, "pro": false, "enterprise": true}'::jsonb, '{"enterprise": 10}'::jsonb, 5),
        (feature6_id, 'Instagram Insights', 'instagram_insights', 'Detailed Instagram analytics and reports', goal1_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 1, "enterprise": 1}'::jsonb, 6),
        (feature7_id, 'Auto Reposting', 'auto_reposting', 'Automatically repost top-performing content', goal1_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 5, "enterprise": -1}'::jsonb, 7),
        (feature8_id, 'Bulk Upload', 'bulk_upload', 'Upload multiple posts at once', goal1_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 20, "enterprise": -1}'::jsonb, 8),
        
        -- Link in Bio Features
        (gen_random_uuid(), 'Custom Landing Pages', 'custom_landing_pages', 'Create personalized bio link pages', goal2_id, '{"free": true, "pro": true, "enterprise": true}'::jsonb, '{"free": 1, "pro": 5, "enterprise": -1}'::jsonb, 1),
        (gen_random_uuid(), 'Link Analytics', 'link_analytics', 'Track clicks and engagement on bio links', goal2_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 1, "enterprise": 1}'::jsonb, 2),
        (gen_random_uuid(), 'QR Code Generator', 'qr_code_generator', 'Generate QR codes for bio links', goal2_id, '{"free": true, "pro": true, "enterprise": true}'::jsonb, '{"free": 3, "pro": -1, "enterprise": -1}'::jsonb, 3),
        (gen_random_uuid(), 'Custom Domains', 'custom_domains', 'Use your own domain for bio links', goal2_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 3, "enterprise": -1}'::jsonb, 4),
        (gen_random_uuid(), 'Email Capture', 'email_capture', 'Collect email addresses through bio links', goal2_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 500, "enterprise": -1}'::jsonb, 5),
        (gen_random_uuid(), 'Social Media Integration', 'social_media_integration', 'Connect all social media profiles', goal2_id, '{"free": true, "pro": true, "enterprise": true}'::jsonb, '{"free": 5, "pro": -1, "enterprise": -1}'::jsonb, 6),
        
        -- Course Creation Features
        (gen_random_uuid(), 'Video Hosting', 'video_hosting', 'Host and stream course videos securely', goal3_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 50, "enterprise": -1}'::jsonb, 1),
        (gen_random_uuid(), 'Quiz Builder', 'quiz_builder', 'Create interactive quizzes and assessments', goal3_id, '{"free": true, "pro": true, "enterprise": true}'::jsonb, '{"free": 3, "pro": -1, "enterprise": -1}'::jsonb, 2),
        (gen_random_uuid(), 'Student Progress Tracking', 'student_progress', 'Monitor student completion and engagement', goal3_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 100, "enterprise": -1}'::jsonb, 3),
        (gen_random_uuid(), 'Certificate Generator', 'certificate_generator', 'Generate completion certificates automatically', goal3_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 100, "enterprise": -1}'::jsonb, 4),
        (gen_random_uuid(), 'Discussion Forums', 'discussion_forums', 'Student community and discussion boards', goal3_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 5, "enterprise": -1}'::jsonb, 5),
        (gen_random_uuid(), 'Assignment Submissions', 'assignment_submissions', 'Collect and grade student assignments', goal3_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 50, "enterprise": -1}'::jsonb, 6),
        (gen_random_uuid(), 'Live Streaming', 'live_streaming', 'Host live classes and webinars', goal3_id, '{"free": false, "pro": false, "enterprise": true}'::jsonb, '{"enterprise": 10}'::jsonb, 7),
        (gen_random_uuid(), 'Course Templates', 'course_templates', 'Pre-built course structure templates', goal3_id, '{"free": true, "pro": true, "enterprise": true}'::jsonb, '{"free": 3, "pro": 20, "enterprise": -1}'::jsonb, 8),
        
        -- E-commerce Features
        (gen_random_uuid(), 'Product Catalog', 'product_catalog', 'Manage product inventory and catalog', goal4_id, '{"free": true, "pro": true, "enterprise": true}'::jsonb, '{"free": 10, "pro": 1000, "enterprise": -1}'::jsonb, 1),
        (gen_random_uuid(), 'Payment Processing', 'payment_processing', 'Accept payments through multiple gateways', goal4_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 1, "enterprise": 1}'::jsonb, 2),
        (gen_random_uuid(), 'Inventory Management', 'inventory_management', 'Track stock levels and automate reordering', goal4_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 1000, "enterprise": -1}'::jsonb, 3),
        (gen_random_uuid(), 'Shipping Calculator', 'shipping_calculator', 'Calculate shipping costs automatically', goal4_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 1, "enterprise": 1}'::jsonb, 4),
        (gen_random_uuid(), 'Order Management', 'order_management', 'Process and track customer orders', goal4_id, '{"free": true, "pro": true, "enterprise": true}'::jsonb, '{"free": 25, "pro": -1, "enterprise": -1}'::jsonb, 5),
        (gen_random_uuid(), 'Customer Reviews', 'customer_reviews', 'Collect and display product reviews', goal4_id, '{"free": true, "pro": true, "enterprise": true}'::jsonb, '{"free": 50, "pro": -1, "enterprise": -1}'::jsonb, 6),
        (gen_random_uuid(), 'Discount Codes', 'discount_codes', 'Create and manage promotional codes', goal4_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 10, "enterprise": -1}'::jsonb, 7),
        (gen_random_uuid(), 'Analytics Dashboard', 'ecommerce_analytics', 'Sales and customer analytics dashboard', goal4_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 1, "enterprise": 1}'::jsonb, 8),
        
        -- CRM Features
        (gen_random_uuid(), 'Contact Management', 'contact_management', 'Organize and manage customer contacts', goal5_id, '{"free": true, "pro": true, "enterprise": true}'::jsonb, '{"free": 100, "pro": 5000, "enterprise": -1}'::jsonb, 1),
        (gen_random_uuid(), 'Lead Tracking', 'lead_tracking', 'Track leads through sales pipeline', goal5_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 500, "enterprise": -1}'::jsonb, 2),
        (gen_random_uuid(), 'Email Templates', 'email_templates', 'Pre-designed email marketing templates', goal5_id, '{"free": true, "pro": true, "enterprise": true}'::jsonb, '{"free": 5, "pro": 50, "enterprise": -1}'::jsonb, 3),
        (gen_random_uuid(), 'Task Automation', 'task_automation', 'Automate repetitive CRM tasks', goal5_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 10, "enterprise": -1}'::jsonb, 4),
        (gen_random_uuid(), 'Sales Pipeline', 'sales_pipeline', 'Visual sales pipeline management', goal5_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 1, "enterprise": 1}'::jsonb, 5),
        (gen_random_uuid(), 'Customer Support', 'customer_support', 'Built-in customer support ticketing', goal5_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 100, "enterprise": -1}'::jsonb, 6),
        (gen_random_uuid(), 'Meeting Scheduler', 'meeting_scheduler', 'Schedule and manage customer meetings', goal5_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 50, "enterprise": -1}'::jsonb, 7),
        (gen_random_uuid(), 'Document Management', 'document_management', 'Store and share customer documents', goal5_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 1000, "enterprise": -1}'::jsonb, 8),
        
        -- Analytics Hub Features
        (gen_random_uuid(), 'Cross-Platform Analytics', 'cross_platform_analytics', 'Unified analytics across all platforms', goal6_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 1, "enterprise": 1}'::jsonb, 1),
        (gen_random_uuid(), 'Custom Reports', 'custom_reports', 'Create custom analytics reports', goal6_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 10, "enterprise": -1}'::jsonb, 2),
        (gen_random_uuid(), 'Real-time Dashboards', 'realtime_dashboards', 'Live data dashboards and monitoring', goal6_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 3, "enterprise": -1}'::jsonb, 3),
        (gen_random_uuid(), 'Data Export', 'data_export', 'Export analytics data in multiple formats', goal6_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 10, "enterprise": -1}'::jsonb, 4),
        (gen_random_uuid(), 'Goal Tracking', 'goal_tracking', 'Set and track business goals and KPIs', goal6_id, '{"free": true, "pro": true, "enterprise": true}'::jsonb, '{"free": 3, "pro": 20, "enterprise": -1}'::jsonb, 5),
        (gen_random_uuid(), 'Automated Insights', 'automated_insights', 'AI-powered analytics insights and recommendations', goal6_id, '{"free": false, "pro": false, "enterprise": true}'::jsonb, '{"enterprise": 1}'::jsonb, 6),
        (gen_random_uuid(), 'Benchmarking', 'benchmarking', 'Compare performance against industry benchmarks', goal6_id, '{"free": false, "pro": false, "enterprise": true}'::jsonb, '{"enterprise": 1}'::jsonb, 7),
        (gen_random_uuid(), 'Alert System', 'alert_system', 'Set up alerts for important metric changes', goal6_id, '{"free": false, "pro": true, "enterprise": true}'::jsonb, '{"pro": 5, "enterprise": -1}'::jsonb, 8);

    -- Insert subscription plans
    INSERT INTO public.subscription_plans (id, name, slug, description, pricing_model, base_price_monthly, base_price_yearly, max_team_members, max_workspaces, included_features, limitations) VALUES
        (free_plan_id, 'Free', 'free', 'Perfect for getting started with basic features', 'flat_rate'::public.pricing_model, 0, 0, 1, 1, '[]'::jsonb, '{"api_calls": 1000, "storage": "1GB"}'::jsonb),
        (pro_plan_id, 'Pro', 'pro', 'Advanced features for growing businesses', 'flat_rate'::public.pricing_model, 29.99, 299.99, 10, 3, '[]'::jsonb, '{"api_calls": 50000, "storage": "100GB"}'::jsonb),
        (enterprise_plan_id, 'Enterprise', 'enterprise', 'Full-featured solution for large organizations', 'flat_rate'::public.pricing_model, 99.99, 999.99, -1, -1, '[]'::jsonb, '{"api_calls": -1, "storage": "1TB"}'::jsonb);

    -- Add workspace members (using existing workspace)
    IF existing_workspace_id IS NOT NULL AND admin_user_id IS NOT NULL AND regular_user_id IS NOT NULL THEN
        INSERT INTO public.workspace_members (workspace_id, user_id, role, department, position, invited_by) VALUES
            (existing_workspace_id, admin_user_id, 'owner'::public.workspace_member_role, 'Management', 'Founder', NULL),
            (existing_workspace_id, regular_user_id, 'member'::public.workspace_member_role, 'Marketing', 'Content Creator', admin_user_id);
        
        -- Enable some goals for the workspace
        INSERT INTO public.workspace_goals (workspace_id, goal_id, is_enabled, setup_completed) VALUES
            (existing_workspace_id, goal1_id, true, false),
            (existing_workspace_id, goal2_id, true, true),
            (existing_workspace_id, goal6_id, true, false);
        
        -- Enable some features for the workspace
        INSERT INTO public.workspace_features (workspace_id, feature_id, is_enabled, usage_count, usage_limit) VALUES
            (existing_workspace_id, feature1_id, true, 5, 10),
            (existing_workspace_id, feature2_id, false, 0, 1);
        
        -- Add workspace subscription
        INSERT INTO public.workspace_subscriptions (workspace_id, plan_id, status, current_period_start, current_period_end) VALUES
            (existing_workspace_id, free_plan_id, 'active'::public.subscription_status, NOW(), NOW() + INTERVAL '1 month');
    END IF;

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;

-- 14. Utility Functions for Enterprise Features

-- Function to check if user has access to a specific feature
CREATE OR REPLACE FUNCTION public.user_has_feature_access(workspace_uuid UUID, feature_slug TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_member BOOLEAN;
    feature_enabled BOOLEAN;
    usage_limit INTEGER;
    current_usage INTEGER;
BEGIN
    -- Check if user is workspace member
    SELECT public.is_workspace_member(workspace_uuid) INTO is_member;
    IF NOT is_member THEN
        RETURN FALSE;
    END IF;
    
    -- Check if feature is enabled and within limits
    SELECT 
        wf.is_enabled,
        wf.usage_limit,
        wf.usage_count
    INTO feature_enabled, usage_limit, current_usage
    FROM public.workspace_features wf
    JOIN public.features f ON wf.feature_id = f.id
    WHERE wf.workspace_id = workspace_uuid AND f.slug = feature_slug;
    
    -- If feature not found or disabled
    IF NOT FOUND OR NOT feature_enabled THEN
        RETURN FALSE;
    END IF;
    
    -- Check usage limits (-1 means unlimited)
    IF usage_limit = -1 OR current_usage < usage_limit THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$;

-- Function to increment feature usage
CREATE OR REPLACE FUNCTION public.increment_feature_usage(workspace_uuid UUID, feature_slug TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.workspace_features 
    SET usage_count = usage_count + 1
    FROM public.features f
    WHERE workspace_features.feature_id = f.id 
    AND workspace_features.workspace_id = workspace_uuid 
    AND f.slug = feature_slug
    AND (workspace_features.usage_limit = -1 OR workspace_features.usage_count < workspace_features.usage_limit);
    
    RETURN FOUND;
END;
$$;

-- Enhanced cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_enterprise_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user_ids_to_delete UUID[];
BEGIN
    -- Get auth user IDs first
    SELECT ARRAY_AGG(id) INTO auth_user_ids_to_delete
    FROM auth.users
    WHERE email LIKE '%@mewayz.com';

    -- Delete in dependency order (children first)
    DELETE FROM public.payment_methods WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = ANY(auth_user_ids_to_delete)
    );
    DELETE FROM public.workspace_subscriptions WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = ANY(auth_user_ids_to_delete)
    );
    DELETE FROM public.workspace_features WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = ANY(auth_user_ids_to_delete)
    );
    DELETE FROM public.workspace_goals WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = ANY(auth_user_ids_to_delete)
    );
    DELETE FROM public.workspace_members WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = ANY(auth_user_ids_to_delete)
    );
    DELETE FROM public.workspaces WHERE owner_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.user_profiles WHERE id = ANY(auth_user_ids_to_delete);
    
    -- Delete auth.users last
    DELETE FROM auth.users WHERE id = ANY(auth_user_ids_to_delete);
    
    -- Clean up enterprise data (goals, features, plans)
    DELETE FROM public.features;
    DELETE FROM public.goals;
    DELETE FROM public.subscription_plans;
    
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key constraint prevents deletion: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$$;