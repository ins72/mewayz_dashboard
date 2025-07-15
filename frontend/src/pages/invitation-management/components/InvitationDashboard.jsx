import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, CheckCircle, Clock, XCircle, Users, Eye } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const InvitationDashboard = ({ 
  analytics, 
  recentInvitations, 
  onInviteClick, 
  onViewAllClick 
}) => {
  const stats = [
    {
      title: 'Total Invitations',
      value: analytics?.overview?.total || 0,
      change: '+12%',
      changeType: 'positive',
      icon: Mail,
      color: 'blue'
    },
    {
      title: 'Acceptance Rate',
      value: `${analytics?.overview?.acceptanceRate || 0}%`,
      change: '+8%',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Pending',
      value: analytics?.overview?.pending || 0,
      change: '-3%',
      changeType: 'negative',
      icon: Clock,
      color: 'yellow'
    },
    {
      title: 'Declined',
      value: analytics?.overview?.declined || 0,
      change: '-2%',
      changeType: 'positive',
      icon: XCircle,
      color: 'red'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500/20 text-blue-400',
      green: 'bg-green-500/20 text-green-400',
      yellow: 'bg-yellow-500/20 text-yellow-400',
      red: 'bg-red-500/20 text-red-400'
    };
    return colors[color] || colors.blue;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      accepted: 'bg-green-500/20 text-green-400 border-green-500/30',
      declined: 'bg-red-500/20 text-red-400 border-red-500/30',
      expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusStyles[status] || statusStyles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Invitation Overview</h2>
          <p className="text-gray-400">Monitor your team invitation performance and manage pending invitations</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onViewAllClick}
            className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            View All
          </button>
          
          <button
            onClick={onInviteClick}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Members
          </button>
        </div>
      </div>

      {/* Stats Grid */}
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
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.change}
                </div>
              </div>
              
              <div>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.title}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Invitations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gray-800 rounded-xl border border-gray-700"
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Recent Invitations</h3>
            <button
              onClick={onViewAllClick}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              View all
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {recentInvitations?.length > 0 ? (
            <div className="space-y-4">
              {recentInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    
                    <div>
                      <p className="font-medium text-white">{invitation.email}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>{invitation.role}</span>
                        {invitation.department && (
                          <>
                            <span>•</span>
                            <span>{invitation.department}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(invitation.status)}
                    <div className="text-sm text-gray-400">
                      {formatDate(invitation.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No invitations sent yet</p>
              <p className="text-gray-500 text-sm mb-4">
                Start building your team by sending your first invitation
              </p>
              <button
                onClick={onInviteClick}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Send First Invitation
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Role Distribution */}
      {analytics?.distribution?.roles && Object.keys(analytics.distribution.roles).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Role Distribution</h3>
            <div className="space-y-3">
              {Object.entries(analytics.distribution.roles).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-gray-300 capitalize">{role}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${(count / analytics.overview.total) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-white font-medium text-sm w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {analytics?.distribution?.departments && Object.keys(analytics.distribution.departments).length > 0 && (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Department Distribution</h3>
              <div className="space-y-3">
                {Object.entries(analytics.distribution.departments).map(([department, count]) => (
                  <div key={department} className="flex items-center justify-between">
                    <span className="text-gray-300">{department}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${(count / analytics.overview.total) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-white font-medium text-sm w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default InvitationDashboard;