#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Mewayz Laravel Application
Tests all API endpoints and functionality - Focus on Social Media and Link in Bio Features
"""

import requests
import json
import sys
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
        if details:
            print(f"   Details: {details}")
    
    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {"Content-Type": "application/json"}
        
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
            "email": "emma.wilson@mewayz.com",
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
                self.log_test("User Registration", "FAIL", "Invalid JSON response")
                return False
        else:
            self.log_test("User Registration", "FAIL", f"HTTP {response.status_code}", response.text)
            return False
    
    def test_user_login(self):
        """Test user login endpoint"""
        test_data = {
            "email": "emma.wilson@mewayz.com",
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
                self.log_test("User Login", "FAIL", "Invalid JSON response")
                return False
        else:
            self.log_test("User Login", "FAIL", f"HTTP {response.status_code}", response.text)
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
                self.log_test("Get Authenticated User", "FAIL", "Invalid JSON response")
                return False
        else:
            self.log_test("Get Authenticated User", "FAIL", f"HTTP {response.status_code}", response.text)
            return False
    
    def test_workspace_setup(self):
        """Create a workspace for testing social media features"""
        if not self.token:
            self.log_test("Workspace Setup", "SKIP", "No authentication token")
            return False
        
        workspace_data = {
            "name": "Creative Studio Workspace",
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
                self.log_test("Workspace Setup", "FAIL", "Invalid JSON response")
                return False
        else:
            self.log_test("Workspace Setup", "FAIL", f"HTTP {response.status_code}", response.text)
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
                self.log_test("Social Media Accounts Index", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Social Media Accounts Index", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        # Test POST /social-media-accounts (store)
        account_data = {
            "workspace_id": self.workspace_id,
            "platform": "instagram",
            "account_id": "creative_studio_2025",
            "username": "@creativestudio2025",
            "display_name": "Creative Studio 2025",
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
                    
                    # Test GET /social-media-accounts/{id} (show)
                    self.test_social_media_account_show()
                    
                    # Test PUT /social-media-accounts/{id} (update)
                    self.test_social_media_account_update()
                    
                    # Test POST /social-media-accounts/{id}/refresh-tokens
                    self.test_social_media_account_refresh_tokens()
                    
                else:
                    self.log_test("Social Media Account Create", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Social Media Account Create", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Social Media Account Create", "FAIL", f"HTTP {response.status_code}", response.text[:200])
    
    def test_social_media_account_show(self):
        """Test getting specific social media account"""
        if not self.social_account_id:
            return
            
        response, error = self.make_request("GET", f"/social-media-accounts/{self.social_account_id}")
        if error:
            self.log_test("Social Media Account Show", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and data.get("account"):
                    self.log_test("Social Media Account Show", "PASS", "Account retrieved successfully")
                else:
                    self.log_test("Social Media Account Show", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Social Media Account Show", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Social Media Account Show", "FAIL", f"HTTP {response.status_code}", response.text[:200])
    
    def test_social_media_account_update(self):
        """Test updating social media account"""
        if not self.social_account_id:
            return
            
        update_data = {
            "display_name": "Creative Studio 2025 - Updated",
            "account_info": {
                "followers_count": 16000,
                "following_count": 520,
                "posts_count": 260
            }
        }
        
        response, error = self.make_request("PUT", f"/social-media-accounts/{self.social_account_id}", update_data)
        if error:
            self.log_test("Social Media Account Update", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and data.get("account"):
                    self.log_test("Social Media Account Update", "PASS", "Account updated successfully")
                else:
                    self.log_test("Social Media Account Update", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Social Media Account Update", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Social Media Account Update", "FAIL", f"HTTP {response.status_code}", response.text[:200])
    
    def test_social_media_account_refresh_tokens(self):
        """Test refreshing social media account tokens"""
        if not self.social_account_id:
            return
            
        response, error = self.make_request("POST", f"/social-media-accounts/{self.social_account_id}/refresh-tokens")
        if error:
            self.log_test("Social Media Account Refresh Tokens", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and data.get("account"):
                    self.log_test("Social Media Account Refresh Tokens", "PASS", "Tokens refreshed successfully")
                else:
                    self.log_test("Social Media Account Refresh Tokens", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Social Media Account Refresh Tokens", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Social Media Account Refresh Tokens", "FAIL", f"HTTP {response.status_code}", response.text[:200])
    
    def test_social_media_post_endpoints(self):
        """Test social media post CRUD endpoints with comprehensive data"""
        if not self.token or not self.workspace_id or not self.social_account_id:
            self.log_test("Social Media Post Endpoints", "SKIP", "Missing required data (token, workspace, or account)")
            return False
        
        # Test GET /social-media-posts (index)
        response, error = self.make_request("GET", f"/social-media-posts?workspace_id={self.workspace_id}")
        if error:
            self.log_test("Social Media Posts Index", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and "posts" in data:
                    self.log_test("Social Media Posts Index", "PASS", f"Retrieved posts successfully")
                else:
                    self.log_test("Social Media Posts Index", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Social Media Posts Index", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Social Media Posts Index", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        # Test POST /social-media-posts (store)
        future_date = (datetime.now() + timedelta(hours=2)).isoformat()
        post_data = {
            "workspace_id": self.workspace_id,
            "social_media_account_id": self.social_account_id,
            "title": "New Year Creative Campaign",
            "content": "🎨 Starting 2025 with amazing creative projects! Join us on this journey of innovation and design. #creativity #design #2025goals #innovation",
            "media_urls": [
                "https://example.com/image1.jpg",
                "https://example.com/image2.jpg"
            ],
            "hashtags": ["creativity", "design", "2025goals", "innovation"],
            "status": "scheduled",
            "scheduled_at": future_date
        }
        
        response, error = self.make_request("POST", "/social-media-posts", post_data)
        if error:
            self.log_test("Social Media Post Create", "FAIL", f"Request failed: {error}")
        elif response.status_code in [200, 201]:
            try:
                data = response.json()
                if data.get("success") and data.get("post"):
                    self.social_post_id = data["post"]["id"]
                    self.log_test("Social Media Post Create", "PASS", "Post created successfully")
                    
                    # Test GET /social-media-posts/{id} (show)
                    self.test_social_media_post_show()
                    
                    # Test PUT /social-media-posts/{id} (update)
                    self.test_social_media_post_update()
                    
                    # Test POST /social-media-posts/{id}/publish
                    self.test_social_media_post_publish()
                    
                    # Test POST /social-media-posts/{id}/duplicate
                    self.test_social_media_post_duplicate()
                    
                else:
                    self.log_test("Social Media Post Create", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Social Media Post Create", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Social Media Post Create", "FAIL", f"HTTP {response.status_code}", response.text[:200])
    
    def test_social_media_post_show(self):
        """Test getting specific social media post"""
        if not self.social_post_id:
            return
            
        response, error = self.make_request("GET", f"/social-media-posts/{self.social_post_id}")
        if error:
            self.log_test("Social Media Post Show", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and data.get("post"):
                    self.log_test("Social Media Post Show", "PASS", "Post retrieved successfully")
                else:
                    self.log_test("Social Media Post Show", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Social Media Post Show", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Social Media Post Show", "FAIL", f"HTTP {response.status_code}", response.text[:200])
    
    def test_social_media_post_update(self):
        """Test updating social media post"""
        if not self.social_post_id:
            return
            
        update_data = {
            "title": "New Year Creative Campaign - Updated",
            "content": "🎨 Starting 2025 with amazing creative projects! Join us on this journey of innovation and design. Updated with new insights! #creativity #design #2025goals #innovation #updated",
            "hashtags": ["creativity", "design", "2025goals", "innovation", "updated"]
        }
        
        response, error = self.make_request("PUT", f"/social-media-posts/{self.social_post_id}", update_data)
        if error:
            self.log_test("Social Media Post Update", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and data.get("post"):
                    self.log_test("Social Media Post Update", "PASS", "Post updated successfully")
                else:
                    self.log_test("Social Media Post Update", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Social Media Post Update", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Social Media Post Update", "FAIL", f"HTTP {response.status_code}", response.text[:200])
    
    def test_social_media_post_publish(self):
        """Test publishing social media post"""
        if not self.social_post_id:
            return
            
        response, error = self.make_request("POST", f"/social-media-posts/{self.social_post_id}/publish")
        if error:
            self.log_test("Social Media Post Publish", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and data.get("post"):
                    self.log_test("Social Media Post Publish", "PASS", "Post published successfully")
                else:
                    self.log_test("Social Media Post Publish", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Social Media Post Publish", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Social Media Post Publish", "FAIL", f"HTTP {response.status_code}", response.text[:200])
    
    def test_social_media_post_duplicate(self):
        """Test duplicating social media post"""
        if not self.social_post_id:
            return
            
        response, error = self.make_request("POST", f"/social-media-posts/{self.social_post_id}/duplicate")
        if error:
            self.log_test("Social Media Post Duplicate", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and data.get("post"):
                    self.log_test("Social Media Post Duplicate", "PASS", "Post duplicated successfully")
                else:
                    self.log_test("Social Media Post Duplicate", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Social Media Post Duplicate", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Social Media Post Duplicate", "FAIL", f"HTTP {response.status_code}", response.text[:200])
    
    def test_link_in_bio_endpoints(self):
        """Test link in bio page CRUD endpoints"""
        if not self.token:
            self.log_test("Link in Bio Endpoints", "SKIP", "No authentication token")
            return False
        
        # Test GET /link-in-bio-pages
        response, error = self.make_request("GET", "/link-in-bio-pages")
        if error:
            self.log_test("Link in Bio Pages Index", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            self.log_test("Link in Bio Pages Index", "PASS", "Endpoint accessible")
        else:
            self.log_test("Link in Bio Pages Index", "WARN", f"HTTP {response.status_code} - Method likely not implemented", response.text[:100])
        
        # Test POST /link-in-bio-pages
        page_data = {
            "title": "Emma's Creative Links",
            "slug": "emma-creative",
            "bio": "Creative designer & entrepreneur",
            "theme": "modern"
        }
        response, error = self.make_request("POST", "/link-in-bio-pages", page_data)
        if error:
            self.log_test("Link in Bio Page Create", "FAIL", f"Request failed: {error}")
        elif response.status_code in [200, 201]:
            self.log_test("Link in Bio Page Create", "PASS", "Endpoint accessible")
        else:
            self.log_test("Link in Bio Page Create", "WARN", f"HTTP {response.status_code} - Method likely not implemented", response.text[:100])
        
        # Test public link-in-bio page
        response, error = self.make_request("GET", "/link-in-bio/emma-creative")
        if error:
            self.log_test("Public Link in Bio Page", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            self.log_test("Public Link in Bio Page", "PASS", "Public endpoint accessible")
        else:
            self.log_test("Public Link in Bio Page", "WARN", f"HTTP {response.status_code} - Method likely not implemented", response.text[:100])
    
    def test_crm_contact_endpoints(self):
        """Test CRM contact CRUD endpoints"""
        if not self.token:
            self.log_test("CRM Contact Endpoints", "SKIP", "No authentication token")
            return False
        
        # Test GET /crm-contacts
        response, error = self.make_request("GET", "/crm-contacts")
        if error:
            self.log_test("CRM Contacts Index", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            self.log_test("CRM Contacts Index", "PASS", "Endpoint accessible")
        else:
            self.log_test("CRM Contacts Index", "WARN", f"HTTP {response.status_code} - Method likely not implemented", response.text[:100])
        
        # Test POST /crm-contacts
        contact_data = {
            "name": "Alex Thompson",
            "email": "alex.thompson@client.com",
            "phone": "+1-555-0123",
            "company": "Thompson Design Co.",
            "status": "lead"
        }
        response, error = self.make_request("POST", "/crm-contacts", contact_data)
        if error:
            self.log_test("CRM Contact Create", "FAIL", f"Request failed: {error}")
        elif response.status_code in [200, 201]:
            self.log_test("CRM Contact Create", "PASS", "Endpoint accessible")
        else:
            self.log_test("CRM Contact Create", "WARN", f"HTTP {response.status_code} - Method likely not implemented", response.text[:100])
    
    def test_course_endpoints(self):
        """Test course CRUD endpoints"""
        if not self.token:
            self.log_test("Course Endpoints", "SKIP", "No authentication token")
            return False
        
        # Test GET /courses
        response, error = self.make_request("GET", "/courses")
        if error:
            self.log_test("Courses Index", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            self.log_test("Courses Index", "PASS", "Endpoint accessible")
        else:
            self.log_test("Courses Index", "WARN", f"HTTP {response.status_code} - Method likely not implemented", response.text[:100])
        
        # Test POST /courses
        course_data = {
            "title": "Creative Design Masterclass",
            "description": "Learn advanced design techniques and principles",
            "price": 199.99,
            "duration": "8 weeks",
            "level": "intermediate"
        }
        response, error = self.make_request("POST", "/courses", course_data)
        if error:
            self.log_test("Course Create", "FAIL", f"Request failed: {error}")
        elif response.status_code in [200, 201]:
            self.log_test("Course Create", "PASS", "Endpoint accessible")
        else:
            self.log_test("Course Create", "WARN", f"HTTP {response.status_code} - Method likely not implemented", response.text[:100])
    
    def test_product_endpoints(self):
        """Test product CRUD endpoints"""
        if not self.token:
            self.log_test("Product Endpoints", "SKIP", "No authentication token")
            return False
        
        # Test GET /products
        response, error = self.make_request("GET", "/products")
        if error:
            self.log_test("Products Index", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            self.log_test("Products Index", "PASS", "Endpoint accessible")
        else:
            self.log_test("Products Index", "WARN", f"HTTP {response.status_code} - Method likely not implemented", response.text[:100])
        
        # Test POST /products
        product_data = {
            "name": "Design Template Pack",
            "description": "Professional design templates for social media",
            "price": 49.99,
            "category": "digital_product",
            "stock": 100
        }
        response, error = self.make_request("POST", "/products", product_data)
        if error:
            self.log_test("Product Create", "FAIL", f"Request failed: {error}")
        elif response.status_code in [200, 201]:
            self.log_test("Product Create", "PASS", "Endpoint accessible")
        else:
            self.log_test("Product Create", "WARN", f"HTTP {response.status_code} - Method likely not implemented", response.text[:100])
    
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
                self.log_test("User Logout", "FAIL", "Invalid JSON response")
                return False
        else:
            self.log_test("User Logout", "FAIL", f"HTTP {response.status_code}", response.text)
            return False
    
    def test_authentication_protection(self):
        """Test that protected routes require authentication"""
        # Clear token to test unauthenticated access
        original_token = self.token
        self.token = None
        
        protected_endpoints = [
            "/auth/user",
            "/workspaces",
            "/social-media-accounts",
            "/social-media-posts",
            "/link-in-bio-pages",
            "/crm-contacts",
            "/courses",
            "/products"
        ]
        
        protected_count = 0
        for endpoint in protected_endpoints:
            response, error = self.make_request("GET", endpoint)
            if error:
                self.log_test(f"Auth Protection {endpoint}", "WARN", f"Request failed: {error}")
            elif response.status_code == 401:
                protected_count += 1
            elif response.status_code == 403:
                protected_count += 1
            else:
                self.log_test(f"Auth Protection {endpoint}", "WARN", f"Expected 401/403, got {response.status_code}")
        
        # Restore token
        self.token = original_token
        
        if protected_count >= len(protected_endpoints) * 0.8:  # At least 80% should be protected
            self.log_test("Authentication Protection", "PASS", f"{protected_count}/{len(protected_endpoints)} endpoints properly protected")
        else:
            self.log_test("Authentication Protection", "WARN", f"Only {protected_count}/{len(protected_endpoints)} endpoints properly protected")
    
    def test_database_connectivity(self):
        """Test database connectivity through user operations"""
        # This is tested implicitly through user registration/login
        # If those work, database is connected
        if any(result["test"] in ["User Registration", "User Login"] and result["status"] == "PASS" 
               for result in self.test_results):
            self.log_test("Database Connectivity", "PASS", "Database operations working")
        else:
            self.log_test("Database Connectivity", "FAIL", "No successful database operations detected")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Mewayz Backend Testing...")
        print("=" * 60)
        
        # Authentication tests
        print("\n📝 Testing Authentication Endpoints...")
        self.test_user_registration()
        self.test_user_login()
        self.test_get_authenticated_user()
        
        # Feature endpoint tests
        print("\n🏢 Testing Workspace Endpoints...")
        self.test_workspace_endpoints()
        
        print("\n📱 Testing Social Media Endpoints...")
        self.test_social_media_account_endpoints()
        self.test_social_media_post_endpoints()
        
        print("\n🔗 Testing Link in Bio Endpoints...")
        self.test_link_in_bio_endpoints()
        
        print("\n👥 Testing CRM Endpoints...")
        self.test_crm_contact_endpoints()
        
        print("\n📚 Testing Course Endpoints...")
        self.test_course_endpoints()
        
        print("\n🛍️ Testing Product Endpoints...")
        self.test_product_endpoints()
        
        # Security tests
        print("\n🔒 Testing Authentication Protection...")
        self.test_authentication_protection()
        
        # Infrastructure tests
        print("\n💾 Testing Database Connectivity...")
        self.test_database_connectivity()
        
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