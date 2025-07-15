import apiClient from '../utils/apiClient';

const linkInBioService = {
  // Get link-in-bio pages for a workspace
  async getPages(workspaceId, page = 1, limit = 10) {
    try {
      const response = await apiClient.get('/link-in-bio-pages', {
        params: { workspace_id: workspaceId, page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching link-in-bio pages:', error);
      throw error;
    }
  },

  // Create link-in-bio page
  async createPage(workspaceId, pageData) {
    try {
      const response = await apiClient.post('/link-in-bio-pages', {
        workspace_id: workspaceId,
        ...pageData
      });
      return response.data;
    } catch (error) {
      console.error('Error creating link-in-bio page:', error);
      throw error;
    }
  },

  // Update link-in-bio page
  async updatePage(pageId, pageData) {
    try {
      const response = await apiClient.put(`/link-in-bio-pages/${pageId}`, pageData);
      return response.data;
    } catch (error) {
      console.error('Error updating link-in-bio page:', error);
      throw error;
    }
  },

  // Delete link-in-bio page
  async deletePage(pageId) {
    try {
      const response = await apiClient.delete(`/link-in-bio-pages/${pageId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting link-in-bio page:', error);
      throw error;
    }
  },

  // Get public link-in-bio page
  async getPublicPage(slug) {
    try {
      const response = await apiClient.get(`/link-in-bio/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching public link-in-bio page:', error);
      throw error;
    }
  },

  // Track link click
  async trackClick(pageId, linkId) {
    try {
      const response = await apiClient.post(`/link-in-bio-pages/${pageId}/track-click`, {
        link_id: linkId
      });
      return response.data;
    } catch (error) {
      console.error('Error tracking link click:', error);
      throw error;
    }
  },

  // Get page analytics
  async getPageAnalytics(pageId) {
    try {
      const response = await apiClient.get(`/link-in-bio-pages/${pageId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching page analytics:', error);
      throw error;
    }
  },

  // Get link-in-bio statistics
  async getLinkInBioStats(workspaceId) {
    try {
      const response = await apiClient.get(`/link-in-bio/stats/${workspaceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching link-in-bio statistics:', error);
      throw error;
    }
  }
};

export default linkInBioService;