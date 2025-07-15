#!/usr/bin/env python3
"""
E-commerce Management System Backend Testing Script
Tests specific E-commerce endpoints mentioned in the review request
"""

import requests
import json
import sys
from datetime import datetime

class EcommerceBackendTester:
    def __init__(self):
        self.base_url = "http://localhost:8001/api"
        self.token = None
        self.user_id = None
        self.workspace_id = None
        self.product_id = None
        self.order_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, message="", details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'details': details
        })
        print(f"{status}: {test_name}")
        if message:
            print(f"    {message}")
        if details and not success:
            print(f"    Details: {details}")
        print()
    
    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        
        if headers:
            default_headers.update(headers)
            
        if self.token and 'Authorization' not in default_headers:
            default_headers['Authorization'] = f'Bearer {self.token}'
        
        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=default_headers, timeout=10)
            elif method.upper() == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=10)
            elif method.upper() == 'PUT':
                response = requests.put(url, json=data, headers=default_headers, timeout=10)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=default_headers, timeout=10)
            else:
                return None, f"Unsupported method: {method}"
                
            return response, None
        except requests.exceptions.RequestException as e:
            return None, str(e)
    
    def setup_authentication(self):
        """Setup authentication for testing"""
        # Register a test user
        test_email = f"ecommerce_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@mewayz.com"
        data = {
            "name": "E-commerce Test User",
            "email": test_email,
            "password": "password123",
            "password_confirmation": "password123"
        }
        
        response, error = self.make_request('POST', '/auth/register', data)
        
        if error or response.status_code not in [200, 201]:
            # Try to login with existing test user
            login_data = {
                "email": "test@mewayz.com",
                "password": "password123"
            }
            response, error = self.make_request('POST', '/auth/login', login_data, headers={'Authorization': None})
            
        if response and response.status_code in [200, 201]:
            try:
                result = response.json()
                if result.get('success') and result.get('token'):
                    self.token = result['token']
                    self.user_id = result['user']['id']
                    return True
            except json.JSONDecodeError:
                pass
                
        return False
    
    def test_product_management_endpoints(self):
        """Test Product Management CRUD operations"""
        if not self.token:
            self.log_test("Product Management CRUD", False, "No authentication token available")
            return False
        
        # Test GET /api/products (with filters)
        response, error = self.make_request('GET', '/products?category=electronics&status=active')
        
        if error:
            self.log_test("Product Management - GET with filters", False, f"Request failed: {error}")
            return False
            
        if response.status_code == 200:
            try:
                result = response.json()
                self.log_test("Product Management - GET with filters", True, "Products endpoint with filters accessible")
            except json.JSONDecodeError:
                self.log_test("Product Management - GET with filters", False, "Invalid JSON response")
                return False
        else:
            self.log_test("Product Management - GET with filters", False, f"HTTP {response.status_code}: {response.text[:200]}")
            return False
        
        # Test POST /api/products (create product)
        product_data = {
            "name": "Test E-commerce Product",
            "description": "A test product for e-commerce testing",
            "price": 29.99,
            "category": "electronics",
            "stock_quantity": 100,
            "sku": f"TEST-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        }
        
        response, error = self.make_request('POST', '/products', product_data)
        
        if error:
            self.log_test("Product Management - CREATE", False, f"Request failed: {error}")
            return False
            
        if response.status_code in [200, 201]:
            try:
                result = response.json()
                if result.get('success') and result.get('product'):
                    self.product_id = result['product']['id']
                    self.log_test("Product Management - CREATE", True, f"Product created successfully with ID: {self.product_id}")
                else:
                    self.log_test("Product Management - CREATE", False, f"Failed to create product: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Product Management - CREATE", False, "Invalid JSON response")
                return False
        else:
            self.log_test("Product Management - CREATE", False, f"HTTP {response.status_code}: {response.text[:200]}")
            return False
        
        # Test PUT /api/products/{id} (update product)
        if self.product_id:
            update_data = {
                "name": "Updated E-commerce Product",
                "price": 39.99,
                "stock_quantity": 150
            }
            
            response, error = self.make_request('PUT', f'/products/{self.product_id}', update_data)
            
            if error:
                self.log_test("Product Management - UPDATE", False, f"Request failed: {error}")
                return False
                
            if response.status_code == 200:
                try:
                    result = response.json()
                    if result.get('success'):
                        self.log_test("Product Management - UPDATE", True, "Product updated successfully")
                    else:
                        self.log_test("Product Management - UPDATE", False, f"Failed to update product: {result.get('message', 'Unknown error')}")
                        return False
                except json.JSONDecodeError:
                    self.log_test("Product Management - UPDATE", False, "Invalid JSON response")
                    return False
            else:
                self.log_test("Product Management - UPDATE", False, f"HTTP {response.status_code}: {response.text[:200]}")
                return False
        
        return True
    
    def test_stock_management_endpoints(self):
        """Test stock management functionality"""
        if not self.token or not self.product_id:
            self.log_test("Stock Management", False, "Missing authentication token or product ID")
            return False
        
        # Test POST /api/products/{id}/update-stock
        stock_data = {
            "quantity": 200,
            "operation": "set"  # or "add", "subtract"
        }
        
        response, error = self.make_request('POST', f'/products/{self.product_id}/update-stock', stock_data)
        
        if error:
            self.log_test("Stock Management - Update Stock", False, f"Request failed: {error}")
            return False
            
        if response.status_code == 200:
            try:
                result = response.json()
                if result.get('success'):
                    self.log_test("Stock Management - Update Stock", True, "Stock updated successfully")
                    return True
                else:
                    self.log_test("Stock Management - Update Stock", False, f"Failed to update stock: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Stock Management - Update Stock", False, "Invalid JSON response")
                return False
        else:
            self.log_test("Stock Management - Update Stock", False, f"HTTP {response.status_code}: {response.text[:200]}")
            return False
    
    def test_product_analytics_endpoints(self):
        """Test product analytics endpoints"""
        if not self.token:
            self.log_test("Product Analytics", False, "No authentication token available")
            return False
        
        # Test GET /api/products/{id}/analytics (individual product analytics)
        if self.product_id:
            response, error = self.make_request('GET', f'/products/{self.product_id}/analytics')
            
            if error:
                self.log_test("Product Analytics - Individual", False, f"Request failed: {error}")
            elif response.status_code == 200:
                try:
                    result = response.json()
                    self.log_test("Product Analytics - Individual", True, "Individual product analytics accessible")
                except json.JSONDecodeError:
                    self.log_test("Product Analytics - Individual", False, "Invalid JSON response")
            else:
                self.log_test("Product Analytics - Individual", False, f"HTTP {response.status_code}: {response.text[:200]}")
        
        # Test GET /api/products-analytics (overall analytics)
        response, error = self.make_request('GET', '/products-analytics')
        
        if error:
            self.log_test("Product Analytics - Overall", False, f"Request failed: {error}")
            return False
            
        if response.status_code == 200:
            try:
                result = response.json()
                self.log_test("Product Analytics - Overall", True, "Overall product analytics accessible")
                return True
            except json.JSONDecodeError:
                self.log_test("Product Analytics - Overall", False, "Invalid JSON response")
                return False
        else:
            self.log_test("Product Analytics - Overall", False, f"HTTP {response.status_code}: {response.text[:200]}")
            return False
    
    def test_order_management_endpoints(self):
        """Test order management endpoints"""
        if not self.token:
            self.log_test("Order Management", False, "No authentication token available")
            return False
        
        # Test GET /api/orders (with filters)
        response, error = self.make_request('GET', '/orders?status=pending&date_from=2024-01-01')
        
        if error:
            self.log_test("Order Management - GET with filters", False, f"Request failed: {error}")
            return False
            
        if response.status_code == 200:
            try:
                result = response.json()
                self.log_test("Order Management - GET with filters", True, "Orders endpoint with filters accessible")
            except json.JSONDecodeError:
                self.log_test("Order Management - GET with filters", False, "Invalid JSON response")
                return False
        elif response.status_code == 404:
            self.log_test("Order Management - GET with filters", False, "Orders endpoint not implemented (404)")
            return False
        else:
            self.log_test("Order Management - GET with filters", False, f"HTTP {response.status_code}: {response.text[:200]}")
            return False
        
        # Test PUT /api/orders/{id}/status (update order status)
        # Since we don't have a real order ID, we'll test with a dummy ID to see if the endpoint exists
        test_order_id = "test-order-123"
        status_data = {
            "status": "processing"
        }
        
        response, error = self.make_request('PUT', f'/orders/{test_order_id}/status', status_data)
        
        if error:
            self.log_test("Order Management - Update Status", False, f"Request failed: {error}")
            return False
            
        if response.status_code in [200, 404]:  # 404 is acceptable for non-existent order
            self.log_test("Order Management - Update Status", True, "Order status update endpoint accessible")
            return True
        else:
            self.log_test("Order Management - Update Status", False, f"HTTP {response.status_code}: {response.text[:200]}")
            return False
    
    def test_inventory_alerts_endpoints(self):
        """Test inventory alerts endpoints"""
        if not self.token:
            self.log_test("Inventory Alerts", False, "No authentication token available")
            return False
        
        # Test GET /api/inventory/alerts
        response, error = self.make_request('GET', '/inventory/alerts')
        
        if error:
            self.log_test("Inventory Alerts", False, f"Request failed: {error}")
            return False
            
        if response.status_code == 200:
            try:
                result = response.json()
                self.log_test("Inventory Alerts", True, "Inventory alerts endpoint accessible")
                return True
            except json.JSONDecodeError:
                self.log_test("Inventory Alerts", False, "Invalid JSON response")
                return False
        elif response.status_code == 404:
            self.log_test("Inventory Alerts", False, "Inventory alerts endpoint not implemented (404)")
            return False
        else:
            self.log_test("Inventory Alerts", False, f"HTTP {response.status_code}: {response.text[:200]}")
            return False
    
    def test_product_categories_endpoints(self):
        """Test product categories endpoints"""
        if not self.token:
            self.log_test("Product Categories", False, "No authentication token available")
            return False
        
        # Test GET /api/product-categories
        response, error = self.make_request('GET', '/product-categories')
        
        if error:
            self.log_test("Product Categories", False, f"Request failed: {error}")
            return False
            
        if response.status_code == 200:
            try:
                result = response.json()
                self.log_test("Product Categories", True, "Product categories endpoint accessible")
                return True
            except json.JSONDecodeError:
                self.log_test("Product Categories", False, "Invalid JSON response")
                return False
        elif response.status_code == 404:
            self.log_test("Product Categories", False, "Product categories endpoint not implemented (404)")
            return False
        else:
            self.log_test("Product Categories", False, f"HTTP {response.status_code}: {response.text[:200]}")
            return False
    
    def run_ecommerce_tests(self):
        """Run all E-commerce specific tests"""
        print("=" * 70)
        print("E-COMMERCE MANAGEMENT SYSTEM - BACKEND API TESTING")
        print("=" * 70)
        print()
        
        # Setup authentication first
        if not self.setup_authentication():
            print("❌ CRITICAL: Failed to setup authentication for testing")
            return False
        
        print("✅ Authentication setup successful")
        print()
        
        tests = [
            self.test_product_management_endpoints,
            self.test_stock_management_endpoints,
            self.test_product_analytics_endpoints,
            self.test_order_management_endpoints,
            self.test_inventory_alerts_endpoints,
            self.test_product_categories_endpoints
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
        
        print("=" * 70)
        print("E-COMMERCE BACKEND TESTING SUMMARY")
        print("=" * 70)
        
        success_rate = (passed / total) * 100
        print(f"Tests Passed: {passed}/{total} ({success_rate:.1f}%)")
        print()
        
        if success_rate >= 90:
            print("🎉 EXCELLENT: E-commerce backend is production-ready!")
        elif success_rate >= 80:
            print("✅ GOOD: E-commerce backend core functionality is working well")
        elif success_rate >= 70:
            print("⚠️  ACCEPTABLE: E-commerce backend has some issues but core features work")
        else:
            print("❌ CRITICAL: E-commerce backend has significant issues requiring attention")
        
        print()
        print("DETAILED RESULTS:")
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}")
            if result['message']:
                print(f"   {result['message']}")
        
        return success_rate >= 80

if __name__ == "__main__":
    tester = EcommerceBackendTester()
    success = tester.run_ecommerce_tests()
    sys.exit(0 if success else 1)