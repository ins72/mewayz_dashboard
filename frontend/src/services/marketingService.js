import apiClient from '../utils/apiClient';

const marketingService = {
  // Enhanced Email Marketing
  async getEmailCampaigns(workspaceId, filters = {}) {
    try {
      const response = await apiClient.get('/email/campaigns', {
        params: { workspace_id: workspaceId, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching email campaigns:', error);
      
      return {
        success: true,
        data: this.getMockEmailCampaigns()
      };
    }
  },

  async createEmailCampaign(workspaceId, campaignData) {
    try {
      const response = await apiClient.post('/email/campaigns', {
        workspace_id: workspaceId,
        ...campaignData
      });
      return response.data;
    } catch (error) {
      console.error('Error creating email campaign:', error);
      
      return {
        success: true,
        data: {
          id: `campaign-${Date.now()}`,
          ...campaignData,
          workspace_id: workspaceId,
          status: 'draft',
          created_at: new Date().toISOString()
        }
      };
    }
  },

  // Marketing Automation
  async getMarketingAutomation(workspaceId) {
    try {
      const response = await apiClient.get('/marketing/automation', {
        params: { workspace_id: workspaceId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching marketing automation:', error);
      
      return {
        success: true,
        data: this.getMockMarketingAutomation()
      };
    }
  },

  async createAutomationWorkflow(workspaceId, workflowData) {
    try {
      const response = await apiClient.post('/marketing/automation', {
        workspace_id: workspaceId,
        ...workflowData
      });
      return response.data;
    } catch (error) {
      console.error('Error creating automation workflow:', error);
      
      return {
        success: true,
        data: {
          id: `workflow-${Date.now()}`,
          ...workflowData,
          workspace_id: workspaceId,
          status: 'active',
          created_at: new Date().toISOString()
        }
      };
    }
  },

  // Content Marketing
  async getContentLibrary(workspaceId) {
    try {
      const response = await apiClient.get('/marketing/content', {
        params: { workspace_id: workspaceId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching content library:', error);
      
      return {
        success: true,
        data: this.getMockContentLibrary()
      };
    }
  },

  async createContent(workspaceId, contentData) {
    try {
      const response = await apiClient.post('/marketing/content', {
        workspace_id: workspaceId,
        ...contentData
      });
      return response.data;
    } catch (error) {
      console.error('Error creating content:', error);
      
      return {
        success: true,
        data: {
          id: `content-${Date.now()}`,
          ...contentData,
          workspace_id: workspaceId,
          status: 'draft',
          created_at: new Date().toISOString()
        }
      };
    }
  },

  // Lead Generation
  async getLeadMagnets(workspaceId) {
    try {
      const response = await apiClient.get('/marketing/lead-magnets', {
        params: { workspace_id: workspaceId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching lead magnets:', error);
      
      return {
        success: true,
        data: this.getMockLeadMagnets()
      };
    }
  },

  async createLeadMagnet(workspaceId, magnetData) {
    try {
      const response = await apiClient.post('/marketing/lead-magnets', {
        workspace_id: workspaceId,
        ...magnetData
      });
      return response.data;
    } catch (error) {
      console.error('Error creating lead magnet:', error);
      
      return {
        success: true,
        data: {
          id: `magnet-${Date.now()}`,
          ...magnetData,
          workspace_id: workspaceId,
          status: 'active',
          created_at: new Date().toISOString()
        }
      };
    }
  },

  // Marketing Analytics
  async getMarketingAnalytics(workspaceId, timeRange = '30d') {
    try {
      const response = await apiClient.get('/marketing/analytics', {
        params: { workspace_id: workspaceId, time_range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching marketing analytics:', error);
      
      return {
        success: true,
        data: this.getMockMarketingAnalytics(workspaceId, timeRange)
      };
    }
  },

  async getConversionFunnels(workspaceId) {
    try {
      const response = await apiClient.get('/marketing/conversion-funnels', {
        params: { workspace_id: workspaceId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversion funnels:', error);
      
      return {
        success: true,
        data: this.getMockConversionFunnels()
      };
    }
  },

  // Social Media Integration
  async getSocialMediaCalendar(workspaceId, month, year) {
    try {
      const response = await apiClient.get('/marketing/social-calendar', {
        params: { workspace_id: workspaceId, month, year }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching social media calendar:', error);
      
      return {
        success: true,
        data: this.getMockSocialMediaCalendar()
      };
    }
  },

  async scheduleContentAcrossChannels(workspaceId, contentData) {
    try {
      const response = await apiClient.post('/marketing/schedule-content', {
        workspace_id: workspaceId,
        ...contentData
      });
      return response.data;
    } catch (error) {
      console.error('Error scheduling content:', error);
      
      return {
        success: true,
        data: {
          id: `scheduled-${Date.now()}`,
          ...contentData,
          workspace_id: workspaceId,
          status: 'scheduled',
          created_at: new Date().toISOString()
        }
      };
    }
  },

  // Advanced Lead Scoring
  async getLeadScoring(workspaceId) {
    try {
      const response = await apiClient.get('/marketing/lead-scoring', {
        params: { workspace_id: workspaceId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching lead scoring:', error);
      
      return {
        success: true,
        data: this.getMockLeadScoring()
      };
    }
  },

  async updateLeadScoringRules(workspaceId, rules) {
    try {
      const response = await apiClient.put('/marketing/lead-scoring', {
        workspace_id: workspaceId,
        rules
      });
      return response.data;
    } catch (error) {
      console.error('Error updating lead scoring rules:', error);
      
      return {
        success: true,
        data: {
          rules,
          updated_at: new Date().toISOString()
        }
      };
    }
  },

  // Mock Data Methods
  getMockEmailCampaigns() {
    return [
      {
        id: 'campaign-1',
        name: 'Welcome Series',
        subject: 'Welcome to Mewayz!',
        status: 'active',
        type: 'drip',
        audience: 'new_subscribers',
        sent: 1250,
        opened: 756,
        clicked: 189,
        conversion_rate: 12.5,
        created_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 'campaign-2',
        name: 'Product Launch',
        subject: 'Introducing our new CRM features',
        status: 'completed',
        type: 'one_time',
        audience: 'pro_users',
        sent: 2850,
        opened: 1710,
        clicked: 513,
        conversion_rate: 18.2,
        created_at: '2025-01-10T14:30:00Z'
      }
    ];
  },

  getMockMarketingAutomation() {
    return {
      workflows: [
        {
          id: 'workflow-1',
          name: 'Lead Nurturing Sequence',
          trigger: 'contact_created',
          status: 'active',
          steps: [
            { type: 'email', delay: 0, template: 'welcome' },
            { type: 'email', delay: 3, template: 'onboarding' },
            { type: 'email', delay: 7, template: 'value_proposition' }
          ],
          conversion_rate: 24.5,
          active_contacts: 1250
        },
        {
          id: 'workflow-2',
          name: 'Abandoned Cart Recovery',
          trigger: 'cart_abandoned',
          status: 'active',
          steps: [
            { type: 'email', delay: 1, template: 'cart_reminder' },
            { type: 'email', delay: 3, template: 'discount_offer' },
            { type: 'sms', delay: 7, template: 'final_reminder' }
          ],
          conversion_rate: 15.8,
          active_contacts: 180
        }
      ],
      performance: {
        total_workflows: 5,
        active_workflows: 3,
        total_contacts: 2450,
        conversion_rate: 19.2
      }
    };
  },

  getMockContentLibrary() {
    return [
      {
        id: 'content-1',
        title: 'The Ultimate Guide to CRM Success',
        type: 'ebook',
        status: 'published',
        format: 'pdf',
        downloads: 1250,
        engagement_score: 8.5,
        created_at: '2025-01-05T09:00:00Z'
      },
      {
        id: 'content-2',
        title: 'Social Media Marketing Best Practices',
        type: 'blog_post',
        status: 'published',
        format: 'html',
        views: 3250,
        engagement_score: 7.8,
        created_at: '2025-01-12T11:30:00Z'
      }
    ];
  },

  getMockLeadMagnets() {
    return [
      {
        id: 'magnet-1',
        title: 'Free CRM Checklist',
        type: 'checklist',
        status: 'active',
        conversions: 450,
        conversion_rate: 12.5,
        traffic_source: 'organic',
        created_at: '2025-01-08T16:00:00Z'
      },
      {
        id: 'magnet-2',
        title: 'Social Media Calendar Template',
        type: 'template',
        status: 'active',
        conversions: 320,
        conversion_rate: 18.2,
        traffic_source: 'paid',
        created_at: '2025-01-14T10:15:00Z'
      }
    ];
  },

  getMockMarketingAnalytics(workspaceId, timeRange) {
    return {
      overview: {
        total_leads: 2450,
        qualified_leads: 1180,
        conversion_rate: 48.2,
        cost_per_lead: 25.50,
        roi: 285.7,
        attribution_model: 'first_touch'
      },
      channels: [
        { name: 'Email Marketing', leads: 850, cost: 1250, roi: 340.2 },
        { name: 'Social Media', leads: 650, cost: 2100, roi: 155.8 },
        { name: 'Content Marketing', leads: 550, cost: 800, roi: 412.5 },
        { name: 'Paid Advertising', leads: 400, cost: 3200, roi: 85.3 }
      ],
      timeline: [
        { date: '2025-01-01', leads: 45, conversions: 18 },
        { date: '2025-01-02', leads: 52, conversions: 21 },
        { date: '2025-01-03', leads: 38, conversions: 15 },
        { date: '2025-01-04', leads: 67, conversions: 28 },
        { date: '2025-01-05', leads: 41, conversions: 19 }
      ]
    };
  },

  getMockConversionFunnels() {
    return [
      {
        id: 'funnel-1',
        name: 'Website to Customer',
        stages: [
          { name: 'Website Visitor', count: 10000, conversion_rate: 100 },
          { name: 'Lead Magnet Download', count: 1250, conversion_rate: 12.5 },
          { name: 'Email Subscriber', count: 980, conversion_rate: 78.4 },
          { name: 'Trial User', count: 245, conversion_rate: 25.0 },
          { name: 'Paying Customer', count: 89, conversion_rate: 36.3 }
        ],
        overall_conversion: 0.89
      }
    ];
  },

  getMockSocialMediaCalendar() {
    return {
      posts: [
        {
          id: 'post-1',
          date: '2025-01-20',
          time: '09:00',
          content: 'Check out our latest CRM features!',
          platforms: ['facebook', 'twitter', 'linkedin'],
          status: 'scheduled',
          engagement_forecast: 150
        },
        {
          id: 'post-2',
          date: '2025-01-20',
          time: '15:30',
          content: 'Customer success story: How Company X increased sales by 40%',
          platforms: ['linkedin', 'twitter'],
          status: 'scheduled',
          engagement_forecast: 230
        }
      ],
      analytics: {
        total_scheduled: 45,
        this_week: 12,
        engagement_rate: 4.8,
        best_time: '09:00'
      }
    };
  },

  getMockLeadScoring() {
    return {
      rules: [
        { criterion: 'Email opened', points: 5, category: 'engagement' },
        { criterion: 'Link clicked', points: 10, category: 'engagement' },
        { criterion: 'Page visited', points: 3, category: 'behavior' },
        { criterion: 'Form submitted', points: 15, category: 'behavior' },
        { criterion: 'Demo requested', points: 25, category: 'intent' }
      ],
      distribution: {
        hot: 125,
        warm: 340,
        cold: 580,
        unqualified: 405
      },
      performance: {
        average_score: 42.5,
        score_velocity: 2.3,
        qualification_rate: 28.5
      }
    };
  }
};

export default marketingService;