-- Script SQL để thêm 10 Space kèm theo hình ảnh
-- Chạy bằng: sqlite3 app_development.db < seed-spaces.sql

BEGIN TRANSACTION;

-- Tạo 10 Space mới
INSERT INTO "Spaces" (
    "Id", "Name", "Description", "Address", "Type", "Status", 
    "Capacity", "PricePerHour", "PricePerDay", "OpenTime", "CloseTime", 
    "MinBookingDurationMinutes", "MaxBookingDurationMinutes", 
    "CancellationNoticeHours", "CleaningDurationMinutes", "BufferMinutes", 
    "AccessInstructions", "HouseRules", "Slug", "OwnerId", 
    "CreatedByUserId", "CreatedAt", "IsDeleted", "Latitude", "Longitude"
) VALUES
    (
        '5a84d4a1-3f4e-4868-80f2-2aca290f6e28', 
        'Urban Coworking Studio', 
        'A modern and vibrant coworking space in the heart of the city, perfect for freelancers and small teams.',
        '123 Downtown Avenue, District 1', 
        'Coworking', 
        'Active',
        25, 
        18.50, 
        120.00, 
        '08:00', 
        '22:00', 
        60, 
        480, 
        24, 
        30, 
        15, 
        'Enter through the main glass door and check in at the reception desk. WiFi password will be provided upon arrival.', 
        'Please maintain a quiet atmosphere. No smoking inside. Clean up after yourself in common areas.', 
        'urban-coworking-studio', 
        '89ddca54-a178-4683-9b09-25b47a141a5a', 
        '89ddca54-a178-4683-9b09-25b47a141a5a', 
        '2025-05-01 10:00:00', 
        0,
        10.782773,
        106.700882
    ),
    (
        'b329cde5-5f9a-4a4c-925a-fc3a66f252e2', 
        'Harmony Meeting Room', 
        'An elegant meeting room equipped with modern technology, ideal for business meetings and presentations.',
        '45 Business Park, Tower B, Floor 3', 
        'Meeting Room', 
        'Active',
        12, 
        25.00, 
        160.00, 
        '08:30', 
        '20:00', 
        60, 
        240, 
        48, 
        20, 
        10, 
        'Take the elevator to the 3rd floor, the room is on your right. The receptionist will provide the key card.', 
        'No food or drinks near the electronic equipment. Please turn off all devices when leaving.', 
        'harmony-meeting-room', 
        '89ddca54-a178-4683-9b09-25b47a141a5a', 
        '89ddca54-a178-4683-9b09-25b47a141a5a', 
        '2025-05-05 14:30:00', 
        0,
        10.786423,
        106.696791
    ),
    (
        'c7c9b8a7-65e4-4387-91d7-f3cf98912021', 
        'Green Garden Event Space', 
        'A beautiful outdoor space with lush greenery, perfect for events, parties, and gatherings.',
        '78 Greenview Road, District 7', 
        'Event Space', 
        'Active',
        100, 
        50.00, 
        350.00, 
        '09:00', 
        '23:00', 
        120, 
        720, 
        72, 
        60, 
        30, 
        'Enter through the garden gate. Security will check your booking confirmation. Parking available on-site.', 
        'No loud music after 10 PM. Respect the plants and garden features. All decorations must be removed after events.', 
        'green-garden-event-space', 
        '94ceba38-d615-4c19-b396-97691d8e13de', 
        '94ceba38-d615-4c19-b396-97691d8e13de', 
        '2025-05-10 09:15:00', 
        0,
        10.729568,
        106.725040
    ),
    (
        'd5e4f3a2-b1c0-4d7a-9e8b-0f1e2d3c4b5a', 
        'Creative Studio Loft', 
        'A spacious loft with natural lighting, perfect for photoshoots, creative workshops, and small productions.',
        '222 Arts District, Building C', 
        'Studio', 
        'Active',
        15, 
        35.00, 
        240.00, 
        '07:00', 
        '21:00', 
        120, 
        600, 
        48, 
        45, 
        20, 
        'Access code will be sent via SMS 1 hour before your booking. Equipment is in the storage closet near the entrance.', 
        'Return all furniture and equipment to original positions. No smoking. No pets allowed.', 
        'creative-studio-loft', 
        '94ceba38-d615-4c19-b396-97691d8e13de', 
        '94ceba38-d615-4c19-b396-97691d8e13de', 
        '2025-05-12 11:20:00', 
        0,
        10.772142, 
        106.704064
    ),
    (
        'e2e3e4e5-c6c7-4a4b-b2b3-a5a6a7a8a9a0', 
        'Tech Conference Room', 
        'A high-tech conference room with advanced AV equipment and fast internet, ideal for tech meetings and webinars.',
        '88 Innovation Park, Tech Tower, Floor 5', 
        'Conference Room', 
        'Active',
        30, 
        40.00, 
        280.00, 
        '08:00', 
        '20:00', 
        60, 
        480, 
        24, 
        30, 
        15, 
        'Check in at the main reception on ground floor. They will provide access to the 5th floor conference room.', 
        'Technical support available on request. No food allowed near computers. Please save energy when not in use.', 
        'tech-conference-room', 
        'a1a2a3a4-b1b2-c1c2-d1d2-e1e2e3e4e5e6', 
        'a1a2a3a4-b1b2-c1c2-d1d2-e1e2e3e4e5e6', 
        '2025-05-15 08:45:00', 
        0,
        10.802873,
        106.718955
    ),
    (
        'f9f8f7f6-e5e4-d3d2-c1b0-a9a8a7a6a5a4', 
        'Serenity Yoga Studio', 
        'A calm and peaceful studio perfect for yoga classes, meditation sessions, and wellness workshops.',
        '55 Wellness Avenue, District 3', 
        'Wellness Space', 
        'Active',
        20, 
        30.00, 
        200.00, 
        '06:00', 
        '22:00', 
        60, 
        180, 
        24, 
        30, 
        15, 
        'Remove shoes before entering. Yoga mats and props are available in the storage cabinet.', 
        'Please maintain silence in the studio area. Clean all equipment after use. No outside food.', 
        'serenity-yoga-studio', 
        'a1a2a3a4-b1b2-c1c2-d1d2-e1e2e3e4e5e6', 
        'a1a2a3a4-b1b2-c1c2-d1d2-e1e2e3e4e5e6', 
        '2025-05-18 15:30:00', 
        0,
        10.778549,
        106.688697
    ),
    (
        '0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', 
        'Culinary Workshop Kitchen', 
        'A fully equipped professional kitchen ideal for cooking classes, food photography, and culinary events.',
        '101 Food Street, District 2', 
        'Kitchen', 
        'Active',
        15, 
        45.00, 
        320.00, 
        '09:00', 
        '22:00', 
        120, 
        360, 
        48, 
        60, 
        30, 
        'Key will be provided by the building manager. Please inventory all equipment before and after use.', 
        'Clean all dishes and equipment after use. Report any damages immediately. No children under 12 without supervision.', 
        'culinary-workshop-kitchen', 
        'b2b3b4b5-c3c4-d4d5-e5e6-f6f7f8f9f0f1', 
        'b2b3b4b5-c3c4-d4d5-e5e6-f6f7f8f9f0f1', 
        '2025-05-20 10:00:00', 
        0,
        10.795834, 
        106.723570
    ),
    (
        '1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f', 
        'Vintage Recording Studio', 
        'A sound-proof recording studio with classic and modern equipment, perfect for music recording and podcasts.',
        '33 Music District, Sound Building, Basement', 
        'Recording Studio', 
        'Active',
        8, 
        55.00, 
        380.00, 
        '10:00', 
        '02:00', 
        120, 
        480, 
        72, 
        45, 
        30, 
        'Enter through the main entrance, take stairs to basement. Studio manager will meet you and provide equipment access.', 
        'No food or drinks in the control room. Technical assistance available for an additional fee. Bring your own storage devices.', 
        'vintage-recording-studio', 
        'b2b3b4b5-c3c4-d4d5-e5e6-f6f7f8f9f0f1', 
        'b2b3b4b5-c3c4-d4d5-e5e6-f6f7f8f9f0f1', 
        '2025-05-22 14:20:00', 
        0,
        10.765681,
        106.692028
    ),
    (
        '2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a', 
        'Panorama Rooftop Terrace', 
        'A stunning rooftop space with panoramic city views, perfect for social gatherings and small events.',
        '999 Skyline Tower, Floor 30', 
        'Event Space', 
        'Active',
        40, 
        60.00, 
        420.00, 
        '11:00', 
        '23:00', 
        120, 
        360, 
        72, 
        45, 
        30, 
        'Take the express elevator to floor 30. Security will verify your booking. Weather conditions may affect availability.', 
        'No glass containers near edges. Children must be supervised at all times. No smoking except in designated areas.', 
        'panorama-rooftop-terrace', 
        'c3c4c5c6-d5d6-e7e8-f9f0-a1a2a3a4a5a6', 
        'c3c4c5c6-d5d6-e7e8-f9f0-a1a2a3a4a5a6', 
        '2025-05-25 16:45:00', 
        0,
        10.774364,
        106.701273
    ),
    (
        '3e4f5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b', 
        'Quiet Study Library', 
        'A peaceful library space with private desks and fast WiFi, ideal for students and professionals who need focused time.',
        '77 Knowledge Street, Academic Center, Floor 2', 
        'Study Space', 
        'Active',
        30, 
        15.00, 
        90.00, 
        '07:00', 
        '23:00', 
        60, 
        720, 
        12, 
        15, 
        10, 
        'Show your booking confirmation at the reception desk. Lockers available for personal items.', 
        'Maintain silence at all times. No eating at desks. Phone calls allowed only in designated areas.', 
        'quiet-study-library', 
        'c3c4c5c6-d5d6-e7e8-f9f0-a1a2a3a4a5a6', 
        'c3c4c5c6-d5d6-e7e8-f9f0-a1a2a3a4a5a6', 
        '2025-05-30 09:30:00', 
        0,
        10.762052, 
        106.682003
    );

