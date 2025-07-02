// src/features/ownerBookingManagement/OwnerBookingManagement.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Container, Table, Button, Badge, Form, Row, Col, 
    Pagination, Spinner, Alert, Card, Stack, InputGroup,
    Dropdown, Modal
} from 'react-bootstrap';
import { Calendar2, Grid, List, Download, Gear, Plus } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
    selectOwnerBookingError,
    selectOwnerBookingStats
} from './slices/ownerBookingSlice';
import { selectCurrentUser } from '../auth/slices/authSlice';
import { formatVietnameseDateTime } from '../../utils/timeUtils';
import * as api from '../../services/api';

const OwnerBookingManagement = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [viewMode, setViewMode] = useState('list');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [ownerSpaces, setOwnerSpaces] = useState([]);
    const [loadingSpaces, setLoadingSpaces] = useState(true);
    const [spacesError, setSpacesError] = useState(null);
    
    // Redux state
    const currentUser = useSelector(selectCurrentUser);
    const bookings = useSelector(selectOwnerBookings);
    const filters = useSelector(selectOwnerBookingFilters);
    const pagination = useSelector(selectOwnerBookingPagination);
    const status = useSelector(selectOwnerBookingStatus);
    const error = useSelector(selectOwnerBookingError);
    const stats = useSelector(selectOwnerBookingStats);

    // Fetch owner's spaces first
    useEffect(() => {
        const fetchSpaces = async () => {
            if (!currentUser?.id) return;
            
            try {
                setLoadingSpaces(true);
                const spaces = await api.getOwnerSpaces(currentUser.id);
                setOwnerSpaces(spaces);
                
                // If there are spaces and no space is selected, select the first one
                if (spaces.length > 0 && !filters.spaceId) {
                    dispatch(setOwnerBookingFilter({ filterName: 'spaceId', value: spaces[0].id }));
                    dispatch(fetchOwnerBookings());
                }
            } catch (error) {
                console.error("Failed to fetch owner spaces:", error);
                setSpacesError(error.message || "Failed to load spaces");
            } finally {
                setLoadingSpaces(false);
            }
        };
        
        fetchSpaces();
    }, [currentUser?.id, dispatch]);

    useEffect(() => {
        dispatch(fetchOwnerBookings());
    }, [dispatch]);

    const handleFilter = (filterName, value) => {
        dispatch(setOwnerBookingFilter({ filterName, value }));
        dispatch(fetchOwnerBookings());
    };

    const handleDateRangeChange = (startDate, endDate) => {
        dispatch(setOwnerBookingFilter({ 
            filterName: 'dateFrom', 
            value: startDate ? startDate.toISOString() : '' 
        }));
        dispatch(setOwnerBookingFilter({ 
            filterName: 'dateTo', 
            value: endDate ? endDate.toISOString() : '' 
        }));
        dispatch(fetchOwnerBookings());
    };

    const handlePageChange = (page) => {
        dispatch(setOwnerBookingPage(page));
        dispatch(fetchOwnerBookings());
    };

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            await dispatch(updateBookingStatus({ bookingId, newStatus })).unwrap();
            dispatch(fetchOwnerBookings());
            dispatch(fetchOwnerBookingStats());
        } catch (error) {
            console.error('Failed to update booking status:', error);
        }
    };

    const handleExport = async () => {
        try {
            const blob = await dispatch(exportOwnerBookings()).unwrap();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bookings-${new Date().toISOString().split('T')[0]}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export bookings:', error);
        }
    };

    const renderStatusBadge = (status) => {
        let variant = 'secondary';
        switch (status) {
            case 'Pending': variant = 'warning'; break;
            case 'Confirmed': variant = 'success'; break;
            case 'Cancelled': variant = 'danger'; break;
            case 'Completed': variant = 'info'; break;
            default: variant = 'secondary';
        }
        return <Badge bg={variant}>{t(`booking.status.${status.toLowerCase()}`)}</Badge>;
    };

    const renderStats = () => null;

    const renderToolbar = () => (
        <Stack direction="horizontal" gap={3} className="mb-4">
            <Button variant="primary" size="sm">
                <Plus className="me-1" /> {t('owner.bookings.actions.addBooking')}
            </Button>
            <div className="vr" />
            <Button variant="outline-secondary" size="sm" 
                onClick={() => setViewMode('list')}
                active={viewMode === 'list'}>
                <List className="me-1" /> {t('common.view.list')}
            </Button>
            <Button variant="outline-secondary" size="sm" 
                onClick={() => setViewMode('calendar')}
                active={viewMode === 'calendar'}>
                <Calendar2 className="me-1" /> {t('common.view.calendar')}
            </Button>
            <div className="ms-auto" />
            <Button variant="outline-success" size="sm" onClick={handleExport}>
                <Download className="me-1" /> {t('common.actions.export')}
            </Button>
            <Button variant="outline-secondary" size="sm">
                <Gear className="me-1" /> {t('common.actions.settings')}
            </Button>
        </Stack>
    );

    const renderFilters = () => (
        <Row className="mb-4 g-3">
            {/* Space selector */}
            <Col md={3}>
                <Form.Group>
                    <Form.Label>{t('owner.bookings.filters.space')}</Form.Label>
                    <Form.Select
                        value={filters.spaceId}
                        onChange={(e) => handleFilter('spaceId', e.target.value)}
                        disabled={loadingSpaces}
                    >
                        {ownerSpaces.map(space => (
                            <option key={space.id} value={space.id}>
                                {space.name}
                            </option>
                        ))}
                    </Form.Select>
                    {loadingSpaces && (
                        <Form.Text className="text-muted">
                            {t('common.loading')}
                        </Form.Text>
                    )}
                    {spacesError && (
                        <Form.Text className="text-danger">
                            {spacesError}
                        </Form.Text>
                    )}
                </Form.Group>
            </Col>
            <Col md={3}>
                <Form.Group>
                    <Form.Label>{t('owner.bookings.filters.status')}</Form.Label>
                    <Form.Select
                        value={filters.status}
                        onChange={(e) => handleFilter('status', e.target.value)}
                    >
                        <option value="">{t('common.filters.all')}</option>
                        <option value="Pending">{t('booking.status.pending')}</option>
                        <option value="Confirmed">{t('booking.status.confirmed')}</option>
                        <option value="Cancelled">{t('booking.status.cancelled')}</option>
                        <option value="Completed">{t('booking.status.completed')}</option>
                    </Form.Select>
                </Form.Group>
            </Col>
            <Col md={3}>
                <Form.Group>
                    <Form.Label>{t('owner.bookings.filters.customer')}</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder={t('owner.bookings.filters.customerPlaceholder')}
                        value={filters.customerName}
                        onChange={(e) => handleFilter('customerName', e.target.value)}
                    />
                </Form.Group>
            </Col>
            <Col md={3}>
                <Form.Group>
                    <Form.Label>{t('owner.bookings.filters.dateRange')}</Form.Label>
                    <InputGroup>
                        <DatePicker
                            selectsRange
                            startDate={filters.dateFrom ? new Date(filters.dateFrom) : null}
                            endDate={filters.dateTo ? new Date(filters.dateTo) : null}
                            onChange={([start, end]) => handleDateRangeChange(start, end)}
                            className="form-control"
                            placeholderText={t('owner.bookings.filters.dateRangePlaceholder')}
                        />
                        <Button variant="outline-secondary" 
                            onClick={() => handleDateRangeChange(null, null)}>
                            {t('common.actions.clear')}
                        </Button>
                    </InputGroup>
                </Form.Group>
            </Col>
        </Row>
    );

    const renderBookingActions = (booking) => (
        <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" size="sm" id={`booking-${booking.id}-actions`}>
                {t('common.actions.actions')}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item onClick={() => {
                    setSelectedBooking(booking);
                    setShowDetailModal(true);
                }}>
                    {t('common.actions.viewDetails')}
                </Dropdown.Item>
                {booking.status === 'Pending' && (
                    <>
                        <Dropdown.Item onClick={() => handleStatusUpdate(booking.id, 'Confirmed')}>
                            {t('owner.bookings.actions.confirm')}
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleStatusUpdate(booking.id, 'Cancelled')}>
                            {t('owner.bookings.actions.reject')}
                        </Dropdown.Item>
                    </>
                )}
                {booking.status === 'Confirmed' && (
                    <Dropdown.Item onClick={() => handleStatusUpdate(booking.id, 'Completed')}>
                        {t('owner.bookings.actions.markCompleted')}
                    </Dropdown.Item>
                )}
                <Dropdown.Item>
                    {t('owner.bookings.actions.contactCustomer')}
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );

    const renderBookingsTable = () => (
        <div className="table-responsive">
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>{t('booking.fields.id')}</th>
                        <th>{t('booking.fields.customer')}</th>
                        <th>{t('booking.fields.space')}</th>
                        <th>{t('booking.fields.startTime')}</th>
                        <th>{t('booking.fields.endTime')}</th>
                        <th>{t('booking.fields.duration')}</th>
                        <th>{t('booking.fields.totalPrice')}</th>
                        <th>{t('booking.fields.status')}</th>
                        <th>{t('common.actions.actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(bookings) && bookings.map((booking) => (
                        <tr key={booking.id}>
                            <td>{booking.id}</td>
                            <td>{booking.customerName}</td>
                            <td>{booking.spaceName}</td>
                            <td>{formatVietnameseDateTime(booking.startTime)}</td>
                            <td>{formatVietnameseDateTime(booking.endTime)}</td>
                            <td>{booking.duration} {t('common.time.hours')}</td>
                            <td>{booking.totalPrice?.toLocaleString()} ₫</td>
                            <td>{renderStatusBadge(booking.status)}</td>
                            <td>{renderBookingActions(booking)}</td>
                        </tr>
                    ))}
                    {(!Array.isArray(bookings) || !bookings.length) && (
                        <tr>
                            <td colSpan="9" className="text-center py-4">
                                {status === 'loading' ? (
                                    <Spinner animation="border" size="sm" className="me-2" />
                                ) : (
                                    t('owner.bookings.noBookings')
                                )}
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );

    const renderPagination = () => {
        if (!pagination || !pagination.totalPages) return null;
        const items = [];
        const totalPages = parseInt(pagination.totalPages) || 0;
        const currentPage = parseInt(pagination.PageNumber) || 1;
        
        if (totalPages <= 1) return null;
        
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
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
                        <span className="visually-hidden">{t('common.loading')}</span>
                    </Spinner>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4">{t('owner.bookings.title')}</h2>

            {error && (
                <Alert variant="danger" dismissible>
                    {error}
                </Alert>
            )}

            {/* Show loading state when spaces are loading */}
            {loadingSpaces ? (
                <div className="text-center py-4">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">{t('common.loading')}</span>
                    </Spinner>
                    <div className="mt-2">{t('owner.bookings.loadingSpaces')}</div>
                </div>
            ) : spacesError ? (
                <Alert variant="danger">
                    {spacesError}
                </Alert>
            ) : ownerSpaces.length === 0 ? (
                <Alert variant="info">
                    {t('owner.bookings.noSpacesAvailable')}
                </Alert>
            ) : (
                <>
                    {renderStats()}
                    {renderToolbar()}
                    {renderFilters()}
                    {viewMode === 'list' ? renderBookingsTable() : <div>{t('owner.bookings.calendarViewComingSoon')}</div>}
                    {renderPagination()}
                </>
            )}

            {/* Booking Detail Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{t('owner.bookings.detail.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedBooking && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('booking.fields.customer')}:</strong> {selectedBooking.customerName}
                                </Col>
                                <Col md={6}>
                                    <strong>{t('booking.fields.space')}:</strong> {selectedBooking.spaceName}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('booking.fields.startTime')}:</strong> {new Date(selectedBooking.startTime).toLocaleString()}
                                </Col>
                                <Col md={6}>
                                    <strong>{t('booking.fields.endTime')}:</strong> {new Date(selectedBooking.endTime).toLocaleString()}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('booking.fields.totalPrice')}:</strong> {selectedBooking.totalPrice?.toLocaleString()} ₫
                                </Col>
                                <Col md={6}>
                                    <strong>{t('booking.fields.status')}:</strong> {renderStatusBadge(selectedBooking.status)}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col>
                                    <strong>{t('booking.fields.notes')}:</strong>
                                    <p className="mt-2">{selectedBooking.notes || t('common.noData')}</p>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        {t('common.actions.close')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default OwnerBookingManagement;