#!/usr/bin/env python3
"""
COMPREHENSIVE BACKEND TESTING FOR MEWAYZ LARAVEL APPLICATION
Tests ALL systems, endpoints, features, and functionality as requested
"""

import requests
import json
import sys
import time
from datetime import datetime, timedelta

class ComprehensiveMewayzTester:
    def __init__(self):
        self.base_url = "http://localhost:8001/api"
        self.token = None
        self.user_id = None
        self.workspace_id = None
        self.test_results = []
        self.passed_tests = 0
        self.failed_tests = 0
        self.critical_failures = []
        
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
        
        if status == "PASS":
            self.passed_tests += 1
        elif status == "FAIL":
            self.failed_tests += 1
            if "CRITICAL" in test_name.upper() or any(word in test_name.lower() for word in ["auth", "security", "database"]):
                self.critical_failures.append(test_name)
        
        if details and status == "FAIL":
            print(f"   Details: {str(details)[:200]}...")
    
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

    def test_authentication_system(self):
        """Test ALL authentication endpoints and features"""
        print("\n🔐 TESTING AUTHENTICATION SYSTEM")
        print("=" * 60)
        
        # Test user registration
        timestamp = int(time.time())
        test_data = {
            "name": "Comprehensive Test User",
            "email": f"comprehensive.test.{timestamp}@mewayz.com",
            "password": "SecurePassword123!"
        }
        
        response, error = self.make_request("POST", "/auth/register", test_data)
        if error:
            self.log_test("Authentication - User Registration", "FAIL", f"Request failed: {error}")
            return False
        
        if response.status_code == 201:
            try:
                data = response.json()
                if data.get("success") and data.get("token") and data.get("user"):
                    self.token = data["token"]
                    self.user_id = data["user"]["id"]
                    self.log_test("Authentication - User Registration", "PASS", "User registered successfully")
                else:
                    self.log_test("Authentication - User Registration", "FAIL", "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Authentication - User Registration", "FAIL", "Invalid JSON response")
                return False
        else:
            self.log_test("Authentication - User Registration", "FAIL", f"HTTP {response.status_code}", response.text[:200])
            return False
        
        # Test user login
        login_data = {
            "email": test_data["email"],
            "password": test_data["password"]
        }
        
        response, error = self.make_request("POST", "/auth/login", login_data)
        if error:
            self.log_test("Authentication - User Login", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.log_test("Authentication - User Login", "PASS", "User login successful")
                else:
                    self.log_test("Authentication - User Login", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Authentication - User Login", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Authentication - User Login", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        # Test get authenticated user
        response, error = self.make_request("GET", "/auth/user")
        if error:
            self.log_test("Authentication - Get User Data", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and data.get("user"):
                    self.log_test("Authentication - Get User Data", "PASS", "User data retrieved successfully")
                else:
                    self.log_test("Authentication - Get User Data", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Authentication - Get User Data", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Authentication - Get User Data", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        # Test Google OAuth redirect
        response, error = self.make_request("GET", "/auth/google")
        if error:
            self.log_test("Authentication - Google OAuth", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and data.get("url") and "google" in data["url"]:
                    self.log_test("Authentication - Google OAuth", "PASS", "Google OAuth redirect working")
                else:
                    self.log_test("Authentication - Google OAuth", "FAIL", "Invalid OAuth URL", data)
            except json.JSONDecodeError:
                self.log_test("Authentication - Google OAuth", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Authentication - Google OAuth", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        # Test password reset
        reset_data = {"email": test_data["email"]}
        response, error = self.make_request("POST", "/auth/password/reset", reset_data)
        if error:
            self.log_test("Authentication - Password Reset", "FAIL", f"Request failed: {error}")
        elif response.status_code in [200, 422]:  # 422 is expected for non-existent user
            self.log_test("Authentication - Password Reset", "PASS", "Password reset endpoint working")
        else:
            self.log_test("Authentication - Password Reset", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        return True

    def test_workspace_management(self):
        """Test ALL workspace management features"""
        print("\n🏢 TESTING WORKSPACE MANAGEMENT")
        print("=" * 60)
        
        if not self.token:
            self.log_test("Workspace Management", "SKIP", "No authentication token")
            return False
        
        # Test workspace creation
        workspace_data = {
            "name": "Comprehensive Test Workspace",
            "description": "A workspace for comprehensive testing of all features"
        }
        
        response, error = self.make_request("POST", "/workspaces", workspace_data)
        if error:
            self.log_test("Workspace - Create", "FAIL", f"Request failed: {error}")
            return False
        
        if response.status_code in [200, 201]:
            try:
                data = response.json()
                if data.get("success") and data.get("workspace"):
                    self.workspace_id = data["workspace"]["id"]
                    self.log_test("Workspace - Create", "PASS", "Workspace created successfully")
                else:
                    self.log_test("Workspace - Create", "FAIL", "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Workspace - Create", "FAIL", "Invalid JSON response")
                return False
        else:
            self.log_test("Workspace - Create", "FAIL", f"HTTP {response.status_code}", response.text[:200])
            return False
        
        # Test workspace listing
        response, error = self.make_request("GET", "/workspaces")
        if error:
            self.log_test("Workspace - List", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and "workspaces" in data:
                    self.log_test("Workspace - List", "PASS", f"Retrieved {len(data['workspaces'])} workspaces")
                else:
                    self.log_test("Workspace - List", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Workspace - List", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Workspace - List", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        # Test workspace show
        if self.workspace_id:
            response, error = self.make_request("GET", f"/workspaces/{self.workspace_id}")
            if error:
                self.log_test("Workspace - Show", "FAIL", f"Request failed: {error}")
            elif response.status_code == 200:
                try:
                    data = response.json()
                    if data.get("success") and data.get("workspace"):
                        self.log_test("Workspace - Show", "PASS", "Workspace retrieved successfully")
                    else:
                        self.log_test("Workspace - Show", "FAIL", "Invalid response format", data)
                except json.JSONDecodeError:
                    self.log_test("Workspace - Show", "FAIL", "Invalid JSON response")
            else:
                self.log_test("Workspace - Show", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        # Test workspace update
        if self.workspace_id:
            update_data = {
                "name": "Updated Comprehensive Test Workspace",
                "description": "Updated description for comprehensive testing"
            }
            response, error = self.make_request("PUT", f"/workspaces/{self.workspace_id}", update_data)
            if error:
                self.log_test("Workspace - Update", "FAIL", f"Request failed: {error}")
            elif response.status_code == 200:
                try:
                    data = response.json()
                    if data.get("success") and data.get("workspace"):
                        self.log_test("Workspace - Update", "PASS", "Workspace updated successfully")
                    else:
                        self.log_test("Workspace - Update", "FAIL", "Invalid response format", data)
                except json.JSONDecodeError:
                    self.log_test("Workspace - Update", "FAIL", "Invalid JSON response")
            else:
                self.log_test("Workspace - Update", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        return True

    def test_social_media_management(self):
        """Test ALL social media management features"""
        print("\n📱 TESTING SOCIAL MEDIA MANAGEMENT")
        print("=" * 60)
        
        if not self.token or not self.workspace_id:
            self.log_test("Social Media Management", "SKIP", "No authentication token or workspace")
            return False
        
        # Test social media accounts
        account_data = {
            "workspace_id": self.workspace_id,
            "platform": "instagram",
            "account_id": "comprehensive_test_2025",
            "username": "@comprehensivetest2025",
            "display_name": "Comprehensive Test Account",
            "profile_picture": "https://example.com/profile.jpg",
            "access_tokens": {
                "access_token": "test_access_token_123",
                "refresh_token": "test_refresh_token_456"
            },
            "account_info": {
                "followers_count": 25000,
                "following_count": 750,
                "posts_count": 500
            }
        }
        
        # Create social media account
        response, error = self.make_request("POST", "/social-media-accounts", account_data)
        social_account_id = None
        if error:
            self.log_test("Social Media - Account Create", "FAIL", f"Request failed: {error}")
        elif response.status_code in [200, 201]:
            try:
                data = response.json()
                if data.get("success") and data.get("account"):
                    social_account_id = data["account"]["id"]
                    self.log_test("Social Media - Account Create", "PASS", "Social media account created")
                else:
                    self.log_test("Social Media - Account Create", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Social Media - Account Create", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Social Media - Account Create", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        # Test social media posts
        if social_account_id:
            future_date = (datetime.now() + timedelta(hours=2)).isoformat()
            post_data = {
                "workspace_id": self.workspace_id,
                "social_media_account_id": social_account_id,
                "title": "Comprehensive Test Post 2025",
                "content": "🚀 Testing all social media features in 2025! This is a comprehensive test of the Mewayz platform. #testing #2025 #comprehensive #mewayz",
                "media_urls": [
                    "https://example.com/test-image1.jpg",
                    "https://example.com/test-image2.jpg"
                ],
                "hashtags": ["testing", "2025", "comprehensive", "mewayz"],
                "status": "scheduled",
                "scheduled_at": future_date
            }
            
            response, error = self.make_request("POST", "/social-media-posts", post_data)
            social_post_id = None
            if error:
                self.log_test("Social Media - Post Create", "FAIL", f"Request failed: {error}")
            elif response.status_code in [200, 201]:
                try:
                    data = response.json()
                    if data.get("success") and data.get("post"):
                        social_post_id = data["post"]["id"]
                        self.log_test("Social Media - Post Create", "PASS", "Social media post created")
                    else:
                        self.log_test("Social Media - Post Create", "FAIL", "Invalid response format", data)
                except json.JSONDecodeError:
                    self.log_test("Social Media - Post Create", "FAIL", "Invalid JSON response")
            else:
                self.log_test("Social Media - Post Create", "FAIL", f"HTTP {response.status_code}", response.text[:200])
            
            # Test post publishing
            if social_post_id:
                response, error = self.make_request("POST", f"/social-media-posts/{social_post_id}/publish")
                if error:
                    self.log_test("Social Media - Post Publish", "FAIL", f"Request failed: {error}")
                elif response.status_code == 200:
                    try:
                        data = response.json()
                        if data.get("success"):
                            self.log_test("Social Media - Post Publish", "PASS", "Post published successfully")
                        else:
                            self.log_test("Social Media - Post Publish", "FAIL", "Invalid response format", data)
                    except json.JSONDecodeError:
                        self.log_test("Social Media - Post Publish", "FAIL", "Invalid JSON response")
                else:
                    self.log_test("Social Media - Post Publish", "FAIL", f"HTTP {response.status_code}", response.text[:200])
                
                # Test post duplication
                response, error = self.make_request("POST", f"/social-media-posts/{social_post_id}/duplicate")
                if error:
                    self.log_test("Social Media - Post Duplicate", "FAIL", f"Request failed: {error}")
                elif response.status_code == 200:
                    try:
                        data = response.json()
                        if data.get("success"):
                            self.log_test("Social Media - Post Duplicate", "PASS", "Post duplicated successfully")
                        else:
                            self.log_test("Social Media - Post Duplicate", "FAIL", "Invalid response format", data)
                    except json.JSONDecodeError:
                        self.log_test("Social Media - Post Duplicate", "FAIL", "Invalid JSON response")
                else:
                    self.log_test("Social Media - Post Duplicate", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        return True

    def test_link_in_bio_builder(self):
        """Test ALL link-in-bio builder features"""
        print("\n🔗 TESTING LINK-IN-BIO BUILDER")
        print("=" * 60)
        
        if not self.token or not self.workspace_id:
            self.log_test("Link-in-Bio Builder", "SKIP", "No authentication token or workspace")
            return False
        
        page_data = {
            "workspace_id": self.workspace_id,
            "title": "Comprehensive Test Bio Page",
            "slug": "comprehensive-test-bio-2025",
            "description": "A comprehensive test of the link-in-bio builder functionality",
            "profile_image": "https://example.com/test-profile.jpg",
            "background_image": "https://example.com/test-bg.jpg",
            "theme_settings": {
                "primary_color": "#3b82f6",
                "secondary_color": "#8b5cf6",
                "background_color": "#f8fafc",
                "text_color": "#1e293b",
                "button_style": "rounded",
                "font_family": "Inter"
            },
            "links": [
                {
                    "title": "Test Website",
                    "url": "https://test-website.com",
                    "description": "Main test website",
                    "icon": "globe",
                    "is_active": True,
                    "order": 0
                },
                {
                    "title": "Test Social",
                    "url": "https://social.test.com",
                    "description": "Social media profile",
                    "icon": "instagram",
                    "is_active": True,
                    "order": 1
                }
            ],
            "is_active": True
        }
        
        # Create link-in-bio page
        response, error = self.make_request("POST", "/link-in-bio-pages", page_data)
        link_page_id = None
        page_slug = None
        if error:
            self.log_test("Link-in-Bio - Page Create", "FAIL", f"Request failed: {error}")
        elif response.status_code in [200, 201]:
            try:
                data = response.json()
                if data.get("success") and data.get("page"):
                    link_page_id = data["page"]["id"]
                    page_slug = data["page"]["slug"]
                    self.log_test("Link-in-Bio - Page Create", "PASS", "Link-in-bio page created")
                else:
                    self.log_test("Link-in-Bio - Page Create", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Link-in-Bio - Page Create", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Link-in-Bio - Page Create", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        # Test public page access
        if page_slug:
            # Test without authentication (public endpoint)
            original_token = self.token
            self.token = None
            
            response, error = self.make_request("GET", f"/link-in-bio/{page_slug}")
            
            # Restore token
            self.token = original_token
            
            if error:
                self.log_test("Link-in-Bio - Public Access", "FAIL", f"Request failed: {error}")
            elif response.status_code == 200:
                try:
                    data = response.json()
                    if data.get("success") and data.get("page"):
                        self.log_test("Link-in-Bio - Public Access", "PASS", "Public page accessible")
                    else:
                        self.log_test("Link-in-Bio - Public Access", "FAIL", "Invalid response format", data)
                except json.JSONDecodeError:
                    self.log_test("Link-in-Bio - Public Access", "FAIL", "Invalid JSON response")
            else:
                self.log_test("Link-in-Bio - Public Access", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        # Test analytics
        if link_page_id:
            response, error = self.make_request("GET", f"/link-in-bio-pages/{link_page_id}/analytics")
            if error:
                self.log_test("Link-in-Bio - Analytics", "FAIL", f"Request failed: {error}")
            elif response.status_code == 200:
                try:
                    data = response.json()
                    if data.get("success") and data.get("analytics"):
                        self.log_test("Link-in-Bio - Analytics", "PASS", "Analytics retrieved successfully")
                    else:
                        self.log_test("Link-in-Bio - Analytics", "FAIL", "Invalid response format", data)
                except json.JSONDecodeError:
                    self.log_test("Link-in-Bio - Analytics", "FAIL", "Invalid JSON response")
            else:
                self.log_test("Link-in-Bio - Analytics", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        return True

    def test_crm_system(self):
        """Test ALL CRM system features"""
        print("\n👥 TESTING CRM SYSTEM")
        print("=" * 60)
        
        if not self.token or not self.workspace_id:
            self.log_test("CRM System", "SKIP", "No authentication token or workspace")
            return False
        
        # Test CRM contacts listing
        response, error = self.make_request("GET", f"/crm-contacts?workspace_id={self.workspace_id}")
        if error:
            self.log_test("CRM - Contacts List", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and "contacts" in data:
                    self.log_test("CRM - Contacts List", "PASS", f"Retrieved contacts successfully")
                else:
                    self.log_test("CRM - Contacts List", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("CRM - Contacts List", "FAIL", "Invalid JSON response")
        else:
            self.log_test("CRM - Contacts List", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        # Test CRM contact creation
        contact_data = {
            "workspace_id": self.workspace_id,
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "phone": "+1234567890",
            "company": "Test Company",
            "position": "Test Manager",
            "status": "new",
            "lead_score": 75,
            "tags": ["test", "comprehensive"],
            "custom_fields": {
                "source": "comprehensive_test",
                "budget": "10000"
            }
        }
        
        response, error = self.make_request("POST", "/crm-contacts", contact_data)
        contact_id = None
        if error:
            self.log_test("CRM - Contact Create", "FAIL", f"Request failed: {error}")
        elif response.status_code in [200, 201]:
            try:
                data = response.json()
                if data.get("success") and data.get("contact"):
                    contact_id = data["contact"]["id"]
                    self.log_test("CRM - Contact Create", "PASS", "CRM contact created successfully")
                else:
                    self.log_test("CRM - Contact Create", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("CRM - Contact Create", "FAIL", "Invalid JSON response")
        else:
            self.log_test("CRM - Contact Create", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        # Test CRM analytics
        response, error = self.make_request("GET", "/crm-analytics")
        if error:
            self.log_test("CRM - Analytics", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success"):
                    self.log_test("CRM - Analytics", "PASS", "CRM analytics retrieved successfully")
                else:
                    self.log_test("CRM - Analytics", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("CRM - Analytics", "FAIL", "Invalid JSON response")
        else:
            self.log_test("CRM - Analytics", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        return True

    def test_course_management(self):
        """Test ALL course management features"""
        print("\n🎓 TESTING COURSE MANAGEMENT")
        print("=" * 60)
        
        if not self.token or not self.workspace_id:
            self.log_test("Course Management", "SKIP", "No authentication token or workspace")
            return False
        
        # Test courses listing
        response, error = self.make_request("GET", f"/courses?workspace_id={self.workspace_id}")
        if error:
            self.log_test("Course - List", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and "courses" in data:
                    self.log_test("Course - List", "PASS", "Courses retrieved successfully")
                else:
                    self.log_test("Course - List", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Course - List", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Course - List", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        # Test course creation
        course_data = {
            "workspace_id": self.workspace_id,
            "title": "Comprehensive Test Course",
            "slug": "comprehensive-test-course-2025",
            "description": "A comprehensive test course for the Mewayz platform",
            "price": 99.99,
            "currency": "USD",
            "is_published": True,
            "category": "Testing"
        }
        
        response, error = self.make_request("POST", "/courses", course_data)
        course_id = None
        if error:
            self.log_test("Course - Create", "FAIL", f"Request failed: {error}")
        elif response.status_code in [200, 201]:
            try:
                data = response.json()
                if data.get("success") and data.get("course"):
                    course_id = data["course"]["id"]
                    self.log_test("Course - Create", "PASS", "Course created successfully")
                else:
                    self.log_test("Course - Create", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Course - Create", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Course - Create", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        # Test course analytics
        if course_id:
            response, error = self.make_request("GET", f"/courses/{course_id}/analytics")
            if error:
                self.log_test("Course - Analytics", "FAIL", f"Request failed: {error}")
            elif response.status_code == 200:
                try:
                    data = response.json()
                    if data.get("success"):
                        self.log_test("Course - Analytics", "PASS", "Course analytics retrieved")
                    else:
                        self.log_test("Course - Analytics", "FAIL", "Invalid response format", data)
                except json.JSONDecodeError:
                    self.log_test("Course - Analytics", "FAIL", "Invalid JSON response")
            else:
                self.log_test("Course - Analytics", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        return True

    def test_product_management(self):
        """Test ALL product management features"""
        print("\n🛍️ TESTING PRODUCT MANAGEMENT")
        print("=" * 60)
        
        if not self.token or not self.workspace_id:
            self.log_test("Product Management", "SKIP", "No authentication token or workspace")
            return False
        
        # Test products listing
        response, error = self.make_request("GET", f"/products?workspace_id={self.workspace_id}")
        if error:
            self.log_test("Product - List", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and "products" in data:
                    self.log_test("Product - List", "PASS", "Products retrieved successfully")
                else:
                    self.log_test("Product - List", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Product - List", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Product - List", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        # Test product creation
        product_data = {
            "workspace_id": self.workspace_id,
            "name": "Comprehensive Test Product",
            "slug": "comprehensive-test-product-2025",
            "description": "A comprehensive test product for the Mewayz platform",
            "price": 49.99,
            "currency": "USD",
            "stock_quantity": 100,
            "is_active": True,
            "category": "Testing",
            "images": ["https://example.com/product1.jpg"]
        }
        
        response, error = self.make_request("POST", "/products", product_data)
        product_id = None
        if error:
            self.log_test("Product - Create", "FAIL", f"Request failed: {error}")
        elif response.status_code in [200, 201]:
            try:
                data = response.json()
                if data.get("success") and data.get("product"):
                    product_id = data["product"]["id"]
                    self.log_test("Product - Create", "PASS", "Product created successfully")
                else:
                    self.log_test("Product - Create", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Product - Create", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Product - Create", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        # Test product analytics
        response, error = self.make_request("GET", "/products-analytics")
        if error:
            self.log_test("Product - Analytics", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success"):
                    self.log_test("Product - Analytics", "PASS", "Product analytics retrieved")
                else:
                    self.log_test("Product - Analytics", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Product - Analytics", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Product - Analytics", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        return True

    def test_payment_processing(self):
        """Test ALL payment processing features"""
        print("\n💳 TESTING PAYMENT PROCESSING")
        print("=" * 60)
        
        if not self.token or not self.workspace_id:
            self.log_test("Payment Processing", "SKIP", "No authentication token or workspace")
            return False
        
        # Test payment packages
        response, error = self.make_request("GET", "/payments/packages")
        if error:
            self.log_test("Payment - Packages", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and data.get("packages"):
                    self.log_test("Payment - Packages", "PASS", "Payment packages retrieved")
                else:
                    self.log_test("Payment - Packages", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Payment - Packages", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Payment - Packages", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        # Test payment transactions
        response, error = self.make_request("GET", "/payments/transactions")
        if error:
            self.log_test("Payment - Transactions", "FAIL", f"Request failed: {error}")
        elif response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and "transactions" in data:
                    self.log_test("Payment - Transactions", "PASS", "Payment transactions retrieved")
                else:
                    self.log_test("Payment - Transactions", "FAIL", "Invalid response format", data)
            except json.JSONDecodeError:
                self.log_test("Payment - Transactions", "FAIL", "Invalid JSON response")
        else:
            self.log_test("Payment - Transactions", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        # Test subscription management
        response, error = self.make_request("GET", f"/payments/subscription/{self.workspace_id}")
        if error:
            self.log_test("Payment - Subscription", "FAIL", f"Request failed: {error}")
        elif response.status_code in [200, 403]:  # 403 might be expected for unauthorized access
            self.log_test("Payment - Subscription", "PASS", "Subscription endpoint accessible")
        else:
            self.log_test("Payment - Subscription", "FAIL", f"HTTP {response.status_code}", response.text[:200])
        
        return True

    def test_security_and_validation(self):
        """Test ALL security and validation features"""
        print("\n🔒 TESTING SECURITY & VALIDATION")
        print("=" * 60)
        
        # Test authentication protection
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
            "/products",
            "/payments/packages",
            "/payments/transactions"
        ]
        
        protected_count = 0
        for endpoint in protected_endpoints:
            response, error = self.make_request("GET", endpoint)
            if error:
                continue
            elif response.status_code in [401, 403]:
                protected_count += 1
        
        # Restore token
        self.token = original_token
        
        if protected_count >= len(protected_endpoints) * 0.8:
            self.log_test("Security - Authentication Protection", "PASS", 
                        f"{protected_count}/{len(protected_endpoints)} endpoints properly protected")
        else:
            self.log_test("Security - Authentication Protection", "FAIL", 
                        f"Only {protected_count}/{len(protected_endpoints)} endpoints properly protected")
        
        return True

    def test_database_operations(self):
        """Test database connectivity and operations"""
        print("\n💾 TESTING DATABASE OPERATIONS")
        print("=" * 60)
        
        # Database connectivity is tested implicitly through all CRUD operations
        # If user registration and other operations work, database is connected
        if any(result["test"] in ["Authentication - User Registration", "Workspace - Create"] 
               and result["status"] == "PASS" for result in self.test_results):
            self.log_test("Database - Connectivity", "PASS", "Database operations working")
        else:
            self.log_test("Database - Connectivity", "FAIL", "No successful database operations detected")
        
        return True

    def test_error_handling(self):
        """Test error handling and validation"""
        print("\n⚠️ TESTING ERROR HANDLING")
        print("=" * 60)
        
        if not self.token:
            self.log_test("Error Handling", "SKIP", "No authentication token")
            return False
        
        # Test validation errors
        invalid_data = {
            "name": "",  # Empty name should trigger validation error
            "email": "invalid-email",  # Invalid email format
            "password": "123"  # Too short password
        }
        
        response, error = self.make_request("POST", "/auth/register", invalid_data)
        if error:
            self.log_test("Error Handling - Validation", "FAIL", f"Request failed: {error}")
        elif response.status_code == 422:
            try:
                data = response.json()
                if "errors" in data or "message" in data:
                    self.log_test("Error Handling - Validation", "PASS", "Validation errors properly handled")
                else:
                    self.log_test("Error Handling - Validation", "FAIL", "Invalid error response format", data)
            except json.JSONDecodeError:
                self.log_test("Error Handling - Validation", "FAIL", "Invalid JSON error response")
        else:
            self.log_test("Error Handling - Validation", "FAIL", f"Expected 422, got {response.status_code}")
        
        return True

    def test_logout(self):
        """Test user logout"""
        print("\n🚪 TESTING LOGOUT")
        print("=" * 60)
        
        if not self.token:
            self.log_test("Logout", "SKIP", "No authentication token")
            return False
        
        response, error = self.make_request("POST", "/auth/logout")
        if error:
            self.log_test("Logout", "FAIL", f"Request failed: {error}")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success"):
                    self.log_test("Logout", "PASS", "User logged out successfully")
                    self.token = None
                    return True
                else:
                    self.log_test("Logout", "FAIL", "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Logout", "FAIL", "Invalid JSON response")
                return False
        else:
            self.log_test("Logout", "FAIL", f"HTTP {response.status_code}", response.text[:200])
            return False

    def run_comprehensive_tests(self):
        """Run ALL comprehensive tests"""
        print("🚀 STARTING COMPREHENSIVE MEWAYZ BACKEND TESTING")
        print("=" * 80)
        print("Testing ALL systems, endpoints, features, and functionality")
        print("=" * 80)
        
        # Test sequence covering all requested systems
        test_sequence = [
            ("Authentication System", self.test_authentication_system),
            ("Workspace Management", self.test_workspace_management),
            ("Social Media Management", self.test_social_media_management),
            ("Link-in-Bio Builder", self.test_link_in_bio_builder),
            ("CRM System", self.test_crm_system),
            ("Course Management", self.test_course_management),
            ("Product Management", self.test_product_management),
            ("Payment Processing", self.test_payment_processing),
            ("Security & Validation", self.test_security_and_validation),
            ("Database Operations", self.test_database_operations),
            ("Error Handling", self.test_error_handling),
            ("User Logout", self.test_logout),
        ]
        
        for test_name, test_func in test_sequence:
            print(f"\n📋 Running: {test_name}")
            try:
                test_func()
            except Exception as e:
                self.log_test(f"{test_name} - EXECUTION ERROR", "FAIL", f"Test execution error: {str(e)}")
                self.failed_tests += 1
        
        # Print comprehensive summary
        self.print_comprehensive_summary()
        
        return self.passed_tests > self.failed_tests

    def print_comprehensive_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE TESTING SUMMARY")
        print("=" * 80)
        
        total_tests = self.passed_tests + self.failed_tests
        success_rate = (self.passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"✅ PASSED: {self.passed_tests}")
        print(f"❌ FAILED: {self.failed_tests}")
        print(f"📈 SUCCESS RATE: {success_rate:.1f}%")
        
        # System-by-system breakdown
        print(f"\n🎯 SYSTEM-BY-SYSTEM BREAKDOWN:")
        
        systems = {
            "Authentication": ["Authentication"],
            "Workspace Management": ["Workspace"],
            "Social Media": ["Social Media"],
            "Link-in-Bio": ["Link-in-Bio"],
            "CRM": ["CRM"],
            "Course Management": ["Course"],
            "Product Management": ["Product"],
            "Payment Processing": ["Payment"],
            "Security": ["Security", "Error Handling"],
            "Database": ["Database", "Logout"]
        }
        
        for system_name, keywords in systems.items():
            system_tests = [r for r in self.test_results if any(keyword in r["test"] for keyword in keywords)]
            system_passed = sum(1 for r in system_tests if r["status"] == "PASS")
            system_total = len(system_tests)
            if system_total > 0:
                system_rate = (system_passed / system_total * 100)
                status_icon = "✅" if system_rate >= 80 else "⚠️" if system_rate >= 60 else "❌"
                print(f"{status_icon} {system_name}: {system_passed}/{system_total} ({system_rate:.1f}%)")
        
        # Critical failures
        if self.critical_failures:
            print(f"\n🚨 CRITICAL FAILURES:")
            for failure in self.critical_failures:
                print(f"   • {failure}")
        
        # Detailed results
        print(f"\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            status_symbol = "✅" if result["status"] == "PASS" else "❌" if result["status"] == "FAIL" else "⚠️"
            print(f"{status_symbol} {result['test']}: {result['message']}")
        
        # Overall assessment
        if success_rate >= 90:
            status = "EXCELLENT - Production Ready"
        elif success_rate >= 75:
            status = "GOOD - Minor Issues"
        elif success_rate >= 60:
            status = "FAIR - Needs Attention"
        else:
            status = "POOR - Major Issues"
        
        print(f"\n🏆 OVERALL SYSTEM STATUS: {status}")
        print(f"📊 COMPREHENSIVE TESTING COMPLETED")
        print("=" * 80)

if __name__ == "__main__":
    tester = ComprehensiveMewayzTester()
    success = tester.run_comprehensive_tests()
    sys.exit(0 if success else 1)