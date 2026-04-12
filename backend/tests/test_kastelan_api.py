"""
Backend API Tests for Penzion Kastelan Bojnice
Tests: Reservations, Reviews, Admin Auth, Admin CRUD operations
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials from backend/.env
ADMIN_EMAIL = "admin@kastelan.sk"
ADMIN_PASSWORD = "Kastelan2025!"


class TestHealthCheck:
    """Basic API health check"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Penzion Kastelan" in data["message"]
        print("✓ API root endpoint working")


class TestReservations:
    """Reservation API tests"""
    
    def test_create_reservation_success(self):
        """Test creating a valid reservation"""
        payload = {
            "room_id": 1,
            "guest_name": "TEST_Jan Novak",
            "guest_email": "test_jan@example.com",
            "guest_phone": "+421905123456",
            "check_in": "2026-05-01",
            "check_out": "2026-05-05",
            "guests": 2,
            "note": "Test reservation",
            "language": "SK"
        }
        response = requests.post(f"{BASE_URL}/api/reservations", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data
        assert data["guest_name"] == payload["guest_name"]
        assert data["guest_email"] == payload["guest_email"]
        assert data["room_id"] == payload["room_id"]
        assert data["status"] == "pending"
        print(f"✓ Reservation created with ID: {data['id']}")
        return data["id"]
    
    def test_create_reservation_validation_error(self):
        """Test reservation validation - missing required fields"""
        payload = {
            "room_id": 1,
            "guest_name": "A",  # Too short
            "guest_email": "invalid-email",  # Invalid email
            "guest_phone": "123",  # Too short
            "check_in": "2026-05-01",
            "check_out": "2026-05-05",
            "guests": 2
        }
        response = requests.post(f"{BASE_URL}/api/reservations", json=payload)
        assert response.status_code == 422, f"Expected 422 validation error, got {response.status_code}"
        print("✓ Reservation validation working correctly")
    
    def test_create_reservation_invalid_room(self):
        """Test reservation with invalid room ID"""
        payload = {
            "room_id": 99,  # Invalid room
            "guest_name": "TEST_Invalid Room",
            "guest_email": "test@example.com",
            "guest_phone": "+421905123456",
            "check_in": "2026-05-01",
            "check_out": "2026-05-05",
            "guests": 2
        }
        response = requests.post(f"{BASE_URL}/api/reservations", json=payload)
        assert response.status_code == 422, f"Expected 422 for invalid room, got {response.status_code}"
        print("✓ Invalid room ID validation working")


class TestReviews:
    """Review API tests"""
    
    def test_get_public_reviews(self):
        """Test fetching approved public reviews"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        # Should have seeded sample reviews
        assert len(data) >= 4, f"Expected at least 4 seeded reviews, got {len(data)}"
        
        # Verify review structure
        if len(data) > 0:
            review = data[0]
            assert "id" in review
            assert "author_name" in review
            assert "rating" in review
            assert "text" in review
            assert review.get("approved") == True, "Public reviews should be approved"
        print(f"✓ Got {len(data)} public reviews")
    
    def test_create_review_success(self):
        """Test creating a new review"""
        payload = {
            "author_name": "TEST_Maria Testova",
            "rating": 5,
            "text": "Excellent stay! Very clean and comfortable rooms.",
            "language": "EN"
        }
        response = requests.post(f"{BASE_URL}/api/reviews", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data
        assert data["author_name"] == payload["author_name"]
        assert data["rating"] == payload["rating"]
        assert data["approved"] == False, "New reviews should not be auto-approved"
        print(f"✓ Review created with ID: {data['id']}")
        return data["id"]
    
    def test_create_review_validation(self):
        """Test review validation"""
        payload = {
            "author_name": "A",  # Too short
            "rating": 6,  # Invalid rating
            "text": "Short"  # Too short
        }
        response = requests.post(f"{BASE_URL}/api/reviews", json=payload)
        assert response.status_code == 422, f"Expected 422 validation error, got {response.status_code}"
        print("✓ Review validation working correctly")


class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        payload = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        response = requests.post(f"{BASE_URL}/api/admin/login", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data
        assert "email" in data
        assert data["email"] == ADMIN_EMAIL
        assert len(data["token"]) > 0
        print(f"✓ Admin login successful, token received")
        return data["token"]
    
    def test_admin_login_invalid_credentials(self):
        """Test admin login with wrong password"""
        payload = {
            "email": ADMIN_EMAIL,
            "password": "wrongpassword"
        }
        response = requests.post(f"{BASE_URL}/api/admin/login", json=payload)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Invalid credentials rejected correctly")
    
    def test_admin_login_nonexistent_user(self):
        """Test admin login with non-existent email"""
        payload = {
            "email": "nonexistent@example.com",
            "password": "anypassword"
        }
        response = requests.post(f"{BASE_URL}/api/admin/login", json=payload)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Non-existent user rejected correctly")


class TestAdminReservations:
    """Admin reservation management tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["token"]
    
    def test_get_admin_reservations(self, admin_token):
        """Test fetching all reservations as admin"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/reservations", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin can view {len(data)} reservations")
    
    def test_get_reservations_unauthorized(self):
        """Test fetching reservations without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/reservations")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Unauthorized access blocked correctly")
    
    def test_update_reservation_status(self, admin_token):
        """Test updating reservation status"""
        # First create a reservation
        payload = {
            "room_id": 2,
            "guest_name": "TEST_Status Update",
            "guest_email": "test_status@example.com",
            "guest_phone": "+421905111222",
            "check_in": "2026-06-01",
            "check_out": "2026-06-03",
            "guests": 2
        }
        create_response = requests.post(f"{BASE_URL}/api/reservations", json=payload)
        assert create_response.status_code == 200
        reservation_id = create_response.json()["id"]
        
        # Update status to confirmed
        headers = {"Authorization": f"Bearer {admin_token}"}
        update_response = requests.put(
            f"{BASE_URL}/api/admin/reservations/{reservation_id}/status",
            json={"status": "confirmed"},
            headers=headers
        )
        assert update_response.status_code == 200
        assert update_response.json()["status"] == "confirmed"
        
        # Verify the update persisted
        get_response = requests.get(f"{BASE_URL}/api/admin/reservations", headers=headers)
        reservations = get_response.json()
        updated = next((r for r in reservations if r["id"] == reservation_id), None)
        assert updated is not None
        assert updated["status"] == "confirmed"
        print(f"✓ Reservation status updated to confirmed")
    
    def test_cancel_reservation(self, admin_token):
        """Test cancelling a reservation"""
        # Create a reservation
        payload = {
            "room_id": 3,
            "guest_name": "TEST_Cancel Test",
            "guest_email": "test_cancel@example.com",
            "guest_phone": "+421905333444",
            "check_in": "2026-07-01",
            "check_out": "2026-07-03",
            "guests": 1
        }
        create_response = requests.post(f"{BASE_URL}/api/reservations", json=payload)
        reservation_id = create_response.json()["id"]
        
        # Cancel the reservation
        headers = {"Authorization": f"Bearer {admin_token}"}
        cancel_response = requests.put(
            f"{BASE_URL}/api/admin/reservations/{reservation_id}/status",
            json={"status": "cancelled"},
            headers=headers
        )
        assert cancel_response.status_code == 200
        assert cancel_response.json()["status"] == "cancelled"
        print("✓ Reservation cancelled successfully")


