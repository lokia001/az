#!/bin/bash

# Get a valid token
# 1. First, we need to log in to get a token
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5285/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "owner@example.com", "password": "Pass123$"}')

# Extract token from login response
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Failed to get token. Login response: $LOGIN_RESPONSE"
  exit 1
fi

echo "Got token: $TOKEN"

# 2. Find one of the user's spaces
echo "Fetching owner spaces..."
SPACES_RESPONSE=$(curl -s -X GET http://localhost:5285/api/owner/spaces \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

# Extract the first space ID
SPACE_ID=$(echo $SPACES_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$SPACE_ID" ]; then
  echo "Failed to get space ID. Spaces response: $SPACES_RESPONSE"
  exit 1
fi

echo "Got space ID: $SPACE_ID"

# 3. Update the space status
echo "Updating space status..."
UPDATE_RESPONSE=$(curl -v -X PUT "http://localhost:5285/api/owner/spaces/$SPACE_ID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "Maintenance"}')

echo "Update response: $UPDATE_RESPONSE"
