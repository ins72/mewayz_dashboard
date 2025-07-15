import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'workspace_model.g.dart';

@JsonSerializable()
class WorkspaceModel extends Equatable {
  final String id;
  final String name;
  final String? description;
  final String? logo;
  final String? website;
  final String? industry;
  final String? timezone;
  final String? currency;
  @JsonKey(name: 'subscription_plan')
  final String subscriptionPlan;
  @JsonKey(name: 'subscription_status')
  final String subscriptionStatus;
  @JsonKey(name: 'trial_ends_at')
  final String? trialEndsAt;
  @JsonKey(name: 'created_at')
  final String createdAt;
  @JsonKey(name: 'updated_at')
  final String updatedAt;
  
  const WorkspaceModel({
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
  
  factory WorkspaceModel.fromJson(Map<String, dynamic> json) => _$WorkspaceModelFromJson(json);
  Map<String, dynamic> toJson() => _$WorkspaceModelToJson(this);
  
  WorkspaceModel copyWith({
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
    return WorkspaceModel(
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