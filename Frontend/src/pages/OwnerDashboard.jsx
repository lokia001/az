// src/pages/OwnerDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaHome, FaCalendarAlt, FaUsers, FaCog, FaChartLine, FaTools } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';

const OwnerDashboard = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        apiClient.get('/api/owner/spaces/dashboard-summary')
          .then(res => setSummary(res.data))
          .catch(() => setError('Không tải được dữ liệu'))
          .finally(() => setLoading(false));
    }, []);
    
    if (loading) {
        return <div className="text-center py-5">Loading...</div>;
    }
    if (error) {
        return <div className="text-center py-5 text-danger">{error}</div>;
    }
    const { totalSpaces, maintenanceSpaces, recentActivities } = summary;
    const availableSpaces = totalSpaces - maintenanceSpaces;
    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <h1 className="display-4 text-center text-primary mb-3">
                        <FaHome className="me-3" />
                        Owner Dashboard
                    </h1>
                    <p className="lead text-center text-muted">
                        Quản lý không gian làm việc và doanh nghiệp của bạn
                    </p>
                </Col>
            </Row>

            {/* Quick Stats Row */}
            <Row className="g-4">
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FaHome size={48} className="text-primary mb-3" />
                            <Card.Title>Tổng không gian</Card.Title>
                            <Card.Text className="h3 text-success">{totalSpaces}</Card.Text>
                            <Card.Text className="text-muted">Đang hoạt động</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FaCalendarAlt size={48} className="text-warning mb-3" />
                            <Card.Title>Đặt chỗ</Card.Title>
                            <Card.Text className="h3 text-warning">{summary.totalBookings}</Card.Text>
                            <Card.Text className="text-muted">Hoàn thành: {((summary.completedBookings/summary.totalBookings)*100 || 0).toFixed(0)}%</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FaUsers size={48} className="text-info mb-3" />
                            <Card.Title>Người dùng</Card.Title>
                            <Card.Text className="h3 text-info">{summary.uniqueUsers}</Card.Text>
                            <Card.Text className="text-muted">Tháng này</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FaChartLine size={48} className="text-success mb-3" />
                            <Card.Title>Doanh thu</Card.Title>
                            <Card.Text className="h3 text-success">₫{summary.revenue.toLocaleString()}</Card.Text>
                            <Card.Text className="text-muted">Tháng này</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-5">
                <Col>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-info text-white">
                            <h5 className="mb-0">
                                <FaCog className="me-2" />
                                Thao tác nhanh
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-grid gap-2">
                                <Button as={Link} to="/owner/manage-spaces" variant="outline-primary">
                                    <FaHome className="me-2" />
                                    Quản lý không gian
                                </Button>
                                <Button as={Link} to="/owner/bookings" variant="outline-warning">
                                    <FaCalendarAlt className="me-2" />
                                    Xem đặt chỗ
                                </Button>
                                <Button as={Link} to="/owner/customers" variant="outline-info">
                                    <FaUsers className="me-2" />
                                    Quản lý khách hàng
                                </Button>
                                <Button as={Link} to="/owner/services-amenities" variant="outline-success">
                                    <FaCog className="me-2" />
                                    Dịch vụ & Tiện ích
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default OwnerDashboard;
