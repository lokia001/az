import React, { useState } from 'react';
import { 
  useGetOwnerServicesQuery,
  useCreateOwnerServiceMutation,
  useUpdateOwnerServiceMutation,
  useDeleteOwnerServiceMutation 
} from '../services/ownerServicesApi';
import './OwnerServicesManagement.css';

const OwnerServicesManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    unitPrice: '',
    unit: '',
    description: ''
  });

  const { 
    data: services = [], 
    isLoading, 
    error,
    refetch 
  } = useGetOwnerServicesQuery();

  // Debug log
  console.log('OwnerServicesManagement - API State:', {
    services,
    isLoading,
    error,
    servicesLength: services.length
  });

  console.log('OwnerServicesManagement - Modal State:', {
    isModalOpen,
    editingService,
    serviceForm
  });

  const [createService] = useCreateOwnerServiceMutation();
  const [updateService] = useUpdateOwnerServiceMutation();
  const [deleteService] = useDeleteOwnerServiceMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const serviceData = {
        ...serviceForm,
        unitPrice: parseFloat(serviceForm.unitPrice)
      };

      if (editingService) {
        await updateService({ 
          id: editingService.id, 
          serviceData 
        }).unwrap();
      } else {
        await createService(serviceData).unwrap();
      }

      resetForm();
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Có lỗi xảy ra khi lưu dịch vụ');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      unitPrice: service.unitPrice.toString(),
      unit: service.unit,
      description: service.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
      try {
        await deleteService(id).unwrap();
        refetch();
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Có lỗi xảy ra khi xóa dịch vụ');
      }
    }
  };

  const openCreateModal = () => {
    console.log('Opening create modal...');
    resetForm();
    setIsModalOpen(true);
  };

  const resetForm = () => {
    console.log('Resetting form...');
    setServiceForm({
      name: '',
      unitPrice: '',
      unit: '',
      description: ''
    });
    setEditingService(null);
  };

  if (isLoading) return (
    <div className="loading" style={{ textAlign: 'center', padding: '3rem' }}>
      <div>Đang tải dịch vụ...</div>
      <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
        Đang kết nối tới API...
      </div>
    </div>
  );
  
  if (error) return (
    <div className="error" style={{ textAlign: 'center', padding: '3rem' }}>
      <div>Có lỗi xảy ra: {error.message || error.data?.message || 'Unknown error'}</div>
      <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
        {error.status && `Status: ${error.status}`}
      </div>
      <button 
        onClick={refetch} 
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        Thử lại
      </button>
    </div>
  );

  return (
    <div className="owner-services-management">
      <div className="header">
        <h1>Quản lý Dịch vụ & Tiện ích</h1>
        <button 
          className="btn btn-primary"
          onClick={openCreateModal}
        >
          Thêm dịch vụ mới
        </button>
      </div>

      <div className="services-grid">
        {services.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có dịch vụ nào. Hãy thêm dịch vụ đầu tiên!</p>
          </div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-header">
                <h3>{service.name}</h3>
                <div className="service-actions">
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleEdit(service)}
                  >
                    Sửa
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(service.id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
              <div className="service-details">
                <p><strong>Giá:</strong> {service.unitPrice.toLocaleString('vi-VN')} VND/{service.unit}</p>
                {service.description && (
                  <p><strong>Mô tả:</strong> {service.description}</p>
                )}
                <p><small>Tạo lúc: {new Date(service.createdAt).toLocaleDateString('vi-VN')}</small></p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal - Pure inline styles */}
      {isModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={(e) => {
            console.log('Modal overlay clicked - should close');
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '8px',
              width: '500px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              padding: '20px'
            }}
            onClick={(e) => {
              console.log('Modal content clicked - should not close');
              e.stopPropagation();
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>{editingService ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'}</h2>
              <button 
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '5px 10px'
                }}
                onClick={() => {
                  console.log('Close button clicked - should close modal');
                  setIsModalOpen(false);
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Tên dịch vụ *
                </label>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  required
                  placeholder="Ví dụ: Cà phê, Nước uống, In ấn..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Giá đơn vị *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={serviceForm.unitPrice}
                    onChange={(e) => setServiceForm({ ...serviceForm, unitPrice: e.target.value })}
                    required
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Đơn vị *
                  </label>
                  <input
                    type="text"
                    value={serviceForm.unit}
                    onChange={(e) => setServiceForm({ ...serviceForm, unit: e.target.value })}
                    required
                    placeholder="Ví dụ: ly, trang, giờ..."
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Mô tả
                </label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  rows={3}
                  placeholder="Mô tả chi tiết về dịch vụ..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: '#f8f9fa',
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    background: '#007bff',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  {editingService ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerServicesManagement;
