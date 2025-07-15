import 'package:equatable/equatable.dart';

class User extends Equatable {
  final String id;
  final String name;
  final String email;
  final String? emailVerifiedAt;
  final String? avatar;
  final String? phone;
  final String? timezone;
  final String? language;
  final bool twoFactorEnabled;
  final String createdAt;
  final String updatedAt;
  
  const User({
    required this.id,
    required this.name,
    required this.email,
    this.emailVerifiedAt,
    this.avatar,
    this.phone,
    this.timezone,
    this.language,
    this.twoFactorEnabled = false,
    required this.createdAt,
    required this.updatedAt,
  });
  
  User copyWith({
    String? id,
    String? name,
    String? email,
    String? emailVerifiedAt,
    String? avatar,
    String? phone,
    String? timezone,
    String? language,
    bool? twoFactorEnabled,
    String? createdAt,
    String? updatedAt,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      emailVerifiedAt: emailVerifiedAt ?? this.emailVerifiedAt,
      avatar: avatar ?? this.avatar,
      phone: phone ?? this.phone,
      timezone: timezone ?? this.timezone,
      language: language ?? this.language,
      twoFactorEnabled: twoFactorEnabled ?? this.twoFactorEnabled,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
  
  bool get isEmailVerified => emailVerifiedAt != null;
  
  String get initials {
    final parts = name.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : '';
  }
  
  String get displayName => name;
  
  @override
  List<Object?> get props => [
    id,
    name,
    email,
    emailVerifiedAt,
    avatar,
    phone,
    timezone,
    language,
    twoFactorEnabled,
    createdAt,
    updatedAt,
  ];
}