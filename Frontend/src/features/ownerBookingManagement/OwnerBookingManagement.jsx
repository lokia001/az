// src/features/ownerBookingManagement/OwnerBookingManagement.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Table, Button, Badge, Form, Row, Col, Pagination, Spinner, Alert } from 'react-bootstrap';
import { 
    fetchOwnerBookings, 
    updateBookingStatus,
    setOwnerBookingFilter,
    setOwnerBookingPage,
    resetOwnerBookingFilters,
    selectOwnerBookings,
    selectOwnerBookingFilters,
    selectOwnerBookingPagination,
    selectOwnerBookingStatus,
    selectOwnerBookingError
} from './slices/ownerBookingSlice';

const OwnerBookingManagement = () => {
    const dispatch = useDispatch();
    
    // Redux state
    const bookings = useSelector(selectOwnerBookings);
    const filters = useSelector(selectOwnerBookingFilters);
    const pagination = useSelector(selectOwnerBookingPagination);
    const status = useSelector(selectOwnerBookingStatus);
    const error = useSelector(selectOwnerBookingError);

    useEffect(() => {
        dispatch(fetchOwnerBookings());
    }, [dispatch]);

    const handleFilter = (filterName, value) => {
        dispatch(setOwnerBookingFilter({ filterName, value }));
        dispatch(fetchOwnerBookings());
    };

    const handlePageChange = (page) => {
        dispatch(setOwnerBookingPage(page));
        dispatch(fetchOwnerBookings());
    };

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            await dispatch(updateBookingStatus({ bookingId, newStatus })).unwrap();
            dispatch(fetchOwnerBookings()); // Refresh the list
        } catch (error) {
            console.error('Failed to update booking status:', error);
        }
    };

    const renderStatusBadge = (status) => {
        let variant = 'secondary';
        switch (status) {
            case 'Pending':
                variant = 'warning';
                break;
            case 'Confirmed':
                variant = 'success';
                break;
            case 'Cancelled':
                variant = 'danger';
                break;
            case 'Completed':
                variant = 'info';
                break;
            default:
                variant = 'secondary';
        }
        return <Badge bg={variant}>{status}</Badge>;
    };

    const renderPagination = () => {
        if (!pagination.totalPages) return null;
        const items = [];
        for (let number = 1; number <= pagination.totalPages; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === pagination.PageNumber}
                    onClick={() => handlePageChange(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }
        return <Pagination className="justify-content-center mt-3">{items}</Pagination>;
    };

    if (status === 'loading' && !bookings.length) {
        return (
            <Container className="py-4">
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </Spinner>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4">Quản lý đặt chỗ</h2>

            {error && (
                <Alert variant="danger">
                    {error}
                </Alert>
            )}

            {/* Filters */}
            <Row className="mb-4">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Lọc theo trạng thái</Form.Label>
                        <Form.Select
                            value={filters.status}
                            onChange={(e) => handleFilter('status', e.target.value)}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="Pending">Đang chờ xử lý</option>
                            <option value="Confirmed">Đã xác nhận</option>
                            <option value="Cancelled">Đã hủy</option>
                            <option value="Completed">Hoàn thành</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Tìm theo tên khách hàng</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nhập tên khách hàng..."
                            value={filters.customerName}
                            onChange={(e) => handleFilter('customerName', e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>

            {/* Bookings Table */}
            <div className="table-responsive">
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Khách hàng</th>
                            <th>Không gian</th>
                            <th>Thời gian bắt đầu</th>
                            <th>Thời gian kết thúc</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking.id}>
                                <td>{booking.id}</td>
                                <td>{booking.customerName}</td>
                                <td>{booking.spaceName}</td>
                                <td>{new Date(booking.startTime).toLocaleString()}</td>
                                <td>{new Date(booking.endTime).toLocaleString()}</td>
                                <td>{renderStatusBadge(booking.status)}</td>
                                <td>
                                    {booking.status === 'Pending' && (
                                        <>
                                            <Button
                                                variant="success"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleStatusUpdate(booking.id, 'Confirmed')}
                                            >
                                                Xác nhận
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleStatusUpdate(booking.id, 'Cancelled')}
                                            >
                                                Từ chối
                                            </Button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {!bookings.length && (
                            <tr>
                                <td colSpan="7" className="text-center py-4">
                                    {status === 'loading' ? (
                                        <Spinner animation="border" size="sm" className="me-2" />
                                    ) : (
                                        'Không có đơn đặt chỗ nào'
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Pagination */}
            {renderPagination()}
        </Container>
    );
};

export default OwnerBookingManagement;