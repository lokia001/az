import React, { useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import BookingList from '../../components/MyBookings/BookingList';
import BookingFilters from '../../components/MyBookings/BookingFilters';
import BookingDetailModal from '../../components/MyBookings/BookingDetailModal';
import { useTranslation } from 'react-i18next';
import { useBookings } from '../../hooks/useBookings';

const MyBookingsPage = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: {
      start: null,
      end: null
    },
    sortBy: 'dateDesc'
  });
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { bookings, isLoading, error } = useBookings(filters);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
  };

  const handleCloseModal = () => {
    setSelectedBooking(null);
  };

  if (error) {
    return (
      <Container>
        <Alert variant="danger" className="text-center">
          {t('myBookings.errorLoading')}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">{t('myBookings.title')}</h1>
      
      <Row className="g-4">
        <Col xs={12} md={3}>
          <BookingFilters 
            filters={filters} 
            onFilterChange={handleFilterChange} 
          />
        </Col>
        
        <Col xs={12} md={9}>
          <BookingList 
            bookings={bookings} 
            isLoading={isLoading} 
            onBookingClick={handleBookingClick}
          />
        </Col>
      </Row>

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          show={Boolean(selectedBooking)}
          onHide={handleCloseModal}
        />
      )}
    </Container>
  );
};

export default MyBookingsPage;
