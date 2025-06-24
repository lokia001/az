-- Delete any existing users and related data
DELETE FROM OwnerProfiles;
DELETE FROM Users;

-- Let's update all test users with 100% correct data
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
    IsDeleted,
    CreatedAt,
    UpdatedAt,
    DateOfBirth,
    Bio,
    Address,
    AvatarUrl,
    PasswordResetToken,
    PasswordResetTokenExpiry,
    RefreshToken,
    RefreshTokenExpiry
) VALUES 
-- Admin
(
    '1a000000-0000-0000-0000-000000000001',
    'admin',
    'admin@example.com',
    '$2a$12$U4.76kfKBRDAJRL6ptwy4uIhdBbIrFzuEmrPXKLjNYdqPwUo57nG6',  -- 123456
    'System Administrator',
    'Unknown',  -- Using enum string value
    '0901234567',
    'SysAdmin',  -- Using enum string value
    1,
    0,
    '2024-01-01 00:00:00',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
),
-- Owner1
(
    '2a000000-0000-0000-0000-000000000002',
    'owner1',
    'owner1@example.com',
    '$2a$12$U4.76kfKBRDAJRL6ptwy4uIhdBbIrFzuEmrPXKLjNYdqPwUo57nG6',  -- 123456
    'Space Owner One',
    'Unknown',  -- Using enum string value
    '0901234568',
    'Owner',  -- Using enum string value
    1,
    0,
    '2024-01-01 00:00:00',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
),
-- Test User
(
    '3a000000-0000-0000-0000-000000000003',
    'testuser',
    'testuser@example.com',
    '$2a$12$U4.76kfKBRDAJRL6ptwy4uIhdBbIrFzuEmrPXKLjNYdqPwUo57nG6',  -- 123456
    'Test User',
    'Unknown',  -- Using enum string value
    '0901234569',
    'User',  -- Using enum string value
    1,
    0,
    '2024-01-01 00:00:00',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
),
-- User1
(
    '4a000000-0000-0000-0000-000000000004',
    'user1',
    'user1@example.com',
    '$2a$12$U4.76kfKBRDAJRL6ptwy4uIhdBbIrFzuEmrPXKLjNYdqPwUo57nG6',  -- 123456
    'Regular User One',
    'Unknown',  -- Using enum string value
    '0901234570',
    'User',  -- Using enum string value
    1,
    0,
    '2024-01-01 00:00:00',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
);
