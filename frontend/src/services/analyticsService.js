import axios from 'axios';

class AnalyticsService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';
    this.api = axios.create({
      baseURL: `${this.baseURL}/api`,
    });
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Get unified analytics dashboard
  async getDashboard(workspaceId, period = '30d', modules = []) {
    try {
      const params = { workspace_id: workspaceId, period };
      if (modules.length > 0) {
        params.modules = modules;
      }
      
      const response = await this.api.get('/analytics/dashboard', {
        params,
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics dashboard:', error);
      return this.getMockDashboard(workspaceId, period);
    }
  }

  // Get module-specific analytics
  async getModuleAnalytics(workspaceId, module, period = '30d') {
    try {
      const response = await this.api.get(`/analytics/modules/${module}`, {
        params: { workspace_id: workspaceId, period },
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching module analytics:', error);
      return this.getMockModuleAnalytics(module, period);
    }
  }

  // Track analytics event
  async trackEvent(workspaceId, module, action, entityType = null, entityId = null, metadata = {}, value = 0) {
    try {
      const response = await this.api.post('/analytics/track', {
        workspace_id: workspaceId,
        module,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata,
        value
      }, {
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      return { success: false, error: error.message };
    }
  }

  // Export analytics data
  async exportAnalytics(workspaceId, period = '30d', format = 'json', modules = []) {
    try {
      const params = { workspace_id: workspaceId, period, format };
      if (modules.length > 0) {
        params.modules = modules;
      }
      
      const response = await this.api.get('/analytics/export', {
        params,
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exporting analytics:', error);
      return this.getMockExportData(workspaceId, period);
    }
  }

  // Get real-time analytics
  async getRealTimeAnalytics(workspaceId, minutes = 60) {
    try {
      const response = await this.api.get('/analytics/real-time', {
        params: { workspace_id: workspaceId, minutes },
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching real-time analytics:', error);
      return this.getMockRealTimeData(workspaceId, minutes);
    }
  }

  // Get custom report
  async getCustomReport(workspaceId, startDate, endDate, modules = [], actions = [], users = [], groupBy = 'date') {
    try {
      const response = await this.api.post('/analytics/custom-report', {
        workspace_id: workspaceId,
        start_date: startDate,
        end_date: endDate,
        modules,
        actions,
        users,
        group_by: groupBy
      }, {
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error generating custom report:', error);
      return this.getMockCustomReport(workspaceId, startDate, endDate);
    }
  }

  // Mock data methods
  getMockDashboard(workspaceId, period) {
    return {
      overview: {
        total_events: 1542,
        unique_users: 23,
        total_value: 25678.50,
        active_modules: 6,
        avg_events_per_user: 67.04,
        top_modules: {
          instagram: 456,
          crm: 234,
          marketing: 189,
          ecommerce: 167,
          courses: 145
        },
        top_actions: {
          view: 345,
          create: 234,
          update: 189,
          delete: 123,
          share: 98
        }
      },
      modules: {
        instagram: {
          total_events: 456,
          unique_users: 12,
          total_value: 8950.00,
          top_actions: {
            post_scheduled: 145,
            story_created: 98,
            hashtag_analyzed: 67
          },
          timeline: this.generateTimelineData(456, period)
        },
        crm: {
          total_events: 234,
          unique_users: 8,
          total_value: 12450.00,
          top_actions: {
            contact_created: 89,
            deal_updated: 67,
            task_completed: 45
          },
          timeline: this.generateTimelineData(234, period)
        },
        marketing: {
          total_events: 189,
          unique_users: 15,
          total_value: 3450.00,
          top_actions: {
            email_sent: 78,
            campaign_created: 56,
            lead_captured: 34
          },
          timeline: this.generateTimelineData(189, period)
        }
      },
      timeline: this.generateTimelineData(1542, period),
      top_performers: [
        {
          user: { id: '1', name: 'John Doe', email: 'john@example.com' },
          total_events: 234,
          total_value: 5678.90,
          modules: 4,
          last_activity: '2024-01-15T10:30:00Z'
        },
        {
          user: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
          total_events: 189,
          total_value: 4567.80,
          modules: 3,
          last_activity: '2024-01-15T09:15:00Z'
        }
      ],
      goal_progress: {
        revenue_goal: {
          target: 10000,
          current: 7845.30,
          progress: 78.45
        },
        engagement_goal: {
          target: 1000,
          current: 756,
          progress: 75.6
        }
      },
      period,
      date_range: {
        start: this.getStartDate(period),
        end: new Date().toISOString().split('T')[0]
      }
    };
  }

  getMockModuleAnalytics(module, period) {
    const mockData = {
      instagram: {
        post_scheduled: { count: 145, total_value: 0, avg_value: 0 },
        story_created: { count: 98, total_value: 0, avg_value: 0 },
        hashtag_analyzed: { count: 67, total_value: 0, avg_value: 0 }
      },
      crm: {
        contact_created: { count: 89, total_value: 12450, avg_value: 139.89 },
        deal_updated: { count: 67, total_value: 8900, avg_value: 132.84 },
        task_completed: { count: 45, total_value: 0, avg_value: 0 }
      },
      marketing: {
        email_sent: { count: 78, total_value: 2340, avg_value: 30.00 },
        campaign_created: { count: 56, total_value: 1680, avg_value: 30.00 },
        lead_captured: { count: 34, total_value: 1020, avg_value: 30.00 }
      }
    };

    return {
      module,
      analytics: mockData[module] || {},
      detailed_metrics: mockData[module] || {},
      period,
      date_range: {
        start: this.getStartDate(period),
        end: new Date().toISOString().split('T')[0]
      }
    };
  }

  getMockRealTimeData(workspaceId, minutes) {
    return {
      live_metrics: {
        total_events: 45,
        unique_users: 12,
        modules_active: 4,
        total_value: 567.89,
        events_per_minute: this.generateMinuteData(minutes),
        recent_events: [
          { id: '1', module: 'instagram', action: 'post_scheduled', user: 'John Doe', timestamp: new Date().toISOString(), value: 0 },
          { id: '2', module: 'crm', action: 'contact_created', user: 'Jane Smith', timestamp: new Date().toISOString(), value: 150 },
          { id: '3', module: 'marketing', action: 'email_sent', user: 'Mike Johnson', timestamp: new Date().toISOString(), value: 30 }
        ]
      },
      time_range: {
        start: new Date(Date.now() - minutes * 60000).toISOString(),
        end: new Date().toISOString()
      }
    };
  }

  getMockExportData(workspaceId, period) {
    return {
      analytics: [
        { id: '1', module: 'instagram', action: 'post_scheduled', user: 'John Doe', timestamp: new Date().toISOString(), value: 0 },
        { id: '2', module: 'crm', action: 'contact_created', user: 'Jane Smith', timestamp: new Date().toISOString(), value: 150 }
      ],
      total_events: 156,
      total_value: 2340.50,
      date_range: {
        start: this.getStartDate(period),
        end: new Date().toISOString().split('T')[0]
      }
    };
  }

  getMockCustomReport(workspaceId, startDate, endDate) {
    return {
      report: {
        '2024-01-15': 45,
        '2024-01-14': 67,
        '2024-01-13': 34,
        '2024-01-12': 56,
        '2024-01-11': 43
      },
      summary: {
        total_events: 245,
        unique_users: 15,
        total_value: 3450.00,
        date_range: {
          start: startDate,
          end: endDate
        }
      }
    };
  }

  // Helper methods
  generateTimelineData(totalEvents, period) {
    const days = period === '7d' ? 7 : (period === '90d' ? 90 : 30);
    const data = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      
      data[key] = {
        events: Math.floor(Math.random() * (totalEvents / days * 2)),
        value: Math.floor(Math.random() * 1000),
        users: Math.floor(Math.random() * 20)
      };
    }
    
    return data;
  }

  generateMinuteData(minutes) {
    const data = {};
    
    for (let i = 0; i < minutes; i++) {
      const date = new Date();
      date.setMinutes(date.getMinutes() - i);
      const key = date.toISOString().substring(0, 16);
      
      data[key] = Math.floor(Math.random() * 10);
    }
    
    return data;
  }

  getStartDate(period) {
    const date = new Date();
    switch (period) {
      case '7d':
        date.setDate(date.getDate() - 7);
        break;
      case '30d':
        date.setDate(date.getDate() - 30);
        break;
      case '90d':
        date.setDate(date.getDate() - 90);
        break;
      case '1y':
        date.setFullYear(date.getFullYear() - 1);
        break;
      default:
        date.setDate(date.getDate() - 30);
    }
    return date.toISOString().split('T')[0];
  }
}

export default new AnalyticsService();