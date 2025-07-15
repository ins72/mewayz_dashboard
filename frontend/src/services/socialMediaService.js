import apiClient from '../utils/apiClient';

const socialMediaService = {
  // Get social media accounts
  async getAccounts(workspaceId) {
    try {
      const response = await apiClient.get('/social-media-accounts', {
        params: { workspace_id: workspaceId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching social media accounts:', error);
      throw error;
    }
  },

  // Create social media account
  async createAccount(workspaceId, accountData) {
    try {
      const response = await apiClient.post('/social-media-accounts', {
        workspace_id: workspaceId,
        ...accountData
      });
      return response.data;
    } catch (error) {
      console.error('Error creating social media account:', error);
      throw error;
    }
  },

  // Get social media posts
  async getPosts(workspaceId, accountId = null, page = 1, limit = 10) {
    try {
      const params = { workspace_id: workspaceId, page, limit };
      if (accountId) params.account_id = accountId;
      
      const response = await apiClient.get('/social-media-posts', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching social media posts:', error);
      throw error;
    }
  },

  // Create social media post
  async createPost(workspaceId, postData) {
    try {
      const response = await apiClient.post('/social-media-posts', {
        workspace_id: workspaceId,
        ...postData
      });
      return response.data;
    } catch (error) {
      console.error('Error creating social media post:', error);
      throw error;
    }
  },

  // Update social media post
  async updatePost(postId, postData) {
    try {
      const response = await apiClient.put(`/social-media-posts/${postId}`, postData);
      return response.data;
    } catch (error) {
      console.error('Error updating social media post:', error);
      throw error;
    }
  },

  // Delete social media post
  async deletePost(postId) {
    try {
      const response = await apiClient.delete(`/social-media-posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting social media post:', error);
      throw error;
    }
  },

  // Publish social media post
  async publishPost(postId) {
    try {
      const response = await apiClient.post(`/social-media-posts/${postId}/publish`);
      return response.data;
    } catch (error) {
      console.error('Error publishing social media post:', error);
      throw error;
    }
  },

  // Duplicate social media post
  async duplicatePost(postId) {
    try {
      const response = await apiClient.post(`/social-media-posts/${postId}/duplicate`);
      return response.data;
    } catch (error) {
      console.error('Error duplicating social media post:', error);
      throw error;
    }
  },

  // Get social media analytics
  async getAnalytics(workspaceId, accountId = null, startDate = null, endDate = null) {
    try {
      const params = { workspace_id: workspaceId };
      if (accountId) params.account_id = accountId;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await apiClient.get('/social-media/analytics', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching social media analytics:', error);
      throw error;
    }
  },

  // Refresh account tokens
  async refreshAccountTokens(accountId) {
    try {
      const response = await apiClient.post(`/social-media-accounts/${accountId}/refresh-tokens`);
      return response.data;
    } catch (error) {
      console.error('Error refreshing account tokens:', error);
      throw error;
    }
  }
};

export default socialMediaService;