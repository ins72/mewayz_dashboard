import apiClient from './apiClient';

class InvitationService {
  // Create and send single invitation
  async createInvitation(workspaceId, invitationData) {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase.rpc('create_invitation', {
        workspace_uuid: workspaceId,
        invitation_email: invitationData.email,
        invitation_role: invitationData.role || 'member',
        invitation_department: invitationData.department || null,
        invitation_position: invitationData.position || null,
        personal_msg: invitationData.personalMessage || null,
        expiry_days: invitationData.expiryDays || 7
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Send email invitation
      const emailResult = await this.sendInvitationEmail(data, invitationData);
      
      return { 
        success: true, 
        data: { 
          invitationId: data,
          emailSent: emailResult.success 
        } 
      };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Cannot connect to invitation service. Please check your internet connection and try again.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to create invitation' 
      };
    }
  }

  // Send bulk invitations
  async createBulkInvitations(workspaceId, invitations, batchName = 'Bulk Import') {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      // Create batch record
      const { data: batch, error: batchError } = await supabase
        .from('invitation_batches')
        .insert({
          workspace_id: workspaceId,
          created_by: user.user.id,
          name: batchName,
          total_invitations: invitations.length,
          batch_data: { invitations }
        })
        .select()
        .single();

      if (batchError) {
        return { success: false, error: batchError.message };
      }

      // Process invitations
      const results = [];
      let successful = 0;
      let failed = 0;

      for (const invitation of invitations) {
        try {
          const result = await this.createInvitation(workspaceId, invitation);
          results.push({ ...invitation, ...result });
          
          if (result.success) {
            successful++;
          } else {
            failed++;
          }
        } catch (error) {
          results.push({ ...invitation, success: false, error: error.message });
          failed++;
        }
      }

      // Update batch with results
      await supabase
        .from('invitation_batches')
        .update({
          successful_invitations: successful,
          failed_invitations: failed,
          status: failed === 0 ? 'completed' : 'completed_with_errors',
          completed_at: new Date().toISOString()
        })
        .eq('id', batch.id);

      return { 
        success: true, 
        data: { 
          batchId: batch.id,
          results,
          summary: { total: invitations.length, successful, failed }
        } 
      };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Cannot connect to invitation service. Please check your internet connection and try again.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to create bulk invitations' 
      };
    }
  }

  // Get workspace invitations
  async getWorkspaceInvitations(workspaceId, filters = {}) {
    try {
      let query = supabase
        .from('invitations')
        .select(`
          *,
          inviter:user_profiles!invitations_invited_by_fkey(id, full_name, email, avatar_url),
          workspace:workspaces(id, name)
        `)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.role) {
        query = query.eq('role', filters.role);
      }

      if (filters.department) {
        query = query.eq('department', filters.department);
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to load invitations' 
      };
    }
  }

  // Get invitation by token
  async getInvitationByToken(token) {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          workspace:workspaces(id, name, description, branding),
          inviter:user_profiles!invitations_invited_by_fkey(id, full_name, email, avatar_url)
        `)
        .eq('token', token)
        .eq('status', 'pending')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Check if invitation is expired
      if (new Date(data.expires_at) < new Date()) {
        return { success: false, error: 'Invitation has expired' };
      }

      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to load invitation details' 
      };
    }
  }

  // Accept invitation
  async acceptInvitation(token) {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user?.id) {
        return { success: false, error: 'User must be authenticated to accept invitation' };
      }

      const { data, error } = await supabase.rpc('accept_invitation', {
        invitation_token: token
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Cannot connect to invitation service. Please check your internet connection and try again.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to accept invitation' 
      };
    }
  }

  // Decline invitation
  async declineInvitation(token, reason = '') {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .update({
          status: 'declined',
          declined_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('token', token)
        .eq('status', 'pending')
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Log analytics
      await this.trackInvitationEvent(data.id, 'declined', { reason });

      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Cannot connect to invitation service. Please check your internet connection and try again.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to decline invitation' 
      };
    }
  }

  // Resend invitation
  async resendInvitation(invitationId) {
    try {
      const { data: invitation, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Generate new token and extend expiry
      const newToken = this.generateToken();
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 7);

      const { data: updated, error: updateError } = await supabase
        .from('invitations')
        .update({
          token: newToken,
          expires_at: newExpiry.toISOString(),
          reminders_sent: invitation.reminders_sent + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId)
        .select()
        .single();

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // Send email
      const emailResult = await this.sendInvitationEmail(invitationId, {
        email: updated.email,
        personalMessage: `Reminder: ${updated.personal_message || 'You have been invited to join our workspace!'}`
      });

      return { 
        success: true, 
        data: { 
          ...updated,
          emailSent: emailResult.success 
        } 
      };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Cannot connect to invitation service. Please check your internet connection and try again.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to resend invitation' 
      };
    }
  }

  // Cancel invitation
  async cancelInvitation(invitationId) {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Log analytics
      await this.trackInvitationEvent(invitationId, 'cancelled');

      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Cannot connect to invitation service. Please check your internet connection and try again.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to cancel invitation' 
      };
    }
  }

  // Get invitation analytics
  async getInvitationAnalytics(workspaceId, filters = {}) {
    try {
      // Get basic stats
      const { data: stats, error: statsError } = await supabase
        .from('invitations')
        .select('status, role, department, created_at')
        .eq('workspace_id', workspaceId);

      if (statsError) {
        return { success: false, error: statsError.message };
      }

      // Calculate metrics
      const total = stats.length;
      const accepted = stats.filter(i => i.status === 'accepted').length;
      const pending = stats.filter(i => i.status === 'pending').length;
      const expired = stats.filter(i => i.status === 'expired').length;
      const declined = stats.filter(i => i.status === 'declined').length;
      const acceptanceRate = total > 0 ? (accepted / total * 100).toFixed(1) : 0;

      // Role distribution
      const roleStats = stats.reduce((acc, inv) => {
        acc[inv.role] = (acc[inv.role] || 0) + 1;
        return acc;
      }, {});

      // Department distribution
      const departmentStats = stats.reduce((acc, inv) => {
        if (inv.department) {
          acc[inv.department] = (acc[inv.department] || 0) + 1;
        }
        return acc;
      }, {});

      return {
        success: true,
        data: {
          overview: {
            total,
            accepted,
            pending,
            expired,
            declined,
            acceptanceRate: parseFloat(acceptanceRate)
          },
          distribution: {
            roles: roleStats,
            departments: departmentStats
          }
        }
      };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to load invitation analytics' 
      };
    }
  }

  // Send invitation email via Edge Function
  async sendInvitationEmail(invitationId, invitationData) {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-team-invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.session?.access_token}`
        },
        body: JSON.stringify({
          invitationId,
          email: invitationData.email,
          personalMessage: invitationData.personalMessage,
          template: invitationData.template || 'professional'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to send email' };
      }

      // Log analytics
      await this.trackInvitationEvent(invitationId, 'sent', { 
        email_provider: 'resend',
        template: invitationData.template || 'professional'
      });

      return { success: true, data: result };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Cannot connect to email service. Please check your internet connection and try again.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to send invitation email' 
      };
    }
  }

  // Track invitation events for analytics
  async trackInvitationEvent(invitationId, eventType, eventData = {}) {
    try {
      const { error } = await supabase
        .from('invitation_analytics')
        .insert({
          invitation_id: invitationId,
          event_type: eventType,
          event_data: eventData,
          occurred_at: new Date().toISOString()
        });

      if (error) {
        console.log('Failed to track invitation event:', error.message);
      }

      return { success: !error };
    } catch (error) {
      console.log('Failed to track invitation event:', error.message);
      return { success: false };
    }
  }

  // Generate secure token
  generateToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  // Validate email
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Parse CSV data for bulk import
  parseCsvData(csvText) {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        return { success: false, error: 'CSV must contain at least a header and one data row' };
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredHeaders = ['email'];
      const optionalHeaders = ['role', 'department', 'position', 'message'];

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
          if (values[index]) {
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
}

const invitationService = new InvitationService();
export default invitationService;