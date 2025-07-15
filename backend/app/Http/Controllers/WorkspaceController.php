<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class WorkspaceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $workspaces = auth()->user()->workspaces()->with('members')->get();
        
        return response()->json([
            'success' => true,
            'workspaces' => $workspaces
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo' => 'nullable|string',
            'branding' => 'nullable|array',
            'settings' => 'nullable|array',
        ]);

        $workspace = Workspace::create([
            'id' => Str::uuid(),
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . Str::random(6),
            'description' => $request->description,
            'logo' => $request->logo,
            'branding' => $request->branding,
            'owner_id' => auth()->id(),
            'settings' => $request->settings,
        ]);

        // Add creator as workspace member with owner role
        $workspace->members()->create([
            'id' => Str::uuid(),
            'workspace_id' => $workspace->id,
            'user_id' => auth()->id(),
            'role' => 'owner',
            'status' => 'active',
            'joined_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'workspace' => $workspace->load('members'),
            'message' => 'Workspace created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Workspace $workspace)
    {
        // Check if user has access to this workspace
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'workspace' => $workspace->load('members.user')
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Workspace $workspace)
    {
        // Check if user is workspace owner or admin
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        if (!$member || !in_array($member->role, ['owner', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to update workspace'
            ], 403);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'logo' => 'nullable|string',
            'branding' => 'nullable|array',
            'settings' => 'nullable|array',
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'suspended'])],
        ]);

        $workspace->update($request->only([
            'name', 'description', 'logo', 'branding', 'settings', 'status'
        ]));

        return response()->json([
            'success' => true,
            'workspace' => $workspace->load('members.user'),
            'message' => 'Workspace updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Workspace $workspace)
    {
        // Only workspace owner can delete workspace
        if ($workspace->owner_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Only workspace owner can delete the workspace'
            ], 403);
        }

        $workspace->delete();

        return response()->json([
            'success' => true,
            'message' => 'Workspace deleted successfully'
        ]);
    }

    /**
     * Get goals for workspace setup wizard
     */
    public function getGoals()
    {
        $goals = [
            [
                'id' => 'instagram_management',
                'name' => 'Instagram Management',
                'description' => 'Manage your Instagram presence, generate leads, and grow your audience',
                'icon' => '📸',
                'color' => 'bg-pink-500',
                'features' => ['social_media_management', 'lead_generation', 'content_scheduling', 'analytics'],
                'category' => 'Social Media',
                'priority' => 1
            ],
            [
                'id' => 'link_in_bio',
                'name' => 'Link in Bio',
                'description' => 'Create custom landing pages and manage your link in bio',
                'icon' => '🔗',
                'color' => 'bg-blue-500',
                'features' => ['link_management', 'landing_pages', 'click_tracking', 'analytics'],
                'category' => 'Marketing',
                'priority' => 2
            ],
            [
                'id' => 'course_creation',
                'name' => 'Course Creation',
                'description' => 'Build and sell online courses with community features',
                'icon' => '🎓',
                'color' => 'bg-green-500',
                'features' => ['course_builder', 'student_management', 'community_features', 'certification'],
                'category' => 'Education',
                'priority' => 3
            ],
            [
                'id' => 'ecommerce',
                'name' => 'E-commerce',
                'description' => 'Set up and manage your online store with inventory tracking',
                'icon' => '🛒',
                'color' => 'bg-yellow-500',
                'features' => ['product_catalog', 'inventory_management', 'order_processing', 'payment_integration'],
                'category' => 'Sales',
                'priority' => 4
            ],
            [
                'id' => 'crm',
                'name' => 'CRM',
                'description' => 'Manage customer relationships and track sales pipeline',
                'icon' => '👥',
                'color' => 'bg-purple-500',
                'features' => ['contact_management', 'lead_tracking', 'sales_pipeline', 'communication_history'],
                'category' => 'Customer Management',
                'priority' => 5
            ],
            [
                'id' => 'marketing_hub',
                'name' => 'Marketing Hub',
                'description' => 'Execute email campaigns and marketing automation',
                'icon' => '📧',
                'color' => 'bg-red-500',
                'features' => ['email_campaigns', 'automation_workflows', 'list_management', 'campaign_analytics'],
                'category' => 'Marketing',
                'priority' => 6
            ]
        ];

        return response()->json([
            'success' => true,
            'goals' => $goals
        ]);
    }

    /**
     * Get features for a specific goal
     */
    public function getFeaturesByGoal($goalId)
    {
        $featuresByGoal = [
            'instagram_management' => [
                ['id' => 'content_scheduling', 'name' => 'Content Scheduling', 'description' => 'Schedule posts and stories', 'goal_id' => 'instagram_management', 'category' => 'Automation', 'required' => true],
                ['id' => 'hashtag_research', 'name' => 'Hashtag Research', 'description' => 'Find trending hashtags', 'goal_id' => 'instagram_management', 'category' => 'Research', 'required' => false],
                ['id' => 'analytics_dashboard', 'name' => 'Analytics Dashboard', 'description' => 'Track engagement metrics', 'goal_id' => 'instagram_management', 'category' => 'Analytics', 'required' => true],
                ['id' => 'dm_management', 'name' => 'DM Management', 'description' => 'Manage direct messages', 'goal_id' => 'instagram_management', 'category' => 'Communication', 'required' => false],
                ['id' => 'competitor_analysis', 'name' => 'Competitor Analysis', 'description' => 'Monitor competitor activity', 'goal_id' => 'instagram_management', 'category' => 'Research', 'required' => false],
                ['id' => 'story_highlights', 'name' => 'Story Highlights', 'description' => 'Organize story highlights', 'goal_id' => 'instagram_management', 'category' => 'Content', 'required' => false]
            ],
            'link_in_bio' => [
                ['id' => 'page_builder', 'name' => 'Page Builder', 'description' => 'Drag-and-drop page builder', 'goal_id' => 'link_in_bio', 'category' => 'Design', 'required' => true],
                ['id' => 'link_management', 'name' => 'Link Management', 'description' => 'Manage multiple links', 'goal_id' => 'link_in_bio', 'category' => 'Organization', 'required' => true],
                ['id' => 'click_tracking', 'name' => 'Click Tracking', 'description' => 'Track link clicks', 'goal_id' => 'link_in_bio', 'category' => 'Analytics', 'required' => true],
                ['id' => 'custom_templates', 'name' => 'Custom Templates', 'description' => 'Pre-designed templates', 'goal_id' => 'link_in_bio', 'category' => 'Design', 'required' => false],
                ['id' => 'ab_testing', 'name' => 'A/B Testing', 'description' => 'Test different page versions', 'goal_id' => 'link_in_bio', 'category' => 'Optimization', 'required' => false],
                ['id' => 'mobile_optimization', 'name' => 'Mobile Optimization', 'description' => 'Mobile-responsive design', 'goal_id' => 'link_in_bio', 'category' => 'Design', 'required' => true]
            ],
            'course_creation' => [
                ['id' => 'course_builder', 'name' => 'Course Builder', 'description' => 'Create structured courses', 'goal_id' => 'course_creation', 'category' => 'Content', 'required' => true],
                ['id' => 'video_hosting', 'name' => 'Video Hosting', 'description' => 'Host course videos', 'goal_id' => 'course_creation', 'category' => 'Media', 'required' => true],
                ['id' => 'student_management', 'name' => 'Student Management', 'description' => 'Manage enrollments', 'goal_id' => 'course_creation', 'category' => 'Management', 'required' => true],
                ['id' => 'discussion_forums', 'name' => 'Discussion Forums', 'description' => 'Community discussions', 'goal_id' => 'course_creation', 'category' => 'Community', 'required' => false],
                ['id' => 'assessments', 'name' => 'Assessments', 'description' => 'Quizzes and assignments', 'goal_id' => 'course_creation', 'category' => 'Assessment', 'required' => false],
                ['id' => 'certificates', 'name' => 'Certificates', 'description' => 'Course completion certificates', 'goal_id' => 'course_creation', 'category' => 'Certification', 'required' => false]
            ],
            'ecommerce' => [
                ['id' => 'product_catalog', 'name' => 'Product Catalog', 'description' => 'Manage product listings', 'goal_id' => 'ecommerce', 'category' => 'Inventory', 'required' => true],
                ['id' => 'inventory_tracking', 'name' => 'Inventory Tracking', 'description' => 'Track stock levels', 'goal_id' => 'ecommerce', 'category' => 'Inventory', 'required' => true],
                ['id' => 'order_processing', 'name' => 'Order Processing', 'description' => 'Process and fulfill orders', 'goal_id' => 'ecommerce', 'category' => 'Orders', 'required' => true],
                ['id' => 'payment_gateway', 'name' => 'Payment Gateway', 'description' => 'Accept payments online', 'goal_id' => 'ecommerce', 'category' => 'Payments', 'required' => true],
                ['id' => 'shipping_management', 'name' => 'Shipping Management', 'description' => 'Manage shipping options', 'goal_id' => 'ecommerce', 'category' => 'Fulfillment', 'required' => false],
                ['id' => 'discount_codes', 'name' => 'Discount Codes', 'description' => 'Create promotional codes', 'goal_id' => 'ecommerce', 'category' => 'Marketing', 'required' => false]
            ],
            'crm' => [
                ['id' => 'contact_management', 'name' => 'Contact Management', 'description' => 'Organize customer contacts', 'goal_id' => 'crm', 'category' => 'Contacts', 'required' => true],
                ['id' => 'lead_scoring', 'name' => 'Lead Scoring', 'description' => 'Score and prioritize leads', 'goal_id' => 'crm', 'category' => 'Leads', 'required' => false],
                ['id' => 'sales_pipeline', 'name' => 'Sales Pipeline', 'description' => 'Track sales opportunities', 'goal_id' => 'crm', 'category' => 'Sales', 'required' => true],
                ['id' => 'task_management', 'name' => 'Task Management', 'description' => 'Manage follow-up tasks', 'goal_id' => 'crm', 'category' => 'Organization', 'required' => false],
                ['id' => 'communication_history', 'name' => 'Communication History', 'description' => 'Track all interactions', 'goal_id' => 'crm', 'category' => 'Communication', 'required' => true],
                ['id' => 'reporting_dashboard', 'name' => 'Reporting Dashboard', 'description' => 'Sales and activity reports', 'goal_id' => 'crm', 'category' => 'Analytics', 'required' => false]
            ],
            'marketing_hub' => [
                ['id' => 'email_campaigns', 'name' => 'Email Campaigns', 'description' => 'Create and send email campaigns', 'goal_id' => 'marketing_hub', 'category' => 'Email', 'required' => true],
                ['id' => 'automation_workflows', 'name' => 'Automation Workflows', 'description' => 'Set up marketing automation', 'goal_id' => 'marketing_hub', 'category' => 'Automation', 'required' => true],
                ['id' => 'list_management', 'name' => 'List Management', 'description' => 'Manage subscriber lists', 'goal_id' => 'marketing_hub', 'category' => 'Lists', 'required' => true],
                ['id' => 'campaign_analytics', 'name' => 'Campaign Analytics', 'description' => 'Track campaign performance', 'goal_id' => 'marketing_hub', 'category' => 'Analytics', 'required' => true],
                ['id' => 'ab_testing', 'name' => 'A/B Testing', 'description' => 'Test email variations', 'goal_id' => 'marketing_hub', 'category' => 'Optimization', 'required' => false],
                ['id' => 'social_integration', 'name' => 'Social Integration', 'description' => 'Connect with social media', 'goal_id' => 'marketing_hub', 'category' => 'Integration', 'required' => false]
            ]
        ];

        $features = $featuresByGoal[$goalId] ?? [];

        return response()->json([
            'success' => true,
            'features' => $features
        ]);
    }

    /**
     * Get subscription plans for workspace setup
     */
    public function getSubscriptionPlans()
    {
        $plans = [
            [
                'id' => '1',
                'slug' => 'free',
                'name' => 'Free Plan',
                'description' => 'Perfect for getting started',
                'pricing_model' => 'fixed',
                'features' => [
                    'Up to 10 features',
                    'Basic functionality',
                    'Community support',
                    'Mewayz branding on external content'
                ],
                'limitations' => [
                    'Limited to 10 features',
                    'Basic analytics',
                    'Community support only',
                    'Mewayz branding required'
                ],
                'price_monthly' => 0,
                'price_yearly' => 0,
                'max_features' => 10,
                'popular' => false,
                'color' => 'gray'
            ],
            [
                'id' => '2',
                'slug' => 'professional',
                'name' => 'Professional Plan',
                'description' => 'For growing businesses',
                'pricing_model' => 'feature_based',
                'features' => [
                    '$1 per feature per month',
                    '$10 per feature per year',
                    'Advanced functionality',
                    'Priority support',
                    'Mewayz branding on external content',
                    'Advanced analytics',
                    'Team collaboration'
                ],
                'limitations' => [
                    'Mewayz branding on external content',
                    'Standard support hours'
                ],
                'price_monthly' => 1,
                'price_yearly' => 10,
                'max_features' => 50,
                'popular' => true,
                'color' => 'blue'
            ],
            [
                'id' => '3',
                'slug' => 'enterprise',
                'name' => 'Enterprise Plan',
                'description' => 'For large organizations',
                'pricing_model' => 'feature_based',
                'features' => [
                    '$1.50 per feature per month',
                    '$15 per feature per year',
                    'White-label capabilities',
                    'Custom branding options',
                    'Dedicated account management',
                    'Advanced analytics and reporting',
                    'Priority support',
                    'Custom integrations',
                    'Advanced security'
                ],
                'limitations' => [],
                'price_monthly' => 1.5,
                'price_yearly' => 15,
                'max_features' => 100,
                'popular' => false,
                'color' => 'purple'
            ]
        ];

        return response()->json([
            'success' => true,
            'plans' => $plans
        ]);
    }

    /**
     * Complete workspace setup with wizard data
     */
    public function completeWorkspaceSetup(Request $request, $workspaceId)
    {
        $workspace = Workspace::findOrFail($workspaceId);
        
        // Check if user has permission to complete setup
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'You are not a member of this workspace'
            ], 403);
        }

        // Check if user has owner or admin permissions
        $hasPermission = in_array($member->role, ['owner', 'admin']);
        
        // If role is null or not owner/admin, check if user is workspace owner
        if (!$hasPermission && $workspace->owner_id === auth()->id()) {
            $hasPermission = true;
        }

        if (!$hasPermission) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions. Only workspace owners and admins can complete setup.'
            ], 403);
        }

        $request->validate([
            'step1' => 'required|array',
            'step1.workspaceName' => 'required|string|max:255',
            'step1.industry' => 'required|string',
            'step1.teamSize' => 'required|string',
            'step2' => 'required|array',
            'step2.selectedGoals' => 'required|array|min:1',
            'step3' => 'required|array',
            'step3.selectedFeatures' => 'required|array|min:1',
            'step4' => 'required|array',
            'step4.selectedPlan' => 'required|string',
            'step5' => 'nullable|array',
            'step6' => 'nullable|array',
        ]);

        // Update workspace with setup data
        $workspace->update([
            'name' => $request->input('step1.workspaceName'),
            'settings' => [
                'industry' => $request->input('step1.industry'),
                'team_size' => $request->input('step1.teamSize'),
                'business_type' => $request->input('step1.businessType'),
                'business_description' => $request->input('step1.businessDescription'),
                'timezone' => $request->input('step1.timezone'),
                'currency' => $request->input('step1.currency'),
                'selected_goals' => $request->input('step2.selectedGoals'),
                'selected_features' => $request->input('step3.selectedFeatures'),
                'subscription_plan' => $request->input('step4.selectedPlan'),
                'setup_completed' => true,
                'setup_completed_at' => now()
            ],
            'branding' => $request->input('step6.branding', []),
            'status' => 'active'
        ]);

        // Create subscription record
        $subscription = $workspace->subscriptions()->create([
            'id' => \Illuminate\Support\Str::uuid(),
            'user_id' => auth()->id(),
            'workspace_id' => $workspace->id,
            'package_id' => $request->input('step4.selectedPlan'),
            'status' => 'active',
            'current_period_start' => now(),
            'current_period_end' => now()->addMonth(),
            'metadata' => [
                'selected_features' => $request->input('step3.selectedFeatures'),
                'billing_cycle' => $request->input('step4.billingCycle', 'monthly'),
                'feature_count' => count($request->input('step3.selectedFeatures'))
            ]
        ]);

        return response()->json([
            'success' => true,
            'workspace' => $workspace->load('members.user'),
            'subscription' => $subscription,
            'message' => 'Workspace setup completed successfully'
        ]);
    }

    /**
     * Save workspace setup progress
     */
    public function saveSetupProgress(Request $request, $workspaceId)
    {
        $workspace = Workspace::findOrFail($workspaceId);
        
        // Check if user has permission
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'You are not a member of this workspace'
            ], 403);
        }

        $request->validate([
            'step' => 'required|integer|min:1|max:6',
            'data' => 'required|array'
        ]);

        $currentSettings = $workspace->settings ?? [];
        $currentSettings['setup_progress'] = array_merge(
            $currentSettings['setup_progress'] ?? [],
            [
                'step' => $request->step,
                'data' => $request->data,
                'updated_at' => now()
            ]
        );

        $workspace->update(['settings' => $currentSettings]);

        return response()->json([
            'success' => true,
            'message' => 'Setup progress saved'
        ]);
    }

    /**
     * Get workspace setup progress
     */
    public function getSetupProgress($workspaceId)
    {
        $workspace = Workspace::findOrFail($workspaceId);
        
        // Check if user has permission
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'You are not a member of this workspace'
            ], 403);
        }

        $setupProgress = $workspace->settings['setup_progress'] ?? [];

        return response()->json([
            'success' => true,
            'data' => $setupProgress
        ]);
    }
}
