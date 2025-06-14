#!/bin/bash

# Navigate to project directory
cd "$(dirname "$0")"

# Run SQL script against SQLite database
echo "Running SQL seed script..."
sqlite3 app_development.db < seed-amenity-service.sql

# Check exit code
if [ $? -eq 0 ]; then
    echo "Data seeding completed successfully!"
else
    echo "Error: Failed to seed data!"
fi
