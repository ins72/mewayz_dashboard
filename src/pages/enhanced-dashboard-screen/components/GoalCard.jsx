import React from 'react';
import { TrendingUp, TrendingDown, Settings, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { useDashboard } from './DashboardProvider';

const GoalCard = ({ goal, status = 'active', canManage = false }) => {
  const { enableGoal, openGoalSetup } = useDashboard();

  // Generate mock metrics based on goal type
  const generateMetrics = (goalSlug) => {
    const metricsMap = {
      'instagram': {
        primary: { value: 12500, label: 'Followers', trend: 12.5 },
        secondary: { value: 4.2, label: 'Engagement %', trend: 8.3 }
      },
      'link_in_bio': {
        primary: { value: 8340, label: 'Clicks', trend: -5.2 },
        secondary: { value: 12.5, label: 'Conversion %', trend: 15.7 }
      },
      'courses': {
        primary: { value: 847, label: 'Students', trend: 25.3 },
        secondary: { value: 78.5, label: 'Completion %', trend: 3.2 }
      },
      'ecommerce': {
        primary: { value: 45320, label: 'Revenue', trend: 18.9 },
        secondary: { value: 234, label: 'Orders', trend: 12.1 }
      },
      'crm': {
        primary: { value: 2847, label: 'Contacts', trend: 9.7 },
        secondary: { value: 156, label: 'Deals', trend: -3.4 }
      },
      'analytics': {
        primary: { value: 15620, label: 'Pageviews', trend: 22.1 },
        secondary: { value: 4580, label: 'Sessions', trend: 14.8 }
      }
    };
    return metricsMap[goalSlug] || metricsMap['analytics'];
  };

  const metrics = generateMetrics(goal?.slug);

  const formatValue = (value, label) => {
    if (label?.includes('Revenue')) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    if (label?.includes('%')) {
      return `${value}%`;
    }
    if (value > 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value?.toLocaleString();
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          bgColor: 'bg-white dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          statusIcon: CheckCircle,
          statusColor: 'text-green-600',
          statusText: 'Active',
          showMetrics: true
        };
      case 'setup_required':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          statusIcon: AlertCircle,
          statusColor: 'text-yellow-600',
          statusText: 'Setup Required',
          showMetrics: false
        };
      case 'available':
        return {
          bgColor: 'bg-gray-50 dark:bg-gray-900',
          borderColor: 'border-gray-200 dark:border-gray-700',
          statusIcon: Play,
          statusColor: 'text-gray-600',
          statusText: 'Available',
          showMetrics: false
        };
      default:
        return {
          bgColor: 'bg-white dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          statusIcon: CheckCircle,
          statusColor: 'text-green-600',
          statusText: 'Active',
          showMetrics: true
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.statusIcon;

  const handleCardClick = () => {
    if (status === 'setup_required') {
      openGoalSetup(goal);
    } else if (status === 'available' && canManage) {
      enableGoal(goal.id);
    }
  };

  const handleSettingsClick = (e) => {
    e.stopPropagation();
    openGoalSetup(goal);
  };

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 ${
        status !== 'active' ? 'cursor-pointer hover:scale-105' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
              style={{ backgroundColor: goal?.icon_color || '#6B7280' }}
            >
              {goal?.name?.charAt(0) || 'G'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {goal?.name || 'Goal Name'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <StatusIcon size={14} className={config.statusColor} />
                <span className={`text-sm ${config.statusColor}`}>
                  {config.statusText}
                </span>
              </div>
            </div>
          </div>
          
          {status === 'active' && canManage && (
            <button
              onClick={handleSettingsClick}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings size={16} className="text-gray-400" />
            </button>
          )}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {goal?.description || 'Goal description'}
        </p>

        {/* Metrics */}
        {config.showMetrics && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatValue(metrics.primary.value, metrics.primary.label)}
                </span>
                {metrics.primary.trend > 0 ? (
                  <TrendingUp size={14} className="text-green-600" />
                ) : (
                  <TrendingDown size={14} className="text-red-600" />
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {metrics.primary.label}
              </p>
              <p className={`text-xs ${metrics.primary.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.primary.trend > 0 ? '+' : ''}{metrics.primary.trend}%
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatValue(metrics.secondary.value, metrics.secondary.label)}
                </span>
                {metrics.secondary.trend > 0 ? (
                  <TrendingUp size={14} className="text-green-600" />
                ) : (
                  <TrendingDown size={14} className="text-red-600" />
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {metrics.secondary.label}
              </p>
              <p className={`text-xs ${metrics.secondary.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.secondary.trend > 0 ? '+' : ''}{metrics.secondary.trend}%
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons for Non-Active Goals */}
        {status !== 'active' && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {status === 'setup_required' ? (
              <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium">
                Complete Setup
              </button>
            ) : status === 'available' && canManage ? (
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Enable Goal
              </button>
            ) : (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                Contact admin to enable
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalCard;