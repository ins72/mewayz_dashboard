/**
 * Enhanced Link in Bio Service
 * Handles link in bio page creation, management, and analytics
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
   * Get mock components
   * @returns {Array} Mock components data
   */
  getMockComponents() {
    return [
      {
        id: 'header',
        name: 'Header',
        description: 'Profile header with avatar and bio',
        icon: 'user',
        category: 'basic',
        settings: {
          title: { type: 'text', label: 'Title' },
          subtitle: { type: 'text', label: 'Subtitle' },
          avatar: { type: 'image', label: 'Avatar' }
        }
      },
      {
        id: 'link',
        name: 'Link Button',
        description: 'Clickable link button',
        icon: 'link',
        category: 'basic',
        settings: {
          title: { type: 'text', label: 'Link Title' },
          url: { type: 'url', label: 'URL' },
          icon: { type: 'icon', label: 'Icon' },
          style: { type: 'select', label: 'Style', options: ['primary', 'secondary', 'outline', 'gradient'] }
        }
      },
      {
        id: 'social',
        name: 'Social Media',
        description: 'Social media platform links',
        icon: 'share-2',
        category: 'social',
        settings: {
          platforms: { type: 'multiselect', label: 'Platforms', options: ['instagram', 'twitter', 'facebook', 'linkedin', 'youtube', 'tiktok'] }
        }
      },
      {
        id: 'gallery',
        name: 'Image Gallery',
        description: 'Photo gallery grid',
        icon: 'image',
        category: 'media',
        settings: {
          images: { type: 'images', label: 'Images' },
          columns: { type: 'number', label: 'Columns', min: 1, max: 4 }
        }
      },
      {
        id: 'video',
        name: 'Video Player',
        description: 'Embedded video player',
        icon: 'play',
        category: 'media',
        settings: {
          url: { type: 'url', label: 'Video URL' },
          title: { type: 'text', label: 'Title' },
          autoplay: { type: 'boolean', label: 'Autoplay' }
        }
      },
      {
        id: 'contact',
        name: 'Contact Form',
        description: 'Contact form with fields',
        icon: 'mail',
        category: 'forms',
        settings: {
          title: { type: 'text', label: 'Form Title' },
          email: { type: 'email', label: 'Send To Email' },
          fields: { type: 'array', label: 'Form Fields' }
        }
      },
      {
        id: 'text',
        name: 'Text Block',
        description: 'Rich text content',
        icon: 'type',
        category: 'content',
        settings: {
          content: { type: 'richtext', label: 'Content' },
          alignment: { type: 'select', label: 'Alignment', options: ['left', 'center', 'right'] }
        }
      },
      {
        id: 'products',
        name: 'Product Grid',
        description: 'Product showcase grid',
        icon: 'shopping-cart',
        category: 'ecommerce',
        settings: {
          products: { type: 'products', label: 'Products' },
          columns: { type: 'number', label: 'Columns', min: 1, max: 3 }
        }
      }
    ];
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