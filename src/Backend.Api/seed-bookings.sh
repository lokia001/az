#!/bin/bash

echo "Seeding booking data..."

# Run the SQL script
sqlite3 app_development.db < seed-bookings.sql

# Verify the seeding
echo "Verifying seeded data..."
echo "Count of bookings:"
sqlite3 app_development.db "SELECT COUNT(*) as count FROM Bookings;"

echo "Sample of past bookings:"
sqlite3 app_development.db "SELECT BookingCode, StartTime, EndTime, Status FROM Bookings WHERE StartTime < '2025-06-14' LIMIT 3;"

echo "Sample of future bookings:"
sqlite3 app_development.db "SELECT BookingCode, StartTime, EndTime, Status FROM Bookings WHERE StartTime >= '2025-06-14' LIMIT 3;"

echo "Done!"
