// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaShieldAlt, FaUsers } from 'react-icons/fa';
import api from '../services/api';
import SystemLogs from '../components/SystemLogs';

const AdminDashboard = () => {
    const [showLogs, setShowLogs] = useState(false);
    const [userCount, setUserCount] = useState(null);
    // Fetch total user count
    useEffect(() => {
        const loadCount = async () => {
            try {
                const res = await api.get('/admin/users?page=1&pageSize=1');
                const data = res.data;
                // PagedResultDto returns totalCount directly or nested under pagination
                const count = data.totalCount ?? data.TotalCount ?? data.pagination?.totalCount ?? 0;
                setUserCount(count);
            } catch (_) {
                setUserCount(0);
            }
        };
        loadCount();
    }, []);

    const toggleLogs = () => {
        setShowLogs(!showLogs);
    };
    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <h1 className="display-4 text-center text-danger mb-3">
                        <FaShieldAlt className="me-3" />
                        System Admin Dashboard
                    </h1>
                    <p className="lead text-center text-muted">
                        Quản trị và giám sát hệ thống toàn diện
                    </p>
                </Col>
            </Row>

            {/* Total Accounts Card */}
            <Row className="g-4">
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FaUsers size={48} className="text-primary mb-3" />
                            <Card.Title>Tổng tài khoản</Card.Title>
                            <Card.Text className="h3 text-primary">{userCount !== null ? userCount : '...'}</Card.Text>
                        </Card.Body>
                        <Card.Footer className="bg-white border-0 text-center">
                            <Button variant="outline-danger" onClick={toggleLogs}>
                                {showLogs ? 'Ẩn System Logs' : 'Xem System Logs'}
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

            {/* System Logs Section */}
            {showLogs && (
                <Row className="mt-4">
                    <Col lg={12}>
                        <SystemLogs />
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default AdminDashboard;
