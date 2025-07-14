<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class CachingService
{
    private const DEFAULT_TTL = 3600; // 1 hour
    private const CACHE_PREFIX = 'mewayz:';
    
    /**
     * Get cached data with fallback
     */
    public static function remember(string $key, callable $callback, ?int $ttl = null): mixed
    {
        $cacheKey = self::CACHE_PREFIX . $key;
        $ttl = $ttl ?? self::DEFAULT_TTL;
        
        try {
            return Cache::remember($cacheKey, $ttl, function () use ($callback, $key) {
                Log::info("Cache miss for key: {$key}");
                return $callback();
            });
        } catch (\Exception $e) {
            Log::error("Cache error for key: {$key}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Fallback to direct execution
            return $callback();
        }
    }
    
    /**
     * Store data in cache
     */
    public static function put(string $key, mixed $value, ?int $ttl = null): bool
    {
        $cacheKey = self::CACHE_PREFIX . $key;
        $ttl = $ttl ?? self::DEFAULT_TTL;
        
        try {
            return Cache::put($cacheKey, $value, $ttl);
        } catch (\Exception $e) {
            Log::error("Cache put error for key: {$key}", [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
    
    /**
     * Get cached data
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $cacheKey = self::CACHE_PREFIX . $key;
        
        try {
            return Cache::get($cacheKey, $default);
        } catch (\Exception $e) {
            Log::error("Cache get error for key: {$key}", [
                'error' => $e->getMessage()
            ]);
            return $default;
        }
    }
    
    /**
     * Forget cached data
     */
    public static function forget(string $key): bool
    {
        $cacheKey = self::CACHE_PREFIX . $key;
        
        try {
            return Cache::forget($cacheKey);
        } catch (\Exception $e) {
            Log::error("Cache forget error for key: {$key}", [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
    
    /**
     * Clear cache by pattern
     */
    public static function forgetPattern(string $pattern): int
    {
        $cachePattern = self::CACHE_PREFIX . $pattern;
        $cleared = 0;
        
        try {
            if (Cache::getStore() instanceof \Illuminate\Cache\RedisStore) {
                $keys = Redis::keys($cachePattern);
                if (!empty($keys)) {
                    $cleared = Redis::del($keys);
                }
            } else {
                // For other cache stores, we'd need to implement differently
                Log::warning("Pattern clearing not supported for current cache store");
            }
        } catch (\Exception $e) {
            Log::error("Cache pattern clear error for pattern: {$pattern}", [
                'error' => $e->getMessage()
            ]);
        }
        
        return $cleared;
    }
    
    /**
     * Cache workspace invitations
     */
    public static function cacheWorkspaceInvitations(string $workspaceId, array $invitations): bool
    {
        $key = "workspace_invitations:{$workspaceId}";
        return self::put($key, $invitations, 1800); // 30 minutes
    }
    
    /**
     * Get cached workspace invitations
     */
    public static function getCachedWorkspaceInvitations(string $workspaceId): ?array
    {
        $key = "workspace_invitations:{$workspaceId}";
        return self::get($key);
    }
    
    /**
     * Clear workspace invitations cache
     */
    public static function clearWorkspaceInvitationsCache(string $workspaceId): bool
    {
        $key = "workspace_invitations:{$workspaceId}";
        return self::forget($key);
    }
    
    /**
     * Cache user permissions
     */
    public static function cacheUserPermissions(string $userId, string $workspaceId, array $permissions): bool
    {
        $key = "user_permissions:{$userId}:{$workspaceId}";
        return self::put($key, $permissions, 3600); // 1 hour
    }
    
    /**
     * Get cached user permissions
     */
    public static function getCachedUserPermissions(string $userId, string $workspaceId): ?array
    {
        $key = "user_permissions:{$userId}:{$workspaceId}";
        return self::get($key);
    }
    
    /**
     * Clear user permissions cache
     */
    public static function clearUserPermissionsCache(string $userId, ?string $workspaceId = null): int
    {
        if ($workspaceId) {
            $key = "user_permissions:{$userId}:{$workspaceId}";
            return self::forget($key) ? 1 : 0;
        } else {
            $pattern = "user_permissions:{$userId}:*";
            return self::forgetPattern($pattern);
        }
    }
    
    /**
     * Cache workspace analytics
     */
    public static function cacheWorkspaceAnalytics(string $workspaceId, array $analytics): bool
    {
        $key = "workspace_analytics:{$workspaceId}";
        return self::put($key, $analytics, 7200); // 2 hours
    }
    
    /**
     * Get cached workspace analytics
     */
    public static function getCachedWorkspaceAnalytics(string $workspaceId): ?array
    {
        $key = "workspace_analytics:{$workspaceId}";
        return self::get($key);
    }
    
    /**
     * Increment counter
     */
    public static function increment(string $key, int $value = 1): int
    {
        $cacheKey = self::CACHE_PREFIX . $key;
        
        try {
            return Cache::increment($cacheKey, $value);
        } catch (\Exception $e) {
            Log::error("Cache increment error for key: {$key}", [
                'error' => $e->getMessage()
            ]);
            return 0;
        }
    }
    
    /**
     * Decrement counter
     */
    public static function decrement(string $key, int $value = 1): int
    {
        $cacheKey = self::CACHE_PREFIX . $key;
        
        try {
            return Cache::decrement($cacheKey, $value);
        } catch (\Exception $e) {
            Log::error("Cache decrement error for key: {$key}", [
                'error' => $e->getMessage()
            ]);
            return 0;
        }
    }
    
    /**
     * Get cache health status
     */
    public static function getHealthStatus(): array
    {
        try {
            $testKey = self::CACHE_PREFIX . 'health_check';
            $testValue = 'test_' . time();
            
            // Test write
            $writeSuccess = Cache::put($testKey, $testValue, 60);
            
            // Test read
            $readValue = Cache::get($testKey);
            $readSuccess = $readValue === $testValue;
            
            // Test delete
            $deleteSuccess = Cache::forget($testKey);
            
            return [
                'status' => $writeSuccess && $readSuccess && $deleteSuccess ? 'healthy' : 'degraded',
                'operations' => [
                    'write' => $writeSuccess,
                    'read' => $readSuccess,
                    'delete' => $deleteSuccess
                ]
            ];
        } catch (\Exception $e) {
            Log::error("Cache health check failed", [
                'error' => $e->getMessage()
            ]);
            
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Get cache statistics
     */
    public static function getStatistics(): array
    {
        try {
            if (Cache::getStore() instanceof \Illuminate\Cache\RedisStore) {
                $info = Redis::info();
                
                return [
                    'memory_usage' => $info['used_memory_human'] ?? 'unknown',
                    'total_keys' => $info['db0']['keys'] ?? 0,
                    'hit_rate' => $info['keyspace_hits'] / ($info['keyspace_hits'] + $info['keyspace_misses']) * 100,
                    'uptime' => $info['uptime_in_seconds'] ?? 0
                ];
            } else {
                return [
                    'driver' => Cache::getDefaultDriver(),
                    'message' => 'Statistics not available for current cache driver'
                ];
            }
        } catch (\Exception $e) {
            Log::error("Cache statistics error", [
                'error' => $e->getMessage()
            ]);
            
            return [
                'error' => 'Unable to retrieve cache statistics'
            ];
        }
    }
}