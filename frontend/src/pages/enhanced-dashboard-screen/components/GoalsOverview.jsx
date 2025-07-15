import React from 'react';
import { useDashboard } from './DashboardProvider';
import GoalCard from './GoalCard';

const GoalsOverview = () => {
  const { goals, loading, checkPermission } = useDashboard();

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const enabledGoals = goals?.filter(goal => goal?.is_enabled) || [];
  const setupRequired = goals?.filter(goal => goal?.is_enabled && !goal?.setup_completed) || [];
  const availableGoals = goals?.filter(goal => !goal?.is_enabled) || [];

  // Check if user can view goals
  const canViewGoals = checkPermission('goals.view');
  const canManageGoals = checkPermission('goals.manage');

  if (!canViewGoals) {
    return (
      <div className="mb-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <p className="text-yellow-800 dark:text-yellow-200">
            You don't have permission to view workspace goals.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Enabled Goals */}
      {enabledGoals.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Active Goals ({enabledGoals.length})
            </h2>
            {canManageGoals && (
              <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                Manage Goals →
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enabledGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                status="active"
                canManage={canManageGoals}
              />
            ))}
          </div>
        </div>
      )}

      {/* Setup Required */}
      {setupRequired.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Setup Required ({setupRequired.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {setupRequired.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                status="setup_required"
                canManage={canManageGoals}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Goals */}
      {availableGoals.length > 0 && canManageGoals && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Available Goals ({availableGoals.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                status="available"
                canManage={canManageGoals}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {goals?.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Goals Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Get started by setting up your first workspace goal to unlock platform features.
            </p>
            {canManageGoals && (
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Browse Available Goals
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsOverview;