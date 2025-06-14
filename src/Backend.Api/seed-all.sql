-- Clean existing data
DELETE FROM Users;
DELETE FROM Spaces;
DELETE FROM SpaceImages;
DELETE FROM SystemAmenities;
DELETE FROM SystemSpaceServices;
DELETE FROM SpaceSystemAmenities;
DELETE FROM SpaceSystemSpaceServices;
DELETE FROM Bookings;

-- Insert core users with password "123456"
INSERT INTO Users (
    Id,
    UserName,
    Email,
    PasswordHash,
    FirstName,
    LastName,
    PhoneNumber,
    Role,
    IsActive,
    CreatedAt
) VALUES 
-- Password: 123456 (using bcrypt)
(
    '1A000000-0000-0000-0000-000000000001',
    'admin',
    'admin@example.com',
    '$2a$11$VQWDyM8v6OXAIuB7ClFXkeh7H7USWBJQCXDoKV5DjVX7QzLHUYVA6',
    'System',
    'Admin',
    '1234567890',
    'Admin',
    1,
    '2025-06-14 00:00:00'
),
(
    '2A000000-0000-0000-0000-000000000002',
    'user1',
    'user1@example.com',
    '$2a$11$VQWDyM8v6OXAIuB7ClFXkeh7H7USWBJQCXDoKV5DjVX7QzLHUYVA6',
    'Normal',
    'User',
    '1234567891',
    'User',
    1,
    '2025-06-14 00:00:00'
),
(
    '3A000000-0000-0000-0000-000000000003',
    'owner1',
    'owner1@example.com',
    '$2a$11$VQWDyM8v6OXAIuB7ClFXkeh7H7USWBJQCXDoKV5DjVX7QzLHUYVA6',
    'Space',
    'Owner',
    '1234567892',
    'Owner',
    1,
    '2025-06-14 00:00:00'
);

-- Insert additional users from previous seed
INSERT INTO Users (
    Id,
    UserName,
    Email,
    PasswordHash,
    FirstName,
    LastName,
    PhoneNumber,
    Role,
    IsActive,
    CreatedAt
) VALUES 
(
    '4A000000-0000-0000-0000-000000000004',
    'user2',
    'user2@example.com',
    '$2a$11$VQWDyM8v6OXAIuB7ClFXkeh7H7USWBJQCXDoKV5DjVX7QzLHUYVA6',
    'Test',
    'User2',
    '1234567893',
    'User',
    1,
    '2025-06-14 00:00:00'
),
(
    '5A000000-0000-0000-0000-000000000005',
    'owner2',
    'owner2@example.com',
    '$2a$11$VQWDyM8v6OXAIuB7ClFXkeh7H7USWBJQCXDoKV5DjVX7QzLHUYVA6',
    'Test',
    'Owner2',
    '1234567894',
    'Owner',
    1,
    '2025-06-14 00:00:00'
);

-- Insert Spaces
INSERT INTO Spaces (
    Id,
    Name,
    Description,
    Address,
    Type,
    Status,
    Capacity,
    PricePerHour,
    OwnerId,
    CreatedByUserId,
    CreatedAt
) VALUES 
(
    '1B000000-0000-0000-0000-000000000001',
    'Modern Meeting Room',
    'A modern meeting room with all facilities',
    '123 Business Street',
    'MeetingRoom',
    'Available',
    10,
    50.00,
    '3A000000-0000-0000-0000-000000000003',
    '3A000000-0000-0000-0000-000000000003',
    '2025-06-14 00:00:00'
),
(
    '2B000000-0000-0000-0000-000000000002',
    'Creative Studio',
    'Perfect for creative work',
    '456 Art Avenue',
    'Studio',
    'Available',
    5,
    75.00,
    '3A000000-0000-0000-0000-000000000003',
    '3A000000-0000-0000-0000-000000000003',
    '2025-06-14 00:00:00'
),
(
    '3B000000-0000-0000-0000-000000000003',
    'Group Workspace',
    'Ideal for team collaboration',
    '789 Team Road',
    'Group',
    'Available',
    15,
    100.00,
    '5A000000-0000-0000-0000-000000000005',
    '5A000000-0000-0000-0000-000000000005',
    '2025-06-14 00:00:00'
);

-- Insert SystemAmenities
INSERT INTO SystemAmenities (
    Id,
    Name,
    Description
) VALUES 
(
    '1C000000-0000-0000-0000-000000000001',
    'WiFi',
    'High-speed internet access'
),
(
    '2C000000-0000-0000-0000-000000000002',
    'Projector',
    'HD projector with screen'
),
(
    '3C000000-0000-0000-0000-000000000003',
    'Coffee Machine',
    'Premium coffee maker'
);

-- Insert SystemSpaceServices
INSERT INTO SystemSpaceServices (
    Id,
    Name,
    Description
) VALUES 
(
    '1D000000-0000-0000-0000-000000000001',
    'Cleaning',
    'Daily cleaning service'
),
(
    '2D000000-0000-0000-0000-000000000002',
    'Reception',
    '24/7 reception service'
),
(
    '3D000000-0000-0000-0000-000000000003',
    'Security',
    'Security monitoring'
);

-- Link Spaces with Amenities
INSERT INTO SpaceSystemAmenities (
    SpaceId,
    SystemAmenityId
) VALUES 
(
    '1B000000-0000-0000-0000-000000000001',
    '1C000000-0000-0000-0000-000000000001'
),
(
    '1B000000-0000-0000-0000-000000000001',
    '2C000000-0000-0000-0000-000000000002'
),
(
    '2B000000-0000-0000-0000-000000000002',
    '1C000000-0000-0000-0000-000000000001'
),
(
    '3B000000-0000-0000-0000-000000000003',
    '1C000000-0000-0000-0000-000000000001'
),
(
    '3B000000-0000-0000-0000-000000000003',
    '3C000000-0000-0000-0000-000000000003'
);

-- Link Spaces with Services
INSERT INTO SpaceSystemSpaceServices (
    SpaceId,
    SystemSpaceServiceId
) VALUES 
(
    '1B000000-0000-0000-0000-000000000001',
    '1D000000-0000-0000-0000-000000000001'
),
(
    '2B000000-0000-0000-0000-000000000002',
    '1D000000-0000-0000-0000-000000000001'
),
(
    '3B000000-0000-0000-0000-000000000003',
    '1D000000-0000-0000-0000-000000000001'
),
(
    '3B000000-0000-0000-0000-000000000003',
    '2D000000-0000-0000-0000-000000000002'
);

-- Insert Space Images
INSERT INTO SpaceImages (
    Id,
    SpaceId,
    ImageUrl,
    IsCoverImage,
    DisplayOrder,
    CreatedAt
) VALUES 
(
    '1E000000-0000-0000-0000-000000000001',
    '1B000000-0000-0000-0000-000000000001',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2',
    1,
    1,
    '2025-06-14 00:00:00'
),
(
    '2E000000-0000-0000-0000-000000000002',
    '2B000000-0000-0000-0000-000000000002',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72',
    1,
    1,
    '2025-06-14 00:00:00'
),
(
    '3E000000-0000-0000-0000-000000000003',
    '3B000000-0000-0000-0000-000000000003',
    'https://images.unsplash.com/photo-1497366216548-37526070297c',
    1,
    1,
    '2025-06-14 00:00:00'
);
