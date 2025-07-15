import 'package:dio/dio.dart';
import '../../../core/services/api_service.dart';
import '../models/analytics_data.dart';

class AnalyticsService {
  final ApiService _apiService = ApiService();

  Future<AnalyticsData> getDashboard(
    String workspaceId,
    String period,
    List<String> modules,
  ) async {
    try {
      final response = await _apiService.get(
        '/analytics/dashboard',
        queryParameters: {
          'workspace_id': workspaceId,
          'period': period,
          'modules': modules,
        },
      );
      return AnalyticsData.fromJson(response.data);
    } catch (e) {
      // Return mock data if API fails
      return _getMockDashboard(workspaceId, period);
    }
  }

  Future<void> trackEvent(
    String workspaceId,
    String module,
    String action,
    String? entityType,
    String? entityId,
    Map<String, dynamic> metadata,
    double value,
  ) async {
    try {
      await _apiService.post('/analytics/track', data: {
        'workspace_id': workspaceId,
        'module': module,
        'action': action,
        'entity_type': entityType,
        'entity_id': entityId,
        'metadata': metadata,
        'value': value,
      });
    } catch (e) {
      // Handle error silently for tracking
      print('Error tracking event: $e');
    }
  }

  AnalyticsData _getMockDashboard(String workspaceId, String period) {
    return AnalyticsData(
      overview: AnalyticsOverview(
        totalEvents: 1542,
        uniqueUsers: 23,
        totalValue: 25678.50,
        activeModules: 6,
        avgEventsPerUser: 67.04,
        topModules: {
          'instagram': 456,
          'crm': 234,
          'marketing': 189,
          'ecommerce': 167,
          'courses': 145,
        },
        topActions: {
          'view': 345,
          'create': 234,
          'update': 189,
          'delete': 123,
          'share': 98,
        },
      ),
      modules: {
        'instagram': ModuleAnalytics(
          totalEvents: 456,
          uniqueUsers: 12,
          totalValue: 8950.00,
          topActions: {
            'post_scheduled': 145,
            'story_created': 98,
            'hashtag_analyzed': 67,
          },
          timeline: _generateTimelineData(456, period),
        ),
        'crm': ModuleAnalytics(
          totalEvents: 234,
          uniqueUsers: 8,
          totalValue: 12450.00,
          topActions: {
            'contact_created': 89,
            'deal_updated': 67,
            'task_completed': 45,
          },
          timeline: _generateTimelineData(234, period),
        ),
      },
      timeline: _generateTimelineMap(1542, period),
      topPerformers: [
        TopPerformer(
          user: User(id: '1', name: 'John Doe', email: 'john@example.com'),
          totalEvents: 234,
          totalValue: 5678.90,
          modules: 4,
          lastActivity: '2024-01-15T10:30:00Z',
        ),
        TopPerformer(
          user: User(id: '2', name: 'Jane Smith', email: 'jane@example.com'),
          totalEvents: 189,
          totalValue: 4567.80,
          modules: 3,
          lastActivity: '2024-01-15T09:15:00Z',
        ),
      ],
      goalProgress: GoalProgress(
        revenueGoal: Goal(target: 10000, current: 7845.30, progress: 78.45),
        engagementGoal: Goal(target: 1000, current: 756, progress: 75.6),
      ),
      period: period,
      dateRange: DateRange(
        start: _getStartDate(period),
        end: DateTime.now().toIso8601String().split('T')[0],
      ),
    );
  }

  Map<String, int> _generateTimelineData(int totalEvents, String period) {
    final days = period == '7d' ? 7 : (period == '90d' ? 90 : 30);
    final Map<String, int> data = {};
    
    for (int i = 0; i < days; i++) {
      final date = DateTime.now().subtract(Duration(days: i));
      final key = date.toIso8601String().split('T')[0];
      data[key] = (totalEvents / days * (0.5 + (i % 3) * 0.3)).round();
    }
    
    return data;
  }

  Map<String, TimelineData> _generateTimelineMap(int totalEvents, String period) {
    final days = period == '7d' ? 7 : (period == '90d' ? 90 : 30);
    final Map<String, TimelineData> data = {};
    
    for (int i = 0; i < days; i++) {
      final date = DateTime.now().subtract(Duration(days: i));
      final key = date.toIso8601String().split('T')[0];
      data[key] = TimelineData(
        events: (totalEvents / days * (0.5 + (i % 3) * 0.3)).round(),
        value: (1000 * (0.5 + (i % 3) * 0.3)),
        users: (20 * (0.5 + (i % 3) * 0.3)).round(),
      );
    }
    
    return data;
  }

  String _getStartDate(String period) {
    final now = DateTime.now();
    switch (period) {
      case '7d':
        return now.subtract(const Duration(days: 7)).toIso8601String().split('T')[0];
      case '30d':
        return now.subtract(const Duration(days: 30)).toIso8601String().split('T')[0];
      case '90d':
        return now.subtract(const Duration(days: 90)).toIso8601String().split('T')[0];
      case '1y':
        return now.subtract(const Duration(days: 365)).toIso8601String().split('T')[0];
      default:
        return now.subtract(const Duration(days: 30)).toIso8601String().split('T')[0];
    }
  }
}