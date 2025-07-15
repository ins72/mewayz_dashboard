import apiClient from '../utils/apiClient';

const emailService = {
  // Get email statistics
  async getEmailStats(workspaceId) {
    try {
      const response = await apiClient.get(`/email/stats/${workspaceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching email stats:', error);
      throw error;
    }
  },

  // Get email campaigns
  async getCampaigns(workspaceId, page = 1, limit = 10) {
    try {
      const response = await apiClient.get(`/email/campaigns`, {
        params: { workspace_id: workspaceId, page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },

  // Create email campaign
  async createCampaign(workspaceId, campaignData) {
    try {
      const response = await apiClient.post('/email/campaigns', {
        workspace_id: workspaceId,
        ...campaignData
      });
      return response.data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  // Update email campaign
  async updateCampaign(campaignId, campaignData) {
    try {
      const response = await apiClient.put(`/email/campaigns/${campaignId}`, campaignData);
      return response.data;
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  },

  // Delete email campaign
  async deleteCampaign(campaignId) {
    try {
      const response = await apiClient.delete(`/email/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  },

  // Get email templates
  async getTemplates(workspaceId) {
    try {
      const response = await apiClient.get(`/email/templates`, {
        params: { workspace_id: workspaceId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  // Create email template
  async createTemplate(workspaceId, templateData) {
    try {
      const response = await apiClient.post('/email/templates', {
        workspace_id: workspaceId,
        ...templateData
      });
      return response.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  // Get email audiences
  async getAudiences(workspaceId) {
    try {
      const response = await apiClient.get(`/email/audiences`, {
        params: { workspace_id: workspaceId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching audiences:', error);
      throw error;
    }
  },

  // Create email audience
  async createAudience(workspaceId, audienceData) {
    try {
      const response = await apiClient.post('/email/audiences', {
        workspace_id: workspaceId,
        ...audienceData
      });
      return response.data;
    } catch (error) {
      console.error('Error creating audience:', error);
      throw error;
    }
  },

  // Send email campaign
  async sendCampaign(campaignId) {
    try {
      const response = await apiClient.post(`/email/campaigns/${campaignId}/send`);
      return response.data;
    } catch (error) {
      console.error('Error sending campaign:', error);
      throw error;
    }
  },

  // Get campaign analytics
  async getCampaignAnalytics(campaignId) {
    try {
      const response = await apiClient.get(`/email/campaigns/${campaignId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign analytics:', error);
      throw error;
    }
  }
};

export default emailService;