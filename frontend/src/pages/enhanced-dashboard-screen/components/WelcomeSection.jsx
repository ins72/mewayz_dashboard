import React, { useState } from 'react';
import { Search, Settings, Users, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useDashboard } from './DashboardProvider';
import SearchBar from './SearchBar';

const WelcomeSection = () => {
  const { userProfile } = useAuth();
  const { workspace, goals, loading } = useDashboard();
  const [showSearch, setShowSearch] = useState(false);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const enabledGoals = goals?.filter(goal => goal?.is_enabled) || [];
  const totalViews = 15620; // This would come from real analytics
  const teamMembers = 5; // This would come from workspace members count
  const planUsage = 75; // This would come from subscription usage

  const quickStats = [
    {
      label: 'Total Views',
      value: totalViews?.toLocaleString(),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Active Goals',
      value: enabledGoals?.length || 0,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Team Members',
      value: teamMembers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Plan Usage',
      value: `${planUsage}%`,
      icon: Settings,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {userProfile?.full_name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {workspace?.name || 'Your Workspace'} • {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Quick Search */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            <Search size={18} />
            <span className="hidden sm:inline">Quick Search</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className={`p-2 rounded-lg ${stat.bgColor} dark:bg-gray-600`}>
                <IconComponent size={20} className={`${stat.color} dark:text-gray-300`} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search Modal */}
      {showSearch && (
        <SearchBar onClose={() => setShowSearch(false)} />
      )}
    </div>
  );
};

export default WelcomeSection;