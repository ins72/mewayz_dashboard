import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../../core/errors/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../repositories/auth_repository.dart';

class RegisterUsecase implements UseCase<Map<String, dynamic>, RegisterParams> {
  final AuthRepository repository;
  
  RegisterUsecase(this.repository);
  
  @override
  Future<Either<Failure, Map<String, dynamic>>> call(RegisterParams params) async {
    return await repository.register(
      name: params.name,
      email: params.email,
      password: params.password,
      passwordConfirmation: params.passwordConfirmation,
      workspaceName: params.workspaceName,
    );
  }
}

class RegisterParams extends Equatable {
  final String name;
  final String email;
  final String password;
  final String passwordConfirmation;
  final String? workspaceName;
  
  const RegisterParams({
    required this.name,
    required this.email,
    required this.password,
    required this.passwordConfirmation,
    this.workspaceName,
  });
  
  @override
  List<Object?> get props => [name, email, password, passwordConfirmation, workspaceName];
}