import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/slices/authSlice';
import api from '../services/apiClient';
import { Container, Row, Col, Spinner, Alert, Card, Button, Form } from 'react-bootstrap';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const OwnerBookingsPage = () => {
    const { t } = useTranslation();
    const currentUser = useSelector(selectCurrentUser);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    const fetchOwnerBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                status: filterStatus || undefined,
                startDate: filterStartDate || undefined,
                endDate: filterEndDate || undefined,
                // Add pagination parameters if your API supports it
                pageNumber: 1,
                pageSize: 100 // Fetch a reasonable number for now
            };
            const response = await api.get('/bookings/owner-bookings', { params });
            setBookings(response.data);
        } catch (err) {
            console.error("Failed to fetch owner bookings:", err);
            setError(err.response?.data?.message || err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser && (currentUser.role === 'Owner' || currentUser.role === 'SysAdmin')) {
            fetchOwnerBookings();
        } else {
            setLoading(false);
            setError("You are not authorized to view this page.");
        }
    }, [currentUser, filterStatus, filterStartDate, filterEndDate]); // Re-fetch when filters change

    const handleStatusChange = (e) => setFilterStatus(e.target.value);
    const handleStartDateChange = (e) => setFilterStartDate(e.target.value);
    const handleEndDateChange = (e) => setFilterEndDate(e.target.value);

    const getStatusVariant = (status) => {
        switch (status) {
            case 'Confirmed': return 'success';
            case 'Pending': return 'warning';
            case 'Cancelled': return 'danger';
            case 'Completed': return 'info';
            case 'CheckedIn': return 'primary';
            default: return 'secondary';
        }
    };

    if (loading) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">{t('loadingBookings')}</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <h4>{t('errorLoadingBookings')}</h4>
                    <p>{error}</p>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4">{t('ownerBookings')}</h2>

            <Card className="mb-4">
                <Card.Body>
                    <Card.Title>{t('filterBookings')}</Card.Title>
                    <Row className="g-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>{t('status')}</Form.Label>
                                <Form.Select value={filterStatus} onChange={handleStatusChange}>
                                    <option value="">{t('all')}</option>
                                    <option value="Pending">{t('pending')}</option>
                                    <option value="Confirmed">{t('confirmed')}</option>
                                    <option value="CheckedIn">{t('checkedIn')}</option>
                                    <option value="Completed">{t('completed')}</option>
                                    <option value="Cancelled">{t('cancelled')}</option>
                                    <option value="NoShow">{t('noShow')}</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>{t('startDate')}</Form.Label>
                                <Form.Control type="date" value={filterStartDate} onChange={handleStartDateChange} />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>{t('endDate')}</Form.Label>
                                <Form.Control type="date" value={filterEndDate} onChange={handleEndDateChange} />
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {bookings.length === 0 ? (
                <Alert variant="info">{t('noBookingsFound')}</Alert>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {bookings.map(booking => (
                        <Col key={booking.id}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>{booking.spaceName || t('unknownSpace')}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">
                                        {t('bookingCode')}: {booking.bookingCode}
                                    </Card.Subtitle>
                                    <p><strong>{t('booker')}:</strong> {booking.bookerUsername || t('unknown')}</p>
                                    <p><strong>{t('time')}:</strong> {format(new Date(booking.startTime), 'PPP p')} - {format(new Date(booking.endTime), 'PPP p')}</p>
                                    <p><strong>{t('totalPrice')}:</strong> {booking.totalPrice?.toLocaleString('vi-VN')} VND</p>
                                    <p>
                                        <strong>{t('status')}:</strong>{' '}
                                        <span className={`badge bg-${getStatusVariant(booking.status)}`}>
                                            {t(booking.status.toLowerCase())}
                                        </span>
                                    </p>
                                    <div className="d-flex justify-content-end">
                                        <Button variant="primary" size="sm" as={Link} to={`/owner/bookings/${booking.id}`}>
                                            {t('viewDetails')}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default OwnerBookingsPage;