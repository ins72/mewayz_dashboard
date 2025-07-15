import 'package:equatable/equatable.dart';

abstract class Failure extends Equatable {
  final String message;
  final String? code;
  
  const Failure(this.message, {this.code});
  
  @override
  List<Object?> get props => [message, code];
}

class ServerFailure extends Failure {
  const ServerFailure(super.message, {super.code});
}

class NetworkFailure extends Failure {
  const NetworkFailure(super.message, {super.code});
}

class CacheFailure extends Failure {
  const CacheFailure(super.message, {super.code});
}

class AuthFailure extends Failure {
  const AuthFailure(super.message, {super.code});
}

class ValidationFailure extends Failure {
  final Map<String, List<String>>? errors;
  
  const ValidationFailure(super.message, {super.code, this.errors});
  
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
  
  @override
  List<Object?> get props => [message, code, errors];
}

class PermissionFailure extends Failure {
  const PermissionFailure(super.message, {super.code});
}

class NotFoundFailure extends Failure {
  const NotFoundFailure(super.message, {super.code});
}

class TimeoutFailure extends Failure {
  const TimeoutFailure(super.message, {super.code});
}

class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure(super.message, {super.code});
}

class ForbiddenFailure extends Failure {
  const ForbiddenFailure(super.message, {super.code});
}

class ConflictFailure extends Failure {
  const ConflictFailure(super.message, {super.code});
}

class UnprocessableEntityFailure extends Failure {
  const UnprocessableEntityFailure(super.message, {super.code});
}

class TooManyRequestsFailure extends Failure {
  const TooManyRequestsFailure(super.message, {super.code});
}

class InternalServerErrorFailure extends Failure {
  const InternalServerErrorFailure(super.message, {super.code});
}

class ServiceUnavailableFailure extends Failure {
  const ServiceUnavailableFailure(super.message, {super.code});
}

class UnknownFailure extends Failure {
  const UnknownFailure(super.message, {super.code});
}