// src/pages/AdminDashboard.jsx
import React from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import { FaShieldAlt, FaUsers, FaCog, FaChartBar, FaExclamationTriangle, FaServer } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
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

            <Row className="g-4">
                {/* System Stats */}
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FaUsers size={48} className="text-primary mb-3" />
                            <Card.Title>Người dùng</Card.Title>
                            <Card.Text className="h3 text-primary">1,234</Card.Text>
                            <Card.Text className="text-muted">Tổng tài khoản</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FaServer size={48} className="text-success mb-3" />
                            <Card.Title>Hệ thống</Card.Title>
                            <Card.Text className="h3 text-success">Online</Card.Text>
                            <Card.Text className="text-muted">Trạng thái</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FaExclamationTriangle size={48} className="text-warning mb-3" />
                            <Card.Title>Cảnh báo</Card.Title>
                            <Card.Text className="h3 text-warning">3</Card.Text>
                            <Card.Text className="text-muted">Cần xử lý</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FaChartBar size={48} className="text-info mb-3" />
                            <Card.Title>Uptime</Card.Title>
                            <Card.Text className="h3 text-info">99.9%</Card.Text>
                            <Card.Text className="text-muted">30 ngày qua</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-5">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-danger text-white">
                            <h5 className="mb-0">
                                <FaChartBar className="me-2" />
                                System Performance
                            </h5>
                        </Card.Header>
                        <Card.Body style={{ height: '300px' }}>
                            <div className="d-flex align-items-center justify-content-center h-100">
                                <div className="text-center">
                                    <FaChartBar size={64} className="text-muted mb-3" />
                                    <p className="text-muted">Biểu đồ hiệu suất hệ thống sẽ được hiển thị ở đây</p>
                                    <small className="text-muted">Tính năng đang phát triển...</small>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-dark text-white">
                            <h5 className="mb-0">
                                <FaCog className="me-2" />
                                Admin Tools
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-grid gap-2">
                                <Button as={Link} to="/admin/accounts" variant="outline-primary">
                                    <FaUsers className="me-2" />
                                    Quản lý tài khoản
                                </Button>
                                <Button as={Link} to="/admin/services-amenities" variant="outline-warning">
                                    <FaCog className="me-2" />
                                    Services & Amenities
                                </Button>
                                <Button as={Link} to="/community" variant="outline-info">
                                    <FaUsers className="me-2" />
                                    Community
                                </Button>
                                <Button variant="outline-danger" disabled>
                                    <FaShieldAlt className="me-2" />
                                    System Logs
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col lg={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-warning text-dark">
                            <h5 className="mb-0">
                                <FaExclamationTriangle className="me-2" />
                                Recent Alerts
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Table striped bordered hover size="sm">
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Type</th>
                                        <th>Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>10:30</td>
                                        <td><span className="badge bg-warning">Warning</span></td>
                                        <td>High CPU usage detected</td>
                                    </tr>
                                    <tr>
                                        <td>09:15</td>
                                        <td><span className="badge bg-info">Info</span></td>
                                        <td>New user registration</td>
                                    </tr>
                                    <tr>
                                        <td>08:45</td>
                                        <td><span className="badge bg-danger">Error</span></td>
                                        <td>Database connection timeout</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-info text-white">
                            <h5 className="mb-0">System Status</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span>API Server</span>
                                    <span className="badge bg-success">Online</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span>Database</span>
                                    <span className="badge bg-success">Online</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span>Redis Cache</span>
                                    <span className="badge bg-success">Online</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span>File Storage</span>
                                    <span className="badge bg-warning">Warning</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span>Email Service</span>
                                    <span className="badge bg-success">Online</span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminDashboard;
