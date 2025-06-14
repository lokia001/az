#!/bin/bash

# Navigate to project directory
cd "$(dirname "$0")"

# Set environment variables if needed
export DOTNET_ENVIRONMENT=Development

# Run the seed script
dotnet run --project . Scripts/SeedAmenityAndServiceScript.cs

# Exit with the exit code of the dotnet command
exit $?
