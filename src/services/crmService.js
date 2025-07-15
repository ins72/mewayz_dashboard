import apiClient from '../utils/apiClient';

const crmService = {
  // Get CRM contacts
  async getContacts(workspaceId, page = 1, limit = 10) {
    try {
      const response = await apiClient.get('/crm-contacts', {
        params: { workspace_id: workspaceId, page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching CRM contacts:', error);
      throw error;
    }
  },

  // Create CRM contact
  async createContact(workspaceId, contactData) {
    try {
      const response = await apiClient.post('/crm-contacts', {
        workspace_id: workspaceId,
        ...contactData
      });
      return response.data;
    } catch (error) {
      console.error('Error creating CRM contact:', error);
      throw error;
    }
  },

  // Update CRM contact
  async updateContact(contactId, contactData) {
    try {
      const response = await apiClient.put(`/crm-contacts/${contactId}`, contactData);
      return response.data;
    } catch (error) {
      console.error('Error updating CRM contact:', error);
      throw error;
    }
  },

  // Delete CRM contact
  async deleteContact(contactId) {
    try {
      const response = await apiClient.delete(`/crm-contacts/${contactId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting CRM contact:', error);
      throw error;
    }
  },

  // Mark contact as contacted
  async markAsContacted(contactId) {
    try {
      const response = await apiClient.post(`/crm-contacts/${contactId}/mark-contacted`);
      return response.data;
    } catch (error) {
      console.error('Error marking contact as contacted:', error);
      throw error;
    }
  },

  // Update lead score
  async updateLeadScore(contactId, score) {
    try {
      const response = await apiClient.post(`/crm-contacts/${contactId}/update-lead-score`, {
        score
      });
      return response.data;
    } catch (error) {
      console.error('Error updating lead score:', error);
      throw error;
    }
  },

  // Add tags to contact
  async addTags(contactId, tags) {
    try {
      const response = await apiClient.post(`/crm-contacts/${contactId}/add-tags`, {
        tags
      });
      return response.data;
    } catch (error) {
      console.error('Error adding tags to contact:', error);
      throw error;
    }
  },

  // Remove tags from contact
  async removeTags(contactId, tags) {
    try {
      const response = await apiClient.post(`/crm-contacts/${contactId}/remove-tags`, {
        tags
      });
      return response.data;
    } catch (error) {
      console.error('Error removing tags from contact:', error);
      throw error;
    }
  },

  // Get contacts that need follow-up
  async getFollowUpContacts(workspaceId) {
    try {
      const response = await apiClient.get('/crm-contacts-follow-up', {
        params: { workspace_id: workspaceId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching follow-up contacts:', error);
      throw error;
    }
  },

  // Get CRM analytics
  async getAnalytics(workspaceId) {
    try {
      const response = await apiClient.get('/crm-analytics', {
        params: { workspace_id: workspaceId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching CRM analytics:', error);
      throw error;
    }
  }
};

export default crmService;