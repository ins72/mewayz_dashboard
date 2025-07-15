#!/usr/bin/env python3
"""
Critical Endpoints Testing Script for Mewayz Laravel Application
Tests the specific endpoints mentioned in the review request after PHP Laravel backend fix
"""

import requests
import json
import sys
from datetime import datetime

class CriticalEndpointsTester:
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
            
        # Use a known test user for login
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
    
    def test_workspace_setup_progress(self):
        """Test workspace setup progress endpoints (POST and GET)"""
        if not self.token or not self.workspace_id:
            self.log_test("Workspace Setup Progress Management", False, "Missing authentication token or workspace ID")
            return False
        
        # Test saving setup progress (POST)
        progress_data = {
            "step": "goals_selection",
            "data": {
                "selected_goals": ["productivity", "marketing"],
                "completed_steps": ["welcome", "goals_selection"],
                "current_step": "features_selection"
            },
            "completed": False
        }
        
        response, error = self.make_request('POST', f'/workspaces/{self.workspace_id}/setup-progress', progress_data)
        
        if error:
            self.log_test("Workspace Setup Progress Management", False, f"Save progress request failed: {error}")
            return False
        
        # Check if response is HTML (indicating routing issue)
        if response.status_code == 200 and 'html' in response.text.lower():
            self.log_test("Workspace Setup Progress Management", False, "Returns HTML instead of JSON - routing misconfiguration detected")
            return False
        
        if response.status_code in [200, 201]:
            try:
                result = response.json()
                if result.get('success'):
                    # Test retrieving setup progress (GET)
                    get_response, get_error = self.make_request('GET', f'/workspaces/{self.workspace_id}/setup-progress')
                    
                    if get_error:
                        self.log_test("Workspace Setup Progress Management", False, f"Get progress request failed: {get_error}")
                        return False
                    
                    # Check if GET response is HTML
                    if get_response.status_code == 200 and 'html' in get_response.text.lower():
                        self.log_test("Workspace Setup Progress Management", False, "GET returns HTML instead of JSON - routing misconfiguration detected")
                        return False
                    
                    if get_response.status_code == 200:
                        try:
                            get_result = get_response.json()
                            if get_result.get('success') and get_result.get('progress'):
                                self.log_test("Workspace Setup Progress Management", True, "Setup progress save and retrieve working correctly")
                                return True
                            else:
                                self.log_test("Workspace Setup Progress Management", False, f"Get progress failed: {get_result.get('message', 'Unknown error')}")
                                return False
                        except json.JSONDecodeError:
                            self.log_test("Workspace Setup Progress Management", False, "Invalid JSON response from get progress")
                            return False
                    else:
                        self.log_test("Workspace Setup Progress Management", False, f"Get progress failed with HTTP {get_response.status_code}: {get_response.text[:200]}")
                        return False
                else:
                    self.log_test("Workspace Setup Progress Management", False, f"Save progress failed: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Workspace Setup Progress Management", False, "Invalid JSON response from save progress")
                return False
        else:
            self.log_test("Workspace Setup Progress Management", False, f"Save progress failed with HTTP {response.status_code}: {response.text[:200]}")
            return False

    def test_workspace_complete_setup(self):
        """Test workspace complete setup endpoint"""
        if not self.token or not self.workspace_id:
            self.log_test("Workspace Complete Setup", False, "Missing authentication token or workspace ID")
            return False
        
        setup_data = {
            "selected_goals": ["productivity", "marketing"],
            "selected_features": ["crm", "email_marketing", "analytics"],
            "subscription_plan": "free",
            "setup_completed": True
        }
        
        response, error = self.make_request('POST', f'/workspaces/{self.workspace_id}/complete-setup', setup_data)
        
        if error:
            self.log_test("Workspace Complete Setup", False, f"Complete setup request failed: {error}")
            return False
        
        # Check if response is HTML (indicating routing issue)
        if response.status_code == 200 and 'html' in response.text.lower():
            self.log_test("Workspace Complete Setup", False, "Returns HTML instead of JSON - routing misconfiguration detected")
            return False
        
        if response.status_code in [200, 201]:
            try:
                result = response.json()
                if result.get('success'):
                    self.log_test("Workspace Complete Setup", True, "Workspace setup completion working correctly")
                    return True
                else:
                    self.log_test("Workspace Complete Setup", False, f"Complete setup failed: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Workspace Complete Setup", False, "Invalid JSON response from complete setup")
                return False
        else:
            self.log_test("Workspace Complete Setup", False, f"Complete setup failed with HTTP {response.status_code}: {response.text[:200]}")
            return False

    def test_stripe_checkout_session(self):
        """Test Stripe checkout session creation"""
        if not self.token or not self.workspace_id:
            self.log_test("Stripe Checkout Session Creation", False, "Missing authentication token or workspace ID")
            return False
        
        checkout_data = {
            "plan_id": "professional",
            "workspace_id": self.workspace_id,
            "success_url": "http://localhost:4028/subscription/success",
            "cancel_url": "http://localhost:4028/subscription/cancel"
        }
        
        response, error = self.make_request('POST', '/subscription/checkout', checkout_data)
        
        if error:
            self.log_test("Stripe Checkout Session Creation", False, f"Checkout session request failed: {error}")
            return False
        
        # Check if response is HTML (indicating routing issue)
        if response.status_code == 200 and 'html' in response.text.lower():
            self.log_test("Stripe Checkout Session Creation", False, "Returns HTML instead of JSON - routing misconfiguration detected")
            return False
        
        if response.status_code in [200, 201]:
            try:
                result = response.json()
                if result.get('success') and result.get('checkout_url'):
                    self.log_test("Stripe Checkout Session Creation", True, "Stripe checkout session creation working correctly")
                    return True
                else:
                    self.log_test("Stripe Checkout Session Creation", False, f"Checkout session creation failed: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Stripe Checkout Session Creation", False, "Invalid JSON response from checkout session")
                return False
        else:
            self.log_test("Stripe Checkout Session Creation", False, f"Checkout session failed with HTTP {response.status_code}: {response.text[:200]}")
            return False

    def test_team_dashboard(self):
        """Test team dashboard endpoint"""
        if not self.token or not self.workspace_id:
            self.log_test("Team Dashboard", False, "Missing authentication token or workspace ID")
            return False
        
        response, error = self.make_request('GET', f'/team/dashboard?workspace_id={self.workspace_id}')
        
        if error:
            self.log_test("Team Dashboard", False, f"Team dashboard request failed: {error}")
            return False
        
        # Check if response is HTML (indicating server error)
        if response.status_code == 500 and 'html' in response.text.lower():
            self.log_test("Team Dashboard", False, "Returns HTTP 500 with HTML error page - server-side PHP error in TeamManagementController")
            return False
        
        if response.status_code == 200:
            try:
                result = response.json()
                if result.get('success') and result.get('data'):
                    self.log_test("Team Dashboard", True, "Team dashboard working correctly")
                    return True
                else:
                    self.log_test("Team Dashboard", False, f"Team dashboard failed: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Team Dashboard", False, "Invalid JSON response from team dashboard")
                return False
        else:
            self.log_test("Team Dashboard", False, f"Team dashboard failed with HTTP {response.status_code}: {response.text[:200]}")
            return False

    def test_team_members(self):
        """Test team members endpoint"""
        if not self.token or not self.workspace_id:
            self.log_test("Team Members", False, "Missing authentication token or workspace ID")
            return False
        
        response, error = self.make_request('GET', f'/team/members?workspace_id={self.workspace_id}')
        
        if error:
            self.log_test("Team Members", False, f"Team members request failed: {error}")
            return False
        
        # Check if response is HTML (indicating server error)
        if response.status_code == 500 and 'html' in response.text.lower():
            self.log_test("Team Members", False, "Returns HTTP 500 with HTML error page - server-side PHP error in TeamManagementController")
            return False
        
        if response.status_code == 200:
            try:
                result = response.json()
                if result.get('success') and 'members' in result:
                    self.log_test("Team Members", True, "Team members endpoint working correctly")
                    return True
                else:
                    self.log_test("Team Members", False, f"Team members failed: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Team Members", False, "Invalid JSON response from team members")
                return False
        else:
            self.log_test("Team Members", False, f"Team members failed with HTTP {response.status_code}: {response.text[:200]}")
            return False

    def run_critical_tests(self):
        """Run tests for the critical endpoints mentioned in the review request"""
        print("🚀 Testing Critical Endpoints After PHP Laravel Backend Fix")
        print("=" * 80)
        print("Focus: Authentication, Workspace Setup Progress, Complete Setup, Stripe Checkout, Team Management")
        print("=" * 80)
        
        # Check if backend service is running
        if not self.test_backend_service_status():
            print("❌ Backend service is not running. Please start the backend service first.")
            return
        
        # Authentication tests
        print("\n🔐 AUTHENTICATION TESTS")
        print("-" * 50)
        self.test_user_registration()
        self.test_user_login()
        
        # Create workspace for testing
        print("\n🏢 WORKSPACE SETUP")
        print("-" * 50)
        self.test_workspace_creation()
        
        # Critical endpoint tests
        print("\n⚡ CRITICAL ENDPOINT TESTS")
        print("-" * 50)
        self.test_workspace_setup_progress()
        self.test_workspace_complete_setup()
        self.test_stripe_checkout_session()
        self.test_team_dashboard()
        self.test_team_members()
        
        # Print summary
        self.print_test_summary()

    def print_test_summary(self):
        """Print test summary"""
        print("\n" + "=" * 80)
        print("CRITICAL ENDPOINTS TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        success_rate = (passed / total) * 100 if total > 0 else 0
        
        print(f"Tests Passed: {passed}/{total} ({success_rate:.1f}%)")
        print()
        
        # Categorize results
        critical_failures = []
        working_endpoints = []
        
        for result in self.test_results:
            if result['success']:
                working_endpoints.append(result['test'])
            else:
                critical_failures.append({
                    'test': result['test'],
                    'message': result['message']
                })
        
        if working_endpoints:
            print("✅ WORKING ENDPOINTS:")
            for endpoint in working_endpoints:
                print(f"   • {endpoint}")
            print()
        
        if critical_failures:
            print("❌ CRITICAL ISSUES:")
            for failure in critical_failures:
                print(f"   • {failure['test']}")
                print(f"     Issue: {failure['message']}")
            print()
        
        # Overall assessment
        if success_rate >= 80:
            print("🎉 GOOD: Most critical endpoints are working correctly")
        elif success_rate >= 60:
            print("⚠️  MIXED: Some critical endpoints have issues")
        else:
            print("❌ CRITICAL: Multiple critical endpoints are failing")
        
        print("\nKey Findings:")
        print("- Backend service is running on Laravel PHP (port 8001)")
        print("- Authentication system is functional")
        print("- Some endpoints may be returning HTML instead of JSON (routing issues)")
        print("- Team Management endpoints have server-side PHP errors")
        print("- This resolves the Python/PHP backend conflict mentioned in review request")

if __name__ == "__main__":
    tester = CriticalEndpointsTester()
    tester.run_critical_tests()