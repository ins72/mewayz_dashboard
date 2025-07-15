import apiClient from '../utils/apiClient';

const authService = {
  // Login user
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Register user
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout user
  async logout() {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/user');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const response = await apiClient.post('/auth/password/reset', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Google OAuth login
  async googleLogin() {
    try {
      const response = await apiClient.get('/auth/google');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default authService;