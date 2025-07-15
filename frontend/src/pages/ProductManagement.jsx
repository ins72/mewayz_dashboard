import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from '../contexts/WorkspaceContext';
import productService from '../services/productService';

const ProductManagement = () => {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    compare_price: '',
    currency: 'USD',
    category: '',
    sku: '',
    stock_quantity: '',
    track_inventory: true,
    shipping_required: false,
    images: [],
    tags: [],
    weight: '',
    dimensions: { length: '', width: '', height: '' }
  });

  useEffect(() => {
    loadProducts();
    loadOrders();
    loadCategories();
    loadInventoryAlerts();
  }, [workspaceId]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await productService.getProducts(workspaceId);
      if (response.success) {
        setProducts(response.data || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await productService.getOrders(workspaceId);
      if (response.success) {
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await productService.getProductCategories(workspaceId);
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadInventoryAlerts = async () => {
    try {
      const response = await productService.getInventoryAlerts(workspaceId);
      if (response.success) {
        setInventoryAlerts(response.data || []);
      }
    } catch (error) {
      console.error('Error loading inventory alerts:', error);
    }
  };

  const handleCreateProduct = async () => {
    setIsLoading(true);
    try {
      const response = await productService.createProduct(workspaceId, newProduct);
      if (response.success) {
        setProducts([...products, response.data]);
        setShowProductModal(false);
        resetNewProduct();
      }
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async (productId, updates) => {
    try {
      const response = await productService.updateProduct(productId, updates);
      if (response.success) {
        setProducts(products.map(p => p.id === productId ? response.data : p));
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(productId);
        setProducts(products.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleUpdateStock = async (productId, stockData) => {
    try {
      await productService.updateStock(productId, stockData);
      loadProducts(); // Refresh products
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const handleViewAnalytics = async (productId) => {
    setIsLoading(true);
    try {
      const response = await productService.getProductAnalytics(productId);
      if (response.success) {
        setAnalytics(response.data);
        setSelectedProduct(products.find(p => p.id === productId));
        setShowAnalytics(true);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await productService.updateOrderStatus(orderId, status);
      loadOrders(); // Refresh orders
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const resetNewProduct = () => {
    setNewProduct({
      name: '',
      description: '',
      price: '',
      compare_price: '',
      currency: 'USD',
      category: '',
      sku: '',
      stock_quantity: '',
      track_inventory: true,
      shipping_required: false,
      images: [],
      tags: [],
      weight: '',
      dimensions: { length: '', width: '', height: '' }
    });
  };

  const getStockStatusColor = (stockStatus) => {
    switch (stockStatus) {
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'fulfilled':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderProductCard = (product) => (
    <motion.div
      key={product.id}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      whileHover={{ y: -2 }}
    >
      <div className="relative">
        <img 
          src={product.thumbnail} 
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 flex space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(product.stock_status)}`}>
            {product.stock_status.replace('_', ' ')}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {product.status}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">${product.price}</div>
            {product.compare_price && (
              <div className="text-sm text-gray-500 line-through">${product.compare_price}</div>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          <div>
            <span className="font-medium">SKU:</span> {product.sku}
          </div>
          <div>
            <span className="font-medium">Stock:</span> {product.stock_quantity}
          </div>
          <div>
            <span className="font-medium">Sales:</span> {product.sales_count}
          </div>
          <div className="flex items-center">
            <i className="fas fa-star text-yellow-500 mr-1"></i>
            <span>{product.rating} ({product.reviews_count})</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
            {product.category}
          </span>
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedProduct(product);
              setNewProduct(product);
              setShowProductModal(true);
            }}
            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            <i className="fas fa-edit mr-2"></i>
            Edit
          </button>
          <button
            onClick={() => handleViewAnalytics(product.id)}
            className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
          >
            <i className="fas fa-chart-line mr-2"></i>
            Analytics
          </button>
          <button
            onClick={() => handleDeleteProduct(product.id)}
            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderOrderCard = (order) => (
    <motion.div
      key={order.id}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{order.order_number}</h3>
        <div className="flex space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
            {order.status}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {order.payment_status}
          </span>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Customer:</span>
          <span className="font-medium">{order.customer.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Email:</span>
          <span>{order.customer.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total:</span>
          <span className="font-bold text-blue-600">${order.total}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Items:</span>
          <span>{order.items.length} item(s)</span>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {new Date(order.created_at).toLocaleDateString()}
          </span>
          <div className="flex space-x-2">
            <select
              value={order.status}
              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm">
              View Details
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderProductModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedProduct ? 'Edit Product' : 'Create New Product'}
            </h2>
            <button
              onClick={() => setShowProductModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); handleCreateProduct(); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Premium Course Bundle"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., PCB-001"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="Describe your product..."
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compare Price
                </label>
                <input
                  type="number"
                  value={newProduct.compare_price}
                  onChange={(e) => setNewProduct({ ...newProduct, compare_price: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={newProduct.stock_quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  <option value="Digital Products">Digital Products</option>
                  <option value="Physical Products">Physical Products</option>
                  <option value="Services">Services</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  value={newProduct.weight}
                  onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.0"
                  step="0.1"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newProduct.track_inventory}
                  onChange={(e) => setNewProduct({ ...newProduct, track_inventory: e.target.checked })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Track inventory</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newProduct.shipping_required}
                  onChange={(e) => setNewProduct({ ...newProduct, shipping_required: e.target.checked })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Requires shipping</span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !newProduct.name || !newProduct.price}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Saving...' : selectedProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );

  const renderAnalyticsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Product Analytics - {selectedProduct?.name}
            </h2>
            <button
              onClick={() => setShowAnalytics(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          
          {analytics && (
            <div className="space-y-6">
              {/* Sales Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.sales.total_sales}
                  </div>
                  <div className="text-sm text-gray-600">Total Sales</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    ${analytics.sales.total_revenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    ${analytics.sales.average_order_value}
                  </div>
                  <div className="text-sm text-gray-600">Avg Order Value</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {analytics.sales.conversion_rate}%
                  </div>
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                </div>
              </div>
              
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Traffic & Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Page Views:</span>
                      <span className="font-semibold">{analytics.traffic.page_views.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unique Visitors:</span>
                      <span className="font-semibold">{analytics.traffic.unique_visitors.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bounce Rate:</span>
                      <span className="font-semibold">{analytics.traffic.bounce_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Time on Page:</span>
                      <span className="font-semibold">{analytics.traffic.average_time_on_page}s</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Conversion Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Add to Cart Rate:</span>
                      <span className="font-semibold text-green-600">{analytics.performance.add_to_cart_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Checkout Rate:</span>
                      <span className="font-semibold text-blue-600">{analytics.performance.checkout_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Return Rate:</span>
                      <span className="font-semibold text-red-600">{analytics.performance.return_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer Satisfaction:</span>
                      <span className="font-semibold text-yellow-600">{analytics.performance.customer_satisfaction}/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">E-commerce Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  resetNewProduct();
                  setShowProductModal(true);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Product
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Inventory Alerts */}
        {inventoryAlerts.length > 0 && (
          <div className="mb-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Inventory Alerts</h3>
              <div className="space-y-2">
                {inventoryAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between text-sm">
                    <span className="text-yellow-700">
                      <i className={`fas fa-${alert.severity === 'critical' ? 'exclamation-triangle' : 'exclamation-circle'} mr-2`}></i>
                      {alert.product_name} - {alert.type.replace('_', ' ')}
                    </span>
                    <span className="text-yellow-600">Stock: {alert.current_stock}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'products' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-box mr-2"></i>
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'orders' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-shopping-cart mr-2"></i>
            Orders
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'analytics' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-chart-line mr-2"></i>
            Analytics
          </button>
        </div>
        
        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(renderProductCard)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <i className="fas fa-box text-6xl text-gray-400 mb-4"></i>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Products Yet</h2>
                  <p className="text-gray-600 mb-6">
                    Create your first product to start selling
                  </p>
                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      resetNewProduct();
                      setShowProductModal(true);
                    }}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add Your First Product
                  </button>
                </div>
              )}
            </motion.div>
          )}
          
          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map(renderOrderCard)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <i className="fas fa-shopping-cart text-6xl text-gray-400 mb-4"></i>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Orders Yet</h2>
                  <p className="text-gray-600">Orders will appear here when customers make purchases</p>
                </div>
              )}
            </motion.div>
          )}
          
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">E-commerce Analytics</h2>
                <p className="text-gray-600">
                  View detailed analytics for individual products by clicking the Analytics button on each product card.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Modals */}
      <AnimatePresence>
        {showProductModal && renderProductModal()}
        {showAnalytics && renderAnalyticsModal()}
      </AnimatePresence>
    </div>
  );
};

export default ProductManagement;