#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Mewayz Laravel Application
Tests all API endpoints and functionality - Focus on Social Media and Link in Bio Features
"""

import requests
import json
import sys
import time
from datetime import datetime, timedelta

class MewayzBackendTester:
    def __init__(self):
        self.base_url = "http://localhost:8001/api"
        self.token = None
        self.user_id = None
        self.workspace_id = None
        self.social_account_id = None
        self.social_post_id = None
        self.link_page_id = None
        self.test_results = []
        self.timestamp = int(time.time())
        
    def log_test(self, test_name, status, message="", details=None):
        """Log test results"""
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status_symbol = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_symbol} {test_name}: {message}")
        if details and status == "FAIL":
            print(f"   Details: {details}")
    
    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        if self.token:
            default_headers["Authorization"] = f"Bearer {self.token}"
        
        if headers:
            default_headers.update(headers)
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=default_headers, timeout=10)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=default_headers, timeout=10)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=default_headers, timeout=10)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=default_headers, timeout=10)
            else:
                return None, f"Unsupported method: {method}"
            
            return response, None
        except requests.exceptions.RequestException as e:
            return None, str(e)
    
    def test_user_registration(self):
        """Test user registration endpoint"""
        test_data = {
            "name": "Emma Wilson",
            "email": f"emma.wilson.{self.timestamp}@mewayz.com",
            "password": "SecurePassword123!"
        }
        
        response, error = self.make_request("POST", "/auth/register", test_data)
        
        if error:
            self.log_test("User Registration", "FAIL", f"Request failed: {error}")
            return False
        
        if response.status_code == 201:
            try:
                data = response.json()
                if data.get("success") and data.get("token") and data.get("user"):
                    self.token = data["token"]
                    self.user_id = data["user"]["id"]
                    self.log_test("User Registration", "PASS", "User registered successfully")
                    return True
                else:
                    self.log_test("User Registration", "FAIL", "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("User Registration", "FAIL", "Invalid JSON response", response.text[:200])
                return False
        else:
            try:
                error_data = response.json()
                self.log_test("User Registration", "FAIL", f"HTTP {response.status_code}", error_data)
            except:
                self.log_test("User Registration", "FAIL", f"HTTP {response.status_code}", response.text[:200])
            return False
    
    def test_user_login(self):
        """Test user login endpoint"""
        test_data = {
            "email": f"emma.wilson.{self.timestamp}@mewayz.com",
            "password": "SecurePassword123!"
        }
        
        response, error = self.make_request("POST", "/auth/login", test_data)
        
        if error:
            self.log_test("User Login", "FAIL", f"Request failed: {error}")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.token = data["token"]
                    self.log_test("User Login", "PASS", "User logged in successfully")
                    return True
                else:
                    self.log_test("User Login", "FAIL", "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("User Login", "FAIL", "Invalid JSON response", response.text[:200])
                return False
        else:
            try:
                error_data = response.json()
                self.log_test("User Login", "FAIL", f"HTTP {response.status_code}", error_data)
            except:
                self.log_test("User Login", "FAIL", f"HTTP {response.status_code}", response.text[:200])
            return False
    
    def test_get_authenticated_user(self):
        """Test get authenticated user endpoint"""
        if not self.token:
            self.log_test("Get Authenticated User", "SKIP", "No authentication token")
            return False
        
        response, error = self.make_request("GET", "/auth/user")
        
        if error:
            self.log_test("Get Authenticated User", "FAIL", f"Request failed: {error}")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and data.get("user"):
                    self.log_test("Get Authenticated User", "PASS", "User data retrieved successfully")
                    return True
                else:
                    self.log_test("Get Authenticated User", "FAIL", "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Get Authenticated User", "FAIL", "Invalid JSON response", response.text[:200])
                return False
        else:
            self.log_test("Get Authenticated User", "FAIL", f"HTTP {response.status_code}", response.text[:200])
            return False
    
    def test_workspace_setup(self):
        """Create a workspace for testing social media features"""
        if not self.token:
            self.log_test("Workspace Setup", "SKIP", "No authentication token")
            return False
        
        workspace_data = {
            "name": f"Creative Studio Workspace {self.timestamp}",
            "description": "A workspace for testing social media and link in bio features"
        }
        
        response, error = self.make_request("POST", "/workspaces", workspace_data)
        
        if error:
            self.log_test("Workspace Setup", "FAIL", f"Request failed: {error}")
            return False
        
        if response.status_code in [200, 201]:
            try:
                data = response.json()
                if data.get("success") and data.get("workspace"):
                    self.workspace_id = data["workspace"]["id"]
                    self.log_test("Workspace Setup", "PASS", "Workspace created successfully")
                    return True
                else:
                    self.log_test("Workspace Setup", "FAIL", "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Workspace Setup", "FAIL", "Invalid JSON response", response.text[:200])
                return False
        else:
            try:
                error_data = response.json()
                self.log_test("Workspace Setup", "FAIL", f"HTTP {response.status_code}", error_data)
            except:
                self.log_test("Workspace Setup", "FAIL", f"HTTP {response.status_code}", response.text[:200])
            return False
    
    def test_social_media_account_endpoints(self):
        """Test social media account CRUD endpoints with comprehensive data"""
        if not self.token or not self.workspace_id:
            self.log_test("Social Media Account Endpoints", "SKIP", "No authentication token or workspace")
            return False
        
        # Test GET /social-media-accounts (index)
        response, error = self.make_request("GET", f"/social-media-accounts?workspace_id={self.workspace_id}")
        if error:
            self.log_test("Social Media Accounts Index", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and "accounts" in data:
                    self.log_test("Social Media Accounts Index", "PASS", f"Retrieved {len(data['accounts'])} accounts")
                else:
                    self.log_test("Social Media Accounts Index", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Social Media Accounts Index", "FAIL", "Invalid JSON response", response.text[:200])
        else:
            self.log_test("Social Media Accounts Index", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        # Test POST /social-media-accounts (store)
        account_data = {
            "workspace_id": self.workspace_id,
            "platform": "instagram",
            "account_id": f"creative_studio_{self.timestamp}",
            "username": f"@creativestudio{self.timestamp}",
            "display_name": f"Creative Studio {self.timestamp}",
            "profile_picture": "https://example.com/profile.jpg",
            "access_tokens": {
                "access_token": "fake_access_token_123",
                "refresh_token": "fake_refresh_token_456"
            },
            "account_info": {
                "followers_count": 15000,
                "following_count": 500,
                "posts_count": 250
            }
        }
        
        response, error = self.make_request("POST", "/social-media-accounts", account_data)
        if error:
            self.log_test("Social Media Account Create", "FAIL", f"Request failed: {error}")
        elif response.status_code in [200, 201]:
            try:
                data = response.json()
                if data.get("success") and data.get("account"):
                    self.social_account_id = data["account"]["id"]
                    self.log_test("Social Media Account Create", "PASS", "Account created successfully")
                    return True
                else:
                    self.log_test("Social Media Account Create", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Social Media Account Create", "FAIL", "Invalid JSON response", response.text[:200])
        else:
            try:
                error_data = response.json()
                self.log_test("Social Media Account Create", "FAIL", f"HTTP {response.status_code}", error_data)
            except:
                self.log_test("Social Media Account Create", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        return False
    
    def test_link_in_bio_endpoints(self):
        """Test link in bio page CRUD endpoints with comprehensive data"""
        if not self.token or not self.workspace_id:
            self.log_test("Link in Bio Endpoints", "SKIP", "No authentication token or workspace")
            return False
        
        # Test GET /link-in-bio-pages (index)
        response, error = self.make_request("GET", f"/link-in-bio-pages?workspace_id={self.workspace_id}")
        if error:
            self.log_test("Link in Bio Pages Index", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and "pages" in data:
                    self.log_test("Link in Bio Pages Index", "PASS", f"Retrieved {len(data['pages'])} pages")
                else:
                    self.log_test("Link in Bio Pages Index", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Link in Bio Pages Index", "FAIL", "Invalid JSON response", response.text[:200])
        else:
            self.log_test("Link in Bio Pages Index", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        # Test POST /link-in-bio-pages (store)
        page_data = {
            "workspace_id": self.workspace_id,
            "title": f"Emma's Creative Portfolio {self.timestamp}",
            "slug": f"emma-creative-portfolio-{self.timestamp}",
            "description": "Creative designer & entrepreneur showcasing amazing projects and services",
            "profile_image": "https://example.com/emma-profile.jpg",
            "background_image": "https://example.com/creative-bg.jpg",
            "theme_settings": {
                "primary_color": "#6366f1",
                "secondary_color": "#8b5cf6",
                "background_color": "#f8fafc",
                "text_color": "#1e293b",
                "button_style": "rounded",
                "font_family": "Inter"
            },
            "links": [
                {
                    "title": "Portfolio Website",
                    "url": "https://emmacreative.com",
                    "description": "Check out my latest creative projects",
                    "icon": "globe",
                    "is_active": True,
                    "order": 0
                },
                {
                    "title": "Instagram",
                    "url": "https://instagram.com/emmacreative",
                    "description": "Follow my creative journey",
                    "icon": "instagram",
                    "is_active": True,
                    "order": 1
                }
            ],
            "is_active": True
        }
        
        response, error = self.make_request("POST", "/link-in-bio-pages", page_data)
        if error:
            self.log_test("Link in Bio Page Create", "FAIL", f"Request failed: {error}")
        elif response.status_code in [200, 201]:
            try:
                data = response.json()
                if data.get("success") and data.get("page"):
                    self.link_page_id = data["page"]["id"]
                    self.log_test("Link in Bio Page Create", "PASS", "Page created successfully")
                    return True
                else:
                    self.log_test("Link in Bio Page Create", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Link in Bio Page Create", "FAIL", "Invalid JSON response", response.text[:200])
        else:
            try:
                error_data = response.json()
                self.log_test("Link in Bio Page Create", "FAIL", f"HTTP {response.status_code}", error_data)
            except:
                self.log_test("Link in Bio Page Create", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        return False
    
    def test_crm_contacts_endpoints(self):
        """Test CRM contacts endpoints"""
        if not self.token or not self.workspace_id:
            self.log_test("CRM Contacts Endpoints", "SKIP", "No authentication token or workspace")
            return False
        
        # Test GET /crm-contacts (index)
        response, error = self.make_request("GET", f"/crm-contacts?workspace_id={self.workspace_id}")
        if error:
            self.log_test("CRM Contacts Index", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and "contacts" in data:
                    self.log_test("CRM Contacts Index", "PASS", f"Retrieved contacts successfully")
                else:
                    self.log_test("CRM Contacts Index", "WARN", "Likely unimplemented - empty methods", data)
            except json.JSONDecodeError:
                self.log_test("CRM Contacts Index", "WARN", "Likely unimplemented - empty methods", response.text[:200])
        else:
            self.log_test("CRM Contacts Index", "WARN", f"Likely unimplemented - HTTP {response.status_code}", response.text[:200])
    
    def test_courses_endpoints(self):
        """Test courses endpoints"""
        if not self.token or not self.workspace_id:
            self.log_test("Courses Endpoints", "SKIP", "No authentication token or workspace")
            return False
        
        # Test GET /courses (index)
        response, error = self.make_request("GET", f"/courses?workspace_id={self.workspace_id}")
        if error:
            self.log_test("Courses Index", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and "courses" in data:
                    self.log_test("Courses Index", "PASS", f"Retrieved courses successfully")
                else:
                    self.log_test("Courses Index", "WARN", "Likely unimplemented - empty methods", data)
            except json.JSONDecodeError:
                self.log_test("Courses Index", "WARN", "Likely unimplemented - empty methods", response.text[:200])
        else:
            self.log_test("Courses Index", "WARN", f"Likely unimplemented - HTTP {response.status_code}", response.text[:200])
    
    def test_products_endpoints(self):
        """Test products endpoints"""
        if not self.token or not self.workspace_id:
            self.log_test("Products Endpoints", "SKIP", "No authentication token or workspace")
            return False
        
        # Test GET /products (index)
        response, error = self.make_request("GET", f"/products?workspace_id={self.workspace_id}")
        if error:
            self.log_test("Products Index", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and "products" in data:
                    self.log_test("Products Index", "PASS", f"Retrieved products successfully")
                else:
                    self.log_test("Products Index", "WARN", "Likely unimplemented - empty methods", data)
            except json.JSONDecodeError:
                self.log_test("Products Index", "WARN", "Likely unimplemented - empty methods", response.text[:200])
        else:
            self.log_test("Products Index", "WARN", f"Likely unimplemented - HTTP {response.status_code}", response.text[:200])
    
    def test_user_logout(self):
        """Test user logout endpoint"""
        if not self.token:
            self.log_test("User Logout", "SKIP", "No authentication token")
            return False
        
        response, error = self.make_request("POST", "/auth/logout")
        
        if error:
            self.log_test("User Logout", "FAIL", f"Request failed: {error}")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success"):
                    self.log_test("User Logout", "PASS", "User logged out successfully")
                    self.token = None  # Clear token after logout
                    return True
                else:
                    self.log_test("User Logout", "FAIL", "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("User Logout", "FAIL", "Invalid JSON response", response.text[:200])
                return False
        else:
            self.log_test("User Logout", "FAIL", f"HTTP {response.status_code}", response.text[:200])
            return False
    
    def run_all_tests(self):
        """Run all backend tests with focus on implemented features"""
        print("🚀 Starting Mewayz Backend Testing - Comprehensive Feature Testing...")
        print("=" * 80)
        
        # Authentication tests
        print("\n📝 Testing Authentication Endpoints...")
        self.test_user_registration()
        self.test_user_login()
        self.test_get_authenticated_user()
        
        # Workspace setup for feature testing
        print("\n🏢 Setting up Workspace for Feature Testing...")
        self.test_workspace_setup()
        
        # Social Media Account tests
        print("\n📱 Testing Social Media Account Endpoints...")
        self.test_social_media_account_endpoints()
        
        # Link in Bio tests
        print("\n🔗 Testing Link in Bio Endpoints...")
        self.test_link_in_bio_endpoints()
        
        # Test unimplemented features
        print("\n⚠️  Testing Unimplemented Features...")
        self.test_crm_contacts_endpoints()
        self.test_courses_endpoints()
        self.test_products_endpoints()
        
        # Logout test
        print("\n🚪 Testing Logout...")
        self.test_user_logout()
        
        # Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["status"] == "PASS")
        failed = sum(1 for result in self.test_results if result["status"] == "FAIL")
        warnings = sum(1 for result in self.test_results if result["status"] == "WARN")
        skipped = sum(1 for result in self.test_results if result["status"] == "SKIP")
        
        total = len(self.test_results)
        
        print(f"✅ PASSED: {passed}")
        print(f"❌ FAILED: {failed}")
        print(f"⚠️  WARNINGS: {warnings}")
        print(f"⏭️  SKIPPED: {skipped}")
        print(f"📈 TOTAL: {total}")
        
        if failed > 0:
            print(f"\n❌ CRITICAL FAILURES:")
            for result in self.test_results:
                if result["status"] == "FAIL":
                    print(f"   • {result['test']}: {result['message']}")
        
        if warnings > 0:
            print(f"\n⚠️  WARNINGS (Likely Unimplemented Features):")
            for result in self.test_results:
                if result["status"] == "WARN":
                    print(f"   • {result['test']}: {result['message']}")
        
        print(f"\n🎯 SUCCESS RATE: {(passed / total * 100):.1f}%")
        
        # Overall status
        if failed == 0 and passed > 0:
            print("🎉 OVERALL STATUS: BACKEND CORE FUNCTIONALITY WORKING")
        elif failed > 0 and passed > failed:
            print("⚠️  OVERALL STATUS: BACKEND PARTIALLY WORKING - SOME ISSUES FOUND")
        else:
            print("❌ OVERALL STATUS: BACKEND HAS CRITICAL ISSUES")

if __name__ == "__main__":
    tester = MewayzBackendTester()
    tester.run_all_tests()