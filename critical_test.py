#!/usr/bin/env python3
"""
Critical Backend Endpoint Testing Script for Mewayz Laravel Application
Tests the specific endpoints mentioned in the review request
"""

import requests
import json
import sys
from datetime import datetime

class CriticalBackendTester:
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
    
    def setup_authentication(self):
        """Setup authentication for testing"""
        # Register a test user
        test_email = f"testuser_{datetime.now().strftime('%Y%m%d_%H%M%S')}@mewayz.com"
        data = {
            "name": "Test User",
            "email": test_email,
            "password": "password123",
            "password_confirmation": "password123"
        }
        
        response, error = self.make_request('POST', '/auth/register', data)
        
        if error or response.status_code not in [200, 201]:
            print(f"❌ Failed to register user: {error or response.text[:200]}")
            return False
            
        try:
            result = response.json()
            if result.get('success') and result.get('token'):
                self.token = result['token']
                self.user_id = result['user']['id']
                print(f"✅ User registered successfully with UUID: {self.user_id}")
                
                # Create a workspace
                workspace_data = {
                    "name": "Test Workspace",
                    "description": "A test workspace for critical testing"
                }
                
                workspace_response, workspace_error = self.make_request('POST', '/workspaces', workspace_data)
                
                if workspace_error or workspace_response.status_code not in [200, 201]:
                    print(f"❌ Failed to create workspace: {workspace_error or workspace_response.text[:200]}")
                    return False
                
                workspace_result = workspace_response.json()
                if workspace_result.get('success') and workspace_result.get('workspace'):
                    self.workspace_id = workspace_result['workspace']['id']
                    print(f"✅ Workspace created with UUID: {self.workspace_id}")
                    return True
                    
            return False
        except json.JSONDecodeError:
            print("❌ Invalid JSON response during authentication setup")
            return False

    def test_workspace_setup_progress(self):
        """Test workspace setup progress management endpoints"""
        print("\n🔥 Testing Workspace Setup Progress Management")
        print("-" * 50)
        
        # Test POST /api/workspaces/{id}/setup-progress - Save progress
        progress_data = {
            "step": "goals_selection",
            "data": {
                "selected_goals": ["content_creation", "social_media_management"],
                "completed_steps": ["welcome", "goals_selection"],
                "current_step": "features_selection"
            },
            "completed": False
        }
        
        response, error = self.make_request('POST', f'/workspaces/{self.workspace_id}/setup-progress', progress_data)
        
        if error:
            self.log_test("Workspace Setup Progress - POST", False, f"Save progress request failed: {error}")
            return False
        
        print(f"POST Response Status: {response.status_code}")
        print(f"POST Response Headers: {dict(response.headers)}")
        print(f"POST Response Body: {response.text[:500]}")
        
        if response.status_code in [200, 201]:
            try:
                result = response.json()
                if result.get('success'):
                    self.log_test("Workspace Setup Progress - POST", True, "Save progress working correctly")
                    
                    # Test GET /api/workspaces/{id}/setup-progress - Retrieve progress
                    get_response, get_error = self.make_request('GET', f'/workspaces/{self.workspace_id}/setup-progress')
                    
                    if get_error:
                        self.log_test("Workspace Setup Progress - GET", False, f"Retrieve progress request failed: {get_error}")
                        return False
                    
                    print(f"GET Response Status: {get_response.status_code}")
                    print(f"GET Response Body: {get_response.text[:500]}")
                    
                    if get_response.status_code == 200:
                        try:
                            get_result = get_response.json()
                            if get_result.get('success') and get_result.get('progress'):
                                self.log_test("Workspace Setup Progress - GET", True, "Retrieve progress working correctly")
                                return True
                            else:
                                self.log_test("Workspace Setup Progress - GET", False, f"Retrieve progress failed: {get_result.get('message', 'Invalid response format')}")
                                return False
                        except json.JSONDecodeError:
                            self.log_test("Workspace Setup Progress - GET", False, "Invalid JSON response from retrieve progress")
                            return False
                    else:
                        self.log_test("Workspace Setup Progress - GET", False, f"Retrieve progress failed with HTTP {get_response.status_code}")
                        return False
                else:
                    self.log_test("Workspace Setup Progress - POST", False, f"Save progress failed: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Workspace Setup Progress - POST", False, "Invalid JSON response from save progress")
                return False
        else:
            self.log_test("Workspace Setup Progress - POST", False, f"Save progress failed with HTTP {response.status_code}")
            return False

    def test_workspace_complete_setup(self):
        """Test workspace complete setup endpoint"""
        print("\n🔥 Testing Workspace Complete Setup")
        print("-" * 50)
        
        # Test POST /api/workspaces/{id}/complete-setup
        setup_data = {
            "selected_goals": ["content_creation", "social_media_management"],
            "selected_features": ["instagram_management", "content_calendar"],
            "subscription_plan": "free",
            "workspace_settings": {
                "timezone": "UTC",
                "currency": "USD",
                "language": "en"
            }
        }
        
        response, error = self.make_request('POST', f'/workspaces/{self.workspace_id}/complete-setup', setup_data)
        
        if error:
            self.log_test("Workspace Complete Setup", False, f"Complete setup request failed: {error}")
            return False
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text[:500]}")
        
        if response.status_code in [200, 201]:
            try:
                result = response.json()
                if result.get('success'):
                    self.log_test("Workspace Complete Setup", True, "Complete setup working correctly")
                    return True
                else:
                    self.log_test("Workspace Complete Setup", False, f"Complete setup failed: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Workspace Complete Setup", False, "Invalid JSON response from complete setup")
                return False
        else:
            self.log_test("Workspace Complete Setup", False, f"Complete setup failed with HTTP {response.status_code}")
            return False

    def test_stripe_checkout_session(self):
        """Test Stripe checkout session creation endpoint"""
        print("\n🔥 Testing Stripe Checkout Session Creation")
        print("-" * 50)
        
        # Test POST /api/subscription/checkout
        checkout_data = {
            "plan_id": "professional",
            "workspace_id": self.workspace_id,
            "success_url": "http://localhost:4028/subscription/success",
            "cancel_url": "http://localhost:4028/subscription/cancel",
            "billing_cycle": "monthly"
        }
        
        response, error = self.make_request('POST', '/subscription/checkout', checkout_data)
        
        if error:
            self.log_test("Stripe Checkout Session Creation", False, f"Checkout session request failed: {error}")
            return False
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text[:500]}")
        
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
                self.log_test("Stripe Checkout Session Creation", False, "Invalid JSON response from checkout session creation")
                return False
        else:
            self.log_test("Stripe Checkout Session Creation", False, f"Checkout session creation failed with HTTP {response.status_code}")
            return False

    def test_team_management_endpoints(self):
        """Test team management endpoints"""
        print("\n🔥 Testing Team Management Endpoints")
        print("-" * 50)
        
        # Test GET /api/team/dashboard
        dashboard_response, dashboard_error = self.make_request('GET', f'/team/dashboard?workspace_id={self.workspace_id}')
        
        if dashboard_error:
            self.log_test("Team Dashboard", False, f"Team dashboard request failed: {dashboard_error}")
            return False
        
        print(f"Dashboard Response Status: {dashboard_response.status_code}")
        print(f"Dashboard Response Headers: {dict(dashboard_response.headers)}")
        print(f"Dashboard Response Body: {dashboard_response.text[:500]}")
        
        if dashboard_response.status_code == 200:
            try:
                dashboard_result = dashboard_response.json()
                if dashboard_result.get('success'):
                    self.log_test("Team Dashboard", True, "Team dashboard working correctly")
                    
                    # Test GET /api/team/members
                    members_response, members_error = self.make_request('GET', f'/team/members?workspace_id={self.workspace_id}')
                    
                    if members_error:
                        self.log_test("Team Members", False, f"Team members request failed: {members_error}")
                        return False
                    
                    print(f"Members Response Status: {members_response.status_code}")
                    print(f"Members Response Body: {members_response.text[:500]}")
                    
                    if members_response.status_code == 200:
                        try:
                            members_result = members_response.json()
                            if members_result.get('success'):
                                self.log_test("Team Members", True, "Team members working correctly")
                                return True
                            else:
                                self.log_test("Team Members", False, f"Team members failed: {members_result.get('message', 'Unknown error')}")
                                return False
                        except json.JSONDecodeError:
                            self.log_test("Team Members", False, "Invalid JSON response from team members")
                            return False
                    else:
                        self.log_test("Team Members", False, f"Team members failed with HTTP {members_response.status_code}")
                        return False
                else:
                    self.log_test("Team Dashboard", False, f"Team dashboard failed: {dashboard_result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Team Dashboard", False, "Invalid JSON response from team dashboard")
                return False
        else:
            self.log_test("Team Dashboard", False, f"Team dashboard failed with HTTP {dashboard_response.status_code}")
            return False

    def test_working_endpoints(self):
        """Test known working endpoints to confirm backend is operational"""
        print("\n✅ Testing Working Endpoints Verification")
        print("-" * 50)
        
        working_tests = []
        
        # Test /api/goals
        goals_response, goals_error = self.make_request('GET', '/goals')
        if not goals_error and goals_response.status_code == 200:
            try:
                goals_result = goals_response.json()
                if goals_result.get('success') or goals_result.get('data'):
                    working_tests.append("✅ /api/goals - workspace setup goals")
                else:
                    working_tests.append("❌ /api/goals - invalid response format")
            except json.JSONDecodeError:
                working_tests.append("❌ /api/goals - invalid JSON response")
        else:
            working_tests.append(f"❌ /api/goals - {goals_error or f'HTTP {goals_response.status_code}'}")
        
        # Test /api/subscription/current
        current_response, current_error = self.make_request('GET', '/subscription/current')
        if not current_error and current_response.status_code == 200:
            try:
                current_result = current_response.json()
                if current_result.get('success') is not None:
                    working_tests.append("✅ /api/subscription/current - current subscription info")
                else:
                    working_tests.append("❌ /api/subscription/current - invalid response format")
            except json.JSONDecodeError:
                working_tests.append("❌ /api/subscription/current - invalid JSON response")
        else:
            working_tests.append(f"❌ /api/subscription/current - {current_error or f'HTTP {current_response.status_code}'}")
        
        # Test /api/subscription/plans
        plans_response, plans_error = self.make_request('GET', '/subscription/plans')
        if not plans_error and plans_response.status_code == 200:
            try:
                plans_result = plans_response.json()
                if plans_result.get('success') or plans_result.get('data'):
                    working_tests.append("✅ /api/subscription/plans - subscription plans")
                else:
                    working_tests.append("❌ /api/subscription/plans - invalid response format")
            except json.JSONDecodeError:
                working_tests.append("❌ /api/subscription/plans - invalid JSON response")
        else:
            working_tests.append(f"❌ /api/subscription/plans - {plans_error or f'HTTP {plans_response.status_code}'}")
        
        # Count successful tests
        successful_tests = len([test for test in working_tests if test.startswith("✅")])
        total_tests = len(working_tests)
        
        if successful_tests == total_tests:
            self.log_test("Working Endpoints Verification", True, f"All {total_tests} working endpoints confirmed operational")
        else:
            self.log_test("Working Endpoints Verification", False, f"Only {successful_tests}/{total_tests} working endpoints operational")
        
        # Print detailed results
        for test in working_tests:
            print(f"    {test}")
        
        return successful_tests == total_tests

    def run_critical_tests(self):
        """Run critical endpoint tests as requested in review"""
        print("🚀 Starting Critical Backend Endpoint Testing for Mewayz Laravel Application")
        print("=" * 80)
        
        # Check if backend service is running
        try:
            response = requests.get("http://localhost:8001", timeout=5)
            if response.status_code in [200, 404]:  # 404 is OK for Laravel without root route
                print("✅ Laravel backend running on port 8001")
            else:
                print(f"❌ Backend service unexpected status: {response.status_code}")
                return
        except Exception as e:
            print(f"❌ Backend service not accessible: {str(e)}")
            return
        
        # Authentication setup
        print("\n📋 AUTHENTICATION SETUP")
        print("-" * 40)
        if not self.setup_authentication():
            print("❌ Failed to setup authentication. Cannot proceed with tests.")
            return
        
        # Test working endpoints first to confirm backend is operational
        self.test_working_endpoints()
        
        # Test critical failing endpoints
        self.test_workspace_setup_progress()
        self.test_workspace_complete_setup()
        self.test_stripe_checkout_session()
        self.test_team_management_endpoints()
        
        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print critical test summary"""
        print("\n" + "=" * 80)
        print("🎯 CRITICAL BACKEND TESTING SUMMARY")
        print("=" * 80)
        
        passed_tests = [test for test in self.test_results if test['success']]
        failed_tests = [test for test in self.test_results if not test['success']]
        
        print(f"✅ PASSED: {len(passed_tests)}")
        print(f"❌ FAILED: {len(failed_tests)}")
        print(f"📊 SUCCESS RATE: {len(passed_tests)}/{len(self.test_results)} ({(len(passed_tests)/len(self.test_results)*100):.1f}%)")
        
        if failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['message']}")
        
        print(f"\n🏁 Testing completed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)


if __name__ == "__main__":
    tester = CriticalBackendTester()
    tester.run_critical_tests()