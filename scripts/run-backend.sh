#!/bin/bash

# Script to run the backend application with proper permissions
# chmod +x run-backend.sh to make executable

# Determine the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
BACKEND_DIR="${SCRIPT_DIR}/../src/Backend.Api"
PUBLISH_DIR="${BACKEND_DIR}/publish"

# Check if the publish directory exists
if [ ! -d "$PUBLISH_DIR" ]; then
  echo "⚠️ Published files not found at ${PUBLISH_DIR}"
  echo "Publishing the application..."
  cd "$BACKEND_DIR" || exit 1
  dotnet publish -c Release -o publish
fi

# Set environment variable for a safer port if needed
export ASPNETCORE_URLS="http://0.0.0.0:5000"
export ASPNETCORE_ENVIRONMENT="Production"

# Print environment information
echo "🔍 Running with:"
echo "  - ASPNETCORE_URLS: $ASPNETCORE_URLS"
echo "  - ASPNETCORE_ENVIRONMENT: $ASPNETCORE_ENVIRONMENT"
echo "  - Working directory: $(pwd)"

# Run the application
cd "$PUBLISH_DIR" || exit 1
echo "🚀 Starting application from $(pwd)"
dotnet Backend.Api.dll
