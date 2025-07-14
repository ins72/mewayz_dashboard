import React from 'react';
import { Clock, User, Target, Settings, TrendingUp, Bell } from 'lucide-react';
import { useDashboard } from './DashboardProvider';

const ActivityFeed = () => {
  const { activities, loading } = useDashboard();

  // Mock activities if none available
  const mockActivities = [
    {
      id: 1,
      type: 'goal_enabled',
      message: 'Instagram Management goal was enabled',
      user: 'John Doe',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      icon: Target,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'feature_used',
      message: 'Post Scheduler was used to schedule 3 posts',
      user: 'Jane Smith', 
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      id: 3,
      type: 'team_update',
      message: 'Sarah Johnson joined the workspace',
      user: 'System',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      icon: User,
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'settings_changed',
      message: 'Workspace settings were updated',
      user: 'John Doe',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      icon: Settings,
      color: 'text-gray-600'
    },
    {
      id: 5,
      type: 'milestone',
      message: 'Reached 10,000 Instagram followers!',
      user: 'System',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
      icon: Bell,
      color: 'text-yellow-600'
    }
  ];

  const displayActivities = activities?.length > 0 ? activities : mockActivities;

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return time.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {displayActivities?.slice(0, 8)?.map((activity) => {
          const IconComponent = activity.icon || Clock;
          
          return (
            <div key={activity.id} className="flex items-start gap-3 group">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.color} bg-opacity-10 dark:bg-opacity-20 flex-shrink-0`}>
                <IconComponent size={14} className={activity.color} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">
                  {activity.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.user}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {displayActivities?.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Clock size={32} className="mx-auto mb-2 opacity-50" />
          <p>No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;