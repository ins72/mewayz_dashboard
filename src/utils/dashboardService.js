import { supabase } from './supabase';

class DashboardService {
  // Get comprehensive dashboard data
  async getDashboardData(userId) {
    try {
      // Get user's workspace
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspace_members')
        .select(`
          workspace_id,
          role,
          workspaces (
            id,
            name,
            slug,
            description,
            subscription_tier,
            branding,
            settings
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (workspaceError) {
        return { success: false, error: workspaceError.message };
      }

      const workspace = workspaceData?.workspaces;
      if (!workspace) {
        return { success: false, error: 'No active workspace found' };
      }

      // Get workspace goals with their status
      const { data: goalsData, error: goalsError } = await supabase
        .from('workspace_goals')
        .select(`
          *,
          goals (
            id,
            name,
            slug,
            description,
            icon_name,
            icon_color,
            category
          )
        `)
        .eq('workspace_id', workspace.id);

      if (goalsError) {
        return { success: false, error: goalsError.message };
      }

      // Get workspace features with usage data
      const { data: featuresData, error: featuresError } = await supabase
        .from('workspace_features')
        .select(`
          *,
          features (
            id,
            name,
            slug,
            description,
            tier_availability,
            usage_limits
          )
        `)
        .eq('workspace_id', workspace.id)
        .eq('is_enabled', true);

      if (featuresError) {
        return { success: false, error: featuresError.message };
      }

      // Transform data for frontend
      const goals = goalsData?.map(wg => ({
        ...wg.goals,
        is_enabled: wg.is_enabled,
        setup_completed: wg.setup_completed,
        configuration: wg.configuration
      })) || [];

      const features = featuresData?.map(wf => ({
        ...wf.features,
        is_enabled: wf.is_enabled,
        usage_count: wf.usage_count,
        usage_limit: wf.usage_limit,
        configuration: wf.configuration
      })) || [];

      // Mock recent activities (would come from audit log in real implementation)
      const activities = this.generateMockActivities();

      // Mock notifications (would come from notifications table)
      const notifications = this.generateMockNotifications();

      return {
        success: true,
        data: {
          workspace,
          goals,
          features,
          metrics: [], // Generated dynamically based on goals
          quickActions: [], // Generated dynamically based on features
          notifications,
          activities
        }
      };

    } catch (error) {
      return { success: false, error: 'Failed to load dashboard data' };
    }
  }

  // Setup real-time updates
  async setupRealTimeUpdates(workspaceId, callbacks) {
    try {
      const channel = supabase
        .channel(`workspace_${workspaceId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'workspace_goals',
            filter: `workspace_id=eq.${workspaceId}`
          },
          (payload) => {
            if (callbacks.onGoalStatusChange) {
              callbacks.onGoalStatusChange(payload);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'workspace_features',
            filter: `workspace_id=eq.${workspaceId}`
          },
          (payload) => {
            if (callbacks.onFeatureUpdate) {
              callbacks.onFeatureUpdate(payload);
            }
          }
        )
        .subscribe();

      return channel;
    } catch (error) {
      console.log('Real-time setup error:', error);
      return null;
    }
  }

  // Close real-time connection
  closeRealTimeConnection(connection) {
    if (connection) {
      supabase.removeChannel(connection);
    }
  }

  // Check user permissions
  checkUserPermission(userProfile, permission) {
    // Mock permission checking - in real implementation this would check roles and permissions
    const role = userProfile?.role || 'member';
    
    const permissions = {
      admin: ['*'], // All permissions
      manager: [
        'goals.view', 'goals.manage',
        'features.view', 'features.manage',
        'team.view', 'team.manage',
        'workspace.settings.view', 'workspace.settings.manage',
        'analytics.view'
      ],
      member: [
        'goals.view',
        'features.view',
        'analytics.view'
      ]
    };

    const userPermissions = permissions[role] || permissions.member;
    
    return userPermissions.includes('*') || userPermissions.includes(permission);
  }

  // Check feature access
  hasFeatureAccess(workspace, features, featureSlug, userProfile) {
    const feature = features?.find(f => f.slug === featureSlug);
    if (!feature || !feature.is_enabled) return false;

    // Check tier availability
    const tierAvailability = feature.tier_availability || {};
    const workspaceTier = workspace?.subscription_tier || 'free';
    
    if (!tierAvailability[workspaceTier]) return false;

    // Check usage limits
    if (feature.usage_limit && feature.usage_limit > 0) {
      return (feature.usage_count || 0) < feature.usage_limit;
    }

    return true;
  }

  // Goal management
  async setupGoal(goalId, setupData) {
    try {
      const { data, error } = await supabase
        .from('workspace_goals')
        .update({
          setup_completed: true,
          configuration: setupData,
          updated_at: new Date().toISOString()
        })
        .eq('goal_id', goalId)
        .select();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to setup goal' };
    }
  }

  async enableGoal(goalId) {
    try {
      const { data, error } = await supabase
        .from('workspace_goals')
        .update({
          is_enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('goal_id', goalId)
        .select();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to enable goal' };
    }
  }

  // Feature usage tracking
  async incrementFeatureUsage(workspaceId, featureSlug) {
    try {
      // Call the Postgres function to increment usage
      const { data, error } = await supabase.rpc('increment_feature_usage', {
        workspace_uuid: workspaceId,
        feature_slug: featureSlug
      });

      if (error) {
        console.log('Feature usage increment error:', error);
      }

      return { success: !error, data };
    } catch (error) {
      console.log('Feature usage tracking error:', error);
      return { success: false };
    }
  }

  // Utility functions for data updates
  updateMetrics(currentMetrics, updateData) {
    // Logic to update metrics array with new data
    return currentMetrics.map(metric => 
      metric.id === updateData.id 
        ? { ...metric, ...updateData }
        : metric
    );
  }

  updateGoalStatus(currentGoals, updateData) {
    // Logic to update goals array with new status
    return currentGoals.map(goal => 
      goal.id === updateData.new?.goal_id 
        ? { ...goal, ...updateData.new }
        : goal
    );
  }

  // Mock data generators (for development)
  generateMockActivities() {
    return [
      {
        id: 1,
        type: 'goal_enabled',
        message: 'Instagram Management goal was enabled',
        user: 'John Doe',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        icon: 'Target',
        color: 'text-blue-600'
      },
      {
        id: 2,
        type: 'feature_used',
        message: 'Post Scheduler was used to schedule 3 posts',
        user: 'Jane Smith',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        icon: 'TrendingUp',
        color: 'text-green-600'
      }
    ];
  }

  generateMockNotifications() {
    return [
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
      }
    ];
  }
}

export default new DashboardService();