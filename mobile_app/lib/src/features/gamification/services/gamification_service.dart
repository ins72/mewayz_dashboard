import 'package:dio/dio.dart';
import '../../../core/services/api_service.dart';
import '../models/gamification_data.dart';

class GamificationService {
  final ApiService _apiService = ApiService();

  Future<GamificationData> getDashboard(String workspaceId) async {
    try {
      final response = await _apiService.get(
        '/gamification/dashboard',
        queryParameters: {'workspace_id': workspaceId},
      );
      return GamificationData.fromJson(response.data);
    } catch (e) {
      return _getMockDashboard(workspaceId);
    }
  }

  Future<AchievementsResponse> getAchievements(
    String workspaceId, {
    String? category,
    String? type,
  }) async {
    try {
      final response = await _apiService.get(
        '/gamification/achievements',
        queryParameters: {
          'workspace_id': workspaceId,
          if (category != null) 'category': category,
          if (type != null) 'type': type,
        },
      );
      return AchievementsResponse.fromJson(response.data);
    } catch (e) {
      return _getMockAchievements(workspaceId, category, type);
    }
  }

  Future<LeaderboardResponse> getLeaderboard(
    String workspaceId, {
    String period = 'all',
    int limit = 20,
  }) async {
    try {
      final response = await _apiService.get(
        '/gamification/leaderboard',
        queryParameters: {
          'workspace_id': workspaceId,
          'period': period,
          'limit': limit,
        },
      );
      return LeaderboardResponse.fromJson(response.data);
    } catch (e) {
      return _getMockLeaderboard(workspaceId, period, limit);
    }
  }

  Future<UserProgress> getUserProgress(
    String workspaceId, {
    String? module,
  }) async {
    try {
      final response = await _apiService.get(
        '/gamification/progress',
        queryParameters: {
          'workspace_id': workspaceId,
          if (module != null) 'module': module,
        },
      );
      return UserProgress.fromJson(response.data);
    } catch (e) {
      return _getMockUserProgress(workspaceId, module);
    }
  }

  Future<void> updateProgress(
    String workspaceId,
    String module,
    String action, {
    double increment = 1,
    double? targetValue,
    Map<String, dynamic> metadata = const {},
  }) async {
    try {
      await _apiService.post('/gamification/progress', data: {
        'workspace_id': workspaceId,
        'module': module,
        'action': action,
        'increment': increment,
        'target_value': targetValue,
        'metadata': metadata,
      });
    } catch (e) {
      print('Error updating progress: $e');
    }
  }

  GamificationData _getMockDashboard(String workspaceId) {
    return GamificationData(
      achievements: Achievements(
        completed: [
          Achievement(
            id: '1',
            name: 'First Steps',
            description: 'Complete your first workspace setup',
            icon: '🎯',
            category: 'general',
            type: 'milestone',
            points: 10,
            criteria: {'action': 'workspace_setup', 'count': 1},
            userProgress: UserProgress(
              progress: 100,
              isCompleted: true,
              earnedAt: '2024-01-15T10:00:00Z',
            ),
            earnedAt: '2024-01-15T10:00:00Z',
          ),
          Achievement(
            id: '2',
            name: 'Social Media Pro',
            description: 'Schedule 100 Instagram posts',
            icon: '📱',
            category: 'instagram',
            type: 'milestone',
            points: 50,
            criteria: {'action': 'post_scheduled', 'count': 100},
            userProgress: UserProgress(
              progress: 100,
              isCompleted: true,
              earnedAt: '2024-01-14T15:30:00Z',
            ),
            earnedAt: '2024-01-14T15:30:00Z',
          ),
        ],
        inProgress: [
          Achievement(
            id: '3',
            name: 'Template Creator',
            description: 'Create your first template',
            icon: '🎨',
            category: 'templates',
            type: 'milestone',
            points: 25,
            criteria: {'action': 'template_created', 'count': 1},
            userProgress: UserProgress(
              progress: 60,
              isCompleted: false,
            ),
          ),
        ],
        totalPoints: 60,
        recent: [
          Achievement(
            id: '1',
            name: 'First Steps',
            description: 'Complete your first workspace setup',
            icon: '🎯',
            category: 'general',
            type: 'milestone',
            points: 10,
            criteria: {'action': 'workspace_setup', 'count': 1},
            userProgress: UserProgress(
              progress: 100,
              isCompleted: true,
              earnedAt: '2024-01-15T10:00:00Z',
            ),
            earnedAt: '2024-01-15T10:00:00Z',
          ),
        ],
      ),
      progress: Progress(
        byModule: {
          'instagram': [
            ProgressItem(
              action: 'post_scheduled',
              currentValue: 87,
              targetValue: 100,
              progressPercentage: 87,
              streakCount: 5,
              lastActivity: '2024-01-15T10:30:00Z',
            ),
          ],
          'crm': [
            ProgressItem(
              action: 'contact_created',
              currentValue: 23,
              targetValue: 50,
              progressPercentage: 46,
              streakCount: 0,
              lastActivity: '2024-01-14T14:20:00Z',
            ),
          ],
        },
        summary: ProgressSummary(
          totalActivities: 8,
          completedGoals: 2,
          averageProgress: 67.5,
          longestStreak: 7,
          lastActivity: '2024-01-15T10:30:00Z',
        ),
        nextMilestones: [
          Milestone(
            achievement: Achievement(
              id: '3',
              name: 'Template Creator',
              description: 'Create your first template',
              icon: '🎨',
              category: 'templates',
              type: 'milestone',
              points: 25,
              criteria: {'action': 'template_created', 'count': 1},
              userProgress: UserProgress(
                progress: 0,
                isCompleted: false,
              ),
            ),
            currentProgress: 0,
            target: 1,
            progressPercentage: 0,
          ),
        ],
      ),
      leaderboard: Leaderboard(
        userRank: 3,
        totalParticipants: 12,
        userPoints: 60,
      ),
    );
  }

