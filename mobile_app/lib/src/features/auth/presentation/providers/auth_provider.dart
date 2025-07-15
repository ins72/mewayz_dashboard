import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/services/dependency_injection.dart';
import '../../data/datasources/auth_remote_data_source.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../domain/entities/user.dart';
import '../../domain/entities/workspace.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/register_usecase.dart';

// Repository provider
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(
    remoteDataSource: AuthRemoteDataSource(DependencyInjection.dioClient._dio),
  );
});

// Use case providers
final loginUsecaseProvider = Provider<LoginUsecase>((ref) {
  return LoginUsecase(ref.read(authRepositoryProvider));
});

final registerUsecaseProvider = Provider<RegisterUsecase>((ref) {
  return RegisterUsecase(ref.read(authRepositoryProvider));
});

// Auth state
class AuthState {
  final bool isLoading;
  final bool isAuthenticated;
  final User? user;
  final Workspace? workspace;
  final List<Workspace>? workspaces;
  final String? error;
  final bool isInitialized;
  
  const AuthState({
    this.isLoading = false,
    this.isAuthenticated = false,
    this.user,
    this.workspace,
    this.workspaces,
    this.error,
    this.isInitialized = false,
  });
  
  AuthState copyWith({
    bool? isLoading,
    bool? isAuthenticated,
    User? user,
    Workspace? workspace,
    List<Workspace>? workspaces,
    String? error,
    bool? isInitialized,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: user ?? this.user,
      workspace: workspace ?? this.workspace,
      workspaces: workspaces ?? this.workspaces,
      error: error,
      isInitialized: isInitialized ?? this.isInitialized,
    );
  }
}

// Auth provider
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _authRepository;
  final LoginUsecase _loginUsecase;
  final RegisterUsecase _registerUsecase;
  
  AuthNotifier(
    this._authRepository,
    this._loginUsecase,
    this._registerUsecase,
  ) : super(const AuthState()) {
    _init();
  }
  
  Future<void> _init() async {
    try {
      state = state.copyWith(isLoading: true);
      
      final result = await _authRepository.hasValidSession();
      
      result.fold(
        (failure) {
          state = state.copyWith(
            isLoading: false,
            isInitialized: true,
            error: failure.message,
          );
        },
        (hasSession) async {
          if (hasSession) {
            await _loadUserData();
          }
          state = state.copyWith(
            isLoading: false,
            isInitialized: true,
            isAuthenticated: hasSession,
          );
        },
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        isInitialized: true,
        error: 'Initialization error: $e',
      );
    }
  }
  
  Future<void> _loadUserData() async {
    try {
      final userData = await DependencyInjection.storageService.getUserData();
      final workspaceData = await DependencyInjection.storageService.getWorkspaceData();
      
      if (userData != null) {
        final user = User(
          id: userData['id'],
          name: userData['name'],
          email: userData['email'],
          emailVerifiedAt: userData['email_verified_at'],
          avatar: userData['avatar'],
          phone: userData['phone'],
          timezone: userData['timezone'],
          language: userData['language'],
          twoFactorEnabled: userData['two_factor_enabled'] ?? false,
          createdAt: userData['created_at'],
          updatedAt: userData['updated_at'],
        );
        
        Workspace? workspace;
        if (workspaceData != null) {
          workspace = Workspace(
            id: workspaceData['id'],
            name: workspaceData['name'],
            description: workspaceData['description'],
            logo: workspaceData['logo'],
            website: workspaceData['website'],
            industry: workspaceData['industry'],
            timezone: workspaceData['timezone'],
            currency: workspaceData['currency'],
            subscriptionPlan: workspaceData['subscription_plan'] ?? 'free',
            subscriptionStatus: workspaceData['subscription_status'] ?? 'active',
            trialEndsAt: workspaceData['trial_ends_at'],
            createdAt: workspaceData['created_at'],
            updatedAt: workspaceData['updated_at'],
          );
        }
        
        state = state.copyWith(
          user: user,
          workspace: workspace,
          isAuthenticated: true,
        );
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Error loading user data: $e');
      }
    }
  }
  
  Future<void> login({
    required String email,
    required String password,
    bool rememberMe = false,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await _loginUsecase(LoginParams(
      email: email,
      password: password,
      rememberMe: rememberMe,
    ));
    
    result.fold(
      (failure) {
        state = state.copyWith(
          isLoading: false,
          error: failure.message,
        );
      },
      (data) {
        state = state.copyWith(
          isLoading: false,
          isAuthenticated: true,
          user: data['user'] as User,
          workspace: data['workspace'] as Workspace?,
          workspaces: data['workspaces'] as List<Workspace>?,
        );
      },
    );
  }
  
  Future<void> register({
    required String name,
    required String email,
    required String password,
    required String passwordConfirmation,
    String? workspaceName,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await _registerUsecase(RegisterParams(
      name: name,
      email: email,
      password: password,
      passwordConfirmation: passwordConfirmation,
      workspaceName: workspaceName,
    ));
    
    result.fold(
      (failure) {
        state = state.copyWith(
          isLoading: false,
          error: failure.message,
        );
      },
      (data) {
        state = state.copyWith(
          isLoading: false,
          isAuthenticated: true,
          user: data['user'] as User,
          workspace: data['workspace'] as Workspace?,
          workspaces: data['workspaces'] as List<Workspace>?,
        );
      },
    );
  }
  
  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    
    final result = await _authRepository.logout();
    
    result.fold(
      (failure) {
        // Even if logout fails, clear local data
        state = const AuthState(isInitialized: true);
      },
      (_) {
        state = const AuthState(isInitialized: true);
      },
    );
  }
  
  Future<void> forgotPassword({required String email}) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await _authRepository.forgotPassword(email: email);
    
    result.fold(
      (failure) {
        state = state.copyWith(
          isLoading: false,
          error: failure.message,
        );
      },
      (_) {
        state = state.copyWith(isLoading: false);
      },
    );
  }
  
  Future<void> getCurrentUser() async {
    final result = await _authRepository.getCurrentUser();
    
    result.fold(
      (failure) {
        if (kDebugMode) {
          debugPrint('Error getting current user: ${failure.message}');
        }
      },
      (user) {
        state = state.copyWith(user: user);
      },
    );
  }
  
  Future<void> updateProfile({
    String? name,
    String? email,
    String? phone,
    String? avatar,
    String? timezone,
    String? language,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await _authRepository.updateProfile(
      name: name,
      email: email,
      phone: phone,
      avatar: avatar,
      timezone: timezone,
      language: language,
    );
    
    result.fold(
      (failure) {
        state = state.copyWith(
          isLoading: false,
          error: failure.message,
        );
      },
      (user) {
        state = state.copyWith(
          isLoading: false,
          user: user,
        );
      },
    );
  }
  
  void clearError() {
    state = state.copyWith(error: null);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.read(authRepositoryProvider),
    ref.read(loginUsecaseProvider),
    ref.read(registerUsecaseProvider),
  );
});