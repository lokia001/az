import React, { useState, useMemo } from 'react';
import { Modal, Button, Row, Col, Badge, Card, Alert, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Clock, Person, Calendar, CheckCircle, XCircle } from 'react-bootstrap-icons';
import { formatVietnameseDateTime } from '../../../utils/timeUtils';

const ConflictTimelineModal = ({ show, onHide, conflictBookings, spaceName, onResolveConflict }) => {
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [resolving, setResolving] = useState(false);

    // Tạo timeline data chỉ cho conflict bookings
    const timelineData = useMemo(() => {
        if (conflictBookings.length === 0) return null;

        // Chỉ sử dụng conflict bookings để tạo timeline
        const relevantBookings = conflictBookings;

        // Tìm thời gian bắt đầu và kết thúc của timeline
        const allTimes = relevantBookings.flatMap(b => [new Date(b.startTime), new Date(b.endTime)]);
        const timelineStart = new Date(Math.min(...allTimes));
        const timelineEnd = new Date(Math.max(...allTimes));
        
        // Mở rộng timeline 1 giờ mỗi bên để dễ nhìn
        timelineStart.setHours(timelineStart.getHours() - 1);
        timelineEnd.setHours(timelineEnd.getHours() + 1);

        const timelineDuration = timelineEnd - timelineStart;

        // Tạo timeline items chỉ cho conflict bookings
        const timelineItems = relevantBookings.map(booking => {
            const startTime = new Date(booking.startTime);
            const endTime = new Date(booking.endTime);
            const startOffset = ((startTime - timelineStart) / timelineDuration) * 100;
            const width = ((endTime - startTime) / timelineDuration) * 100;
            
            return {
                ...booking,
                startOffset,
                width,
                startTime,
                endTime
            };
        });

        return {
            timelineStart,
            timelineEnd,
            timelineItems,
            timelineDuration
        };
    }, [conflictBookings]);

    const getBookingColor = (booking) => {
        // Tất cả booking trong modal này đều là conflict, chỉ phân biệt selected
        if (selectedBooking && selectedBooking.id === booking.id) {
            return '#007bff'; // Xanh dương cho booking được chọn
        }
        return '#dc3545'; // Đỏ cho conflict bookings
    };

    const getStatusText = (status) => {
        const statusMap = {
            'Conflict': 'Xung đột',
            'Confirmed': 'Đã xác nhận',
            'Pending': 'Chờ xác nhận',
            'CheckedIn': 'Đã check-in',
            'Checkout': 'Đã checkout',
            'Completed': 'Hoàn thành',
            'Cancelled': 'Đã hủy'
        };
        return statusMap[status] || status;
    };

    const handleResolve = async (bookingId, action) => {
        setResolving(true);
        try {
            await onResolveConflict(bookingId, action);
        } finally {
            setResolving(false);
        }
    };

    const renderTimelineHours = () => {
        if (!timelineData) return null;

        const hours = [];
        const current = new Date(timelineData.timelineStart);
        current.setMinutes(0, 0, 0);

        while (current <= timelineData.timelineEnd) {
            const offset = ((current - timelineData.timelineStart) / timelineData.timelineDuration) * 100;
            hours.push(
                <div
                    key={current.getTime()}
                    style={{
                        position: 'absolute',
                        left: `${offset}%`,
                        top: '-25px',
                        fontSize: '12px',
                        color: '#666',
                        fontWeight: 'bold'
                    }}
                >
                    {current.getHours().toString().padStart(2, '0')}:00
                </div>
            );
            current.setHours(current.getHours() + 1);
        }

        return hours;
    };

    if (!timelineData) return null;

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton className="bg-danger text-white">
                <Modal.Title>
                    <Clock className="me-2" />
                    Giải quyết xung đột cho space: {spaceName}
                </Modal.Title>
            </Modal.Header>
            
            <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <Alert variant="warning" className="mb-4">
                    <div className="d-flex align-items-center">
                        <Calendar className="me-2" />
                        <div>
                            <strong>Hướng dẫn:</strong> Tất cả booking dưới đây đang xung đột thời gian cho space <strong>{spaceName}</strong>. 
                            Click vào booking để xem chi tiết, sau đó chọn <strong>XÁC NHẬN</strong> booking nào và các booking khác sẽ tự động bị hủy.
                        </div>
                    </div>
                </Alert>

                {/* Timeline visualization */}
                <Card className="mb-4">
                    <Card.Header className="bg-light">
                        <h6 className="mb-0">📅 Timeline xung đột - {spaceName} (Giờ Việt Nam)</h6>
                        <small className="text-muted">
                            {formatVietnameseDateTime(timelineData.timelineStart)} - {formatVietnameseDateTime(timelineData.timelineEnd)}
                        </small>
                    </Card.Header>
                    <Card.Body style={{ padding: '30px 20px' }}>
                        {/* Timeline container */}
                        <div style={{ position: 'relative', height: '150px', margin: '30px 0' }}>
                            {/* Timeline axis */}
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '0',
                                right: '0',
                                height: '2px',
                                backgroundColor: '#dee2e6',
                                transform: 'translateY(-50%)'
                            }} />

                            {/* Hour markers */}
                            {renderTimelineHours()}

                            {/* Booking bars */}
                            {timelineData.timelineItems.map((item, index) => (
                                <OverlayTrigger
                                    key={item.id}
                                    placement="top"
                                    overlay={
                                        <Tooltip>
                                            <strong>{item.guestName || item.userFullName || 'Khách hàng'}</strong><br/>
                                            {formatVietnameseDateTime(item.startTime)} - {formatVietnameseDateTime(item.endTime)}<br/>
                                            Trạng thái: {getStatusText(item.status)}
                                        </Tooltip>
                                    }
                                >
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: `${item.startOffset}%`,
                                            width: `${item.width}%`,
                                            height: '30px',
                                            backgroundColor: getBookingColor(item),
                                            borderRadius: '15px',
                                            top: `${30 + (index % 3) * 40}px`,
                                            cursor: 'pointer',
                                            border: selectedBooking?.id === item.id ? '3px solid #007bff' : '2px solid #fff',
                                            boxShadow: selectedBooking?.id === item.id ? '0 0 15px rgba(0, 123, 255, 0.5)' : '0 0 10px rgba(220, 53, 69, 0.5)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            minWidth: '80px'
                                        }}
                                        onClick={() => setSelectedBooking(item)}
                                    >
                                        {item.bookingCode || item.id.substr(0, 8)}
                                    </div>
                                </OverlayTrigger>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="mt-4 pt-3 border-top">
                            <small className="text-muted d-block mb-2"><strong>Chú thích:</strong></small>
                            <div className="d-flex flex-wrap gap-3">
                                <div className="d-flex align-items-center">
                                    <div style={{ width: '20px', height: '12px', backgroundColor: '#dc3545', borderRadius: '6px', marginRight: '8px' }}></div>
                                    <small>Booking xung đột</small>
                                </div>
                                <div className="d-flex align-items-center">
                                    <div style={{ width: '20px', height: '12px', backgroundColor: '#007bff', borderRadius: '6px', marginRight: '8px' }}></div>
                                    <small>Booking được chọn</small>
                                </div>
                            </div>
                            <small className="text-muted mt-2 d-block">💡 Click vào booking để xem chi tiết</small>
                        </div>
                    </Card.Body>
                </Card>

                {/* Chi tiết booking được chọn */}
                {selectedBooking && (
                    <Card className="mb-4 border-primary">
                        <Card.Header className="bg-primary text-white">
                            <h6 className="mb-0">
                                <Person className="me-1" />
                                Chi tiết booking đã chọn
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <small className="text-muted">Khách hàng:</small>
                                        <div className="fw-bold">{selectedBooking.guestName || selectedBooking.userFullName || 'Khách hàng'}</div>
                                    </div>
                                    <div className="mb-3">
                                        <small className="text-muted">Mã booking:</small>
                                        <div className="fw-bold">{selectedBooking.bookingCode || selectedBooking.id.substr(0, 8)}</div>
                                    </div>
                                    <div className="mb-3">
                                        <small className="text-muted">Email liên hệ:</small>
                                        <div>{selectedBooking.notificationEmail || 'Không có'}</div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <small className="text-muted">Thời gian bắt đầu:</small>
                                        <div className="fw-bold">{formatVietnameseDateTime(selectedBooking.startTime)}</div>
                                    </div>
                                    <div className="mb-3">
                                        <small className="text-muted">Thời gian kết thúc:</small>
                                        <div className="fw-bold">{formatVietnameseDateTime(selectedBooking.endTime)}</div>
                                    </div>
                                    <div className="mb-3">
                                        <small className="text-muted">Trạng thái:</small>
                                        <div><Badge bg="danger">Xung đột</Badge></div>
                                    </div>
                                </Col>
                            </Row>
                            {selectedBooking.guestPhone && (
                                <Row>
                                    <Col md={6}>
                                        <div className="mb-3">
                                            <small className="text-muted">Số điện thoại:</small>
                                            <div>{selectedBooking.guestPhone}</div>
                                        </div>
                                    </Col>
                                </Row>
                            )}
                            {selectedBooking.notesFromCustomer && (
                                <Row>
                                    <Col>
                                        <div className="mb-3">
                                            <small className="text-muted">Ghi chú từ khách hàng:</small>
                                            <div className="p-2 bg-light rounded">{selectedBooking.notesFromCustomer}</div>
                                        </div>
                                    </Col>
                                </Row>
                            )}
                            <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                                <Button
                                    variant="success"
                                    onClick={() => handleResolve(selectedBooking.id, 'Confirmed')}
                                    disabled={resolving}
                                    className="me-md-2"
                                >
                                    <CheckCircle className="me-1" />
                                    Xác nhận booking này
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    onClick={() => handleResolve(selectedBooking.id, 'Cancelled')}
                                    disabled={resolving}
                                >
                                    <XCircle className="me-1" />
                                    Hủy booking này
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* Conflict bookings list - chỉ hiển thị nếu chưa chọn booking nào */}
                {!selectedBooking && (
                    <>
                        <h6 className="mb-3">📋 Danh sách booking xung đột - Click để xem chi tiết:</h6>
                        <Row>
                            {conflictBookings.map((booking) => (
                                <Col md={6} key={booking.id} className="mb-3">
                                    <Card 
                                        className={`h-100 border-danger cursor-pointer ${selectedBooking?.id === booking.id ? 'border-primary bg-light' : ''}`}
                                        onClick={() => setSelectedBooking(booking)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h6 className="card-title mb-0">
                                                    <Person className="me-1" />
                                                    {booking.guestName || booking.userFullName || 'Khách hàng'}
                                                </h6>
                                                <Badge bg="danger">Xung đột</Badge>
                                            </div>
                                            
                                            <div className="mb-2">
                                                <small className="text-muted">Mã booking:</small>
                                                <div className="fw-bold">{booking.bookingCode || booking.id.substr(0, 8)}</div>
                                            </div>
                                            
                                            <div className="mb-2">
                                                <small className="text-muted">Thời gian:</small>
                                                <div>{formatVietnameseDateTime(booking.startTime)}</div>
                                                <div>đến {formatVietnameseDateTime(booking.endTime)}</div>
                                            </div>
                                            
                                            {booking.notificationEmail && (
                                                <div className="mb-3">
                                                    <small className="text-muted">Email:</small>
                                                    <div className="small">{booking.notificationEmail}</div>
                                                </div>
                                            )}
                                            
                                            <div className="text-center">
                                                <small className="text-muted">👆 Click để xem chi tiết</small>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </>
                )}
            </Modal.Body>
            
            <Modal.Footer className="bg-light">
                <div className="d-flex justify-content-between w-100 align-items-center">
                    <small className="text-muted">
                        💡 <strong>Lưu ý:</strong> Khi xác nhận 1 booking, tất cả booking xung đột khác sẽ tự động bị hủy và gửi email thông báo.
                    </small>
                    <Button variant="secondary" onClick={onHide}>
                        Đóng
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default ConflictTimelineModal;
