import axios from 'axios';

class GamificationService {
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

  // Get user's gamification dashboard
  async getDashboard(workspaceId) {
    try {
      const response = await this.api.get('/gamification/dashboard', {
        params: { workspace_id: workspaceId },
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching gamification dashboard:', error);
      return this.getMockDashboard(workspaceId);
    }
  }

  // Get achievements list
  async getAchievements(workspaceId, category = null, type = null) {
    try {
      const params = { workspace_id: workspaceId };
      if (category) params.category = category;
      if (type) params.type = type;
      
      const response = await this.api.get('/gamification/achievements', {
        params,
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return this.getMockAchievements(workspaceId, category, type);
    }
  }

  // Get leaderboard
  async getLeaderboard(workspaceId, period = 'all', limit = 20) {
    try {
      const response = await this.api.get('/gamification/leaderboard', {
        params: { workspace_id: workspaceId, period, limit },
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return this.getMockLeaderboard(workspaceId, period, limit);
    }
  }

  // Get user progress
  async getUserProgress(workspaceId, module = null) {
    try {
      const params = { workspace_id: workspaceId };
      if (module) params.module = module;
      
      const response = await this.api.get('/gamification/progress', {
        params,
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return this.getMockUserProgress(workspaceId, module);
    }
  }

  // Update user progress
  async updateProgress(workspaceId, module, action, increment = 1, targetValue = null, metadata = {}) {
    try {
      const response = await this.api.post('/gamification/progress', {
        workspace_id: workspaceId,
        module,
        action,
        increment,
        target_value: targetValue,
        metadata
      }, {
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating progress:', error);
      return { success: false, error: error.message };
    }
  }

  // Check for new achievements
  async checkAchievements(workspaceId) {
    try {
      const response = await this.api.post('/gamification/check-achievements', {
        workspace_id: workspaceId
      }, {
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return { new_achievements: [], total_new: 0 };
    }
  }

  // Get achievement statistics
  async getAchievementStats(workspaceId) {
    try {
      const response = await this.api.get('/gamification/stats', {
        params: { workspace_id: workspaceId },
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching achievement stats:', error);
      return this.getMockAchievementStats(workspaceId);
    }
  }

  // Initialize default achievements
  async initializeAchievements() {
    try {
      const response = await this.api.post('/gamification/initialize-achievements', {}, {
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error initializing achievements:', error);
      return { success: false, error: error.message };
    }
  }

  // Mock data methods
  getMockDashboard(workspaceId) {
    return {
      achievements: {
        completed: [
          {
            id: '1',
            name: 'First Steps',
            description: 'Complete your first workspace setup',
            icon: '🎯',
            category: 'general',
            points: 10,
            earned_at: '2024-01-15T10:00:00Z'
          },
          {
            id: '2',
            name: 'Social Media Pro',
            description: 'Schedule 100 Instagram posts',
            icon: '📱',
            category: 'instagram',
            points: 50,
            earned_at: '2024-01-14T15:30:00Z'
          }
        ],
        in_progress: [
          {
            id: '3',
            name: 'Template Creator',
            description: 'Create your first template',
            icon: '🎨',
            category: 'templates',
            points: 25,
            progress: 60
          }
        ],
        total_points: 60,
        recent: [
          {
            id: '1',
            name: 'First Steps',
            points: 10,
            earned_at: '2024-01-15T10:00:00Z'
          }
        ]
      },
      progress: {
        by_module: {
          instagram: [
            {
              action: 'post_scheduled',
              current_value: 87,
              target_value: 100,
              progress_percentage: 87,
              streak_count: 5
            }
          ],
          crm: [
            {
              action: 'contact_created',
              current_value: 23,
              target_value: 50,
              progress_percentage: 46,
              streak_count: 0
            }
          ]
        },
        summary: {
          total_activities: 8,
          completed_goals: 2,
          average_progress: 67.5,
          longest_streak: 7,
          last_activity: '2024-01-15T10:30:00Z'
        },
        next_milestones: [
          {
            achievement: {
              id: '3',
              name: 'Template Creator',
              description: 'Create your first template',
              icon: '🎨',
              points: 25
            },
            current_progress: 0,
            target: 1,
            progress_percentage: 0
          }
        ]
      },
      leaderboard: {
        user_rank: 3,
        total_participants: 12,
        user_points: 60
      }
    };
  }

  getMockAchievements(workspaceId, category, type) {
    const achievements = [
      {
        id: '1',
        name: 'First Steps',
        description: 'Complete your first workspace setup',
        icon: '🎯',
        category: 'general',
        type: 'milestone',
        points: 10,
        criteria: { action: 'workspace_setup', count: 1 },
        user_progress: {
          progress: 100,
          is_completed: true,
          earned_at: '2024-01-15T10:00:00Z'
        }
      },
      {
        id: '2',
        name: 'Social Media Pro',
        description: 'Schedule 100 Instagram posts',
        icon: '📱',
        category: 'instagram',
        type: 'milestone',
        points: 50,
        criteria: { action: 'post_scheduled', count: 100 },
        user_progress: {
          progress: 87,
          is_completed: false,
          earned_at: null
        }
      },
      {
        id: '3',
        name: 'Template Creator',
        description: 'Create your first template',
        icon: '🎨',
        category: 'templates',
        type: 'milestone',
        points: 25,
        criteria: { action: 'template_created', count: 1 },
        user_progress: {
          progress: 0,
          is_completed: false,
          earned_at: null
        }
      }
    ];

    let filteredAchievements = achievements;
    
    if (category) {
      filteredAchievements = filteredAchievements.filter(a => a.category === category);
    }
    
    if (type) {
      filteredAchievements = filteredAchievements.filter(a => a.type === type);
    }

    return {
      achievements: filteredAchievements,
      categories: ['general', 'instagram', 'templates', 'ecommerce', 'crm', 'marketing'],
      types: ['milestone', 'streak', 'challenge']
    };
  }

  getMockLeaderboard(workspaceId, period, limit) {
    return {
      leaderboard: [
        {
          rank: 1,
          user: { id: '1', name: 'John Doe', email: 'john@example.com' },
          total_points: 150,
          total_achievements: 8,
          last_achievement: {
            id: '4',
            name: 'Sales Champion',
            earned_at: '2024-01-15T12:00:00Z'
          }
        },
        {
          rank: 2,
          user: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
          total_points: 125,
          total_achievements: 6,
          last_achievement: {
            id: '2',
            name: 'Social Media Pro',
            earned_at: '2024-01-14T15:30:00Z'
          }
        },
        {
          rank: 3,
          user: { id: '3', name: 'Mike Johnson', email: 'mike@example.com' },
          total_points: 90,
          total_achievements: 4,
          last_achievement: {
            id: '1',
            name: 'First Steps',
            earned_at: '2024-01-13T09:15:00Z'
          }
        }
      ],
      user_rank: 2,
      total_participants: 12,
      period
    };
  }

  getMockUserProgress(workspaceId, module) {
    const allProgress = [
      {
        module: 'instagram',
        action: 'post_scheduled',
        current_value: 87,
        target_value: 100,
        progress_percentage: 87,
        streak_count: 5,
        last_activity: '2024-01-15T10:30:00Z'
      },
      {
        module: 'crm',
        action: 'contact_created',
        current_value: 23,
        target_value: 50,
        progress_percentage: 46,
        streak_count: 0,
        last_activity: '2024-01-14T14:20:00Z'
      },
      {
        module: 'marketing',
        action: 'email_sent',
        current_value: 15,
        target_value: 25,
        progress_percentage: 60,
        streak_count: 3,
        last_activity: '2024-01-15T08:45:00Z'
      }
    ];

    const filteredProgress = module ? allProgress.filter(p => p.module === module) : allProgress;

    return {
      progress: filteredProgress,
      summary: {
        total_activities: 8,
        completed_goals: 2,
        average_progress: 67.5,
        longest_streak: 7,
        last_activity: '2024-01-15T10:30:00Z',
        by_module: {
          instagram: {
            activities: 3,
            avg_progress: 78.5,
            completed: 1
          },
          crm: {
            activities: 2,
            avg_progress: 55.0,
            completed: 0
          },
          marketing: {
            activities: 3,
            avg_progress: 65.3,
            completed: 1
          }
        }
      },
      next_targets: [
        {
          module: 'instagram',
          action: 'post_scheduled',
          current: 87,
          target: 100,
          percentage: 87,
          remaining: 13
        },
        {
          module: 'marketing',
          action: 'email_sent',
          current: 15,
          target: 25,
          percentage: 60,
          remaining: 10
        }
      ]
    };
  }

  getMockAchievementStats(workspaceId) {
    return {
      stats: {
        total_achievements: 20,
        completed_achievements: 6,
        in_progress: 8,
        total_points: 180,
        completion_rate: 30.0,
        by_category: {
          general: {
            total: 4,
            completed: 2,
            points: 40,
            completion_rate: 50.0
          },
          instagram: {
            total: 6,
            completed: 2,
            points: 80,
            completion_rate: 33.3
          },
          crm: {
            total: 4,
            completed: 1,
            points: 30,
            completion_rate: 25.0
          },
          marketing: {
            total: 3,
            completed: 1,
            points: 30,
            completion_rate: 33.3
          },
          ecommerce: {
            total: 3,
            completed: 0,
            points: 0,
            completion_rate: 0.0
          }
        },
        recent_achievements: [
          {
            id: '2',
            name: 'Social Media Pro',
            points: 50,
            earned_at: '2024-01-14T15:30:00Z'
          },
          {
            id: '1',
            name: 'First Steps',
            points: 10,
            earned_at: '2024-01-15T10:00:00Z'
          }
        ]
      }
    };
  }
}

export default new GamificationService();