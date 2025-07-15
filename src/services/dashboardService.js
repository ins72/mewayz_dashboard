import apiClient from '../utils/apiClient';

const dashboardService = {
  // Get dashboard overview stats
  async getDashboardStats(workspaceId) {
    try {
      const response = await apiClient.get(`/dashboard/stats/${workspaceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get recent activity
  async getRecentActivity(workspaceId, limit = 10) {
    try {
      const response = await apiClient.get(`/dashboard/recent-activity/${workspaceId}`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  },

  // Get quick stats
  async getQuickStats(workspaceId) {
    try {
      const response = await apiClient.get(`/dashboard/quick-stats/${workspaceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quick stats:', error);
      throw error;
    }
  },

  // Get workspace overview
  async getWorkspaceOverview(workspaceId) {
    try {
      const response = await apiClient.get(`/dashboard/workspace-overview/${workspaceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workspace overview:', error);
      throw error;
    }
  },

  // Log activity
  async logActivity(workspaceId, activityData) {
    try {
      const response = await apiClient.post(`/dashboard/activity`, {
        workspace_id: workspaceId,
        ...activityData
      });
      return response.data;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }
};

export default dashboardService;