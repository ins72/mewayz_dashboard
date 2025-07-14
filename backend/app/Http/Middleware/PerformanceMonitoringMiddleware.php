<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class PerformanceMonitoringMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        $startMemory = memory_get_usage();
        
        // Enable query logging for performance monitoring
        DB::enableQueryLog();
        
        $response = $next($request);
        
        $endTime = microtime(true);
        $endMemory = memory_get_usage();
        
        $this->recordPerformanceMetrics($request, $response, [
            'execution_time' => ($endTime - $startTime) * 1000, // milliseconds
            'memory_usage' => ($endMemory - $startMemory) / 1024 / 1024, // MB
            'query_count' => count(DB::getQueryLog()),
            'queries' => DB::getQueryLog()
        ]);
        
        // Add performance headers
        $response->headers->set('X-Response-Time', round(($endTime - $startTime) * 1000, 2) . 'ms');
        $response->headers->set('X-Memory-Usage', round(($endMemory - $startMemory) / 1024 / 1024, 2) . 'MB');
        $response->headers->set('X-Query-Count', count(DB::getQueryLog()));
        
        return $response;
    }
    
    /**
     * Record performance metrics
     */
    private function recordPerformanceMetrics(Request $request, Response $response, array $metrics): void
    {
        $endpoint = $request->path();
        $method = $request->method();
        $statusCode = $response->getStatusCode();
        
        $performanceData = [
            'endpoint' => $endpoint,
            'method' => $method,
            'status_code' => $statusCode,
            'execution_time' => $metrics['execution_time'],
            'memory_usage' => $metrics['memory_usage'],
            'query_count' => $metrics['query_count'],
            'timestamp' => now()->toISOString(),
            'user_id' => $request->user()?->id,
            'ip' => $request->ip()
        ];
        
        // Log slow requests
        if ($metrics['execution_time'] > 1000) { // > 1 second
            Log::warning('Slow API request detected', array_merge($performanceData, [
                'queries' => $metrics['queries']
            ]));
        }
        
        // Log high memory usage
        if ($metrics['memory_usage'] > 50) { // > 50MB
            Log::warning('High memory usage detected', $performanceData);
        }
        
        // Log high query count
        if ($metrics['query_count'] > 10) {
            Log::warning('High query count detected', array_merge($performanceData, [
                'queries' => $metrics['queries']
            ]));
        }
        
        // Store metrics for analytics
        $this->storeMetrics($performanceData);
    }
    
    /**
     * Store metrics for analytics
     */
    private function storeMetrics(array $data): void
    {
        $key = 'performance_metrics:' . date('Y-m-d-H');
        
        $existingData = Cache::get($key, []);
        $existingData[] = $data;
        
        // Keep only last 100 requests per hour
        if (count($existingData) > 100) {
            $existingData = array_slice($existingData, -100);
        }
        
        Cache::put($key, $existingData, 3600); // 1 hour
    }
    
    /**
     * Get performance analytics
     */
    public static function getAnalytics(string $period = '24h'): array
    {
        $hours = match ($period) {
            '1h' => 1,
            '6h' => 6,
            '24h' => 24,
            '7d' => 168,
            default => 24
        };
        
        $allMetrics = [];
        
        for ($i = 0; $i < $hours; $i++) {
            $hour = now()->subHours($i)->format('Y-m-d-H');
            $key = "performance_metrics:{$hour}";
            $metrics = Cache::get($key, []);
            $allMetrics = array_merge($allMetrics, $metrics);
        }
        
        if (empty($allMetrics)) {
            return [
                'total_requests' => 0,
                'avg_response_time' => 0,
                'avg_memory_usage' => 0,
                'avg_query_count' => 0,
                'slow_requests' => 0,
                'error_rate' => 0
            ];
        }
        
        return [
            'total_requests' => count($allMetrics),
            'avg_response_time' => round(array_sum(array_column($allMetrics, 'execution_time')) / count($allMetrics), 2),
            'avg_memory_usage' => round(array_sum(array_column($allMetrics, 'memory_usage')) / count($allMetrics), 2),
            'avg_query_count' => round(array_sum(array_column($allMetrics, 'query_count')) / count($allMetrics), 2),
            'slow_requests' => count(array_filter($allMetrics, fn($m) => $m['execution_time'] > 1000)),
            'error_rate' => round(count(array_filter($allMetrics, fn($m) => $m['status_code'] >= 400)) / count($allMetrics) * 100, 2),
            'endpoints' => $this->getEndpointStats($allMetrics),
            'peak_hours' => $this->getPeakHours($allMetrics)
        ];
    }
    
    /**
     * Get endpoint statistics
     */
    private static function getEndpointStats(array $metrics): array
    {
        $endpoints = [];
        
        foreach ($metrics as $metric) {
            $key = $metric['method'] . ' ' . $metric['endpoint'];
            
            if (!isset($endpoints[$key])) {
                $endpoints[$key] = [
                    'count' => 0,
                    'avg_time' => 0,
                    'max_time' => 0,
                    'error_count' => 0
                ];
            }
            
            $endpoints[$key]['count']++;
            $endpoints[$key]['avg_time'] = ($endpoints[$key]['avg_time'] * ($endpoints[$key]['count'] - 1) + $metric['execution_time']) / $endpoints[$key]['count'];
            $endpoints[$key]['max_time'] = max($endpoints[$key]['max_time'], $metric['execution_time']);
            
            if ($metric['status_code'] >= 400) {
                $endpoints[$key]['error_count']++;
            }
        }
        
        // Sort by count descending
        uasort($endpoints, fn($a, $b) => $b['count'] <=> $a['count']);
        
        return array_slice($endpoints, 0, 10); // Top 10 endpoints
    }
    
    /**
     * Get peak hours
     */
    private static function getPeakHours(array $metrics): array
    {
        $hours = [];
        
        foreach ($metrics as $metric) {
            $hour = date('H', strtotime($metric['timestamp']));
            
            if (!isset($hours[$hour])) {
                $hours[$hour] = 0;
            }
            
            $hours[$hour]++;
        }
        
        arsort($hours);
        
        return array_slice($hours, 0, 5); // Top 5 peak hours
    }
}