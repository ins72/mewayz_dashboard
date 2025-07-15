// Base exception class
abstract class AppException implements Exception {
  final String message;
  final String? code;
  
  const AppException(this.message, {this.code});
  
  @override
  String toString() => message;
}

// Network related exceptions
class NetworkException extends AppException {
  const NetworkException(super.message, {super.code});
}

// Server related exceptions
class ServerException extends AppException {
  const ServerException(super.message, {super.code});
}

// Authentication related exceptions
class AuthenticationException extends AppException {
  const AuthenticationException(super.message, {super.code});
}

// Authorization related exceptions
class AuthorizationException extends AppException {
  const AuthorizationException(super.message, {super.code});
}

// Validation related exceptions
class ValidationException extends AppException {
  final Map<String, List<String>>? errors;
  
  const ValidationException(super.message, {super.code, this.errors});
  
  String? getFirstError(String field) {
    return errors?[field]?.first;
  }
  
  List<String>? getFieldErrors(String field) {
    return errors?[field];
  }
  
  List<String> get allErrors {
    final List<String> allErrors = [];
    errors?.forEach((field, fieldErrors) {
      allErrors.addAll(fieldErrors);
    });
    return allErrors;
  }
}

// Not found exceptions
class NotFoundException extends AppException {
  const NotFoundException(super.message, {super.code});
}

// Cache related exceptions
class CacheException extends AppException {
  const CacheException(super.message, {super.code});
}

// Cancel related exceptions
class CancelException extends AppException {
  const CancelException(super.message, {super.code});
}

// Permission related exceptions
class PermissionException extends AppException {
  const PermissionException(super.message, {super.code});
}

// File operation exceptions
class FileException extends AppException {
  const FileException(super.message, {super.code});
}

// Biometric authentication exceptions
class BiometricException extends AppException {
  const BiometricException(super.message, {super.code});
}

// Push notification exceptions
class NotificationException extends AppException {
  const NotificationException(super.message, {super.code});
}

// Business logic exceptions
class BusinessLogicException extends AppException {
  const BusinessLogicException(super.message, {super.code});
}

// Data format exceptions
class DataFormatException extends AppException {
  const DataFormatException(super.message, {super.code});
}

// Sync related exceptions
class SyncException extends AppException {
  const SyncException(super.message, {super.code});
}

// Feature not available exceptions
class FeatureNotAvailableException extends AppException {
  const FeatureNotAvailableException(super.message, {super.code});
}