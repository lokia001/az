-- Seed SQL for SystemAmenity and SystemSpaceService
-- Run this script directly against your SQLite database using: sqlite3 app_development.db < seed-amenity-service-final.sql

BEGIN TRANSACTION;

-- Delete existing data in the joint tables first to avoid constraint violations
DELETE FROM "SpaceSystemAmenities" WHERE 1=1;
DELETE FROM "SpaceSystemSpaceServices" WHERE 1=1;

-- Delete existing data in the main tables
DELETE FROM "SystemAmenities" WHERE 1=1;
DELETE FROM "SystemSpaceServices" WHERE 1=1;

-- Insert SystemAmenity data
INSERT INTO "SystemAmenities" ("Id", "Name", "Description", "IconUrl")
VALUES
    ('3a31ccf0-4aa8-4504-b321-5a7e48e2958f', 'Wi-Fi', 'High-speed wireless internet connection', '/icons/wifi.png'),
    ('51c2d5d7-f091-4c5e-a21b-bb592c6c9c3c', 'Air Conditioning', 'Climate control system for comfort', '/icons/air-conditioning.png'),
    ('6b4e8713-8469-4233-826c-d9c4f607c3a9', 'Projector', 'HD projector for presentations', '/icons/projector.png'),
    ('7f3a9dd3-d27f-4d71-b3c7-3e5a523e1d31', 'Whiteboard', 'Large whiteboard with markers', '/icons/whiteboard.png'),
    ('89ee911a-b3ff-4b3e-9c8e-3df58f9b0836', 'Coffee Machine', 'Premium coffee machine with various options', '/icons/coffee.png'),
    ('97b8b120-bd89-4dda-a8a9-cf150db63bb7', 'Parking', 'Free on-site parking for guests', '/icons/parking.png'),
    ('a6e1f317-90eb-4edf-b1de-8515f1b8d2a4', 'Kitchen Access', 'Access to a fully equipped kitchen', '/icons/kitchen.png'),
    ('b81d5c56-8d0a-46b0-98e8-40fafbda4085', 'Restrooms', 'Clean private restrooms', '/icons/restroom.png'),
    ('c61a6a84-c790-4c33-b912-bbd8799d14dc', 'TV/Monitor', 'Large screen TV/Monitor for presentations', '/icons/tv.png'),
    ('d91ef587-7d74-4308-a892-367918e57f08', 'Wheelchair Access', 'Easy access for persons with disabilities', '/icons/wheelchair.png');

-- Insert SystemSpaceService data
INSERT INTO "SystemSpaceServices" ("Id", "Name", "Description")
VALUES
    ('e4ffed5e-6147-4d7a-9a0e-78e263c6c834', 'Cleaning Service', 'Professional cleaning before and after events'),
    ('f118afc6-3177-4732-a7ce-a7e4702124f0', 'Catering', 'Food and beverage service options'),
    ('02b77c4c-2174-4658-b5c4-85438bc66ed2', 'Technical Support', 'On-site technical assistance for AV equipment'),
    ('1842342e-1d40-4652-beda-694a1af7ab0b', 'Event Setup', 'Setup of furniture and equipment for your event'),
    ('27e5cb0c-87f6-4ef1-9385-b6e8dbaafb10', 'Security', 'Security personnel during the event'),
    ('391da8d5-d0f9-498e-b89c-a0fc4ddbb345', 'Reception', 'Front desk reception services for guests'),
    ('412f1b38-5d25-4096-8fb9-98be8a5b5c6d', 'Photography', 'Professional event photography'),
    ('588c8b04-4580-4b1c-85dd-8f993613412d', 'Printing', 'Printing and copying services for attendees'),
    ('6f34480a-b03e-4b49-8e48-8215796d7eba', 'Decoration', 'Event space decoration services'),
    ('7aab8d88-6ca2-4beb-b671-0badf84e7694', 'Shuttle Service', 'Transportation to and from nearby locations');

COMMIT;
