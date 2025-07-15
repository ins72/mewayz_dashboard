class AnalyticsData {
  final AnalyticsOverview overview;
  final Map<String, ModuleAnalytics> modules;
  final Map<String, TimelineData> timeline;
  final List<TopPerformer> topPerformers;
  final GoalProgress goalProgress;
  final String period;
  final DateRange dateRange;

  AnalyticsData({
    required this.overview,
    required this.modules,
    required this.timeline,
    required this.topPerformers,
    required this.goalProgress,
    required this.period,
    required this.dateRange,
  });

  factory AnalyticsData.fromJson(Map<String, dynamic> json) {
    return AnalyticsData(
      overview: AnalyticsOverview.fromJson(json['overview']),
      modules: (json['modules'] as Map<String, dynamic>).map(
        (key, value) => MapEntry(key, ModuleAnalytics.fromJson(value)),
      ),
      timeline: (json['timeline'] as Map<String, dynamic>).map(
        (key, value) => MapEntry(key, TimelineData.fromJson(value)),
      ),
      topPerformers: (json['top_performers'] as List)
          .map((item) => TopPerformer.fromJson(item))
          .toList(),
      goalProgress: GoalProgress.fromJson(json['goal_progress']),
      period: json['period'],
      dateRange: DateRange.fromJson(json['date_range']),
    );
  }
}

class AnalyticsOverview {
  final int totalEvents;
  final int uniqueUsers;
  final double totalValue;
  final int activeModules;
  final double avgEventsPerUser;
  final Map<String, int> topModules;
  final Map<String, int> topActions;

  AnalyticsOverview({
    required this.totalEvents,
    required this.uniqueUsers,
    required this.totalValue,
    required this.activeModules,
    required this.avgEventsPerUser,
    required this.topModules,
    required this.topActions,
  });

  factory AnalyticsOverview.fromJson(Map<String, dynamic> json) {
    return AnalyticsOverview(
      totalEvents: json['total_events'],
      uniqueUsers: json['unique_users'],
      totalValue: json['total_value'].toDouble(),
      activeModules: json['active_modules'],
      avgEventsPerUser: json['avg_events_per_user'].toDouble(),
      topModules: Map<String, int>.from(json['top_modules']),
      topActions: Map<String, int>.from(json['top_actions']),
    );
  }
}

class ModuleAnalytics {
  final int totalEvents;
  final int uniqueUsers;
  final double totalValue;
  final Map<String, int> topActions;
  final Map<String, int> timeline;

  ModuleAnalytics({
    required this.totalEvents,
    required this.uniqueUsers,
    required this.totalValue,
    required this.topActions,
    required this.timeline,
  });

  factory ModuleAnalytics.fromJson(Map<String, dynamic> json) {
    return ModuleAnalytics(
      totalEvents: json['total_events'],
      uniqueUsers: json['unique_users'],
      totalValue: json['total_value'].toDouble(),
      topActions: Map<String, int>.from(json['top_actions']),
      timeline: Map<String, int>.from(json['timeline']),
    );
  }
}

class TimelineData {
  final int events;
  final double value;
  final int users;

  TimelineData({
    required this.events,
    required this.value,
    required this.users,
  });

  factory TimelineData.fromJson(Map<String, dynamic> json) {
    return TimelineData(
      events: json['events'],
      value: json['value'].toDouble(),
      users: json['users'],
    );
  }
}

class TopPerformer {
  final User user;
  final int totalEvents;
  final double totalValue;
  final int modules;
  final String lastActivity;

  TopPerformer({
    required this.user,
    required this.totalEvents,
    required this.totalValue,
    required this.modules,
    required this.lastActivity,
  });

  factory TopPerformer.fromJson(Map<String, dynamic> json) {
    return TopPerformer(
      user: User.fromJson(json['user']),
      totalEvents: json['total_events'],
      totalValue: json['total_value'].toDouble(),
      modules: json['modules'],
      lastActivity: json['last_activity'],
    );
  }
}

class GoalProgress {
  final Goal revenueGoal;
  final Goal engagementGoal;

  GoalProgress({
    required this.revenueGoal,
    required this.engagementGoal,
  });

  factory GoalProgress.fromJson(Map<String, dynamic> json) {
    return GoalProgress(
      revenueGoal: Goal.fromJson(json['revenue_goal']),
      engagementGoal: Goal.fromJson(json['engagement_goal']),
    );
  }
}

class Goal {
  final double target;
  final double current;
  final double progress;

  Goal({
    required this.target,
    required this.current,
    required this.progress,
  });

  factory Goal.fromJson(Map<String, dynamic> json) {
    return Goal(
      target: json['target'].toDouble(),
      current: json['current'].toDouble(),
      progress: json['progress'].toDouble(),
    );
  }
}

class DateRange {
  final String start;
  final String end;

  DateRange({
    required this.start,
    required this.end,
  });

  factory DateRange.fromJson(Map<String, dynamic> json) {
    return DateRange(
      start: json['start'],
      end: json['end'],
    );
  }
}

class User {
  final String id;
  final String name;
  final String email;

  User({
    required this.id,
    required this.name,
    required this.email,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
    );
  }
}