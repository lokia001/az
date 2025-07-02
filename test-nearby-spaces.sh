#!/bin/bash

# Test script for nearby spaces API endpoint
echo "Testing Nearby Spaces API..."

# Test with coordinates in Ho Chi Minh City
echo "Testing with Ho Chi Minh City coordinates..."
curl -X GET "http://localhost:5035/api/spaces/nearby?userLatitude=10.7769&userLongitude=106.7009&maxDistanceKm=10&maxResults=10" \
  -H "Content-Type: application/json" \
  | jq '.'

echo ""
echo "Test completed!"
