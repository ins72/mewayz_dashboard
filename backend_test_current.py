#!/usr/bin/env python3
"""
Backend Testing for Mewayz Laravel Application - January 2025
Focus on verification of core systems and testing areas that need retesting
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
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            return response
        except requests.exceptions.RequestException as e:
            return None
    
    def test_authentication_system(self):
        """Test authentication endpoints"""
        print("\n🔐 Testing Authentication System...")
        
        # Test user registration
        register_data = {
            "name": f"Test User {self.timestamp}",
            "email": f"testuser{self.timestamp}@mewayz.com",
            "password": "password123",
            "password_confirmation": "password123"
        }
        
        response = self.make_request("POST", "/auth/register", register_data)
        if response and response.status_code == 201:
            data = response.json()
            if data.get("success") and data.get("token"):
                self.token = data["token"]
                self.user_id = data["user"]["id"]
                self.log_test("User Registration", "PASS", "User registered successfully with token")
            else:
                self.log_test("User Registration", "FAIL", "Registration successful but missing token/success flag")
        else:
            self.log_test("User Registration", "FAIL", f"Registration failed: {response.status_code if response else 'No response'}")
        
        # Test user login
        login_data = {
            "email": register_data["email"],
            "password": register_data["password"]
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        if response and response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("token"):
                self.token = data["token"]  # Update token
                self.log_test("User Login", "PASS", "User login successful")
            else:
                self.log_test("User Login", "FAIL", "Login response missing token/success flag")
        else:
            self.log_test("User Login", "FAIL", f"Login failed: {response.status_code if response else 'No response'}")
        
        # Test get authenticated user
        if self.token:
            response = self.make_request("GET", "/auth/user")
            if response and response.status_code == 200:
                data = response.json()
                user_data = data.get("user", data)  # Handle both formats
                if user_data.get("id") == self.user_id:
                    self.log_test("Get Authenticated User", "PASS", "User data retrieved successfully")
                else:
                    self.log_test("Get Authenticated User", "FAIL", "User data mismatch")
            else:
                self.log_test("Get Authenticated User", "FAIL", f"Failed to get user data: {response.status_code if response else 'No response'}")
    
    def test_workspace_management(self):
        """Test workspace CRUD operations"""
        print("\n🏢 Testing Workspace Management...")
        
        if not self.token:
            self.log_test("Workspace Management", "FAIL", "No authentication token available")
            return
        
        # Test create workspace
        workspace_data = {
            "name": f"Test Workspace {self.timestamp}",
            "description": "Test workspace for backend testing"
        }
        
        response = self.make_request("POST", "/workspaces", workspace_data)
        if response and response.status_code == 201:
            data = response.json()
            workspace_data = data.get("workspace", data)  # Handle both formats
            if workspace_data.get("id"):
                self.workspace_id = workspace_data["id"]
                self.log_test("Create Workspace", "PASS", "Workspace created successfully")
            else:
                self.log_test("Create Workspace", "FAIL", "Workspace created but no ID returned")
        else:
            self.log_test("Create Workspace", "FAIL", f"Failed to create workspace: {response.status_code if response else 'No response'}")
        
        # Test list workspaces
        response = self.make_request("GET", "/workspaces")
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list) or (isinstance(data, dict) and "data" in data):
                self.log_test("List Workspaces", "PASS", "Workspaces listed successfully")
            else:
                self.log_test("List Workspaces", "FAIL", "Invalid workspace list format")
        else:
            self.log_test("List Workspaces", "FAIL", f"Failed to list workspaces: {response.status_code if response else 'No response'}")
        
        # Test get specific workspace
        if self.workspace_id:
            response = self.make_request("GET", f"/workspaces/{self.workspace_id}")
            if response and response.status_code == 200:
                data = response.json()
                if data.get("id") == self.workspace_id:
                    self.log_test("Get Workspace", "PASS", "Workspace retrieved successfully")
                else:
                    self.log_test("Get Workspace", "FAIL", "Workspace ID mismatch")
            else:
                self.log_test("Get Workspace", "FAIL", f"Failed to get workspace: {response.status_code if response else 'No response'}")
    
    def test_crm_contact_creation(self):
        """Test CRM contact creation - Previously failed with validation error"""
        print("\n👥 Testing CRM Contact Creation...")
        
        if not self.token or not self.workspace_id:
            self.log_test("CRM Contact Creation", "FAIL", "Missing authentication token or workspace ID")
            return
        
        # Test with comprehensive contact data including status field
        contact_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": f"john.doe{self.timestamp}@example.com",
            "phone": "+1234567890",
            "company": "Test Company",
            "position": "Manager",
            "status": "active",  # Include status field that was causing validation error
            "lead_score": 75,
            "notes": "Test contact for backend testing",
            "workspace_id": self.workspace_id
        }
        
        response = self.make_request("POST", "/crm-contacts", contact_data)
        if response and response.status_code == 201:
            data = response.json()
            if data.get("id"):
                self.log_test("CRM Contact Creation", "PASS", "CRM contact created successfully")
            else:
                self.log_test("CRM Contact Creation", "FAIL", "Contact created but no ID returned")
        elif response and response.status_code == 422:
            # Validation error - check what fields are required
            error_data = response.json()
            self.log_test("CRM Contact Creation", "FAIL", f"Validation error: {error_data.get('message', 'Unknown validation error')}", error_data.get('errors'))
        else:
            self.log_test("CRM Contact Creation", "FAIL", f"Failed to create contact: {response.status_code if response else 'No response'}")
    
    def test_course_analytics(self):
        """Test course analytics - Previously failed with CourseEnrollment model error"""
        print("\n📚 Testing Course Analytics...")
        
        if not self.token or not self.workspace_id:
            self.log_test("Course Analytics", "FAIL", "Missing authentication token or workspace ID")
            return
        
        # First create a course
        course_data = {
            "title": f"Test Course {self.timestamp}",
            "description": "Test course for analytics testing",
            "slug": f"test-course-{self.timestamp}",
            "price": 99.99,
            "status": "published",
            "workspace_id": self.workspace_id
        }
        
        response = self.make_request("POST", "/courses", course_data)
        if response and response.status_code == 201:
            data = response.json()
            course_id = data.get("id")
            if course_id:
                self.log_test("Course Creation", "PASS", "Course created successfully")
                
                # Now test analytics
                response = self.make_request("GET", f"/courses/{course_id}/analytics")
                if response and response.status_code == 200:
                    data = response.json()
                    self.log_test("Course Analytics", "PASS", "Course analytics retrieved successfully")
                elif response and response.status_code == 500:
                    error_data = response.json() if response.content else {}
                    self.log_test("Course Analytics", "FAIL", f"Server error (CourseEnrollment model issue): {error_data.get('message', 'Unknown server error')}")
                else:
                    self.log_test("Course Analytics", "FAIL", f"Failed to get analytics: {response.status_code if response else 'No response'}")
            else:
                self.log_test("Course Creation", "FAIL", "Course created but no ID returned")
        else:
            self.log_test("Course Creation", "FAIL", f"Failed to create course: {response.status_code if response else 'No response'}")
    
    def test_core_systems_verification(self):
        """Quick verification of core systems that were previously working"""
        print("\n🔍 Verifying Core Systems...")
        
        if not self.token or not self.workspace_id:
            self.log_test("Core Systems Verification", "FAIL", "Missing authentication token or workspace ID")
            return
        
        # Test social media accounts endpoint
        response = self.make_request("GET", "/social-media-accounts")
        if response and response.status_code == 200:
            self.log_test("Social Media Accounts", "PASS", "Social media accounts endpoint working")
        else:
            self.log_test("Social Media Accounts", "FAIL", f"Social media accounts failed: {response.status_code if response else 'No response'}")
        
        # Test link-in-bio pages endpoint
        response = self.make_request("GET", "/link-in-bio-pages")
        if response and response.status_code == 200:
            self.log_test("Link-in-Bio Pages", "PASS", "Link-in-bio pages endpoint working")
        else:
            self.log_test("Link-in-Bio Pages", "FAIL", f"Link-in-bio pages failed: {response.status_code if response else 'No response'}")
        
        # Test products endpoint
        response = self.make_request("GET", "/products")
        if response and response.status_code == 200:
            self.log_test("Products", "PASS", "Products endpoint working")
        else:
            self.log_test("Products", "FAIL", f"Products failed: {response.status_code if response else 'No response'}")
        
        # Test payment packages endpoint
        response = self.make_request("GET", "/payment/packages")
        if response and response.status_code == 200:
            self.log_test("Payment Packages", "PASS", "Payment packages endpoint working")
        else:
            self.log_test("Payment Packages", "FAIL", f"Payment packages failed: {response.status_code if response else 'No response'}")
    
    def test_authentication_protection(self):
        """Test that protected endpoints require authentication"""
        print("\n🛡️ Testing Authentication Protection...")
        
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        # Test protected endpoints without authentication
        protected_endpoints = [
            ("GET", "/workspaces", "Workspaces"),
            ("GET", "/social-media-accounts", "Social Media Accounts"),
            ("GET", "/link-in-bio-pages", "Link-in-Bio Pages"),
            ("GET", "/products", "Products"),
            ("GET", "/crm-contacts", "CRM Contacts")
        ]
        
        protected_count = 0
        for method, endpoint, name in protected_endpoints:
            response = self.make_request(method, endpoint)
            if response and response.status_code in [401, 403]:
                protected_count += 1
            elif response and response.status_code == 200:
                self.log_test(f"Auth Protection - {name}", "FAIL", f"{name} endpoint not properly protected")
        
        # Restore token
        self.token = original_token
        
        if protected_count == len(protected_endpoints):
            self.log_test("Authentication Protection", "PASS", f"All {protected_count} endpoints properly protected")
        else:
            self.log_test("Authentication Protection", "FAIL", f"Only {protected_count}/{len(protected_endpoints)} endpoints properly protected")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Mewayz Backend Testing - January 2025")
        print("=" * 60)
        
        # Run tests in order
        self.test_authentication_system()
        self.test_workspace_management()
        self.test_crm_contact_creation()  # Focus on previously failed area
        self.test_course_analytics()      # Focus on previously failed area
        self.test_core_systems_verification()
        self.test_authentication_protection()
        
        # Generate summary
        self.generate_summary()
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = len([r for r in self.test_results if r["status"] == "PASS"])
        failed = len([r for r in self.test_results if r["status"] == "FAIL"])
        total = len(self.test_results)
        
        success_rate = (passed / total * 100) if total > 0 else 0
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if result["status"] == "FAIL":
                    print(f"  - {result['test']}: {result['message']}")
        
        print("\n✅ PASSED TESTS:")
        for result in self.test_results:
            if result["status"] == "PASS":
                print(f"  - {result['test']}: {result['message']}")
        
        # Overall status
        if success_rate >= 90:
            print(f"\n🎉 OVERALL STATUS: EXCELLENT - Backend is production-ready")
        elif success_rate >= 80:
            print(f"\n✅ OVERALL STATUS: GOOD - Backend is functional with minor issues")
        elif success_rate >= 70:
            print(f"\n⚠️ OVERALL STATUS: FAIR - Backend needs attention")
        else:
            print(f"\n❌ OVERALL STATUS: POOR - Backend requires significant fixes")

if __name__ == "__main__":
    tester = MewayzBackendTester()
    tester.run_all_tests()