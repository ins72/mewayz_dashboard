import 'package:equatable/equatable.dart';

class Workspace extends Equatable {
  final String id;
  final String name;
  final String? description;
  final String? logo;
  final String? website;
  final String? industry;
  final String? timezone;
  final String? currency;
  final String subscriptionPlan;
  final String subscriptionStatus;
  final String? trialEndsAt;
  final String createdAt;
  final String updatedAt;
  
  const Workspace({
    required this.id,
    required this.name,
    this.description,
    this.logo,
    this.website,
    this.industry,
    this.timezone,
    this.currency,
    this.subscriptionPlan = 'free',
    this.subscriptionStatus = 'active',
    this.trialEndsAt,
    required this.createdAt,
    required this.updatedAt,
  });
  
  Workspace copyWith({
    String? id,
    String? name,
    String? description,
    String? logo,
    String? website,
    String? industry,
    String? timezone,
    String? currency,
    String? subscriptionPlan,
    String? subscriptionStatus,
    String? trialEndsAt,
    String? createdAt,
    String? updatedAt,
  }) {
    return Workspace(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      logo: logo ?? this.logo,
      website: website ?? this.website,
      industry: industry ?? this.industry,
      timezone: timezone ?? this.timezone,
      currency: currency ?? this.currency,
      subscriptionPlan: subscriptionPlan ?? this.subscriptionPlan,
      subscriptionStatus: subscriptionStatus ?? this.subscriptionStatus,
      trialEndsAt: trialEndsAt ?? this.trialEndsAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
  
  bool get isActive => subscriptionStatus == 'active';
  bool get isOnTrial => trialEndsAt != null && 
      DateTime.parse(trialEndsAt!).isAfter(DateTime.now());
  bool get isPaid => subscriptionPlan != 'free';
  
  String get displayName => name;
  
  String get initials {
    final parts = name.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : '';
  }
  
  @override
  List<Object?> get props => [
    id,
    name,
    description,
    logo,
    website,
    industry,
    timezone,
    currency,
    subscriptionPlan,
    subscriptionStatus,
    trialEndsAt,
    createdAt,
    updatedAt,
  ];
}