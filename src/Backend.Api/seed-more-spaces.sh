#!/bin/bash

echo "Seeding additional spaces and related data..."

# Run the SQL script
sqlite3 app_development.db < seed-more-spaces.sql

# Verify the seeding
echo "Verifying seeded data..."

echo "New Spaces:"
sqlite3 app_development.db "SELECT Name, Type, Status, PricePerHour FROM Spaces WHERE Id IN (
    '4B000000-0000-0000-0000-000000000004',
    '5B000000-0000-0000-0000-000000000005',
    '6B000000-0000-0000-0000-000000000006',
    '7B000000-0000-0000-0000-000000000007'
);"

echo -e "\nNew Space Images:"
sqlite3 app_development.db "SELECT s.Name, COUNT(si.Id) as ImageCount 
FROM Spaces s 
JOIN SpaceImages si ON s.Id = si.SpaceId 
WHERE s.Id IN (
    '4B000000-0000-0000-0000-000000000004',
    '5B000000-0000-0000-0000-000000000005',
    '6B000000-0000-0000-0000-000000000006',
    '7B000000-0000-0000-0000-000000000007'
) 
GROUP BY s.Name;"

echo -e "\nAmenities per Space:"
sqlite3 app_development.db "SELECT s.Name, COUNT(sa.SystemAmenityId) as AmenityCount 
FROM Spaces s 
JOIN SpaceSystemAmenities sa ON s.Id = sa.SpaceId 
WHERE s.Id IN (
    '4B000000-0000-0000-0000-000000000004',
    '5B000000-0000-0000-0000-000000000005',
    '6B000000-0000-0000-0000-000000000006',
    '7B000000-0000-0000-0000-000000000007'
) 
GROUP BY s.Name;"

echo -e "\nServices per Space:"
sqlite3 app_development.db "SELECT s.Name, COUNT(ss.SystemSpaceServiceId) as ServiceCount 
FROM Spaces s 
JOIN SpaceSystemSpaceServices ss ON s.Id = ss.SpaceId 
WHERE s.Id IN (
    '4B000000-0000-0000-0000-000000000004',
    '5B000000-0000-0000-0000-000000000005',
    '6B000000-0000-0000-0000-000000000006',
    '7B000000-0000-0000-0000-000000000007'
) 
GROUP BY s.Name;"

echo "Done!"
