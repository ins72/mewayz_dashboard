import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import productService from '../services/productService';

const InventoryManagement = ({ workspaceId }) => {
  const [products, setProducts] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockUpdate, setStockUpdate] = useState({
    quantity: '',
    action: 'set', // 'set', 'add', 'subtract'
    reason: '',
    cost: ''
  });

  useEffect(() => {
    loadProducts();
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

  const handleStockUpdate = async () => {
    if (!selectedProduct || !stockUpdate.quantity) return;
    
    setIsLoading(true);
    try {
      await productService.updateStock(selectedProduct.id, stockUpdate);
      setShowStockModal(false);
      setStockUpdate({ quantity: '', action: 'set', reason: '', cost: '' });
      setSelectedProduct(null);
      loadProducts();
      loadInventoryAlerts();
    } catch (error) {
      console.error('Error updating stock:', error);
    } finally {
      setIsLoading(false);
    }
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

  const getStockLevelBar = (quantity, maxQuantity = 100) => {
    const percentage = Math.min((quantity / maxQuantity) * 100, 100);
    const colorClass = percentage > 50 ? 'bg-green-500' : percentage > 20 ? 'bg-yellow-500' : 'bg-red-500';
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  const renderInventoryCard = (product) => (
    <motion.div
      key={product.id}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img 
            src={product.thumbnail} 
            alt={product.name}
            className="w-12 h-12 object-cover rounded-lg mr-3"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
            <p className="text-sm text-gray-600">SKU: {product.sku}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStockStatusColor(product.stock_status)}`}>
          {product.stock_status.replace('_', ' ')}
        </span>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Current Stock</span>
            <span className="text-lg font-bold text-gray-900">{product.stock_quantity}</span>
          </div>
          {getStockLevelBar(product.stock_quantity)}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Sales:</span>
            <span className="font-semibold ml-2">{product.sales_count}</span>
          </div>
          <div>
            <span className="text-gray-600">Price:</span>
            <span className="font-semibold ml-2">${product.price}</span>
          </div>
          <div>
            <span className="text-gray-600">Category:</span>
            <span className="font-semibold ml-2">{product.category}</span>
          </div>
          <div>
            <span className="text-gray-600">Status:</span>
            <span className={`font-semibold ml-2 ${
              product.status === 'active' ? 'text-green-600' : 'text-gray-600'
            }`}>
              {product.status}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <span className="text-xs text-gray-500">
            Updated: {new Date(product.updated_at).toLocaleDateString()}
          </span>
          <button
            onClick={() => {
              setSelectedProduct(product);
              setShowStockModal(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            <i className="fas fa-edit mr-2"></i>
            Update Stock
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderStockModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        className="bg-white rounded-lg max-w-md w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Update Stock</h2>
            <button
              onClick={() => setShowStockModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          
          {selectedProduct && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800">{selectedProduct.name}</h3>
                <p className="text-sm text-gray-600">SKU: {selectedProduct.sku}</p>
                <p className="text-sm text-gray-600">Current Stock: {selectedProduct.stock_quantity}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action
                </label>
                <select
                  value={stockUpdate.action}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, action: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="set">Set to specific amount</option>
                  <option value="add">Add to current stock</option>
                  <option value="subtract">Subtract from current stock</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={stockUpdate.quantity}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, quantity: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter quantity"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <input
                  type="text"
                  value={stockUpdate.reason}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, reason: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Restocked, Sold, Damaged"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost per Unit (Optional)
                </label>
                <input
                  type="number"
                  value={stockUpdate.cost}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, cost: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowStockModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStockUpdate}
                  disabled={isLoading || !stockUpdate.quantity}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Updating...' : 'Update Stock'}
                </button>
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
              <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>In Stock</span>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Low Stock</span>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Out of Stock</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Inventory Alerts */}
        {inventoryAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Inventory Alerts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventoryAlerts.map(alert => (
                <motion.div
                  key={alert.id}
                  className={`rounded-lg p-4 border-l-4 ${
                    alert.severity === 'critical' 
                      ? 'bg-red-50 border-red-500' 
                      : 'bg-yellow-50 border-yellow-500'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-semibold ${
                      alert.severity === 'critical' ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      {alert.product_name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alert.severity === 'critical' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alert.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    alert.severity === 'critical' ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    Current Stock: {alert.current_stock} (Threshold: {alert.threshold})
                  </p>
                  <p className={`text-xs mt-2 ${
                    alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {/* Inventory Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Inventory Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <i className="fas fa-boxes text-blue-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-800">{products.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <i className="fas fa-check-circle text-green-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">In Stock</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {products.filter(p => p.stock_status === 'in_stock').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <i className="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {products.filter(p => p.stock_status === 'low_stock').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <i className="fas fa-times-circle text-red-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {products.filter(p => p.stock_status === 'out_of_stock').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Products Inventory */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Inventory</h2>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(renderInventoryCard)}
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-box text-6xl text-gray-400 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Found</h3>
              <p className="text-gray-600">Add products to start managing inventory</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Stock Update Modal */}
      <AnimatePresence>
        {showStockModal && renderStockModal()}
      </AnimatePresence>
    </div>
  );
};

export default InventoryManagement;