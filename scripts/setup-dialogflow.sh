#!/bin/bash

# Script to setup Dialogflow environment
echo "Setting up Dialogflow environment..."

# Set the project directory
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$BASE_DIR/Frontendtest"
BACKEND_DIR="$BASE_DIR/src/Backend.Api"
CREDENTIALS_DIR="$BACKEND_DIR/credentials"

echo "Base directory: $BASE_DIR"
echo "Frontend directory: $FRONTEND_DIR"
echo "Backend directory: $BACKEND_DIR"
echo "Credentials directory: $CREDENTIALS_DIR"

# Check if credentials file exists
DIALOGFLOW_CREDS_FILE="$CREDENTIALS_DIR/dialogflow-es-credentials.json"
if [ -f "$DIALOGFLOW_CREDS_FILE" ]; then
    echo "✓ Dialogflow credentials file exists at: $DIALOGFLOW_CREDS_FILE"
else
    echo "✗ Dialogflow credentials file NOT FOUND at: $DIALOGFLOW_CREDS_FILE"
    echo "Please ensure the credentials file is placed in the correct location"
    exit 1
fi

# Check if GOOGLE_APPLICATION_CREDENTIALS environment variable is set
if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "✗ GOOGLE_APPLICATION_CREDENTIALS environment variable is not set"
    echo "Setting it temporarily for this session..."
    export GOOGLE_APPLICATION_CREDENTIALS="$DIALOGFLOW_CREDS_FILE"
    echo "✓ GOOGLE_APPLICATION_CREDENTIALS set to: $GOOGLE_APPLICATION_CREDENTIALS"
    
    # Suggest adding to shell profile
    echo ""
    echo "To make this permanent, add this line to your ~/.bashrc or ~/.zshrc:"
    echo "export GOOGLE_APPLICATION_CREDENTIALS=\"$DIALOGFLOW_CREDS_FILE\""
else
    echo "✓ GOOGLE_APPLICATION_CREDENTIALS already set to: $GOOGLE_APPLICATION_CREDENTIALS"
fi

# Check appsettings.json for correct Dialogflow configuration
APPSETTINGS="$BACKEND_DIR/appsettings.Development.json"
if [ -f "$APPSETTINGS" ]; then
    echo "✓ appsettings.Development.json exists"
    
    # Extract and check Dialogflow settings
    PROJECT_ID=$(grep -o '"ProjectId": *"[^"]*"' "$APPSETTINGS" | cut -d'"' -f4)
    CREDS_PATH=$(grep -o '"CredentialsPath": *"[^"]*"' "$APPSETTINGS" | cut -d'"' -f4)
    
    echo "Current Dialogflow configuration:"
    echo "  ProjectId: $PROJECT_ID"
    echo "  CredentialsPath: $CREDS_PATH"
    
    # Check credentials file path matches
    if [ "$CREDS_PATH" == "$DIALOGFLOW_CREDS_FILE" ]; then
        echo "✓ CredentialsPath in appsettings.Development.json matches actual file location"
    else
        echo "✗ CredentialsPath in appsettings.Development.json does NOT match actual file location"
        echo "Please update appsettings.Development.json with correct path: $DIALOGFLOW_CREDS_FILE"
    fi
else
    echo "✗ appsettings.Development.json not found"
    echo "Please ensure your backend configuration files are in place"
fi

# Check Google Cloud SDK
if command -v gcloud &> /dev/null; then
    echo "✓ Google Cloud SDK (gcloud) is installed"
    GCLOUD_VERSION=$(gcloud --version | head -n 1)
    echo "  $GCLOUD_VERSION"
else 
    echo "✗ Google Cloud SDK (gcloud) is not installed or not in PATH"
    echo "You might need to install the Google Cloud SDK for advanced Dialogflow management"
fi

# Print helpful information
echo ""
echo "Dialogflow environment setup complete"
echo ""
echo "For more information on setting up Dialogflow, visit:"
echo "https://cloud.google.com/dialogflow/es/docs/quick/setup"
echo ""
echo "Don't forget to check that your Dialogflow project has the necessary intents configured:"
echo "- Default Welcome Intent"
echo "- Default Fallback Intent"
echo "- search_workspace"
echo "- booking_inquiry"
echo "- greeting"

exit 0
