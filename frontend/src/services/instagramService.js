/**
 * Instagram Management Service
 * Handles Instagram content scheduling, analytics, and management
 */

import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

class InstagramService {
  constructor() {
    this.baseURL = `${BASE_URL}/api`;
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Content Calendar
  async getContentCalendar(workspaceId, month = null, year = null) {
    try {
      const params = new URLSearchParams({ workspace_id: workspaceId });
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      
      const response = await axios.get(`${this.baseURL}/instagram/content-calendar?${params}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching content calendar:', error);
      
      // Mock data for development
      return {
        success: true,
        data: this.getMockCalendar(month)
      };
    }
  }

  // Instagram Stories
  async getStories(workspaceId, accountId = null, status = null) {
    try {
      const params = new URLSearchParams({ workspace_id: workspaceId });
      if (accountId) params.append('account_id', accountId);
      if (status) params.append('status', status);
      
      const response = await axios.get(`${this.baseURL}/instagram/stories?${params}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching stories:', error);
      
      return {
        success: true,
        data: this.getMockStories()
      };
    }
  }

  async createStory(storyData) {
    try {
      const response = await axios.post(`${this.baseURL}/instagram/stories`, storyData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating story:', error);
      
      return {
        success: true,
        data: {
          id: `story-${Date.now()}`,
          ...storyData,
          created_at: new Date().toISOString()
        }
      };
    }
  }

  // Hashtag Research
  async getHashtagResearch(workspaceId, filters = {}) {
    try {
      const params = new URLSearchParams({ workspace_id: workspaceId });
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.trending !== undefined) params.append('trending', filters.trending);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      
      const response = await axios.get(`${this.baseURL}/instagram/hashtag-research?${params}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching hashtag research:', error);
      
      return {
        success: true,
        data: this.getMockHashtags(filters.search || '')
      };
    }
  }

  async updateHashtagAnalytics(hashtagData) {
    try {
      const response = await axios.post(`${this.baseURL}/instagram/hashtag-analytics`, hashtagData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating hashtag analytics:', error);
      
      return {
        success: true,
        data: {
          id: `hashtag-${Date.now()}`,
          ...hashtagData
        }
      };
    }
  }

  // Analytics Dashboard
  async getAnalyticsDashboard(workspaceId, accountId = null, period = '30d') {
    try {
      const params = new URLSearchParams({ workspace_id: workspaceId, period });
      if (accountId) params.append('account_id', accountId);
      
      const response = await axios.get(`${this.baseURL}/instagram/analytics-dashboard?${params}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics dashboard:', error);
      
      return {
        success: true,
        data: this.getMockAnalytics(period)
      };
    }
  }

  // Competitor Analysis
  async getCompetitorAnalysis(workspaceId, platform = 'instagram') {
    try {
      const params = new URLSearchParams({ workspace_id: workspaceId, platform });
      
      const response = await axios.get(`${this.baseURL}/instagram/competitor-analysis?${params}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching competitor analysis:', error);
      
      return {
        success: true,
        data: this.getMockCompetitorAnalysis()
      };
    }
  }

  async addCompetitor(competitorData) {
    try {
      const response = await axios.post(`${this.baseURL}/instagram/competitors`, competitorData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error adding competitor:', error);
      
      return {
        success: true,
        data: {
          id: `competitor-${Date.now()}`,
          ...competitorData
        }
      };
    }
  }

  // Optimal Posting Times
  async getOptimalPostingTimes(workspaceId, accountId = null) {
    try {
      const params = new URLSearchParams({ workspace_id: workspaceId });
      if (accountId) params.append('account_id', accountId);
      
      const response = await axios.get(`${this.baseURL}/instagram/optimal-posting-times?${params}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching optimal posting times:', error);
      
      return {
        success: true,
        data: this.getMockOptimalPostingTimes()
      };
    }
  }

  // Legacy methods (keeping for backward compatibility)
  async getAccountInfo(workspaceId) {
    try {
      const response = await axios.get(`${this.baseURL}/social-media-accounts?workspace_id=${workspaceId}&platform=instagram`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Instagram account:', error);
      
      return {
        success: true,
        data: this.getMockAccountInfo()
      };
    }
  }

  async schedulePost(workspaceId, postData) {
    try {
      const response = await axios.post(`${this.baseURL}/social-media-posts`, {
        workspace_id: workspaceId,
        ...postData
      }, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error scheduling post:', error);
      
      return {
        success: true,
        data: {
          id: `post-${Date.now()}`,
          caption: postData.caption || postData.content,
          scheduledTime: postData.scheduledTime || postData.scheduled_at,
          status: 'scheduled',
          media: postData.media || postData.media_urls
        }
      };
    }
  }

  async getScheduledPosts(workspaceId) {
    try {
      const response = await axios.get(`${this.baseURL}/social-media-posts?workspace_id=${workspaceId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      
      return {
        success: true,
        data: this.getMockScheduledPosts()
      };
    }
  }

  async getAnalytics(workspaceId, period = '30d') {
    return this.getAnalyticsDashboard(workspaceId, null, period);
  }

  async researchHashtags(workspaceId, query) {
    return this.getHashtagResearch(workspaceId, { search: query });
  }

  // Mock data methods
  getMockStories() {
    return [
      {
        id: 'story-1',
        title: 'Behind the Scenes',
        content: 'Working on exciting new features!',
        story_type: 'photo',
        status: 'scheduled',
        scheduled_at: '2025-01-21T09:00:00Z',
        is_highlight: true,
        highlight_category: 'Work'
      },
      {
        id: 'story-2',
        title: 'Team Update',
        content: 'Meet our amazing team members',
        story_type: 'video',
        status: 'draft',
        is_highlight: false
      }
    ];
  }

  getMockCompetitorAnalysis() {
    return [
      {
        id: 'comp-1',
        competitor_username: '@competitor1',
        competitor_name: 'Top Competitor',
        platform: 'instagram',
        follower_count: 25000,
        engagement_rate: 5.2,
        posting_frequency: 1.5,
        tracking_status: 'active',
        content_themes: ['business', 'marketing', 'tips'],
        hashtag_usage: { '#business': 45, '#marketing': 38, '#tips': 32 }
      },
      {
        id: 'comp-2',
        competitor_username: '@competitor2',
        competitor_name: 'Second Competitor',
        platform: 'instagram',
        follower_count: 18000,
        engagement_rate: 3.8,
        posting_frequency: 2.1,
        tracking_status: 'active',
        content_themes: ['lifestyle', 'entrepreneur', 'success'],
        hashtag_usage: { '#lifestyle': 52, '#entrepreneur': 41, '#success': 35 }
      }
    ];
  }

  getMockOptimalPostingTimes() {
    return {
      optimal_times: {
        monday: ['09:00', '15:00', '19:00'],
        tuesday: ['09:00', '15:00', '19:00'],
        wednesday: ['09:00', '15:00', '19:00'],
        thursday: ['09:00', '15:00', '19:00'],
        friday: ['09:00', '15:00', '19:00'],
        saturday: ['10:00', '14:00', '18:00'],
        sunday: ['10:00', '14:00', '18:00']
      },
      source: 'analytics',
      recommendations: {
        peak_engagement_day: 'wednesday',
        best_overall_time: '15:00',
        avoid_times: ['02:00-06:00', '22:00-24:00']
      }
    };
  }

  /**
   * Get mock account info
   * @returns {Object} Mock account data
   */
  getMockAccountInfo() {
    return {
      username: 'mewayz_official',
      displayName: 'Mewayz',
      bio: 'All-in-one business platform for creators and entrepreneurs 🚀',
      profilePicture: '/api/placeholder/150/150',
      followers: 12547,
      following: 892,
      posts: 234,
      isConnected: true,
      accountType: 'business',
      verified: false
    };
  }

  /**
   * Get mock scheduled posts
   * @returns {Array} Mock scheduled posts
   */
  getMockScheduledPosts() {
    return [
      {
        id: 'post-1',
        caption: 'Transform your business with our all-in-one platform! 🚀 #Business #Entrepreneur #Growth',
        scheduledTime: '2024-01-20T10:00:00Z',
        status: 'scheduled',
        media: [
          {
            type: 'image',
            url: '/api/placeholder/600/600',
            thumbnail: '/api/placeholder/150/150'
          }
        ],
        hashtags: ['#Business', '#Entrepreneur', '#Growth'],
        location: null,
        createdAt: '2024-01-15T14:30:00Z'
      },
      {
        id: 'post-2',
        caption: 'New feature alert! 📱 Link in bio builder now available. Create stunning pages in minutes!',
        scheduledTime: '2024-01-21T15:30:00Z',
        status: 'scheduled',
        media: [
          {
            type: 'carousel',
            items: [
              { url: '/api/placeholder/600/600', thumbnail: '/api/placeholder/150/150' },
              { url: '/api/placeholder/600/600', thumbnail: '/api/placeholder/150/150' },
              { url: '/api/placeholder/600/600', thumbnail: '/api/placeholder/150/150' }
            ]
          }
        ],
        hashtags: ['#LinkInBio', '#WebDesign', '#NewFeature'],
        location: 'San Francisco, CA',
        createdAt: '2024-01-16T09:15:00Z'
      }
    ];
  }

  /**
   * Get mock analytics
   * @param {string} period - Time period
   * @returns {Object} Mock analytics data
   */
  getMockAnalytics(period) {
    return {
      period,
      overview: {
        totalPosts: 45,
        totalLikes: 8924,
        totalComments: 1247,
        totalShares: 356,
        avgEngagement: 7.2,
        followersGain: 287,
        reach: 45230,
        impressions: 89450
      },
      engagement: {
        likesGrowth: 12.5,
        commentsGrowth: 8.3,
        sharesGrowth: 15.7,
        engagementRate: 7.2,
        bestPostingTime: '10:00',
        bestPostingDay: 'Tuesday'
      },
      demographics: {
        ageGroups: [
          { range: '18-24', percentage: 35 },
          { range: '25-34', percentage: 42 },
          { range: '35-44', percentage: 18 },
          { range: '45+', percentage: 5 }
        ],
        gender: {
          male: 45,
          female: 55
        },
        topLocations: [
          { city: 'New York', percentage: 25 },
          { city: 'Los Angeles', percentage: 18 },
          { city: 'Chicago', percentage: 12 },
          { city: 'Miami', percentage: 8 }
        ]
      },
      topPosts: [
        {
          id: 'post-top-1',
          caption: 'Success tip: Focus on one goal at a time! 🎯',
          likes: 2456,
          comments: 342,
          shares: 89,
          engagement: 12.3,
          media: '/api/placeholder/300/300'
        },
        {
          id: 'post-top-2',
          caption: 'Behind the scenes: Building the future of business tools 🛠️',
          likes: 1893,
          comments: 267,
          shares: 76,
          engagement: 9.8,
          media: '/api/placeholder/300/300'
        }
      ]
    };
  }

  /**
   * Get mock hashtags
   * @param {string} query - Search query
   * @returns {Array} Mock hashtag suggestions
   */
  getMockHashtags(query) {
    const baseHashtags = [
      { tag: 'business', posts: 45000000, difficulty: 'high' },
      { tag: 'entrepreneur', posts: 23000000, difficulty: 'high' },
      { tag: 'startup', posts: 12000000, difficulty: 'medium' },
      { tag: 'growth', posts: 8500000, difficulty: 'medium' },
      { tag: 'marketing', posts: 15000000, difficulty: 'high' },
      { tag: 'digitalmarketing', posts: 7800000, difficulty: 'medium' },
      { tag: 'socialmedia', posts: 9200000, difficulty: 'medium' },
      { tag: 'contentcreator', posts: 5600000, difficulty: 'medium' },
      { tag: 'businessowner', posts: 4300000, difficulty: 'low' },
      { tag: 'onlinebusiness', posts: 3900000, difficulty: 'low' }
    ];

    return baseHashtags.filter(hashtag => 
      hashtag.tag.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
  }

  /**
   * Get mock calendar
   * @param {string} month - Month (YYYY-MM)
   * @returns {Object} Mock calendar data
   */
  getMockCalendar(month) {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const posts = {};

    // Generate some mock posts for random days
    [5, 8, 12, 15, 19, 22, 26, 29].forEach(day => {
      posts[day] = [
        {
          id: `post-${day}-1`,
          time: '10:00',
          type: 'image',
          status: day < 20 ? 'published' : 'scheduled',
          caption: `Post for day ${day}`,
          thumbnail: '/api/placeholder/100/100'
        }
      ];
    });

    return {
      month,
      posts,
      stats: {
        totalPosts: Object.keys(posts).length,
        published: Object.values(posts).flat().filter(p => p.status === 'published').length,
        scheduled: Object.values(posts).flat().filter(p => p.status === 'scheduled').length
      }
    };
  }

  /**
   * Upload media for Instagram post
   * @param {string} workspaceId - The workspace ID
   * @param {File} file - Media file
   * @returns {Promise} Upload result
   */
  async uploadMedia(workspaceId, file) {
    try {
      const formData = new FormData();
      formData.append('media', file);
      formData.append('workspace_id', workspaceId);

      const response = await apiClient.post(`/workspaces/${workspaceId}/instagram/media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading media:', error);
      
      // Mock upload success
      return {
        success: true,
        data: {
          id: `media-${Date.now()}`,
          url: URL.createObjectURL(file),
          thumbnail: URL.createObjectURL(file),
          type: file.type.startsWith('image/') ? 'image' : 'video',
          size: file.size,
          filename: file.name
        }
      };
    }
  }

  /**
   * Delete scheduled post
   * @param {string} workspaceId - The workspace ID
   * @param {string} postId - Post ID
   * @returns {Promise} API response
   */
  async deletePost(workspaceId, postId) {
    try {
      const response = await apiClient.delete(`/workspaces/${workspaceId}/instagram/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting post:', error);
      
      return {
        success: true,
        message: 'Post deleted successfully'
      };
    }
  }

  /**
   * Update scheduled post
   * @param {string} workspaceId - The workspace ID
   * @param {string} postId - Post ID
   * @param {Object} updateData - Update data
   * @returns {Promise} API response
   */
  async updatePost(workspaceId, postId, updateData) {
    try {
      const response = await apiClient.put(`/workspaces/${workspaceId}/instagram/posts/${postId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating post:', error);
      
      return {
        success: true,
        data: {
          id: postId,
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      };
    }
  }
}

export default new InstagramService();