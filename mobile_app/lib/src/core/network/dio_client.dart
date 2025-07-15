import 'package:dio/dio.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';
import 'package:flutter/foundation.dart';

import '../utils/app_constants.dart';
import '../storage/storage_service.dart';
import '../network/network_info.dart';
import '../errors/exceptions.dart';

class DioClient {
  late final Dio _dio;
  final StorageService _storageService;
  final NetworkInfo _networkInfo;
  
  Dio get dio => _dio;
  
  DioClient({
    required String baseUrl,
    required Duration connectTimeout,
    required Duration receiveTimeout,
    required StorageService storageService,
    required NetworkInfo networkInfo,
  }) : _storageService = storageService, _networkInfo = networkInfo {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: connectTimeout,
        receiveTimeout: receiveTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );
    
    _setupInterceptors();
  }
  
  void _setupInterceptors() {
    // Request interceptor for adding auth token
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storageService.getAccessToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          
          // Add workspace ID to headers if available
          final workspaceId = await _storageService.getCurrentWorkspaceId();
          if (workspaceId != null) {
            options.headers['X-Workspace-ID'] = workspaceId;
          }
          
          handler.next(options);
        },
        onError: (error, handler) async {
          // Handle token refresh on 401
          if (error.response?.statusCode == 401) {
            try {
              final refreshed = await _refreshToken();
              if (refreshed) {
                // Retry the original request
                final options = error.requestOptions;
                final token = await _storageService.getAccessToken();
                options.headers['Authorization'] = 'Bearer $token';
                
                final response = await _dio.fetch(options);
                return handler.resolve(response);
              }
            } catch (e) {
              // Refresh failed, logout user
              await _storageService.clearAll();
              // Navigate to login page
            }
          }
          
          handler.next(error);
        },
      ),
    );
    
    // Logging interceptor (only in debug mode)
    if (kDebugMode) {
      _dio.interceptors.add(
        PrettyDioLogger(
          requestHeader: true,
          requestBody: true,
          responseHeader: false,
          responseBody: true,
          error: true,
          compact: true,
          maxWidth: 90,
        ),
      );
    }
  }
  
  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await _storageService.getRefreshToken();
      if (refreshToken == null) return false;
      
      final response = await _dio.post(
        '/auth/refresh',
        data: {'refresh_token': refreshToken},
        options: Options(
          headers: {'Authorization': null}, // Remove auth header for refresh
        ),
      );
      
      if (response.statusCode == 200) {
        final data = response.data;
        await _storageService.saveTokens(
          accessToken: data['access_token'],
          refreshToken: data['refresh_token'],
        );
        return true;
      }
      
      return false;
    } catch (e) {
      return false;
    }
  }
  
  // GET request
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      if (!await _networkInfo.isConnected) {
        throw NetworkException('No internet connection');
      }
      
      final response = await _dio.get<T>(
        path,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
      
      return response;
    } on DioException catch (e) {
      throw _handleDioException(e);
    } catch (e) {
      throw ServerException('Unexpected error: $e');
    }
  }
  
  // POST request
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      if (!await _networkInfo.isConnected) {
        throw NetworkException('No internet connection');
      }
      
      final response = await _dio.post<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
      
      return response;
    } on DioException catch (e) {
      throw _handleDioException(e);
    } catch (e) {
      throw ServerException('Unexpected error: $e');
    }
  }
  
  // PUT request
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      if (!await _networkInfo.isConnected) {
        throw NetworkException('No internet connection');
      }
      
      final response = await _dio.put<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
      
      return response;
    } on DioException catch (e) {
      throw _handleDioException(e);
    } catch (e) {
      throw ServerException('Unexpected error: $e');
    }
  }
  
  // DELETE request
  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      if (!await _networkInfo.isConnected) {
        throw NetworkException('No internet connection');
      }
      
      final response = await _dio.delete<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
      
      return response;
    } on DioException catch (e) {
      throw _handleDioException(e);
    } catch (e) {
      throw ServerException('Unexpected error: $e');
    }
  }
  
  // PATCH request
  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      if (!await _networkInfo.isConnected) {
        throw NetworkException('No internet connection');
      }
      
      final response = await _dio.patch<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
      
      return response;
    } on DioException catch (e) {
      throw _handleDioException(e);
    } catch (e) {
      throw ServerException('Unexpected error: $e');
    }
  }
  
  Exception _handleDioException(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.sendTimeout:
        return NetworkException('Connection timeout');
      case DioExceptionType.badResponse:
        final statusCode = e.response?.statusCode;
        final message = e.response?.data?['message'] ?? 'Unknown error';
        
        switch (statusCode) {
          case 400:
            return ValidationException(message);
          case 401:
            return AuthenticationException('Authentication failed');
          case 403:
            return AuthorizationException('Access denied');
          case 404:
            return NotFoundException('Resource not found');
          case 422:
            return ValidationException(message);
          case 500:
            return ServerException('Internal server error');
          default:
            return ServerException('Server error: $statusCode');
        }
      case DioExceptionType.cancel:
        return CancelException('Request was cancelled');
      case DioExceptionType.unknown:
        return NetworkException('Network error');
      default:
        return ServerException('Unexpected error');
    }
  }
}