-- Thêm hình ảnh cho mỗi Space
INSERT INTO "SpaceImages" (
    "Id", "Caption", "CreatedAt", "DisplayOrder", "ImageUrl", "IsCoverImage", "SpaceId", "IsDeleted"
) VALUES
    -- Hình ảnh cho Urban Coworking Studio
    (
        '4f5a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c',
        'Modern open workspace with natural lighting',
        '2025-05-01 10:30:00',
        1,
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        1,
        '5a84d4a1-3f4e-4868-80f2-2aca290f6e28',
        0
    ),
    -- Hình ảnh cho Harmony Meeting Room
    (
        '5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d',
        'Professional conference setup with projection screen',
        '2025-05-05 15:00:00',
        1,
        'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        1,
        'b329cde5-5f9a-4a4c-925a-fc3a66f252e2',
        0
    ),
    -- Hình ảnh cho Green Garden Event Space
    (
        '6b7c8d9e-0f1a-2b3c-4d5e-6f7a8b9c0d1e',
        'Outdoor garden setup for evening events',
        '2025-05-10 09:45:00',
        1,
        'https://images.unsplash.com/photo-1464317442811-226cb7949825?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        1,
        'c7c9b8a7-65e4-4387-91d7-f3cf98912021',
        0
    ),
    -- Hình ảnh cho Creative Studio Loft
    (
        '7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f',
        'Spacious loft with photography equipment set up',
        '2025-05-12 11:50:00',
        1,
        'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        1,
        'd5e4f3a2-b1c0-4d7a-9e8b-0f1e2d3c4b5a',
        0
    ),
    -- Hình ảnh cho Tech Conference Room
    (
        '8d9e0f1a-2b3c-4d5e-6f7a-8b9c0d1e2f3a',
        'High-tech conference space with multiple displays',
        '2025-05-15 09:15:00',
        1,
        'https://images.unsplash.com/photo-1517502884422-41eaead166d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        1,
        'e2e3e4e5-c6c7-4a4b-b2b3-a5a6a7a8a9a0',
        0
    ),
    -- Hình ảnh cho Serenity Yoga Studio
    (
        '9e0f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b',
        'Peaceful yoga studio with bamboo flooring',
        '2025-05-18 16:00:00',
        1,
        'https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        1,
        'f9f8f7f6-e5e4-d3d2-c1b0-a9a8a7a6a5a4',
        0
    ),
    -- Hình ảnh cho Culinary Workshop Kitchen
    (
        '0f1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
        'Modern kitchen with cooking stations',
        '2025-05-20 10:30:00',
        1,
        'https://images.unsplash.com/photo-1556910638-3c34e919c320?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        1,
        '0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
        0
    ),
    -- Hình ảnh cho Vintage Recording Studio
    (
        '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
        'Professional recording booth with equipment',
        '2025-05-22 14:50:00',
        1,
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        1,
        '1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f',
        0
    ),
    -- Hình ảnh cho Panorama Rooftop Terrace
    (
        '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
        'Rooftop view of city skyline at sunset',
        '2025-05-25 17:15:00',
        1,
        'https://images.unsplash.com/photo-1505207288980-4554ce991ae3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        1,
        '2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a',
        0
    ),
    -- Hình ảnh cho Quiet Study Library
    (
        '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
        'Quiet study area with individual desks',
        '2025-05-30 10:00:00',
        1,
        'https://images.unsplash.com/photo-1568667256549-094345857637?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        1,
        '3e4f5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b',
        0
    );

