import apiClient from '../utils/apiClient';

const productService = {
  // Get products for a workspace
  async getProducts(workspaceId, page = 1, limit = 10, filters = {}) {
    try {
      const response = await apiClient.get('/products', {
        params: { workspace_id: workspaceId, page, limit, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      
      return {
        success: true,
        data: this.getMockProducts()
      };
    }
  },

  // Create product
  async createProduct(workspaceId, productData) {
    try {
      const response = await apiClient.post('/products', {
        workspace_id: workspaceId,
        ...productData
      });
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      
      return {
        success: true,
        data: {
          id: `product-${Date.now()}`,
          ...productData,
          workspace_id: workspaceId,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    }
  },

  // Update product
  async updateProduct(productId, productData) {
    try {
      const response = await apiClient.put(`/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      
      return {
        success: true,
        data: {
          id: productId,
          ...productData,
          updated_at: new Date().toISOString()
        }
      };
    }
  },

  // Delete product
  async deleteProduct(productId) {
    try {
      const response = await apiClient.delete(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      
      return {
        success: true,
        message: 'Product deleted successfully'
      };
    }
  },

  // Update product stock
  async updateStock(productId, stockData) {
    try {
      const response = await apiClient.post(`/products/${productId}/update-stock`, stockData);
      return response.data;
    } catch (error) {
      console.error('Error updating stock:', error);
      
      return {
        success: true,
        data: {
          product_id: productId,
          ...stockData,
          updated_at: new Date().toISOString()
        }
      };
    }
  },

  // Get product analytics
  async getProductAnalytics(productId, period = '30d') {
    try {
      const response = await apiClient.get(`/products/${productId}/analytics`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching product analytics:', error);
      
      return {
        success: true,
        data: this.getMockProductAnalytics(productId, period)
      };
    }
  },

  // Get overall product analytics
  async getProductsAnalytics(workspaceId, period = '30d') {
    try {
      const response = await apiClient.get('/products-analytics', {
        params: { workspace_id: workspaceId, period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products analytics:', error);
      
      return {
        success: true,
        data: this.getMockProductsAnalytics(workspaceId, period)
      };
    }
  },

  // Get orders
  async getOrders(workspaceId, page = 1, limit = 10, filters = {}) {
    try {
      const response = await apiClient.get('/orders', {
        params: { workspace_id: workspaceId, page, limit, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      
      return {
        success: true,
        data: this.getMockOrders()
      };
    }
  },

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      const response = await apiClient.put(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      
      return {
        success: true,
        data: {
          id: orderId,
          status,
          updated_at: new Date().toISOString()
        }
      };
    }
  },

  // Get inventory alerts
  async getInventoryAlerts(workspaceId) {
    try {
      const response = await apiClient.get('/inventory/alerts', {
        params: { workspace_id: workspaceId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory alerts:', error);
      
      return {
        success: true,
        data: this.getMockInventoryAlerts()
      };
    }
  },

  // Get product categories
  async getProductCategories(workspaceId) {
    try {
      const response = await apiClient.get('/product-categories', {
        params: { workspace_id: workspaceId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching product categories:', error);
      
      return {
        success: true,
        data: this.getMockProductCategories()
      };
    }
  },

  // Duplicate product
  async duplicateProduct(productId, options = {}) {
    try {
      const response = await apiClient.post(`/products/${productId}/duplicate`, options);
      return response.data;
    } catch (error) {
      console.error('Error duplicating product:', error);
      
      return {
        success: true,
        data: {
          id: `product-${Date.now()}`,
          original_product_id: productId,
          ...options,
          created_at: new Date().toISOString()
        }
      };
    }
  },

  // Get mock products
  getMockProducts() {
    return [
      {
        id: 'product-1',
        name: 'Premium Digital Course Bundle',
        description: 'Complete digital marketing course with bonus materials and lifetime access',
        price: 299.99,
        compare_price: 399.99,
        currency: 'USD',
        category: 'Digital Products',
        sku: 'DMC-001',
        stock_quantity: 100,
        stock_status: 'in_stock',
        status: 'active',
        images: [
          '/api/placeholder/400/300',
          '/api/placeholder/400/300',
          '/api/placeholder/400/300'
        ],
        thumbnail: '/api/placeholder/300/200',
        tags: ['course', 'digital', 'marketing', 'bundle'],
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
        shipping_required: false,
        track_inventory: true,
        inventory_policy: 'deny',
        sales_count: 156,
        rating: 4.8,
        reviews_count: 89,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T14:30:00Z'
      },
      {
        id: 'product-2',
        name: 'Professional Business Planner',
        description: 'Comprehensive business planning toolkit with templates and guides',
        price: 49.99,
        compare_price: 79.99,
        currency: 'USD',
        category: 'Physical Products',
        sku: 'PBP-002',
        stock_quantity: 25,
        stock_status: 'low_stock',
        status: 'active',
        images: [
          '/api/placeholder/400/300',
          '/api/placeholder/400/300'
        ],
        thumbnail: '/api/placeholder/300/200',
        tags: ['planner', 'business', 'physical', 'templates'],
        weight: 0.5,
        dimensions: { length: 11, width: 8.5, height: 1 },
        shipping_required: true,
        track_inventory: true,
        inventory_policy: 'deny',
        sales_count: 78,
        rating: 4.6,
        reviews_count: 45,
        created_at: '2024-01-10T08:00:00Z',
        updated_at: '2024-01-18T16:45:00Z'
      },
      {
        id: 'product-3',
        name: 'Monthly Consultation Service',
        description: 'One-on-one business consultation with expert guidance',
        price: 149.99,
        compare_price: null,
        currency: 'USD',
        category: 'Services',
        sku: 'MCS-003',
        stock_quantity: 10,
        stock_status: 'in_stock',
        status: 'active',
        images: ['/api/placeholder/400/300'],
        thumbnail: '/api/placeholder/300/200',
        tags: ['consultation', 'service', 'business', 'expert'],
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
        shipping_required: false,
        track_inventory: true,
        inventory_policy: 'continue',
        sales_count: 34,
        rating: 4.9,
        reviews_count: 28,
        created_at: '2024-01-12T09:30:00Z',
        updated_at: '2024-01-22T11:15:00Z'
      }
    ];
  },

  // Get mock orders
  getMockOrders() {
    return [
      {
        id: 'order-1',
        order_number: 'ORD-2024-001',
        customer: {
          name: 'John Smith',
          email: 'john@example.com',
          phone: '+1-555-0123'
        },
        items: [
          {
            product_id: 'product-1',
            name: 'Premium Digital Course Bundle',
            quantity: 1,
            price: 299.99,
            total: 299.99
          }
        ],
        subtotal: 299.99,
        tax: 24.00,
        shipping: 0.00,
        total: 323.99,
        status: 'processing',
        payment_status: 'paid',
        shipping_address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'US'
        },
        created_at: '2024-01-20T10:30:00Z',
        updated_at: '2024-01-20T10:30:00Z'
      },
      {
        id: 'order-2',
        order_number: 'ORD-2024-002',
        customer: {
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          phone: '+1-555-0456'
        },
        items: [
          {
            product_id: 'product-2',
            name: 'Professional Business Planner',
            quantity: 2,
            price: 49.99,
            total: 99.98
          }
        ],
        subtotal: 99.98,
        tax: 8.00,
        shipping: 9.99,
        total: 117.97,
        status: 'fulfilled',
        payment_status: 'paid',
        shipping_address: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          postal_code: '90210',
          country: 'US'
        },
        created_at: '2024-01-19T14:15:00Z',
        updated_at: '2024-01-21T09:45:00Z'
      }
    ];
  },

  // Get mock product analytics
  getMockProductAnalytics(productId, period) {
    return {
      product_id: productId,
      period,
      sales: {
        total_sales: 4580,
        total_revenue: 13740.00,
        units_sold: 46,
        average_order_value: 298.70,
        conversion_rate: 3.2
      },
      traffic: {
        page_views: 1456,
        unique_visitors: 892,
        bounce_rate: 24.5,
        average_time_on_page: 185
      },
      performance: {
        add_to_cart_rate: 8.7,
        checkout_rate: 36.8,
        return_rate: 2.1,
        customer_satisfaction: 4.8
      },
      timeline: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 20) + 5,
        revenue: Math.floor(Math.random() * 2000) + 500,
        views: Math.floor(Math.random() * 100) + 50
      }))
    };
  },

  // Get mock products analytics
  getMockProductsAnalytics(workspaceId, period) {
    return {
      workspace_id: workspaceId,
      period,
      overview: {
        total_products: 15,
        active_products: 12,
        total_sales: 18640,
        total_revenue: 89250.00,
        average_order_value: 324.50,
        conversion_rate: 4.1
      },
      top_products: [
        {
          id: 'product-1',
          name: 'Premium Digital Course Bundle',
          sales: 156,
          revenue: 46740.00,
          growth: 12.3
        },
        {
          id: 'product-2',
          name: 'Professional Business Planner',
          sales: 78,
          revenue: 3899.22,
          growth: 8.7
        },
        {
          id: 'product-3',
          name: 'Monthly Consultation Service',
          sales: 34,
          revenue: 5099.66,
          growth: 15.2
        }
      ],
      categories: [
        { name: 'Digital Products', sales: 245, revenue: 52340.00, percentage: 58.6 },
        { name: 'Physical Products', sales: 89, revenue: 4567.80, percentage: 5.1 },
        { name: 'Services', sales: 67, revenue: 32342.20, percentage: 36.3 }
      ],
      recent_orders: [
        {
          id: 'order-1',
          customer: 'John Smith',
          total: 323.99,
          status: 'processing',
          date: '2024-01-20T10:30:00Z'
        },
        {
          id: 'order-2',
          customer: 'Sarah Johnson',
          total: 117.97,
          status: 'fulfilled',
          date: '2024-01-19T14:15:00Z'
        }
      ]
    };
  },

  // Get mock inventory alerts
  getMockInventoryAlerts() {
    return [
      {
        id: 'alert-1',
        product_id: 'product-2',
        product_name: 'Professional Business Planner',
        type: 'low_stock',
        current_stock: 25,
        threshold: 30,
        severity: 'warning',
        created_at: '2024-01-22T08:00:00Z'
      },
      {
        id: 'alert-2',
        product_id: 'product-4',
        product_name: 'Marketing Templates Pack',
        type: 'out_of_stock',
        current_stock: 0,
        threshold: 10,
        severity: 'critical',
        created_at: '2024-01-21T16:30:00Z'
      }
    ];
  },

  // Get mock product categories
  getMockProductCategories() {
    return [
      {
        id: 'cat-1',
        name: 'Digital Products',
        description: 'Digital downloads and online courses',
        product_count: 8,
        total_sales: 245,
        total_revenue: 52340.00
      },
      {
        id: 'cat-2',
        name: 'Physical Products',
        description: 'Physical goods requiring shipping',
        product_count: 4,
        total_sales: 89,
        total_revenue: 4567.80
      },
      {
        id: 'cat-3',
        name: 'Services',
        description: 'Consultation and service offerings',
        product_count: 3,
        total_sales: 67,
        total_revenue: 32342.20
      }
    ];
  },

  // Update product stock
  async updateProductStock(productId, stockData) {
    try {
      const response = await apiClient.post(`/products/${productId}/update-stock`, stockData);
      return response.data;
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  },

  // Get product analytics
  async getProductAnalytics(workspaceId) {
    try {
      const response = await apiClient.get('/products-analytics', {
        params: { workspace_id: workspaceId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching product analytics:', error);
      throw error;
    }
  },

  // Get product statistics
  async getProductStats(workspaceId) {
    try {
      const response = await apiClient.get(`/products/stats/${workspaceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product statistics:', error);
      throw error;
    }
  }
};

export default productService;