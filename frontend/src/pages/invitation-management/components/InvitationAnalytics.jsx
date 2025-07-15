import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Mail, CheckCircle, Clock, XCircle, BarChart3, PieChart } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const InvitationAnalytics = ({ analytics, loading }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-8 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
        <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 mb-2">No analytics data available</p>
        <p className="text-gray-500 text-sm">Send some invitations to see analytics here</p>
      </div>
    );
  }

  const { overview, distribution } = analytics;

  const stats = [
    {
      title: 'Total Sent',
      value: overview.total,
      icon: Mail,
      color: 'blue',
      change: null
    },
    {
      title: 'Accepted',
      value: overview.accepted,
      icon: CheckCircle,
      color: 'green',
      change: overview.total > 0 ? `${((overview.accepted / overview.total) * 100).toFixed(1)}%` : '0%'
    },
    {
      title: 'Pending',
      value: overview.pending,
      icon: Clock,
      color: 'yellow',
      change: overview.total > 0 ? `${((overview.pending / overview.total) * 100).toFixed(1)}%` : '0%'
    },
    {
      title: 'Declined',
      value: overview.declined,
      icon: XCircle,
      color: 'red',
      change: overview.total > 0 ? `${((overview.declined / overview.total) * 100).toFixed(1)}%` : '0%'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      red: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[color] || colors.blue;
  };

  const getAcceptanceRateColor = (rate) => {
    if (rate >= 70) return 'text-green-400';
    if (rate >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Invitation Analytics</h2>
        <p className="text-gray-400">Track the performance of your team invitations</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${getColorClasses(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                {stat.change && (
                  <div className="text-sm font-medium text-gray-400">
                    {stat.change}
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.title}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Acceptance Rate Highlight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-700/50"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Acceptance Rate</h3>
            <p className="text-gray-300 text-sm">
              Your invitation success rate
            </p>
          </div>
          
          <div className="text-right">
            <div className={`text-3xl font-bold ${getAcceptanceRateColor(overview.acceptanceRate)}`}>
              {overview.acceptanceRate}%
            </div>
            <div className="flex items-center text-sm text-gray-400">
              {overview.acceptanceRate >= 70 ? (
                <TrendingUp className="w-4 h-4 mr-1 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1 text-red-400" />
              )}
              {overview.acceptanceRate >= 70 ? 'Excellent' : overview.acceptanceRate >= 50 ? 'Good' : 'Needs improvement'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        {distribution?.roles && Object.keys(distribution.roles).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center mb-4">
              <PieChart className="w-5 h-5 text-blue-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Role Distribution</h3>
            </div>
            
            <div className="space-y-4">
              {Object.entries(distribution.roles)
                .sort(([,a], [,b]) => b - a)
                .map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-300 capitalize">{role}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${(count / overview.total) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-white font-medium text-sm w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Department Distribution */}
        {distribution?.departments && Object.keys(distribution.departments).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center mb-4">
              <BarChart3 className="w-5 h-5 text-green-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Department Distribution</h3>
            </div>
            
            <div className="space-y-4">
              {Object.entries(distribution.departments)
                .sort(([,a], [,b]) => b - a)
                .map(([department, count]) => (
                  <div key={department} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-300">{department}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${(count / overview.total) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-white font-medium text-sm w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-gray-800 rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Insights & Recommendations</h3>
        
        <div className="space-y-4">
          {overview.acceptanceRate < 50 && (
            <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
              <h4 className="text-red-300 font-medium mb-1">Low Acceptance Rate</h4>
              <p className="text-red-200 text-sm">
                Consider adding personal messages to invitations or following up with pending invites.
              </p>
            </div>
          )}
          
          {overview.pending > overview.accepted && overview.total > 5 && (
            <div className="p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
              <h4 className="text-yellow-300 font-medium mb-1">Many Pending Invitations</h4>
              <p className="text-yellow-200 text-sm">
                You have more pending than accepted invitations. Consider sending reminder emails.
              </p>
            </div>
          )}
          
          {overview.acceptanceRate >= 70 && (
            <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
              <h4 className="text-green-300 font-medium mb-1">Great Acceptance Rate!</h4>
              <p className="text-green-200 text-sm">
                Your invitation strategy is working well. Keep up the personalized approach.
              </p>
            </div>
          )}
          
          {overview.total === 0 && (
            <div className="p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
              <h4 className="text-blue-300 font-medium mb-1">Get Started</h4>
              <p className="text-blue-200 text-sm">
                Send your first team invitation to start building your workspace community.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default InvitationAnalytics;