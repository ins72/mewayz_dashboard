import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

import 'user_model.dart';
import 'workspace_model.dart';

part 'auth_response_model.g.dart';

@JsonSerializable()
class AuthResponseModel extends Equatable {
  final bool success;
  final String? message;
  @JsonKey(name: 'access_token')
  final String? accessToken;
  @JsonKey(name: 'refresh_token')
  final String? refreshToken;
  @JsonKey(name: 'token_type')
  final String? tokenType;
  @JsonKey(name: 'expires_in')
  final int? expiresIn;
  final UserModel? user;
  final WorkspaceModel? workspace;
  final List<WorkspaceModel>? workspaces;
  
  const AuthResponseModel({
    required this.success,
    this.message,
    this.accessToken,
    this.refreshToken,
    this.tokenType,
    this.expiresIn,
    this.user,
    this.workspace,
    this.workspaces,
  });
  
  factory AuthResponseModel.fromJson(Map<String, dynamic> json) => _$AuthResponseModelFromJson(json);
  Map<String, dynamic> toJson() => _$AuthResponseModelToJson(this);
  
  AuthResponseModel copyWith({
    bool? success,
    String? message,
    String? accessToken,
    String? refreshToken,
    String? tokenType,
    int? expiresIn,
    UserModel? user,
    WorkspaceModel? workspace,
    List<WorkspaceModel>? workspaces,
  }) {
    return AuthResponseModel(
      success: success ?? this.success,
      message: message ?? this.message,
      accessToken: accessToken ?? this.accessToken,
      refreshToken: refreshToken ?? this.refreshToken,
      tokenType: tokenType ?? this.tokenType,
      expiresIn: expiresIn ?? this.expiresIn,
      user: user ?? this.user,
      workspace: workspace ?? this.workspace,
      workspaces: workspaces ?? this.workspaces,
    );
  }
  
  @override
  List<Object?> get props => [
    success,
    message,
    accessToken,
    refreshToken,
    tokenType,
    expiresIn,
    user,
    workspace,
    workspaces,
  ];
}