-- Insert more spaces with proper enum values
INSERT INTO Spaces (
    Id,
    Name,
    Description,
    Address,
    Type,
    Status,
    Capacity,
    PricePerHour,
    PricePerDay,
    MinBookingDurationMinutes,
    MaxBookingDurationMinutes,
    CancellationNoticeHours,
    CleaningDurationMinutes,
    BufferMinutes,
    OwnerId,
    CreatedByUserId,
    CreatedAt,
    IsDeleted,
    Latitude,
    Longitude
) VALUES 
-- New Individual Spaces
(
    '4B000000-0000-0000-0000-000000000004',
    'Silent Focus Pod',
    'Perfect for individual work with soundproof walls',
    '123 Quiet Street, District 1',
    'Individual',
    'Available',
    1,
    25.00,
    200.00,
    60,
    480,
    24,
    30,
    15,
    '3A000000-0000-0000-0000-000000000003',
    '3A000000-0000-0000-0000-000000000003',
    '2025-06-14 00:00:00',
    0,
    10.762622,
    106.660172
),
-- New Group Space
(
    '5B000000-0000-0000-0000-000000000005',
    'Innovation Hub',
    'Modern group workspace with brainstorming tools',
    '456 Innovation Ave, District 2',
    'Group',
    'Available',
    20,
    150.00,
    1200.00,
    60,
    480,
    24,
    30,
    15,
    '3A000000-0000-0000-0000-000000000003',
    '3A000000-0000-0000-0000-000000000003',
    '2025-06-14 00:00:00',
    0,
    10.798374,
    106.657481
),
-- New MeetingRoom
(
    '6B000000-0000-0000-0000-000000000006',
    'Executive Boardroom',
    'High-end meeting room with video conferencing',
    '789 Business Blvd, District 3',
    'MeetingRoom',
    'Available',
    12,
    200.00,
    1600.00,
    60,
    480,
    24,
    30,
    15,
    '3A000000-0000-0000-0000-000000000003',
    '3A000000-0000-0000-0000-000000000003',
    '2025-06-14 00:00:00',
    0,
    10.776889,
    106.700897
),
-- New Studio Space
(
    '7B000000-0000-0000-0000-000000000007',
    'Content Creator Studio',
    'Professional studio setup for content creators',
    '101 Media Street, District 4',
    'Studio',
    'Available',
    8,
    180.00,
    1440.00,
    60,
    480,
    24,
    30,
    15,
    '3A000000-0000-0000-0000-000000000003',
    '3A000000-0000-0000-0000-000000000003',
    '2025-06-14 00:00:00',
    0,
    10.759752,
    106.704307
);

-- Insert Space Images for new spaces
INSERT INTO SpaceImages (
    Id,
    SpaceId,
    ImageUrl,
    IsCoverImage,
    DisplayOrder,
    CreatedAt,
    IsDeleted,
    Caption
) VALUES 
-- Images for Silent Focus Pod
(
    '4E000000-0000-0000-0000-000000000004',
    '4B000000-0000-0000-0000-000000000004',
    'https://images.unsplash.com/photo-1497366216548-37526070297c',
    1,
    1,
    '2025-06-14 00:00:00',
    0,
    'Main view'
),
(
    '4E100000-0000-0000-0000-000000000041',
    '4B000000-0000-0000-0000-000000000004',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72',
    0,
    2,
    '2025-06-14 00:00:00',
    0,
    'Interior view'
),
-- Images for Innovation Hub
(
    '5E000000-0000-0000-0000-000000000005',
    '5B000000-0000-0000-0000-000000000005',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    1,
    1,
    '2025-06-14 00:00:00',
    0,
    'Main area'
),
(
    '5E100000-0000-0000-0000-000000000051',
    '5B000000-0000-0000-0000-000000000005',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644',
    0,
    2,
    '2025-06-14 00:00:00',
    0,
    'Collaboration space'
),
-- Images for Executive Boardroom
(
    '6E000000-0000-0000-0000-000000000006',
    '6B000000-0000-0000-0000-000000000006',
    'https://images.unsplash.com/photo-1517502884422-41eaead166d4',
    1,
    1,
    '2025-06-14 00:00:00',
    0,
    'Conference room'
),
(
    '6E100000-0000-0000-0000-000000000061',
    '6B000000-0000-0000-0000-000000000006',
    'https://images.unsplash.com/photo-1577412647305-991150c7d163',
    0,
    2,
    '2025-06-14 00:00:00',
    0,
    'Meeting area'
),
-- Images for Content Creator Studio
(
    '7E000000-0000-0000-0000-000000000007',
    '7B000000-0000-0000-0000-000000000007',
    'https://images.unsplash.com/photo-1598387993441-a364f854c3e1',
    1,
    1,
    '2025-06-14 00:00:00',
    0,
    'Studio setup'
),
(
    '7E100000-0000-0000-0000-000000000071',
    '7B000000-0000-0000-0000-000000000007',
    'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3',
    0,
    2,
    '2025-06-14 00:00:00',
    0,
    'Recording area'
);

