import axios from 'axios';

class TeamManagementService {
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

  // Get team dashboard
  async getDashboard(workspaceId) {
    try {
      const response = await this.api.get('/team/dashboard', {
        params: { workspace_id: workspaceId },
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching team dashboard:', error);
      return this.getMockDashboard(workspaceId);
    }
  }

  // Get team members
  async getTeamMembers(workspaceId, status = null, roleId = null) {
    try {
      const params = { workspace_id: workspaceId };
      if (status) params.status = status;
      if (roleId) params.role_id = roleId;
      
      const response = await this.api.get('/team/members', {
        params,
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching team members:', error);
      return this.getMockTeamMembers(workspaceId);
    }
  }

  // Invite team member
  async inviteTeamMember(workspaceId, email, roleId, message = '') {
    try {
      const response = await this.api.post('/team/invite', {
        workspace_id: workspaceId,
        email,
        role_id: roleId,
        message
      }, {
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error inviting team member:', error);
      return { success: false, error: error.message };
    }
  }

  // Update member role
  async updateMemberRole(workspaceId, memberId, roleId) {
    try {
      const response = await this.api.put(`/team/members/${memberId}/role`, {
        workspace_id: workspaceId,
        role_id: roleId
      }, {
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating member role:', error);
      return { success: false, error: error.message };
    }
  }

  // Remove team member
  async removeMember(workspaceId, memberId) {
    try {
      const response = await this.api.delete(`/team/members/${memberId}`, {
        params: { workspace_id: workspaceId },
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error removing team member:', error);
      return { success: false, error: error.message };
    }
  }

  // Get team roles
  async getTeamRoles(workspaceId) {
    try {
      const response = await this.api.get('/team/roles', {
        params: { workspace_id: workspaceId },
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching team roles:', error);
      return this.getMockTeamRoles(workspaceId);
    }
  }

  // Create team role
  async createTeamRole(workspaceId, name, description, permissions) {
    try {
      const response = await this.api.post('/team/roles', {
        workspace_id: workspaceId,
        name,
        description,
        permissions
      }, {
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating team role:', error);
      return { success: false, error: error.message };
    }
  }

  // Get team activities
  async getTeamActivities(workspaceId, limit = 50, days = 7, module = null, userId = null) {
    try {
      const params = { workspace_id: workspaceId, limit, days };
      if (module) params.module = module;
      if (userId) params.user_id = userId;
      
      const response = await this.api.get('/team/activities', {
        params,
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching team activities:', error);
      return this.getMockTeamActivities(workspaceId);
    }
  }

  // Get team notifications
  async getTeamNotifications(workspaceId, limit = 20, unreadOnly = false, type = null) {
    try {
      const params = { workspace_id: workspaceId, limit, unread_only: unreadOnly };
      if (type) params.type = type;
      
      const response = await this.api.get('/team/notifications', {
        params,
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching team notifications:', error);
      return this.getMockTeamNotifications(workspaceId);
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const response = await this.api.put(`/team/notifications/${notificationId}/read`, {}, {
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  // Mock data methods
  getMockDashboard(workspaceId) {
    return {
      team_overview: {
        total_members: 12,
        active_members: 10,
        pending_invites: 2,
        roles_count: 5
      },
      team_members: [
        {
          id: '1',
          user: { id: '1', name: 'John Doe', email: 'john@example.com' },
          role: { id: '1', name: 'Owner', description: 'Full access to all features' },
          status: 'active',
          joined_at: '2024-01-10T10:00:00Z',
          last_activity: '2024-01-15T14:30:00Z'
        },
        {
          id: '2',
          user: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
          role: { id: '2', name: 'Administrator', description: 'Administrative access' },
          status: 'active',
          joined_at: '2024-01-12T11:00:00Z',
          last_activity: '2024-01-15T13:15:00Z'
        }
      ],
      recent_activities: [
        {
          id: '1',
          user: { name: 'John Doe' },
          activity_type: 'team_management',
          action: 'invite',
          description: 'Invited jane@example.com to join the workspace',
          created_at: '2024-01-15T10:00:00Z'
        }
      ],
      notifications: [
        {
          id: '1',
          type: 'team_invite',
          title: 'New Team Member',
          message: 'Jane Smith has joined the workspace',
          created_at: '2024-01-15T10:00:00Z',
          is_read: false
        }
      ],
      tasks: {
        total: 15,
        pending: 8,
        in_progress: 4,
        completed: 3,
        overdue: 2
      },
      roles: [
        {
          id: '1',
          name: 'Owner',
          description: 'Full access to all features',
          is_system: true,
          permissions: { workspace: ['read', 'write', 'delete', 'manage_users'] }
        },
        {
          id: '2',
          name: 'Administrator',
          description: 'Administrative access',
          is_system: true,
          permissions: { workspace: ['read', 'write', 'manage_users'] }
        }
      ]
    };
  }

  getMockTeamMembers(workspaceId) {
    return {
      team_members: [
        {
          id: '1',
          user: { id: '1', name: 'John Doe', email: 'john@example.com' },
          role: { id: '1', name: 'Owner', description: 'Full access to all features' },
          status: 'active',
          joined_at: '2024-01-10T10:00:00Z',
          last_activity: '2024-01-15T14:30:00Z',
          permissions: { workspace: ['read', 'write', 'delete', 'manage_users'] }
        },
        {
          id: '2',
          user: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
          role: { id: '2', name: 'Administrator', description: 'Administrative access' },
          status: 'active',
          joined_at: '2024-01-12T11:00:00Z',
          last_activity: '2024-01-15T13:15:00Z',
          permissions: { workspace: ['read', 'write', 'manage_users'] }
        },
        {
          id: '3',
          user: { id: '3', name: 'Mike Johnson', email: 'mike@example.com' },
          role: { id: '3', name: 'Editor', description: 'Content creation and editing' },
          status: 'active',
          joined_at: '2024-01-13T09:00:00Z',
          last_activity: '2024-01-15T12:00:00Z',
          permissions: { workspace: ['read', 'write'] }
        }
      ],
      total_count: 3
    };
  }

  getMockTeamRoles(workspaceId) {
    return {
      roles: [
        {
          id: '1',
          name: 'Owner',
          description: 'Full access to all features',
          is_system: true,
          is_default: true,
          permissions: {
            workspace: ['read', 'write', 'delete', 'manage_users', 'manage_billing'],
            instagram: ['read', 'write', 'delete', 'manage'],
            crm: ['read', 'write', 'delete', 'manage']
          }
        },
        {
          id: '2',
          name: 'Administrator',
          description: 'Administrative access with user management',
          is_system: true,
          permissions: {
            workspace: ['read', 'write', 'manage_users'],
            instagram: ['read', 'write', 'delete'],
            crm: ['read', 'write', 'delete']
          }
        },
        {
          id: '3',
          name: 'Editor',
          description: 'Content creation and editing',
          is_system: true,
          permissions: {
            workspace: ['read'],
            instagram: ['read', 'write'],
            crm: ['read', 'write']
          }
        }
      ],
      total_count: 3
    };
  }

  getMockTeamActivities(workspaceId) {
    return {
      activities: [
        {
          id: '1',
          user: { name: 'John Doe' },
          activity_type: 'team_management',
          module: 'team',
          action: 'invite',
          description: 'Invited jane@example.com to join the workspace',
          created_at: '2024-01-15T10:00:00Z',
          visibility: 'public'
        },
        {
          id: '2',
          user: { name: 'Jane Smith' },
          activity_type: 'content_creation',
          module: 'instagram',
          action: 'create',
          description: 'Created a new Instagram post',
          created_at: '2024-01-15T09:30:00Z',
          visibility: 'public'
        },
        {
          id: '3',
          user: { name: 'Mike Johnson' },
          activity_type: 'data_management',
          module: 'crm',
          action: 'update',
          description: 'Updated contact information',
          created_at: '2024-01-15T08:45:00Z',
          visibility: 'public'
        }
      ],
      total_count: 3
    };
  }

  getMockTeamNotifications(workspaceId) {
    return {
      notifications: [
        {
          id: '1',
          type: 'team_invite',
          title: 'New Team Member',
          message: 'Jane Smith has joined the workspace',
          sender: { name: 'John Doe' },
          created_at: '2024-01-15T10:00:00Z',
          is_read: false,
          priority: 'normal'
        },
        {
          id: '2',
          type: 'achievement',
          title: 'Achievement Unlocked',
          message: 'You earned the "Social Media Pro" achievement!',
          created_at: '2024-01-14T15:30:00Z',
          is_read: true,
          priority: 'low'
        },
        {
          id: '3',
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: 'You have been assigned a new task: Review marketing campaign',
          sender: { name: 'Jane Smith' },
          created_at: '2024-01-14T14:00:00Z',
          is_read: false,
          priority: 'high'
        }
      ],
      counts: {
        total: 3,
        unread: 2,
        high_priority: 1
      },
      total_count: 3
    };
  }
}

export default new TeamManagementService();