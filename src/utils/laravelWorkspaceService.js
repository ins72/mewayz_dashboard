import apiClient from './apiClient';

const workspaceService = {
  // Get all workspaces for current user
  getWorkspaces: async () => {
    try {
      const response = await apiClient.get('/workspaces');
      
      if (response.data.success) {
        return { success: true, data: response.data.workspaces };
      }
      
      return { success: false, error: response.data.message || 'Failed to fetch workspaces' };
    } catch (error) {
      if (error.response?.data?.message) {
        return { success: false, error: error.response.data.message };
      }
      
      return { success: false, error: 'Failed to fetch workspaces' };
    }
  },

  // Create a new workspace
  createWorkspace: async (workspaceData) => {
    try {
      const response = await apiClient.post('/workspaces', workspaceData);
      
      if (response.data.success) {
        return { success: true, data: response.data.workspace };
      }
      
      return { success: false, error: response.data.message || 'Failed to create workspace' };
    } catch (error) {
      if (error.response?.data?.message) {
        return { success: false, error: error.response.data.message };
      }
      
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        return { success: false, error: errorMessages.join(', ') };
      }
      
      return { success: false, error: 'Failed to create workspace' };
    }
  },

  // Get workspace by ID
  getWorkspace: async (workspaceId) => {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}`);
      
      if (response.data.success) {
        return { success: true, data: response.data.workspace };
      }
      
      return { success: false, error: response.data.message || 'Failed to fetch workspace' };
    } catch (error) {
      if (error.response?.data?.message) {
        return { success: false, error: error.response.data.message };
      }
      
      return { success: false, error: 'Failed to fetch workspace' };
    }
  },

  // Update workspace
  updateWorkspace: async (workspaceId, updates) => {
    try {
      const response = await apiClient.put(`/workspaces/${workspaceId}`, updates);
      
      if (response.data.success) {
        return { success: true, data: response.data.workspace };
      }
      
      return { success: false, error: response.data.message || 'Failed to update workspace' };
    } catch (error) {
      if (error.response?.data?.message) {
        return { success: false, error: error.response.data.message };
      }
      
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        return { success: false, error: errorMessages.join(', ') };
      }
      
      return { success: false, error: 'Failed to update workspace' };
    }
  },

  // Delete workspace
  deleteWorkspace: async (workspaceId) => {
    try {
      const response = await apiClient.delete(`/workspaces/${workspaceId}`);
      
      if (response.data.success) {
        return { success: true };
      }
      
      return { success: false, error: response.data.message || 'Failed to delete workspace' };
    } catch (error) {
      if (error.response?.data?.message) {
        return { success: false, error: error.response.data.message };
      }
      
      return { success: false, error: 'Failed to delete workspace' };
    }
  }
};

export default workspaceService;