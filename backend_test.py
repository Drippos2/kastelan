import requests
import sys
from datetime import datetime
import json

class PenzionAPITester:
    def __init__(self, base_url="https://bojnice-heritage-inn.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            print(f"Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"Response: {json.dumps(response_data, indent=2)}")
                except:
                    print(f"Response Text: {response.text[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text[:200]}...")

            return success, response.json() if success and response.text else {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            return False, {}
        except requests.exceptions.ConnectionError:
            print(f"❌ Failed - Connection error")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        success, response = self.run_test(
            "API Root",
            "GET",
            "api/",
            200
        )
        return success

    def test_contact_form_submission(self):
        """Test contact form submission"""
        test_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "+421905123456",
            "message": "This is a test message from automated testing.",
            "language": "SK"
        }
        
        success, response = self.run_test(
            "Contact Form Submission",
            "POST",
            "api/contact",
            200,
            data=test_data
        )
        
        if success and response:
            # Verify response contains expected fields
            expected_fields = ['id', 'name', 'email', 'message', 'language', 'created_at']
            for field in expected_fields:
                if field not in response:
                    print(f"❌ Missing field in response: {field}")
                    return False
            print(f"✅ Contact message created with ID: {response.get('id')}")
        
        return success

    def test_contact_form_validation(self):
        """Test contact form validation with invalid data"""
        invalid_data = {
            "name": "A",  # Too short
            "email": "invalid-email",  # Invalid email
            "message": "Short",  # Too short
            "language": "SK"
        }
        
        success, response = self.run_test(
            "Contact Form Validation (Invalid Data)",
            "POST",
            "api/contact",
            422,  # Validation error expected
            data=invalid_data
        )
        
        # For validation errors, we expect 422 status
        return success

    def test_get_contact_messages(self):
        """Test retrieving contact messages"""
        success, response = self.run_test(
            "Get Contact Messages",
            "GET",
            "api/contact",
            200
        )
        
        if success and isinstance(response, list):
            print(f"✅ Retrieved {len(response)} contact messages")
        
        return success

    def test_status_endpoint(self):
        """Test status check endpoint"""
        test_data = {
            "client_name": "test_client"
        }
        
        success, response = self.run_test(
            "Status Check Creation",
            "POST",
            "api/status",
            200,
            data=test_data
        )
        
        return success

    def test_get_status_checks(self):
        """Test retrieving status checks"""
        success, response = self.run_test(
            "Get Status Checks",
            "GET",
            "api/status",
            200
        )
        
        if success and isinstance(response, list):
            print(f"✅ Retrieved {len(response)} status checks")
        
        return success

def main():
    print("🚀 Starting Penzión Kastelán API Tests")
    print("=" * 50)
    
    tester = PenzionAPITester()
    
    # Test API endpoints
    tests = [
        tester.test_api_root,
        tester.test_status_endpoint,
        tester.test_get_status_checks,
        tester.test_contact_form_submission,
        tester.test_contact_form_validation,
        tester.test_get_contact_messages,
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            tester.tests_run += 1
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())