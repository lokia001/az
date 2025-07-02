// src/components/CustomerDetailModal.jsx
import React from 'react';
import { Modal, Button, ListGroup, Badge, Row, Col, Image, Spinner, Alert, Table } from 'react-bootstrap';

// Helper functions
const getBookingProgress = (bookings, max_bookings) => {
    const percentage = Math.min((bookings / max_bookings) * 100, 100);
    return percentage;
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
};

const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

const getStatusBadge = (status) => {
    const statusMap = {
        'Pending': { bg: 'warning', text: 'Chờ xác nhận' },
        'Confirmed': { bg: 'success', text: 'Đã xác nhận' },
        'Completed': { bg: 'info', text: 'Hoàn thành' },
        'Cancelled': { bg: 'danger', text: 'Đã hủy' }
    };
    
    const statusInfo = statusMap[status] || { bg: 'secondary', text: status };
    return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
};

const MAX_BOOKINGS_FOR_VISUALIZATION = 20;


const CustomerDetailModal = ({ show, onHide, customer, isLoading }) => {
    if (!show) return null;

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {isLoading ? "Đang tải thông tin khách hàng..." : 
                     (customer ? `Chi tiết khách hàng: ${customer.name}` : "Chi tiết khách hàng")}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {isLoading && (
                    <div className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2">Đang tải chi tiết...</p>
                    </div>
                )}
                
                {!isLoading && customer && customer.error && (
                    <Alert variant="danger">{customer.error}</Alert>
                )}
                
                {!isLoading && customer && !customer.error && (
                    <>
                        <Row className="mb-4">
                            <Col md={4} className="text-center mb-3 mb-md-0">
                                <Image
                                    src={customer.avatarUrl || `https://i.pravatar.cc/150?u=${customer.id}`}
                                    roundedCircle
                                    fluid
                                    style={{ 
                                        width: '120px', 
                                        height: '120px', 
                                        objectFit: 'cover', 
                                        border: '3px solid #dee2e6' 
                                    }}
                                    alt={customer.name}
                                />
                                <h5 className="mt-3">{customer.name}</h5>
                                <Badge bg="primary">Khách hàng</Badge>
                            </Col>
                            <Col md={8}>
                                <ListGroup variant="flush">
                                    <ListGroup.Item>
                                        <strong>Email:</strong> {customer.email}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <strong>Số điện thoại:</strong> {customer.phone}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <strong>Tổng số đặt chỗ:</strong> {customer.totalBookings}
                                        <div className="progress mt-1" style={{ height: '8px' }}>
                                            <div
                                                className="progress-bar bg-success"
                                                role="progressbar"
                                                style={{ 
                                                    width: `${getBookingProgress(customer.totalBookings, MAX_BOOKINGS_FOR_VISUALIZATION)}%` 
                                                }}
                                                aria-valuenow={customer.totalBookings}
                                                aria-valuemin="0"
                                                aria-valuemax={MAX_BOOKINGS_FOR_VISUALIZATION}
                                            ></div>
                                        </div>
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <strong>Đặt chỗ hoàn thành:</strong> {customer.completedBookings}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <strong>Đặt chỗ đã hủy:</strong> {customer.cancelledBookings}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <strong>Tổng chi tiêu:</strong> {formatCurrency(customer.totalSpent)}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <strong>Lần đặt chỗ gần nhất:</strong> {formatDate(customer.lastBooking)}
                                    </ListGroup.Item>
                                </ListGroup>
                            </Col>
                        </Row>

                        {/* Booking History */}
                        {customer.bookingHistory && customer.bookingHistory.length > 0 && (
                            <>
                                <h6 className="mb-3">Lịch sử đặt chỗ</h6>
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    <Table striped bordered hover size="sm">
                                        <thead>
                                            <tr>
                                                <th>Không gian</th>
                                                <th>Thời gian</th>
                                                <th>Giá tiền</th>
                                                <th>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customer.bookingHistory.slice(0, 10).map((booking, index) => (
                                                <tr key={booking.id || index}>
                                                    <td>{booking.spaceName}</td>
                                                    <td>
                                                        <small>
                                                            {formatDate(booking.startTime)}
                                                            <br />
                                                            {new Date(booking.startTime).toLocaleTimeString('vi-VN', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })} - {new Date(booking.endTime).toLocaleTimeString('vi-VN', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </small>
                                                    </td>
                                                    <td>{formatCurrency(booking.totalPrice)}</td>
                                                    <td>{getStatusBadge(booking.status)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                                {customer.bookingHistory.length > 10 && (
                                    <small className="text-muted">
                                        Hiển thị 10/{customer.bookingHistory.length} đặt chỗ gần nhất
                                    </small>
                                )}
                            </>
                        )}
                    </>
                )}
                
                {!isLoading && !customer && (
                    <Alert variant="info">Không có dữ liệu khách hàng để hiển thị.</Alert>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Đóng
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CustomerDetailModal;