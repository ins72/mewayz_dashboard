<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\SocialMediaAccountController;
use App\Http\Controllers\SocialMediaPostController;
use App\Http\Controllers\LinkInBioPageController;
use App\Http\Controllers\CrmContactController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\WorkspaceInvitationController;

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

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Workspace routes
    Route::apiResource('workspaces', WorkspaceController::class);

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
    Route::get('products-analytics', [ProductController::class, 'analytics']);

    // Payment routes
    Route::get('payments/packages', [PaymentController::class, 'getPackages']);
    Route::post('payments/checkout/session', [PaymentController::class, 'createCheckoutSession']);
    Route::get('payments/checkout/status/{sessionId}', [PaymentController::class, 'getCheckoutStatus']);
    Route::get('payments/transactions', [PaymentController::class, 'getTransactions']);
    Route::get('payments/subscription/{workspaceId}', [PaymentController::class, 'getSubscription']);
});

// Public Link in Bio page view
Route::get('/link-in-bio/{slug}', [LinkInBioPageController::class, 'public']);

// Stripe webhook (public route)
Route::post('webhook/stripe', [PaymentController::class, 'handleWebhook']);