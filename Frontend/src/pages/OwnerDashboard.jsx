// src/pages/OwnerDashboard.jsx
import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaHome, FaCalendarAlt, FaUsers, FaCog, FaChartLine } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const OwnerDashboard = () => {
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

            <Row className="g-4">
                {/* Quick Stats */}
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FaHome size={48} className="text-primary mb-3" />
                            <Card.Title>Không gian</Card.Title>
                            <Card.Text className="h3 text-success">5</Card.Text>
                            <Card.Text className="text-muted">Đang hoạt động</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FaCalendarAlt size={48} className="text-warning mb-3" />
                            <Card.Title>Đặt chỗ</Card.Title>
                            <Card.Text className="h3 text-warning">23</Card.Text>
                            <Card.Text className="text-muted">Tháng này</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FaUsers size={48} className="text-info mb-3" />
                            <Card.Title>Khách hàng</Card.Title>
                            <Card.Text className="h3 text-info">87</Card.Text>
                            <Card.Text className="text-muted">Tổng cộng</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FaChartLine size={48} className="text-success mb-3" />
                            <Card.Title>Doanh thu</Card.Title>
                            <Card.Text className="h3 text-success">₫50M</Card.Text>
                            <Card.Text className="text-muted">Tháng này</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-5">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0">
                                <FaChartLine className="me-2" />
                                Biểu đồ doanh thu
                            </h5>
                        </Card.Header>
                        <Card.Body style={{ height: '300px' }}>
                            <div className="d-flex align-items-center justify-content-center h-100">
                                <div className="text-center">
                                    <FaChartLine size={64} className="text-muted mb-3" />
                                    <p className="text-muted">Biểu đồ doanh thu sẽ được hiển thị ở đây</p>
                                    <small className="text-muted">Tính năng đang phát triển...</small>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
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

            <Row className="mt-4">
                <Col>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-secondary text-white">
                            <h5 className="mb-0">Hoạt động gần đây</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="text-center py-4">
                                <p className="text-muted">Danh sách hoạt động gần đây sẽ được hiển thị ở đây</p>
                                <small className="text-muted">Tính năng đang phát triển...</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default OwnerDashboard;