-- Thêm liên kết giữa Spaces và SystemAmenities
INSERT INTO "SpaceSystemAmenities" ("SpaceId", "SystemAmenityId") VALUES
    -- Urban Coworking Studio
    ('5a84d4a1-3f4e-4868-80f2-2aca290f6e28', '3a31ccf0-4aa8-4504-b321-5a7e48e2958f'),  -- Wi-Fi
    ('5a84d4a1-3f4e-4868-80f2-2aca290f6e28', '51c2d5d7-f091-4c5e-a21b-bb592c6c9c3c'),  -- Air Conditioning
    ('5a84d4a1-3f4e-4868-80f2-2aca290f6e28', '89ee911a-b3ff-4b3e-9c8e-3df58f9b0836'),  -- Coffee Machine
    
    -- Harmony Meeting Room
    ('b329cde5-5f9a-4a4c-925a-fc3a66f252e2', '3a31ccf0-4aa8-4504-b321-5a7e48e2958f'),  -- Wi-Fi
    ('b329cde5-5f9a-4a4c-925a-fc3a66f252e2', '51c2d5d7-f091-4c5e-a21b-bb592c6c9c3c'),  -- Air Conditioning
    ('b329cde5-5f9a-4a4c-925a-fc3a66f252e2', '6b4e8713-8469-4233-826c-d9c4f607c3a9'),  -- Projector
    ('b329cde5-5f9a-4a4c-925a-fc3a66f252e2', '7f3a9dd3-d27f-4d71-b3c7-3e5a523e1d31'),  -- Whiteboard
    
    -- Green Garden Event Space
    ('c7c9b8a7-65e4-4387-91d7-f3cf98912021', '3a31ccf0-4aa8-4504-b321-5a7e48e2958f'),  -- Wi-Fi
    ('c7c9b8a7-65e4-4387-91d7-f3cf98912021', '97b8b120-bd89-4dda-a8a9-cf150db63bb7'),  -- Parking
    ('c7c9b8a7-65e4-4387-91d7-f3cf98912021', 'b81d5c56-8d0a-46b0-98e8-40fafbda4085'),  -- Restrooms
    
    -- Creative Studio Loft
    ('d5e4f3a2-b1c0-4d7a-9e8b-0f1e2d3c4b5a', '3a31ccf0-4aa8-4504-b321-5a7e48e2958f'),  -- Wi-Fi
    ('d5e4f3a2-b1c0-4d7a-9e8b-0f1e2d3c4b5a', '51c2d5d7-f091-4c5e-a21b-bb592c6c9c3c'),  -- Air Conditioning
    
    -- Tech Conference Room
    ('e2e3e4e5-c6c7-4a4b-b2b3-a5a6a7a8a9a0', '3a31ccf0-4aa8-4504-b321-5a7e48e2958f'),  -- Wi-Fi
    ('e2e3e4e5-c6c7-4a4b-b2b3-a5a6a7a8a9a0', '51c2d5d7-f091-4c5e-a21b-bb592c6c9c3c'),  -- Air Conditioning
    ('e2e3e4e5-c6c7-4a4b-b2b3-a5a6a7a8a9a0', '6b4e8713-8469-4233-826c-d9c4f607c3a9'),  -- Projector
    ('e2e3e4e5-c6c7-4a4b-b2b3-a5a6a7a8a9a0', 'c61a6a84-c790-4c33-b912-bbd8799d14dc'),  -- TV/Monitor
    
    -- Serenity Yoga Studio
    ('f9f8f7f6-e5e4-d3d2-c1b0-a9a8a7a6a5a4', '3a31ccf0-4aa8-4504-b321-5a7e48e2958f'),  -- Wi-Fi
    ('f9f8f7f6-e5e4-d3d2-c1b0-a9a8a7a6a5a4', '51c2d5d7-f091-4c5e-a21b-bb592c6c9c3c'),  -- Air Conditioning
    ('f9f8f7f6-e5e4-d3d2-c1b0-a9a8a7a6a5a4', 'b81d5c56-8d0a-46b0-98e8-40fafbda4085'),  -- Restrooms
    
    -- Culinary Workshop Kitchen
    ('0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', '3a31ccf0-4aa8-4504-b321-5a7e48e2958f'),  -- Wi-Fi
    ('0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', '51c2d5d7-f091-4c5e-a21b-bb592c6c9c3c'),  -- Air Conditioning
    ('0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', 'a6e1f317-90eb-4edf-b1de-8515f1b8d2a4'),  -- Kitchen Access
    
    -- Vintage Recording Studio
    ('1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f', '3a31ccf0-4aa8-4504-b321-5a7e48e2958f'),  -- Wi-Fi
    ('1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f', '51c2d5d7-f091-4c5e-a21b-bb592c6c9c3c'),  -- Air Conditioning
    
    -- Panorama Rooftop Terrace
    ('2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a', '3a31ccf0-4aa8-4504-b321-5a7e48e2958f'),  -- Wi-Fi
    ('2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a', '97b8b120-bd89-4dda-a8a9-cf150db63bb7'),  -- Parking
    ('2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a', 'b81d5c56-8d0a-46b0-98e8-40fafbda4085'),  -- Restrooms
    
    -- Quiet Study Library
    ('3e4f5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b', '3a31ccf0-4aa8-4504-b321-5a7e48e2958f'),  -- Wi-Fi
    ('3e4f5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b', '51c2d5d7-f091-4c5e-a21b-bb592c6c9c3c'),  -- Air Conditioning
    ('3e4f5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b', 'd91ef587-7d74-4308-a892-367918e57f08');  -- Wheelchair Access

