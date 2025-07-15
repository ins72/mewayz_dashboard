#!/usr/bin/env python3
"""
Focused Stripe Integration Testing Script for Mewayz Laravel Application
Tests Stripe payment processing and subscription management endpoints
"""

import requests
import json
import sys
from datetime import datetime

class StripeIntegrationTester:
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
        test_email = f"stripe_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@mewayz.com"
        data = {
            "name": "Stripe Test User",
            "email": test_email,
            "password": "password123",
            "password_confirmation": "password123"
        }
        
        response, error = self.make_request('POST', '/auth/register', data)
        
        if error or response.status_code not in [200, 201]:
            print(f"❌ Failed to register test user: {error or response.text[:200]}")
            return False
            
        try:
            result = response.json()
            if result.get('success') and result.get('token'):
                self.token = result['token']
                self.user_id = result['user']['id']
                print(f"✅ Test user registered: {self.user_id}")
                
                # Create a workspace
                workspace_data = {
                    "name": "Stripe Test Workspace",
                    "description": "Testing Stripe integration"
                }
                
                ws_response, ws_error = self.make_request('POST', '/workspaces', workspace_data)
                if ws_error or ws_response.status_code not in [200, 201]:
                    print(f"❌ Failed to create workspace: {ws_error or ws_response.text[:200]}")
                    return False
                
                ws_result = ws_response.json()
                if ws_result.get('success') and ws_result.get('workspace'):
                    self.workspace_id = ws_result['workspace']['id']
                    print(f"✅ Test workspace created: {self.workspace_id}")
                    return True
                    
            return False
        except json.JSONDecodeError:
            print("❌ Invalid JSON response during authentication setup")
            return False
    
    def test_subscription_plans_endpoint(self):
        """Test GET /api/subscription/plans - Get subscription plans with feature-based pricing"""
        print("🔍 Testing Subscription Plans Endpoint...")
        
        response, error = self.make_request('GET', '/subscription/plans')
        
        if error:
            self.log_test("Subscription Plans Endpoint", False, f"Request failed: {error}")
            return False
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Raw Response: {response.text[:500]}...")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"Parsed JSON: {json.dumps(result, indent=2)}")
                
                if result.get('success'):
                    plans = result.get('data') or result.get('plans')
                    if plans and len(plans) >= 3:
                        # Check for Free, Professional, Enterprise plans
                        plan_names = [plan.get('name', '').lower() for plan in plans]
                        expected_plans = ['free', 'professional', 'enterprise']
                        
                        found_plans = []
                        for expected in expected_plans:
                            for plan_name in plan_names:
                                if expected in plan_name:
                                    found_plans.append(expected)
                                    break
                        
                        if len(found_plans) >= 3:
                            # Verify feature-based pricing for Professional and Enterprise
                            professional_plan = next((p for p in plans if 'professional' in p.get('name', '').lower()), None)
                            enterprise_plan = next((p for p in plans if 'enterprise' in p.get('name', '').lower()), None)
                            
                            if professional_plan and enterprise_plan:
                                prof_pricing = professional_plan.get('pricing_model') == 'feature_based'
                                ent_pricing = enterprise_plan.get('pricing_model') == 'feature_based'
                                
                                if prof_pricing and ent_pricing:
                                    self.log_test("Subscription Plans Endpoint", True, 
                                                f"Retrieved {len(plans)} subscription plans with feature-based pricing")
                                    return True
                                else:
                                    self.log_test("Subscription Plans Endpoint", False, 
                                                "Professional/Enterprise plans missing feature-based pricing")
                                    return False
                            else:
                                self.log_test("Subscription Plans Endpoint", False, 
                                            "Missing Professional or Enterprise plan")
                                return False
                        else:
                            self.log_test("Subscription Plans Endpoint", False, 
                                        f"Missing expected plans. Found: {found_plans}")
                            return False
                    else:
                        self.log_test("Subscription Plans Endpoint", False, 
                                    f"Expected at least 3 plans, got {len(plans) if plans else 0}")
                        return False
                else:
                    self.log_test("Subscription Plans Endpoint", False, 
                                f"API returned success=false: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError as e:
                self.log_test("Subscription Plans Endpoint", False, f"Invalid JSON response: {str(e)}")
                return False
        else:
            self.log_test("Subscription Plans Endpoint", False, 
                        f"HTTP {response.status_code}: {response.text[:200]}")
            return False
    
    def test_current_subscription_endpoint(self):
        """Test GET /api/subscription/current - Get current subscription"""
        print("🔍 Testing Current Subscription Endpoint...")
        
        response, error = self.make_request('GET', '/subscription/current')
        
        if error:
            self.log_test("Current Subscription Endpoint", False, f"Request failed: {error}")
            return False
        
        print(f"Response Status: {response.status_code}")
        print(f"Raw Response: {response.text[:500]}...")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"Parsed JSON: {json.dumps(result, indent=2)}")
                
                if result.get('success'):
                    subscription = result.get('subscription')
                    if subscription is None:
                        self.log_test("Current Subscription Endpoint", True, 
                                    "No current subscription (valid response for new user)")
                        return True
                    elif isinstance(subscription, dict) and 'id' in subscription:
                        self.log_test("Current Subscription Endpoint", True, 
                                    f"Current subscription retrieved: {subscription.get('plan', 'Unknown')}")
                        return True
                    else:
                        self.log_test("Current Subscription Endpoint", False, 
                                    f"Invalid subscription format: {subscription}")
                        return False
                else:
                    self.log_test("Current Subscription Endpoint", False, 
                                f"API returned success=false: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError as e:
                self.log_test("Current Subscription Endpoint", False, f"Invalid JSON response: {str(e)}")
                return False
        else:
            self.log_test("Current Subscription Endpoint", False, 
                        f"HTTP {response.status_code}: {response.text[:200]}")
            return False
    
    def test_stripe_checkout_session_creation(self):
        """Test POST /api/subscription/checkout - Create Stripe checkout session"""
        print("🔍 Testing Stripe Checkout Session Creation...")
        
        if not self.workspace_id:
            self.log_test("Stripe Checkout Session Creation", False, "No workspace ID available")
            return False
        
        checkout_data = {
            "plan_id": "professional",
            "billing_cycle": "monthly",
            "feature_count": 3,
            "workspace_id": self.workspace_id,
            "success_url": "http://localhost:4028/subscription/success",
            "cancel_url": "http://localhost:4028/subscription/cancel"
        }
        
        response, error = self.make_request('POST', '/subscription/checkout', checkout_data)
        
        if error:
            self.log_test("Stripe Checkout Session Creation", False, f"Request failed: {error}")
            return False
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Raw Response: {response.text[:1000]}...")
        
        if response.status_code in [200, 201]:
            try:
                result = response.json()
                print(f"Parsed JSON: {json.dumps(result, indent=2)}")
                
                if result.get('success'):
                    checkout_url = result.get('checkout_url')
                    session_id = result.get('session_id')
                    
                    if checkout_url:
                        if checkout_url.startswith('https://checkout.stripe.com/'):
                            self.log_test("Stripe Checkout Session Creation", True, 
                                        f"Valid Stripe checkout URL created: {checkout_url[:50]}...")
                            return True
                        else:
                            self.log_test("Stripe Checkout Session Creation", False, 
                                        f"Invalid checkout URL format: {checkout_url}")
                            return False
                    else:
                        self.log_test("Stripe Checkout Session Creation", False, 
                                    "Missing checkout_url in response")
                        return False
                else:
                    self.log_test("Stripe Checkout Session Creation", False, 
                                f"API returned success=false: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError as e:
                self.log_test("Stripe Checkout Session Creation", False, f"Invalid JSON response: {str(e)}")
                return False
        else:
            self.log_test("Stripe Checkout Session Creation", False, 
                        f"HTTP {response.status_code}: {response.text[:500]}")
            return False
    
    def test_free_plan_subscription_creation(self):
        """Test free plan subscription creation (no payment required)"""
        print("🔍 Testing Free Plan Subscription Creation...")
        
        free_subscription_data = {
            "plan_id": "free",
            "selected_features": ["basic_features"]  # Free plan features
        }
        
        response, error = self.make_request('POST', '/subscription/subscribe', free_subscription_data)
        
        if error:
            self.log_test("Free Plan Subscription Creation", False, f"Request failed: {error}")
            return False
        
        print(f"Response Status: {response.status_code}")
        print(f"Raw Response: {response.text[:500]}...")
        
        if response.status_code in [200, 201]:
            try:
                result = response.json()
                print(f"Parsed JSON: {json.dumps(result, indent=2)}")
                
                if result.get('success'):
                    subscription = result.get('subscription')
                    if subscription and subscription.get('plan') == 'free':
                        self.log_test("Free Plan Subscription Creation", True, 
                                    "Free plan subscription created without payment")
                        return True
                    else:
                        self.log_test("Free Plan Subscription Creation", False, 
                                    f"Invalid subscription response: {subscription}")
                        return False
                else:
                    self.log_test("Free Plan Subscription Creation", False, 
                                f"API returned success=false: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError as e:
                self.log_test("Free Plan Subscription Creation", False, f"Invalid JSON response: {str(e)}")
                return False
        else:
            # Free plan creation might not be implemented as separate endpoint
            self.log_test("Free Plan Subscription Creation", False, 
                        f"HTTP {response.status_code}: {response.text[:200]} (endpoint may not exist)")
            return False
    
    def test_subscription_usage_stats(self):
        """Test GET /api/subscription/usage - Get subscription usage stats"""
        print("🔍 Testing Subscription Usage Stats...")
        
        response, error = self.make_request('GET', '/subscription/usage')
        
        if error:
            self.log_test("Subscription Usage Stats", False, f"Request failed: {error}")
            return False
        
        print(f"Response Status: {response.status_code}")
        print(f"Raw Response: {response.text[:500]}...")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"Parsed JSON: {json.dumps(result, indent=2)}")
                
                if result.get('success'):
                    usage = result.get('usage')
                    if usage and 'features_used' in usage:
                        self.log_test("Subscription Usage Stats", True, 
                                    f"Usage stats retrieved: {usage.get('features_used', 0)} features used")
                        return True
                    else:
                        self.log_test("Subscription Usage Stats", False, 
                                    f"Invalid usage format: {usage}")
                        return False
                else:
                    # This might be expected if no subscription exists
                    message = result.get('message', 'Unknown error')
                    if 'no subscription' in message.lower():
                        self.log_test("Subscription Usage Stats", True, 
                                    "No subscription found (expected for new user)")
                        return True
                    else:
                        self.log_test("Subscription Usage Stats", False, 
                                    f"API returned success=false: {message}")
                        return False
            except json.JSONDecodeError as e:
                self.log_test("Subscription Usage Stats", False, f"Invalid JSON response: {str(e)}")
                return False
        elif response.status_code == 404:
            # This might be expected if no subscription exists
            try:
                result = response.json()
                if 'no subscription' in result.get('message', '').lower():
                    self.log_test("Subscription Usage Stats", True, 
                                "No subscription found (expected for new user)")
                    return True
            except:
                pass
            self.log_test("Subscription Usage Stats", False, 
                        f"HTTP 404: {response.text[:200]}")
            return False
        else:
            self.log_test("Subscription Usage Stats", False, 
                        f"HTTP {response.status_code}: {response.text[:200]}")
            return False
    
    def test_workspace_setup_progress(self):
        """Test workspace setup progress management"""
        print("🔍 Testing Workspace Setup Progress Management...")
        
        if not self.workspace_id:
            self.log_test("Workspace Setup Progress", False, "No workspace ID available")
            return False
        
        # Test saving setup progress with correct format
        progress_data = {
            "step": 2,
            "data": {
                "selected_goals": ["social_media_growth", "lead_generation"],
                "selected_features": ["instagram_management", "crm_system"],
                "subscription_plan": "professional",
                "progress_percentage": 80
            }
        }
        
        response, error = self.make_request('POST', f'/workspaces/{self.workspace_id}/setup-progress', progress_data)
        
        if error:
            self.log_test("Workspace Setup Progress", False, f"Request failed: {error}")
            return False
        
        print(f"Response Status: {response.status_code}")
        print(f"Raw Response: {response.text[:500]}...")
        
        if response.status_code in [200, 201]:
            try:
                result = response.json()
                print(f"Parsed JSON: {json.dumps(result, indent=2)}")
                
                if result.get('success'):
                    # Test retrieving setup progress
                    get_response, get_error = self.make_request('GET', f'/workspaces/{self.workspace_id}/setup-progress')
                    
                    if get_error or get_response.status_code != 200:
                        self.log_test("Workspace Setup Progress", False, 
                                    f"Progress retrieval failed: {get_error or get_response.text[:200]}")
                        return False
                    
                    get_result = get_response.json()
                    if get_result.get('success') and get_result.get('progress'):
                        self.log_test("Workspace Setup Progress", True, 
                                    "Setup progress save and retrieve working correctly")
                        return True
                    else:
                        self.log_test("Workspace Setup Progress", False, 
                                    f"Progress retrieval returned unexpected format: {get_result}")
                        return False
                else:
                    self.log_test("Workspace Setup Progress", False, 
                                f"API returned success=false: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError as e:
                self.log_test("Workspace Setup Progress", False, f"Invalid JSON response: {str(e)}")
                return False
        else:
            self.log_test("Workspace Setup Progress", False, 
                        f"HTTP {response.status_code}: {response.text[:500]}")
            return False
    
    def test_workspace_complete_setup(self):
        """Test workspace complete setup endpoint"""
        print("🔍 Testing Workspace Complete Setup...")
        
        if not self.workspace_id:
            self.log_test("Workspace Complete Setup", False, "No workspace ID available")
            return False
        
        setup_data = {
            "selected_goals": ["social_media_growth", "lead_generation", "e_commerce"],
            "selected_features": ["instagram_management", "crm_system", "product_management"],
            "subscription_plan": "professional",
            "setup_completed": True
        }
        
        response, error = self.make_request('POST', f'/workspaces/{self.workspace_id}/complete-setup', setup_data)
        
        if error:
            self.log_test("Workspace Complete Setup", False, f"Request failed: {error}")
            return False
        
        print(f"Response Status: {response.status_code}")
        print(f"Raw Response: {response.text[:500]}...")
        
        if response.status_code in [200, 201]:
            try:
                result = response.json()
                print(f"Parsed JSON: {json.dumps(result, indent=2)}")
                
                if result.get('success'):
                    self.log_test("Workspace Complete Setup", True, 
                                "Workspace setup completion working correctly")
                    return True
                else:
                    self.log_test("Workspace Complete Setup", False, 
                                f"API returned success=false: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError as e:
                self.log_test("Workspace Complete Setup", False, f"Invalid JSON response: {str(e)}")
                return False
        elif response.status_code == 403:
            self.log_test("Workspace Complete Setup", False, 
                        f"HTTP 403 Insufficient permissions: {response.text[:200]}")
            return False
        else:
            self.log_test("Workspace Complete Setup", False, 
                        f"HTTP {response.status_code}: {response.text[:500]}")
            return False
    
    def run_stripe_integration_tests(self):
        """Run all Stripe integration tests"""
        print("🚀 Starting Stripe Integration Testing...")
        print("=" * 60)
        
        # Setup authentication
        if not self.setup_authentication():
            print("❌ Failed to setup authentication. Aborting tests.")
            return
        
        print("\n" + "=" * 60)
        print("🔧 STRIPE INTEGRATION TESTS")
        print("=" * 60)
        
        # Test subscription management endpoints
        self.test_subscription_plans_endpoint()
        self.test_current_subscription_endpoint()
        self.test_stripe_checkout_session_creation()
        self.test_free_plan_subscription_creation()
        self.test_subscription_usage_stats()
        
        # Test workspace setup integration
        self.test_workspace_setup_progress()
        self.test_workspace_complete_setup()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 STRIPE INTEGRATION TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Tests Passed: {passed}/{total} ({(passed/total)*100:.1f}%)")
        print()
        
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}")
            if result['message']:
                print(f"    {result['message']}")
        
        print("\n" + "=" * 60)
        
        if passed == total:
            print("🎉 ALL STRIPE INTEGRATION TESTS PASSED!")
        else:
            print(f"⚠️  {total - passed} TESTS FAILED - STRIPE INTEGRATION NEEDS ATTENTION")
        
        return passed == total

if __name__ == "__main__":
    tester = StripeIntegrationTester()
    success = tester.run_stripe_integration_tests()
    sys.exit(0 if success else 1)