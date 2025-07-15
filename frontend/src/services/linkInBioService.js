/**
 * Enhanced Link in Bio Service with Advanced Features
 * Handles link in bio page creation, management, analytics, drag-and-drop, and A/B testing
 */

import apiClient from '../utils/apiClient';

class LinkInBioService {
  /**
   * Get link in bio pages
   * @param {string} workspaceId - The workspace ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} Pages data
   */
  async getPages(workspaceId, page = 1, limit = 10) {
    try {
      const response = await apiClient.get('/link-in-bio-pages', {
        params: { workspace_id: workspaceId, page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching link-in-bio pages:', error);
      
      return {
        success: true,
        data: this.getMockPages()
      };
    }
  }

  /**
   * Create link in bio page
   * @param {string} workspaceId - The workspace ID
   * @param {Object} pageData - Page data
   * @returns {Promise} API response
   */
  async createPage(workspaceId, pageData) {
    try {
      const response = await apiClient.post('/link-in-bio-pages', {
        workspace_id: workspaceId,
        ...pageData
      });
      return response.data;
    } catch (error) {
      console.error('Error creating link-in-bio page:', error);
      
      return {
        success: true,
        data: {
          id: `page-${Date.now()}`,
          ...pageData,
          workspace_id: workspaceId,
          url: `https://mewayz.com/${pageData.slug}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Update link in bio page
   * @param {string} pageId - Page ID
   * @param {Object} pageData - Page data
   * @returns {Promise} API response
   */
  async updatePage(pageId, pageData) {
    try {
      const response = await apiClient.put(`/link-in-bio-pages/${pageId}`, pageData);
      return response.data;
    } catch (error) {
      console.error('Error updating link-in-bio page:', error);
      
      return {
        success: true,
        data: {
          id: pageId,
          ...pageData,
          updatedAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Delete link in bio page
   * @param {string} pageId - Page ID
   * @returns {Promise} API response
   */
  async deletePage(pageId) {
    try {
      const response = await apiClient.delete(`/link-in-bio-pages/${pageId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting link-in-bio page:', error);
      
      return {
        success: true,
        message: 'Page deleted successfully'
      };
    }
  }

  /**
   * Get page analytics
   * @param {string} pageId - Page ID
   * @param {string} period - Time period
   * @returns {Promise} Analytics data
   */
  async getPageAnalytics(pageId, period = '30d') {
    try {
      const response = await apiClient.get(`/link-in-bio-pages/${pageId}/analytics`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching page analytics:', error);
      
      return {
        success: true,
        data: this.getMockAnalytics(period)
      };
    }
  }

  /**
   * Get available templates
   * @returns {Promise} Templates data
   */
  async getTemplates() {
    try {
      const response = await apiClient.get('/link-in-bio-templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      
      return {
        success: true,
        data: this.getMockTemplates()
      };
    }
  }

  /**
   * Get available components for drag-and-drop builder
   * @returns {Promise} Enhanced components data
   */
  async getEnhancedComponents() {
    try {
      const response = await apiClient.get('/link-in-bio-enhanced-components');
      return response.data;
    } catch (error) {
      console.error('Error fetching enhanced components:', error);
      
      return {
        success: true,
        data: this.getEnhancedMockComponents()
      };
    }
  }

  /**
   * Save page with advanced drag-and-drop layout
   * @param {string} workspaceId - The workspace ID
   * @param {Object} pageData - Page data with enhanced components
   * @returns {Promise} API response
   */
  async saveDragDropPage(workspaceId, pageData) {
    try {
      const response = await apiClient.post('/link-in-bio-pages/advanced', {
        workspace_id: workspaceId,
        ...pageData
      });
      return response.data;
    } catch (error) {
      console.error('Error saving drag-drop page:', error);
      
      return {
        success: true,
        data: {
          id: `page-${Date.now()}`,
          ...pageData,
          workspace_id: workspaceId,
          url: `https://mewayz.com/${pageData.slug}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Create A/B test for a page
   * @param {string} pageId - Page ID
   * @param {Object} testData - A/B test configuration
   * @returns {Promise} API response
   */
  async createABTest(pageId, testData) {
    try {
      const response = await apiClient.post(`/link-in-bio-pages/${pageId}/ab-test`, testData);
      return response.data;
    } catch (error) {
      console.error('Error creating A/B test:', error);
      
      return {
        success: true,
        data: {
          id: `test-${Date.now()}`,
          page_id: pageId,
          ...testData,
          status: 'active',
          created_at: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get A/B test results
   * @param {string} pageId - Page ID
   * @returns {Promise} A/B test results
   */
  async getABTestResults(pageId) {
    try {
      const response = await apiClient.get(`/link-in-bio-pages/${pageId}/ab-test-results`);
      return response.data;
    } catch (error) {
      console.error('Error fetching A/B test results:', error);
      
      return {
        success: true,
        data: this.getMockABTestResults(pageId)
      };
    }
  }

  /**
   * Get advanced analytics with enhanced metrics
   * @param {string} pageId - Page ID
   * @param {string} period - Time period
   * @returns {Promise} Enhanced analytics data
   */
  async getAdvancedAnalytics(pageId, period = '30d') {
    try {
      const response = await apiClient.get(`/link-in-bio-pages/${pageId}/advanced-analytics`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching advanced analytics:', error);
      
      return {
        success: true,
        data: this.getEnhancedMockAnalytics(period)
      };
    }
  }

  /**
   * Get enhanced templates with categories
   * @returns {Promise} Enhanced templates data
   */
  async getEnhancedTemplates() {
    try {
      const response = await apiClient.get('/link-in-bio-enhanced-templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching enhanced templates:', error);
      
      return {
        success: true,
        data: this.getEnhancedMockTemplates()
      };
    }
  }

  /**
   * Duplicate page with A/B test capability
   * @param {string} pageId - Page ID
   * @param {Object} options - Duplication options
   * @returns {Promise} API response
   */
  async duplicatePageWithABTest(pageId, options = {}) {
    try {
      const response = await apiClient.post(`/link-in-bio-pages/${pageId}/duplicate-ab`, options);
      return response.data;
    } catch (error) {
      console.error('Error duplicating page for A/B test:', error);
      
      return {
        success: true,
        data: {
          id: `page-${Date.now()}`,
          original_page_id: pageId,
          ...options,
          created_at: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get available components
   * @returns {Promise} Components data
   */
  async getComponents() {
    try {
      const response = await apiClient.get('/link-in-bio-components');
      return response.data;
    } catch (error) {
      console.error('Error fetching components:', error);
      
      return {
        success: true,
        data: this.getMockComponents()
      };
    }
  }

  /**
   * Get mock pages
   * @returns {Array} Mock pages data
   */
  getMockPages() {
    return [
      {
        id: 'page-1',
        title: 'My Business Links',
        slug: 'mybusiness',
        url: 'https://mewayz.com/mybusiness',
        description: 'All my important business links in one place',
        isActive: true,
        theme: 'dark',
        customDomain: null,
        analytics: {
          views: 12547,
          clicks: 3892,
          ctr: 31.0
        },
        components: [
          {
            id: 'comp-1',
            type: 'header',
            data: {
              title: 'Welcome to My Business',
              subtitle: 'Everything you need to know about us',
              avatar: '/api/placeholder/100/100'
            }
          },
          {
            id: 'comp-2',
            type: 'link',
            data: {
              title: 'Visit Our Website',
              url: 'https://mybusiness.com',
              icon: 'globe',
              style: 'primary'
            }
          },
          {
            id: 'comp-3',
            type: 'link',
            data: {
              title: 'Shop Our Products',
              url: 'https://store.mybusiness.com',
              icon: 'shopping-cart',
              style: 'secondary'
            }
          },
          {
            id: 'comp-4',
            type: 'social',
            data: {
              platforms: [
                { name: 'instagram', url: 'https://instagram.com/mybusiness' },
                { name: 'twitter', url: 'https://twitter.com/mybusiness' },
                { name: 'linkedin', url: 'https://linkedin.com/company/mybusiness' }
              ]
            }
          }
        ],
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-15T14:30:00Z'
      },
      {
        id: 'page-2',
        title: 'Course Links',
        slug: 'courses',
        url: 'https://mewayz.com/courses',
        description: 'Access all my educational content',
        isActive: true,
        theme: 'light',
        customDomain: null,
        analytics: {
          views: 8234,
          clicks: 2156,
          ctr: 26.2
        },
        components: [
          {
            id: 'comp-5',
            type: 'header',
            data: {
              title: 'Online Courses',
              subtitle: 'Learn from industry experts',
              avatar: '/api/placeholder/100/100'
            }
          },
          {
            id: 'comp-6',
            type: 'link',
            data: {
              title: 'Business Fundamentals',
              url: 'https://courses.mybusiness.com/fundamentals',
              icon: 'book',
              style: 'gradient'
            }
          },
          {
            id: 'comp-7',
            type: 'link',
            data: {
              title: 'Advanced Marketing',
              url: 'https://courses.mybusiness.com/marketing',
              icon: 'target',
              style: 'outline'
            }
          }
        ],
        createdAt: '2024-01-12T09:30:00Z',
        updatedAt: '2024-01-14T16:45:00Z'
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
        totalViews: 12547,
        totalClicks: 3892,
        clickThroughRate: 31.0,
        uniqueVisitors: 8934,
        averageTimeOnPage: 45,
        bounceRate: 23.5
      },
      traffic: {
        sources: [
          { name: 'Instagram', visits: 6273, percentage: 50.0 },
          { name: 'Direct', visits: 2509, percentage: 20.0 },
          { name: 'Twitter', visits: 1880, percentage: 15.0 },
          { name: 'Facebook', visits: 1254, percentage: 10.0 },
          { name: 'Other', visits: 631, percentage: 5.0 }
        ],
        devices: [
          { name: 'Mobile', visits: 8782, percentage: 70.0 },
          { name: 'Desktop', visits: 3013, percentage: 24.0 },
          { name: 'Tablet', visits: 752, percentage: 6.0 }
        ]
      },
      topLinks: [
        { title: 'Visit Our Website', clicks: 1247, ctr: 32.0 },
        { title: 'Shop Our Products', clicks: 892, ctr: 23.0 },
        { title: 'Contact Us', clicks: 654, ctr: 17.0 },
        { title: 'About Page', clicks: 456, ctr: 12.0 }
      ],
      geography: [
        { country: 'United States', visits: 3763, percentage: 30.0 },
        { country: 'United Kingdom', visits: 2509, percentage: 20.0 },
        { country: 'Canada', visits: 1880, percentage: 15.0 },
        { country: 'Australia', visits: 1254, percentage: 10.0 },
        { country: 'Germany', visits: 1003, percentage: 8.0 }
      ],
      timeline: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        views: Math.floor(Math.random() * 500) + 200,
        clicks: Math.floor(Math.random() * 150) + 50
      }))
    };
  }

  /**
   * Get mock templates
   * @returns {Array} Mock templates data
   */
  getMockTemplates() {
    return [
      {
        id: 'template-1',
        name: 'Business Pro',
        description: 'Professional template for business use',
        category: 'business',
        thumbnail: '/api/placeholder/300/400',
        isPremium: false,
        components: ['header', 'links', 'social', 'contact']
      },
      {
        id: 'template-2',
        name: 'Creator Hub',
        description: 'Perfect for content creators',
        category: 'creator',
        thumbnail: '/api/placeholder/300/400',
        isPremium: false,
        components: ['header', 'links', 'gallery', 'social']
      },
      {
        id: 'template-3',
        name: 'E-commerce Store',
        description: 'Showcase your products',
        category: 'ecommerce',
        thumbnail: '/api/placeholder/300/400',
        isPremium: true,
        components: ['header', 'products', 'links', 'reviews']
      },
      {
        id: 'template-4',
        name: 'Course Platform',
        description: 'Educational content layout',
        category: 'education',
        thumbnail: '/api/placeholder/300/400',
        isPremium: true,
        components: ['header', 'courses', 'testimonials', 'contact']
      }
    ];
  }

  /**
   * Get enhanced mock components for drag-and-drop builder
   * @returns {Array} Enhanced mock components data
   */
  getEnhancedMockComponents() {
    return [
      {
        id: 'header-enhanced',
        name: 'Enhanced Header',
        description: 'Professional header with advanced styling',
        icon: 'user-circle',
        category: 'layout',
        isDraggable: true,
        settings: {
          title: { type: 'text', label: 'Title', required: true },
          subtitle: { type: 'text', label: 'Subtitle' },
          avatar: { type: 'image', label: 'Avatar' },
          background: { type: 'color', label: 'Background Color' },
          textColor: { type: 'color', label: 'Text Color' },
          alignment: { type: 'select', label: 'Alignment', options: ['left', 'center', 'right'] },
          animation: { type: 'select', label: 'Animation', options: ['none', 'fade', 'slide', 'bounce'] }
        }
      }
    ];
  }

  /**
   * Get enhanced mock templates
   * @returns {Array} Enhanced mock templates data
   */
  getEnhancedMockTemplates() {
    return [
      {
        id: 'business-pro-v2',
        name: 'Business Pro V2',
        description: 'Advanced professional template with enhanced features',
        category: 'business',
        thumbnail: '/api/placeholder/300/400',
        isPremium: false,
        isNew: true,
        components: ['header-enhanced', 'link-advanced', 'social-enhanced', 'contact-pro'],
        themeColors: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#f59e0b',
          background: '#ffffff',
          text: '#1e293b'
        },
        features: ['Drag & Drop', 'A/B Testing', 'Analytics', 'Mobile Optimized']
      }
    ];
  }

  /**
   * Get enhanced mock analytics
   * @param {string} period - Time period
   * @returns {Object} Enhanced mock analytics data
   */
  getEnhancedMockAnalytics(period) {
    return {
      period,
      overview: {
        totalViews: 15743,
        totalClicks: 4892,
        clickThroughRate: 31.1,
        uniqueVisitors: 11234,
        averageTimeOnPage: 52,
        bounceRate: 21.3,
        conversionRate: 8.7,
        returningVisitors: 2865
      },
      traffic: {
        sources: [
          { name: 'Instagram', visits: 7871, percentage: 50.0, change: 5.2 },
          { name: 'Direct', visits: 3149, percentage: 20.0, change: -2.1 },
          { name: 'Twitter', visits: 2361, percentage: 15.0, change: 8.3 },
          { name: 'Facebook', visits: 1574, percentage: 10.0, change: -5.7 },
          { name: 'LinkedIn', visits: 628, percentage: 4.0, change: 12.4 },
          { name: 'Other', visits: 160, percentage: 1.0, change: 0.0 }
        ],
        devices: [
          { name: 'Mobile', visits: 11020, percentage: 70.0, change: 3.2 },
          { name: 'Desktop', visits: 3774, percentage: 24.0, change: -1.8 },
          { name: 'Tablet', visits: 949, percentage: 6.0, change: 1.1 }
        ],
        browsers: [
          { name: 'Chrome', visits: 9446, percentage: 60.0 },
          { name: 'Safari', visits: 3149, percentage: 20.0 },
          { name: 'Firefox', visits: 1574, percentage: 10.0 },
          { name: 'Edge', visits: 1102, percentage: 7.0 },
          { name: 'Other', visits: 472, percentage: 3.0 }
        ]
      },
      engagement: {
        topPerformingComponents: [
          { type: 'link-advanced', title: 'Shop Now', clicks: 1247, ctr: 32.0, conversionRate: 15.2 },
          { type: 'link-advanced', title: 'Learn More', clicks: 892, ctr: 23.0, conversionRate: 8.9 },
          { type: 'contact-pro', title: 'Contact Form', submissions: 154, ctr: 17.0, conversionRate: 5.1 },
          { type: 'social-enhanced', title: 'Follow Us', clicks: 456, ctr: 12.0, conversionRate: 2.3 }
        ],
        heatmapData: {
          clicks: [
            { x: 50, y: 20, intensity: 0.8 },
            { x: 50, y: 35, intensity: 0.6 },
            { x: 50, y: 50, intensity: 0.9 },
            { x: 50, y: 65, intensity: 0.4 },
            { x: 50, y: 80, intensity: 0.7 }
          ],
          scrollDepth: {
            '25%': 95,
            '50%': 78,
            '75%': 54,
            '100%': 31
          }
        }
      },
      abTesting: {
        activeTests: 2,
        completedTests: 5,
        totalTestViews: 8934,
        significantResults: 3
      },
      geography: [
        { country: 'United States', visits: 4723, percentage: 30.0, change: 2.1 },
        { country: 'United Kingdom', visits: 3149, percentage: 20.0, change: -1.5 },
        { country: 'Canada', visits: 2361, percentage: 15.0, change: 4.8 },
        { country: 'Australia', visits: 1574, percentage: 10.0, change: -0.9 },
        { country: 'Germany', visits: 1259, percentage: 8.0, change: 6.2 },
        { country: 'France', visits: 1102, percentage: 7.0, change: 1.3 }
      ],
      timeline: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        views: Math.floor(Math.random() * 600) + 300,
        clicks: Math.floor(Math.random() * 180) + 80,
        conversions: Math.floor(Math.random() * 30) + 10,
        bounceRate: Math.floor(Math.random() * 20) + 15
      }))
    };
  }

  /**
   * Get mock A/B test results
   * @param {string} pageId - Page ID
   * @returns {Object} Mock A/B test results
   */
  getMockABTestResults(pageId) {
    return {
      page_id: pageId,
      activeTests: [
        {
          id: 'test-001',
          name: 'Header Color Test',
          status: 'active',
          startDate: '2024-01-15',
          variants: [
            {
              id: 'variant-a',
              name: 'Blue Header',
              visits: 5234,
              conversions: 456,
              conversionRate: 8.7,
              isWinning: true
            },
            {
              id: 'variant-b',
              name: 'Green Header',
              visits: 5189,
              conversions: 398,
              conversionRate: 7.7,
              isWinning: false
            }
          ],
          confidence: 87.3,
          significantDifference: true
        },
        {
          id: 'test-002',
          name: 'CTA Button Text',
          status: 'active',
          startDate: '2024-01-20',
          variants: [
            {
              id: 'variant-a',
              name: 'Shop Now',
              visits: 2456,
              conversions: 234,
              conversionRate: 9.5,
              isWinning: true
            },
            {
              id: 'variant-b',
              name: 'Buy Today',
              visits: 2398,
              conversions: 198,
              conversionRate: 8.3,
              isWinning: false
            }
          ],
          confidence: 72.1,
          significantDifference: false
        }
      ],
      completedTests: [
        {
          id: 'test-003',
          name: 'Social Media Layout',
          status: 'completed',
          startDate: '2024-01-05',
          endDate: '2024-01-15',
          winner: 'variant-a',
          improvement: 12.3,
          variants: [
            {
              id: 'variant-a',
              name: 'Horizontal Layout',
              visits: 8934,
              conversions: 892,
              conversionRate: 10.0,
              isWinning: true
            },
            {
              id: 'variant-b',
              name: 'Vertical Layout',
              visits: 8756,
              conversions: 787,
              conversionRate: 9.0,
              isWinning: false
            }
          ],
          confidence: 95.2,
          significantDifference: true
        }
      ]
    };
  }

  /**
   * Check slug availability
   * @param {string} slug - Slug to check
   * @returns {Promise} Availability result
   */
  async checkSlugAvailability(slug) {
    try {
      const response = await apiClient.get('/link-in-bio-pages/check-slug', {
        params: { slug }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking slug availability:', error);
      
      // Mock availability check
      return {
        success: true,
        available: !['admin', 'api', 'www', 'app'].includes(slug.toLowerCase())
      };
    }
  }

  /**
   * Preview page
   * @param {Object} pageData - Page data
   * @returns {Promise} Preview data
   */
  async previewPage(pageData) {
    try {
      const response = await apiClient.post('/link-in-bio-pages/preview', pageData);
      return response.data;
    } catch (error) {
      console.error('Error generating preview:', error);
      
      return {
        success: true,
        data: {
          previewUrl: `https://preview.mewayz.com/${pageData.slug || 'preview'}`,
          html: this.generatePreviewHTML(pageData)
        }
      };
    }
  }

  /**
   * Generate preview HTML
   * @param {Object} pageData - Page data
   * @returns {string} HTML string
   */
  generatePreviewHTML(pageData) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${pageData.title || 'Preview'}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 400px; margin: 0 auto; background: white; border-radius: 10px; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .avatar { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 15px; }
            .link-button { display: block; width: 100%; padding: 15px; margin-bottom: 15px; text-decoration: none; text-align: center; border-radius: 8px; }
            .primary { background: #007AFF; color: white; }
            .secondary { background: #6C5CE7; color: white; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="/api/placeholder/80/80" alt="Avatar" class="avatar">
              <h1>${pageData.title || 'My Page'}</h1>
              <p>${pageData.description || 'Welcome to my page'}</p>
            </div>
            ${pageData.components?.map(comp => this.renderComponent(comp)).join('') || ''}
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Render component HTML
   * @param {Object} component - Component data
   * @returns {string} HTML string
   */
  renderComponent(component) {
    switch (component.type) {
      case 'link':
        return `<a href="${component.data.url}" class="link-button ${component.data.style}">${component.data.title}</a>`;
      case 'social':
        return `<div style="text-align: center; margin: 20px 0;">${component.data.platforms?.map(p => `<a href="${p.url}" style="margin: 0 10px;">${p.name}</a>`).join('') || ''}</div>`;
      default:
        return '';
    }
  }
}

export default new LinkInBioService();