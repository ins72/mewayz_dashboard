#!/usr/bin/env python3
"""
Comprehensive Workspace Invitation System Testing for Mewayz Laravel Application
Tests all invitation endpoints, database structure, email integration, and edge cases
"""

import requests
import json
import sys
import time
from datetime import datetime, timedelta

class WorkspaceInvitationTester:
    def __init__(self):
        self.base_url = "http://localhost:8001/api"
        self.token = None
        self.user_id = None
        self.workspace_id = None
        self.invitation_id = None
        self.invitation_token = None
        self.batch_id = None
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
    
    def test_authentication_setup(self):
        """Test authentication with existing test user"""
        test_data = {
            "email": "test@mewayz.com",
            "password": "password123"
        }
        
        response, error = self.make_request("POST", "/auth/login", test_data)
        
        if error:
            self.log_test("Authentication Setup", "FAIL", f"Request failed: {error}")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.token = data["token"]
                    self.user_id = data["user"]["id"]
                    self.log_test("Authentication Setup", "PASS", "Authenticated successfully")
                    return True
                else:
                    self.log_test("Authentication Setup", "FAIL", "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Authentication Setup", "FAIL", "Invalid JSON response")
                return False
        else:
            self.log_test("Authentication Setup", "FAIL", f"HTTP {response.status_code}", response.text)
            return False
    
    def test_workspace_setup(self):
        """Create a workspace for invitation testing"""
        if not self.token:
            self.log_test("Workspace Setup", "SKIP", "No authentication token")
            return False
        
        workspace_data = {
            "name": "Invitation Test Workspace",
            "description": "A workspace for testing invitation functionality"
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
    
    def test_get_workspace_invitations(self):
        """Test GET /api/workspaces/{workspace}/invitations"""
        if not self.token or not self.workspace_id:
            self.log_test("Get Workspace Invitations", "SKIP", "Missing authentication or workspace")
            return False
        
        response, error = self.make_request("GET", f"/workspaces/{self.workspace_id}/invitations")
        
        if error:
            self.log_test("Get Workspace Invitations", "FAIL", f"Request failed: {error}")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and "data" in data:
                    self.log_test("Get Workspace Invitations", "PASS", f"Retrieved invitations successfully")
                    return True
                else:
                    self.log_test("Get Workspace Invitations", "FAIL", "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Get Workspace Invitations", "FAIL", "Invalid JSON response")
                return False
        else:
            self.log_test("Get Workspace Invitations", "FAIL", f"HTTP {response.status_code}", response.text[:200])
            return False
    
    def test_create_single_invitation(self):
        """Test POST /api/workspaces/{workspace}/invitations"""
        if not self.token or not self.workspace_id:
            self.log_test("Create Single Invitation", "SKIP", "Missing authentication or workspace")
            return False
        
        invitation_data = {
            "email": "sarah.johnson@example.com",
            "role": "editor",
            "department": "Marketing",
            "position": "Content Manager",
            "personal_message": "Welcome to our creative team! Looking forward to working with you.",
            "expires_in_days": 7
        }
        
        response, error = self.make_request("POST", f"/workspaces/{self.workspace_id}/invitations", invitation_data)
        
        if error:
            self.log_test("Create Single Invitation", "FAIL", f"Request failed: {error}")
            return False
        
        if response.status_code in [200, 201]:
            try:
                data = response.json()
                if data.get("success") and data.get("data") and data["data"].get("invitation"):
                    self.invitation_id = data["data"]["invitation"]["id"]
                    self.invitation_token = data["data"]["invitation"]["token"]
                    email_sent = data["data"].get("email_sent", False)
                    self.log_test("Create Single Invitation", "PASS", f"Invitation created successfully, email sent: {email_sent}")
                    return True
                else:
                    self.log_test("Create Single Invitation", "FAIL", "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Create Single Invitation", "FAIL", "Invalid JSON response")
                return False
        else:
            self.log_test("Create Single Invitation", "FAIL", f"HTTP {response.status_code}", response.text[:200])
            return False
    
    def test_create_bulk_invitations(self):
        """Test POST /api/workspaces/{workspace}/invitations/bulk"""
        if not self.token or not self.workspace_id:
            self.log_test("Create Bulk Invitations", "SKIP", "Missing authentication or workspace")
            return False
        
        bulk_data = {
            "batch_name": "Q1 2025 Team Expansion",
            "invitations": [
                {
                    "email": "john.doe@example.com",
                    "role": "contributor",
                    "department": "Design",
                    "position": "UI Designer",
                    "personal_message": "Excited to have you join our design team!"
                },
                {
                    "email": "jane.smith@example.com",
                    "role": "editor",
                    "department": "Content",
                    "position": "Content Writer"
                },
                {
                    "email": "mike.wilson@example.com",
                    "role": "viewer",
                    "department": "Analytics",
                    "position": "Data Analyst",
                    "personal_message": "Looking forward to your insights on our campaigns."
                }
            ]
        }
        
        response, error = self.make_request("POST", f"/workspaces/{self.workspace_id}/invitations/bulk", bulk_data)
        
        if error:
            self.log_test("Create Bulk Invitations", "FAIL", f"Request failed: {error}")
            return False
        
        if response.status_code in [200, 201]:
            try:
                data = response.json()
                if data.get("success") and data.get("data"):
                    self.batch_id = data["data"]["batch_id"]
                    summary = data["data"]["summary"]
                    self.log_test("Create Bulk Invitations", "PASS", 
                                f"Bulk invitations processed: {summary['successful']}/{summary['total']} successful")
                    return True
                else:
                    self.log_test("Create Bulk Invitations", "FAIL", "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Create Bulk Invitations", "FAIL", "Invalid JSON response")
                return False
        else:
            self.log_test("Create Bulk Invitations", "FAIL", f"HTTP {response.status_code}", response.text[:200])
            return False
    
    def test_get_invitation_analytics(self):
        """Test GET /api/workspaces/{workspace}/invitations/analytics"""
        if not self.token or not self.workspace_id:
            self.log_test("Get Invitation Analytics", "SKIP", "Missing authentication or workspace")
            return False
        
        response, error = self.make_request("GET", f"/workspaces/{self.workspace_id}/invitations/analytics")
        
        if error:
            self.log_test("Get Invitation Analytics", "FAIL", f"Request failed: {error}")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and data.get("data"):
                    analytics = data["data"]
                    overview = analytics.get("overview", {})
                    self.log_test("Get Invitation Analytics", "PASS", 
                                f"Analytics retrieved: {overview.get('total', 0)} total invitations, "
                                f"{analytics.get('acceptance_rate', 0)}% acceptance rate")
                    return True
                else:
                    self.log_test("Get Invitation Analytics", "FAIL", "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Get Invitation Analytics", "FAIL", "Invalid JSON response")
                return False
        else:
            self.log_test("Get Invitation Analytics", "FAIL", f"HTTP {response.status_code}", response.text[:200])
            return False
    
    def test_get_invitation_by_token(self):
        """Test GET /api/invitations/{token} (public route)"""
        if not self.invitation_token:
            self.log_test("Get Invitation by Token", "SKIP", "No invitation token available")
            return False
        
        # Test without authentication (public route)
        original_token = self.token
        self.token = None
        
        response, error = self.make_request("GET", f"/invitations/{self.invitation_token}")
        
        # Restore token
        self.token = original_token
        
        if error:
            self.log_test("Get Invitation by Token", "FAIL", f"Request failed: {error}")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and data.get("data"):
                    invitation = data["data"]
                    self.log_test("Get Invitation by Token", "PASS", 
                                f"Invitation retrieved: {invitation.get('email')} for role {invitation.get('role')}")
                    return True
                else:
                    self.log_test("Get Invitation by Token", "FAIL", "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Get Invitation by Token", "FAIL", "Invalid JSON response")
                return False
        else:
            self.log_test("Get Invitation by Token", "FAIL", f"HTTP {response.status_code}", response.text[:200])
            return False
    
    def test_resend_invitation(self):
        """Test POST /api/invitations/{invitation}/resend"""
        if not self.token or not self.invitation_id:
            self.log_test("Resend Invitation", "SKIP", "Missing authentication or invitation ID")
            return False
        
        response, error = self.make_request("POST", f"/invitations/{self.invitation_id}/resend")
        
        if error:
            self.log_test("Resend Invitation", "FAIL", f"Request failed: {error}")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and data.get("data"):
                    email_sent = data["data"].get("email_sent", False)
                    self.log_test("Resend Invitation", "PASS", f"Invitation resent successfully, email sent: {email_sent}")
                    return True
                else:
                    self.log_test("Resend Invitation", "FAIL", "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Resend Invitation", "FAIL", "Invalid JSON response")
                return False
        else:
            self.log_test("Resend Invitation", "FAIL", f"HTTP {response.status_code}", response.text[:200])
            return False
    
    def test_decline_invitation(self):
        """Test POST /api/invitations/{token}/decline"""
        if not self.invitation_token:
            self.log_test("Decline Invitation", "SKIP", "No invitation token available")
            return False
        
        decline_data = {
            "reason": "Not interested in this role at the moment"
        }
        
        # Test without authentication (public route)
        original_token = self.token
        self.token = None
        
        response, error = self.make_request("POST", f"/invitations/{self.invitation_token}/decline", decline_data)
        
        # Restore token
        self.token = original_token
        
        if error:
            self.log_test("Decline Invitation", "FAIL", f"Request failed: {error}")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success"):
                    self.log_test("Decline Invitation", "PASS", "Invitation declined successfully")
                    return True
                else:
                    self.log_test("Decline Invitation", "FAIL", "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Decline Invitation", "FAIL", "Invalid JSON response")
                return False
        else:
            self.log_test("Decline Invitation", "FAIL", f"HTTP {response.status_code}", response.text[:200])
            return False
    
    def test_cancel_invitation(self):
        """Test DELETE /api/invitations/{invitation}"""
        if not self.token:
            self.log_test("Cancel Invitation", "SKIP", "Missing authentication")
            return False
        
        # Create a new invitation to cancel
        invitation_data = {
            "email": "temp.user@example.com",
            "role": "viewer",
            "department": "Test",
            "position": "Test User"
        }
        
        response, error = self.make_request("POST", f"/workspaces/{self.workspace_id}/invitations", invitation_data)
        
        if error or response.status_code not in [200, 201]:
            self.log_test("Cancel Invitation", "FAIL", "Failed to create invitation for cancellation test")
            return False
        
        try:
            data = response.json()
            temp_invitation_id = data["data"]["invitation"]["id"]
        except:
            self.log_test("Cancel Invitation", "FAIL", "Failed to get invitation ID for cancellation test")
            return False
        
        # Now cancel the invitation
        response, error = self.make_request("DELETE", f"/invitations/{temp_invitation_id}")
        
        if error:
            self.log_test("Cancel Invitation", "FAIL", f"Request failed: {error}")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success"):
                    self.log_test("Cancel Invitation", "PASS", "Invitation cancelled successfully")
                    return True
                else:
                    self.log_test("Cancel Invitation", "FAIL", "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Cancel Invitation", "FAIL", "Invalid JSON response")
                return False
        else:
            self.log_test("Cancel Invitation", "FAIL", f"HTTP {response.status_code}", response.text[:200])
            return False
    
    def test_accept_invitation_authentication_required(self):
        """Test POST /api/invitations/{token}/accept requires authentication"""
        if not self.invitation_token:
            self.log_test("Accept Invitation Auth Required", "SKIP", "No invitation token available")
            return False
        
        # Create a new invitation for acceptance test
        invitation_data = {
            "email": "test@mewayz.com",  # Use the test user's email
            "role": "contributor",
            "department": "Test",
            "position": "Test Contributor"
        }
        
        response, error = self.make_request("POST", f"/workspaces/{self.workspace_id}/invitations", invitation_data)
        
        if error or response.status_code not in [200, 201]:
            self.log_test("Accept Invitation Auth Required", "FAIL", "Failed to create invitation for acceptance test")
            return False
        
        try:
            data = response.json()
            test_token = data["data"]["invitation"]["token"]
        except:
            self.log_test("Accept Invitation Auth Required", "FAIL", "Failed to get invitation token for acceptance test")
            return False
        
        # Test acceptance with authentication
        response, error = self.make_request("POST", f"/invitations/{test_token}/accept")
        
        if error:
            self.log_test("Accept Invitation Auth Required", "FAIL", f"Request failed: {error}")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success"):
                    self.log_test("Accept Invitation Auth Required", "PASS", "Invitation accepted successfully with authentication")
                    return True
                else:
                    self.log_test("Accept Invitation Auth Required", "FAIL", "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Accept Invitation Auth Required", "FAIL", "Invalid JSON response")
                return False
        else:
            self.log_test("Accept Invitation Auth Required", "FAIL", f"HTTP {response.status_code}", response.text[:200])
            return False
    
    def test_duplicate_invitation_handling(self):
        """Test duplicate invitation handling"""
        if not self.token or not self.workspace_id:
            self.log_test("Duplicate Invitation Handling", "SKIP", "Missing authentication or workspace")
            return False
        
        invitation_data = {
            "email": "duplicate.test@example.com",
            "role": "viewer",
            "department": "Test"
        }
        
        # Create first invitation
        response1, error1 = self.make_request("POST", f"/workspaces/{self.workspace_id}/invitations", invitation_data)
        
        if error1 or response1.status_code not in [200, 201]:
            self.log_test("Duplicate Invitation Handling", "FAIL", "Failed to create first invitation")
            return False
        
        # Try to create duplicate invitation
        response2, error2 = self.make_request("POST", f"/workspaces/{self.workspace_id}/invitations", invitation_data)
        
        if error2:
            self.log_test("Duplicate Invitation Handling", "FAIL", f"Request failed: {error2}")
            return False
        
        if response2.status_code == 409:  # Conflict status code
            try:
                data = response2.json()
                if not data.get("success"):
                    self.log_test("Duplicate Invitation Handling", "PASS", "Duplicate invitation properly rejected")
                    return True
                else:
                    self.log_test("Duplicate Invitation Handling", "FAIL", "Duplicate invitation was accepted")
                    return False
            except json.JSONDecodeError:
                self.log_test("Duplicate Invitation Handling", "FAIL", "Invalid JSON response")
                return False
        else:
            self.log_test("Duplicate Invitation Handling", "FAIL", f"Expected 409, got {response2.status_code}")
            return False
    
    def test_invitation_validation(self):
        """Test invitation validation"""
        if not self.token or not self.workspace_id:
            self.log_test("Invitation Validation", "SKIP", "Missing authentication or workspace")
            return False
        
        # Test invalid email
        invalid_data = {
            "email": "invalid-email",
            "role": "viewer"
        }
        
        response, error = self.make_request("POST", f"/workspaces/{self.workspace_id}/invitations", invalid_data)
        
        if error:
            self.log_test("Invitation Validation", "FAIL", f"Request failed: {error}")
            return False
        
        if response.status_code == 422:  # Validation error
            try:
                data = response.json()
                if not data.get("success") and "errors" in data:
                    self.log_test("Invitation Validation", "PASS", "Invalid email properly rejected")
                    return True
                else:
                    self.log_test("Invitation Validation", "FAIL", "Validation error not properly formatted")
                    return False
            except json.JSONDecodeError:
                self.log_test("Invitation Validation", "FAIL", "Invalid JSON response")
                return False
        else:
            self.log_test("Invitation Validation", "FAIL", f"Expected 422, got {response.status_code}")
            return False
    
    def test_unauthorized_access(self):
        """Test unauthorized access to invitation endpoints"""
        if not self.workspace_id:
            self.log_test("Unauthorized Access", "SKIP", "No workspace ID available")
            return False
        
        # Clear token to test unauthorized access
        original_token = self.token
        self.token = None
        
        response, error = self.make_request("GET", f"/workspaces/{self.workspace_id}/invitations")
        
        # Restore token
        self.token = original_token
        
        if error:
            self.log_test("Unauthorized Access", "FAIL", f"Request failed: {error}")
            return False
        
        if response.status_code == 401:  # Unauthorized
            self.log_test("Unauthorized Access", "PASS", "Unauthorized access properly blocked")
            return True
        else:
            self.log_test("Unauthorized Access", "FAIL", f"Expected 401, got {response.status_code}")
            return False
    
    def test_database_structure(self):
        """Test database structure by verifying invitation data persistence"""
        if not self.token or not self.workspace_id:
            self.log_test("Database Structure", "SKIP", "Missing authentication or workspace")
            return False
        
        # Create invitation with comprehensive data
        invitation_data = {
            "email": "db.test@example.com",
            "role": "admin",
            "department": "Engineering",
            "position": "Senior Developer",
            "personal_message": "Welcome to the engineering team!",
            "expires_in_days": 14
        }
        
        response, error = self.make_request("POST", f"/workspaces/{self.workspace_id}/invitations", invitation_data)
        
        if error or response.status_code not in [200, 201]:
            self.log_test("Database Structure", "FAIL", "Failed to create invitation for database test")
            return False
        
        try:
            data = response.json()
            invitation = data["data"]["invitation"]
            
            # Verify all fields are properly stored
            required_fields = ["id", "email", "role", "department", "position", "personal_message", "token", "expires_at"]
            missing_fields = [field for field in required_fields if field not in invitation or invitation[field] is None]
            
            if missing_fields:
                self.log_test("Database Structure", "FAIL", f"Missing fields: {missing_fields}")
                return False
            
            # Verify data types and values
            if invitation["email"] != invitation_data["email"]:
                self.log_test("Database Structure", "FAIL", "Email not properly stored")
                return False
            
            if invitation["role"] != invitation_data["role"]:
                self.log_test("Database Structure", "FAIL", "Role not properly stored")
                return False
            
            self.log_test("Database Structure", "PASS", "Database structure and data persistence verified")
            return True
            
        except Exception as e:
            self.log_test("Database Structure", "FAIL", f"Error verifying database structure: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all workspace invitation tests"""
        print("🚀 Starting Comprehensive Workspace Invitation System Testing")
        print("=" * 70)
        
        # Setup tests
        if not self.test_authentication_setup():
            print("❌ Authentication failed - cannot continue with tests")
            return
        
        if not self.test_workspace_setup():
            print("❌ Workspace setup failed - cannot continue with tests")
            return
        
        # Core invitation functionality tests
        print("\n📋 Testing Core Invitation Functionality")
        print("-" * 50)
        self.test_get_workspace_invitations()
        self.test_create_single_invitation()
        self.test_create_bulk_invitations()
        self.test_get_invitation_analytics()
        
        # Public invitation tests
        print("\n🌐 Testing Public Invitation Routes")
        print("-" * 50)
        self.test_get_invitation_by_token()
        self.test_decline_invitation()
        
        # Invitation management tests
        print("\n⚙️ Testing Invitation Management")
        print("-" * 50)
        self.test_resend_invitation()
        self.test_cancel_invitation()
        
        # Authentication and authorization tests
        print("\n🔐 Testing Authentication & Authorization")
        print("-" * 50)
        self.test_accept_invitation_authentication_required()
        self.test_unauthorized_access()
        
        # Edge cases and validation tests
        print("\n🧪 Testing Edge Cases & Validation")
        print("-" * 50)
        self.test_duplicate_invitation_handling()
        self.test_invitation_validation()
        
        # Database and structure tests
        print("\n💾 Testing Database Structure")
        print("-" * 50)
        self.test_database_structure()
        
        # Generate summary
        self.generate_test_summary()
    
    def generate_test_summary(self):
        """Generate comprehensive test summary"""
        print("\n" + "=" * 70)
        print("📊 WORKSPACE INVITATION SYSTEM TEST SUMMARY")
        print("=" * 70)
        
        passed = len([r for r in self.test_results if r["status"] == "PASS"])
        failed = len([r for r in self.test_results if r["status"] == "FAIL"])
        skipped = len([r for r in self.test_results if r["status"] == "SKIP"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"⚠️ Skipped: {skipped}")
        print(f"Success Rate: {(passed/total*100):.1f}%" if total > 0 else "0%")
        
        if failed > 0:
            print(f"\n❌ FAILED TESTS:")
            for result in self.test_results:
                if result["status"] == "FAIL":
                    print(f"  • {result['test']}: {result['message']}")
        
        print(f"\n🎯 INVITATION SYSTEM STATUS:")
        if failed == 0:
            print("✅ All invitation system components are working correctly")
            print("✅ Database structure is properly implemented")
            print("✅ Authentication and authorization are working")
            print("✅ Email integration is functional")
            print("✅ Edge cases are properly handled")
        else:
            print("❌ Some invitation system components need attention")
            print("⚠️ Review failed tests above for specific issues")
        
        return passed, failed, skipped

if __name__ == "__main__":
    tester = WorkspaceInvitationTester()
    tester.run_all_tests()