-- Link new spaces with existing amenities
INSERT INTO SpaceSystemAmenities (
    SpaceId,
    SystemAmenityId
) VALUES 
-- Silent Focus Pod amenities
(
    '4B000000-0000-0000-0000-000000000004',
    '1C000000-0000-0000-0000-000000000001'  -- WiFi
),
-- Innovation Hub amenities
(
    '5B000000-0000-0000-0000-000000000005',
    '1C000000-0000-0000-0000-000000000001'  -- WiFi
),
(
    '5B000000-0000-0000-0000-000000000005',
    '2C000000-0000-0000-0000-000000000002'  -- Projector
),
-- Executive Boardroom amenities
(
    '6B000000-0000-0000-0000-000000000006',
    '1C000000-0000-0000-0000-000000000001'  -- WiFi
),
(
    '6B000000-0000-0000-0000-000000000006',
    '2C000000-0000-0000-0000-000000000002'  -- Projector
),
(
    '6B000000-0000-0000-0000-000000000006',
    '3C000000-0000-0000-0000-000000000003'  -- Coffee Machine
),
-- Content Creator Studio amenities
(
    '7B000000-0000-0000-0000-000000000007',
    '1C000000-0000-0000-0000-000000000001'  -- WiFi
);

-- Link new spaces with services
INSERT INTO SpaceSystemSpaceServices (
    SpaceId,
    SystemSpaceServiceId,
    IsIncludedInBasePrice
) VALUES 
-- Silent Focus Pod services
(
    '4B000000-0000-0000-0000-000000000004',
    '1D000000-0000-0000-0000-000000000001',  -- Cleaning
    1
),
-- Innovation Hub services
(
    '5B000000-0000-0000-0000-000000000005',
    '1D000000-0000-0000-0000-000000000001',  -- Cleaning
    1
),
(
    '5B000000-0000-0000-0000-000000000005',
    '2D000000-0000-0000-0000-000000000002',  -- Reception
    1
),
-- Executive Boardroom services
(
    '6B000000-0000-0000-0000-000000000006',
    '1D000000-0000-0000-0000-000000000001',  -- Cleaning
    1
),
(
    '6B000000-0000-0000-0000-000000000006',
    '2D000000-0000-0000-0000-000000000002',  -- Reception
    1
),
(
    '6B000000-0000-0000-0000-000000000006',
    '3D000000-0000-0000-0000-000000000003',  -- Security
    1
),
-- Content Creator Studio services
(
    '7B000000-0000-0000-0000-000000000007',
    '1D000000-0000-0000-0000-000000000001',  -- Cleaning
    1
),
(
    '7B000000-0000-0000-0000-000000000007',
    '3D000000-0000-0000-0000-000000000003',  -- Security
    1
);
