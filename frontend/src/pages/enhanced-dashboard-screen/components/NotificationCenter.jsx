import React, { useState } from 'react';
import { Bell, X, Check, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useDashboard } from './DashboardProvider';

const NotificationCenter = () => {
  const { notifications, loading } = useDashboard();
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock notifications if none available
  const mockNotifications = [
    {
      id: 1,
      type: 'success',
      title: 'Goal Setup Complete',
      message: 'Instagram Management goal has been successfully configured.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Usage Limit Approaching',
      message: 'You have used 8/10 scheduled posts this month.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false
    },
    {
      id: 3,
      type: 'info',
      title: 'New Feature Available',
      message: 'Try the new Instagram Analytics dashboard.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      read: true
    },
    {
      id: 4,
      type: 'error',
      title: 'Connection Issue',
      message: 'Instagram API connection failed. Please reconnect.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      read: true
    }
  ];

  const displayNotifications = notifications?.length > 0 ? notifications : mockNotifications;
  const unreadCount = displayNotifications?.filter(n => !n.read)?.length || 0;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return { icon: CheckCircle, color: 'text-green-600' };
      case 'warning':
        return { icon: AlertTriangle, color: 'text-yellow-600' };
      case 'error':
        return { icon: AlertTriangle, color: 'text-red-600' };
      case 'info':
      default:
        return { icon: Info, color: 'text-blue-600' };
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    
    return time.toLocaleDateString();
  };

  const markAsRead = (notificationId) => {
    // This would update the notification in the backend
    console.log('Marking notification as read:', notificationId);
  };

  const dismissNotification = (notificationId) => {
    // This would remove the notification
    console.log('Dismissing notification:', notificationId);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell size={20} className="text-gray-600 dark:text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notifications
          </h3>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={() => {/* Mark all as read */}}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayNotifications?.slice(0, isExpanded ? 10 : 3)?.map((notification) => {
          const { icon: IconComponent, color } = getNotificationIcon(notification.type);
          
          return (
            <div 
              key={notification.id} 
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                notification.read 
                  ? 'bg-gray-50 dark:bg-gray-750' :'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color} bg-opacity-10 dark:bg-opacity-20 flex-shrink-0`}>
                <IconComponent size={14} className={color} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {formatTimeAgo(notification.timestamp)}
                </p>
              </div>
              
              <div className="flex items-center gap-1">
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Mark as read"
                  >
                    <Check size={14} className="text-gray-400" />
                  </button>
                )}
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  title="Dismiss"
                >
                  <X size={14} className="text-gray-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {displayNotifications?.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          {isExpanded ? 'Show Less' : `Show ${displayNotifications.length - 3} More`}
        </button>
      )}

      {displayNotifications?.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Bell size={32} className="mx-auto mb-2 opacity-50" />
          <p>No notifications</p>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;