class TestAdminReviews:
    """Admin review management tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["token"]
    
    def test_get_admin_reviews(self, admin_token):
        """Test fetching all reviews as admin (including unapproved)"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/reviews", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin can view {len(data)} reviews (including unapproved)")
    
    def test_approve_review(self, admin_token):
        """Test approving a review"""
        # Create a new review (unapproved by default)
        create_response = requests.post(f"{BASE_URL}/api/reviews", json={
            "author_name": "TEST_Approve Test",
            "rating": 4,
            "text": "This review needs approval for testing purposes."
        })
        review_id = create_response.json()["id"]
        
        # Approve the review
        headers = {"Authorization": f"Bearer {admin_token}"}
        approve_response = requests.put(
            f"{BASE_URL}/api/admin/reviews/{review_id}/approve",
            json={"approved": True},
            headers=headers
        )
        assert approve_response.status_code == 200
        assert approve_response.json()["approved"] == True
        
        # Verify it appears in public reviews
        public_response = requests.get(f"{BASE_URL}/api/reviews")
        public_reviews = public_response.json()
        approved_review = next((r for r in public_reviews if r["id"] == review_id), None)
        assert approved_review is not None, "Approved review should appear in public list"
        print("✓ Review approved and visible publicly")
    
    def test_unapprove_review(self, admin_token):
        """Test unapproving a review"""
        # Create and approve a review
        create_response = requests.post(f"{BASE_URL}/api/reviews", json={
            "author_name": "TEST_Unapprove Test",
            "rating": 3,
            "text": "This review will be unapproved for testing."
        })
        review_id = create_response.json()["id"]
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        # First approve
        requests.put(f"{BASE_URL}/api/admin/reviews/{review_id}/approve", json={"approved": True}, headers=headers)
        
        # Then unapprove
        unapprove_response = requests.put(
            f"{BASE_URL}/api/admin/reviews/{review_id}/approve",
            json={"approved": False},
            headers=headers
        )
        assert unapprove_response.status_code == 200
        assert unapprove_response.json()["approved"] == False
        
        # Verify it's no longer in public reviews
        public_response = requests.get(f"{BASE_URL}/api/reviews")
        public_reviews = public_response.json()
        unapproved_review = next((r for r in public_reviews if r["id"] == review_id), None)
        assert unapproved_review is None, "Unapproved review should not appear in public list"
        print("✓ Review unapproved and hidden from public")


class TestAdminContacts:
    """Admin contact messages tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["token"]
    
    def test_create_contact_message(self):
        """Test creating a contact message"""
        payload = {
            "name": "TEST_Contact Person",
            "email": "test_contact@example.com",
            "phone": "+421905555666",
            "message": "This is a test contact message for the admin panel.",
            "language": "SK"
        }
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert data["name"] == payload["name"]
        print(f"✓ Contact message created with ID: {data['id']}")
        return data["id"]
    
    def test_get_admin_contacts(self, admin_token):
        """Test fetching contact messages as admin"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/contacts", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin can view {len(data)} contact messages")


class TestCleanup:
    """Cleanup test data"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["token"]
    
    def test_cleanup_test_data(self, admin_token):
        """Clean up TEST_ prefixed data"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get and delete test reservations
        res_response = requests.get(f"{BASE_URL}/api/admin/reservations", headers=headers)
        if res_response.status_code == 200:
            for r in res_response.json():
                if r.get("guest_name", "").startswith("TEST_"):
                    requests.delete(f"{BASE_URL}/api/admin/reservations/{r['id']}", headers=headers)
        
        # Get and delete test reviews
        rev_response = requests.get(f"{BASE_URL}/api/admin/reviews", headers=headers)
        if rev_response.status_code == 200:
            for r in rev_response.json():
                if r.get("author_name", "").startswith("TEST_"):
                    requests.delete(f"{BASE_URL}/api/admin/reviews/{r['id']}", headers=headers)
        
        print("✓ Test data cleanup completed")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
