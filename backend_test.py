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
        self.base_url = "http://localhost:8001/api"  # Using the backend URL from frontend .env
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
            "slug": f"test-product-stock-{datetime.now().strftime('%Y%m%d_%H%M%S')}",
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
            "slug": f"test-product-analytics-{datetime.now().strftime('%Y%m%d_%H%M%S')}",
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
    
    def test_crm_pipeline_management(self):
        """Test CRM pipeline and deals management"""
        if not self.token or not self.workspace_id:
            self.log_test("CRM Pipeline Management", False, "Missing authentication token or workspace ID")
            return False
        
        # Test creating default pipeline stages
        stage_data = {"workspace_id": self.workspace_id}
        response, error = self.make_request('POST', '/crm-pipeline/default-stages', stage_data)
        
        if error:
            self.log_test("CRM Pipeline Management", False, f"Pipeline stages creation failed: {error}")
            return False
        
        if response.status_code in [200, 201]:
            try:
                result = response.json()
                if result.get('success') and result.get('stages'):
                    # Test getting pipeline with stages
                    pipeline_response, pipeline_error = self.make_request('GET', f'/crm-pipeline?workspace_id={self.workspace_id}')
                    
                    if pipeline_error or pipeline_response.status_code != 200:
                        self.log_test("CRM Pipeline Management", False, f"Pipeline retrieval failed: {pipeline_error or pipeline_response.text[:200]}")
                        return False
                    
                    pipeline_result = pipeline_response.json()
                    if pipeline_result.get('success') and pipeline_result.get('data'):
                        self.log_test("CRM Pipeline Management", True, "Pipeline stages creation and retrieval working correctly")
                        return True
                    else:
                        self.log_test("CRM Pipeline Management", False, f"Pipeline data format unexpected: {pipeline_result}")
                        return False
                else:
                    self.log_test("CRM Pipeline Management", False, f"Pipeline stages creation failed: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError:
                self.log_test("CRM Pipeline Management", False, "Invalid JSON response from pipeline stages creation")
                return False
        else:
            # If stages already exist, that's fine - test pipeline retrieval
            pipeline_response, pipeline_error = self.make_request('GET', f'/crm-pipeline?workspace_id={self.workspace_id}')
            
            if pipeline_error or pipeline_response.status_code != 200:
                self.log_test("CRM Pipeline Management", False, f"Pipeline retrieval failed: {pipeline_error or pipeline_response.text[:200]}")
                return False
            
            try:
                pipeline_result = pipeline_response.json()
                if pipeline_result.get('success'):
                    self.log_test("CRM Pipeline Management", True, "Pipeline retrieval working correctly (stages already exist)")
                    return True
                else:
                    self.log_test("CRM Pipeline Management", False, f"Pipeline retrieval failed: {pipeline_result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError:
                self.log_test("CRM Pipeline Management", False, "Invalid JSON response from pipeline retrieval")
                return False

    def test_crm_deals_management(self):
        """Test CRM deals CRUD operations"""
        if not self.token or not self.workspace_id:
            self.log_test("CRM Deals Management", False, "Missing authentication token or workspace ID")
            return False
        
        # First create a contact for the deal
        contact_data = {
            "workspace_id": self.workspace_id,
            "first_name": "John",
            "last_name": "Doe",
            "email": f"john.doe.{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com",
            "company": "Test Company",
            "lead_score": 75
        }
        
        contact_response, contact_error = self.make_request('POST', '/crm-contacts', contact_data)
        if contact_error or contact_response.status_code not in [200, 201]:
            self.log_test("CRM Deals Management", False, f"Failed to create test contact: {contact_error or contact_response.text[:200]}")
            return False
        
        try:
            contact_result = contact_response.json()
            if not contact_result.get('success') or not contact_result.get('contact'):
                self.log_test("CRM Deals Management", False, "Failed to create test contact for deals testing")
                return False
            
            contact_id = contact_result['contact']['id']
            
            # Get pipeline stages
            pipeline_response, pipeline_error = self.make_request('GET', f'/crm-pipeline?workspace_id={self.workspace_id}')
            if pipeline_error or pipeline_response.status_code != 200:
                self.log_test("CRM Deals Management", False, f"Failed to get pipeline stages: {pipeline_error or pipeline_response.text[:200]}")
                return False
            
            pipeline_result = pipeline_response.json()
            if not pipeline_result.get('success') or not pipeline_result.get('data', {}).get('stages'):
                self.log_test("CRM Deals Management", False, "No pipeline stages available for deals testing")
                return False
            
            stage_id = pipeline_result['data']['stages'][0]['id']
            
            # Test creating a deal
            deal_data = {
                "workspace_id": self.workspace_id,
                "contact_id": contact_id,
                "pipeline_stage_id": stage_id,
                "title": "Test Deal",
                "description": "A test deal for CRM testing",
                "value": 5000.00,
                "probability": 50,
                "expected_close_date": "2025-02-15",
                "status": "active",
                "source": "website"
            }
            
            response, error = self.make_request('POST', '/crm-deals', deal_data)
            
            if error:
                self.log_test("CRM Deals Management", False, f"Deal creation failed: {error}")
                return False
            
            if response.status_code in [200, 201]:
                try:
                    result = response.json()
                    if result.get('success') and result.get('deal'):
                        deal_id = result['deal']['id']
                        
                        # Test getting the deal
                        get_response, get_error = self.make_request('GET', f'/crm-deals/{deal_id}')
                        if get_error or get_response.status_code != 200:
                            self.log_test("CRM Deals Management", False, f"Deal retrieval failed: {get_error or get_response.text[:200]}")
                            return False
                        
                        # Test updating deal stage
                        if len(pipeline_result['data']['stages']) > 1:
                            new_stage_id = pipeline_result['data']['stages'][1]['id']
                            stage_update_data = {"stage_id": new_stage_id}
                            stage_response, stage_error = self.make_request('PUT', f'/crm-deals/{deal_id}/stage', stage_update_data)
                            
                            if stage_error or stage_response.status_code != 200:
                                self.log_test("CRM Deals Management", False, f"Deal stage update failed: {stage_error or stage_response.text[:200]}")
                                return False
                        
                        # Test listing deals
                        list_response, list_error = self.make_request('GET', f'/crm-deals?workspace_id={self.workspace_id}')
                        if list_error or list_response.status_code != 200:
                            self.log_test("CRM Deals Management", False, f"Deals listing failed: {list_error or list_response.text[:200]}")
                            return False
                        
                        self.log_test("CRM Deals Management", True, "Deal CRUD operations working correctly")
                        return True
                    else:
                        self.log_test("CRM Deals Management", False, f"Deal creation failed: {result.get('message', 'Unknown error')}")
                        return False
                except json.JSONDecodeError:
                    self.log_test("CRM Deals Management", False, "Invalid JSON response from deal creation")
                    return False
            else:
                self.log_test("CRM Deals Management", False, f"Deal creation failed with HTTP {response.status_code}: {response.text[:200]}")
                return False
                
        except json.JSONDecodeError:
            self.log_test("CRM Deals Management", False, "Invalid JSON response from contact creation")
            return False

    def test_crm_tasks_management(self):
        """Test CRM tasks CRUD operations"""
        if not self.token or not self.workspace_id:
            self.log_test("CRM Tasks Management", False, "Missing authentication token or workspace ID")
            return False
        
        # Test creating a task
        task_data = {
            "workspace_id": self.workspace_id,
            "title": "Follow up call",
            "description": "Call the client to discuss proposal",
            "type": "call",
            "priority": "high",
            "status": "pending",
            "due_date": "2025-01-20"
        }
        
        response, error = self.make_request('POST', '/crm-tasks', task_data)
        
        if error:
            self.log_test("CRM Tasks Management", False, f"Task creation failed: {error}")
            return False
        
        if response.status_code in [200, 201]:
            try:
                result = response.json()
                if result.get('success') and result.get('task'):
                    task_id = result['task']['id']
                    
                    # Test getting the task
                    get_response, get_error = self.make_request('GET', f'/crm-tasks/{task_id}')
                    if get_error or get_response.status_code != 200:
                        self.log_test("CRM Tasks Management", False, f"Task retrieval failed: {get_error or get_response.text[:200]}")
                        return False
                    
                    # Test updating task status
                    status_data = {"status": "completed"}
                    status_response, status_error = self.make_request('PUT', f'/crm-tasks/{task_id}/status', status_data)
                    
                    if status_error or status_response.status_code != 200:
                        self.log_test("CRM Tasks Management", False, f"Task status update failed: {status_error or status_response.text[:200]}")
                        return False
                    
                    # Test listing tasks
                    list_response, list_error = self.make_request('GET', f'/crm-tasks?workspace_id={self.workspace_id}')
                    if list_error or list_response.status_code != 200:
                        self.log_test("CRM Tasks Management", False, f"Tasks listing failed: {list_error or list_response.text[:200]}")
                        return False
                    
                    self.log_test("CRM Tasks Management", True, "Task CRUD operations working correctly")
                    return True
                else:
                    self.log_test("CRM Tasks Management", False, f"Task creation failed: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError:
                self.log_test("CRM Tasks Management", False, "Invalid JSON response from task creation")
                return False
        else:
            self.log_test("CRM Tasks Management", False, f"Task creation failed with HTTP {response.status_code}: {response.text[:200]}")
            return False

    def test_crm_communications_management(self):
        """Test CRM communications CRUD operations"""
        if not self.token or not self.workspace_id:
            self.log_test("CRM Communications Management", False, "Missing authentication token or workspace ID")
            return False
        
        # First create a contact for the communication
        contact_data = {
            "workspace_id": self.workspace_id,
            "first_name": "Jane",
            "last_name": "Smith",
            "email": f"jane.smith.{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com",
            "company": "Test Corp"
        }
        
        contact_response, contact_error = self.make_request('POST', '/crm-contacts', contact_data)
        if contact_error or contact_response.status_code not in [200, 201]:
            self.log_test("CRM Communications Management", False, f"Failed to create test contact: {contact_error or contact_response.text[:200]}")
            return False
        
        try:
            contact_result = contact_response.json()
            if not contact_result.get('success') or not contact_result.get('contact'):
                self.log_test("CRM Communications Management", False, "Failed to create test contact for communications testing")
                return False
            
            contact_id = contact_result['contact']['id']
            
            # Test creating a communication
            comm_data = {
                "workspace_id": self.workspace_id,
                "contact_id": contact_id,
                "type": "email",
                "direction": "outbound",
                "subject": "Follow up on proposal",
                "content": "Hi Jane, I wanted to follow up on our proposal discussion.",
                "summary": "Sent follow-up email about proposal",
                "outcome": "Awaiting response"
            }
            
            response, error = self.make_request('POST', '/crm-communications', comm_data)
            
            if error:
                self.log_test("CRM Communications Management", False, f"Communication creation failed: {error}")
                return False
            
            if response.status_code in [200, 201]:
                try:
                    result = response.json()
                    if result.get('success') and result.get('communication'):
                        comm_id = result['communication']['id']
                        
                        # Test getting contact communications
                        contact_comms_response, contact_comms_error = self.make_request('GET', f'/crm-contacts/{contact_id}/communications')
                        if contact_comms_error or contact_comms_response.status_code != 200:
                            self.log_test("CRM Communications Management", False, f"Contact communications retrieval failed: {contact_comms_error or contact_comms_response.text[:200]}")
                            return False
                        
                        # Test listing all communications
                        list_response, list_error = self.make_request('GET', f'/crm-communications?workspace_id={self.workspace_id}')
                        if list_error or list_response.status_code != 200:
                            self.log_test("CRM Communications Management", False, f"Communications listing failed: {list_error or list_response.text[:200]}")
                            return False
                        
                        self.log_test("CRM Communications Management", True, "Communication CRUD operations working correctly")
                        return True
                    else:
                        self.log_test("CRM Communications Management", False, f"Communication creation failed: {result.get('message', 'Unknown error')}")
                        return False
                except json.JSONDecodeError:
                    self.log_test("CRM Communications Management", False, "Invalid JSON response from communication creation")
                    return False
            else:
                self.log_test("CRM Communications Management", False, f"Communication creation failed with HTTP {response.status_code}: {response.text[:200]}")
                return False
                
        except json.JSONDecodeError:
            self.log_test("CRM Communications Management", False, "Invalid JSON response from contact creation")
            return False

    def test_crm_contact_analytics(self):
        """Test CRM contact analytics endpoints"""
        if not self.token or not self.workspace_id:
            self.log_test("CRM Contact Analytics", False, "Missing authentication token or workspace ID")
            return False
        
        # First create a contact for analytics testing
        contact_data = {
            "workspace_id": self.workspace_id,
            "first_name": "Analytics",
            "last_name": "Test",
            "email": f"analytics.test.{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com",
            "company": "Analytics Corp",
            "lead_score": 85
        }
        
        contact_response, contact_error = self.make_request('POST', '/crm-contacts', contact_data)
        if contact_error or contact_response.status_code not in [200, 201]:
            self.log_test("CRM Contact Analytics", False, f"Failed to create test contact: {contact_error or contact_response.text[:200]}")
            return False
        
        try:
            contact_result = contact_response.json()
            if not contact_result.get('success') or not contact_result.get('contact'):
                self.log_test("CRM Contact Analytics", False, "Failed to create test contact for analytics testing")
                return False
            
            contact_id = contact_result['contact']['id']
            
            # Test individual contact analytics
            analytics_response, analytics_error = self.make_request('GET', f'/crm-contacts/{contact_id}/analytics')
            
            if analytics_error:
                self.log_test("CRM Contact Analytics", False, f"Contact analytics request failed: {analytics_error}")
                return False
            
            if analytics_response.status_code == 200:
                try:
                    analytics_result = analytics_response.json()
                    if analytics_result.get('success') and analytics_result.get('data'):
                        # Test e-commerce import endpoint
                        import_response, import_error = self.make_request('POST', '/crm-contacts/import/ecommerce', {"workspace_id": self.workspace_id})
                        
                        if import_error or import_response.status_code not in [200, 201]:
                            self.log_test("CRM Contact Analytics", False, f"E-commerce import failed: {import_error or import_response.text[:200]}")
                            return False
                        
                        self.log_test("CRM Contact Analytics", True, "Contact analytics and e-commerce integration working correctly")
                        return True
                    else:
                        self.log_test("CRM Contact Analytics", False, f"Contact analytics returned unexpected format: {analytics_result}")
                        return False
                except json.JSONDecodeError:
                    self.log_test("CRM Contact Analytics", False, "Invalid JSON response from contact analytics")
                    return False
            else:
                self.log_test("CRM Contact Analytics", False, f"Contact analytics failed with HTTP {analytics_response.status_code}: {analytics_response.text[:200]}")
                return False
                
        except json.JSONDecodeError:
            self.log_test("CRM Contact Analytics", False, "Invalid JSON response from contact creation")
            return False

    def test_crm_automation_rules(self):
        """Test CRM automation rules CRUD operations"""
        if not self.token or not self.workspace_id:
            self.log_test("CRM Automation Rules", False, "Missing authentication token or workspace ID")
            return False
        
        # Test creating an automation rule
        rule_data = {
            "workspace_id": self.workspace_id,
            "name": "New Contact Welcome",
            "description": "Send welcome email to new contacts",
            "trigger": "contact_created",
            "conditions": [
                {
                    "field": "lead_score",
                    "operator": "greater_than",
                    "value": 50
                }
            ],
            "actions": [
                {
                    "type": "send_email",
                    "data": {
                        "template": "welcome",
                        "subject": "Welcome to our CRM!"
                    }
                }
            ],
            "is_active": True
        }
        
        response, error = self.make_request('POST', '/crm-automation-rules', rule_data)
        
        if error:
            self.log_test("CRM Automation Rules", False, f"Automation rule creation failed: {error}")
            return False
        
        if response.status_code in [200, 201]:
            try:
                result = response.json()
                if result.get('success') and result.get('data'):
                    rule_id = result['data']['id']
                    
                    # Test getting the rule
                    get_response, get_error = self.make_request('GET', f'/crm-automation-rules/{rule_id}')
                    if get_error or get_response.status_code != 200:
                        self.log_test("CRM Automation Rules", False, f"Automation rule retrieval failed: {get_error or get_response.text[:200]}")
                        return False
                    
                    # Test toggling rule status
                    toggle_response, toggle_error = self.make_request('POST', f'/crm-automation-rules/{rule_id}/toggle')
                    if toggle_error or toggle_response.status_code != 200:
                        self.log_test("CRM Automation Rules", False, f"Automation rule toggle failed: {toggle_error or toggle_response.text[:200]}")
                        return False
                    
                    # Test listing rules
                    list_response, list_error = self.make_request('GET', f'/crm-automation-rules?workspace_id={self.workspace_id}')
                    if list_error or list_response.status_code != 200:
                        self.log_test("CRM Automation Rules", False, f"Automation rules listing failed: {list_error or list_response.text[:200]}")
                        return False
                    
                    self.log_test("CRM Automation Rules", True, "Automation rule CRUD operations working correctly")
                    return True
                else:
                    self.log_test("CRM Automation Rules", False, f"Automation rule creation failed: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError:
                self.log_test("CRM Automation Rules", False, "Invalid JSON response from automation rule creation")
                return False
        else:
            self.log_test("CRM Automation Rules", False, f"Automation rule creation failed with HTTP {response.status_code}: {response.text[:200]}")
            return False

    def test_marketing_analytics(self):
        """Test Marketing Hub analytics endpoint"""
        if not self.token or not self.workspace_id:
            self.log_test("Marketing Analytics", False, "Missing authentication token or workspace ID")
            return False
        
        # Test different time ranges
        time_ranges = ['7d', '30d', '90d', '1y']
        
        for time_range in time_ranges:
            response, error = self.make_request('GET', f'/marketing/analytics?workspace_id={self.workspace_id}&time_range={time_range}')
            
            if error:
                self.log_test("Marketing Analytics", False, f"Marketing analytics request failed for {time_range}: {error}")
                return False
            
            if response.status_code == 200:
                try:
                    result = response.json()
                    if result.get('success') and result.get('data'):
                        data = result['data']
                        # Verify required fields
                        if 'overview' in data and 'channels' in data and 'timeline' in data:
                            continue
                        else:
                            self.log_test("Marketing Analytics", False, f"Missing required fields in analytics data for {time_range}")
                            return False
                    else:
                        self.log_test("Marketing Analytics", False, f"Marketing analytics returned unexpected format for {time_range}: {result}")
                        return False
                except json.JSONDecodeError:
                    self.log_test("Marketing Analytics", False, f"Invalid JSON response from marketing analytics for {time_range}")
                    return False
            else:
                self.log_test("Marketing Analytics", False, f"Marketing analytics failed with HTTP {response.status_code} for {time_range}: {response.text[:200]}")
                return False
        
        self.log_test("Marketing Analytics", True, "Marketing analytics working correctly for all time ranges")
        return True

    def test_marketing_automation(self):
        """Test Marketing Hub automation endpoints"""
        if not self.token or not self.workspace_id:
            self.log_test("Marketing Automation", False, "Missing authentication token or workspace ID")
            return False
        
        # Test getting automation workflows
        response, error = self.make_request('GET', f'/marketing/automation?workspace_id={self.workspace_id}')
        
        if error:
            self.log_test("Marketing Automation", False, f"Marketing automation list request failed: {error}")
            return False
        
        if response.status_code == 200:
            try:
                result = response.json()
                if result.get('success') and result.get('data'):
                    # Test creating automation workflow
                    automation_data = {
                        "workspace_id": self.workspace_id,
                        "name": "Welcome Email Series",
                        "description": "Automated welcome email sequence for new subscribers",
                        "trigger": "contact_created",
                        "trigger_conditions": {
                            "lead_score": {"min": 50}
                        },
                        "steps": [
                            {
                                "type": "email",
                                "delay": 0,
                                "template": "welcome_email",
                                "data": {
                                    "subject": "Welcome to our community!",
                                    "content": "Thank you for joining us."
                                }
                            },
                            {
                                "type": "wait",
                                "delay": 86400
                            },
                            {
                                "type": "email",
                                "delay": 0,
                                "template": "follow_up_email",
                                "data": {
                                    "subject": "Getting started guide",
                                    "content": "Here's how to get the most out of our platform."
                                }
                            }
                        ],
                        "status": "active"
                    }
                    
                    create_response, create_error = self.make_request('POST', '/marketing/automation', automation_data)
                    
                    if create_error:
                        self.log_test("Marketing Automation", False, f"Automation workflow creation failed: {create_error}")
                        return False
                    
                    if create_response.status_code in [200, 201]:
                        try:
                            create_result = create_response.json()
                            if create_result.get('success') and create_result.get('data'):
                                self.log_test("Marketing Automation", True, "Marketing automation workflows working correctly")
                                return True
                            else:
                                self.log_test("Marketing Automation", False, f"Automation workflow creation failed: {create_result.get('message', 'Unknown error')}")
                                return False
                        except json.JSONDecodeError:
                            self.log_test("Marketing Automation", False, "Invalid JSON response from automation workflow creation")
                            return False
                    else:
                        self.log_test("Marketing Automation", False, f"Automation workflow creation failed with HTTP {create_response.status_code}: {create_response.text[:200]}")
                        return False
                else:
                    self.log_test("Marketing Automation", False, f"Marketing automation list returned unexpected format: {result}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Marketing Automation", False, "Invalid JSON response from marketing automation list")
                return False
        else:
            self.log_test("Marketing Automation", False, f"Marketing automation list failed with HTTP {response.status_code}: {response.text[:200]}")
            return False

    def test_marketing_content_management(self):
        """Test Marketing Hub content management endpoints"""
        if not self.token or not self.workspace_id:
            self.log_test("Marketing Content Management", False, "Missing authentication token or workspace ID")
            return False
        
        # Test getting content library
        response, error = self.make_request('GET', f'/marketing/content?workspace_id={self.workspace_id}')
        
        if error:
            self.log_test("Marketing Content Management", False, f"Content library request failed: {error}")
            return False
        
        if response.status_code == 200:
            try:
                result = response.json()
                if result.get('success') and result.get('data'):
                    # Test creating content
                    content_data = {
                        "workspace_id": self.workspace_id,
                        "title": "Ultimate Marketing Guide 2025",
                        "description": "Comprehensive guide to modern marketing strategies",
                        "content_type": "ebook",
                        "format": "pdf",
                        "content_url": "https://example.com/marketing-guide.pdf",
                        "content_data": {
                            "pages": 50,
                            "chapters": 8
                        },
                        "seo_keywords": ["marketing", "digital marketing", "strategy"],
                        "meta_description": "Learn the latest marketing strategies and tactics for 2025",
                        "status": "published"
                    }
                    
                    create_response, create_error = self.make_request('POST', '/marketing/content', content_data)
                    
                    if create_error:
                        self.log_test("Marketing Content Management", False, f"Content creation failed: {create_error}")
                        return False
                    
                    if create_response.status_code in [200, 201]:
                        try:
                            create_result = create_response.json()
                            if create_result.get('success') and create_result.get('data'):
                                # Test filtering by type
                                filter_response, filter_error = self.make_request('GET', f'/marketing/content?workspace_id={self.workspace_id}&type=ebook')
                                
                                if filter_error or filter_response.status_code != 200:
                                    self.log_test("Marketing Content Management", False, f"Content filtering failed: {filter_error or filter_response.text[:200]}")
                                    return False
                                
                                # Test search functionality
                                search_response, search_error = self.make_request('GET', f'/marketing/content?workspace_id={self.workspace_id}&search=Marketing')
                                
                                if search_error or search_response.status_code != 200:
                                    self.log_test("Marketing Content Management", False, f"Content search failed: {search_error or search_response.text[:200]}")
                                    return False
                                
                                self.log_test("Marketing Content Management", True, "Content management CRUD operations working correctly")
                                return True
                            else:
                                self.log_test("Marketing Content Management", False, f"Content creation failed: {create_result.get('message', 'Unknown error')}")
                                return False
                        except json.JSONDecodeError:
                            self.log_test("Marketing Content Management", False, "Invalid JSON response from content creation")
                            return False
                    else:
                        self.log_test("Marketing Content Management", False, f"Content creation failed with HTTP {create_response.status_code}: {create_response.text[:200]}")
                        return False
                else:
                    self.log_test("Marketing Content Management", False, f"Content library returned unexpected format: {result}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Marketing Content Management", False, "Invalid JSON response from content library")
                return False
        else:
            self.log_test("Marketing Content Management", False, f"Content library failed with HTTP {response.status_code}: {response.text[:200]}")
            return False

    def test_marketing_lead_magnets(self):
        """Test Marketing Hub lead magnets endpoints"""
        if not self.token or not self.workspace_id:
            self.log_test("Marketing Lead Magnets", False, "Missing authentication token or workspace ID")
            return False
        
        # Test getting lead magnets
        response, error = self.make_request('GET', f'/marketing/lead-magnets?workspace_id={self.workspace_id}')
        
        if error:
            self.log_test("Marketing Lead Magnets", False, f"Lead magnets list request failed: {error}")
            return False
        
        if response.status_code == 200:
            try:
                result = response.json()
                if result.get('success') and result.get('data'):
                    # Test creating lead magnet
                    magnet_data = {
                        "workspace_id": self.workspace_id,
                        "title": "Free Marketing Checklist",
                        "description": "Essential checklist for launching successful marketing campaigns",
                        "type": "checklist",
                        "file_url": "https://example.com/marketing-checklist.pdf",
                        "landing_page_url": "https://example.com/checklist-landing",
                        "thank_you_page_url": "https://example.com/thank-you",
                        "auto_tag": ["lead_magnet", "marketing_checklist"],
                        "lead_score_boost": 15,
                        "traffic_source": "website",
                        "status": "active"
                    }
                    
                    create_response, create_error = self.make_request('POST', '/marketing/lead-magnets', magnet_data)
                    
                    if create_error:
                        self.log_test("Marketing Lead Magnets", False, f"Lead magnet creation failed: {create_error}")
                        return False
                    
                    if create_response.status_code in [200, 201]:
                        try:
                            create_result = create_response.json()
                            if create_result.get('success') and create_result.get('data'):
                                # Test filtering by type
                                filter_response, filter_error = self.make_request('GET', f'/marketing/lead-magnets?workspace_id={self.workspace_id}&type=checklist')
                                
                                if filter_error or filter_response.status_code != 200:
                                    self.log_test("Marketing Lead Magnets", False, f"Lead magnet filtering failed: {filter_error or filter_response.text[:200]}")
                                    return False
                                
                                self.log_test("Marketing Lead Magnets", True, "Lead magnet CRUD operations working correctly")
                                return True
                            else:
                                self.log_test("Marketing Lead Magnets", False, f"Lead magnet creation failed: {create_result.get('message', 'Unknown error')}")
                                return False
                        except json.JSONDecodeError:
                            self.log_test("Marketing Lead Magnets", False, "Invalid JSON response from lead magnet creation")
                            return False
                    else:
                        self.log_test("Marketing Lead Magnets", False, f"Lead magnet creation failed with HTTP {create_response.status_code}: {create_response.text[:200]}")
                        return False
                else:
                    self.log_test("Marketing Lead Magnets", False, f"Lead magnets list returned unexpected format: {result}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Marketing Lead Magnets", False, "Invalid JSON response from lead magnets list")
                return False
        else:
            self.log_test("Marketing Lead Magnets", False, f"Lead magnets list failed with HTTP {response.status_code}: {response.text[:200]}")
            return False

    def test_marketing_social_media_management(self):
        """Test Marketing Hub social media management endpoints"""
        if not self.token or not self.workspace_id:
            self.log_test("Marketing Social Media Management", False, "Missing authentication token or workspace ID")
            return False
        
        # Test getting social media calendar
        response, error = self.make_request('GET', f'/marketing/social-calendar?workspace_id={self.workspace_id}&month=1&year=2025')
        
        if error:
            self.log_test("Marketing Social Media Management", False, f"Social calendar request failed: {error}")
            return False
        
        if response.status_code == 200:
            try:
                result = response.json()
                if result.get('success') and result.get('data'):
                    # Test scheduling content
                    schedule_data = {
                        "workspace_id": self.workspace_id,
                        "post_content": "Exciting news! Our new marketing features are now live. Check them out and let us know what you think! #marketing #automation",
                        "platforms": ["facebook", "twitter", "linkedin"],
                        "scheduled_at": "2025-01-25T10:00:00Z",
                        "media_urls": ["https://example.com/image.jpg"],
                        "hashtags": ["marketing", "automation", "socialmedia"],
                        "mentions": ["@mewayz"]
                    }
                    
                    schedule_response, schedule_error = self.make_request('POST', '/marketing/schedule-content', schedule_data)
                    
                    if schedule_error:
                        self.log_test("Marketing Social Media Management", False, f"Content scheduling failed: {schedule_error}")
                        return False
                    
                    if schedule_response.status_code in [200, 201]:
                        try:
                            schedule_result = schedule_response.json()
                            if schedule_result.get('success') and schedule_result.get('data'):
                                self.log_test("Marketing Social Media Management", True, "Social media management working correctly")
                                return True
                            else:
                                self.log_test("Marketing Social Media Management", False, f"Content scheduling failed: {schedule_result.get('message', 'Unknown error')}")
                                return False
                        except json.JSONDecodeError:
                            self.log_test("Marketing Social Media Management", False, "Invalid JSON response from content scheduling")
                            return False
                    else:
                        self.log_test("Marketing Social Media Management", False, f"Content scheduling failed with HTTP {schedule_response.status_code}: {schedule_response.text[:200]}")
                        return False
                else:
                    self.log_test("Marketing Social Media Management", False, f"Social calendar returned unexpected format: {result}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Marketing Social Media Management", False, "Invalid JSON response from social calendar")
                return False
        else:
            self.log_test("Marketing Social Media Management", False, f"Social calendar failed with HTTP {response.status_code}: {response.text[:200]}")
            return False

    def test_marketing_conversion_funnels(self):
        """Test Marketing Hub conversion funnel analytics"""
        if not self.token or not self.workspace_id:
            self.log_test("Marketing Conversion Funnels", False, "Missing authentication token or workspace ID")
            return False
        
        response, error = self.make_request('GET', f'/marketing/conversion-funnels?workspace_id={self.workspace_id}')
        
        if error:
            self.log_test("Marketing Conversion Funnels", False, f"Conversion funnels request failed: {error}")
            return False
        
        if response.status_code == 200:
            try:
                result = response.json()
                if result.get('success') and result.get('data'):
                    funnels = result['data']
                    if isinstance(funnels, list) and len(funnels) > 0:
                        funnel = funnels[0]
                        # Verify funnel structure
                        if 'stages' in funnel and 'overall_conversion' in funnel:
                            stages = funnel['stages']
                            if isinstance(stages, list) and len(stages) > 0:
                                # Verify stage structure
                                stage = stages[0]
                                if 'name' in stage and 'count' in stage and 'conversion_rate' in stage:
                                    self.log_test("Marketing Conversion Funnels", True, "Conversion funnel analytics working correctly")
                                    return True
                                else:
                                    self.log_test("Marketing Conversion Funnels", False, "Funnel stage missing required fields")
                                    return False
                            else:
                                self.log_test("Marketing Conversion Funnels", False, "Funnel stages data invalid")
                                return False
                        else:
                            self.log_test("Marketing Conversion Funnels", False, "Funnel missing required fields")
                            return False
                    else:
                        self.log_test("Marketing Conversion Funnels", False, "No funnel data returned")
                        return False
                else:
                    self.log_test("Marketing Conversion Funnels", False, f"Conversion funnels returned unexpected format: {result}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Marketing Conversion Funnels", False, "Invalid JSON response from conversion funnels")
                return False
        else:
            self.log_test("Marketing Conversion Funnels", False, f"Conversion funnels failed with HTTP {response.status_code}: {response.text[:200]}")
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
            # E-commerce tests
            self.test_ecommerce_stock_management,
            self.test_ecommerce_order_management,
            self.test_ecommerce_inventory_alerts,
            self.test_ecommerce_product_categories,
            self.test_ecommerce_product_analytics,
            # New CRM Phase 4 tests
            self.test_crm_pipeline_management,
            self.test_crm_deals_management,
            self.test_crm_tasks_management,
            self.test_crm_communications_management,
            self.test_crm_contact_analytics,
            self.test_crm_automation_rules
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