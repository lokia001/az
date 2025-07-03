import React, { useState } from 'react';
import { Modal, Button, Row, Col, Stack, Form, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { formatVietnameseDateTime } from '../../utils/timeUtils';
import apiClient from '../../services/apiClient';

const DetailSection = ({ title, children }) => (
  <div className="mb-4">
    <h6 className="text-muted mb-2">{title}</h6>
    {children}
  </div>
);

const BookingStatusBadge = ({ status }) => {
  const { t } = useTranslation();
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  
  const statusConfig = {
    Pending: { variant: 'warning', label: t('bookingStatus.pending') },
    Confirmed: { variant: 'success', label: t('bookingStatus.confirmed') },
    Cancelled: { variant: 'danger', label: t('bookingStatus.cancelled') },
    Completed: { variant: 'secondary', label: t('bookingStatus.completed') }
  };

  const config = statusConfig[status] || statusConfig.Pending;

  return (
    <Badge bg={config.variant} className="fs-6">
      {config.label}
    </Badge>
  );
};

const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffTime = Math.abs(end - start);
  const diffHours = Math.round(diffTime / (1000 * 60 * 60) * 10) / 10;
  return diffHours;
};

const BookingDetailModal = ({ booking, show, onHide }) => {
  const { t } = useTranslation();
  const duration = calculateDuration(booking?.startTime, booking?.endTime);

  const handleCancel = async () => {
    try {
      // Your cancel logic here
      onHide();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  // Submit review to backend
  const handleReviewSubmit = async () => {
    setSubmitting(true);
    try {
      await apiClient.post(
        `/api/bookings/${booking.id}/reviews`,
        { spaceId: booking.spaceId, rating, commentText }
      );
      setReviewSubmitted(true);
      setShowReviewForm(false);
      // Optionally show success message
    } catch (error) {
      console.error('Review submit error:', error);
      alert(t('myBookings.review.error') || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!booking) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="booking-detail-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{t('myBookings.details.title')}</Modal.Title>
      </Modal.Header>

        <Modal.Body>
        <Stack gap={4}>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h4 className="mb-1">{booking.spaceName}</h4>
              <div className="text-muted">
                {t('myBookings.bookingCode')}: <strong>{booking.bookingCode}</strong>
              </div>
              <div className="text-muted small">
                ID: {booking.id}
              </div>
            </div>
            <div className="text-end">
              <BookingStatusBadge status={booking.status} />
              {booking.paymentStatus && (
                <div className="mt-2">
                  <Badge bg={booking.paymentStatus === 'Paid' ? 'success' : 'warning'} className="fs-6">
                    {t(`myBookings.paymentStatus.${booking.paymentStatus.toLowerCase()}`)}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <Row>
            <Col md={6}>
              <DetailSection title={t('myBookings.details.dates')}>
                <div className="booking-times">
                  <div className="mb-2">
                    <strong>{t('myBookings.details.startTime')}:</strong><br />
                    {formatVietnameseDateTime(booking.startTime)}
                  </div>
                  <div className="mb-2">
                    <strong>{t('myBookings.details.endTime')}:</strong><br />
                    {formatVietnameseDateTime(booking.endTime)}
                  </div>
                  <div className="text-muted mt-2">
                    <strong>{t('myBookings.details.duration')}:</strong>{' '}
                    {duration} {t('myBookings.details.hours')}
                  </div>
                </div>
                <div className="mt-3">
                  <strong>{t('myBookings.details.numberOfPeople')}:</strong>{' '}
                  {booking.numberOfPeople} {t('myBookings.details.people')}
                </div>
              </DetailSection>

              {(booking.actualCheckIn || booking.actualCheckOut) && (
                <DetailSection title={t('myBookings.details.actualTimes')}>
                  {booking.actualCheckIn && (
                    <div className="mb-2">
                      <strong>{t('myBookings.details.actualCheckIn')}:</strong><br />
                      {formatVietnameseDateTime(booking.actualCheckIn)}
                    </div>
                  )}
                  {booking.actualCheckOut && (
                    <div>
                      <strong>{t('myBookings.details.actualCheckOut')}:</strong><br />
                      {formatVietnameseDateTime(booking.actualCheckOut)}
                    </div>
                  )}
                </DetailSection>
              )}

              {booking.amenities && booking.amenities.length > 0 && (
                <DetailSection title={t('myBookings.details.amenities')}>
                  <div className="amenities-list">
                    {booking.amenities.map((amenity, index) => (
                      <Badge 
                        key={index} 
                        bg="light" 
                        text="dark" 
                        className="me-2 mb-2"
                      >
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </DetailSection>
              )}

              {(booking.notesFromUser || booking.notesFromOwner) && (
                <DetailSection title={t('myBookings.details.notes')}>
                  {booking.notesFromUser && (
                    <div className="mb-2">
                      <strong>{t('myBookings.details.userNotes')}:</strong><br />
                      <p className="text-muted mb-3">{booking.notesFromUser}</p>
                    </div>
                  )}
                  {booking.notesFromOwner && (
                    <div>
                      <strong>{t('myBookings.details.ownerNotes')}:</strong><br />
                      <p className="text-muted">{booking.notesFromOwner}</p>
                    </div>
                  )}
                </DetailSection>
              )}
            </Col>

            <Col md={6}>
              <DetailSection title={t('myBookings.details.payment')}>
                <div className="price-details p-3 bg-light rounded">
                  {booking.pricePerHour && (
                    <Row className="mb-2">
                      <Col xs={7}>{t('myBookings.details.pricePerHour')}</Col>
                      <Col xs={5} className="text-end">
                        {formatCurrency(booking.pricePerHour)}
                      </Col>
                    </Row>
                  )}
                  
                  {booking.additionalServices && booking.additionalServices.map((service, index) => (
                    <Row key={index} className="mb-2">
                      <Col xs={7}>{service.name}</Col>
                      <Col xs={5} className="text-end">
                        {formatCurrency(service.price)}
                      </Col>
                    </Row>
                  ))}

                  {booking.discount > 0 && (
                    <Row className="mb-2 text-success">
                      <Col xs={7}>{t('myBookings.details.discount')}</Col>
                      <Col xs={5} className="text-end">
                        -{formatCurrency(booking.discount)}
                      </Col>
                    </Row>
                  )}

                  <hr className="my-2" />
                  
                  <Row className="mb-2">
                    <Col xs={7}>{t('myBookings.details.totalPrice')}</Col>
                    <Col xs={5} className="text-end fw-bold fs-5">
                      {formatCurrency(booking.totalPrice)}
                    </Col>
                  </Row>

                  {booking.paymentMethod && (
                    <div className="text-muted small mt-3">
                      {t('myBookings.details.paymentMethod')}: {booking.paymentMethod}
                    </div>
                  )}
                </div>

                <div className="booking-dates text-muted small mt-3">
                  {booking.createdAt && (
                    <div>
                      {t('myBookings.details.createdAt')}: {formatVietnameseDateTime(booking.createdAt)}
                    </div>
                  )}
                  {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
                    <div>
                      {t('myBookings.details.updatedAt')}: {formatVietnameseDateTime(booking.updatedAt)}
                    </div>
                  )}
                </div>
              </DetailSection>
            </Col>
          </Row>
        </Stack>
      </Modal.Body>

      <Modal.Footer>
        <div className="d-flex flex-column gap-3">
          {booking.status === 'Pending' && (
            <Button variant="danger" onClick={handleCancel}>
              {t('myBookings.actions.cancel')}
            </Button>
          )}
          {booking.canReview && !reviewSubmitted && !showReviewForm && (
            <Button variant="primary" onClick={() => setShowReviewForm(true)}>
              {t('myBookings.actions.review')}
            </Button>
          )}
          {showReviewForm && (
            <Form onSubmit={e => { e.preventDefault(); handleReviewSubmit(); }}>
              <Form.Group controlId="rating" className="mb-2">
                <Form.Label>{t('myBookings.review.rating')}</Form.Label>
                <Form.Select value={rating} onChange={e => setRating(Number(e.target.value))}>
                  {[1,2,3,4,5].map(val => (
                    <option key={val} value={val}>{val} ⭐</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="commentText" className="mb-2">
                <Form.Label>{t('myBookings.review.comment')}</Form.Label>
                <Form.Control as="textarea" rows={3} value={commentText}
                  onChange={e => setCommentText(e.target.value)} />
              </Form.Group>
              <div className="d-flex gap-2">
                <Button type="submit" variant="success" disabled={submitting}>
                  {submitting ? <Spinner animation="border" size="sm" /> : t('myBookings.actions.submitReview')}
                </Button>
                <Button variant="secondary" onClick={() => setShowReviewForm(false)} disabled={submitting}>
                  {t('common.cancel')}
                </Button>
              </div>
            </Form>
          )}
          
          {booking.status === 'Confirmed' && (
            <Button variant="primary" onClick={() => {/* Handle download invoice */}}>
              {t('myBookings.actions.downloadInvoice')}
            </Button>
          )}
          
          <Button variant="secondary" onClick={onHide}>
            {t('common.close')}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default BookingDetailModal;
