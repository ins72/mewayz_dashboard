-- Location: supabase/migrations/20250114003500_workspace_wizard_schema.sql
-- Workspace Setup Wizard Enhancement - Building upon existing enterprise schema

-- 1. Add wizard-specific columns to workspaces table
ALTER TABLE public.workspaces 
ADD COLUMN IF NOT EXISTS industry VARCHAR,
ADD COLUMN IF NOT EXISTS team_size VARCHAR,
ADD COLUMN IF NOT EXISTS primary_goal TEXT,
ADD COLUMN IF NOT EXISTS wizard_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS wizard_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS wizard_data JSONB DEFAULT '{}';

-- 2. Add indexes for wizard queries
CREATE INDEX IF NOT EXISTS idx_workspaces_wizard_completed ON public.workspaces(wizard_completed);
CREATE INDEX IF NOT EXISTS idx_workspaces_industry ON public.workspaces(industry);

-- 3. Add industry data for workspace setup
CREATE TABLE public.industries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    slug VARCHAR UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR,
    suggested_goals JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS on industries table
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;

-- 5. Public read policy for industries
CREATE POLICY "public_can_read_industries"
ON public.industries
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "admins_manage_industries"
ON public.industries
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6. Add goal priorities table for workspace goal selection
CREATE TABLE public.workspace_goal_priorities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
    priority_level INTEGER NOT NULL CHECK (priority_level >= 1 AND priority_level <= 6),
    setup_now BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(workspace_id, goal_id),
    UNIQUE(workspace_id, priority_level)
);

-- 7. Enable RLS and create policies for goal priorities
ALTER TABLE public.workspace_goal_priorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_members_view_goal_priorities"
ON public.workspace_goal_priorities
FOR SELECT
TO authenticated
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "workspace_admins_manage_goal_priorities"
ON public.workspace_goal_priorities
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

-- 8. Updated timestamp trigger for goal priorities
CREATE TRIGGER workspace_goal_priorities_updated_at 
BEFORE UPDATE ON public.workspace_goal_priorities
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 9. Helper function to check workspace slug availability
CREATE OR REPLACE FUNCTION public.is_workspace_slug_available(slug_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT NOT EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE slug = slug_to_check
)
$$;

-- 10. Function to generate workspace slug from name
CREATE OR REPLACE FUNCTION public.generate_workspace_slug(workspace_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
BEGIN
    -- Create base slug from workspace name
    base_slug := lower(regexp_replace(trim(workspace_name), '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
    
    -- Limit length to 50 characters
    base_slug := left(base_slug, 50);
    final_slug := base_slug;
    
    -- Check availability and append counter if needed
    WHILE NOT public.is_workspace_slug_available(final_slug) LOOP
        final_slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN final_slug;
END;
$$;

-- 11. Sample industry data
DO $$
BEGIN
    INSERT INTO public.industries (name, slug, description, icon_name, suggested_goals, sort_order) VALUES
        ('Technology', 'technology', 'Software development, IT services, and tech startups', 'Monitor', '["analytics", "crm"]'::jsonb, 1),
        ('Marketing & Advertising', 'marketing', 'Digital marketing agencies and advertising firms', 'Megaphone', '["instagram", "link_in_bio", "analytics"]'::jsonb, 2),
        ('E-commerce & Retail', 'ecommerce', 'Online stores and retail businesses', 'ShoppingBag', '["ecommerce", "instagram", "analytics"]'::jsonb, 3),
        ('Education & Training', 'education', 'Educational institutions and online learning', 'GraduationCap', '["courses", "analytics"]'::jsonb, 4),
        ('Healthcare & Wellness', 'healthcare', 'Medical practices and wellness services', 'Heart', '["crm", "link_in_bio"]'::jsonb, 5),
        ('Professional Services', 'professional', 'Consulting, legal, and business services', 'Briefcase', '["crm", "analytics"]'::jsonb, 6),
        ('Creative & Design', 'creative', 'Design agencies and creative professionals', 'Palette', '["instagram", "link_in_bio"]'::jsonb, 7),
        ('Real Estate', 'real_estate', 'Real estate agencies and property management', 'Home', '["crm", "link_in_bio", "instagram"]'::jsonb, 8),
        ('Food & Beverage', 'food', 'Restaurants, cafes, and food businesses', 'Coffee', '["instagram", "ecommerce"]'::jsonb, 9),
        ('Financial Services', 'finance', 'Banks, insurance, and financial advisors', 'DollarSign', '["crm", "analytics"]'::jsonb, 10),
        ('Manufacturing', 'manufacturing', 'Manufacturing and industrial companies', 'Settings', '["crm", "analytics"]'::jsonb, 11),
        ('Non-Profit', 'nonprofit', 'Non-profit organizations and charities', 'Heart', '["link_in_bio", "analytics"]'::jsonb, 12),
        ('Entertainment', 'entertainment', 'Media, entertainment, and event companies', 'Play', '["instagram", "link_in_bio"]'::jsonb, 13),
        ('Travel & Tourism', 'travel', 'Travel agencies and tourism businesses', 'MapPin', '["instagram", "link_in_bio"]'::jsonb, 14),
        ('Other', 'other', 'Other industries and general business', 'Building', '["crm", "analytics"]'::jsonb, 15);

EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Industry data already exists, skipping insertion';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting industry data: %', SQLERRM;
END $$;

-- 12. Enhanced cleanup function for wizard data
CREATE OR REPLACE FUNCTION public.cleanup_wizard_test_data()
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
    WHERE email LIKE '%@example.com' OR email LIKE '%@test.com';

    -- Delete in dependency order (children first)
    DELETE FROM public.workspace_goal_priorities WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = ANY(auth_user_ids_to_delete)
    );
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
    
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key constraint prevents deletion: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$$;