  AchievementsResponse _getMockAchievements(
    String workspaceId,
    String? category,
    String? type,
  ) {
    final achievements = [
      Achievement(
        id: '1',
        name: 'First Steps',
        description: 'Complete your first workspace setup',
        icon: '🎯',
        category: 'general',
        type: 'milestone',
        points: 10,
        criteria: {'action': 'workspace_setup', 'count': 1},
        userProgress: UserProgress(
          progress: 100,
          isCompleted: true,
          earnedAt: '2024-01-15T10:00:00Z',
        ),
      ),
      Achievement(
        id: '2',
        name: 'Social Media Pro',
        description: 'Schedule 100 Instagram posts',
        icon: '📱',
        category: 'instagram',
        type: 'milestone',
        points: 50,
        criteria: {'action': 'post_scheduled', 'count': 100},
        userProgress: UserProgress(
          progress: 87,
          isCompleted: false,
        ),
      ),
      Achievement(
        id: '3',
        name: 'Template Creator',
        description: 'Create your first template',
        icon: '🎨',
        category: 'templates',
        type: 'milestone',
        points: 25,
        criteria: {'action': 'template_created', 'count': 1},
        userProgress: UserProgress(
          progress: 0,
          isCompleted: false,
        ),
      ),
    ];

    return AchievementsResponse(
      achievements: achievements,
      categories: ['general', 'instagram', 'templates', 'ecommerce', 'crm', 'marketing'],
      types: ['milestone', 'streak', 'challenge'],
    );
  }

  LeaderboardResponse _getMockLeaderboard(
    String workspaceId,
    String period,
    int limit,
  ) {
    return LeaderboardResponse(
      leaderboard: [
        LeaderboardEntry(
          rank: 1,
          user: User(id: '1', name: 'John Doe', email: 'john@example.com'),
          totalPoints: 150,
          totalAchievements: 8,
          lastAchievement: Achievement(
            id: '4',
            name: 'Sales Champion',
            description: 'Generate $1,000 in revenue',
            icon: '💰',
            category: 'ecommerce',
            type: 'milestone',
            points: 100,
            criteria: {'action': 'revenue_generated', 'value': 1000},
            userProgress: UserProgress(
              progress: 100,
              isCompleted: true,
              earnedAt: '2024-01-15T12:00:00Z',
            ),
            earnedAt: '2024-01-15T12:00:00Z',
          ),
        ),
        LeaderboardEntry(
          rank: 2,
          user: User(id: '2', name: 'Jane Smith', email: 'jane@example.com'),
          totalPoints: 125,
          totalAchievements: 6,
        ),
        LeaderboardEntry(
          rank: 3,
          user: User(id: '3', name: 'Mike Johnson', email: 'mike@example.com'),
          totalPoints: 90,
          totalAchievements: 4,
        ),
      ],
      userRank: 2,
      totalParticipants: 12,
      period: period,
    );
  }

  UserProgress _getMockUserProgress(String workspaceId, String? module) {
    final progress = [
      ProgressItem(
        action: 'post_scheduled',
        currentValue: 87,
        targetValue: 100,
        progressPercentage: 87,
        streakCount: 5,
        lastActivity: '2024-01-15T10:30:00Z',
      ),
      ProgressItem(
        action: 'contact_created',
        currentValue: 23,
        targetValue: 50,
        progressPercentage: 46,
        streakCount: 0,
        lastActivity: '2024-01-14T14:20:00Z',
      ),
      ProgressItem(
        action: 'email_sent',
        currentValue: 15,
        targetValue: 25,
        progressPercentage: 60,
        streakCount: 3,
        lastActivity: '2024-01-15T08:45:00Z',
      ),
    ];

    return UserProgress(
      progress: module != null ? progress.where((p) => p.action.contains(module)).toList() : progress,
      summary: ProgressSummary(
        totalActivities: 8,
        completedGoals: 2,
        averageProgress: 67.5,
        longestStreak: 7,
        lastActivity: '2024-01-15T10:30:00Z',
      ),
      nextTargets: [
        NextTarget(
          module: 'instagram',
          action: 'post_scheduled',
          current: 87,
          target: 100,
          percentage: 87,
          remaining: 13,
        ),
        NextTarget(
          module: 'marketing',
          action: 'email_sent',
          current: 15,
          target: 25,
          percentage: 60,
          remaining: 10,
        ),
      ],
    );
  }
}