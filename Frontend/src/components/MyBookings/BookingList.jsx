import React from 'react';
import { Card, Badge, Stack, Button, Placeholder } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/formatters';
import { formatVietnameseDate } from '../../utils/timeUtils';

const BookingStatusBadge = ({ status }) => {
  const { t } = useTranslation();
  
  const statusConfig = {
    Pending: { variant: 'warning', label: t('bookingStatus.pending') },
    Confirmed: { variant: 'success', label: t('bookingStatus.confirmed') },
    Cancelled: { variant: 'danger', label: t('bookingStatus.cancelled') },
    Completed: { variant: 'secondary', label: t('bookingStatus.completed') },
    CheckedIn: { variant: 'info', label: t('bookingStatus.checkedIn') },
    CheckedOut: { variant: 'success', label: t('bookingStatus.checkedOut') },
    NoShow: { variant: 'dark', label: t('bookingStatus.noShow') }
  };

  const config = statusConfig[status] || statusConfig.Pending;

  return (
    <Badge bg={config.variant}>
      {config.label}
    </Badge>
  );
};

const BookingList = ({ bookings = [], isLoading, onBookingClick }) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="mb-3">
            <Card.Body>
              <Placeholder as={Card.Title} animation="glow">
                <Placeholder xs={6} />
              </Placeholder>
              <Placeholder as={Card.Text} animation="glow">
                <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} />{' '}
                <Placeholder xs={6} /> <Placeholder xs={8} />
              </Placeholder>
            </Card.Body>
          </Card>
        ))}
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <Card className="text-center">
        <Card.Body>
          <p className="text-muted mb-0">{t('myBookings.noBookings')}</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div>
      {bookings.map((booking) => (
        <Card 
          key={booking.id} 
          className="mb-3 cursor-pointer hover-shadow" 
          onClick={() => onBookingClick(booking)}
        >
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <Card.Title className="mb-1">{booking.spaceName}</Card.Title>
                <Card.Subtitle className="text-muted">
                  {t('myBookings.bookingId')}: {booking.id}
                </Card.Subtitle>
              </div>
              <BookingStatusBadge status={booking.status} />
            </div>

            <Stack gap={2}>
              <div>
                <div className="text-muted">{t('myBookings.dates')}:</div>
                <div>{formatVietnameseDate(booking.startTime)} - {formatVietnameseDate(booking.endTime)}</div>
              </div>

              <div>
                <div className="text-muted">{t('myBookings.totalAmount')}:</div>
                <div className="fw-bold">{formatCurrency(booking.totalPrice)}</div>
              </div>

              {booking.status === 'Completed' && booking.canReview && (
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button 
                    variant="outline-primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle review click
                    }}
                  >
                    {t('myBookings.leaveReview')}
                  </Button>
                </div>
              )}
            </Stack>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default BookingList;
