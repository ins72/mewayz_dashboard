import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/Progress';
import { 
  Trophy, Star, Target, TrendingUp, Award, Users, 
  Crown, Medal, Zap, Fire, Calendar, Gift
} from 'lucide-react';
import gamificationService from '../../services/gamificationService';

const GamificationDashboard = ({ workspaceId }) => {
  const [gamificationData, setGamificationData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (workspaceId) {
      loadGamificationData();
    }
  }, [workspaceId]);

  const loadGamificationData = async () => {
    setLoading(true);
    try {
      const [dashboardData, achievementsData, leaderboardData, progressData] = await Promise.all([
        gamificationService.getDashboard(workspaceId),
        gamificationService.getAchievements(workspaceId),
        gamificationService.getLeaderboard(workspaceId),
        gamificationService.getUserProgress(workspaceId)
      ]);

      setGamificationData(dashboardData);
      setAchievements(achievementsData.achievements || []);
      setLeaderboard(leaderboardData.leaderboard || []);
      setUserProgress(progressData);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementIcon = (category) => {
    const icons = {
      general: '🎯',
      instagram: '📱',
      templates: '🎨',
      ecommerce: '💰',
      team: '👥',
      courses: '📚',
      marketing: '📧',
      crm: '🤝'
    };
    return icons[category] || '🏆';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <Trophy className="h-5 w-5 text-gray-600" />;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg p-6 h-40"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gamification Dashboard</h1>
          <p className="text-gray-600">Track your achievements and compete with your team</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="font-bold text-lg">{gamificationData?.achievements?.total_points || 0}</span>
            <span className="text-sm text-gray-600">points</span>
          </div>
          <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2">
            <Star className="h-5 w-5 text-blue-500" />
            <span className="font-bold text-lg">#{gamificationData?.leaderboard?.user_rank || 'N/A'}</span>
            <span className="text-sm text-gray-600">rank</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6">
        {['overview', 'achievements', 'leaderboard', 'progress'].map(tab => (
          <Button
            key={tab}
            onClick={() => setActiveTab(tab)}
            variant={activeTab === tab ? 'default' : 'outline'}
            className="capitalize"
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && gamificationData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100">Total Points</p>
                    <p className="text-3xl font-bold">{gamificationData.achievements.total_points}</p>
                  </div>
                  <Trophy className="h-12 w-12 text-yellow-200" />
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <span className="text-sm">+25 this week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-400 to-pink-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Achievements</p>
                    <p className="text-3xl font-bold">{gamificationData.achievements.completed.length}</p>
                  </div>
                  <Award className="h-12 w-12 text-purple-200" />
                </div>
                <div className="mt-4 flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  <span className="text-sm">{gamificationData.achievements.in_progress.length} in progress</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Team Rank</p>
                    <p className="text-3xl font-bold">#{gamificationData.leaderboard.user_rank}</p>
                  </div>
                  <Users className="h-12 w-12 text-green-200" />
                </div>
                <div className="mt-4 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="text-sm">of {gamificationData.leaderboard.total_participants} members</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>Recent Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gamificationData.achievements.recent.map((achievement, index) => (
                  <div key={achievement.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getAchievementIcon(achievement.category)}</div>
                      <div>
                        <p className="font-medium">{achievement.name}</p>
                        <p className="text-sm text-gray-600">
                          Earned {new Date(achievement.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="success">+{achievement.points} points</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Progress Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-500" />
                <span>Progress Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-gray-600">
                      {gamificationData.progress.summary.average_progress.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={gamificationData.progress.summary.average_progress} className="w-full" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Completed Goals</span>
                    <span className="text-sm text-gray-600">
                      {gamificationData.progress.summary.completed_goals} / {gamificationData.progress.summary.total_activities}
                    </span>
                  </div>
                  <Progress 
                    value={(gamificationData.progress.summary.completed_goals / gamificationData.progress.summary.total_activities) * 100} 
                    className="w-full" 
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Fire className="h-5 w-5 text-orange-500" />
                    <span className="text-sm font-medium">Current Streak</span>
                    <span className="text-sm font-bold">{gamificationData.progress.summary.longest_streak} days</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">Last Activity</span>
                    <span className="text-sm text-gray-600">
                      {new Date(gamificationData.progress.summary.last_activity).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <>
          {/* Achievement Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              onClick={() => setSelectedCategory('all')}
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              All
            </Button>
            {['general', 'instagram', 'templates', 'ecommerce', 'team', 'courses', 'marketing', 'crm'].map(category => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              <Card key={achievement.id} className={`${achievement.user_progress.is_completed ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : 'bg-white'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{getAchievementIcon(achievement.category)}</div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={achievement.user_progress.is_completed ? 'success' : 'secondary'}>
                        {achievement.points} points
                      </Badge>
                      {achievement.user_progress.is_completed && (
                        <Zap className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2">{achievement.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-gray-600">
                        {achievement.user_progress.progress}%
                      </span>
                    </div>
                    <Progress value={achievement.user_progress.progress} className="w-full" />
                    
                    {achievement.user_progress.is_completed && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <Trophy className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Completed {new Date(achievement.user_progress.earned_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Team Leaderboard</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard.map((member, index) => (
                <div key={member.user.id} className={`flex items-center justify-between p-4 rounded-lg ${
                  index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getRankIcon(member.rank)}
                      <span className="text-xl font-bold text-gray-700">#{member.rank}</span>
                    </div>
                    <div>
                      <p className="font-medium text-lg">{member.user.name}</p>
                      <p className="text-sm text-gray-600">{member.user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">{member.total_points} pts</p>
                    <p className="text-sm text-gray-600">{member.total_achievements} achievements</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Tab */}
      {activeTab === 'progress' && userProgress && (
        <div className="space-y-6">
          {/* Progress Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{userProgress.summary.total_activities}</p>
                  <p className="text-sm text-gray-600">Total Activities</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{userProgress.summary.completed_goals}</p>
                  <p className="text-sm text-gray-600">Completed Goals</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{userProgress.summary.average_progress.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">Average Progress</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{userProgress.summary.longest_streak}</p>
                  <p className="text-sm text-gray-600">Longest Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Module Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {userProgress.progress.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium capitalize">{item.module} - {item.action.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-600">
                          {item.current_value} / {item.target_value}
                          {item.streak_count > 0 && (
                            <span className="ml-2 text-orange-600">🔥 {item.streak_count} day streak</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.progress_percentage.toFixed(1)}%</p>
                        <p className="text-sm text-gray-600">
                          {new Date(item.last_activity).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(item.progress_percentage)}`}
                        style={{ width: `${item.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GamificationDashboard;