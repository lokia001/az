import React, { useState, useEffect } from 'react';
import {
  useGetOwnerServicesQuery,
  useGetBookingServicesQuery,
  useAddServiceToBookingMutation,
  useUpdateBookingServiceMutation,
  useRemoveServiceFromBookingMutation,
} from '../services/ownerServicesApi';
import './BookingServicesModal.css';

const BookingServicesModal = ({ isOpen, onClose, bookingId, onUpdateTotal }) => {
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);

  const {
    data: ownerServices = [],
    isLoading: isLoadingServices,
  } = useGetOwnerServicesQuery();

  const {
    data: bookingServices = [],
    isLoading: isLoadingBookingServices,
    refetch: refetchBookingServices,
  } = useGetBookingServicesQuery(bookingId, {
    skip: !bookingId,
  });

  const [addServiceToBooking] = useAddServiceToBookingMutation();
  const [updateBookingService] = useUpdateBookingServiceMutation();
  const [removeServiceFromBooking] = useRemoveServiceFromBookingMutation();

  useEffect(() => {
    if (isOpen) {
      refetchBookingServices();
    }
  }, [isOpen, refetchBookingServices]);

  const handleAddService = async (e) => {
    e.preventDefault();
    
    if (!selectedServiceId || quantity <= 0) {
      alert('Vui lòng chọn dịch vụ và nhập số lượng hợp lệ');
      return;
    }

    try {
      await addServiceToBooking({
        bookingId,
        serviceData: {
          privateServiceId: parseInt(selectedServiceId),
          quantity: parseInt(quantity),
        },
      }).unwrap();

      setSelectedServiceId('');
      setQuantity(1);
      refetchBookingServices();
      onUpdateTotal && onUpdateTotal();
    } catch (error) {
      console.error('Error adding service to booking:', error);
      alert('Có lỗi xảy ra khi thêm dịch vụ');
    }
  };

  const handleUpdateService = async (serviceId) => {
    if (editQuantity <= 0) {
      alert('Số lượng phải lớn hơn 0');
      return;
    }

    try {
      await updateBookingService({
        bookingId,
        serviceId,
        serviceData: {
          quantity: parseInt(editQuantity),
        },
      }).unwrap();

      setEditingServiceId(null);
      refetchBookingServices();
      onUpdateTotal && onUpdateTotal();
    } catch (error) {
      console.error('Error updating booking service:', error);
      alert('Có lỗi xảy ra khi cập nhật dịch vụ');
    }
  };

  const handleRemoveService = async (serviceId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này khỏi booking?')) {
      try {
        await removeServiceFromBooking({
          bookingId,
          serviceId,
        }).unwrap();

        refetchBookingServices();
        onUpdateTotal && onUpdateTotal();
      } catch (error) {
        console.error('Error removing service from booking:', error);
        alert('Có lỗi xảy ra khi xóa dịch vụ');
      }
    }
  };

  const startEdit = (service) => {
    setEditingServiceId(service.id);
    setEditQuantity(service.quantity);
  };

  const cancelEdit = () => {
    setEditingServiceId(null);
    setEditQuantity(1);
  };

  const calculateTotal = () => {
    return bookingServices.reduce((total, service) => {
      return total + (service.unitPrice * service.quantity);
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="booking-services-modal">
        <div className="modal-header">
          <h2>Quản lý dịch vụ cho Booking #{bookingId}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          {/* Add Service Form */}
          <div className="add-service-section">
            <h3>Thêm dịch vụ</h3>
            <form onSubmit={handleAddService} className="add-service-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Dịch vụ</label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    required
                  >
                    <option value="">Chọn dịch vụ</option>
                    {ownerServices.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - {service.unitPrice.toLocaleString('vi-VN')} VND/{service.unit}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Số lượng</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Thêm
                </button>
              </div>
            </form>
          </div>

          {/* Current Services List */}
          <div className="current-services-section">
            <h3>Dịch vụ đã thêm</h3>
            {isLoadingBookingServices ? (
              <div className="loading">Đang tải...</div>
            ) : bookingServices.length === 0 ? (
              <div className="empty-state">
                <p>Chưa có dịch vụ nào được thêm vào booking này</p>
              </div>
            ) : (
              <div className="services-list">
                {bookingServices.map((service) => (
                  <div key={service.id} className="service-item">
                    <div className="service-info">
                      <h4>{service.serviceName}</h4>
                      <p>Giá: {service.unitPrice.toLocaleString('vi-VN')} VND/{service.unit || 'đơn vị'}</p>
                    </div>
                    
                    <div className="service-quantity">
                      {editingServiceId === service.id ? (
                        <div className="edit-quantity">
                          <input
                            type="number"
                            min="1"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(e.target.value)}
                          />
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleUpdateService(service.id)}
                          >
                            Lưu
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={cancelEdit}
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <div className="quantity-display">
                          <span>SL: {service.quantity}</span>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => startEdit(service)}
                          >
                            Sửa
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="service-total">
                      <strong>{(service.unitPrice * service.quantity).toLocaleString('vi-VN')} VND</strong>
                    </div>

                    <div className="service-actions">
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRemoveService(service.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total */}
          {bookingServices.length > 0 && (
            <div className="services-total">
              <h3>Tổng tiền dịch vụ: {calculateTotal().toLocaleString('vi-VN')} VND</h3>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingServicesModal;
