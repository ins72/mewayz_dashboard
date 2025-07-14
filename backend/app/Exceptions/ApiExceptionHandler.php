<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\ThrottleRequestsException;
use Throwable;

class ApiExceptionHandler
{
    /**
     * Render API exceptions with consistent format
     */
    public static function render(Throwable $exception, Request $request): \Illuminate\Http\JsonResponse
    {
        // Log the exception
        self::logException($exception, $request);
        
        // Handle different exception types
        return match (true) {
            $exception instanceof ValidationException => self::handleValidationException($exception),
            $exception instanceof AuthorizationException => self::handleAuthorizationException($exception),
            $exception instanceof ModelNotFoundException => self::handleModelNotFoundException($exception),
            $exception instanceof NotFoundHttpException => self::handleNotFoundHttpException($exception),
            $exception instanceof ThrottleRequestsException => self::handleThrottleException($exception),
            $exception instanceof HttpException => self::handleHttpException($exception),
            default => self::handleGenericException($exception)
        };
    }
    
    /**
     * Log exception with context
     */
    private static function logException(Throwable $exception, Request $request): void
    {
        $context = [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => $request->user()?->id,
            'input' => $request->except(['password', 'password_confirmation', 'token']),
            'exception' => [
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $exception->getTraceAsString()
            ]
        ];
        
        // Log based on severity
        if ($exception instanceof ValidationException || $exception instanceof AuthorizationException) {
            Log::warning('API validation/authorization error', $context);
        } elseif ($exception instanceof HttpException && $exception->getStatusCode() < 500) {
            Log::info('API client error', $context);
        } else {
            Log::error('API server error', $context);
        }
    }
    
    /**
     * Handle validation exceptions
     */
    private static function handleValidationException(ValidationException $exception): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $exception->errors(),
            'code' => 'VALIDATION_ERROR'
        ], 422);
    }
    
    /**
     * Handle authorization exceptions
     */
    private static function handleAuthorizationException(AuthorizationException $exception): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Access denied',
            'error' => $exception->getMessage() ?: 'You do not have permission to perform this action',
            'code' => 'AUTHORIZATION_ERROR'
        ], 403);
    }
    
    /**
     * Handle model not found exceptions
     */
    private static function handleModelNotFoundException(ModelNotFoundException $exception): \Illuminate\Http\JsonResponse
    {
        $model = class_basename($exception->getModel());
        
        return response()->json([
            'success' => false,
            'message' => 'Resource not found',
            'error' => "{$model} not found",
            'code' => 'RESOURCE_NOT_FOUND'
        ], 404);
    }
    
    /**
     * Handle not found HTTP exceptions
     */
    private static function handleNotFoundHttpException(NotFoundHttpException $exception): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Endpoint not found',
            'error' => 'The requested endpoint does not exist',
            'code' => 'ENDPOINT_NOT_FOUND'
        ], 404);
    }
    
    /**
     * Handle throttle exceptions
     */
    private static function handleThrottleException(ThrottleRequestsException $exception): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Too many requests',
            'error' => 'Rate limit exceeded. Please try again later.',
            'code' => 'RATE_LIMIT_EXCEEDED',
            'retry_after' => $exception->getHeaders()['Retry-After'] ?? null
        ], 429);
    }
    
    /**
     * Handle HTTP exceptions
     */
    private static function handleHttpException(HttpException $exception): \Illuminate\Http\JsonResponse
    {
        $statusCode = $exception->getStatusCode();
        
        $messages = [
            400 => 'Bad request',
            401 => 'Unauthorized',
            403 => 'Forbidden',
            404 => 'Not found',
            405 => 'Method not allowed',
            422 => 'Unprocessable entity',
            500 => 'Internal server error',
            502 => 'Bad gateway',
            503 => 'Service unavailable',
            504 => 'Gateway timeout'
        ];
        
        return response()->json([
            'success' => false,
            'message' => $messages[$statusCode] ?? 'An error occurred',
            'error' => $exception->getMessage() ?: $messages[$statusCode] ?? 'Unknown error',
            'code' => 'HTTP_ERROR'
        ], $statusCode);
    }
    
    /**
     * Handle generic exceptions
     */
    private static function handleGenericException(Throwable $exception): \Illuminate\Http\JsonResponse
    {
        // Don't expose internal errors in production
        $message = app()->environment('production') 
            ? 'An unexpected error occurred' 
            : $exception->getMessage();
        
        return response()->json([
            'success' => false,
            'message' => 'Server error',
            'error' => $message,
            'code' => 'INTERNAL_SERVER_ERROR'
        ], 500);
    }
    
    /**
     * Create consistent success response
     */
    public static function success($data = null, string $message = 'Success', int $statusCode = 200): \Illuminate\Http\JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message
        ];
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        return response()->json($response, $statusCode);
    }
    
    /**
     * Create consistent error response
     */
    public static function error(string $message, $errors = null, int $statusCode = 400, string $code = 'ERROR'): \Illuminate\Http\JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
            'code' => $code
        ];
        
        if ($errors !== null) {
            $response['errors'] = $errors;
        }
        
        return response()->json($response, $statusCode);
    }
}