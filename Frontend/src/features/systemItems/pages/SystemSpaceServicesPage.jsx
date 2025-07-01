import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/apiClient';

const SystemSpaceServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // 6 items per page (2 rows of 3 cards)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconUrl: '',
    isActive: true
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/admin/system/space-services');
      setServices(response.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      
      if (editingService) {
        await apiClient.put(`/api/admin/system/space-services/${editingService.id}`, formData);
        setSuccess('Service updated successfully!');
      } else {
        await apiClient.post('/api/admin/system/space-services', formData);
        setSuccess('Service created successfully!');
      }
      
      setShowCreateModal(false);
      setEditingService(null);
      setFormData({ name: '', description: '', iconUrl: '', isActive: true });
      fetchServices();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving service:', error);
      setError('Failed to save service. Please try again.');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      iconUrl: service.iconUrl || '',
      isActive: service.isActive !== false
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        setError('');
        setSuccess('');
        
        await apiClient.delete(`/api/admin/system/space-services/${id}`);
        setSuccess('Service deleted successfully!');
        fetchServices();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting service:', error);
        setError('Failed to delete service. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', iconUrl: '', isActive: true });
    setEditingService(null);
    setShowCreateModal(false);
    setError('');
    setSuccess('');
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentServices = services.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(services.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>System Space Services</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="fas fa-plus me-2"></i>
          Add Service
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      <div className="row">
        {currentServices.length === 0 ? (
          <div className="col-12">
            <div className="text-center py-5">
              <i className="fas fa-concierge-bell fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No services found</h5>
              <p className="text-muted">Create your first service to get started.</p>
            </div>
          </div>
        ) : (
          currentServices.map((service) => (
            <div key={service.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center">
                      {service.iconUrl && (
                        <img 
                          src={service.iconUrl} 
                          alt={service.name}
                          className="me-3"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                      )}
                      <h5 className="card-title mb-0">{service.name}</h5>
                    </div>
                    <span className={`badge ${service.isActive ? 'bg-success' : 'bg-secondary'}`}>
                      {/* {service.isActive ? 'Active' : 'Inactive'} */}
                    </span>
                  </div>
                  
                  <p className="card-text text-muted">
                    {service.description || 'No description available'}
                  </p>
                  
                  <div className="d-flex justify-content-end gap-2">
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleEdit(service)}
                    >
                      <i className="fas fa-edit me-1"></i>
                      Edit
                    </button>
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(service.id)}
                    >
                      <i className="fas fa-trash me-1"></i>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Services pagination" className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>
            
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                </li>
              );
            })}
            
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingService ? 'Edit Service' : 'Create Service'}
                </h5>
                <button type="button" className="btn-close" onClick={resetForm}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="serviceName" className="form-label">Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="serviceName"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="serviceDescription" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="serviceDescription"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="serviceIconUrl" className="form-label">Icon URL</label>
                    <input
                      type="url"
                      className="form-control"
                      id="serviceIconUrl"
                      value={formData.iconUrl}
                      onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                    />
                  </div>
                  
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="serviceIsActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="serviceIsActive">
                      Active
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingService ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSpaceServicesPage;