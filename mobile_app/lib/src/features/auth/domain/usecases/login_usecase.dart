import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../../core/errors/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../repositories/auth_repository.dart';

class LoginUsecase implements UseCase<Map<String, dynamic>, LoginParams> {
  final AuthRepository repository;
  
  LoginUsecase(this.repository);
  
  @override
  Future<Either<Failure, Map<String, dynamic>>> call(LoginParams params) async {
    return await repository.login(
      email: params.email,
      password: params.password,
      rememberMe: params.rememberMe,
    );
  }
}

class LoginParams extends Equatable {
  final String email;
  final String password;
  final bool rememberMe;
  
  const LoginParams({
    required this.email,
    required this.password,
    this.rememberMe = false,
  });
  
  @override
  List<Object?> get props => [email, password, rememberMe];
}