import 'package:dartz/dartz.dart';

import '../../../../core/errors/failures.dart';
import '../entities/user.dart';

abstract class AuthRepository {
  Future<Either<Failure, Map<String, dynamic>>> login({
    required String email,
    required String password,
    bool? rememberMe,
  });
  
  Future<Either<Failure, Map<String, dynamic>>> register({
    required String name,
    required String email,
    required String password,
    required String passwordConfirmation,
    String? workspaceName,
  });
  
  Future<Either<Failure, void>> logout();
  
  Future<Either<Failure, void>> forgotPassword({
    required String email,
  });
  
  Future<Either<Failure, void>> resetPassword({
    required String email,
    required String token,
    required String password,
    required String passwordConfirmation,
  });
  
  Future<Either<Failure, User>> getCurrentUser();
  
  Future<Either<Failure, User>> updateProfile({
    String? name,
    String? email,
    String? phone,
    String? avatar,
    String? timezone,
    String? language,
  });
  
  Future<Either<Failure, void>> changePassword({
    required String currentPassword,
    required String newPassword,
    required String passwordConfirmation,
  });
  
  Future<Either<Failure, bool>> hasValidSession();
  
  Future<Either<Failure, void>> clearSession();
}