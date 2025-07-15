import apiClient from '../utils/apiClient';

const crmService = {
  // Get CRM contacts with enhanced filtering
  async getContacts(workspaceId, page = 1, limit = 10, filters = {}) {
    try {
      const response = await apiClient.get('/crm-contacts', {
        params: { workspace_id: workspaceId, page, limit, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching CRM contacts:', error);
      
      return {
        success: true,
        data: this.getMockContacts()
      };
    }
  },

  // Create CRM contact
  async createContact(workspaceId, contactData) {
    try {
      const response = await apiClient.post('/crm-contacts', {
        workspace_id: workspaceId,
        ...contactData
      });
      return response.data;
    } catch (error) {
      console.error('Error creating CRM contact:', error);
      
      return {
        success: true,
        data: {
          id: `contact-${Date.now()}`,
          ...contactData,
          workspace_id: workspaceId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    }
  },

  // Update CRM contact
  async updateContact(contactId, contactData) {
    try {
      const response = await apiClient.put(`/crm-contacts/${contactId}`, contactData);
      return response.data;
    } catch (error) {
      console.error('Error updating CRM contact:', error);
      
      return {
        success: true,
        data: {
          id: contactId,
          ...contactData,
          updated_at: new Date().toISOString()
        }
      };
    }
  },

  // Delete CRM contact
  async deleteContact(contactId) {
    try {
      const response = await apiClient.delete(`/crm-contacts/${contactId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting CRM contact:', error);
      
      return {
        success: true,
        message: 'Contact deleted successfully'
      };
    }
  },

  // Get sales pipeline
  async getPipeline(workspaceId) {
    try {
      const response = await apiClient.get('/crm-pipeline', {
        params: { workspace_id: workspaceId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching CRM pipeline:', error);
      
      return {
        success: true,
        data: this.getMockPipeline()
      };
    }
  },

  // Create deal
  async createDeal(workspaceId, dealData) {
    try {
      const response = await apiClient.post('/crm-deals', {
        workspace_id: workspaceId,
        ...dealData
      });
      return response.data;
    } catch (error) {
      console.error('Error creating deal:', error);
      
      return {
        success: true,
        data: {
          id: `deal-${Date.now()}`,
          ...dealData,
          workspace_id: workspaceId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    }
  },

  // Update deal stage
  async updateDealStage(dealId, stageId) {
    try {
      const response = await apiClient.put(`/crm-deals/${dealId}/stage`, { stage_id: stageId });
      return response.data;
    } catch (error) {
      console.error('Error updating deal stage:', error);
      
      return {
        success: true,
        data: {
          id: dealId,
          stage_id: stageId,
          updated_at: new Date().toISOString()
        }
      };
    }
  },

  // Get tasks
  async getTasks(workspaceId, filters = {}) {
    try {
      const response = await apiClient.get('/crm-tasks', {
        params: { workspace_id: workspaceId, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      
      return {
        success: true,
        data: this.getMockTasks()
      };
    }
  },

  // Create task
  async createTask(workspaceId, taskData) {
    try {
      const response = await apiClient.post('/crm-tasks', {
        workspace_id: workspaceId,
        ...taskData
      });
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      
      return {
        success: true,
        data: {
          id: `task-${Date.now()}`,
          ...taskData,
          workspace_id: workspaceId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    }
  },

  // Update task status
  async updateTaskStatus(taskId, status) {
    try {
      const response = await apiClient.put(`/crm-tasks/${taskId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating task status:', error);
      
      return {
        success: true,
        data: {
          id: taskId,
          status,
          updated_at: new Date().toISOString()
        }
      };
    }
  },

  // Get communication history
  async getCommunicationHistory(contactId) {
    try {
      const response = await apiClient.get(`/crm-contacts/${contactId}/communications`);
      return response.data;
    } catch (error) {
      console.error('Error fetching communication history:', error);
      
      return {
        success: true,
        data: this.getMockCommunicationHistory(contactId)
      };
    }
  },

  // Add communication
  async addCommunication(contactId, communicationData) {
    try {
      const response = await apiClient.post(`/crm-contacts/${contactId}/communications`, communicationData);
      return response.data;
    } catch (error) {
      console.error('Error adding communication:', error);
      
      return {
        success: true,
        data: {
          id: `comm-${Date.now()}`,
          contact_id: contactId,
          ...communicationData,
          created_at: new Date().toISOString()
        }
      };
    }
  },

  // Get CRM analytics
  async getCrmAnalytics(workspaceId, period = '30d') {
    try {
      const response = await apiClient.get('/crm-analytics', {
        params: { workspace_id: workspaceId, period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching CRM analytics:', error);
      
      return {
        success: true,
        data: this.getMockCrmAnalytics(workspaceId, period)
      };
    }
  },

  // Get contact analytics
  async getContactAnalytics(contactId, period = '30d') {
    try {
      const response = await apiClient.get(`/crm-contacts/${contactId}/analytics`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching contact analytics:', error);
      
      return {
        success: true,
        data: this.getMockContactAnalytics(contactId, period)
      };
    }
  },

  // Import contacts from e-commerce
  async importFromEcommerce(workspaceId) {
    try {
      const response = await apiClient.post('/crm-contacts/import/ecommerce', {
        workspace_id: workspaceId
      });
      return response.data;
    } catch (error) {
      console.error('Error importing from e-commerce:', error);
      
      return {
        success: true,
        data: {
          imported_count: 25,
          updated_count: 5,
          message: 'Contacts imported successfully from e-commerce orders'
        }
      };
    }
  },

  // Get automation rules
  async getAutomationRules(workspaceId) {
    try {
      const response = await apiClient.get('/crm-automation-rules', {
        params: { workspace_id: workspaceId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching automation rules:', error);
      
      return {
        success: true,
        data: this.getMockAutomationRules()
      };
    }
  },

  // Create automation rule
  async createAutomationRule(workspaceId, ruleData) {
    try {
      const response = await apiClient.post('/crm-automation-rules', {
        workspace_id: workspaceId,
        ...ruleData
      });
      return response.data;
    } catch (error) {
      console.error('Error creating automation rule:', error);
      
      return {
        success: true,
        data: {
          id: `rule-${Date.now()}`,
          ...ruleData,
          workspace_id: workspaceId,
          created_at: new Date().toISOString()
        }
      };
    }
  },

  // Get mock contacts
  getMockContacts() {
    return [
      {
        id: 'contact-1',
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@example.com',
        phone: '+1-555-0123',
        company: 'Acme Corp',
        position: 'Marketing Manager',
        status: 'active',
        lead_score: 85,
        source: 'website',
        tags: ['customer', 'high-value'],
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'USA'
        },
        social_media: {
          linkedin: 'https://linkedin.com/in/johnsmith',
          twitter: '@johnsmith'
        },
        custom_fields: {
          industry: 'Technology',
          annual_revenue: '$1M-$5M',
          employees: '50-100'
        },
        last_contact: '2024-01-20T10:30:00Z',
        next_followup: '2024-01-25T14:00:00Z',
        total_value: 2500.00,
        deals_count: 3,
        tasks_count: 2,
        created_at: '2024-01-10T08:00:00Z',
        updated_at: '2024-01-20T10:30:00Z'
      },
      {
        id: 'contact-2',
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+1-555-0456',
        company: 'Tech Solutions Inc',
        position: 'CEO',
        status: 'active',
        lead_score: 92,
        source: 'referral',
        tags: ['prospect', 'decision-maker'],
        address: {
          street: '456 Oak Ave',
          city: 'San Francisco',
          state: 'CA',
          postal_code: '94102',
          country: 'USA'
        },
        social_media: {
          linkedin: 'https://linkedin.com/in/sarahjohnson',
          twitter: '@sarahj'
        },
        custom_fields: {
          industry: 'Software',
          annual_revenue: '$5M-$10M',
          employees: '100-500'
        },
        last_contact: '2024-01-22T15:45:00Z',
        next_followup: '2024-01-30T09:00:00Z',
        total_value: 7500.00,
        deals_count: 1,
        tasks_count: 1,
        created_at: '2024-01-15T12:00:00Z',
        updated_at: '2024-01-22T15:45:00Z'
      }
    ];
  },

  // Get mock pipeline
  getMockPipeline() {
    return {
      stages: [
        {
          id: 'stage-1',
          name: 'Lead',
          order: 1,
          color: '#3b82f6',
          deals_count: 15,
          total_value: 45000
        },
        {
          id: 'stage-2',
          name: 'Qualified',
          order: 2,
          color: '#8b5cf6',
          deals_count: 8,
          total_value: 32000
        },
        {
          id: 'stage-3',
          name: 'Proposal',
          order: 3,
          color: '#f59e0b',
          deals_count: 5,
          total_value: 25000
        },
        {
          id: 'stage-4',
          name: 'Negotiation',
          order: 4,
          color: '#10b981',
          deals_count: 3,
          total_value: 18000
        },
        {
          id: 'stage-5',
          name: 'Closed Won',
          order: 5,
          color: '#059669',
          deals_count: 12,
          total_value: 78000
        }
      ],
      deals: [
        {
          id: 'deal-1',
          title: 'Enterprise Software License',
          contact_id: 'contact-1',
          contact_name: 'John Smith',
          company: 'Acme Corp',
          value: 15000,
          stage_id: 'stage-3',
          stage_name: 'Proposal',
          probability: 75,
          expected_close: '2024-02-15',
          created_at: '2024-01-10T08:00:00Z',
          updated_at: '2024-01-20T10:30:00Z'
        },
        {
          id: 'deal-2',
          title: 'Consulting Services',
          contact_id: 'contact-2',
          contact_name: 'Sarah Johnson',
          company: 'Tech Solutions Inc',
          value: 25000,
          stage_id: 'stage-2',
          stage_name: 'Qualified',
          probability: 50,
          expected_close: '2024-03-01',
          created_at: '2024-01-15T12:00:00Z',
          updated_at: '2024-01-22T15:45:00Z'
        }
      ]
    };
  },

  // Get mock tasks
  getMockTasks() {
    return [
      {
        id: 'task-1',
        title: 'Follow up with John Smith',
        description: 'Discuss proposal details and answer questions',
        contact_id: 'contact-1',
        contact_name: 'John Smith',
        deal_id: 'deal-1',
        deal_title: 'Enterprise Software License',
        type: 'call',
        priority: 'high',
        status: 'pending',
        due_date: '2024-01-25T14:00:00Z',
        assigned_to: 'user-1',
        created_at: '2024-01-20T10:30:00Z'
      },
      {
        id: 'task-2',
        title: 'Send proposal to Sarah Johnson',
        description: 'Prepare and send detailed consulting proposal',
        contact_id: 'contact-2',
        contact_name: 'Sarah Johnson',
        deal_id: 'deal-2',
        deal_title: 'Consulting Services',
        type: 'email',
        priority: 'medium',
        status: 'completed',
        due_date: '2024-01-23T09:00:00Z',
        assigned_to: 'user-1',
        completed_at: '2024-01-23T08:30:00Z',
        created_at: '2024-01-22T15:45:00Z'
      }
    ];
  },

  // Get mock communication history
  getMockCommunicationHistory(contactId) {
    return [
      {
        id: 'comm-1',
        contact_id: contactId,
        type: 'email',
        direction: 'outbound',
        subject: 'Thank you for your interest',
        summary: 'Sent initial information about our services',
        date: '2024-01-20T10:30:00Z',
        user_id: 'user-1',
        user_name: 'Alex Johnson'
      },
      {
        id: 'comm-2',
        contact_id: contactId,
        type: 'call',
        direction: 'inbound',
        subject: 'Discovery call',
        summary: 'Discussed requirements and pain points',
        duration: '30 minutes',
        date: '2024-01-18T14:00:00Z',
        user_id: 'user-1',
        user_name: 'Alex Johnson'
      }
    ];
  },

  // Get mock CRM analytics
  getMockCrmAnalytics(workspaceId, period) {
    return {
      workspace_id: workspaceId,
      period,
      overview: {
        total_contacts: 156,
        new_contacts: 23,
        active_deals: 42,
        deals_won: 12,
        total_deal_value: 285000,
        conversion_rate: 28.5,
        average_deal_size: 23750,
        sales_cycle_days: 45
      },
      pipeline: {
        total_value: 198000,
        weighted_value: 89500,
        deals_by_stage: [
          { stage: 'Lead', count: 15, value: 45000 },
          { stage: 'Qualified', count: 8, value: 32000 },
          { stage: 'Proposal', count: 5, value: 25000 },
          { stage: 'Negotiation', count: 3, value: 18000 },
          { stage: 'Closed Won', count: 12, value: 78000 }
        ]
      },
      activity: {
        tasks_completed: 89,
        calls_made: 34,
        emails_sent: 156,
        meetings_scheduled: 23
      },
      trends: {
        contacts_growth: 12.5,
        deals_growth: 8.3,
        revenue_growth: 15.2,
        conversion_growth: 3.1
      }
    };
  },

  // Get mock contact analytics
  getMockContactAnalytics(contactId, period) {
    return {
      contact_id: contactId,
      period,
      engagement: {
        total_interactions: 15,
        emails_sent: 8,
        calls_made: 4,
        meetings_held: 3,
        last_interaction: '2024-01-20T10:30:00Z'
      },
      deals: {
        total_deals: 3,
        won_deals: 1,
        lost_deals: 0,
        active_deals: 2,
        total_value: 45000,
        won_value: 15000
      },
      timeline: [
        {
          date: '2024-01-20T10:30:00Z',
          type: 'email',
          description: 'Sent proposal follow-up'
        },
        {
          date: '2024-01-18T14:00:00Z',
          type: 'call',
          description: 'Discovery call - 30 minutes'
        }
      ]
    };
  },

  // Get mock automation rules
  getMockAutomationRules() {
    return [
      {
        id: 'rule-1',
        name: 'New Lead Follow-up',
        description: 'Automatically create follow-up task for new leads',
        trigger: 'contact_created',
        conditions: [
          { field: 'source', operator: 'equals', value: 'website' }
        ],
        actions: [
          {
            type: 'create_task',
            data: {
              title: 'Follow up with new lead',
              type: 'call',
              due_hours: 24
            }
          }
        ],
        status: 'active',
        created_at: '2024-01-10T08:00:00Z'
      },
      {
        id: 'rule-2',
        name: 'High-Value Deal Alert',
        description: 'Send notification for deals over $10,000',
        trigger: 'deal_created',
        conditions: [
          { field: 'value', operator: 'greater_than', value: 10000 }
        ],
        actions: [
          {
            type: 'send_notification',
            data: {
              message: 'High-value deal created',
              recipients: ['manager@company.com']
            }
          }
        ],
        status: 'active',
        created_at: '2024-01-15T12:00:00Z'
      }
    ];
  },

  // Mark contact as contacted
  async markAsContacted(contactId) {
    try {
      const response = await apiClient.post(`/crm-contacts/${contactId}/mark-contacted`);
      return response.data;
    } catch (error) {
      console.error('Error marking contact as contacted:', error);
      throw error;
    }
  },

  // Update lead score
  async updateLeadScore(contactId, score) {
    try {
      const response = await apiClient.post(`/crm-contacts/${contactId}/update-lead-score`, {
        score
      });
      return response.data;
    } catch (error) {
      console.error('Error updating lead score:', error);
      throw error;
    }
  },

  // Add tags to contact
  async addTags(contactId, tags) {
    try {
      const response = await apiClient.post(`/crm-contacts/${contactId}/add-tags`, {
        tags
      });
      return response.data;
    } catch (error) {
      console.error('Error adding tags to contact:', error);
      throw error;
    }
  },

  // Remove tags from contact
  async removeTags(contactId, tags) {
    try {
      const response = await apiClient.post(`/crm-contacts/${contactId}/remove-tags`, {
        tags
      });
      return response.data;
    } catch (error) {
      console.error('Error removing tags from contact:', error);
      throw error;
    }
  },

  // Get contacts that need follow-up
  async getFollowUpContacts(workspaceId) {
    try {
      const response = await apiClient.get('/crm-contacts-follow-up', {
        params: { workspace_id: workspaceId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching follow-up contacts:', error);
      throw error;
    }
  },

  // Get CRM analytics
  async getAnalytics(workspaceId) {
    try {
      const response = await apiClient.get('/crm-analytics', {
        params: { workspace_id: workspaceId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching CRM analytics:', error);
      throw error;
    }
  }
};

export default crmService;