<?php

use Illuminate\Support\Facades\Route;

// Root route - serve the frontend or redirect appropriately
Route::get('/', function () {
    // Check if we're accessing from preview URL
    if (request()->getHost() === 'laravel-mewayz.preview.emergentagent.com') {
        // Serve a simple HTML page with information about the app
        return response()->view('welcome');
    }
    
    // For local development, redirect to frontend
    $frontendUrl = env('FRONTEND_URL', 'http://localhost:4028');
    return redirect($frontendUrl);
});

// Named login route for Laravel's authentication redirects
Route::get('/login', function () {
    $frontendUrl = env('FRONTEND_URL', 'http://localhost:4028');
    return redirect($frontendUrl . '/login-screen');
})->name('login');

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0'
    ]);
});

// API status endpoint for preview
Route::get('/api/status', function () {
    return response()->json([
        'app' => 'Mewayz Enterprise Business Suite',
        'version' => '1.0.0',
        'status' => 'operational',
        'timestamp' => now()->toISOString(),
        'features' => [
            'Authentication System',
            'Onboarding Wizard',
            'Quick Action Tiles',
            'Instagram Management',
            'Link in Bio Builder',
            'Payment Dashboard',
            'Email Campaign Builder',
            'Social Media Management',
            'CRM Hub',
            'Course Creator',
            'Product Manager'
        ]
    ]);
});
