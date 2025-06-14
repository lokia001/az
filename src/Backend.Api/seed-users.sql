-- Seed SQL for Users
-- Run this script directly against your SQLite database using: sqlite3 app_development.db < seed-users.sql

BEGIN TRANSACTION;

-- Delete existing users with the same usernames/emails if they exist
DELETE FROM "Users" WHERE "Username" IN ('Owner1', 'User1', 'User2', 'User3', 'User4');
DELETE FROM "Users" WHERE "Email" IN ('owner1@example.com', 'user1@example.com', 'user2@example.com', 'user3@example.com', 'user4@example.com');

-- Insert Users
-- Note: Password "Paswor0rd!" is hashed using BCrypt
INSERT INTO "Users" (
    "Id", 
    "Username", 
    "Email", 
    "PasswordHash",
    "FullName", 
    "Gender", 
    "DateOfBirth",
    "Bio", 
    "PhoneNumber",
    "Address",
    "AvatarUrl",
    "Role",
    "CreatedAt",
    "IsActive",
    "IsDeleted"
) VALUES
    -- Owner1 with password: Paswor0rd!
    (
        'a1b2c3d4-e5f6-4a5b-9c3d-2e1f0a9b8c7d',
        'Owner1',
        'owner1@example.com',
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpxD.A.ekXygjC', -- Paswor0rd!
        'Owner One',
        'Male',
        '1990-01-01',
        'Experienced property owner with multiple spaces',
        '+84901234567',
        '123 Owner Street, District 1',
        'https://ui-avatars.com/api/?name=Owner+One',
        'Owner',
        '2025-06-14 10:00:00',
        1,
        0
    ),
    -- User1 with password: Paswor0rd!
    (
        'b2c3d4e5-f6a7-5b6c-0d1e-3f2g4h5i6j7',
        'User1',
        'user1@example.com',
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpxD.A.ekXygjC', -- Paswor0rd!
        'User One',
        'Female',
        '1992-02-02',
        'Regular user looking for great spaces',
        '+84901234568',
        '456 User Avenue, District 2',
        'https://ui-avatars.com/api/?name=User+One',
        'User',
        '2025-06-14 10:30:00',
        1,
        0
    ),
    -- User2 with random password
    (
        'c3d4e5f6-a7b8-6c7d-1e2f-4g5h6i7j8k9',
        'User2',
        'user2@example.com',
        '$2a$12$9bKqZMn8zK1JsL9IztJI.uD0/EHtR8JqQg9Q3z3UPJz1XDi3sQl6G',
        'User Two',
        'Male',
        '1994-03-03',
        'Digital nomad seeking workspace',
        '+84901234569',
        '789 Nomad Street, District 3',
        'https://ui-avatars.com/api/?name=User+Two',
        'User',
        '2025-06-14 11:00:00',
        1,
        0
    ),
    -- User3 with random password
    (
        'd4e5f6a7-b8c9-7d8e-2f3g-5h6i7j8k9l0',
        'User3',
        'user3@example.com',
        '$2a$12$1Rj4LHm7NB1dKs52QJEq8ODvxE.RAWnT8H.Yzn5j9lu0Y/jWGFBUy',
        'User Three',
        'Female',
        '1996-04-04',
        'Event organizer looking for venues',
        '+84901234570',
        '321 Event Road, District 4',
        'https://ui-avatars.com/api/?name=User+Three',
        'User',
        '2025-06-14 11:30:00',
        1,
        0
    ),
    -- User4 with random password
    (
        'e5f6a7b8-c9d0-8e9f-3g4h-6i7j8k9l0m1',
        'User4',
        'user4@example.com',
        '$2a$12$pZv0gDyGUb9Zs2TL4vU8te4TgCBvNn1XLVtqVcsGdY4Z8DIvLYXuW',
        'User Four',
        'Male',
        '1998-05-05',
        'Photographer seeking studio space',
        '+84901234571',
        '654 Studio Lane, District 5',
        'https://ui-avatars.com/api/?name=User+Four',
        'User',
        '2025-06-14 12:00:00',
        1,
        0
    );

COMMIT;
