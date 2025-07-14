<?php

use Illuminate\Support\Facades\Route;

// Root route - redirect to frontend
Route::get('/', function () {
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
