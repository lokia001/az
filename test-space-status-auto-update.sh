#!/bin/bash

# Test script for Space Status Auto-Update functionality
# Tests the integration between BookingService and SpaceService

API_BASE="http://localhost:5000/api"
TOKEN=""

echo "=== Testing Space Status Auto-Update Integration ==="
echo "This script tests that space status is automatically updated when booking status changes"
echo ""

# Function to get auth token (you might need to adjust this)
get_auth_token() {
    # For now, assuming no auth or you can modify this
    echo "Getting auth token..."
    # TOKEN=$(curl -s -X POST "$API_BASE/auth/login" \
    #   -H "Content-Type: application/json" \
    #   -d '{"email":"owner@test.com","password":"TestPassword"}' | jq -r '.token')
    
    # For testing without auth, use empty token
    TOKEN=""
    echo "Token: $TOKEN"
}

# Function to test space status update after booking status change
test_space_status_update() {
    local space_id="$1"
    local booking_id="$2"
    local new_status="$3"
    
    echo "Testing space status update for SpaceId: $space_id after changing booking $booking_id to $new_status"
    
    # Get initial space status
    echo "Getting initial space status..."
    initial_space_status=$(curl -s -X GET "$API_BASE/spaces/$space_id" \
        -H "Authorization: Bearer $TOKEN" | jq -r '.status')
    echo "Initial space status: $initial_space_status"
    
    # Update booking status
    echo "Updating booking status to $new_status..."
    curl -s -X PUT "$API_BASE/bookings/$booking_id/status" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "{\"newStatus\":\"$new_status\",\"notes\":\"Test auto-update\"}"
    
    # Wait a moment for auto-update to happen
    sleep 2
    
    # Get updated space status
    echo "Getting updated space status..."
    updated_space_status=$(curl -s -X GET "$API_BASE/spaces/$space_id" \
        -H "Authorization: Bearer $TOKEN" | jq -r '.status')
    echo "Updated space status: $updated_space_status"
    
    # Check if status changed appropriately
    case $new_status in
        "CheckedIn"|"OverdueCheckin"|"OverdueCheckout"|"OverduePending")
            expected_status="Booked"
            ;;
        "Completed"|"Cancelled"|"NoShow")
            expected_status="Available"  # or "Cleaning" depending on timing
            ;;
        *)
            expected_status="Unknown"
            ;;
    esac
    
    echo "Expected space status: $expected_status"
    echo "Actual space status: $updated_space_status"
    
    if [[ "$updated_space_status" == "$expected_status" || ($expected_status == "Available" && "$updated_space_status" == "Cleaning") ]]; then
        echo "✅ Test PASSED: Space status updated correctly"
    else
        echo "❌ Test FAILED: Space status not updated as expected"
    fi
    
    echo "----------------------------------------"
}

# Main test execution
main() {
    echo "Starting Space Status Auto-Update Tests..."
    
    # Check if backend is running
    if ! curl -s "$API_BASE/health" > /dev/null 2>&1; then
        echo "❌ Backend is not running at $API_BASE"
        echo "Please start the backend first with: dotnet run"
        exit 1
    fi
    
    echo "✅ Backend is running"
    
    # Get auth token
    get_auth_token
    
    # Note: For real testing, you would need:
    # 1. Valid space IDs and booking IDs
    # 2. Proper authentication
    # 3. Test data setup
    
    echo "Manual testing instructions:"
    echo "1. Create a test space with ID: {SPACE_ID}"
    echo "2. Create a test booking with ID: {BOOKING_ID} for that space"
    echo "3. Run the following commands to test auto-update:"
    echo ""
    echo "Test CheckedIn -> Booked status:"
    echo "curl -X PUT $API_BASE/bookings/{BOOKING_ID}/status -H 'Content-Type: application/json' -d '{\"newStatus\":\"CheckedIn\"}'"
    echo "curl -X GET $API_BASE/spaces/{SPACE_ID} | jq '.status' # Should be 'Booked'"
    echo ""
    echo "Test Completed -> Available/Cleaning status:"
    echo "curl -X PUT $API_BASE/bookings/{BOOKING_ID}/status -H 'Content-Type: application/json' -d '{\"newStatus\":\"Completed\"}'"
    echo "curl -X GET $API_BASE/spaces/{SPACE_ID} | jq '.status' # Should be 'Available' or 'Cleaning'"
    echo ""
    echo "Test OverduePending -> Booked status:"
    echo "curl -X PUT $API_BASE/bookings/{BOOKING_ID}/status -H 'Content-Type: application/json' -d '{\"newStatus\":\"OverduePending\"}'"
    echo "curl -X GET $API_BASE/spaces/{SPACE_ID} | jq '.status' # Should be 'Booked'"
    
    # If you have specific test data, uncomment and modify these:
    # test_space_status_update "your-space-id" "your-booking-id" "CheckedIn"
    # test_space_status_update "your-space-id" "your-booking-id" "Completed"
    # test_space_status_update "your-space-id" "your-booking-id" "OverduePending"
}

# Run the tests
main "$@"
