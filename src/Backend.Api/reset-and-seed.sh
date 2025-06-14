#!/bin/bash

echo "Removing existing database..."
rm -f app_development.db app_development.db-shm app_development.db-wal

echo "Running migrations..."
dotnet ef database update

echo "Seeding data..."
sqlite3 app_development.db < seed-all.sql

echo "Verifying seeded data..."
echo "Users:"
sqlite3 app_development.db "SELECT UserName, Role, IsActive FROM Users;"

echo -e "\nSpaces:"
sqlite3 app_development.db "SELECT Name, Type, Status FROM Spaces;"

echo -e "\nAmenities:"
sqlite3 app_development.db "SELECT Name FROM SystemAmenities;"

echo -e "\nServices:"
sqlite3 app_development.db "SELECT Name FROM SystemSpaceServices;"

echo -e "\nSpace Images:"
sqlite3 app_development.db "SELECT s.Name, si.ImageUrl, si.IsCoverImage 
FROM Spaces s 
JOIN SpaceImages si ON s.Id = si.SpaceId;"

echo "Done!"
