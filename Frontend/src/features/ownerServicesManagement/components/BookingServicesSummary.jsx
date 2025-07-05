import React from 'react';
import { useGetBookingServicesQuery } from '../services/ownerServicesApi';

const BookingServicesSummary = ({ bookingId }) => {
  const { 
    data: services = [], 
    isLoading, 
    error 
  } = useGetBookingServicesQuery(bookingId, {
    skip: !bookingId,
  });

  if (isLoading) return <div>Đang tải dịch vụ...</div>;
  if (error) return <div>Không thể tải dịch vụ</div>;
  if (services.length === 0) return <div>Chưa có dịch vụ nào</div>;

  const totalAmount = services.reduce((sum, service) => 
    sum + (service.unitPrice * service.quantity), 0
  );

  return (
    <div className="booking-services-summary">
      <h6>Dịch vụ đã sử dụng:</h6>
      <div className="services-list">
        {services.map((service) => (
          <div key={service.id} className="service-item d-flex justify-content-between">
            <span>
              {service.serviceName} x {service.quantity} {service.unit || 'đơn vị'}
            </span>
            <span className="fw-bold">
              {(service.unitPrice * service.quantity).toLocaleString('vi-VN')} VND
            </span>
          </div>
        ))}
      </div>
      <hr />
      <div className="total-services d-flex justify-content-between fw-bold">
        <span>Tổng tiền dịch vụ:</span>
        <span>{totalAmount.toLocaleString('vi-VN')} VND</span>
      </div>
    </div>
  );
};

export default BookingServicesSummary;
