import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Award, 
  Activity, 
  Settings, 
  Plus,
  BarChart3,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Star,
  Zap,
  Trophy,
  Clock
} from 'lucide-react';

import dashboardService from '../../services/dashboardService';
import { useAuth } from '../../contexts/AuthContext';

const EnhancedDashboardScreen = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [workspaceConfig, setWorkspaceConfig] = useState(null);
  const [enabledFeatures, setEnabledFeatures] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [teamOverview, setTeamOverview] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Mock workspace ID for development
  const workspaceId = 'workspace-1';

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all dashboard data concurrently
      const [
        dashboardResponse,
        configResponse,
        featuresResponse,
        analyticsResponse,
        teamResponse,
        achievementsResponse
      ] = await Promise.all([
        dashboardService.getDashboardData(workspaceId),
        dashboardService.getWorkspaceConfiguration(workspaceId),
        dashboardService.getEnabledFeatures(workspaceId),
        dashboardService.getWorkspaceAnalytics(workspaceId, selectedPeriod),
        dashboardService.getTeamOverview(workspaceId),
        dashboardService.getAchievements(workspaceId)
      ]);

      setDashboardData(dashboardResponse.data);
      setWorkspaceConfig(configResponse.data);
      setEnabledFeatures(featuresResponse.data);
      setAnalytics(analyticsResponse.data);
      setTeamOverview(teamResponse.data);
      setAchievements(achievementsResponse.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {dashboardData?.workspace?.name || 'Dashboard'}
                </h1>
                <p className="text-gray-400 mt-1">
                  Welcome back! Here's what's happening in your workspace.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Features</p>
                <p className="text-2xl font-bold text-white">{dashboardData?.overview?.totalFeatures || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Goals</p>
                <p className="text-2xl font-bold text-white">{dashboardData?.overview?.activeGoals || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Team Members</p>
                <p className="text-2xl font-bold text-white">{dashboardData?.overview?.teamMembers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Achievements</p>
                <p className="text-2xl font-bold text-white">{achievements?.unlockedAchievements || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Goals & Features */}
          <div className="lg:col-span-2 space-y-8">
            {/* Business Goals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Business Goals</h3>
                <Target className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workspaceConfig?.selectedGoals?.map((goal) => (
                  <div
                    key={goal.id}
                    className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${goal.color} rounded-lg flex items-center justify-center text-white`}>
                        {goal.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{goal.name}</h4>
                        <p className="text-sm text-gray-400">{goal.description}</p>
                      </div>
                      <div className="flex items-center">
                        {goal.setupComplete ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Analytics Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Analytics Overview</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatNumber(analytics?.metrics?.totalUsers || 0)}
                  </div>
                  <div className="text-sm text-gray-400">Total Users</div>
                  <div className="flex items-center justify-center mt-2">
                    <ArrowUp className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-green-400 text-sm">+{analytics?.metrics?.userGrowth || 0}%</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatNumber(analytics?.metrics?.totalSessions || 0)}
                  </div>
                  <div className="text-sm text-gray-400">Sessions</div>
                  <div className="flex items-center justify-center mt-2">
                    <Clock className="w-4 h-4 text-blue-400 mr-1" />
                    <span className="text-blue-400 text-sm">{analytics?.metrics?.avgSessionDuration || 0}s avg</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {((analytics?.metrics?.conversionRate || 0) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-400">Conversion Rate</div>
                  <div className="flex items-center justify-center mt-2">
                    <TrendingUp className="w-4 h-4 text-purple-400 mr-1" />
                    <span className="text-purple-400 text-sm">Trending</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature Usage */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Feature Usage</h3>
                <Activity className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                {Object.entries(enabledFeatures || {}).map(([goalId, features]) => (
                  <div key={goalId} className="space-y-2">
                    <h4 className="font-medium text-gray-300 capitalize">
                      {goalId.replace('_', ' ')}
                    </h4>
                    {features.slice(0, 3).map((feature) => (
                      <div key={feature.id} className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white">{feature.name}</span>
                            <span className="text-sm text-gray-400">{feature.usage}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(feature.usage)}`}
                              style={{ width: `${feature.usage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Team & Achievements */}
          <div className="space-y-8">
            {/* Team Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Team Overview</h3>
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Members</span>
                  <span className="text-white font-medium">{teamOverview?.totalMembers || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Active Now</span>
                  <span className="text-green-400 font-medium">{teamOverview?.activeMembers || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Pending Invites</span>
                  <span className="text-yellow-400 font-medium">{teamOverview?.pendingInvitations || 0}</span>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                {teamOverview?.members?.slice(0, 4).map((member) => (
                  <div key={member.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{member.name}</p>
                      <p className="text-xs text-gray-400">{member.role}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-green-400' : 'bg-gray-500'}`} />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Achievements</h3>
                <Award className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white mb-2">{achievements?.points || 0}</div>
                <div className="text-sm text-gray-400">Total Points</div>
                <div className="flex items-center justify-center mt-2">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-yellow-400 text-sm">Level {achievements?.level || 1}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {achievements?.achievements?.filter(a => a.unlocked).slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <span className="text-yellow-400">{achievement.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{achievement.title}</p>
                      <p className="text-xs text-gray-400">{achievement.description}</p>
                    </div>
                    <div className="text-xs text-yellow-400">+{achievement.points}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
                <Activity className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                {dashboardData?.recentActivity?.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-sm">{activity.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{activity.title}</p>
                      <p className="text-xs text-gray-400">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
            <Plus className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardData?.quickActions?.map((action) => (
              <button
                key={action.id}
                className="flex items-center space-x-3 p-4 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                  <span className="text-white">{action.icon}</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">{action.title}</p>
                  <p className="text-xs text-gray-400">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedDashboardScreen;