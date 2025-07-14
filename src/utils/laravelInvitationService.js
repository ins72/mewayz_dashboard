import apiClient from './apiClient';

class LaravelInvitationService {
  // Create and send single invitation
  async createInvitation(workspaceId, invitationData) {
    try {
      const response = await apiClient.post(`/api/workspaces/${workspaceId}/invitations`, {
        email: invitationData.email,
        role: invitationData.role || 'member',
        department: invitationData.department || null,
        position: invitationData.position || null,
        personal_message: invitationData.personalMessage || null,
        expires_in_days: invitationData.expiryDays || 7
      });

      return {
        success: true,
        data: {
          invitationId: response.data.data.invitation.id,
          emailSent: response.data.data.email_sent
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create invitation'
      };
    }
  }

  // Send bulk invitations
  async createBulkInvitations(workspaceId, invitations, batchName = 'Bulk Import') {
    try {
      const response = await apiClient.post(`/api/workspaces/${workspaceId}/invitations/bulk`, {
        batch_name: batchName,
        invitations: invitations.map(inv => ({
          email: inv.email,
          role: inv.role || 'member',
          department: inv.department || null,
          position: inv.position || null,
          personal_message: inv.personalMessage || null
        }))
      });

      return {
        success: true,
        data: {
          batchId: response.data.data.batch_id,
          results: response.data.data.results,
          summary: response.data.data.summary
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create bulk invitations'
      };
    }
  }

  // Get workspace invitations
  async getWorkspaceInvitations(workspaceId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.role) params.append('role', filters.role);
      if (filters.department) params.append('department', filters.department);

      const response = await apiClient.get(`/api/workspaces/${workspaceId}/invitations?${params}`);
      
      return {
        success: true,
        data: response.data.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load invitations'
      };
    }
  }

  // Get invitation by token
  async getInvitationByToken(token) {
    try {
      const response = await apiClient.get(`/api/invitations/${token}`);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load invitation details'
      };
    }
  }

  // Accept invitation
  async acceptInvitation(token) {
    try {
      const response = await apiClient.post(`/api/invitations/${token}/accept`);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to accept invitation'
      };
    }
  }

  // Decline invitation
  async declineInvitation(token, reason = '') {
    try {
      const response = await apiClient.post(`/api/invitations/${token}/decline`, {
        reason: reason
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to decline invitation'
      };
    }
  }

  // Resend invitation
  async resendInvitation(invitationId) {
    try {
      const response = await apiClient.post(`/api/invitations/${invitationId}/resend`);
      
      return {
        success: true,
        data: {
          invitation: response.data.data.invitation,
          emailSent: response.data.data.email_sent
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to resend invitation'
      };
    }
  }

  // Cancel invitation
  async cancelInvitation(invitationId) {
    try {
      const response = await apiClient.delete(`/api/invitations/${invitationId}`);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel invitation'
      };
    }
  }

  // Get invitation analytics
  async getInvitationAnalytics(workspaceId, filters = {}) {
    try {
      const response = await apiClient.get(`/api/workspaces/${workspaceId}/invitations/analytics`);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load invitation analytics'
      };
    }
  }

  // Parse CSV data for bulk import
  parseCsvData(csvText) {
    try {
      const lines = csvText.trim().split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        return {
          success: false,
          error: 'CSV must contain at least a header and one data row'
        };
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredHeaders = ['email'];
      const optionalHeaders = ['role', 'department', 'position', 'personal_message'];

      // Validate required headers
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        return {
          success: false,
          error: `Missing required headers: ${missingHeaders.join(', ')}`
        };
      }

      // Parse data rows
      const invitations = [];
      const errors = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const invitation = {};

        headers.forEach((header, index) => {
          if (values[index] && values[index] !== '') {
            invitation[header] = values[index];
          }
        });

        // Validate email
        if (!this.validateEmail(invitation.email)) {
          errors.push(`Row ${i + 1}: Invalid email format`);
          continue;
        }

        // Set defaults
        invitation.role = invitation.role || 'member';
        
        invitations.push(invitation);
      }

      return {
        success: true,
        data: {
          invitations,
          errors,
          summary: {
            total: lines.length - 1,
            valid: invitations.length,
            invalid: errors.length
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse CSV data. Please check the format.'
      };
    }
  }

  // Validate email
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Generate invitation URL
  generateInvitationUrl(token) {
    return `${window.location.origin}/accept-invitation/${token}`;
  }

  // Helper method to get role display name
  getRoleDisplayName(role) {
    const roleNames = {
      owner: 'Owner',
      admin: 'Administrator',
      editor: 'Editor',
      contributor: 'Contributor',
      viewer: 'Viewer',
      guest: 'Guest',
      member: 'Member'
    };
    return roleNames[role] || 'Member';
  }

  // Helper method to get status display name
  getStatusDisplayName(status) {
    const statusNames = {
      pending: 'Pending',
      accepted: 'Accepted',
      declined: 'Declined',
      expired: 'Expired',
      cancelled: 'Cancelled'
    };
    return statusNames[status] || 'Unknown';
  }

  // Helper method to get status color
  getStatusColor(status) {
    const statusColors = {
      pending: 'yellow',
      accepted: 'green',
      declined: 'red',
      expired: 'gray',
      cancelled: 'gray'
    };
    return statusColors[status] || 'gray';
  }
}

const laravelInvitationService = new LaravelInvitationService();
export default laravelInvitationService;