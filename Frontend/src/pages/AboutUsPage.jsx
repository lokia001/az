import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function AboutUs() {
    return (
        <Container className="py-5">
            {/* Hero Section */}
            <Row className="mb-5">
                <Col>
                    <div className="text-center mb-4">
                        <h1 className="display-4 fw-bold text-primary mb-3">
                            Về WorkZen
                        </h1>
                        <p className="lead text-muted">
                            Nền tảng kết nối không gian làm việc linh hoạt cho mọi nhu cầu
                        </p>
                    </div>
                </Col>
            </Row>

            {/* Mission Section */}
            <Row className="mb-5">
                <Col lg={8} className="mx-auto">
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <h2 className="h3 text-center mb-4">🎯 Sứ mệnh của chúng tôi</h2>
                            <p className="text-muted text-center">
                                WorkZen ra đời với mục tiêu tạo ra một hệ sinh thái không gian làm việc 
                                linh hoạt, hiện đại và tiện lợi. Chúng tôi kết nối những người cần không gian 
                                làm việc với các chủ sở hữu không gian, tạo nên một cộng đồng năng động và sáng tạo.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Features Section */}
            <Row className="mb-5">
                <Col>
                    <h2 className="text-center mb-4">✨ Tính năng nổi bật</h2>
                </Col>
            </Row>
            <Row className="mb-5">
                <Col md={4} className="mb-4">
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Body className="text-center p-4">
                            <div className="mb-3">
                                <span className="display-6">🔍</span>
                            </div>
                            <h5>Tìm kiếm thông minh</h5>
                            <p className="text-muted">
                                Tìm không gian làm việc phù hợp theo vị trí, giá cả và tiện ích. 
                                Hỗ trợ tìm kiếm không gian gần bạn trong bán kính 5km.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Body className="text-center p-4">
                            <div className="mb-3">
                                <span className="display-6">💼</span>
                            </div>
                            <h5>Đặt chỗ dễ dàng</h5>
                            <p className="text-muted">
                                Hệ thống đặt chỗ trực tuyến đơn giản và nhanh chóng. 
                                Quản lý lịch đặt và thanh toán an toàn.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Body className="text-center p-4">
                            <div className="mb-3">
                                <span className="display-6">🏢</span>
                            </div>
                            <h5>Quản lý không gian</h5>
                            <p className="text-muted">
                                Công cụ quản lý toàn diện cho chủ sở hữu không gian. 
                                Theo dõi đặt chỗ, doanh thu và khách hàng.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Stats Section */}
            <Row className="mb-5">
                <Col>
                    <Card className="bg-primary text-white border-0">
                        <Card.Body className="p-4">
                            <Row className="text-center">
                                <Col md={3} className="mb-3">
                                    <h3 className="display-6 fw-bold">500+</h3>
                                    <p className="mb-0">Không gian đăng ký</p>
                                </Col>
                                <Col md={3} className="mb-3">
                                    <h3 className="display-6 fw-bold">1,000+</h3>
                                    <p className="mb-0">Người dùng hoạt động</p>
                                </Col>
                                <Col md={3} className="mb-3">
                                    <h3 className="display-6 fw-bold">50+</h3>
                                    <p className="mb-0">Thành phố phủ sóng</p>
                                </Col>
                                <Col md={3} className="mb-3">
                                    <h3 className="display-6 fw-bold">95%</h3>
                                    <p className="mb-0">Độ hài lòng khách hàng</p>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Team Section */}
            <Row className="mb-5">
                <Col>
                    <h2 className="text-center mb-4">👥 Đội ngũ phát triển</h2>
                    <Row className="justify-content-center">
                        <Col md={8}>
                            <Card className="border-0 shadow-sm">
                                <Card.Body className="p-4 text-center">
                                    <p className="text-muted">
                                        Chúng tôi là một đội ngũ trẻ, năng động với niềm đam mê công nghệ 
                                        và mong muốn cải thiện trải nghiệm làm việc của mọi người. 
                                        Với kinh nghiệm trong lĩnh vực phát triển phần mềm và hiểu biết 
                                        sâu sắc về nhu cầu không gian làm việc hiện đại.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>

            {/* Contact Section */}
            <Row className="mb-5">
                <Col>
                    <h2 className="text-center mb-4">📞 Liên hệ với chúng tôi</h2>
                    <Row className="justify-content-center">
                        <Col md={6}>
                            <Card className="border-0 shadow-sm">
                                <Card.Body className="p-4">
                                    <div className="text-center">
                                        <p className="mb-2">
                                            <strong>Email:</strong> hahuu3675@email.com
                                        </p>
                                        <p className="mb-2">
                                            <strong>Hotline:</strong> 1900 00000
                                        </p>
                                        <p className="mb-4">
                                            {/* <strong>Địa chỉ:</strong> 123 Đường ABC, Quận 1, TP.HCM */}
                                        </p>
                                        <div className="d-flex gap-2 justify-content-center">
                                            <Button as={Link} to="/explore" variant="primary">
                                                Khám phá không gian
                                            </Button>
                                            <Button as={Link} to="/owner-registration" variant="outline-primary">
                                                Trở thành đối tác
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>

            {/* Vision Section */}
            <Row>
                <Col>
                    <Card className="bg-light border-0">
                        <Card.Body className="p-4 text-center">
                            <h3 className="mb-3">🚀 Tầm nhìn tương lai</h3>
                            <p className="text-muted mb-0">
                                Trở thành nền tảng không gian làm việc linh hoạt hàng đầu Việt Nam, 
                                góp phần thay đổi cách thức làm việc truyền thống và tạo ra 
                                một cộng đồng làm việc sáng tạo, năng động.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default AboutUs;