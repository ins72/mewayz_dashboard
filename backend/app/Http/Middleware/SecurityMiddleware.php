<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class SecurityMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $type = 'default'): Response
    {
        // Rate limiting based on type
        $this->applyRateLimiting($request, $type);
        
        // IP blocking for suspicious activity
        $this->checkIpBlocking($request);
        
        // Request validation and sanitization
        $this->validateRequest($request);
        
        // CSRF protection for state-changing operations
        $this->verifyCsrfToken($request);
        
        // Log security events
        $this->logSecurityEvent($request, $type);
        
        return $next($request);
    }
    
    /**
     * Apply rate limiting based on endpoint type
     */
    private function applyRateLimiting(Request $request, string $type): void
    {
        $limits = [
            'auth' => ['attempts' => 5, 'minutes' => 15],
            'invitation' => ['attempts' => 10, 'minutes' => 60],
            'api' => ['attempts' => 100, 'minutes' => 60],
            'default' => ['attempts' => 60, 'minutes' => 60]
        ];
        
        $limit = $limits[$type] ?? $limits['default'];
        $key = $this->getRateLimitKey($request, $type);
        
        if (RateLimiter::tooManyAttempts($key, $limit['attempts'])) {
            $retryAfter = RateLimiter::availableIn($key);
            
            Log::warning('Rate limit exceeded', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'endpoint' => $request->path(),
                'type' => $type,
                'retry_after' => $retryAfter
            ]);
            
            abort(429, 'Too Many Requests. Retry after ' . $retryAfter . ' seconds.');
        }
        
        RateLimiter::hit($key, $limit['minutes'] * 60);
    }
    
    /**
     * Generate rate limit key
     */
    private function getRateLimitKey(Request $request, string $type): string
    {
        $user = $request->user();
        $identifier = $user ? $user->id : $request->ip();
        
        return "rate_limit:{$type}:{$identifier}";
    }
    
    /**
     * Check if IP is blocked
     */
    private function checkIpBlocking(Request $request): void
    {
        $ip = $request->ip();
        $blockKey = "blocked_ip:{$ip}";
        
        if (Cache::has($blockKey)) {
            $blockInfo = Cache::get($blockKey);
            
            Log::warning('Blocked IP attempted access', [
                'ip' => $ip,
                'reason' => $blockInfo['reason'],
                'blocked_at' => $blockInfo['blocked_at'],
                'endpoint' => $request->path()
            ]);
            
            abort(403, 'Access denied. IP temporarily blocked.');
        }
    }
    
    /**
     * Validate and sanitize request
     */
    private function validateRequest(Request $request): void
    {
        // Check for suspicious patterns
        $suspiciousPatterns = [
            '/\b(union|select|insert|update|delete|drop|create|alter)\b/i',
            '/<script|javascript:|onerror|onload|onclick/i',
            '/\b(cmd|exec|system|shell_exec|passthru|eval)\b/i',
            '/\.\.\//i',
            '/%[0-9a-fA-F]{2}/',
        ];
        
        $requestData = $request->all();
        $this->scanForSuspiciousContent($requestData, $suspiciousPatterns, $request);
    }
    
    /**
     * Scan for suspicious content
     */
    private function scanForSuspiciousContent(array $data, array $patterns, Request $request): void
    {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $this->scanForSuspiciousContent($value, $patterns, $request);
                continue;
            }
            
            if (!is_string($value)) {
                continue;
            }
            
            foreach ($patterns as $pattern) {
                if (preg_match($pattern, $value)) {
                    Log::warning('Suspicious content detected', [
                        'ip' => $request->ip(),
                        'user_agent' => $request->userAgent(),
                        'endpoint' => $request->path(),
                        'field' => $key,
                        'pattern' => $pattern,
                        'value' => substr($value, 0, 100)
                    ]);
                    
                    // Block IP for repeated suspicious activity
                    $this->trackSuspiciousActivity($request->ip());
                    
                    abort(400, 'Invalid request content detected.');
                }
            }
        }
    }
    
    /**
     * Track suspicious activity
     */
    private function trackSuspiciousActivity(string $ip): void
    {
        $key = "suspicious_activity:{$ip}";
        $count = Cache::increment($key, 1);
        
        if ($count === 1) {
            Cache::put($key, 1, 3600); // 1 hour
        }
        
        // Block IP after 3 suspicious requests
        if ($count >= 3) {
            $blockKey = "blocked_ip:{$ip}";
            Cache::put($blockKey, [
                'reason' => 'Suspicious activity detected',
                'blocked_at' => now()->toISOString(),
                'count' => $count
            ], 86400); // 24 hours
            
            Log::warning('IP blocked due to suspicious activity', [
                'ip' => $ip,
                'suspicious_count' => $count
            ]);
        }
    }
    
    /**
     * Verify CSRF token for state-changing operations
     */
    private function verifyCsrfToken(Request $request): void
    {
        $stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
        
        if (!in_array($request->method(), $stateChangingMethods)) {
            return;
        }
        
        // Skip CSRF for API endpoints with bearer token
        if ($request->bearerToken()) {
            return;
        }
        
        $token = $request->header('X-CSRF-TOKEN') ?? $request->input('_token');
        
        if (!$token || !hash_equals(session()->token(), $token)) {
            Log::warning('CSRF token mismatch', [
                'ip' => $request->ip(),
                'endpoint' => $request->path(),
                'method' => $request->method()
            ]);
            
            abort(419, 'CSRF token mismatch.');
        }
    }
    
    /**
     * Log security events
     */
    private function logSecurityEvent(Request $request, string $type): void
    {
        // Log high-risk endpoints
        $highRiskEndpoints = [
            'auth/login',
            'auth/register',
            'invitations',
            'workspaces'
        ];
        
        $endpoint = $request->path();
        $isHighRisk = collect($highRiskEndpoints)->contains(function ($pattern) use ($endpoint) {
            return str_contains($endpoint, $pattern);
        });
        
        if ($isHighRisk) {
            Log::info('Security event', [
                'type' => $type,
                'endpoint' => $endpoint,
                'method' => $request->method(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'user_id' => $request->user()?->id,
                'timestamp' => now()->toISOString()
            ]);
        }
    }
}