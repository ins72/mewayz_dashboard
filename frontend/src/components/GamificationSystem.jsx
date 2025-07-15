import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp,
  Crown,
  Gift,
  Calendar,
  Users,
  Zap,
  Award,
  CheckCircle,
  Clock,
  Fire,
  Medal,
  BarChart3
} from 'lucide-react';

import dashboardService from '../../services/dashboardService';

const GamificationSystem = ({ workspaceId }) => {
  const [achievements, setAchievements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('achievements');

  useEffect(() => {
    loadAchievements();
  }, [workspaceId]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getAchievements(workspaceId);
      setAchievements(response.data);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (progress, target) => {
    return Math.min((progress / target) * 100, 100);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      setup: <Zap className="w-5 h-5" />,
      instagram: <Star className="w-5 h-5" />,
      link_bio: <Target className="w-5 h-5" />,
      team: <Users className="w-5 h-5" />,
      analytics: <BarChart3 className="w-5 h-5" />,
      email: <Gift className="w-5 h-5" />,
      ecommerce: <Trophy className="w-5 h-5" />
    };
    return icons[category] || <Award className="w-5 h-5" />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      setup: 'bg-blue-500',
      instagram: 'bg-pink-500',
      link_bio: 'bg-purple-500',
      team: 'bg-green-500',
      analytics: 'bg-yellow-500',
      email: 'bg-red-500',
      ecommerce: 'bg-indigo-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const formatTimeRemaining = (deadline) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Gamification Center</h3>
          <p className="text-gray-400 text-sm mt-1">Track your progress and earn rewards</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{achievements?.points || 0}</div>
            <div className="text-xs text-gray-400">Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{achievements?.level || 1}</div>
            <div className="text-xs text-gray-400">Level</div>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">Level {achievements?.level || 1}</span>
          <span className="text-sm text-gray-400">
            {achievements?.points || 0} / {achievements?.nextLevelPoints || 1500}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
            style={{
              width: `${((achievements?.points || 0) / (achievements?.nextLevelPoints || 1500)) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-900/50 rounded-lg p-1">
        {[
          { id: 'achievements', label: 'Achievements', icon: Trophy },
          { id: 'badges', label: 'Badges', icon: Medal },
          { id: 'challenges', label: 'Challenges', icon: Target },
          { id: 'leaderboard', label: 'Leaderboard', icon: Crown }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                selectedTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {selectedTab === 'achievements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-white">Your Achievements</h4>
              <div className="text-sm text-gray-400">
                {achievements?.unlockedAchievements || 0} / {achievements?.totalAchievements || 0} unlocked
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements?.achievements?.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    achievement.unlocked
                      ? 'bg-green-900/20 border-green-500/30'
                      : 'bg-gray-700/50 border-gray-600'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      achievement.unlocked
                        ? `${getCategoryColor(achievement.category)} text-white`
                        : 'bg-gray-600 text-gray-400'
                    }`}>
                      <span className="text-2xl">{achievement.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h5 className={`font-medium ${
                        achievement.unlocked ? 'text-white' : 'text-gray-300'
                      }`}>
                        {achievement.title}
                      </h5>
                      <p className="text-sm text-gray-400 mt-1">{achievement.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-yellow-400">{achievement.points} points</span>
                        </div>
                        {achievement.unlocked && (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-green-400">
                              {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'badges' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-white">Badge Collection</h4>
              <div className="text-sm text-gray-400">
                {achievements?.badges?.filter(b => b.earned).length || 0} / {achievements?.badges?.length || 0} earned
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {achievements?.badges?.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border text-center transition-all duration-300 ${
                    badge.earned
                      ? 'bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-500/30'
                      : 'bg-gray-700/50 border-gray-600'
                  }`}
                >
                  <div className={`text-4xl mb-2 ${badge.earned ? '' : 'grayscale opacity-50'}`}>
                    {badge.icon}
                  </div>
                  <h5 className={`font-medium text-sm ${
                    badge.earned ? 'text-white' : 'text-gray-400'
                  }`}>
                    {badge.name}
                  </h5>
                  {badge.earned && (
                    <div className="flex items-center justify-center mt-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'challenges' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-white">Active Challenges</h4>
              <div className="text-sm text-gray-400">
                {achievements?.challenges?.filter(c => c.active).length || 0} active
              </div>
            </div>
            
            <div className="space-y-4">
              {achievements?.challenges?.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-white">{challenge.title}</h5>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        {formatTimeRemaining(challenge.deadline)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-3">{challenge.description}</p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Progress</span>
                    <span className="text-sm text-gray-400">
                      {challenge.progress} / {challenge.target}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-600 rounded-full h-2 mb-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${getProgressPercentage(challenge.progress, challenge.target)}%`
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Gift className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-yellow-400">{challenge.reward} points</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      challenge.active
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-gray-600 text-gray-400'
                    }`}>
                      {challenge.active ? 'Active' : 'Completed'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'leaderboard' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-white">Team Leaderboard</h4>
              <div className="text-sm text-gray-400">This Week</div>
            </div>
            
            <div className="space-y-3">
              {[
                { name: 'John Doe', points: 2450, rank: 1, change: '+12' },
                { name: 'Sarah Johnson', points: 2280, rank: 2, change: '+8' },
                { name: 'Mike Wilson', points: 2100, rank: 3, change: '-1' },
                { name: 'Emma Davis', points: 1950, rank: 4, change: '+5' },
                { name: 'You', points: achievements?.points || 0, rank: 5, change: '+3' }
              ].map((player, index) => (
                <motion.div
                  key={player.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center space-x-4 p-4 rounded-lg border ${
                    player.name === 'You'
                      ? 'bg-blue-900/20 border-blue-500/30'
                      : 'bg-gray-700/50 border-gray-600'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    player.rank === 1
                      ? 'bg-yellow-500 text-black'
                      : player.rank === 2
                      ? 'bg-gray-400 text-black'
                      : player.rank === 3
                      ? 'bg-orange-500 text-black'
                      : 'bg-gray-600 text-white'
                  }`}>
                    {player.rank}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-white">{player.name}</h5>
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-400 font-medium">{player.points}</span>
                        <div className={`flex items-center space-x-1 ${
                          player.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {player.change.startsWith('+') ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingUp className="w-3 h-3 rotate-180" />
                          )}
                          <span className="text-xs">{player.change}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamificationSystem;