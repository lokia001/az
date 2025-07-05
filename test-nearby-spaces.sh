#!/bin/bash

# Test script for nearby spaces API endpoint
echo "Testing Nearby Spaces API..."

# Test with coordinates in Ho Chi Minh City
echo "Testing with Ho Chi Minh City coordinates..."
curl -X GET "http://localhost:5035/api/spaces/nearby?UserLatitude=10.7769&UserLongitude=106.7009&MaxDistanceKm=10&MaxResults=10" \
  -H "Content-Type: application/json" \
  | jq '.'

echo ""
echo "Test completed!"
