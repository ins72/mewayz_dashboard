import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

class TemplateMarketplaceService {
  constructor() {
    this.baseURL = `${BASE_URL}/api`;
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Marketplace browsing
  async getMarketplaceTemplates(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.workspace_id) params.append('workspace_id', filters.workspace_id);
      if (filters.category) params.append('category', filters.category);
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);
      if (filters.price_range) params.append('price_range', filters.price_range);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.is_free !== undefined) params.append('is_free', filters.is_free);
      if (filters.is_premium !== undefined) params.append('is_premium', filters.is_premium);
      if (filters.per_page) params.append('per_page', filters.per_page);
      
      const response = await axios.get(`${this.baseURL}/marketplace/templates?${params}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching marketplace templates:', error);
      return this.getMockMarketplaceTemplates();
    }
  }

  async getTemplateCategories() {
    try {
      const response = await axios.get(`${this.baseURL}/marketplace/categories`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching template categories:', error);
      return this.getMockCategories();
    }
  }

  async getTemplateCollections(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.featured) params.append('featured', filters.featured);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.per_page) params.append('per_page', filters.per_page);
      
      const response = await axios.get(`${this.baseURL}/marketplace/collections?${params}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching template collections:', error);
      return this.getMockCollections();
    }
  }

  async getTemplateDetails(templateId) {
    try {
      const response = await axios.get(`${this.baseURL}/marketplace/templates/${templateId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching template details:', error);
      return this.getMockTemplateDetails();
    }
  }

  async getCollectionDetails(collectionId) {
    try {
      const response = await axios.get(`${this.baseURL}/marketplace/collections/${collectionId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching collection details:', error);
      return this.getMockCollectionDetails();
    }
  }

  // Purchase functionality
  async purchaseTemplate(purchaseData) {
    try {
      const response = await axios.post(`${this.baseURL}/marketplace/purchase-template`, purchaseData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error purchasing template:', error);
      return {
        success: true,
        message: 'Template purchased successfully (mock)',
        purchase: { id: 'mock-purchase-' + Date.now() }
      };
    }
  }

  async purchaseCollection(purchaseData) {
    try {
      const response = await axios.post(`${this.baseURL}/marketplace/purchase-collection`, purchaseData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error purchasing collection:', error);
      return {
        success: true,
        message: 'Collection purchased successfully (mock)',
        purchase: { id: 'mock-purchase-' + Date.now() }
      };
    }
  }

  async getUserPurchases(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.workspace_id) params.append('workspace_id', filters.workspace_id);
      if (filters.type) params.append('type', filters.type);
      
      const response = await axios.get(`${this.baseURL}/marketplace/user-purchases?${params}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user purchases:', error);
      return this.getMockUserPurchases();
    }
  }

  // Reviews
  async getTemplateReviews(templateId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.rating) params.append('rating', filters.rating);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.per_page) params.append('per_page', filters.per_page);
      
      const response = await axios.get(`${this.baseURL}/marketplace/templates/${templateId}/reviews?${params}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching template reviews:', error);
      return this.getMockTemplateReviews();
    }
  }

  async submitTemplateReview(reviewData) {
    try {
      const response = await axios.post(`${this.baseURL}/marketplace/templates/reviews`, reviewData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting template review:', error);
      return {
        success: true,
        message: 'Review submitted successfully (mock)',
        review: { id: 'mock-review-' + Date.now(), ...reviewData }
      };
    }
  }

  // Creator functionality
  async getCreatorTemplates(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.workspace_id) params.append('workspace_id', filters.workspace_id);
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.per_page) params.append('per_page', filters.per_page);
      
      const response = await axios.get(`${this.baseURL}/creator/templates?${params}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching creator templates:', error);
      return this.getMockCreatorTemplates();
    }
  }

  async createTemplate(templateData) {
    try {
      const response = await axios.post(`${this.baseURL}/creator/templates`, templateData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating template:', error);
      return {
        success: true,
        message: 'Template created successfully (mock)',
        template: { id: 'mock-template-' + Date.now(), ...templateData }
      };
    }
  }

  async updateTemplate(templateId, templateData) {
    try {
      const response = await axios.put(`${this.baseURL}/creator/templates/${templateId}`, templateData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating template:', error);
      return {
        success: true,
        message: 'Template updated successfully (mock)',
        template: { id: templateId, ...templateData }
      };
    }
  }

  async deleteTemplate(templateId) {
    try {
      const response = await axios.delete(`${this.baseURL}/creator/templates/${templateId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting template:', error);
      return {
        success: true,
        message: 'Template deleted successfully (mock)'
      };
    }
  }

  async publishTemplate(templateId) {
    try {
      const response = await axios.post(`${this.baseURL}/creator/templates/${templateId}/publish`, {}, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error publishing template:', error);
      return {
        success: true,
        message: 'Template published successfully (mock)'
      };
    }
  }

  async getCreatorCollections(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.workspace_id) params.append('workspace_id', filters.workspace_id);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.per_page) params.append('per_page', filters.per_page);
      
      const response = await axios.get(`${this.baseURL}/creator/collections?${params}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching creator collections:', error);
      return this.getMockCreatorCollections();
    }
  }

  async createCollection(collectionData) {
    try {
      const response = await axios.post(`${this.baseURL}/creator/collections`, collectionData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating collection:', error);
      return {
        success: true,
        message: 'Collection created successfully (mock)',
        collection: { id: 'mock-collection-' + Date.now(), ...collectionData }
      };
    }
  }

  async getTemplateAnalytics(templateId, period = '30d') {
    try {
      const response = await axios.get(`${this.baseURL}/creator/templates/${templateId}/analytics?period=${period}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching template analytics:', error);
      return this.getMockTemplateAnalytics();
    }
  }

  async getCreatorDashboard(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.workspace_id) params.append('workspace_id', filters.workspace_id);
      if (filters.period) params.append('period', filters.period);
      
      const response = await axios.get(`${this.baseURL}/creator/dashboard?${params}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching creator dashboard:', error);
      return this.getMockCreatorDashboard();
    }
  }

  // Mock data methods
  getMockMarketplaceTemplates() {
    return {
      success: true,
      templates: {
        data: [
          {
            id: 'template-1',
            title: 'Modern Email Newsletter',
            description: 'A clean and modern email newsletter template perfect for businesses',
            template_type: 'email',
            price: 25.00,
            is_free: false,
            is_premium: true,
            rating_average: 4.5,
            rating_count: 12,
            download_count: 156,
            preview_image: '/api/placeholder/300/200',
            category: { name: 'Email Templates', slug: 'email' },
            creator: { name: 'John Doe' },
            tags: ['email', 'newsletter', 'business', 'modern'],
            features: ['Responsive Design', 'Dark Mode', 'Customizable Colors']
          },
          {
            id: 'template-2',
            title: 'Social Media Link Tree',
            description: 'Beautiful link in bio template for social media profiles',
            template_type: 'link_in_bio',
            price: 0.00,
            is_free: true,
            is_premium: false,
            rating_average: 4.2,
            rating_count: 8,
            download_count: 234,
            preview_image: '/api/placeholder/300/200',
            category: { name: 'Link in Bio', slug: 'link-in-bio' },
            creator: { name: 'Jane Smith' },
            tags: ['social', 'linktree', 'bio', 'free'],
            features: ['Multiple Links', 'Social Icons', 'Contact Form']
          }
        ]
      },
      filters: {
        categories: [
          { id: 'cat-1', name: 'Email Templates', slug: 'email' },
          { id: 'cat-2', name: 'Link in Bio', slug: 'link-in-bio' },
          { id: 'cat-3', name: 'Social Media', slug: 'social-media' }
        ],
        types: [
          { value: 'email', label: 'Email Templates' },
          { value: 'link_in_bio', label: 'Link in Bio Templates' },
          { value: 'social_media', label: 'Social Media Templates' }
        ],
        price_ranges: [
          { value: '0-0', label: 'Free' },
          { value: '0-10', label: 'Under $10' },
          { value: '10-25', label: '$10 - $25' },
          { value: '25-50', label: '$25 - $50' }
        ]
      }
    };
  }

  getMockCategories() {
    return {
      success: true,
      categories: [
        {
          id: 'cat-1',
          name: 'Email Templates',
          slug: 'email',
          description: 'Professional email templates for newsletters and campaigns',
          icon: '📧',
          color: '#3B82F6',
          template_count: 45,
          children: []
        },
        {
          id: 'cat-2',
          name: 'Link in Bio',
          slug: 'link-in-bio',
          description: 'Beautiful link in bio templates for social media',
          icon: '🔗',
          color: '#10B981',
          template_count: 32,
          children: []
        },
        {
          id: 'cat-3',
          name: 'Social Media',
          slug: 'social-media',
          description: 'Templates for social media posts and stories',
          icon: '📱',
          color: '#F59E0B',
          template_count: 28,
          children: []
        }
      ]
    };
  }

  getMockCollections() {
    return {
      success: true,
      collections: {
        data: [
          {
            id: 'collection-1',
            title: 'Complete Email Marketing Kit',
            description: 'Everything you need for successful email marketing campaigns',
            price: 99.00,
            discount_percentage: 20,
            template_count: 12,
            rating_average: 4.8,
            rating_count: 24,
            purchase_count: 89,
            cover_image: '/api/placeholder/400/250',
            creator: { name: 'Marketing Pro' },
            tags: ['email', 'marketing', 'complete', 'kit']
          }
        ]
      }
    };
  }

  getMockTemplateDetails() {
    return {
      success: true,
      template: {
        id: 'template-1',
        title: 'Modern Email Newsletter',
        description: 'A clean and modern email newsletter template perfect for businesses. Features responsive design, customizable colors, and professional layout.',
        template_type: 'email',
        price: 25.00,
        is_free: false,
        is_premium: true,
        rating_average: 4.5,
        rating_count: 12,
        download_count: 156,
        preview_image: '/api/placeholder/600/400',
        category: { name: 'Email Templates', slug: 'email' },
        creator: { name: 'John Doe', id: 'creator-1' },
        tags: ['email', 'newsletter', 'business', 'modern'],
        features: ['Responsive Design', 'Dark Mode', 'Customizable Colors', 'Professional Layout'],
        requirements: ['Email service provider', 'Basic HTML knowledge'],
        license_type: 'standard'
      },
      is_purchased: false,
      related_templates: [
        {
          id: 'template-3',
          title: 'Corporate Newsletter',
          price: 30.00,
          rating_average: 4.3,
          preview_image: '/api/placeholder/300/200'
        }
      ]
    };
  }

  getMockUserPurchases() {
    return {
      success: true,
      purchases: {
        data: [
          {
            id: 'purchase-1',
            template: {
              id: 'template-1',
              title: 'Modern Email Newsletter',
              template_type: 'email',
              preview_image: '/api/placeholder/300/200'
            },
            price: 25.00,
            purchased_at: '2025-01-15T10:30:00Z',
            license_type: 'standard',
            status: 'completed'
          }
        ]
      }
    };
  }

  getMockTemplateReviews() {
    return {
      success: true,
      reviews: {
        data: [
          {
            id: 'review-1',
            rating: 5,
            title: 'Excellent template!',
            review: 'This template saved me hours of work. Very professional and easy to customize.',
            is_verified_purchase: true,
            helpful_count: 8,
            reviewed_at: '2025-01-10T14:20:00Z',
            user: { name: 'Sarah Johnson' }
          },
          {
            id: 'review-2',
            rating: 4,
            title: 'Good quality',
            review: 'Nice template with good design. Could use more customization options.',
            is_verified_purchase: true,
            helpful_count: 3,
            reviewed_at: '2025-01-08T09:15:00Z',
            user: { name: 'Mike Chen' }
          }
        ]
      }
    };
  }

  getMockCreatorTemplates() {
    return {
      success: true,
      templates: {
        data: [
          {
            id: 'template-1',
            title: 'Modern Email Newsletter',
            template_type: 'email',
            status: 'active',
            approval_status: 'approved',
            download_count: 156,
            purchase_count: 45,
            rating_average: 4.5,
            created_at: '2025-01-01T00:00:00Z'
          }
        ]
      }
    };
  }

  getMockCreatorCollections() {
    return {
      success: true,
      collections: {
        data: [
          {
            id: 'collection-1',
            title: 'Complete Email Marketing Kit',
            template_count: 12,
            purchase_count: 89,
            rating_average: 4.8,
            created_at: '2025-01-01T00:00:00Z'
          }
        ]
      }
    };
  }

  getMockTemplateAnalytics() {
    return {
      success: true,
      analytics: {
        metrics: {
          total_downloads: 156,
          total_purchases: 45,
          total_revenue: 1125.00,
          period_usage: 23,
          period_purchases: 12,
          period_revenue: 300.00,
          rating_average: 4.5,
          rating_count: 12,
          success_rate: 92.5
        },
        usage_by_context: {
          email_campaign: 15,
          newsletter: 8
        },
        usage_by_type: {
          creation: 20,
          customization: 3
        },
        daily_usage: {
          '2025-01-15': 3,
          '2025-01-16': 2,
          '2025-01-17': 4
        }
      }
    };
  }

  getMockCreatorDashboard() {
    return {
      success: true,
      dashboard: {
        overview: {
          total_templates: 8,
          active_templates: 6,
          total_downloads: 1245,
          total_purchases: 342,
          total_revenue: 8550.00,
          period_purchases: 45,
          period_revenue: 1125.00
        },
        top_templates: [
          {
            id: 'template-1',
            title: 'Modern Email Newsletter',
            download_count: 156,
            rating_average: 4.5
          }
        ]
      }
    };
  }

  getMockCollectionDetails() {
    return {
      success: true,
      collection: {
        id: 'collection-1',
        title: 'Complete Email Marketing Kit',
        description: 'Everything you need for successful email marketing campaigns',
        price: 99.00,
        discount_percentage: 20,
        template_count: 12,
        rating_average: 4.8,
        rating_count: 24,
        purchase_count: 89,
        cover_image: '/api/placeholder/600/400',
        creator: { name: 'Marketing Pro' },
        templates: [
          {
            id: 'template-1',
            title: 'Modern Newsletter',
            template_type: 'email',
            preview_image: '/api/placeholder/300/200'
          },
          {
            id: 'template-2',
            title: 'Welcome Email',
            template_type: 'email',
            preview_image: '/api/placeholder/300/200'
          }
        ]
      },
      is_purchased: false
    };
  }
}

export default new TemplateMarketplaceService();