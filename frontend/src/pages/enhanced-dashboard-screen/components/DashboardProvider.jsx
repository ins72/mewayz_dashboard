import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import dashboardService from '../../../utils/dashboardService';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const { user, userProfile } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    workspace: null,
    goals: [],
    features: [],
    metrics: [],
    quickActions: [],
    notifications: [],
    activities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showGoalSetupModal, setShowGoalSetupModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [realTimeConnection, setRealTimeConnection] = useState(null);

  // Initialize dashboard data
  const initializeDashboard = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const result = await dashboardService.getDashboardData(user.id);
      
      if (result?.success) {
        setDashboardData(result.data);
      } else {
        setError(result?.error || 'Failed to load dashboard data');
      }
    } catch (error) {
      setError('Something went wrong loading dashboard. Please try again.');
      console.log('Dashboard initialization error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Setup real-time updates
  useEffect(() => {
    if (!user?.id || !dashboardData.workspace?.id) return;

    const setupRealTime = async () => {
      try {
        const connection = await dashboardService.setupRealTimeUpdates(
          dashboardData.workspace.id,
          {
            onMetricUpdate: (data) => {
              setDashboardData(prev => ({
                ...prev,
                metrics: dashboardService.updateMetrics(prev.metrics, data)
              }));
            },
            onGoalStatusChange: (data) => {
              setDashboardData(prev => ({
                ...prev,
                goals: dashboardService.updateGoalStatus(prev.goals, data)
              }));
            },
            onTeamUpdate: (data) => {
              setDashboardData(prev => ({
                ...prev,
                activities: [data, ...prev.activities.slice(0, 19)]
              }));
            },
            onNotification: (data) => {
              setDashboardData(prev => ({
                ...prev,
                notifications: [data, ...prev.notifications.slice(0, 9)]
              }));
            }
          }
        );
        setRealTimeConnection(connection);
      } catch (error) {
        console.log('Real-time setup error:', error);
      }
    };

    setupRealTime();

    return () => {
      if (realTimeConnection) {
        dashboardService.closeRealTimeConnection(realTimeConnection);
      }
    };
  }, [user?.id, dashboardData.workspace?.id]);

  // Initialize dashboard on user change
  useEffect(() => {
    initializeDashboard();
  }, [initializeDashboard]);

  // Permission checking functions
  const checkPermission = useCallback((permission) => {
    return dashboardService.checkUserPermission(userProfile, permission);
  }, [userProfile]);

  const hasFeatureAccess = useCallback((featureSlug) => {
    return dashboardService.hasFeatureAccess(
      dashboardData.workspace,
      dashboardData.features,
      featureSlug,
      userProfile
    );
  }, [dashboardData.workspace, dashboardData.features, userProfile]);

  // Goal management functions
  const setupGoal = useCallback(async (goalId, setupData) => {
    try {
      const result = await dashboardService.setupGoal(goalId, setupData);
      
      if (result?.success) {
        setDashboardData(prev => ({
          ...prev,
          goals: prev.goals.map(goal => 
            goal.id === goalId 
              ? { ...goal, setup_completed: true, configuration: setupData }
              : goal
          )
        }));
        setShowGoalSetupModal(false);
        setSelectedGoal(null);
        return { success: true };
      } else {
        return { success: false, error: result?.error };
      }
    } catch (error) {
      console.log('Goal setup error:', error);
      return { success: false, error: 'Failed to setup goal' };
    }
  }, []);

  const enableGoal = useCallback(async (goalId) => {
    try {
      const result = await dashboardService.enableGoal(goalId);
      
      if (result?.success) {
        setDashboardData(prev => ({
          ...prev,
          goals: prev.goals.map(goal => 
            goal.id === goalId 
              ? { ...goal, is_enabled: true }
              : goal
          )
        }));
        return { success: true };
      } else {
        return { success: false, error: result?.error };
      }
    } catch (error) {
      console.log('Goal enable error:', error);
      return { success: false, error: 'Failed to enable goal' };
    }
  }, []);

  // Feature usage tracking
  const incrementFeatureUsage = useCallback(async (featureSlug) => {
    try {
      await dashboardService.incrementFeatureUsage(
        dashboardData.workspace?.id,
        featureSlug
      );
      
      setDashboardData(prev => ({
        ...prev,
        features: prev.features.map(feature => 
          feature.slug === featureSlug
            ? { ...feature, usage_count: (feature.usage_count || 0) + 1 }
            : feature
        )
      }));
    } catch (error) {
      console.log('Feature usage tracking error:', error);
    }
  }, [dashboardData.workspace?.id]);

  // Modal management
  const openGoalSetup = useCallback((goal) => {
    setSelectedGoal(goal);
    setShowGoalSetupModal(true);
  }, []);

  const closeGoalSetup = useCallback(() => {
    setShowGoalSetupModal(false);
    setSelectedGoal(null);
  }, []);

  const value = {
    // Data
    ...dashboardData,
    loading,
    error,
    
    // Permission functions
    checkPermission,
    hasFeatureAccess,
    
    // Goal management
    setupGoal,
    enableGoal,
    openGoalSetup,
    closeGoalSetup,
    selectedGoal,
    
    // Feature usage
    incrementFeatureUsage,
    
    // Modal states
    showSettingsModal,
    setShowSettingsModal,
    showGoalSetupModal,
    
    // Utility functions
    refreshDashboard: initializeDashboard,
    clearError: () => setError(null)
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export default DashboardContext;