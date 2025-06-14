// src/components/CustomerDetailModal.jsx (Ví dụ)
import React from 'react';
import { Modal, Button, ListGroup, Badge, Row, Col, Image, Spinner } from 'react-bootstrap';
// import { getBookingProgress, formatDate, MAX_BOOKINGS_FOR_VISUALIZATION } from '../utils/customerUtils'; // Giả sử bạn có utils

// Helper function to render star ratings (nếu cần, hoặc import từ utils)
const getBookingProgress = (bookings, max_bookings) => {
    const percentage = Math.min((bookings / max_bookings) * 100, 100);
    return percentage;
};
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
};
const MAX_BOOKINGS_FOR_VISUALIZATION = 20; // Giữ lại hoặc truyền qua props


const CustomerDetailModal = ({ show, onHide, customer, isLoading }) => { // Thêm prop isLoading
    if (!show) return null; // Không render gì nếu không show

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {isLoading ? "Loading Customer..." : (customer ? `Customer Details: ${customer.name} (${customer.id || ''})` : "Customer Details")}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {isLoading && (
                    <div className="text-center">
                        <Spinner animation="border" variant="primary" />
                        <p>Loading details...</p>
                    </div>
                )}
                {!isLoading && customer && customer.error && (
                    <Alert variant="danger">{customer.error}</Alert>
                )}
                {!isLoading && customer && !customer.error && (
                    <Row>
                        <Col md={4} className="text-center mb-3 mb-md-0">
                            {/* ... Image, Name, Badge ... */}
                            <Image
                                src={customer.avatarUrl || `https://i.pravatar.cc/150?u=${customer.id || customer.name}`}
                                roundedCircle
                                fluid
                                style={{ width: '120px', height: '120px', objectFit: 'cover', border: '3px solid #dee2e6' }}
                                alt={customer.name}
                            />
                            <h5 className="mt-3">{customer.name}</h5>
                            {customer.customerType && <Badge bg={customer.customerType === 'Corporate' ? 'info' : 'secondary'}>
                                {customer.customerType}
                            </Badge>}
                        </Col>
                        <Col md={8}>
                            <ListGroup variant="flush">
                                <ListGroup.Item><strong>Email:</strong> {customer.email || 'N/A'}</ListGroup.Item>
                                <ListGroup.Item><strong>Phone:</strong> {customer.phone || 'N/A'}</ListGroup.Item>
                                {typeof customer.bookings !== 'undefined' &&
                                    <ListGroup.Item>
                                        <strong>Total Bookings:</strong> {customer.bookings}
                                        <div className="progress mt-1" style={{ height: '8px' }}>
                                            <div
                                                className="progress-bar bg-success"
                                                role="progressbar"
                                                style={{ width: `${getBookingProgress(customer.bookings, MAX_BOOKINGS_FOR_VISUALIZATION)}%` }}
                                                aria-valuenow={customer.bookings}
                                                aria-valuemin="0"
                                                aria-valuemax={MAX_BOOKINGS_FOR_VISUALIZATION}
                                            ></div>
                                        </div>
                                    </ListGroup.Item>
                                }
                                {customer.lastBookingDate && <ListGroup.Item><strong>Last Booking:</strong> {formatDate(customer.lastBookingDate)}</ListGroup.Item>}
                                {typeof customer.totalSpending !== 'undefined' && <ListGroup.Item><strong>Total Spending:</strong> {customer.totalSpending?.toLocaleString('en-US')} VND</ListGroup.Item>}
                                {customer.frequentSpace && <ListGroup.Item><strong>Frequent Space:</strong> {customer.frequentSpace || 'N/A'}</ListGroup.Item>}
                            </ListGroup>
                        </Col>
                    </Row>
                )}
                {!isLoading && !customer && ( // Trường hợp không có customer và không loading (có thể là lỗi ban đầu)
                    <Alert variant="info">No customer data to display.</Alert>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={() => customer && !customer.error && alert(`Edit customer: ${customer.name}`)} disabled={isLoading || !customer || customer.error}>
                    Edit Customer
                </Button>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CustomerDetailModal;