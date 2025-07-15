import 'package:dartz/dartz.dart';

import '../../../../core/errors/exceptions.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/services/dependency_injection.dart';
import '../../domain/entities/user.dart';
import '../../domain/entities/workspace.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_data_source.dart';
import '../models/user_model.dart';
import '../models/workspace_model.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  
  AuthRepositoryImpl({required this.remoteDataSource});
  
  @override
  Future<Either<Failure, Map<String, dynamic>>> login({
    required String email,
    required String password,
    bool? rememberMe,
  }) async {
    try {
      final response = await remoteDataSource.login({
        'email': email,
        'password': password,
        'remember_me': rememberMe ?? false,
      });
      
      if (response.success && response.accessToken != null) {
        // Save user session
        await DependencyInjection.storageService.saveUserSession(
          accessToken: response.accessToken!,
          refreshToken: response.refreshToken!,
          userData: response.user!.toJson(),
          workspaceData: response.workspace?.toJson() ?? {},
        );
        
        return Right({
          'user': _userModelToEntity(response.user!),
          'workspace': response.workspace != null 
              ? _workspaceModelToEntity(response.workspace!)
              : null,
          'workspaces': response.workspaces
              ?.map((w) => _workspaceModelToEntity(w))
              .toList(),
        });
      } else {
        return Left(ServerFailure(response.message ?? 'Login failed'));
      }
    } on AuthenticationException catch (e) {
      return Left(AuthFailure(e.message));
    } on ValidationException catch (e) {
      return Left(ValidationFailure(e.message, errors: e.errors));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('Unexpected error: $e'));
    }
  }
  
  @override
  Future<Either<Failure, Map<String, dynamic>>> register({
    required String name,
    required String email,
    required String password,
    required String passwordConfirmation,
    String? workspaceName,
  }) async {
    try {
      final response = await remoteDataSource.register({
        'name': name,
        'email': email,
        'password': password,
        'password_confirmation': passwordConfirmation,
        'workspace_name': workspaceName,
      });
      
      if (response.success && response.accessToken != null) {
        // Save user session
        await DependencyInjection.storageService.saveUserSession(
          accessToken: response.accessToken!,
          refreshToken: response.refreshToken!,
          userData: response.user!.toJson(),
          workspaceData: response.workspace?.toJson() ?? {},
        );
        
        return Right({
          'user': _userModelToEntity(response.user!),
          'workspace': response.workspace != null 
              ? _workspaceModelToEntity(response.workspace!)
              : null,
          'workspaces': response.workspaces
              ?.map((w) => _workspaceModelToEntity(w))
              .toList(),
        });
      } else {
        return Left(ServerFailure(response.message ?? 'Registration failed'));
      }
    } on ValidationException catch (e) {
      return Left(ValidationFailure(e.message, errors: e.errors));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('Unexpected error: $e'));
    }
  }
  
  @override
  Future<Either<Failure, void>> logout() async {
    try {
      await remoteDataSource.logout();
      await DependencyInjection.storageService.clearAll();
      return const Right(null);
    } on NetworkException catch (e) {
      // Clear local data even if network call fails
      await DependencyInjection.storageService.clearAll();
      return Left(NetworkFailure(e.message));
    } catch (e) {
      await DependencyInjection.storageService.clearAll();
      return Left(ServerFailure('Logout failed: $e'));
    }
  }
  
  @override
  Future<Either<Failure, void>> forgotPassword({
    required String email,
  }) async {
    try {
      final response = await remoteDataSource.forgotPassword({
        'email': email,
      });
      
      if (response['success'] == true) {
        return const Right(null);
      } else {
        return Left(ServerFailure(response['message'] ?? 'Password reset failed'));
      }
    } on ValidationException catch (e) {
      return Left(ValidationFailure(e.message, errors: e.errors));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('Unexpected error: $e'));
    }
  }
  
  @override
  Future<Either<Failure, void>> resetPassword({
    required String email,
    required String token,
    required String password,
    required String passwordConfirmation,
  }) async {
    try {
      final response = await remoteDataSource.resetPassword({
        'email': email,
        'token': token,
        'password': password,
        'password_confirmation': passwordConfirmation,
      });
      
      if (response['success'] == true) {
        return const Right(null);
      } else {
        return Left(ServerFailure(response['message'] ?? 'Password reset failed'));
      }
    } on ValidationException catch (e) {
      return Left(ValidationFailure(e.message, errors: e.errors));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('Unexpected error: $e'));
    }
  }
  
  @override
  Future<Either<Failure, User>> getCurrentUser() async {
    try {
      final response = await remoteDataSource.getCurrentUser();
      
      if (response.success && response.user != null) {
        // Update stored user data
        await DependencyInjection.storageService.saveUserData(
          response.user!.toJson(),
        );
        
        return Right(_userModelToEntity(response.user!));
      } else {
        return Left(ServerFailure(response.message ?? 'Failed to get user'));
      }
    } on AuthenticationException catch (e) {
      return Left(AuthFailure(e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('Unexpected error: $e'));
    }
  }
  
  @override
  Future<Either<Failure, User>> updateProfile({
    String? name,
    String? email,
    String? phone,
    String? avatar,
    String? timezone,
    String? language,
  }) async {
    try {
      final body = <String, dynamic>{};
      if (name != null) body['name'] = name;
      if (email != null) body['email'] = email;
      if (phone != null) body['phone'] = phone;
      if (avatar != null) body['avatar'] = avatar;
      if (timezone != null) body['timezone'] = timezone;
      if (language != null) body['language'] = language;
      
      final response = await remoteDataSource.updateProfile(body);
      
      if (response.success && response.user != null) {
        // Update stored user data
        await DependencyInjection.storageService.saveUserData(
          response.user!.toJson(),
        );
        
        return Right(_userModelToEntity(response.user!));
      } else {
        return Left(ServerFailure(response.message ?? 'Profile update failed'));
      }
    } on ValidationException catch (e) {
      return Left(ValidationFailure(e.message, errors: e.errors));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('Unexpected error: $e'));
    }
  }
  
  @override
  Future<Either<Failure, void>> changePassword({
    required String currentPassword,
    required String newPassword,
    required String passwordConfirmation,
  }) async {
    try {
      final response = await remoteDataSource.changePassword({
        'current_password': currentPassword,
        'new_password': newPassword,
        'password_confirmation': passwordConfirmation,
      });
      
      if (response['success'] == true) {
        return const Right(null);
      } else {
        return Left(ServerFailure(response['message'] ?? 'Password change failed'));
      }
    } on ValidationException catch (e) {
      return Left(ValidationFailure(e.message, errors: e.errors));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('Unexpected error: $e'));
    }
  }
  
  @override
  Future<Either<Failure, bool>> hasValidSession() async {
    try {
      final hasSession = await DependencyInjection.storageService.hasValidSession();
      return Right(hasSession);
    } catch (e) {
      return Left(CacheFailure('Failed to check session: $e'));
    }
  }
  
  @override
  Future<Either<Failure, void>> clearSession() async {
    try {
      await DependencyInjection.storageService.clearAll();
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure('Failed to clear session: $e'));
    }
  }
  
  // Helper methods
  User _userModelToEntity(UserModel model) {
    return User(
      id: model.id,
      name: model.name,
      email: model.email,
      emailVerifiedAt: model.emailVerifiedAt,
      avatar: model.avatar,
      phone: model.phone,
      timezone: model.timezone,
      language: model.language,
      twoFactorEnabled: model.twoFactorEnabled,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    );
  }
  
  Workspace _workspaceModelToEntity(WorkspaceModel model) {
    return Workspace(
      id: model.id,
      name: model.name,
      description: model.description,
      logo: model.logo,
      website: model.website,
      industry: model.industry,
      timezone: model.timezone,
      currency: model.currency,
      subscriptionPlan: model.subscriptionPlan,
      subscriptionStatus: model.subscriptionStatus,
      trialEndsAt: model.trialEndsAt,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    );
  }
}