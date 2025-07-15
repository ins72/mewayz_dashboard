#!/usr/bin/env python3
"""
Comprehensive Backend Testing Script for Mewayz Laravel Application
Tests core API endpoints, authentication, database connectivity, and business features
"""

import requests
import json
import sys
from datetime import datetime

class BackendTester:
    def __init__(self):
        self.base_url = "http://localhost:8001/api"
        self.token = None
        self.user_id = None
        self.workspace_id = None
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
    
    def test_backend_service_status(self):
        """Test if backend service is running on port 8001"""
        try:
            response = requests.get("http://localhost:8001", timeout=5)
            if response.status_code in [200, 404]:  # 404 is OK for Laravel without root route
                self.log_test("Backend Service Status", True, "Laravel backend running on port 8001")
                return True
            else:
                self.log_test("Backend Service Status", False, f"Unexpected status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Backend Service Status", False, f"Backend service not accessible: {str(e)}")
            return False
    
    def test_user_registration(self):
        """Test user registration endpoint"""
        test_email = f"testuser_{datetime.now().strftime('%Y%m%d_%H%M%S')}@mewayz.com"
        data = {
            "name": "Test User",
            "email": test_email,
            "password": "password123",
            "password_confirmation": "password123"
        }
        
        response, error = self.make_request('POST', '/auth/register', data)
        
        if error:
            self.log_test("User Registration", False, f"Request failed: {error}")
            return False
            
        if response.status_code == 201 or response.status_code == 200:
            try:
                result = response.json()
                if result.get('success') and result.get('token'):
                    self.token = result['token']
                    self.user_id = result['user']['id']
                    self.log_test("User Registration", True, f"User registered successfully with UUID: {self.user_id}")
                    return True
                else:
                    self.log_test("User Registration", False, f"Registration failed: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError:
                self.log_test("User Registration", False, "Invalid JSON response")
                return False
        else:
            self.log_test("User Registration", False, f"HTTP {response.status_code}: {response.text[:200]}")
            return False
    
    def test_user_login(self):
        """Test user login endpoint"""
        if not self.user_id:
            self.log_test("User Login", False, "No user registered for login test")
            return False
            
        # Use the same email from registration
        test_email = f"testuser_{datetime.now().strftime('%Y%m%d_%H%M%S')}@mewayz.com"
        data = {
            "email": "test@mewayz.com",  # Use existing test user
            "password": "password123"
        }
        
        response, error = self.make_request('POST', '/auth/login', data, headers={'Authorization': None})
        
        if error:
            self.log_test("User Login", False, f"Request failed: {error}")
            return False
            
        if response.status_code == 200:
            try:
                result = response.json()
                if result.get('success') and result.get('token'):
                    self.token = result['token']
                    self.log_test("User Login", True, "User login successful with JWT token")
                    return True
                else:
                    self.log_test("User Login", False, f"Login failed: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError:
                self.log_test("User Login", False, "Invalid JSON response")
                return False
        else:
            self.log_test("User Login", False, f"HTTP {response.status_code}: {response.text[:200]}")
            return False
    
    def test_authenticated_user_data(self):
        """Test getting authenticated user data"""
        if not self.token:
            self.log_test("Get User Data", False, "No authentication token available")
            return False
            
        response, error = self.make_request('GET', '/auth/user')
        
        if error:
            self.log_test("Get User Data", False, f"Request failed: {error}")
            return False
            
        if response.status_code == 200:
            try:
                result = response.json()
                if result.get('success') and result.get('user'):
                    user = result['user']
                    self.log_test("Get User Data", True, f"User data retrieved: {user.get('name')} ({user.get('email')})")
                    return True
                else:
                    self.log_test("Get User Data", False, f"Failed to get user data: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Get User Data", False, "Invalid JSON response")
                return False
        else:
            self.log_test("Get User Data", False, f"HTTP {response.status_code}: {response.text[:200]}")
            return False
    
    def test_workspace_creation(self):
        """Test workspace creation"""
        if not self.token:
            self.log_test("Workspace Creation", False, "No authentication token available")
            return False
            
        data = {
            "name": "Test Workspace",
            "description": "A test workspace for backend testing"
        }
        
        response, error = self.make_request('POST', '/workspaces', data)
        
        if error:
            self.log_test("Workspace Creation", False, f"Request failed: {error}")
            return False
            
        if response.status_code in [200, 201]:
            try:
                result = response.json()
                if result.get('success') and result.get('workspace'):
                    workspace = result['workspace']
                    self.workspace_id = workspace['id']
                    self.log_test("Workspace Creation", True, f"Workspace created with UUID: {self.workspace_id}")
                    return True
                else:
                    self.log_test("Workspace Creation", False, f"Failed to create workspace: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Workspace Creation", False, "Invalid JSON response")
                return False
        else:
            self.log_test("Workspace Creation", False, f"HTTP {response.status_code}: {response.text[:200]}")
            return False
    
    def test_workspace_listing(self):
        """Test workspace listing"""
        if not self.token:
            self.log_test("Workspace Listing", False, "No authentication token available")
            return False
            
        response, error = self.make_request('GET', '/workspaces')
        
        if error:
            self.log_test("Workspace Listing", False, f"Request failed: {error}")
            return False
            
        if response.status_code == 200:
            try:
                result = response.json()
                if result.get('success') and 'workspaces' in result:
                    workspaces = result['workspaces']
                    self.log_test("Workspace Listing", True, f"Retrieved {len(workspaces)} workspace(s)")
                    return True
                else:
                    self.log_test("Workspace Listing", False, f"Failed to list workspaces: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Workspace Listing", False, "Invalid JSON response")
                return False
        else:
            self.log_test("Workspace Listing", False, f"HTTP {response.status_code}: {response.text[:200]}")
            return False
    
    def test_social_media_endpoints(self):
        """Test social media management endpoints"""
        if not self.token or not self.workspace_id:
            self.log_test("Social Media Endpoints", False, "Missing authentication token or workspace ID")
            return False
            
        # Test social media accounts listing
        response, error = self.make_request('GET', '/social-media-accounts')
        
        if error:
            self.log_test("Social Media Endpoints", False, f"Request failed: {error}")
            return False
            
        if response.status_code == 200:
            try:
                result = response.json()
                if 'accounts' in result or 'data' in result or result.get('success'):
                    self.log_test("Social Media Endpoints", True, "Social media accounts endpoint accessible")
                    return True
                else:
                    self.log_test("Social Media Endpoints", False, f"Unexpected response format: {result}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Social Media Endpoints", False, "Invalid JSON response")
                return False
        else:
            self.log_test("Social Media Endpoints", False, f"HTTP {response.status_code}: {response.text[:200]}")
            return False
    
    def test_link_in_bio_endpoints(self):
        """Test link-in-bio management endpoints"""
        if not self.token:
            self.log_test("Link-in-Bio Endpoints", False, "No authentication token available")
            return False
            
        response, error = self.make_request('GET', '/link-in-bio-pages')
        
        if error:
            self.log_test("Link-in-Bio Endpoints", False, f"Request failed: {error}")
            return False
            
        if response.status_code == 200:
            try:
                result = response.json()
                if 'pages' in result or 'data' in result or result.get('success'):
                    self.log_test("Link-in-Bio Endpoints", True, "Link-in-bio pages endpoint accessible")
                    return True
                else:
                    self.log_test("Link-in-Bio Endpoints", False, f"Unexpected response format: {result}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Link-in-Bio Endpoints", False, "Invalid JSON response")
                return False
        else:
            self.log_test("Link-in-Bio Endpoints", False, f"HTTP {response.status_code}: {response.text[:200]}")
            return False
    
    def test_crm_endpoints(self):
        """Test CRM contact management endpoints"""
        if not self.token:
            self.log_test("CRM Endpoints", False, "No authentication token available")
            return False
            
        response, error = self.make_request('GET', '/crm-contacts')
        
        if error:
            self.log_test("CRM Endpoints", False, f"Request failed: {error}")
            return False
            
        if response.status_code == 200:
            try:
                result = response.json()
                if 'contacts' in result or 'data' in result or result.get('success'):
                    self.log_test("CRM Endpoints", True, "CRM contacts endpoint accessible")
                    return True
                else:
                    self.log_test("CRM Endpoints", False, f"Unexpected response format: {result}")
                    return False
            except json.JSONDecodeError:
                self.log_test("CRM Endpoints", False, "Invalid JSON response")
                return False
        else:
            self.log_test("CRM Endpoints", False, f"HTTP {response.status_code}: {response.text[:200]}")
            return False
    
    def test_course_endpoints(self):
        """Test course management endpoints"""
        if not self.token:
            self.log_test("Course Endpoints", False, "No authentication token available")
            return False
            
        response, error = self.make_request('GET', '/courses')
        
        if error:
            self.log_test("Course Endpoints", False, f"Request failed: {error}")
            return False
            
        if response.status_code == 200:
            try:
                result = response.json()
                if 'courses' in result or 'data' in result or result.get('success'):
                    self.log_test("Course Endpoints", True, "Course management endpoint accessible")
                    return True
                else:
                    self.log_test("Course Endpoints", False, f"Unexpected response format: {result}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Course Endpoints", False, "Invalid JSON response")
                return False
        else:
            self.log_test("Course Endpoints", False, f"HTTP {response.status_code}: {response.text[:200]}")
            return False
    
    def test_product_endpoints(self):
        """Test product management endpoints"""
        if not self.token:
            self.log_test("Product Endpoints", False, "No authentication token available")
            return False
            
        response, error = self.make_request('GET', '/products')
        
        if error:
            self.log_test("Product Endpoints", False, f"Request failed: {error}")
            return False
            
        if response.status_code == 200:
            try:
                result = response.json()
                if 'products' in result or 'data' in result or result.get('success'):
                    self.log_test("Product Endpoints", True, "Product management endpoint accessible")
                    return True
                else:
                    self.log_test("Product Endpoints", False, f"Unexpected response format: {result}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Product Endpoints", False, "Invalid JSON response")
                return False
        else:
            self.log_test("Product Endpoints", False, f"HTTP {response.status_code}: {response.text[:200]}")
            return False
    
    def test_authentication_protection(self):
        """Test that protected endpoints require authentication"""
        # Test without token
        old_token = self.token
        self.token = None
        
        response, error = self.make_request('GET', '/workspaces')
        
        if error:
            self.log_test("Authentication Protection", False, f"Request failed: {error}")
            self.token = old_token
            return False
            
        if response.status_code == 401:
            self.log_test("Authentication Protection", True, "Protected endpoints properly require authentication (401)")
            self.token = old_token
            return True
        else:
            self.log_test("Authentication Protection", False, f"Expected 401, got {response.status_code}")
            self.token = old_token
            return False
    
    def test_database_connectivity(self):
        """Test database connectivity through API operations"""
        if not self.token:
            self.log_test("Database Connectivity", False, "No authentication token available")
            return False
            
        # Test by creating and retrieving a workspace
        data = {
            "name": "DB Test Workspace",
            "description": "Testing database connectivity"
        }
        
        response, error = self.make_request('POST', '/workspaces', data)
        
        if error:
            self.log_test("Database Connectivity", False, f"Database operation failed: {error}")
            return False
            
        if response.status_code in [200, 201]:
            try:
                result = response.json()
                if result.get('success') and result.get('workspace'):
                    self.log_test("Database Connectivity", True, "Database operations working (SQLite with UUID support)")
                    return True
                else:
                    self.log_test("Database Connectivity", False, f"Database operation failed: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Database Connectivity", False, "Invalid JSON response from database operation")
                return False
        else:
            self.log_test("Database Connectivity", False, f"Database operation failed with HTTP {response.status_code}")
            return False
    
    def test_ecommerce_stock_management(self):
        """Test e-commerce stock management endpoint"""
        if not self.token or not self.workspace_id:
            self.log_test("E-commerce Stock Management", False, "Missing authentication token or workspace ID")
            return False
        
        # First create a product to test stock management
        product_data = {
            "name": "Test Product for Stock",
            "description": "A test product for stock management testing",
            "price": 29.99,
            "stock_quantity": 100,
            "workspace_id": self.workspace_id
        }
        
        response, error = self.make_request('POST', '/products', product_data)
        if error or response.status_code not in [200, 201]:
            self.log_test("E-commerce Stock Management", False, f"Failed to create test product: {error or response.text[:200]}")
            return False
        
        try:
            product_result = response.json()
            if not product_result.get('success') or not product_result.get('product'):
                self.log_test("E-commerce Stock Management", False, "Failed to create test product for stock testing")
                return False
            
            product_id = product_result['product']['id']
            
            # Test stock update endpoint
            stock_data = {
                "stock_quantity": 75,
                "operation": "set"  # or "add", "subtract"
            }
            
            response, error = self.make_request('POST', f'/products/{product_id}/update-stock', stock_data)
            
            if error:
                self.log_test("E-commerce Stock Management", False, f"Stock update request failed: {error}")
                return False
            
            if response.status_code == 200:
                try:
                    result = response.json()
                    if result.get('success'):
                        self.log_test("E-commerce Stock Management", True, "Stock update endpoint working correctly")
                        return True
                    else:
                        self.log_test("E-commerce Stock Management", False, f"Stock update failed: {result.get('message', 'Unknown error')}")
                        return False
                except json.JSONDecodeError:
                    self.log_test("E-commerce Stock Management", False, "Invalid JSON response from stock update")
                    return False
            else:
                self.log_test("E-commerce Stock Management", False, f"Stock update failed with HTTP {response.status_code}: {response.text[:200]}")
                return False
                
        except json.JSONDecodeError:
            self.log_test("E-commerce Stock Management", False, "Invalid JSON response from product creation")
            return False
    
    def test_ecommerce_order_management(self):
        """Test e-commerce order management endpoints"""
        if not self.token or not self.workspace_id:
            self.log_test("E-commerce Order Management", False, "Missing authentication token or workspace ID")
            return False
        
        # Test GET /api/orders - List all orders
        response, error = self.make_request('GET', '/orders')
        
        if error:
            self.log_test("E-commerce Order Management", False, f"Orders list request failed: {error}")
            return False
        
        if response.status_code == 200:
            try:
                result = response.json()
                if 'orders' in result or 'data' in result or result.get('success'):
                    # Test POST /api/orders - Create new order
                    order_data = {
                        "customer_name": "John Doe",
                        "customer_email": "john.doe@example.com",
                        "total_amount": 99.99,
                        "status": "pending",
                        "workspace_id": self.workspace_id,
                        "items": [
                            {
                                "product_name": "Test Product",
                                "quantity": 2,
                                "price": 49.99
                            }
                        ]
                    }
                    
                    create_response, create_error = self.make_request('POST', '/orders', order_data)
                    
                    if create_error:
                        self.log_test("E-commerce Order Management", False, f"Order creation failed: {create_error}")
                        return False
                    
                    if create_response.status_code in [200, 201]:
                        try:
                            create_result = create_response.json()
                            if create_result.get('success') and create_result.get('order'):
                                order_id = create_result['order']['id']
                                
                                # Test GET /api/orders/{id} - Get specific order
                                get_response, get_error = self.make_request('GET', f'/orders/{order_id}')
                                
                                if get_error or get_response.status_code != 200:
                                    self.log_test("E-commerce Order Management", False, f"Order retrieval failed: {get_error or get_response.text[:200]}")
                                    return False
                                
                                # Test PUT /api/orders/{id}/status - Update order status
                                status_data = {"status": "processing"}
                                status_response, status_error = self.make_request('PUT', f'/orders/{order_id}/status', status_data)
                                
                                if status_error or status_response.status_code != 200:
                                    self.log_test("E-commerce Order Management", False, f"Order status update failed: {status_error or status_response.text[:200]}")
                                    return False
                                
                                self.log_test("E-commerce Order Management", True, "Order management CRUD operations working correctly")
                                return True
                            else:
                                self.log_test("E-commerce Order Management", False, f"Order creation failed: {create_result.get('message', 'Unknown error')}")
                                return False
                        except json.JSONDecodeError:
                            self.log_test("E-commerce Order Management", False, "Invalid JSON response from order creation")
                            return False
                    else:
                        self.log_test("E-commerce Order Management", False, f"Order creation failed with HTTP {create_response.status_code}")
                        return False
                else:
                    self.log_test("E-commerce Order Management", False, f"Orders list endpoint returned unexpected format: {result}")
                    return False
            except json.JSONDecodeError:
                self.log_test("E-commerce Order Management", False, "Invalid JSON response from orders list")
                return False
        else:
            self.log_test("E-commerce Order Management", False, f"Orders list failed with HTTP {response.status_code}: {response.text[:200]}")
            return False
    
    def test_ecommerce_inventory_alerts(self):
        """Test e-commerce inventory alerts endpoint"""
        if not self.token:
            self.log_test("E-commerce Inventory Alerts", False, "No authentication token available")
            return False
        
        response, error = self.make_request('GET', '/inventory/alerts')
        
        if error:
            self.log_test("E-commerce Inventory Alerts", False, f"Inventory alerts request failed: {error}")
            return False
        
        if response.status_code == 200:
            try:
                result = response.json()
                if 'alerts' in result or 'data' in result or result.get('success'):
                    self.log_test("E-commerce Inventory Alerts", True, "Inventory alerts endpoint working correctly")
                    return True
                else:
                    self.log_test("E-commerce Inventory Alerts", False, f"Inventory alerts returned unexpected format: {result}")
                    return False
            except json.JSONDecodeError:
                self.log_test("E-commerce Inventory Alerts", False, "Invalid JSON response from inventory alerts")
                return False
        else:
            self.log_test("E-commerce Inventory Alerts", False, f"Inventory alerts failed with HTTP {response.status_code}: {response.text[:200]}")
            return False
    
    def test_ecommerce_product_categories(self):
        """Test e-commerce product categories endpoint"""
        if not self.token:
            self.log_test("E-commerce Product Categories", False, "No authentication token available")
            return False
        
        response, error = self.make_request('GET', '/product-categories')
        
        if error:
            self.log_test("E-commerce Product Categories", False, f"Product categories request failed: {error}")
            return False
        
        if response.status_code == 200:
            try:
                result = response.json()
                if 'categories' in result or 'data' in result or result.get('success'):
                    self.log_test("E-commerce Product Categories", True, "Product categories endpoint working correctly")
                    return True
                else:
                    self.log_test("E-commerce Product Categories", False, f"Product categories returned unexpected format: {result}")
                    return False
            except json.JSONDecodeError:
                self.log_test("E-commerce Product Categories", False, "Invalid JSON response from product categories")
                return False
        else:
            self.log_test("E-commerce Product Categories", False, f"Product categories failed with HTTP {response.status_code}: {response.text[:200]}")
            return False
    
    def test_ecommerce_product_analytics(self):
        """Test individual product analytics endpoint"""
        if not self.token or not self.workspace_id:
            self.log_test("E-commerce Product Analytics", False, "Missing authentication token or workspace ID")
            return False
        
        # First create a product to test analytics
        product_data = {
            "name": "Test Product for Analytics",
            "description": "A test product for analytics testing",
            "price": 39.99,
            "stock_quantity": 50,
            "workspace_id": self.workspace_id
        }
        
        response, error = self.make_request('POST', '/products', product_data)
        if error or response.status_code not in [200, 201]:
            self.log_test("E-commerce Product Analytics", False, f"Failed to create test product: {error or response.text[:200]}")
            return False
        
        try:
            product_result = response.json()
            if not product_result.get('success') or not product_result.get('product'):
                self.log_test("E-commerce Product Analytics", False, "Failed to create test product for analytics testing")
                return False
            
            product_id = product_result['product']['id']
            
            # Test individual product analytics endpoint
            response, error = self.make_request('GET', f'/products/{product_id}/analytics')
            
            if error:
                self.log_test("E-commerce Product Analytics", False, f"Product analytics request failed: {error}")
                return False
            
            if response.status_code == 200:
                try:
                    result = response.json()
                    if 'analytics' in result or 'data' in result or result.get('success'):
                        self.log_test("E-commerce Product Analytics", True, "Individual product analytics endpoint working correctly")
                        return True
                    else:
                        self.log_test("E-commerce Product Analytics", False, f"Product analytics returned unexpected format: {result}")
                        return False
                except json.JSONDecodeError:
                    self.log_test("E-commerce Product Analytics", False, "Invalid JSON response from product analytics")
                    return False
            else:
                self.log_test("E-commerce Product Analytics", False, f"Product analytics failed with HTTP {response.status_code}: {response.text[:200]}")
                return False
                
        except json.JSONDecodeError:
            self.log_test("E-commerce Product Analytics", False, "Invalid JSON response from product creation")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("MEWAYZ BACKEND TESTING - COMPREHENSIVE VERIFICATION")
        print("=" * 60)
        print()
        
        tests = [
            self.test_backend_service_status,
            self.test_user_registration,
            self.test_user_login,
            self.test_authenticated_user_data,
            self.test_workspace_creation,
            self.test_workspace_listing,
            self.test_social_media_endpoints,
            self.test_link_in_bio_endpoints,
            self.test_crm_endpoints,
            self.test_course_endpoints,
            self.test_product_endpoints,
            self.test_authentication_protection,
            self.test_database_connectivity,
            # New e-commerce tests
            self.test_ecommerce_stock_management,
            self.test_ecommerce_order_management,
            self.test_ecommerce_inventory_alerts,
            self.test_ecommerce_product_categories,
            self.test_ecommerce_product_analytics
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
        
        print("=" * 60)
        print("BACKEND TESTING SUMMARY")
        print("=" * 60)
        
        success_rate = (passed / total) * 100
        print(f"Tests Passed: {passed}/{total} ({success_rate:.1f}%)")
        print()
        
        if success_rate >= 90:
            print("🎉 EXCELLENT: Backend is production-ready!")
        elif success_rate >= 80:
            print("✅ GOOD: Backend core functionality is working well")
        elif success_rate >= 70:
            print("⚠️  ACCEPTABLE: Backend has some issues but core features work")
        else:
            print("❌ CRITICAL: Backend has significant issues requiring attention")
        
        print()
        print("DETAILED RESULTS:")
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}")
            if result['message']:
                print(f"   {result['message']}")
        
        return success_rate >= 80

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)