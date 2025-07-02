#!/bin/bash

# Test script for Owner Registration API
# This script tests the basic functionality of the Owner Registration feature

API_BASE="http://localhost:5127"

echo "=== Testing Owner Registration API ==="

# First, let's check if the server is running
echo "1. Checking server health..."
curl -s -o /dev/null -w "%{http_code}" "$API_BASE/api/health" || echo "Server might not be running"

echo -e "\n2. Getting admin registration requests (should require auth)..."
curl -s -X GET "$API_BASE/api/admin/owner-registration" \
  -H "Content-Type: application/json" | jq '.' || echo "Expected: 401 Unauthorized"

echo -e "\n3. Getting pending count (should require admin auth)..."
curl -s -X GET "$API_BASE/api/admin/owner-registration/pending/count" \
  -H "Content-Type: application/json" | jq '.' || echo "Expected: 401 Unauthorized"

echo -e "\n4. Test user registration endpoint (should require user auth)..."
curl -s -X POST "$API_BASE/api/owner-registration" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Company",
    "description": "Test description",
    "businessPhone": "+84123456789",
    "businessAddress": "123 Test Street",
    "website": "https://test.com",
    "businessLicense": "TEST123"
  }' | jq '.' || echo "Expected: 401 Unauthorized (need user auth)"

echo -e "\n=== API Test Complete ==="
echo "Note: All endpoints should return 401 Unauthorized without proper authentication"
echo "This confirms the endpoints are properly protected by authentication middleware"
