import { supabase } from './supabase';

class TeamService {
  // Send team invitations
  async sendInvitations(workspaceId, invitations) {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-team-invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          workspaceId,
          invitations,
          invitedBy: user.user.id
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to send invitations' };
      }

      return { success: true, data: result };
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
        error: 'Failed to send invitations' 
      };
    }
  }

  // Get workspace members
  async getWorkspaceMembers(workspaceId) {
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          *,
          user:user_profiles(*)
        `)
        .eq('workspace_id', workspaceId)
        .eq('is_active', true)
        .order('joined_at', { ascending: false });

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
        error: 'Failed to load team members' 
      };
    }
  }

  // Add workspace member
  async addWorkspaceMember(workspaceId, memberData) {
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceId,
          user_id: memberData.userId,
          role: memberData.role || 'member',
          department: memberData.department,
          position: memberData.position,
          invited_by: memberData.invitedBy
        })
        .select(`
          *,
          user:user_profiles(*)
        `)
        .single();

      if (error) {
        return { success: false, error: error.message };
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
        error: 'Failed to add team member' 
      };
    }
  }

  // Update member role
  async updateMemberRole(workspaceId, userId, role) {
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .update({ role })
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .select(`
          *,
          user:user_profiles(*)
        `)
        .single();

      if (error) {
        return { success: false, error: error.message };
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
        error: 'Failed to update member role' 
      };
    }
  }

  // Remove workspace member
  async removeWorkspaceMember(workspaceId, userId) {
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .update({ is_active: false })
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
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
        error: 'Failed to remove team member' 
      };
    }
  }

  // Validate email address
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Get default departments
  getDefaultDepartments() {
    return [
      'Management',
      'Engineering',
      'Design',
      'Marketing',
      'Sales',
      'Customer Success',
      'Operations',
      'Finance',
      'Human Resources',
      'Product'
    ];
  }

  // Get default roles
  getDefaultRoles() {
    return [
      {
        name: 'Owner',
        value: 'owner',
        permissions: ['all'],
        description: 'Full access to workspace and billing'
      },
      {
        name: 'Admin',
        value: 'admin',
        permissions: ['manage_members', 'manage_settings', 'view_analytics'],
        description: 'Manage team and workspace settings'
      },
      {
        name: 'Manager',
        value: 'manager',
        permissions: ['manage_content', 'view_analytics'],
        description: 'Manage content and view reports'
      },
      {
        name: 'Member',
        value: 'member',
        permissions: ['create_content', 'edit_own_content'],
        description: 'Create and edit own content'
      },
      {
        name: 'Viewer',
        value: 'viewer',
        permissions: ['view_content'],
        description: 'View-only access to workspace'
      }
    ];
  }
}

const teamService = new TeamService();
export default teamService;