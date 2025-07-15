import apiClient from '../utils/apiClient';

const productService = {
  // Get products for a workspace
  async getProducts(workspaceId, page = 1, limit = 10) {
    try {
      const response = await apiClient.get('/products', {
        params: { workspace_id: workspaceId, page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
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
      throw error;
    }
  },

  // Update product
  async updateProduct(productId, productData) {
    try {
      const response = await apiClient.put(`/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product
  async deleteProduct(productId) {
    try {
      const response = await apiClient.delete(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
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