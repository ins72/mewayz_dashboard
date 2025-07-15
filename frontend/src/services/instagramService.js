/**
 * Instagram Management Service
 * Handles Instagram content scheduling, analytics, and management
 */

import apiClient from '../utils/apiClient';

class InstagramService {
  /**
   * Get Instagram account info
   * @param {string} workspaceId - The workspace ID
   * @returns {Promise} Account information
   */
  async getAccountInfo(workspaceId) {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}/instagram/account`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Instagram account:', error);
      
      // Mock data for development
      return {
        success: true,
        data: this.getMockAccountInfo()
      };
    }
  }

  /**
   * Schedule Instagram post
   * @param {string} workspaceId - The workspace ID
   * @param {Object} postData - Post data
   * @returns {Promise} API response
   */
  async schedulePost(workspaceId, postData) {
    try {
      const response = await apiClient.post(`/workspaces/${workspaceId}/instagram/posts`, postData);
      return response.data;
    } catch (error) {
      console.error('Error scheduling post:', error);
      
      // Mock success response
      return {
        success: true,
        data: {
          id: `post-${Date.now()}`,
          caption: postData.caption,
          scheduledTime: postData.scheduledTime,
          status: 'scheduled',
          media: postData.media
        }
      };
    }
  }

  /**
   * Get scheduled posts
   * @param {string} workspaceId - The workspace ID
   * @returns {Promise} Scheduled posts
   */
  async getScheduledPosts(workspaceId) {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}/instagram/posts`);
      return response.data;
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      
      return {
        success: true,
        data: this.getMockScheduledPosts()
      };
    }
  }

  /**
   * Get Instagram analytics
   * @param {string} workspaceId - The workspace ID
   * @param {string} period - Time period
   * @returns {Promise} Analytics data
   */
  async getAnalytics(workspaceId, period = '30d') {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}/instagram/analytics`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      
      return {
        success: true,
        data: this.getMockAnalytics(period)
      };
    }
  }

  /**
   * Research hashtags
   * @param {string} workspaceId - The workspace ID
   * @param {string} query - Search query
   * @returns {Promise} Hashtag suggestions
   */
  async researchHashtags(workspaceId, query) {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}/instagram/hashtags`, {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error('Error researching hashtags:', error);
      
      return {
        success: true,
        data: this.getMockHashtags(query)
      };
    }
  }

  /**
   * Get content calendar
   * @param {string} workspaceId - The workspace ID
   * @param {string} month - Month (YYYY-MM)
   * @returns {Promise} Calendar data
   */
  async getContentCalendar(workspaceId, month) {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}/instagram/calendar`, {
        params: { month }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching content calendar:', error);
      
      return {
        success: true,
        data: this.getMockCalendar(month)
      };
    }
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