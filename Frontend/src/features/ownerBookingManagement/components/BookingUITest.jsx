import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import '../OwnerBookingManagement/OwnerBookingManagement.css';

const BookingUITest = () => {
    const sampleBookings = [
        {
            id: 'abc123',
            customerName: 'Nguyễn Văn A',
            spaceName: 'Văn phòng cao cấp Downtown',
            startTime: '2025-07-03T09:00:00Z',
            endTime: '2025-07-03T17:00:00Z',
            duration: 8,
            totalPrice: 500000,
            status: 'Confirmed',
            notificationEmail: 'nguyenvana@email.com'
        },
        {
            id: 'def456',
            customerName: 'Trần Thị B',
            spaceName: 'Meeting Room Premium',
            startTime: '2025-07-03T14:00:00Z',
            endTime: '2025-07-03T16:00:00Z',
            duration: 2,
            totalPrice: 150000,
            status: 'Conflict',
            notificationEmail: 'tranthib@email.com'
        },
        {
            id: 'ghi789',
            customerName: 'Lê Văn C',
            spaceName: 'Coworking Space Deluxe',
            startTime: '2025-07-04T08:00:00Z',
            endTime: '2025-07-04T12:00:00Z',
            duration: 4,
            totalPrice: 300000,
            status: 'Pending',
            notificationEmail: 'levanc@email.com'
        }
    ];

    const formatVietnameseDateTime24h = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatVietnameseSmartTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        
        if (isToday) {
            return `Hôm nay ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
        }
        
        return date.toLocaleDateString('vi-VN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const renderStatusBadge = (status) => {
        let variant = 'secondary';
        let text = status;
        
        switch (status) {
            case 'Pending': 
                variant = 'warning'; 
                text = 'Chờ xác nhận';
                break;
            case 'Confirmed': 
                variant = 'success'; 
                text = 'Đã xác nhận';
                break;
            case 'Conflict': 
                variant = 'danger'; 
                text = 'Xung đột';
                break;
            default: 
                variant = 'secondary';
        }
        
        return <Badge bg={variant}>{text}</Badge>;
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4">Test UI Quản lý đặt chỗ - Card Layout</h2>
            
            {/* Toolbar Test */}
            <div className="toolbar-section">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-2">
                        <Button variant="primary" size="sm">
                            <i className="fas fa-plus me-1"></i> Thêm đặt chỗ
                        </Button>
                        <div className="view-mode-toggle">
                            <Button variant="primary" size="sm">
                                <i className="fas fa-th me-1"></i> Thẻ
                            </Button>
                            <Button variant="outline-secondary" size="sm">
                                <i className="fas fa-list me-1"></i> Bảng
                            </Button>
                            <Button variant="outline-secondary" size="sm">
                                <i className="fas fa-calendar me-1"></i> Lịch
                            </Button>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="outline-success" size="sm">
                            <i className="fas fa-download me-1"></i> Xuất Excel
                        </Button>
                        <Button variant="outline-secondary" size="sm">
                            <i className="fas fa-cog me-1"></i> Cài đặt
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filters Test */}
            <div className="filters-section">
                <Row className="g-3">
                    <Col md={3}>
                        <label className="form-label">Không gian</label>
                        <select className="form-select">
                            <option>Tất cả không gian</option>
                            <option>Văn phòng cao cấp Downtown</option>
                            <option>Meeting Room Premium</option>
                        </select>
                    </Col>
                    <Col md={3}>
                        <label className="form-label">Trạng thái</label>
                        <select className="form-select">
                            <option>Tất cả</option>
                            <option>Chờ xác nhận</option>
                            <option>Đã xác nhận</option>
                        </select>
                    </Col>
                    <Col md={3}>
                        <label className="form-label">Khách hàng</label>
                        <input type="text" className="form-control" placeholder="Tìm theo tên khách hàng..." />
                    </Col>
                    <Col md={3}>
                        <label className="form-label">Thời gian</label>
                        <input type="text" className="form-control" placeholder="Chọn khoảng thời gian..." />
                    </Col>
                </Row>
            </div>

            {/* Cards Test */}
            <Row className="g-3">
                {sampleBookings.map((booking) => (
                    <Col key={booking.id} xs={12} md={6} xl={4}>
                        <Card className={`owner-booking-card h-100 ${booking.status === 'Conflict' ? 'conflict' : ''}`}>
                            <Card.Body>
                                {/* Header với status badge */}
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h6 className="card-title mb-1">
                                            <i className="fas fa-user me-2"></i>
                                            {booking.customerName}
                                        </h6>
                                        <small className="text-muted">
                                            ID: {booking.id}
                                        </small>
                                    </div>
                                    <div className="booking-status-badge">
                                        {renderStatusBadge(booking.status)}
                                    </div>
                                </div>

                                {/* Thông tin space */}
                                <div className="mb-3">
                                    <div className="d-flex align-items-center mb-2">
                                        <i className="fas fa-building me-2 text-primary"></i>
                                        <strong>{booking.spaceName}</strong>
                                    </div>
                                </div>

                                {/* Thời gian */}
                                <div className="booking-time-info mb-3">
                                    <div className="d-flex align-items-center mb-2">
                                        <i className="fas fa-clock me-2 text-success"></i>
                                        <div className="flex-grow-1">
                                            <div className="booking-time-smart">
                                                {formatVietnameseSmartTime(booking.startTime)}
                                            </div>
                                            <div className="booking-time-end">
                                                đến {formatVietnameseDateTime24h(booking.endTime)}
                                            </div>
                                            <div className="booking-time-duration">
                                                <i className="fas fa-hourglass-half me-1"></i>
                                                {booking.duration} giờ
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Email thông báo */}
                                <div className="mb-3">
                                    <div className="d-flex align-items-center">
                                        <i className="fas fa-envelope me-2 text-info"></i>
                                        <div className="flex-grow-1">
                                            <div className="text-muted small">Email thông báo:</div>
                                            <div className="small">{booking.notificationEmail}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Giá tiền */}
                                <div className="mb-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span className="text-muted">Tổng tiền:</span>
                                        <span className="booking-price">
                                            {booking.totalPrice?.toLocaleString()} ₫
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="booking-actions d-flex mt-auto">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="flex-grow-1 me-2"
                                    >
                                        <i className="fas fa-eye me-1"></i>
                                        Chi tiết
                                    </Button>
                                    <Button variant="outline-secondary" size="sm">
                                        <i className="fas fa-ellipsis-v"></i>
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default BookingUITest;
