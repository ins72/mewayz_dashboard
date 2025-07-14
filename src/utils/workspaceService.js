import { supabase } from './supabase';

class WorkspaceService {
  // Get all industries for workspace setup
  async getIndustries() {
    try {
      const { data, error } = await supabase
        .from('industries')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

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
        error: 'Failed to load industries' 
      };
    }
  }

  // Get all goals for goal selection
  async getGoals() {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

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
        error: 'Failed to load goals' 
      };
    }
  }

  // Check if workspace slug is available
  async checkSlugAvailability(slug) {
    try {
      const { data, error } = await supabase
        .rpc('is_workspace_slug_available', { slug_to_check: slug });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data };
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
        error: 'Failed to check slug availability' 
      };
    }
  }

  // Generate workspace slug from name
  async generateSlug(workspaceName) {
    try {
      const { data, error } = await supabase
        .rpc('generate_workspace_slug', { workspace_name: workspaceName });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data };
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
        error: 'Failed to generate slug' 
      };
    }
  }

  // Create a new workspace
  async createWorkspace(workspaceData) {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('workspaces')
        .insert([{
          name: workspaceData.name,
          slug: workspaceData.slug,
          description: workspaceData.description,
          industry: workspaceData.industry,
          team_size: workspaceData.teamSize,
          primary_goal: workspaceData.primaryGoal,
          owner_id: user.user.id,
          wizard_step: 1,
          wizard_data: workspaceData.wizardData || {}
        }])
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
        error: 'Failed to create workspace' 
      };
    }
  }

  // Update workspace wizard progress
  async updateWizardProgress(workspaceId, stepData) {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .update({
          wizard_step: stepData.currentStep,
          wizard_data: stepData.formData,
          wizard_completed: stepData.currentStep === 6 && stepData.isCompleted
        })
        .eq('id', workspaceId)
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
        error: 'Failed to update wizard progress' 
      };
    }
  }

  // Save workspace goal priorities
  async saveGoalPriorities(workspaceId, goalPriorities) {
    try {
      // First, delete existing priorities for this workspace
      await supabase
        .from('workspace_goal_priorities')
        .delete()
        .eq('workspace_id', workspaceId);

      // Insert new priorities
      const prioritiesToInsert = goalPriorities.map(goal => ({
        workspace_id: workspaceId,
        goal_id: goal.goalId,
        priority_level: goal.priority,
        setup_now: goal.setupNow
      }));

      const { data, error } = await supabase
        .from('workspace_goal_priorities')
        .insert(prioritiesToInsert)
        .select();

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
        error: 'Failed to save goal priorities' 
      };
    }
  }

  // Get workspace by slug
  async getWorkspaceBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select(`
          *,
          owner:user_profiles(*)
        `)
        .eq('slug', slug)
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
        error: 'Failed to load workspace' 
      };
    }
  }

  // Get user's workspaces
  async getUserWorkspaces(userId) {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select(`
          *,
          workspace_members(role, is_active)
        `)
        .or(`owner_id.eq.${userId},workspace_members.user_id.eq.${userId}`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

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
        error: 'Failed to load workspaces' 
      };
    }
  }

  // Get features by goal
  async getFeaturesByGoal(goalId) {
    try {
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .eq('goal_id', goalId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

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
        error: 'Failed to load features' 
      };
    }
  }

  // Get all features
  async getAllFeatures() {
    try {
      const { data, error } = await supabase
        .from('features')
        .select(`
          *,
          goal:goals(id, name, slug, icon_name, icon_color, category)
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

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
        error: 'Failed to load features' 
      };
    }
  }

  // Save workspace feature selections
  async saveFeatureSelections(workspaceId, featureSelections) {
    try {
      // First, delete existing feature selections for this workspace
      await supabase
        .from('workspace_features')
        .delete()
        .eq('workspace_id', workspaceId);

      // Insert new feature selections
      const selectionsToInsert = featureSelections
        .filter(selection => selection.isEnabled)
        .map(selection => ({
          workspace_id: workspaceId,
          feature_id: selection.featureId,
          is_enabled: selection.isEnabled,
          configuration: {
            priority: selection.priority || 'medium'
          }
        }));

      if (selectionsToInsert.length > 0) {
        const { data, error } = await supabase
          .from('workspace_features')
          .insert(selectionsToInsert)
          .select();

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true, data };
      }

      return { success: true, data: [] };
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
        error: 'Failed to save feature selections' 
      };
    }
  }

  // Get workspace feature selections
  async getWorkspaceFeatures(workspaceId) {
    try {
      const { data, error } = await supabase
        .from('workspace_features')
        .select(`
          *,
          feature:features(*)
        `)
        .eq('workspace_id', workspaceId)
        .eq('is_enabled', true);

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
        error: 'Failed to load workspace features' 
      };
    }
  }
}

const workspaceService = new WorkspaceService();
export default workspaceService;