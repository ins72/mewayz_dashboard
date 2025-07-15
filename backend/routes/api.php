<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\SocialMediaAccountController;
use App\Http\Controllers\SocialMediaPostController;
use App\Http\Controllers\LinkInBioPageController;
use App\Http\Controllers\CrmContactController;
use App\Http\Controllers\CrmDealController;
use App\Http\Controllers\CrmPipelineController;
use App\Http\Controllers\CrmTaskController;
use App\Http\Controllers\CrmCommunicationController;
use App\Http\Controllers\CrmAutomationController;
use App\Http\Controllers\MarketingHubController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\WorkspaceInvitationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InstagramManagementController;
use App\Http\Controllers\TemplateMarketplaceController;
use App\Http\Controllers\TemplateCreatorController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\GamificationController;
use App\Http\Controllers\TeamManagementController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Authentication routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/auth/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
Route::post('/auth/password/reset', [AuthController::class, 'resetPassword']);

// Google OAuth routes
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// Public invitation route
Route::get('/invitations/{token}', [WorkspaceInvitationController::class, 'getByToken']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Workspace routes
    Route::apiResource('workspaces', WorkspaceController::class);
    
    // Workspace invitation routes
    Route::get('workspaces/{workspace}/invitations', [WorkspaceInvitationController::class, 'index']);
    Route::post('workspaces/{workspace}/invitations', [WorkspaceInvitationController::class, 'store']);
    Route::post('workspaces/{workspace}/invitations/bulk', [WorkspaceInvitationController::class, 'bulkStore']);
    Route::get('workspaces/{workspace}/invitations/analytics', [WorkspaceInvitationController::class, 'analytics']);
    Route::post('invitations/{invitation}/resend', [WorkspaceInvitationController::class, 'resend']);
    Route::delete('invitations/{invitation}', [WorkspaceInvitationController::class, 'cancel']);
    Route::post('invitations/{token}/accept', [WorkspaceInvitationController::class, 'accept']);
    Route::post('invitations/{token}/decline', [WorkspaceInvitationController::class, 'decline']);

    // Social Media routes
    Route::apiResource('social-media-accounts', SocialMediaAccountController::class);
    Route::post('social-media-accounts/{socialMediaAccount}/refresh-tokens', [SocialMediaAccountController::class, 'refreshTokens']);
    Route::apiResource('social-media-posts', SocialMediaPostController::class);
    Route::post('social-media-posts/{socialMediaPost}/publish', [SocialMediaPostController::class, 'publish']);
    Route::post('social-media-posts/{socialMediaPost}/duplicate', [SocialMediaPostController::class, 'duplicate']);

    // Link in Bio routes
    Route::apiResource('link-in-bio-pages', LinkInBioPageController::class);
    Route::post('link-in-bio-pages/{linkInBioPage}/track-click', [LinkInBioPageController::class, 'trackClick']);
    Route::get('link-in-bio-pages/{linkInBioPage}/analytics', [LinkInBioPageController::class, 'analytics']);
    Route::post('link-in-bio-pages/{linkInBioPage}/duplicate', [LinkInBioPageController::class, 'duplicate']);

    // CRM routes
    Route::apiResource('crm-contacts', CrmContactController::class);
    Route::post('crm-contacts/{crmContact}/mark-contacted', [CrmContactController::class, 'markAsContacted']);
    Route::post('crm-contacts/{crmContact}/update-lead-score', [CrmContactController::class, 'updateLeadScore']);
    Route::post('crm-contacts/{crmContact}/add-tags', [CrmContactController::class, 'addTags']);
    Route::post('crm-contacts/{crmContact}/remove-tags', [CrmContactController::class, 'removeTags']);
    Route::get('crm-contacts-follow-up', [CrmContactController::class, 'followUpNeeded']);
    Route::get('crm-analytics', [CrmContactController::class, 'analytics']);
    Route::get('crm-contacts/{crmContact}/analytics', [CrmContactController::class, 'contactAnalytics']);
    Route::get('crm-contacts/{crmContact}/communications', [CrmCommunicationController::class, 'getContactCommunications']);
    Route::post('crm-contacts/{crmContact}/communications', [CrmCommunicationController::class, 'addContactCommunication']);
    Route::post('crm-contacts/import/ecommerce', [CrmContactController::class, 'importFromEcommerce']);
    
    // CRM Deals routes
    Route::apiResource('crm-deals', CrmDealController::class);
    Route::put('crm-deals/{crmDeal}/stage', [CrmDealController::class, 'updateStage']);
    
    // CRM Pipeline routes
    Route::get('crm-pipeline', [CrmPipelineController::class, 'index']);
    Route::post('crm-pipeline/default-stages', [CrmPipelineController::class, 'createDefaultStages']);
    
    // CRM Tasks routes
    Route::apiResource('crm-tasks', CrmTaskController::class);
    Route::put('crm-tasks/{crmTask}/status', [CrmTaskController::class, 'updateStatus']);
    
    // CRM Communications routes
    Route::apiResource('crm-communications', CrmCommunicationController::class);
    
    // CRM Automation routes
    Route::apiResource('crm-automation-rules', CrmAutomationController::class);
    Route::post('crm-automation-rules/{crmAutomationRule}/toggle', [CrmAutomationController::class, 'toggleStatus']);
    
    // Marketing Hub routes
    Route::get('marketing/analytics', [MarketingHubController::class, 'getAnalytics']);
    Route::get('marketing/automation', [MarketingHubController::class, 'getAutomation']);
    Route::post('marketing/automation', [MarketingHubController::class, 'createAutomation']);
    Route::get('marketing/content', [MarketingHubController::class, 'getContent']);
    Route::post('marketing/content', [MarketingHubController::class, 'createContent']);
    Route::get('marketing/lead-magnets', [MarketingHubController::class, 'getLeadMagnets']);
    Route::post('marketing/lead-magnets', [MarketingHubController::class, 'createLeadMagnet']);
    Route::get('marketing/social-calendar', [MarketingHubController::class, 'getSocialCalendar']);
    Route::post('marketing/schedule-content', [MarketingHubController::class, 'scheduleContent']);
    Route::get('marketing/conversion-funnels', [MarketingHubController::class, 'getConversionFunnels']);

    // Course routes
    Route::apiResource('courses', CourseController::class);
    Route::post('courses/{course}/modules', [CourseController::class, 'createModule']);
    Route::post('courses/{course}/lessons', [CourseController::class, 'createLesson']);
    Route::get('courses/{course}/analytics', [CourseController::class, 'analytics']);
    Route::post('courses/{course}/duplicate', [CourseController::class, 'duplicate']);

    // Product/Store routes
    Route::apiResource('products', ProductController::class);
    Route::post('products/{product}/update-stock', [ProductController::class, 'updateStock']);
    Route::post('products/{product}/duplicate', [ProductController::class, 'duplicate']);
    Route::get('products/{product}/analytics', [ProductController::class, 'productAnalytics']);
    Route::get('products-analytics', [ProductController::class, 'analytics']);
    
    // E-commerce routes
    Route::apiResource('orders', OrderController::class);
    Route::put('orders/{order}/status', [OrderController::class, 'updateStatus']);
    Route::get('inventory/alerts', [ProductController::class, 'inventoryAlerts']);
    Route::get('product-categories', [ProductController::class, 'categories']);

    // Payment routes
    Route::get('payments/packages', [PaymentController::class, 'getPackages']);
    Route::post('payments/checkout/session', [PaymentController::class, 'createCheckoutSession']);
    Route::get('payments/checkout/status/{sessionId}', [PaymentController::class, 'getCheckoutStatus']);
    Route::get('payments/transactions', [PaymentController::class, 'getTransactions']);
    Route::get('payments/subscription/{workspaceId}', [PaymentController::class, 'getSubscription']);
    Route::get('payments/stats/{workspaceId}', [PaymentController::class, 'getStats']);
    Route::get('payments/subscriptions/{workspaceId}', [PaymentController::class, 'getAllSubscriptions']);

    // Email routes
    Route::get('email/stats/{workspaceId}', [EmailController::class, 'getStats']);
    Route::get('email/campaigns', [EmailController::class, 'getCampaigns']);
    Route::post('email/campaigns', [EmailController::class, 'createCampaign']);
    Route::put('email/campaigns/{campaignId}', [EmailController::class, 'updateCampaign']);
    Route::delete('email/campaigns/{campaignId}', [EmailController::class, 'deleteCampaign']);
    Route::post('email/campaigns/{campaignId}/send', [EmailController::class, 'sendCampaign']);
    Route::get('email/campaigns/{campaignId}/analytics', [EmailController::class, 'getCampaignAnalytics']);
    Route::get('email/templates', [EmailController::class, 'getTemplates']);
    Route::post('email/templates', [EmailController::class, 'createTemplate']);
    Route::get('email/audiences', [EmailController::class, 'getAudiences']);
    Route::post('email/audiences', [EmailController::class, 'createAudience']);

    // Dashboard routes
    Route::get('dashboard/stats/{workspaceId}', [DashboardController::class, 'getStats']);
    Route::get('dashboard/recent-activity/{workspaceId}', [DashboardController::class, 'getRecentActivity']);
    Route::get('dashboard/quick-stats/{workspaceId}', [DashboardController::class, 'getQuickStats']);
    Route::get('dashboard/workspace-overview/{workspaceId}', [DashboardController::class, 'getWorkspaceOverview']);
    Route::post('dashboard/activity', [DashboardController::class, 'logActivity']);

    // Social Media Analytics routes
    Route::get('social-media/analytics', [SocialMediaPostController::class, 'getAnalytics']);
    
    // Instagram Management routes
    Route::get('instagram/content-calendar', [InstagramManagementController::class, 'getContentCalendar']);
    Route::get('instagram/stories', [InstagramManagementController::class, 'getStories']);
    Route::post('instagram/stories', [InstagramManagementController::class, 'createStory']);
    Route::get('instagram/hashtag-research', [InstagramManagementController::class, 'getHashtagResearch']);
    Route::post('instagram/hashtag-analytics', [InstagramManagementController::class, 'updateHashtagAnalytics']);
    Route::get('instagram/analytics-dashboard', [InstagramManagementController::class, 'getAnalyticsDashboard']);
    Route::get('instagram/competitor-analysis', [InstagramManagementController::class, 'getCompetitorAnalysis']);
    Route::post('instagram/competitors', [InstagramManagementController::class, 'addCompetitor']);
    Route::get('instagram/optimal-posting-times', [InstagramManagementController::class, 'getOptimalPostingTimes']);
    
    // Template Marketplace routes
    Route::get('marketplace/templates', [TemplateMarketplaceController::class, 'getMarketplaceTemplates']);
    Route::get('marketplace/categories', [TemplateMarketplaceController::class, 'getTemplateCategories']);
    Route::get('marketplace/collections', [TemplateMarketplaceController::class, 'getTemplateCollections']);
    Route::get('marketplace/templates/{id}', [TemplateMarketplaceController::class, 'getTemplateDetails']);
    Route::get('marketplace/collections/{id}', [TemplateMarketplaceController::class, 'getCollectionDetails']);
    Route::post('marketplace/purchase-template', [TemplateMarketplaceController::class, 'purchaseTemplate']);
    Route::post('marketplace/purchase-collection', [TemplateMarketplaceController::class, 'purchaseCollection']);
    Route::get('marketplace/user-purchases', [TemplateMarketplaceController::class, 'getUserPurchases']);
    Route::get('marketplace/templates/{id}/reviews', [TemplateMarketplaceController::class, 'getTemplateReviews']);
    Route::post('marketplace/templates/reviews', [TemplateMarketplaceController::class, 'submitTemplateReview']);
    
    // Template Creator routes
    Route::get('creator/templates', [TemplateCreatorController::class, 'getCreatorTemplates']);
    Route::post('creator/templates', [TemplateCreatorController::class, 'createTemplate']);
    Route::put('creator/templates/{id}', [TemplateCreatorController::class, 'updateTemplate']);
    Route::delete('creator/templates/{id}', [TemplateCreatorController::class, 'deleteTemplate']);
    Route::post('creator/templates/{id}/publish', [TemplateCreatorController::class, 'publishTemplate']);
    Route::get('creator/collections', [TemplateCreatorController::class, 'getCreatorCollections']);
    Route::post('creator/collections', [TemplateCreatorController::class, 'createCollection']);
    Route::get('creator/templates/{id}/analytics', [TemplateCreatorController::class, 'getTemplateAnalytics']);
    Route::get('creator/dashboard', [TemplateCreatorController::class, 'getCreatorDashboard']);
    
    // Analytics routes
    Route::get('analytics/dashboard', [AnalyticsController::class, 'getDashboard']);
    Route::get('analytics/modules/{module}', [AnalyticsController::class, 'getModuleAnalytics']);
    Route::post('analytics/track', [AnalyticsController::class, 'trackEvent']);
    Route::get('analytics/export', [AnalyticsController::class, 'exportAnalytics']);
    Route::get('analytics/real-time', [AnalyticsController::class, 'getRealTimeAnalytics']);
    Route::post('analytics/custom-report', [AnalyticsController::class, 'getCustomReport']);
    
    // Gamification routes
    Route::get('gamification/dashboard', [GamificationController::class, 'getDashboard']);
    Route::get('gamification/achievements', [GamificationController::class, 'getAchievements']);
    Route::get('gamification/leaderboard', [GamificationController::class, 'getLeaderboard']);
    Route::get('gamification/progress', [GamificationController::class, 'getUserProgress']);
    Route::post('gamification/progress', [GamificationController::class, 'updateProgress']);
    Route::post('gamification/check-achievements', [GamificationController::class, 'checkAchievements']);
    Route::get('gamification/stats', [GamificationController::class, 'getAchievementStats']);
    Route::post('gamification/initialize-achievements', [GamificationController::class, 'initializeAchievements']);
    
    // Team Management routes
    Route::get('team/dashboard', [TeamManagementController::class, 'getDashboard']);
    Route::get('team/members', [TeamManagementController::class, 'getTeamMembers']);
    Route::post('team/invite', [TeamManagementController::class, 'inviteTeamMember']);
    Route::put('team/members/{id}/role', [TeamManagementController::class, 'updateMemberRole']);
    Route::delete('team/members/{id}', [TeamManagementController::class, 'removeMember']);
    Route::get('team/roles', [TeamManagementController::class, 'getTeamRoles']);
    Route::post('team/roles', [TeamManagementController::class, 'createTeamRole']);
    Route::put('team/roles/{id}', [TeamManagementController::class, 'updateTeamRole']);
    Route::delete('team/roles/{id}', [TeamManagementController::class, 'deleteTeamRole']);
    Route::get('team/activities', [TeamManagementController::class, 'getTeamActivities']);
    Route::get('team/notifications', [TeamManagementController::class, 'getTeamNotifications']);
    Route::put('team/notifications/{id}/read', [TeamManagementController::class, 'markNotificationAsRead']);
    Route::post('team/initialize-roles', [TeamManagementController::class, 'initializeDefaultRoles']);
});

// Public Link in Bio page view
Route::get('/link-in-bio/{slug}', [LinkInBioPageController::class, 'public']);

// Stripe webhook (public route)
Route::post('webhook/stripe', [PaymentController::class, 'handleWebhook']);