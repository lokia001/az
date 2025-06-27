import React from 'react';
import { Card, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const BookingFilters = ({ filters, onFilterChange }) => {
  const { t } = useTranslation();

  const handleStatusChange = (event) => {
    onFilterChange({ status: event.target.value });
  };

  const handleStartDateChange = (event) => {
    onFilterChange({
      dateRange: {
        ...filters.dateRange,
        start: event.target.value ? new Date(event.target.value) : null
      }
    });
  };

  const handleEndDateChange = (event) => {
    onFilterChange({
      dateRange: {
        ...filters.dateRange,
        end: event.target.value ? new Date(event.target.value) : null
      }
    });
  };

  const handleSortChange = (event) => {
    onFilterChange({ sortBy: event.target.value });
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>{t('myBookings.filters.title')}</Card.Title>
        
        <Form className="mt-3">
          <Form.Group className="mb-3">
            <Form.Label>{t('myBookings.filters.status')}</Form.Label>
            <Form.Select
              value={filters.status}
              onChange={handleStatusChange}
            >
              <option value="all">{t('myBookings.filters.allStatuses')}</option>
              <option value="pending">{t('bookingStatus.pending')}</option>
              <option value="confirmed">{t('bookingStatus.confirmed')}</option>
              <option value="cancelled">{t('bookingStatus.cancelled')}</option>
              <option value="completed">{t('bookingStatus.completed')}</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('myBookings.filters.dateRange')}</Form.Label>
            <Form.Control
              type="date"
              value={filters.dateRange.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
              onChange={handleStartDateChange}
              className="mb-2"
            />
            <Form.Control
              type="date"
              value={filters.dateRange.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
              onChange={handleEndDateChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('myBookings.filters.sortBy')}</Form.Label>
            <Form.Select
              value={filters.sortBy}
              onChange={handleSortChange}
            >
              <option value="dateDesc">{t('myBookings.filters.newest')}</option>
              <option value="dateAsc">{t('myBookings.filters.oldest')}</option>
              <option value="priceDesc">{t('myBookings.filters.priceHighToLow')}</option>
              <option value="priceAsc">{t('myBookings.filters.priceLowToHigh')}</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default BookingFilters;
