import apiClient from '../utils/apiClient';

const workspaceService = {
  // Get all workspaces for current user
  async getWorkspaces() {
    try {
      const response = await apiClient.get('/workspaces');
      return response.data;
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      throw error;
    }
  },

  // Create new workspace
  async createWorkspace(workspaceData) {
    try {
      const response = await apiClient.post('/workspaces', workspaceData);
      return response.data;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  },

  // Get workspace by ID
  async getWorkspace(workspaceId) {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workspace:', error);
      throw error;
    }
  },

  // Update workspace
  async updateWorkspace(workspaceId, workspaceData) {
    try {
      const response = await apiClient.put(`/workspaces/${workspaceId}`, workspaceData);
      return response.data;
    } catch (error) {
      console.error('Error updating workspace:', error);
      throw error;
    }
  },

  // Delete workspace
  async deleteWorkspace(workspaceId) {
    try {
      const response = await apiClient.delete(`/workspaces/${workspaceId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting workspace:', error);
      throw error;
    }
  },

  // Get workspace invitations
  async getInvitations(workspaceId) {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}/invitations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invitations:', error);
      throw error;
    }
  },

  // Send workspace invitation
  async sendInvitation(workspaceId, invitationData) {
    try {
      const response = await apiClient.post(`/workspaces/${workspaceId}/invitations`, invitationData);
      return response.data;
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  },

  // Send bulk invitations
  async sendBulkInvitations(workspaceId, invitationsData) {
    try {
      const response = await apiClient.post(`/workspaces/${workspaceId}/invitations/bulk`, invitationsData);
      return response.data;
    } catch (error) {
      console.error('Error sending bulk invitations:', error);
      throw error;
    }
  },

  // Get invitation analytics
  async getInvitationAnalytics(workspaceId) {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}/invitations/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invitation analytics:', error);
      throw error;
    }
  },

  // Accept invitation
  async acceptInvitation(token) {
    try {
      const response = await apiClient.post(`/invitations/${token}/accept`);
      return response.data;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  },

  // Decline invitation
  async declineInvitation(token) {
    try {
      const response = await apiClient.post(`/invitations/${token}/decline`);
      return response.data;
    } catch (error) {
      console.error('Error declining invitation:', error);
      throw error;
    }
  },

  // Get invitation by token
  async getInvitationByToken(token) {
    try {
      const response = await apiClient.get(`/invitations/${token}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invitation:', error);
      throw error;
    }
  },

  // Resend invitation
  async resendInvitation(invitationId) {
    try {
      const response = await apiClient.post(`/invitations/${invitationId}/resend`);
      return response.data;
    } catch (error) {
      console.error('Error resending invitation:', error);
      throw error;
    }
  },

  // Cancel invitation
  async cancelInvitation(invitationId) {
    try {
      const response = await apiClient.delete(`/invitations/${invitationId}`);
      return response.data;
    } catch (error) {
      console.error('Error canceling invitation:', error);
      throw error;
    }
  }
};

export default workspaceService;