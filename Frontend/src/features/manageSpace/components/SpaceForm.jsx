import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Row, Col } from 'react-bootstrap';
import { createSpaceAsync, updateSpaceAsync } from '../manageSpaceSlice';
import { fetchSystemAmenities } from '../../systemItems/slices/systemAmenitiesSlice';
import { fetchSystemSpaceServices } from '../../systemItems/slices/systemSpaceServicesSlice';

function SpaceForm({ initialData = {}, onSubmit, onCancel }) {
    const dispatch = useDispatch();
    
    const systemAmenities = useSelector(state => state.systemAmenities.amenities) || [];
    const systemServices = useSelector(state => state.systemSpaceServices.services) || [];
    
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        description: initialData.description || '',
        address: initialData.address || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
        type: initialData.type || 'Individual',
        capacity: initialData.capacity || '',
        pricePerHour: initialData.pricePerHour || initialData.basePrice || '',
        pricePerDay: initialData.pricePerDay || '',
        openTime: initialData.openTime || '',
        closeTime: initialData.closeTime || '',
        accessInstructions: initialData.accessInstructions || '',
        houseRules: initialData.houseRules || '',
        minBookingDurationMinutes: initialData.minBookingDurationMinutes || 30,
        maxBookingDurationMinutes: initialData.maxBookingDurationMinutes || 1440,
        cancellationNoticeHours: initialData.cancellationNoticeHours || 24,
        cleaningDurationMinutes: initialData.cleaningDurationMinutes || 0,
        bufferMinutes: initialData.bufferMinutes || 0,
        status: initialData.status || 'Available',
        selectedSystemAmenityIds: initialData.selectedSystemAmenityIds || initialData.systemAmenities || [],
        customAmenityNames: initialData.customAmenityNames || [],
        selectedSystemServices: initialData.selectedSystemServices || initialData.systemServices || [],
        customServiceRequests: initialData.customServiceRequests || [],
    });
    
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        dispatch(fetchSystemAmenities());
        dispatch(fetchSystemSpaceServices());
    }, [dispatch]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };
    
    const handleSystemAmenityToggle = (amenityId) => {
        setFormData(prev => {
            const newSelectedSystemAmenityIds = prev.selectedSystemAmenityIds.includes(amenityId)
                ? prev.selectedSystemAmenityIds.filter(id => id !== amenityId)
                : [...prev.selectedSystemAmenityIds, amenityId];
            return {
                ...prev,
                selectedSystemAmenityIds: newSelectedSystemAmenityIds,
                // Keep systemAmenities in sync for backward compatibility
                systemAmenities: newSelectedSystemAmenityIds
            };
        });
    };
    
    const handleSystemServiceToggle = (serviceId) => {
        setFormData(prev => {
            // Check if the service ID exists in either the new or old format
            const isSelected = 
                prev.selectedSystemServices.includes(serviceId) || 
                prev.selectedSystemServices.some(s => s.systemFeatureId === serviceId);
            
            let newSelectedSystemServices;
            if (isSelected) {
                // Remove the service
                newSelectedSystemServices = prev.selectedSystemServices.filter(s => {
                    // Handle both formats (string IDs and object format)
                    if (typeof s === 'string') return s !== serviceId;
                    return s.systemFeatureId !== serviceId;
                });
            } else {
                // Add the service with the new format
                newSelectedSystemServices = [
                    ...prev.selectedSystemServices,
                    serviceId
                ];
            }
            
            return {
                ...prev,
                selectedSystemServices: newSelectedSystemServices,
                // Keep systemServices in sync for backward compatibility
                systemServices: newSelectedSystemServices.map(s => typeof s === 'string' ? s : s.systemFeatureId)
            };
        });
    };
    
    const validateForm = () => {
        const errors = {};
        if (!formData.name) errors.name = 'Tên không gian là bắt buộc';
        if (!formData.address) errors.address = 'Địa chỉ là bắt buộc';
        if (!formData.type) errors.type = 'Loại không gian là bắt buộc';
        if (!formData.capacity || parseInt(formData.capacity) <= 0) errors.capacity = 'Sức chứa phải lớn hơn 0';
        if (!formData.pricePerHour || parseFloat(formData.pricePerHour) <= 0) errors.pricePerHour = 'Giá theo giờ phải lớn hơn 0';
        
        // Validate pricePerDay if provided
        if (formData.pricePerDay && parseFloat(formData.pricePerDay) <= 0) {
            errors.pricePerDay = 'Giá theo ngày phải lớn hơn 0';
        }
        
        // Validate times if provided
        if (formData.openTime && !formData.closeTime) {
            errors.closeTime = 'Thời gian đóng cửa là bắt buộc nếu có thời gian mở cửa';
        }
        if (formData.closeTime && !formData.openTime) {
            errors.openTime = 'Thời gian mở cửa là bắt buộc nếu có thời gian đóng cửa';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        // Prevent default behavior even though we're using a button
        if (e && e.preventDefault) e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // Format the time values as TimeSpan strings (HH:MM:SS format expected by backend)
            const formatTimeSpan = (timeString) => {
                if (!timeString) return null;
                // Convert HTML time input (HH:MM) to TimeSpan format (HH:MM:SS)
                return `${timeString}:00`;
            };

            // Prepare the data in the format expected by the backend
            const spaceData = {
                name: formData.name,
                description: formData.description || null,
                address: formData.address,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                type: formData.type,
                capacity: parseInt(formData.capacity || 0, 10),
                pricePerHour: parseFloat(formData.pricePerHour || 0),
                pricePerDay: formData.pricePerDay ? parseFloat(formData.pricePerDay) : null,
                openTime: formatTimeSpan(formData.openTime),
                closeTime: formatTimeSpan(formData.closeTime),
                accessInstructions: formData.accessInstructions || null,
                houseRules: formData.houseRules || null,
                selectedSystemAmenityIds: formData.selectedSystemAmenityIds || formData.systemAmenities || [],
                customAmenityNames: formData.customAmenityNames || [],
                selectedSystemServices: (formData.selectedSystemServices || []).map(id => {
                    if (typeof id === 'string') {
                        return {
                            systemFeatureId: id,
                            priceOverride: null,
                            notes: null
                        };
                    }
                    return id;
                }),
                customServiceRequests: formData.customServiceRequests || [],
                minBookingDurationMinutes: parseInt(formData.minBookingDurationMinutes || 30),
                maxBookingDurationMinutes: parseInt(formData.maxBookingDurationMinutes || 1440),
                cancellationNoticeHours: parseInt(formData.cancellationNoticeHours || 24),
                cleaningDurationMinutes: parseInt(formData.cleaningDurationMinutes || 0),
                bufferMinutes: parseInt(formData.bufferMinutes || 0),
            };
            
            console.log("Submitting space data:", spaceData);
            
            let result;
            if (initialData.id) {
                result = await dispatch(updateSpaceAsync({ ...spaceData, id: initialData.id })).unwrap();
            } else {
                result = await dispatch(createSpaceAsync(spaceData)).unwrap();
            }
            
            // Call onSubmit with success=true and the result
            if (onSubmit && typeof onSubmit === 'function') {
                // Use timeout to ensure any state updates complete before navigation
                setTimeout(() => {
                    onSubmit(true, result);
                }, 0);
            }
        } catch (error) {
            console.error('Error saving space:', error);
            setFormErrors(prev => ({
                ...prev,
                submit: error.message || 'Có lỗi xảy ra khi lưu không gian'
            }));
            
            if (onSubmit && typeof onSubmit === 'function') {
                onSubmit(false);
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleCancel = (e) => {
        // Prevent default behavior
        if (e && e.preventDefault) e.preventDefault();
        
        if (onCancel && typeof onCancel === 'function') {
            onCancel();
        } else if (onSubmit && typeof onSubmit === 'function') {
            onSubmit(false);
        }
    };
    
    // Prevent any wrapping form elements from causing a page reload
    const preventSubmit = (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }
        return false;
    };
    
    return (
        <div onSubmit={preventSubmit}>
            {formErrors.submit && (
                <Alert variant="danger">
                    {formErrors.submit}
                </Alert>
            )}
            
            <div className="mb-3">
                <label className="form-label">Tên không gian <span className="text-danger">*</span></label>
                <input 
                    type="text"
                    className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="off"
                />
                {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
            </div>
            
            <div className="mb-3">
                <label className="form-label">Địa chỉ <span className="text-danger">*</span></label>
                <input 
                    type="text"
                    className={`form-control ${formErrors.address ? 'is-invalid' : ''}`}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    autoComplete="off"
                    placeholder="Nhập địa chỉ đầy đủ của không gian"
                />
                {formErrors.address && <div className="invalid-feedback">{formErrors.address}</div>}
            </div>
            
            <Row>
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label">Vĩ độ (Latitude)</label>
                        <input 
                            type="number"
                            className="form-control"
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                            autoComplete="off"
                            step="0.000001"
                            min="-90"
                            max="90"
                            placeholder="Ví dụ: 10.7756587"
                        />
                        <small className="text-muted">Vĩ độ của địa điểm (-90 đến 90)</small>
                    </div>
                </Col>
                
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label">Kinh độ (Longitude)</label>
                        <input 
                            type="number"
                            className="form-control"
                            name="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                            autoComplete="off"
                            step="0.000001"
                            min="-180"
                            max="180"
                            placeholder="Ví dụ: 106.7004238"
                        />
                        <small className="text-muted">Kinh độ của địa điểm (-180 đến 180)</small>
                    </div>
                </Col>
            </Row>
            
            <Row>
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label">Loại không gian <span className="text-danger">*</span></label>
                        <select
                            className={`form-select ${formErrors.type ? 'is-invalid' : ''}`}
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <option value="Individual">Cá nhân</option>
                            <option value="Group">Nhóm</option>
                            <option value="Event">Sự kiện</option>
                        </select>
                        {formErrors.type && <div className="invalid-feedback">{formErrors.type}</div>}
                    </div>
                </Col>
                
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label">Sức chứa <span className="text-danger">*</span></label>
                        <input 
                            type="number"
                            className={`form-control ${formErrors.capacity ? 'is-invalid' : ''}`}
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            autoComplete="off"
                            min="1"
                            placeholder="Nhập số người tối đa"
                        />
                        <small className="text-muted">Số người tối đa có thể sử dụng không gian cùng lúc</small>
                        {formErrors.capacity && <div className="invalid-feedback">{formErrors.capacity}</div>}
                    </div>
                </Col>
            </Row>
            
            <Row>
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label">Giá theo giờ (VND) <span className="text-danger">*</span></label>
                        <input 
                            type="number"
                            className={`form-control ${formErrors.pricePerHour ? 'is-invalid' : ''}`}
                            name="pricePerHour"
                            value={formData.pricePerHour}
                            onChange={handleChange}
                            autoComplete="off"
                            min="0"
                            step="1000"
                        />
                        {formErrors.pricePerHour && <div className="invalid-feedback">{formErrors.pricePerHour}</div>}
                    </div>
                </Col>
                
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label">Giá theo ngày (VND)</label>
                        <input 
                            type="number"
                            className={`form-control ${formErrors.pricePerDay ? 'is-invalid' : ''}`}
                            name="pricePerDay"
                            value={formData.pricePerDay}
                            onChange={handleChange}
                            autoComplete="off"
                            min="0"
                            step="1000"
                        />
                        {formErrors.pricePerDay && <div className="invalid-feedback">{formErrors.pricePerDay}</div>}
                    </div>
                </Col>
            </Row>
            
            <div className="mb-3">
                <label className="form-label">Mô tả</label>
                <textarea
                    className="form-control"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                ></textarea>
            </div>
            
            <Row>
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label">Giờ mở cửa</label>
                        <input 
                            type="time"
                            className={`form-control ${formErrors.openTime ? 'is-invalid' : ''}`}
                            name="openTime"
                            value={formData.openTime || ''}
                            onChange={handleChange}
                            placeholder="07:00"
                        />
                        <small className="text-muted">Định dạng: HH:MM (24h)</small>
                        {formErrors.openTime && <div className="invalid-feedback">{formErrors.openTime}</div>}
                    </div>
                </Col>
                
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label">Giờ đóng cửa</label>
                        <input 
                            type="time"
                            className={`form-control ${formErrors.closeTime ? 'is-invalid' : ''}`}
                            name="closeTime"
                            value={formData.closeTime || ''}
                            onChange={handleChange}
                            placeholder="22:00"
                        />
                        <small className="text-muted">Định dạng: HH:MM (24h)</small>
                        {formErrors.closeTime && <div className="invalid-feedback">{formErrors.closeTime}</div>}
                    </div>
                </Col>
            </Row>
            
            <div className="mb-3">
                <label className="form-label">Hướng dẫn truy cập</label>
                <textarea
                    className="form-control"
                    name="accessInstructions"
                    rows="2"
                    value={formData.accessInstructions}
                    onChange={handleChange}
                    placeholder="Hướng dẫn cho khách hàng cách ra vào không gian"
                ></textarea>
            </div>
            
            <div className="mb-3">
                <label className="form-label">Nội quy không gian</label>
                <textarea
                    className="form-control"
                    name="houseRules"
                    rows="2"
                    value={formData.houseRules}
                    onChange={handleChange}
                    placeholder="Các quy định của không gian dành cho khách hàng"
                ></textarea>
            </div>
            
            <h5 className="mt-4 mb-3">Cài đặt đặt chỗ</h5>
            <Row>
                <Col md={4}>
                    <div className="mb-3">
                        <label className="form-label">Thời gian đặt tối thiểu (phút)</label>
                        <input 
                            type="number"
                            className="form-control"
                            name="minBookingDurationMinutes"
                            value={formData.minBookingDurationMinutes}
                            onChange={handleChange}
                            min="1"
                            max="1440"
                        />
                        <small className="text-muted">Thời gian đặt chỗ tối thiểu (mặc định: 30 phút)</small>
                    </div>
                </Col>
                
                <Col md={4}>
                    <div className="mb-3">
                        <label className="form-label">Thời gian đặt tối đa (phút)</label>
                        <input 
                            type="number"
                            className="form-control"
                            name="maxBookingDurationMinutes"
                            value={formData.maxBookingDurationMinutes}
                            onChange={handleChange}
                            min="1"
                            max="10080"
                        />
                        <small className="text-muted">Thời gian đặt chỗ tối đa (mặc định: 1440 phút = 1 ngày)</small>
                    </div>
                </Col>
                
                <Col md={4}>
                    <div className="mb-3">
                        <label className="form-label">Thời gian huỷ trước (giờ)</label>
                        <input 
                            type="number"
                            className="form-control"
                            name="cancellationNoticeHours"
                            value={formData.cancellationNoticeHours}
                            onChange={handleChange}
                            min="0"
                            max="168"
                        />
                        <small className="text-muted">Thời gian tối thiểu để huỷ đặt chỗ (mặc định: 24 giờ)</small>
                    </div>
                </Col>
            </Row>
            
            <Row>
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label">Thời gian dọn dẹp (phút)</label>
                        <input 
                            type="number"
                            className="form-control"
                            name="cleaningDurationMinutes"
                            value={formData.cleaningDurationMinutes}
                            onChange={handleChange}
                            min="0"
                            max="1440"
                        />
                        <small className="text-muted">Thời gian cần thiết để dọn dẹp giữa các lần đặt chỗ</small>
                    </div>
                </Col>
                
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label">Thời gian đệm (phút)</label>
                        <input 
                            type="number"
                            className="form-control"
                            name="bufferMinutes"
                            value={formData.bufferMinutes}
                            onChange={handleChange}
                            min="0"
                            max="1440"
                        />
                        <small className="text-muted">Thời gian đệm giữa các lần đặt chỗ</small>
                    </div>
                </Col>
            </Row>

            <h5 className="mt-4 mb-3">Tiện ích và Dịch vụ</h5>
            <div className="mb-3">
                <label className="form-label">Tiện ích</label>
                <div className="d-flex flex-wrap gap-2">
                    {systemAmenities.map(amenity => (
                        <div key={amenity.id} className="form-check">
                            <input 
                                type="checkbox"
                                className="form-check-input"
                                id={`amenity-${amenity.id}`}
                                checked={formData.selectedSystemAmenityIds.includes(amenity.id)}
                                onChange={() => handleSystemAmenityToggle(amenity.id)}
                            />
                            <label className="form-check-label" htmlFor={`amenity-${amenity.id}`}>
                                {amenity.name}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="mb-3">
                <label className="form-label">Dịch vụ</label>
                <div className="d-flex flex-wrap gap-2">
                    {systemServices.map(service => (
                        <div key={service.id} className="form-check">
                            <input 
                                type="checkbox"
                                className="form-check-input"
                                id={`service-${service.id}`}
                                checked={formData.selectedSystemServices.includes(service.id)}
                                onChange={() => handleSystemServiceToggle(service.id)}
                            />
                            <label className="form-check-label" htmlFor={`service-${service.id}`}>
                                {service.name}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="d-flex justify-content-end gap-2 mt-4">
                <button 
                    type="button"
                    className="btn btn-secondary" 
                    onClick={handleCancel}
                    disabled={isSubmitting}
                >
                    Hủy
                </button>
                
                <button 
                    type="button"
                    className="btn btn-primary" 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Đang lưu...' : (initialData.id ? 'Cập nhật' : 'Tạo mới')}
                </button>
            </div>
        </div>
    );
}

export default SpaceForm;
