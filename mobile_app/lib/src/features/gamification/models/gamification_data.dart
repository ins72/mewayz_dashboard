class GamificationData {
  final Achievements achievements;
  final Progress progress;
  final Leaderboard leaderboard;

  GamificationData({
    required this.achievements,
    required this.progress,
    required this.leaderboard,
  });

  factory GamificationData.fromJson(Map<String, dynamic> json) {
    return GamificationData(
      achievements: Achievements.fromJson(json['achievements']),
      progress: Progress.fromJson(json['progress']),
      leaderboard: Leaderboard.fromJson(json['leaderboard']),
    );
  }
}

class Achievements {
  final List<Achievement> completed;
  final List<Achievement> inProgress;
  final int totalPoints;
  final List<Achievement> recent;

  Achievements({
    required this.completed,
    required this.inProgress,
    required this.totalPoints,
    required this.recent,
  });

  factory Achievements.fromJson(Map<String, dynamic> json) {
    return Achievements(
      completed: (json['completed'] as List)
          .map((item) => Achievement.fromJson(item))
          .toList(),
      inProgress: (json['in_progress'] as List)
          .map((item) => Achievement.fromJson(item))
          .toList(),
      totalPoints: json['total_points'],
      recent: (json['recent'] as List)
          .map((item) => Achievement.fromJson(item))
          .toList(),
    );
  }
}

class Achievement {
  final String id;
  final String name;
  final String description;
  final String icon;
  final String category;
  final String type;
  final int points;
  final Map<String, dynamic> criteria;
  final UserProgress userProgress;
  final String? earnedAt;

  Achievement({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    required this.category,
    required this.type,
    required this.points,
    required this.criteria,
    required this.userProgress,
    this.earnedAt,
  });

  factory Achievement.fromJson(Map<String, dynamic> json) {
    return Achievement(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      icon: json['icon'],
      category: json['category'],
      type: json['type'],
      points: json['points'],
      criteria: json['criteria'],
      userProgress: UserProgress.fromJson(json['user_progress']),
      earnedAt: json['earned_at'],
    );
  }
}

class Progress {
  final Map<String, List<ProgressItem>> byModule;
  final ProgressSummary summary;
  final List<Milestone> nextMilestones;

  Progress({
    required this.byModule,
    required this.summary,
    required this.nextMilestones,
  });

  factory Progress.fromJson(Map<String, dynamic> json) {
    return Progress(
      byModule: (json['by_module'] as Map<String, dynamic>).map(
        (key, value) => MapEntry(
          key,
          (value as List).map((item) => ProgressItem.fromJson(item)).toList(),
        ),
      ),
      summary: ProgressSummary.fromJson(json['summary']),
      nextMilestones: (json['next_milestones'] as List)
          .map((item) => Milestone.fromJson(item))
          .toList(),
    );
  }
}

class ProgressItem {
  final String action;
  final double currentValue;
  final double targetValue;
  final double progressPercentage;
  final int streakCount;
  final String lastActivity;

  ProgressItem({
    required this.action,
    required this.currentValue,
    required this.targetValue,
    required this.progressPercentage,
    required this.streakCount,
    required this.lastActivity,
  });

  factory ProgressItem.fromJson(Map<String, dynamic> json) {
    return ProgressItem(
      action: json['action'],
      currentValue: json['current_value'].toDouble(),
      targetValue: json['target_value'].toDouble(),
      progressPercentage: json['progress_percentage'].toDouble(),
      streakCount: json['streak_count'],
      lastActivity: json['last_activity'],
    );
  }
}

class ProgressSummary {
  final int totalActivities;
  final int completedGoals;
  final double averageProgress;
  final int longestStreak;
  final String lastActivity;

  ProgressSummary({
    required this.totalActivities,
    required this.completedGoals,
    required this.averageProgress,
    required this.longestStreak,
    required this.lastActivity,
  });

  factory ProgressSummary.fromJson(Map<String, dynamic> json) {
    return ProgressSummary(
      totalActivities: json['total_activities'],
      completedGoals: json['completed_goals'],
      averageProgress: json['average_progress'].toDouble(),
      longestStreak: json['longest_streak'],
      lastActivity: json['last_activity'],
    );
  }
}

class Milestone {
  final Achievement achievement;
  final double currentProgress;
  final double target;
  final double progressPercentage;

  Milestone({
    required this.achievement,
    required this.currentProgress,
    required this.target,
    required this.progressPercentage,
  });

  factory Milestone.fromJson(Map<String, dynamic> json) {
    return Milestone(
      achievement: Achievement.fromJson(json['achievement']),
      currentProgress: json['current_progress'].toDouble(),
      target: json['target'].toDouble(),
      progressPercentage: json['progress_percentage'].toDouble(),
    );
  }
}

class Leaderboard {
  final int? userRank;
  final int totalParticipants;
  final int userPoints;

  Leaderboard({
    required this.userRank,
    required this.totalParticipants,
    required this.userPoints,
  });

  factory Leaderboard.fromJson(Map<String, dynamic> json) {
    return Leaderboard(
      userRank: json['user_rank'],
      totalParticipants: json['total_participants'],
      userPoints: json['user_points'],
    );
  }
}

class LeaderboardEntry {
  final int rank;
  final User user;
  final int totalPoints;
  final int totalAchievements;
  final Achievement? lastAchievement;

  LeaderboardEntry({
    required this.rank,
    required this.user,
    required this.totalPoints,
    required this.totalAchievements,
    this.lastAchievement,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntry(
      rank: json['rank'],
      user: User.fromJson(json['user']),
      totalPoints: json['total_points'],
      totalAchievements: json['total_achievements'],
      lastAchievement: json['last_achievement'] != null
          ? Achievement.fromJson(json['last_achievement'])
          : null,
    );
  }
}

class UserProgress {
  final double progress;
  final bool isCompleted;
  final String? earnedAt;

  UserProgress({
    required this.progress,
    required this.isCompleted,
    this.earnedAt,
  });

  factory UserProgress.fromJson(Map<String, dynamic> json) {
    return UserProgress(
      progress: json['progress'].toDouble(),
      isCompleted: json['is_completed'],
      earnedAt: json['earned_at'],
    );
  }
}

class AchievementsResponse {
  final List<Achievement> achievements;
  final List<String> categories;
  final List<String> types;

  AchievementsResponse({
    required this.achievements,
    required this.categories,
    required this.types,
  });

  factory AchievementsResponse.fromJson(Map<String, dynamic> json) {
    return AchievementsResponse(
      achievements: (json['achievements'] as List)
          .map((item) => Achievement.fromJson(item))
          .toList(),
      categories: List<String>.from(json['categories']),
      types: List<String>.from(json['types']),
    );
  }
}

class LeaderboardResponse {
  final List<LeaderboardEntry> leaderboard;
  final int? userRank;
  final int totalParticipants;
  final String period;

  LeaderboardResponse({
    required this.leaderboard,
    required this.userRank,
    required this.totalParticipants,
    required this.period,
  });

  factory LeaderboardResponse.fromJson(Map<String, dynamic> json) {
    return LeaderboardResponse(
      leaderboard: (json['leaderboard'] as List)
          .map((item) => LeaderboardEntry.fromJson(item))
          .toList(),
      userRank: json['user_rank'],
      totalParticipants: json['total_participants'],
      period: json['period'],
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