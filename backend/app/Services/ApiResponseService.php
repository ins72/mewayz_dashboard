<?php

namespace App\Services;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Support\Facades\Log;
use Illuminate\Pagination\LengthAwarePaginator;

class ApiResponseService
{
    /**
     * Success response
     */
    public static function success(
        mixed $data = null,
        string $message = 'Success',
        int $statusCode = 200,
        array $meta = []
    ): JsonResponse {
        $response = [
            'success' => true,
            'message' => $message,
            'timestamp' => now()->toISOString(),
            'status_code' => $statusCode
        ];
        
        if ($data !== null) {
            $response['data'] = self::formatData($data);
        }
        
        if (!empty($meta)) {
            $response['meta'] = $meta;
        }
        
        return response()->json($response, $statusCode);
    }
    
    /**
     * Error response
     */
    public static function error(
        string $message,
        mixed $errors = null,
        int $statusCode = 400,
        string $code = 'ERROR'
    ): JsonResponse {
        $response = [
            'success' => false,
            'message' => $message,
            'error_code' => $code,
            'timestamp' => now()->toISOString(),
            'status_code' => $statusCode
        ];
        
        if ($errors !== null) {
            $response['errors'] = $errors;
        }
        
        // Log error responses
        if ($statusCode >= 400) {
            Log::channel('api')->error('API Error Response', [
                'message' => $message,
                'code' => $code,
                'status_code' => $statusCode,
                'errors' => $errors
            ]);
        }
        
        return response()->json($response, $statusCode);
    }
    
    /**
     * Paginated response
     */
    public static function paginated(
        LengthAwarePaginator $paginator,
        string $message = 'Data retrieved successfully'
    ): JsonResponse {
        return self::success(
            $paginator->items(),
            $message,
            200,
            [
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                    'from' => $paginator->firstItem(),
                    'to' => $paginator->lastItem(),
                    'has_more_pages' => $paginator->hasMorePages()
                ]
            ]
        );
    }
    
    /**
     * Collection response
     */
    public static function collection(
        array $items,
        string $message = 'Data retrieved successfully',
        array $meta = []
    ): JsonResponse {
        return self::success(
            $items,
            $message,
            200,
            array_merge([
                'count' => count($items)
            ], $meta)
        );
    }
    
    /**
     * Created response
     */
    public static function created(
        mixed $data,
        string $message = 'Resource created successfully'
    ): JsonResponse {
        return self::success($data, $message, 201);
    }
    
    /**
     * Updated response
     */
    public static function updated(
        mixed $data,
        string $message = 'Resource updated successfully'
    ): JsonResponse {
        return self::success($data, $message, 200);
    }
    
    /**
     * Deleted response
     */
    public static function deleted(string $message = 'Resource deleted successfully'): JsonResponse
    {
        return self::success(null, $message, 200);
    }
    
    /**
     * Not found response
     */
    public static function notFound(string $message = 'Resource not found'): JsonResponse
    {
        return self::error($message, null, 404, 'NOT_FOUND');
    }
    
    /**
     * Unauthorized response
     */
    public static function unauthorized(string $message = 'Unauthorized access'): JsonResponse
    {
        return self::error($message, null, 401, 'UNAUTHORIZED');
    }
    
    /**
     * Forbidden response
     */
    public static function forbidden(string $message = 'Access forbidden'): JsonResponse
    {
        return self::error($message, null, 403, 'FORBIDDEN');
    }
    
    /**
     * Validation error response
     */
    public static function validationError(
        array $errors,
        string $message = 'Validation failed'
    ): JsonResponse {
        return self::error($message, $errors, 422, 'VALIDATION_ERROR');
    }
    
    /**
     * Rate limit exceeded response
     */
    public static function rateLimitExceeded(
        int $retryAfter = null,
        string $message = 'Rate limit exceeded'
    ): JsonResponse {
        $response = self::error($message, null, 429, 'RATE_LIMIT_EXCEEDED');
        
        if ($retryAfter) {
            $response->header('Retry-After', $retryAfter);
        }
        
        return $response;
    }
    
    /**
     * Server error response
     */
    public static function serverError(
        string $message = 'Internal server error',
        string $code = 'INTERNAL_SERVER_ERROR'
    ): JsonResponse {
        return self::error($message, null, 500, $code);
    }
    
    /**
     * Custom response with headers
     */
    public static function withHeaders(
        JsonResponse $response,
        array $headers
    ): JsonResponse {
        foreach ($headers as $key => $value) {
            $response->header($key, $value);
        }
        
        return $response;
    }
    
    /**
     * Format data for response
     */
    private static function formatData(mixed $data): mixed
    {
        if ($data instanceof JsonResource) {
            return $data->toArray(request());
        }
        
        if ($data instanceof ResourceCollection) {
            return $data->toArray(request());
        }
        
        if (is_object($data) && method_exists($data, 'toArray')) {
            return $data->toArray();
        }
        
        return $data;
    }
    
    /**
     * API health check response
     */
    public static function healthCheck(): JsonResponse
    {
        $health = [
            'api' => 'healthy',
            'timestamp' => now()->toISOString(),
            'version' => config('app.version', '1.0.0'),
            'environment' => config('app.env'),
            'uptime' => self::getUptime()
        ];
        
        return self::success($health, 'API is healthy');
    }
    
    /**
     * Get system uptime
     */
    private static function getUptime(): string
    {
        if (function_exists('sys_getloadavg')) {
            $load = sys_getloadavg();
            return "Load average: " . implode(', ', $load);
        }
        
        return 'Uptime information not available';
    }
    
    /**
     * Analytics response
     */
    public static function analytics(
        array $data,
        string $period = '24h',
        string $message = 'Analytics data retrieved successfully'
    ): JsonResponse {
        return self::success(
            $data,
            $message,
            200,
            [
                'period' => $period,
                'generated_at' => now()->toISOString(),
                'data_points' => count($data)
            ]
        );
    }
    
    /**
     * Export response
     */
    public static function export(
        string $format,
        int $recordCount,
        string $downloadUrl = null,
        string $message = 'Export completed successfully'
    ): JsonResponse {
        $data = [
            'format' => $format,
            'record_count' => $recordCount,
            'generated_at' => now()->toISOString()
        ];
        
        if ($downloadUrl) {
            $data['download_url'] = $downloadUrl;
        }
        
        return self::success($data, $message);
    }
    
    /**
     * Batch operation response
     */
    public static function batchOperation(
        array $results,
        string $message = 'Batch operation completed'
    ): JsonResponse {
        $successful = count(array_filter($results, fn($r) => $r['success'] ?? false));
        $failed = count($results) - $successful;
        
        return self::success(
            $results,
            $message,
            200,
            [
                'total' => count($results),
                'successful' => $successful,
                'failed' => $failed,
                'success_rate' => round(($successful / count($results)) * 100, 2)
            ]
        );
    }
    
    /**
     * Search response
     */
    public static function search(
        array $results,
        string $query,
        int $totalFound,
        string $message = 'Search completed successfully'
    ): JsonResponse {
        return self::success(
            $results,
            $message,
            200,
            [
                'query' => $query,
                'total_found' => $totalFound,
                'results_count' => count($results),
                'search_time' => microtime(true) - LARAVEL_START
            ]
        );
    }
}