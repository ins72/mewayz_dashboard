import { useEffect, useRef, useState } from 'react';
import realTimeService from '../services/realTimeService';

/**
 * Hook for real-time workspace updates
 */
export const useRealTimeWorkspace = (workspaceId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [setupProgress, setSetupProgress] = useState(null);
  const [analyticsUpdate, setAnalyticsUpdate] = useState(null);
  const [teamActivity, setTeamActivity] = useState(null);
  const [gamificationUpdate, setGamificationUpdate] = useState(null);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!workspaceId) return;

    // Initialize real-time service
    realTimeService.init();

    // Subscribe to workspace channel
    channelRef.current = realTimeService.subscribeToWorkspace(workspaceId, {
      onSetupProgress: (data) => {
        console.log('Setup progress update:', data);
        setSetupProgress(data);
      },
      onAnalyticsUpdate: (data) => {
        console.log('Analytics update:', data);
        setAnalyticsUpdate(data);
      },
      onTeamActivity: (data) => {
        console.log('Team activity update:', data);
        setTeamActivity(data);
      },
      onGamificationUpdate: (data) => {
        console.log('Gamification update:', data);
        setGamificationUpdate(data);
      }
    });

    // Update connection status
    setIsConnected(realTimeService.isConnected());

    // Cleanup function
    return () => {
      if (workspaceId) {
        realTimeService.unsubscribeFromWorkspace(workspaceId);
      }
    };
  }, [workspaceId]);

  return {
    isConnected,
    setupProgress,
    analyticsUpdate,
    teamActivity,
    gamificationUpdate,
    // Utility functions
    clearSetupProgress: () => setSetupProgress(null),
    clearAnalyticsUpdate: () => setAnalyticsUpdate(null),
    clearTeamActivity: () => setTeamActivity(null),
    clearGamificationUpdate: () => setGamificationUpdate(null)
  };
};

/**
 * Hook for real-time analytics updates
 */
export const useRealTimeAnalytics = (workspaceId) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;

    realTimeService.init();

    const channel = realTimeService.subscribeToWorkspace(workspaceId, {
      onAnalyticsUpdate: (data) => {
        setAnalyticsData(prev => ({
          ...prev,
          lastUpdate: data,
          timestamp: new Date()
        }));
      }
    });

    setIsConnected(realTimeService.isConnected());

    return () => {
      if (workspaceId) {
        realTimeService.unsubscribeFromWorkspace(workspaceId);
      }
    };
  }, [workspaceId]);

  return {
    analyticsData,
    isConnected,
    clearAnalyticsData: () => setAnalyticsData(null)
  };
};

/**
 * Hook for real-time team activity
 */
export const useRealTimeTeamActivity = (workspaceId) => {
  const [activities, setActivities] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;

    realTimeService.init();

    const channel = realTimeService.subscribeToWorkspace(workspaceId, {
      onTeamActivity: (data) => {
        setActivities(prev => [data, ...prev.slice(0, 49)]); // Keep last 50 activities
      }
    });

    setIsConnected(realTimeService.isConnected());

    return () => {
      if (workspaceId) {
        realTimeService.unsubscribeFromWorkspace(workspaceId);
      }
    };
  }, [workspaceId]);

  return {
    activities,
    isConnected,
    clearActivities: () => setActivities([])
  };
};

/**
 * Hook for real-time setup wizard progress
 */
export const useRealTimeSetupProgress = (workspaceId) => {
  const [progress, setProgress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;

    realTimeService.init();

    const channel = realTimeService.subscribeToWorkspace(workspaceId, {
      onSetupProgress: (data) => {
        setProgress(data);
        setIsComplete(data.progress === 100);
      }
    });

    setIsConnected(realTimeService.isConnected());

    return () => {
      if (workspaceId) {
        realTimeService.unsubscribeFromWorkspace(workspaceId);
      }
    };
  }, [workspaceId]);

  return {
    progress,
    isComplete,
    isConnected,
    clearProgress: () => {
      setProgress(null);
      setIsComplete(false);
    }
  };
};

/**
 * Hook for user presence in workspace
 */
export const useWorkspacePresence = (workspaceId) => {
  const [users, setUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;

    realTimeService.init();

    const channel = realTimeService.joinPresenceChannel(`workspace.${workspaceId}.presence`, {
      onJoin: (users) => {
        setUsers(users);
      },
      onJoining: (user) => {
        setUsers(prev => [...prev, user]);
      },
      onLeaving: (user) => {
        setUsers(prev => prev.filter(u => u.id !== user.id));
      }
    });

    setIsConnected(realTimeService.isConnected());

    return () => {
      if (channel) {
        realTimeService.echo.leave(`workspace.${workspaceId}.presence`);
      }
    };
  }, [workspaceId]);

  return {
    users,
    isConnected,
    userCount: users.length
  };
};

/**
 * Hook for connection status
 */
export const useRealTimeConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(realTimeService.isConnected());
      setReconnectAttempts(realTimeService.reconnectAttempts);
    };

    // Check connection status every second
    const interval = setInterval(checkConnection, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    reconnectAttempts,
    reconnect: () => realTimeService.init()
  };
};