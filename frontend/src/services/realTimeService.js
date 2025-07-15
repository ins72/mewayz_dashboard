import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Configure Pusher
window.Pusher = Pusher;

// Create Echo instance for real-time communication
const createEcho = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';
  
  return new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'reverb-key-123',
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    },
  });
};

class RealTimeService {
  constructor() {
    this.echo = null;
    this.channels = new Map();
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  /**
   * Initialize the real-time connection
   */
  init() {
    if (this.echo) {
      this.disconnect();
    }

    try {
      this.echo = createEcho();
      this.setupConnectionEvents();
      this.connected = true;
      this.reconnectAttempts = 0;
      console.log('Real-time service initialized');
    } catch (error) {
      console.error('Failed to initialize real-time service:', error);
      this.handleReconnect();
    }
  }

  /**
   * Setup connection event handlers
   */
  setupConnectionEvents() {
    if (!this.echo) return;

    this.echo.connector.pusher.connection.bind('connected', () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      console.log('Real-time connection established');
    });

    this.echo.connector.pusher.connection.bind('disconnected', () => {
      this.connected = false;
      console.log('Real-time connection disconnected');
      this.handleReconnect();
    });

    this.echo.connector.pusher.connection.bind('error', (error) => {
      console.error('Real-time connection error:', error);
      this.handleReconnect();
    });
  }

  /**
   * Handle reconnection logic
   */
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.init();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  /**
   * Subscribe to workspace channel
   */
  subscribeToWorkspace(workspaceId, callbacks = {}) {
    if (!this.echo || !workspaceId) return null;

    const channelName = `workspace.${workspaceId}`;
    
    if (this.channels.has(channelName)) {
      console.log(`Already subscribed to channel: ${channelName}`);
      return this.channels.get(channelName);
    }

    try {
      const channel = this.echo.private(channelName);
      
      // Workspace setup progress updates
      if (callbacks.onSetupProgress) {
        channel.listen('workspace.setup.progress.updated', callbacks.onSetupProgress);
      }

      // Analytics updates
      if (callbacks.onAnalyticsUpdate) {
        channel.listen('analytics.updated', callbacks.onAnalyticsUpdate);
      }

      // Team activity updates
      if (callbacks.onTeamActivity) {
        channel.listen('team.activity.updated', callbacks.onTeamActivity);
      }

      // Gamification updates
      if (callbacks.onGamificationUpdate) {
        channel.listen('gamification.updated', callbacks.onGamificationUpdate);
      }

      this.channels.set(channelName, channel);
      console.log(`Subscribed to channel: ${channelName}`);
      return channel;
    } catch (error) {
      console.error(`Failed to subscribe to channel: ${channelName}`, error);
      return null;
    }
  }

  /**
   * Unsubscribe from workspace channel
   */
  unsubscribeFromWorkspace(workspaceId) {
    const channelName = `workspace.${workspaceId}`;
    
    if (this.channels.has(channelName)) {
      const channel = this.channels.get(channelName);
      this.echo.leave(channelName);
      this.channels.delete(channelName);
      console.log(`Unsubscribed from channel: ${channelName}`);
    }
  }

  /**
   * Subscribe to user-specific notifications
   */
  subscribeToUserNotifications(userId, callback) {
    if (!this.echo || !userId) return null;

    const channelName = `user.${userId}`;
    
    try {
      const channel = this.echo.private(channelName);
      
      if (callback) {
        channel.notification(callback);
      }

      console.log(`Subscribed to user notifications: ${channelName}`);
      return channel;
    } catch (error) {
      console.error(`Failed to subscribe to user notifications: ${channelName}`, error);
      return null;
    }
  }

  /**
   * Send presence channel (for user presence)
   */
  joinPresenceChannel(channelName, callbacks = {}) {
    if (!this.echo || !channelName) return null;

    try {
      const channel = this.echo.join(channelName);
      
      if (callbacks.onJoin) {
        channel.here(callbacks.onJoin);
      }

      if (callbacks.onJoining) {
        channel.joining(callbacks.onJoining);
      }

      if (callbacks.onLeaving) {
        channel.leaving(callbacks.onLeaving);
      }

      console.log(`Joined presence channel: ${channelName}`);
      return channel;
    } catch (error) {
      console.error(`Failed to join presence channel: ${channelName}`, error);
      return null;
    }
  }

  /**
   * Get connection status
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Disconnect from real-time service
   */
  disconnect() {
    if (this.echo) {
      this.channels.forEach((channel, channelName) => {
        this.echo.leave(channelName);
      });
      this.channels.clear();
      this.echo.disconnect();
      this.echo = null;
      this.connected = false;
      console.log('Real-time service disconnected');
    }
  }

  /**
   * Update authentication token
   */
  updateAuthToken(token) {
    localStorage.setItem('token', token);
    
    // Reinitialize connection with new token
    if (this.echo) {
      this.disconnect();
      this.init();
    }
  }
}

// Create singleton instance
const realTimeService = new RealTimeService();

export default realTimeService;