// Frontend/src/features/ownerRegistration/pages/OwnerRegistrationPage.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Nav, Tab } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import OwnerRegistrationForm from '../components/OwnerRegistrationForm';
import OwnerRegistrationStatus from '../components/OwnerRegistrationStatus';
import { selectUserRequest } from '../slices/ownerRegistrationSlice';

const OwnerRegistrationPage = () => {
    const userRequest = useSelector(selectUserRequest);
    const [activeTab, setActiveTab] = useState(userRequest ? 'status' : 'register');

    const handleRegistrationSuccess = () => {
        setActiveTab('status');
    };

    const handleNewRegistration = () => {
        setActiveTab('register');
    };

    return (
        <Container className="my-4">
            <Row>
                <Col>
                    <h2 className="mb-4">Đăng ký làm chủ không gian</h2>
                    
                    <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                        <Nav variant="tabs" className="mb-4">
                            <Nav.Item>
                                <Nav.Link eventKey="status">
                                    Trạng thái yêu cầu
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="register">
                                    Đăng ký mới
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>

                        <Tab.Content>
                            <Tab.Pane eventKey="status">
                                <OwnerRegistrationStatus onNewRegistration={handleNewRegistration} />
                            </Tab.Pane>
                            
                            <Tab.Pane eventKey="register">
                                <OwnerRegistrationForm onSuccess={handleRegistrationSuccess} />
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </Col>
            </Row>
        </Container>
    );
};

export default OwnerRegistrationPage;
