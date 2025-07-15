import apiClient from '../utils/apiClient';

const workspaceService = {
  // Get all workspaces for current user
  async getWorkspaces() {
    try {
      const response = await apiClient.get('/workspaces');
      return response.data;
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      throw error;
    }
  },

  // Create new workspace
  async createWorkspace(workspaceData) {
    try {
      const response = await apiClient.post('/workspaces', workspaceData);
      return response.data;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  },

  // Get workspace by ID
  async getWorkspace(workspaceId) {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workspace:', error);
      throw error;
    }
  },

  // Update workspace
  async updateWorkspace(workspaceId, workspaceData) {
    try {
      const response = await apiClient.put(`/workspaces/${workspaceId}`, workspaceData);
      return response.data;
    } catch (error) {
      console.error('Error updating workspace:', error);
      throw error;
    }
  },

  // Delete workspace
  async deleteWorkspace(workspaceId) {
    try {
      const response = await apiClient.delete(`/workspaces/${workspaceId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting workspace:', error);
      throw error;
    }
  },

  // Get workspace invitations
  async getInvitations(workspaceId) {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}/invitations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invitations:', error);
      throw error;
    }
  },

  // Send workspace invitation
  async sendInvitation(workspaceId, invitationData) {
    try {
      const response = await apiClient.post(`/workspaces/${workspaceId}/invitations`, invitationData);
      return response.data;
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  },

  // Send bulk invitations
  async sendBulkInvitations(workspaceId, invitationsData) {
    try {
      const response = await apiClient.post(`/workspaces/${workspaceId}/invitations/bulk`, invitationsData);
      return response.data;
    } catch (error) {
      console.error('Error sending bulk invitations:', error);
      throw error;
    }
  },

  // Get invitation analytics
  async getInvitationAnalytics(workspaceId) {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}/invitations/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invitation analytics:', error);
      throw error;
    }
  },

  // Accept invitation
  async acceptInvitation(token) {
    try {
      const response = await apiClient.post(`/invitations/${token}/accept`);
      return response.data;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  },

  // Decline invitation
  async declineInvitation(token) {
    try {
      const response = await apiClient.post(`/invitations/${token}/decline`);
      return response.data;
    } catch (error) {
      console.error('Error declining invitation:', error);
      throw error;
    }
  },

  // Get invitation by token
  async getInvitationByToken(token) {
    try {
      const response = await apiClient.get(`/invitations/${token}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invitation:', error);
      throw error;
    }
  },

  // Resend invitation
  async resendInvitation(invitationId) {
    try {
      const response = await apiClient.post(`/invitations/${invitationId}/resend`);
      return response.data;
    } catch (error) {
      console.error('Error resending invitation:', error);
      throw error;
    }
  },

  // Cancel invitation
  async cancelInvitation(invitationId) {
    try {
      const response = await apiClient.delete(`/invitations/${invitationId}`);
      return response.data;
    } catch (error) {
      console.error('Error canceling invitation:', error);
      throw error;
    }
  },

  // Get all available goals for workspace setup
  async getGoals() {
    try {
      const response = await apiClient.get('/goals');
      return response.data;
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }
  },

  // Get features for a specific goal
  async getFeaturesByGoal(goalId) {
    try {
      // Mock data for development - in production this would come from API
      const mockFeatures = {
        'instagram_management': [
          { id: 'content_scheduling', name: 'Content Scheduling', description: 'Schedule posts and stories', goal_id: 'instagram_management', category: 'Automation', required: true },
          { id: 'hashtag_research', name: 'Hashtag Research', description: 'Find trending hashtags', goal_id: 'instagram_management', category: 'Research', required: false },
          { id: 'analytics_dashboard', name: 'Analytics Dashboard', description: 'Track engagement metrics', goal_id: 'instagram_management', category: 'Analytics', required: true },
          { id: 'dm_management', name: 'DM Management', description: 'Manage direct messages', goal_id: 'instagram_management', category: 'Communication', required: false },
          { id: 'competitor_analysis', name: 'Competitor Analysis', description: 'Monitor competitor activity', goal_id: 'instagram_management', category: 'Research', required: false },
          { id: 'story_highlights', name: 'Story Highlights', description: 'Organize story highlights', goal_id: 'instagram_management', category: 'Content', required: false }
        ],
        'link_in_bio': [
          { id: 'page_builder', name: 'Page Builder', description: 'Drag-and-drop page builder', goal_id: 'link_in_bio', category: 'Design', required: true },
          { id: 'link_management', name: 'Link Management', description: 'Manage multiple links', goal_id: 'link_in_bio', category: 'Organization', required: true },
          { id: 'click_tracking', name: 'Click Tracking', description: 'Track link clicks', goal_id: 'link_in_bio', category: 'Analytics', required: true },
          { id: 'custom_templates', name: 'Custom Templates', description: 'Pre-designed templates', goal_id: 'link_in_bio', category: 'Design', required: false },
          { id: 'ab_testing', name: 'A/B Testing', description: 'Test different page versions', goal_id: 'link_in_bio', category: 'Optimization', required: false },
          { id: 'mobile_optimization', name: 'Mobile Optimization', description: 'Mobile-responsive design', goal_id: 'link_in_bio', category: 'Design', required: true }
        ],
        'course_creation': [
          { id: 'course_builder', name: 'Course Builder', description: 'Create structured courses', goal_id: 'course_creation', category: 'Content', required: true },
          { id: 'video_hosting', name: 'Video Hosting', description: 'Host course videos', goal_id: 'course_creation', category: 'Media', required: true },
          { id: 'student_management', name: 'Student Management', description: 'Manage enrollments', goal_id: 'course_creation', category: 'Management', required: true },
          { id: 'discussion_forums', name: 'Discussion Forums', description: 'Community discussions', goal_id: 'course_creation', category: 'Community', required: false },
          { id: 'assessments', name: 'Assessments', description: 'Quizzes and assignments', goal_id: 'course_creation', category: 'Assessment', required: false },
          { id: 'certificates', name: 'Certificates', description: 'Course completion certificates', goal_id: 'course_creation', category: 'Certification', required: false }
        ],
        'ecommerce': [
          { id: 'product_catalog', name: 'Product Catalog', description: 'Manage product listings', goal_id: 'ecommerce', category: 'Inventory', required: true },
          { id: 'inventory_tracking', name: 'Inventory Tracking', description: 'Track stock levels', goal_id: 'ecommerce', category: 'Inventory', required: true },
          { id: 'order_processing', name: 'Order Processing', description: 'Process and fulfill orders', goal_id: 'ecommerce', category: 'Orders', required: true },
          { id: 'payment_gateway', name: 'Payment Gateway', description: 'Accept payments online', goal_id: 'ecommerce', category: 'Payments', required: true },
          { id: 'shipping_management', name: 'Shipping Management', description: 'Manage shipping options', goal_id: 'ecommerce', category: 'Fulfillment', required: false },
          { id: 'discount_codes', name: 'Discount Codes', description: 'Create promotional codes', goal_id: 'ecommerce', category: 'Marketing', required: false }
        ],
        'crm': [
          { id: 'contact_management', name: 'Contact Management', description: 'Organize customer contacts', goal_id: 'crm', category: 'Contacts', required: true },
          { id: 'lead_scoring', name: 'Lead Scoring', description: 'Score and prioritize leads', goal_id: 'crm', category: 'Leads', required: false },
          { id: 'sales_pipeline', name: 'Sales Pipeline', description: 'Track sales opportunities', goal_id: 'crm', category: 'Sales', required: true },
          { id: 'task_management', name: 'Task Management', description: 'Manage follow-up tasks', goal_id: 'crm', category: 'Organization', required: false },
          { id: 'communication_history', name: 'Communication History', description: 'Track all interactions', goal_id: 'crm', category: 'Communication', required: true },
          { id: 'reporting_dashboard', name: 'Reporting Dashboard', description: 'Sales and activity reports', goal_id: 'crm', category: 'Analytics', required: false }
        ],
        'marketing_hub': [
          { id: 'email_campaigns', name: 'Email Campaigns', description: 'Create and send email campaigns', goal_id: 'marketing_hub', category: 'Email', required: true },
          { id: 'automation_workflows', name: 'Automation Workflows', description: 'Set up marketing automation', goal_id: 'marketing_hub', category: 'Automation', required: true },
          { id: 'list_management', name: 'List Management', description: 'Manage subscriber lists', goal_id: 'marketing_hub', category: 'Lists', required: true },
          { id: 'campaign_analytics', name: 'Campaign Analytics', description: 'Track campaign performance', goal_id: 'marketing_hub', category: 'Analytics', required: true },
          { id: 'ab_testing', name: 'A/B Testing', description: 'Test email variations', goal_id: 'marketing_hub', category: 'Optimization', required: false },
          { id: 'social_integration', name: 'Social Integration', description: 'Connect with social media', goal_id: 'marketing_hub', category: 'Integration', required: false }
        ]
      };

      return {
        success: true,
        data: mockFeatures[goalId] || []
      };
    } catch (error) {
      console.error('Error fetching features:', error);
      return {
        success: false,
        error: 'Failed to load features'
      };
    }
  },

  // Get all available features
  async getAllFeatures() {
    try {
      const goals = await this.getGoals();
      if (!goals.success) {
        return goals;
      }

      const allFeatures = [];
      for (const goal of goals.data) {
        const features = await this.getFeaturesByGoal(goal.id);
        if (features.success) {
          allFeatures.push(...features.data);
        }
      }

      return {
        success: true,
        data: allFeatures
      };
    } catch (error) {
      console.error('Error fetching all features:', error);
      return {
        success: false,
        error: 'Failed to load features'
      };
    }
  },

  // Complete workspace setup with wizard data
  async completeWorkspaceSetup(workspaceId, setupData) {
    try {
      const response = await apiClient.post(`/workspaces/${workspaceId}/complete-setup`, setupData);
      return response.data;
    } catch (error) {
      console.error('Error completing workspace setup:', error);
      throw error;
    }
  },

  // Save workspace setup progress
  async saveSetupProgress(workspaceId, step, data) {
    try {
      const response = await apiClient.post(`/workspaces/${workspaceId}/setup-progress`, {
        step,
        data
      });
      return response.data;
    } catch (error) {
      console.error('Error saving setup progress:', error);
      throw error;
    }
  },

  // Get workspace setup progress
  async getSetupProgress(workspaceId) {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}/setup-progress`);
      return response.data;
    } catch (error) {
      console.error('Error fetching setup progress:', error);
      throw error;
    }
  }
};

export default workspaceService;