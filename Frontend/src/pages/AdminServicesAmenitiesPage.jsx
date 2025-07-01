// src/pages/AdminServicesAmenitiesPage.jsx
import React from 'react';
import { Container, Row, Col, Card, Tabs, Tab } from 'react-bootstrap';
import { FaCog, FaGift } from 'react-icons/fa';
import SystemAmenitiesPage from '../features/systemItems/pages/SystemAmenitiesPage';
import SystemSpaceServicesPage from '../features/systemItems/pages/SystemSpaceServicesPage';

const AdminServicesAmenitiesPage = () => {
    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <h1 className="display-5 text-center text-primary mb-3">
                        <FaCog className="me-3" />
                        Quản lý Services & Amenities
                    </h1>
                    <p className="lead text-center text-muted">
                        Quản lý các dịch vụ và tiện ích hệ thống cho Owner sử dụng
                    </p>
                </Col>
            </Row>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom">
                    <Tabs defaultActiveKey="amenities" className="nav-tabs">
                        <Tab eventKey="amenities" title={
                            <>
                                <FaGift className="me-2" />
                                System Amenities
                            </>
                        }>
                            <div className="p-4">
                                <SystemAmenitiesPage />
                            </div>
                        </Tab>
                        <Tab eventKey="services" title={
                            <>
                                <FaCog className="me-2" />
                                System Services
                            </>
                        }>
                            <div className="p-4">
                                <SystemSpaceServicesPage />
                            </div>
                        </Tab>
                    </Tabs>
                </Card.Header>
            </Card>
        </Container>
    );
};

export default AdminServicesAmenitiesPage;
