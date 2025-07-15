import { GoogleAuth } from 'react-google-login';
import apiClient from './apiClient';

class GoogleAuthService {
  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    this.isInitialized = false;
  }

  /**
   * Initialize Google OAuth
   */
  async init() {
    if (this.isInitialized) return;

    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      window.gapi.load('auth2', () => {
        window.gapi.auth2.init({
          client_id: this.clientId,
          scope: 'email profile'
        });
        this.isInitialized = true;
      });
    } catch (error) {
      throw new Error('Failed to initialize Google OAuth');
    }
  }

  /**
   * Sign in with Google
   */
  async signIn() {
    try {
      await this.init();
      
      const authInstance = window.gapi.auth2.getAuthInstance();
      const googleUser = await authInstance.signIn();
      
      const profile = googleUser.getBasicProfile();
      const authResponse = googleUser.getAuthResponse();

      // Send Google token to backend for verification
      const response = await apiClient.post('/auth/google/callback', {
        access_token: authResponse.access_token,
        id_token: authResponse.id_token,
        profile: {
          id: profile.getId(),
          email: profile.getEmail(),
          name: profile.getName(),
          avatar: profile.getImageUrl(),
          given_name: profile.getGivenName(),
          family_name: profile.getFamilyName()
        }
      });

      if (response.data.success) {
        // Store authentication data
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

      return {
        success: false,
        error: response.data.message || 'Google authentication failed'
      };
    } catch (error) {
      if (error.error === 'popup_closed_by_user') {
        return {
          success: false,
          error: 'Authentication cancelled by user'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Google authentication failed'
      };
    }
  }

  /**
   * Sign out from Google
   */
  async signOut() {
    try {
      if (this.isInitialized) {
        const authInstance = window.gapi.auth2.getAuthInstance();
        await authInstance.signOut();
      }
      
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to sign out from Google'
      };
    }
  }

  /**
   * Get current Google user
   */
  async getCurrentUser() {
    try {
      await this.init();
      
      const authInstance = window.gapi.auth2.getAuthInstance();
      const isSignedIn = authInstance.isSignedIn.get();
      
      if (isSignedIn) {
        const googleUser = authInstance.currentUser.get();
        const profile = googleUser.getBasicProfile();
        
        return {
          success: true,
          data: {
            id: profile.getId(),
            email: profile.getEmail(),
            name: profile.getName(),
            avatar: profile.getImageUrl(),
            given_name: profile.getGivenName(),
            family_name: profile.getFamilyName()
          }
        };
      }
      
      return {
        success: false,
        error: 'User not signed in'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get current user'
      };
    }
  }

  /**
   * Check if user is signed in
   */
  async isSignedIn() {
    try {
      await this.init();
      
      const authInstance = window.gapi.auth2.getAuthInstance();
      return authInstance.isSignedIn.get();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get Google auth URL for redirect-based authentication
   */
  getAuthUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: `${window.location.origin}/auth/google/callback`,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * Handle Google OAuth callback (for redirect-based auth)
   */
  async handleCallback(code) {
    try {
      const response = await apiClient.post('/auth/google/callback', {
        code,
        redirect_uri: `${window.location.origin}/auth/google/callback`
      });

      if (response.data.success) {
        // Store authentication data
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

      return {
        success: false,
        error: response.data.message || 'Google authentication failed'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Google authentication failed'
      };
    }
  }

  /**
   * Render Google Sign-In button
   */
  renderButton(elementId, options = {}) {
    const defaultOptions = {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: 250,
      locale: 'en'
    };

    const buttonOptions = { ...defaultOptions, ...options };

    window.gapi.load('signin2', () => {
      window.gapi.signin2.render(elementId, {
        ...buttonOptions,
        onsuccess: this.handleSuccess.bind(this),
        onfailure: this.handleFailure.bind(this)
      });
    });
  }

  /**
   * Handle successful Google authentication
   */
  handleSuccess(googleUser) {
    const profile = googleUser.getBasicProfile();
    const authResponse = googleUser.getAuthResponse();

    // Emit custom event for success
    const event = new CustomEvent('google-auth-success', {
      detail: {
        profile: {
          id: profile.getId(),
          email: profile.getEmail(),
          name: profile.getName(),
          avatar: profile.getImageUrl(),
          given_name: profile.getGivenName(),
          family_name: profile.getFamilyName()
        },
        authResponse
      }
    });

    document.dispatchEvent(event);
  }

  /**
   * Handle failed Google authentication
   */
  handleFailure(error) {
    // Emit custom event for failure
    const event = new CustomEvent('google-auth-failure', {
      detail: { error }
    });

    document.dispatchEvent(event);
  }

  /**
   * Listen for Google authentication events
   */
  onAuthChange(callback) {
    document.addEventListener('google-auth-success', (event) => {
      callback('success', event.detail);
    });

    document.addEventListener('google-auth-failure', (event) => {
      callback('failure', event.detail);
    });
  }

  /**
   * Validate Google token
   */
  async validateToken(token) {
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`);
      const data = await response.json();
      
      if (data.error) {
        return {
          success: false,
          error: data.error_description || 'Invalid token'
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to validate token'
      };
    }
  }
}

const googleAuthService = new GoogleAuthService();
export default googleAuthService;