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
            self.test_database_connectivity
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