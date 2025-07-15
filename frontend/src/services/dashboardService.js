/**
 * Dashboard Service
 * Handles dashboard data, workspace configuration, and personalized content
 */

import apiClient from '../utils/apiClient';

class DashboardService {
  /**
   * Get workspace dashboard data
   * @param {string} workspaceId - The workspace ID
   * @returns {Promise} Dashboard data
   */
  async getDashboardData(workspaceId) {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}/dashboard`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Return mock data for development
      return {
        success: true,
        data: this.getMockDashboardData()
      };
    }
  }

  /**
   * Get workspace configuration from setup wizard
   * @param {string} workspaceId - The workspace ID
   * @returns {Promise} Workspace configuration
   */
  async getWorkspaceConfiguration(workspaceId) {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}/configuration`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workspace configuration:', error);
      
      // Return mock configuration for development
      return {
        success: true,
        data: this.getMockWorkspaceConfiguration()
      };
    }
  }

  /**
   * Get enabled features for workspace
   * @param {string} workspaceId - The workspace ID
   * @returns {Promise} Enabled features
   */
  async getEnabledFeatures(workspaceId) {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}/features`);
      return response.data;
    } catch (error) {
      console.error('Error fetching enabled features:', error);
      
      // Return mock features for development
      return {
        success: true,
        data: this.getMockEnabledFeatures()
      };
    }
  }

  /**
   * Get workspace analytics
   * @param {string} workspaceId - The workspace ID
   * @param {string} period - Time period (7d, 30d, 90d)
   * @returns {Promise} Analytics data
   */
  async getWorkspaceAnalytics(workspaceId, period = '30d') {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}/analytics`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching workspace analytics:', error);
      
      // Return mock analytics for development
      return {
        success: true,
        data: this.getMockAnalytics(period)
      };
    }
  }

  /**
   * Get team overview
   * @param {string} workspaceId - The workspace ID
   * @returns {Promise} Team data
   */
  async getTeamOverview(workspaceId) {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}/team`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team overview:', error);
      
      // Return mock team data for development
      return {
        success: true,
        data: this.getMockTeamOverview()
      };
    }
  }

  /**
   * Get user achievements
   * @param {string} workspaceId - The workspace ID
   * @returns {Promise} Achievements data
   */
  async getAchievements(workspaceId) {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}/achievements`);
      return response.data;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      
      // Return mock achievements for development
      return {
        success: true,
        data: this.getMockAchievements()
      };
    }
  }

  /**
   * Get mock dashboard data for development
   * @returns {Object} Mock dashboard data
   */
  getMockDashboardData() {
    return {
      workspace: {
        id: 'workspace-1',
        name: 'My Awesome Business',
        slug: 'my-awesome-business',
        industry: 'Technology',
        teamSize: '6-20 employees',
        createdAt: '2024-01-15T10:30:00Z'
      },
      overview: {
        totalFeatures: 12,
        activeGoals: 4,
        teamMembers: 8,
        completedTasks: 45,
        pendingTasks: 12
      },
      recentActivity: [
        {
          id: 1,
          type: 'feature_used',
          title: 'Content scheduled for Instagram',
          description: '5 posts scheduled for next week',
          timestamp: '2024-01-15T14:30:00Z',
          user: 'John Doe',
          icon: '📸'
        },
        {
          id: 2,
          type: 'team_activity',
          title: 'New team member joined',
          description: 'Sarah Johnson joined as Content Manager',
          timestamp: '2024-01-15T13:15:00Z',
          user: 'System',
          icon: '👥'
        },
        {
          id: 3,
          type: 'achievement',
          title: 'Achievement unlocked',
          description: 'First 100 Instagram followers milestone',
          timestamp: '2024-01-15T12:00:00Z',
          user: 'Achievement System',
          icon: '🏆'
        }
      ],
      quickActions: [
        {
          id: 'schedule_post',
          title: 'Schedule Post',
          description: 'Schedule a new Instagram post',
          icon: '📅',
          color: 'bg-pink-500',
          href: '/instagram/schedule'
        },
        {
          id: 'create_link',
          title: 'Create Link',
          description: 'Add new link to bio page',
          icon: '🔗',
          color: 'bg-blue-500',
          href: '/link-bio/create'
        },
        {
          id: 'add_product',
          title: 'Add Product',
          description: 'Add new product to store',
          icon: '🛒',
          color: 'bg-green-500',
          href: '/ecommerce/products/create'
        },
        {
          id: 'send_email',
          title: 'Send Email',
          description: 'Create email campaign',
          icon: '📧',
          color: 'bg-purple-500',
          href: '/email/campaigns/create'
        },
        {
          id: 'browse_templates',
          title: 'Browse Templates',
          description: 'Discover professional templates',
          icon: '📋',
          color: 'bg-indigo-500',
          href: '/template-marketplace'
        },
        {
          id: 'create_template',
          title: 'Create Template',
          description: 'Upload and sell your templates',
          icon: '🎨',
          color: 'bg-amber-500',
          href: '/template-creator'
        }
      ]
    };
  }

  /**
   * Get mock workspace configuration
   * @returns {Object} Mock workspace configuration
   */
  getMockWorkspaceConfiguration() {
    return {
      selectedGoals: [
        {
          id: 'instagram_management',
          name: 'Instagram Management',
          description: 'Manage your Instagram presence, generate leads, and grow your audience',
          icon: '📸',
          color: 'bg-pink-500',
          priority: 1,
          setupComplete: true
        },
        {
          id: 'link_in_bio',
          name: 'Link in Bio',
          description: 'Create custom landing pages and manage your link in bio',
          icon: '🔗',
          color: 'bg-blue-500',
          priority: 2,
          setupComplete: true
        },
        {
          id: 'ecommerce',
          name: 'E-commerce',
          description: 'Set up and manage your online store with inventory tracking',
          icon: '🛒',
          color: 'bg-green-500',
          priority: 3,
          setupComplete: false
        },
        {
          id: 'marketing_hub',
          name: 'Marketing Hub',
          description: 'Execute email campaigns and marketing automation',
          icon: '📧',
          color: 'bg-purple-500',
          priority: 4,
          setupComplete: true
        }
      ],
      subscription: {
        plan: 'professional',
        billingCycle: 'monthly',
        featuresEnabled: 12,
        maxFeatures: 50,
        cost: 12.00,
        currency: 'USD'
      },
      branding: {
        logo: null,
        primaryColor: '#007AFF',
        secondaryColor: '#6C5CE7',
        fontFamily: 'Inter'
      }
    };
  }

  /**
   * Get mock enabled features
   * @returns {Object} Mock enabled features
   */
  getMockEnabledFeatures() {
    return {
      instagram_management: [
        { id: 'content_scheduling', name: 'Content Scheduling', enabled: true, usage: 85 },
        { id: 'hashtag_research', name: 'Hashtag Research', enabled: true, usage: 60 },
        { id: 'analytics_dashboard', name: 'Analytics Dashboard', enabled: true, usage: 95 }
      ],
      link_in_bio: [
        { id: 'page_builder', name: 'Page Builder', enabled: true, usage: 70 },
        { id: 'click_tracking', name: 'Click Tracking', enabled: true, usage: 80 },
        { id: 'ab_testing', name: 'A/B Testing', enabled: false, usage: 0 }
      ],
      ecommerce: [
        { id: 'product_catalog', name: 'Product Catalog', enabled: true, usage: 45 },
        { id: 'inventory_tracking', name: 'Inventory Tracking', enabled: true, usage: 30 },
        { id: 'order_processing', name: 'Order Processing', enabled: false, usage: 0 }
      ],
      marketing_hub: [
        { id: 'email_campaigns', name: 'Email Campaigns', enabled: true, usage: 65 },
        { id: 'automation_workflows', name: 'Automation Workflows', enabled: true, usage: 40 },
        { id: 'list_management', name: 'List Management', enabled: true, usage: 55 }
      ]
    };
  }

  /**
   * Get mock analytics data
   * @param {string} period - Time period
   * @returns {Object} Mock analytics data
   */
  getMockAnalytics(period) {
    return {
      period,
      metrics: {
        totalUsers: 1247,
        activeUsers: 892,
        newUsers: 156,
        userGrowth: 12.5,
        totalSessions: 3456,
        avgSessionDuration: 185, // seconds
        bounceRate: 0.32,
        conversionRate: 0.058
      },
      goalPerformance: {
        instagram_management: {
          posts: 45,
          engagement: 8.7,
          followers: 2341,
          growth: 15.3
        },
        link_in_bio: {
          clicks: 1234,
          conversions: 87,
          ctr: 0.078,
          topLinks: ['Product Page', 'Contact', 'About']
        },
        ecommerce: {
          orders: 23,
          revenue: 1456.78,
          avgOrderValue: 63.34,
          topProducts: ['Product A', 'Product B', 'Product C']
        },
        marketing_hub: {
          emailsSent: 5670,
          openRate: 0.245,
          clickRate: 0.067,
          unsubscribeRate: 0.012
        }
      },
      chartData: {
        userGrowth: [
          { date: '2024-01-01', users: 1000 },
          { date: '2024-01-08', users: 1050 },
          { date: '2024-01-15', users: 1120 },
          { date: '2024-01-22', users: 1200 },
          { date: '2024-01-29', users: 1247 }
        ],
        revenue: [
          { date: '2024-01-01', amount: 1200 },
          { date: '2024-01-08', amount: 1350 },
          { date: '2024-01-15', amount: 1420 },
          { date: '2024-01-22', amount: 1380 },
          { date: '2024-01-29', amount: 1456 }
        ]
      }
    };
  }

  /**
   * Get mock team overview
   * @returns {Object} Mock team overview
   */
  getMockTeamOverview() {
    return {
      totalMembers: 8,
      activeMembers: 7,
      pendingInvitations: 2,
      members: [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Owner',
          avatar: null,
          lastActive: '2024-01-15T14:30:00Z',
          status: 'active'
        },
        {
          id: 2,
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          role: 'Content Manager',
          avatar: null,
          lastActive: '2024-01-15T13:15:00Z',
          status: 'active'
        },
        {
          id: 3,
          name: 'Mike Wilson',
          email: 'mike@example.com',
          role: 'Analytics Specialist',
          avatar: null,
          lastActive: '2024-01-15T12:00:00Z',
          status: 'active'
        },
        {
          id: 4,
          name: 'Emma Davis',
          email: 'emma@example.com',
          role: 'Social Media Manager',
          avatar: null,
          lastActive: '2024-01-15T11:30:00Z',
          status: 'active'
        }
      ],
      roleDistribution: {
        'Owner': 1,
        'Admin': 1,
        'Content Manager': 2,
        'Analytics Specialist': 1,
        'Social Media Manager': 2,
        'Editor': 1
      }
    };
  }

  /**
   * Get mock achievements
   * @returns {Object} Mock achievements
   */
  getMockAchievements() {
    return {
      totalAchievements: 25,
      unlockedAchievements: 12,
      points: 1250,
      level: 5,
      nextLevelPoints: 1500,
      achievements: [
        {
          id: 1,
          title: 'First Steps',
          description: 'Complete workspace setup',
          icon: '🚀',
          unlocked: true,
          unlockedAt: '2024-01-10T10:00:00Z',
          category: 'setup',
          points: 100
        },
        {
          id: 2,
          title: 'Social Butterfly',
          description: 'Schedule your first 10 posts',
          icon: '📸',
          unlocked: true,
          unlockedAt: '2024-01-12T15:30:00Z',
          category: 'instagram',
          points: 150
        },
        {
          id: 3,
          title: 'Link Master',
          description: 'Create your first link in bio page',
          icon: '🔗',
          unlocked: true,
          unlockedAt: '2024-01-13T09:15:00Z',
          category: 'link_bio',
          points: 100
        },
        {
          id: 4,
          title: 'Team Builder',
          description: 'Invite 5 team members',
          icon: '👥',
          unlocked: true,
          unlockedAt: '2024-01-14T14:00:00Z',
          category: 'team',
          points: 200
        },
        {
          id: 5,
          title: 'Analytics Pro',
          description: 'View analytics dashboard 20 times',
          icon: '📊',
          unlocked: false,
          category: 'analytics',
          points: 150
        },
        {
          id: 6,
          title: 'Email Expert',
          description: 'Send your first email campaign',
          icon: '📧',
          unlocked: false,
          category: 'email',
          points: 100
        }
      ],
      badges: [
        { id: 1, name: 'Early Adopter', icon: '🌟', earned: true },
        { id: 2, name: 'Content Creator', icon: '✍️', earned: true },
        { id: 3, name: 'Team Leader', icon: '👑', earned: true },
        { id: 4, name: 'Analytics Guru', icon: '📈', earned: false },
        { id: 5, name: 'Marketing Master', icon: '🎯', earned: false }
      ],
      challenges: [
        {
          id: 1,
          title: 'Post Consistently',
          description: 'Schedule 5 posts this week',
          progress: 3,
          target: 5,
          deadline: '2024-01-22T23:59:59Z',
          reward: 50,
          active: true
        },
        {
          id: 2,
          title: 'Engagement Boost',
          description: 'Reach 100 total likes this month',
          progress: 67,
          target: 100,
          deadline: '2024-01-31T23:59:59Z',
          reward: 100,
          active: true
        }
      ]
    };
  }

  /**
   * Update dashboard widget configuration
   * @param {string} workspaceId - The workspace ID
   * @param {Object} widgetConfig - Widget configuration
   * @returns {Promise} API response
   */
  async updateWidgetConfiguration(workspaceId, widgetConfig) {
    try {
      const response = await apiClient.put(`/workspaces/${workspaceId}/dashboard/widgets`, widgetConfig);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get dashboard widgets
   * @param {string} workspaceId - The workspace ID
   * @returns {Promise} Widget configuration
   */
  async getDashboardWidgets(workspaceId) {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}/dashboard/widgets`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard widgets:', error);
      
      // Return mock widgets for development
      return {
        success: true,
        data: this.getMockDashboardWidgets()
      };
    }
  }

  /**
   * Get mock dashboard widgets
   * @returns {Object} Mock widget configuration
   */
  getMockDashboardWidgets() {
    return {
      layout: [
        { id: 'overview', position: { x: 0, y: 0, w: 12, h: 2 }, enabled: true },
        { id: 'goals', position: { x: 0, y: 2, w: 6, h: 4 }, enabled: true },
        { id: 'analytics', position: { x: 6, y: 2, w: 6, h: 4 }, enabled: true },
        { id: 'team', position: { x: 0, y: 6, w: 4, h: 3 }, enabled: true },
        { id: 'achievements', position: { x: 4, y: 6, w: 4, h: 3 }, enabled: true },
        { id: 'activity', position: { x: 8, y: 6, w: 4, h: 3 }, enabled: true }
      ],
      widgets: {
        overview: { title: 'Workspace Overview', type: 'metrics' },
        goals: { title: 'Business Goals', type: 'goals' },
        analytics: { title: 'Analytics', type: 'charts' },
        team: { title: 'Team Overview', type: 'team' },
        achievements: { title: 'Achievements', type: 'gamification' },
        activity: { title: 'Recent Activity', type: 'activity' }
      }
    };
  }
}

export default new DashboardService();