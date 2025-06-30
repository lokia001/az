// src/features/profile/components/ProfilePageTest.jsx
// Temporary test component to check if profile page works
import React from 'react';
import { Container, Card, Alert } from 'react-bootstrap';

const ProfilePageTest = () => {
    return (
        <Container className="py-4">
            <Card>
                <Card.Header className="bg-primary text-white">
                    <h4 className="mb-0">Profile Page Test</h4>
                </Card.Header>
                <Card.Body>
                    <Alert variant="success">
                        ✅ Profile page is loading successfully!
                    </Alert>
                    <p>This is a test component to verify that the profile routing is working correctly.</p>
                    <ul>
                        <li>Route: /profile</li>
                        <li>Component: ProfilePageTest</li>
                        <li>Status: Working</li>
                    </ul>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ProfilePageTest;
