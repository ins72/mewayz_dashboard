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

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    
    // Workspace routes
    Route::apiResource('workspaces', WorkspaceController::class);
    
    // Social Media routes
    Route::apiResource('social-media-accounts', SocialMediaAccountController::class);
    Route::apiResource('social-media-posts', SocialMediaPostController::class);
    
    // Link in Bio routes
    Route::apiResource('link-in-bio-pages', LinkInBioPageController::class);
    
    // CRM routes
    Route::apiResource('crm-contacts', CrmContactController::class);
    
    // Course routes
    Route::apiResource('courses', CourseController::class);
    
    // Product/Store routes
    Route::apiResource('products', ProductController::class);
    
});

// Public routes
Route::get('/link-in-bio/{slug}', [LinkInBioPageController::class, 'public']);