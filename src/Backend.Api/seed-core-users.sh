#!/bin/bash

echo "Creating seed script for core users..."

# Create the SQL script
cat > seed-core-users.sql << 'EOF'
-- Delete existing users and related data
DELETE FROM OwnerProfiles;
DELETE FROM Users;

-- Insert core users with password "123456" (using bcrypt hash)
INSERT INTO Users (
    Id,
    Username,
    Email,
    PasswordHash,
    FullName,
    Gender,
    PhoneNumber,
    Role,
    IsActive,
    CreatedAt,
    IsDeleted
) VALUES 
-- System Admin
(
    '1A000000-0000-0000-0000-000000000001',
    'admin',
    'admin@example.com',
    '$2a$11$VQWDyM8v6OXAIuB7ClFXkeh7H7USWBJQCXDoKV5DjVX7QzLHUYVA6',  -- 123456
    'System Administrator',
    'Other',
    '0901234567',
    'SysAdmin',
    1,
    '2025-06-14 00:00:00',
    0
),
-- Owner1
(
    '2A000000-0000-0000-0000-000000000002',
    'owner1',
    'owner1@example.com',
    '$2a$11$VQWDyM8v6OXAIuB7ClFXkeh7H7USWBJQCXDoKV5DjVX7QzLHUYVA6',  -- 123456
    'Space Owner One',
    'Other',
    '0901234568',
    'Owner',
    1,
    '2025-06-14 00:00:00',
    0
),
-- User1
(
    '3A000000-0000-0000-0000-000000000003',
    'user1',
    'user1@example.com',
    '$2a$11$VQWDyM8v6OXAIuB7ClFXkeh7H7USWBJQCXDoKV5DjVX7QzLHUYVA6',  -- 123456
    'Normal User One',
    'Other',
    '0901234569',
    'User',
    1,
    '2025-06-14 00:00:00',
    0
);

-- Insert owner profile for owner1
INSERT INTO OwnerProfiles (
    UserId,
    CompanyName,
    ContactInfo,
    Description,
    BusinessLicenseNumber,
    TaxCode,
    Website,
    IsVerified,
    CreatedAt
) VALUES (
    '2A000000-0000-0000-0000-000000000002',
    'Space Owner Company',
    'Contact via email or phone',
    'Professional space management company',
    'BL123456789',
    'TC123456789',
    'https://spaceowner.example.com',
    1,
    '2025-06-14 00:00:00'
);
EOF

echo "Seeding core users..."
sqlite3 app_development.db < seed-core-users.sql

echo "Verifying seeded data..."
echo "Users:"
sqlite3 app_development.db "SELECT Username, Email, Role, FullName FROM Users ORDER BY Role;"

echo -e "\nOwner Profile:"
sqlite3 app_development.db "SELECT u.Username, op.CompanyName, op.IsVerified 
FROM Users u 
JOIN OwnerProfiles op ON u.Id = op.UserId;"

echo "Done!"