-- Thêm liên kết giữa Spaces và SystemSpaceServices
INSERT INTO "SpaceSystemSpaceServices" ("SpaceId", "SystemSpaceServiceId", "IsIncludedInBasePrice", "Notes", "PriceOverride") VALUES
    -- Urban Coworking Studio
    ('5a84d4a1-3f4e-4868-80f2-2aca290f6e28', 'e4ffed5e-6147-4d7a-9a0e-78e263c6c834', 1, 'Daily cleaning included', NULL),
    ('5a84d4a1-3f4e-4868-80f2-2aca290f6e28', '588c8b04-4580-4b1c-85dd-8f993613412d', 0, 'Available at reception', 5.00),
    
    -- Harmony Meeting Room
    ('b329cde5-5f9a-4a4c-925a-fc3a66f252e2', '02b77c4c-2174-4658-b5c4-85438bc66ed2', 1, 'On-call tech support included', NULL),
    ('b329cde5-5f9a-4a4c-925a-fc3a66f252e2', 'f118afc6-3177-4732-a7ce-a7e4702124f0', 0, 'Catering options available', 25.00),
    
    -- Green Garden Event Space
    ('c7c9b8a7-65e4-4387-91d7-f3cf98912021', 'e4ffed5e-6147-4d7a-9a0e-78e263c6c834', 1, 'Cleanup after event included', NULL),
    ('c7c9b8a7-65e4-4387-91d7-f3cf98912021', 'f118afc6-3177-4732-a7ce-a7e4702124f0', 0, 'Various menu options', 35.00),
    ('c7c9b8a7-65e4-4387-91d7-f3cf98912021', '6f34480a-b03e-4b49-8e48-8215796d7eba', 0, 'Decorations available by request', 50.00),
    
    -- Creative Studio Loft
    ('d5e4f3a2-b1c0-4d7a-9e8b-0f1e2d3c4b5a', 'e4ffed5e-6147-4d7a-9a0e-78e263c6c834', 1, 'Studio cleaning included', NULL),
    ('d5e4f3a2-b1c0-4d7a-9e8b-0f1e2d3c4b5a', '412f1b38-5d25-4096-8fb9-98be8a5b5c6d', 0, 'Professional photographer available', 80.00),
    
    -- Tech Conference Room
    ('e2e3e4e5-c6c7-4a4b-b2b3-a5a6a7a8a9a0', '02b77c4c-2174-4658-b5c4-85438bc66ed2', 1, 'Full tech support included', NULL),
    ('e2e3e4e5-c6c7-4a4b-b2b3-a5a6a7a8a9a0', '588c8b04-4580-4b1c-85dd-8f993613412d', 1, 'Basic printing included', NULL),
    
    -- Serenity Yoga Studio
    ('f9f8f7f6-e5e4-d3d2-c1b0-a9a8a7a6a5a4', 'e4ffed5e-6147-4d7a-9a0e-78e263c6c834', 1, 'Sanitization between sessions included', NULL),
    
    -- Culinary Workshop Kitchen
    ('0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', 'e4ffed5e-6147-4d7a-9a0e-78e263c6c834', 1, 'Deep kitchen cleaning included', NULL),
    ('0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', '02b77c4c-2174-4658-b5c4-85438bc66ed2', 0, 'Kitchen equipment tech support', 30.00),
    
    -- Vintage Recording Studio
    ('1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f', '02b77c4c-2174-4658-b5c4-85438bc66ed2', 1, 'Sound engineer included', NULL),
    
    -- Panorama Rooftop Terrace
    ('2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a', 'e4ffed5e-6147-4d7a-9a0e-78e263c6c834', 1, 'Setup and cleanup included', NULL),
    ('2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a', 'f118afc6-3177-4732-a7ce-a7e4702124f0', 0, 'Premium catering services', 45.00),
    ('2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a', '6f34480a-b03e-4b49-8e48-8215796d7eba', 0, 'Elegant event decorations', 60.00),
    
    -- Quiet Study Library
    ('3e4f5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b', 'e4ffed5e-6147-4d7a-9a0e-78e263c6c834', 1, 'Daily desk cleaning included', NULL),
    ('3e4f5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b', '588c8b04-4580-4b1c-85dd-8f993613412d', 0, 'Print services available', 3.50);

COMMIT;
