import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/colors.dart';
import '../../../core/constants/spacing.dart';
import '../../../shared/widgets/custom_card.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/progress_indicator.dart';
import '../models/gamification_data.dart';
import '../services/gamification_service.dart';

class GamificationDashboard extends StatefulWidget {
  final String workspaceId;

  const GamificationDashboard({
    Key? key,
    required this.workspaceId,
  }) : super(key: key);

  @override
  State<GamificationDashboard> createState() => _GamificationDashboardState();
}

class _GamificationDashboardState extends State<GamificationDashboard>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  GamificationData? _gamificationData;
  List<Achievement> _achievements = [];
  List<LeaderboardEntry> _leaderboard = [];
  UserProgress? _userProgress;
  bool _isLoading = true;
  String _selectedCategory = 'all';

  final GamificationService _gamificationService = GamificationService();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadGamificationData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadGamificationData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final results = await Future.wait([
        _gamificationService.getDashboard(widget.workspaceId),
        _gamificationService.getAchievements(widget.workspaceId),
        _gamificationService.getLeaderboard(widget.workspaceId),
        _gamificationService.getUserProgress(widget.workspaceId),
      ]);

      setState(() {
        _gamificationData = results[0] as GamificationData;
        _achievements = (results[1] as AchievementsResponse).achievements;
        _leaderboard = (results[2] as LeaderboardResponse).leaderboard;
        _userProgress = results[3] as UserProgress;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading gamification data: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Gamification',
              style: GoogleFonts.inter(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            Text(
              'Track achievements & compete',
              style: GoogleFonts.inter(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          Container(
            margin: const EdgeInsets.only(right: AppSpacing.sm),
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.amber.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.emoji_events, color: Colors.amber, size: 16),
                const SizedBox(width: 4),
                Text(
                  '${_gamificationData?.achievements.totalPoints ?? 0}',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.amber.shade800,
                  ),
                ),
              ],
            ),
          ),
          Container(
            margin: const EdgeInsets.only(right: AppSpacing.md),
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.star, color: AppColors.primary, size: 16),
                const SizedBox(width: 4),
                Text(
                  '#${_gamificationData?.leaderboard.userRank ?? 'N/A'}',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          tabs: const [
            Tab(text: 'Overview'),
            Tab(text: 'Achievements'),
            Tab(text: 'Leaderboard'),
            Tab(text: 'Progress'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: LoadingIndicator())
          : _gamificationData == null
              ? const Center(child: Text('No data available'))
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildOverviewTab(),
                    _buildAchievementsTab(),
                    _buildLeaderboardTab(),
                    _buildProgressTab(),
                  ],
                ),
    );
  }

  Widget _buildOverviewTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        children: [
          _buildSummaryCards(),
          const SizedBox(height: AppSpacing.lg),
          _buildRecentAchievements(),
          const SizedBox(height: AppSpacing.lg),
          _buildProgressOverview(),
        ],
      ),
    );
  }

  Widget _buildSummaryCards() {
    return Column(
      children: [
        CustomCard(
          child: Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Colors.amber.shade400, Colors.orange.shade500],
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Total Points',
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          color: Colors.amber.shade100,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${_gamificationData?.achievements.totalPoints ?? 0}',
                        style: GoogleFonts.inter(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.trending_up, color: Colors.white, size: 16),
                          const SizedBox(width: 4),
                          Text(
                            '+25 this week',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.emoji_events, color: Colors.white, size: 48),
              ],
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Row(
          children: [
            Expanded(
              child: CustomCard(
                child: Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Colors.purple.shade400, Colors.pink.shade500],
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Achievements',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              color: Colors.purple.shade100,
                            ),
                          ),
                          const Icon(Icons.military_tech, color: Colors.white, size: 24),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '${_gamificationData?.achievements.completed.length ?? 0}',
                        style: GoogleFonts.inter(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.star, color: Colors.white, size: 16),
                          const SizedBox(width: 4),
                          Text(
                            '${_gamificationData?.achievements.inProgress.length ?? 0} in progress',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: CustomCard(
                child: Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Colors.green.shade400, Colors.blue.shade500],
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Team Rank',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              color: Colors.green.shade100,
                            ),
                          ),
                          const Icon(Icons.people, color: Colors.white, size: 24),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '#${_gamificationData?.leaderboard.userRank ?? 'N/A'}',
                        style: GoogleFonts.inter(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.people, color: Colors.white, size: 16),
                          const SizedBox(width: 4),
                          Text(
                            'of ${_gamificationData?.leaderboard.totalParticipants ?? 0} members',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildRecentAchievements() {
    final recent = _gamificationData?.achievements.recent ?? [];
    if (recent.isEmpty) return const SizedBox();

    return CustomCard(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.emoji_events, color: Colors.amber, size: 20),
                const SizedBox(width: AppSpacing.sm),
                Text(
                  'Recent Achievements',
                  style: GoogleFonts.inter(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            ...recent.map((achievement) => Container(
              margin: const EdgeInsets.only(bottom: AppSpacing.sm),
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Text(
                    _getAchievementIcon(achievement.category),
                    style: const TextStyle(fontSize: 32),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          achievement.name,
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          'Earned ${DateTime.parse(achievement.earnedAt).day}/${DateTime.parse(achievement.earnedAt).month}',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.green.shade100,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '+${achievement.points} pts',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: Colors.green.shade800,
                      ),
                    ),
                  ),
                ],
              ),
            )).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressOverview() {
    final summary = _gamificationData?.progress.summary;
    if (summary == null) return const SizedBox();

    return CustomCard(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.track_changes, color: AppColors.primary, size: 20),
                const SizedBox(width: AppSpacing.sm),
                Text(
                  'Progress Overview',
                  style: GoogleFonts.inter(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            Column(
              children: [
                _buildProgressItem(
                  'Overall Progress',
                  summary.averageProgress,
                  '${summary.averageProgress.toStringAsFixed(1)}%',
                ),
                const SizedBox(height: AppSpacing.md),
                _buildProgressItem(
                  'Completed Goals',
                  (summary.completedGoals / summary.totalActivities) * 100,
                  '${summary.completedGoals} / ${summary.totalActivities}',
                ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  children: [
                    Expanded(
                      child: _buildStatItem(
                        Icons.local_fire_department,
                        'Current Streak',
                        '${summary.longestStreak} days',
                        Colors.orange,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: _buildStatItem(
                        Icons.calendar_today,
                        'Last Activity',
                        '${DateTime.parse(summary.lastActivity).day}/${DateTime.parse(summary.lastActivity).month}',
                        AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressItem(String title, double progress, String subtitle) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              title,
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppColors.textPrimary,
              ),
            ),
            Text(
              subtitle,
              style: GoogleFonts.inter(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        CustomProgressIndicator(
          progress: progress / 100,
          height: 8,
          backgroundColor: AppColors.surface,
          foregroundColor: AppColors.primary,
        ),
      ],
    );
  }

  Widget _buildStatItem(IconData icon, String title, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: AppSpacing.sm),
          Text(
            title,
            style: GoogleFonts.inter(
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildAchievementsTab() {
    return Column(
      children: [
        _buildCategoryFilter(),
        Expanded(
          child: _buildAchievementsGrid(),
        ),
      ],
    );
  }

  Widget _buildCategoryFilter() {
    final categories = ['all', 'general', 'instagram', 'templates', 'ecommerce', 'team', 'courses', 'marketing', 'crm'];
    
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: SizedBox(
        height: 40,
        child: ListView.builder(
          scrollDirection: Axis.horizontal,
          itemCount: categories.length,
          itemBuilder: (context, index) {
            final category = categories[index];
            final isSelected = category == _selectedCategory;
            
            return Container(
              margin: const EdgeInsets.only(right: AppSpacing.sm),
              child: FilterChip(
                label: Text(
                  category == 'all' ? 'All' : category.toUpperCase(),
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: isSelected ? Colors.white : AppColors.textSecondary,
                  ),
                ),
                selected: isSelected,
                onSelected: (selected) {
                  setState(() {
                    _selectedCategory = category;
                  });
                },
                backgroundColor: AppColors.surface,
                selectedColor: AppColors.primary,
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildAchievementsGrid() {
    final filteredAchievements = _selectedCategory == 'all'
        ? _achievements
        : _achievements.where((a) => a.category == _selectedCategory).toList();

    return GridView.builder(
      padding: const EdgeInsets.all(AppSpacing.md),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.8,
        crossAxisSpacing: AppSpacing.md,
        mainAxisSpacing: AppSpacing.md,
      ),
      itemCount: filteredAchievements.length,
      itemBuilder: (context, index) {
        final achievement = filteredAchievements[index];
        return _buildAchievementCard(achievement);
      },
    );
  }

  Widget _buildAchievementCard(Achievement achievement) {
    final isCompleted = achievement.userProgress.isCompleted;
    
    return CustomCard(
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          gradient: isCompleted
              ? LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Colors.green.shade50, Colors.emerald.shade50],
                )
              : null,
          borderRadius: BorderRadius.circular(12),
          border: isCompleted
              ? Border.all(color: Colors.green.shade200, width: 1)
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _getAchievementIcon(achievement.category),
                  style: const TextStyle(fontSize: 24),
                ),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: isCompleted ? Colors.green.shade100 : AppColors.surface,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '${achievement.points} pts',
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                          color: isCompleted ? Colors.green.shade800 : AppColors.textSecondary,
                        ),
                      ),
                    ),
                    if (isCompleted) ...[
                      const SizedBox(width: 4),
                      const Icon(Icons.bolt, color: Colors.amber, size: 16),
                    ],
                  ],
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              achievement.name,
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              achievement.description,
              style: GoogleFonts.inter(
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const Spacer(),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Progress',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    Text(
                      '${achievement.userProgress.progress}%',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.xs),
                CustomProgressIndicator(
                  progress: achievement.userProgress.progress / 100,
                  height: 6,
                  backgroundColor: AppColors.surface,
                  foregroundColor: isCompleted ? Colors.green : AppColors.primary,
                ),
                if (isCompleted) ...[
                  const SizedBox(height: AppSpacing.xs),
                  Row(
                    children: [
                      const Icon(Icons.emoji_events, color: Colors.green, size: 12),
                      const SizedBox(width: 4),
                      Text(
                        'Completed ${DateTime.parse(achievement.userProgress.earnedAt!).day}/${DateTime.parse(achievement.userProgress.earnedAt!).month}',
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                          color: Colors.green.shade800,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLeaderboardTab() {
    return CustomCard(
      margin: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              children: [
                const Icon(Icons.emoji_events, color: Colors.amber, size: 20),
                const SizedBox(width: AppSpacing.sm),
                Text(
                  'Team Leaderboard',
                  style: GoogleFonts.inter(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              itemCount: _leaderboard.length,
              itemBuilder: (context, index) {
                final member = _leaderboard[index];
                return _buildLeaderboardItem(member, index);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLeaderboardItem(LeaderboardEntry member, int index) {
    final isTopThree = member.rank <= 3;
    
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        gradient: isTopThree
            ? LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Colors.amber.shade50, Colors.orange.shade50],
              )
            : null,
        color: isTopThree ? null : AppColors.surface,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: _getRankColor(member.rank),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: _getRankIcon(member.rank) ?? Text(
                '#${member.rank}',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  member.user.name,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
                Text(
                  member.user.email,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${member.totalPoints} pts',
                style: GoogleFonts.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              Text(
                '${member.totalAchievements} achievements',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProgressTab() {
    if (_userProgress == null) return const SizedBox();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        children: [
          _buildProgressSummary(),
          const SizedBox(height: AppSpacing.lg),
          _buildModuleProgress(),
        ],
      ),
    );
  }

  Widget _buildProgressSummary() {
    final summary = _userProgress!.summary;
    
    return CustomCard(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Progress Summary',
              style: GoogleFonts.inter(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                Expanded(
                  child: _buildSummaryItem(
                    '${summary.totalActivities}',
                    'Total Activities',
                    AppColors.primary,
                  ),
                ),
                Expanded(
                  child: _buildSummaryItem(
                    '${summary.completedGoals}',
                    'Completed Goals',
                    Colors.green,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                Expanded(
                  child: _buildSummaryItem(
                    '${summary.averageProgress.toStringAsFixed(1)}%',
                    'Average Progress',
                    Colors.purple,
                  ),
                ),
                Expanded(
                  child: _buildSummaryItem(
                    '${summary.longestStreak}',
                    'Longest Streak',
                    Colors.orange,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryItem(String value, String title, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: GoogleFonts.inter(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          title,
          style: GoogleFonts.inter(
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildModuleProgress() {
    return CustomCard(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Module Progress',
              style: GoogleFonts.inter(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            ..._userProgress!.progress.map((item) => Container(
              margin: const EdgeInsets.only(bottom: AppSpacing.md),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${item.module.toUpperCase()} - ${item.action.replaceAll('_', ' ')}',
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            Row(
                              children: [
                                Text(
                                  '${item.currentValue} / ${item.targetValue}',
                                  style: GoogleFonts.inter(
                                    fontSize: 12,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                                if (item.streakCount > 0) ...[
                                  const SizedBox(width: AppSpacing.sm),
                                  Row(
                                    children: [
                                      const Icon(Icons.local_fire_department, color: Colors.orange, size: 12),
                                      const SizedBox(width: 2),
                                      Text(
                                        '${item.streakCount} day streak',
                                        style: GoogleFonts.inter(
                                          fontSize: 10,
                                          color: Colors.orange.shade800,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ],
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '${item.progressPercentage.toStringAsFixed(1)}%',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            '${DateTime.parse(item.lastActivity).day}/${DateTime.parse(item.lastActivity).month}',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  CustomProgressIndicator(
                    progress: item.progressPercentage / 100,
                    height: 6,
                    backgroundColor: AppColors.surface,
                    foregroundColor: _getProgressColor(item.progressPercentage),
                  ),
                ],
              ),
            )).toList(),
          ],
        ),
      ),
    );
  }

  String _getAchievementIcon(String category) {
    switch (category) {
      case 'general':
        return '🎯';
      case 'instagram':
        return '📱';
      case 'templates':
        return '🎨';
      case 'ecommerce':
        return '💰';
      case 'team':
        return '👥';
      case 'courses':
        return '📚';
      case 'marketing':
        return '📧';
      case 'crm':
        return '🤝';
      default:
        return '🏆';
    }
  }

  Widget? _getRankIcon(int rank) {
    switch (rank) {
      case 1:
        return const Icon(Icons.emoji_events, color: Colors.amber, size: 16);
      case 2:
        return const Icon(Icons.military_tech, color: Colors.grey, size: 16);
      case 3:
        return const Icon(Icons.emoji_events, color: Colors.brown, size: 16);
      default:
        return null;
    }
  }

  Color _getRankColor(int rank) {
    switch (rank) {
      case 1:
        return Colors.amber;
      case 2:
        return Colors.grey;
      case 3:
        return Colors.brown;
      default:
        return AppColors.primary;
    }
  }

  Color _getProgressColor(double percentage) {
    if (percentage >= 80) return Colors.green;
    if (percentage >= 60) return Colors.yellow.shade700;
    if (percentage >= 40) return Colors.orange;
    return Colors.red;
  }
}