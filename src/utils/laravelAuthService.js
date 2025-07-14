import apiClient from './apiClient';

const laravelAuthService = {
  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        return { 
          success: true, 
          data: {
            session: {
              user: response.data.user,
              access_token: response.data.token
            }
          }
        };
      }

      return { success: false, error: response.data.message || 'Login failed' };
    } catch (error) {
      if (error.response?.data?.message) {
        return { success: false, error: error.response.data.message };
      }
      
      if (error.code === 'ERR_NETWORK') {
        return { 
          success: false, 
          error: 'Cannot connect to server. Please check your connection and try again.' 
        };
      }
      
      return { success: false, error: 'An unexpected error occurred during sign in' };
    }
  },

  // Sign up with email and password
  signUp: async (email, password, userData = {}) => {
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        name: userData.fullName || userData.name || '',
        password_confirmation: password
      });

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        return { 
          success: true, 
          data: {
            session: {
              user: response.data.user,
              access_token: response.data.token
            }
          }
        };
      }

      return { success: false, error: response.data.message || 'Registration failed' };
    } catch (error) {
      if (error.response?.data?.message) {
        return { success: false, error: error.response.data.message };
      }
      
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        return { success: false, error: errorMessages.join(', ') };
      }
      
      if (error.code === 'ERR_NETWORK') {
        return { 
          success: false, 
          error: 'Cannot connect to server. Please check your connection and try again.' 
        };
      }
      
      return { success: false, error: 'An unexpected error occurred during sign up' };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await apiClient.post('/auth/logout');
      
      // Clear stored data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      return { success: true };
    } catch (error) {
      // Clear stored data even if logout fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      return { success: true }; // Consider logout successful even if API fails
    }
  },

  // Get current session
  getSession: async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        return { success: true, data: { session: null } };
      }

      const response = await apiClient.get('/auth/user');
      
      if (response.data.success) {
        const user = response.data.user;
        localStorage.setItem('user', JSON.stringify(user));
        
        return { 
          success: true, 
          data: {
            session: {
              user: user,
              access_token: token
            }
          }
        };
      }

      // Token invalid, clear storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      return { success: true, data: { session: null } };
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired/invalid
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        return { success: true, data: { session: null } };
      }
      
      return { success: false, error: 'Failed to get session' };
    }
  },

  // Get user profile (Laravel doesn't separate this from user data)
  getUserProfile: async (userId) => {
    try {
      const response = await apiClient.get('/auth/user');
      
      if (response.data.success) {
        return { success: true, data: response.data.user };
      }

      return { success: false, error: response.data.message || 'Failed to load user profile' };
    } catch (error) {
      if (error.response?.data?.message) {
        return { success: false, error: error.response.data.message };
      }
      
      return { success: false, error: 'Failed to load user profile' };
    }
  },

  // Update user profile
  updateUserProfile: async (userId, updates) => {
    try {
      const response = await apiClient.put(`/auth/user`, updates);
      
      if (response.data.success) {
        const user = response.data.user;
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, data: user };
      }

      return { success: false, error: response.data.message || 'Failed to update profile' };
    } catch (error) {
      if (error.response?.data?.message) {
        return { success: false, error: error.response.data.message };
      }
      
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        return { success: false, error: errorMessages.join(', ') };
      }
      
      return { success: false, error: 'Failed to update profile' };
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      const response = await apiClient.post('/auth/password/reset', { email });
      
      if (response.data.success) {
        return { success: true };
      }

      return { success: false, error: response.data.message || 'Failed to send reset email' };
    } catch (error) {
      if (error.response?.data?.message) {
        return { success: false, error: error.response.data.message };
      }
      
      return { success: false, error: 'Failed to send reset email' };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/user');
      
      if (response.data.success) {
        return { success: true, data: response.data.user };
      }

      return { success: false, error: response.data.message || 'Failed to get current user' };
    } catch (error) {
      if (error.response?.status === 401) {
        return { success: false, error: 'User not authenticated' };
      }
      
      return { success: false, error: 'Failed to get current user' };
    }
  },

  // Mock auth state change listener (Laravel doesn't have real-time auth changes)
  onAuthStateChange: (callback) => {
    // This is a mock implementation since Laravel doesn't have real-time auth changes
    // In a real app, you might use WebSockets or polling
    
    // Check for auth changes periodically
    const interval = setInterval(async () => {
      const session = await laravelAuthService.getSession();
      if (session.success) {
        const currentUser = session.data.session?.user;
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        
        // Compare current user with stored user
        if (currentUser && !storedUser) {
          callback('SIGNED_IN', { user: currentUser });
        } else if (!currentUser && storedUser) {
          callback('SIGNED_OUT', null);
        }
      }
    }, 30000); // Check every 30 seconds

    return {
      data: {
        subscription: {
          unsubscribe: () => clearInterval(interval)
        }
      }
    };
  }
};

export default laravelAuthService;