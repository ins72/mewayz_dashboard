import apiClient from '../utils/apiClient';

const paymentService = {
  // Get payment statistics
  async getPaymentStats(workspaceId) {
    try {
      const response = await apiClient.get(`/payments/stats/${workspaceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  },

  // Get payment transactions
  async getTransactions(workspaceId, page = 1, limit = 10) {
    try {
      const response = await apiClient.get(`/payments/transactions`, {
        params: { workspace_id: workspaceId, page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Get subscriptions
  async getSubscriptions(workspaceId) {
    try {
      const response = await apiClient.get(`/payments/subscription/${workspaceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  },

  // Get all subscriptions for workspace
  async getAllSubscriptions(workspaceId) {
    try {
      const response = await apiClient.get(`/payments/subscriptions/${workspaceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all subscriptions:', error);
      throw error;
    }
  },

  // Get payment packages
  async getPackages() {
    try {
      const response = await apiClient.get('/payments/packages');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment packages:', error);
      throw error;
    }
  },

  // Create checkout session
  async createCheckoutSession(packageId, workspaceId) {
    try {
      const response = await apiClient.post('/payments/checkout/session', {
        package_id: packageId,
        workspace_id: workspaceId
      });
      return response.data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  // Get checkout status
  async getCheckoutStatus(sessionId) {
    try {
      const response = await apiClient.get(`/payments/checkout/status/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching checkout status:', error);
      throw error;
    }
  }
};

export default paymentService;