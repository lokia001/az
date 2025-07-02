import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Row, Col } from 'react-bootstrap';
import { createSpaceAsync, updateSpaceAsync } from '../manageSpaceSlice';
import { fetchSystemAmenities } from '../../systemItems/slices/systemAmenitiesSlice';
import { fetchSystemSpaceServices } from '../../systemItems/slices/systemSpaceServicesSlice';
import apiClient from '../../../services/apiClient';
import '../styles/SpaceForm.css';

function SpaceForm({ initialData = {}, onSubmit, onCancel }) {
    const dispatch = useDispatch();
    
    const systemAmenities = useSelector(state => state.systemAmenities.amenities) || [];
    const systemServices = useSelector(state => state.systemSpaceServices.services) || [];
    
    // Helper function to convert TimeSpan format (HH:MM:SS) to HTML time input format (HH:MM)
    const formatTimeSpanToInput = (timeSpan) => {
        if (!timeSpan) return '';
        // Handle both "HH:MM:SS" and "HH:MM" formats
        const parts = timeSpan.split(':');
        if (parts.length >= 2) {
            return `${parts[0]}:${parts[1]}`;
        }
        return timeSpan;
    };
    
    // Helper function to parse time string (HH:MM) to minutes for comparison
    const parseTimeToMinutes = (timeString) => {
        if (!timeString) return 0;
        const parts = timeString.split(':');
        if (parts.length >= 2) {
            return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        }
        return 0;
    };
    
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
        openTime: formatTimeSpanToInput(initialData.openTime) || '',
        closeTime: formatTimeSpanToInput(initialData.closeTime) || '',
        accessInstructions: initialData.accessInstructions || '',
        houseRules: initialData.houseRules || '',
        minBookingDurationMinutes: initialData.minBookingDurationMinutes || 30,
        maxBookingDurationMinutes: initialData.maxBookingDurationMinutes || 1440,
        cancellationNoticeHours: initialData.cancellationNoticeHours || 24,
        cleaningDurationMinutes: initialData.cleaningDurationMinutes || 0,
        bufferMinutes: initialData.bufferMinutes || 0,
        status: initialData.status || 'Available',
        selectedSystemAmenityIds: (() => {
            // Extract GUIDs from objects if needed
            const amenities = initialData.selectedSystemAmenityIds || initialData.systemAmenities || [];
            return amenities.map(amenity => {
                if (typeof amenity === 'string') return amenity;
                if (amenity && amenity.systemFeatureId) return amenity.systemFeatureId;
                if (amenity && amenity.SystemFeatureId) return amenity.SystemFeatureId;
                return amenity;
            }).filter(id => id && typeof id === 'string');
        })(),
        customAmenityNames: initialData.customAmenityNames || [],
        selectedSystemServices: (() => {
            // Extract GUIDs from objects if needed
            const services = initialData.selectedSystemServices || initialData.systemServices || [];
            return services.map(service => {
                if (typeof service === 'string') return service;
                if (service && service.systemFeatureId) return service.systemFeatureId;
                if (service && service.SystemFeatureId) return service.SystemFeatureId;
                return service;
            }).filter(id => id && typeof id === 'string');
        })(),
        customServiceRequests: initialData.customServiceRequests || [],
        images: initialData.spaceImages || [] // Lưu toàn bộ SpaceImageDto objects, không chỉ URLs
    });
    
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    
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

    const handleImageUpload = async (files) => {
        if (!files || files.length === 0) return;

        // Chỉ cho phép upload ảnh khi đang edit space (có spaceId)
        if (!initialData.id) {
            setFormErrors(prev => ({
                ...prev,
                images: 'Vui lòng lưu space trước khi upload ảnh.'
            }));
            return;
        }

        setUploadingImages(true);
        const uploadPromises = Array.from(files).map(async (file) => {
            const formData = new FormData();
            formData.append('ImageFile', file); // Backend expects 'ImageFile'

            try {
                // Sử dụng API space images
                const response = await apiClient.post(`/api/owner/spaces/${initialData.id}/images`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                return response.data; // Trả về toàn bộ data (bao gồm id, url, etc.)
            } catch (error) {
                console.error('Error uploading image:', error);
                throw error;
            }
        });

        try {
            const uploadedImages = await Promise.all(uploadPromises);
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedImages] // Lưu toàn bộ SpaceImageDto objects
            }));
        } catch (error) {
            console.error('Upload error:', error);
            setFormErrors(prev => ({
                ...prev,
                images: 'Có lỗi khi tải ảnh lên. Vui lòng thử lại.'
            }));
        } finally {
            setUploadingImages(false);
        }
    };

    const handleRemoveImage = async (imageToRemove) => {
        // Nếu ảnh đã có ID (đã upload lên server), gọi API xóa
        if (imageToRemove.id && initialData.id) {
            try {
                await apiClient.delete(`/api/owner/spaces/${initialData.id}/images/${imageToRemove.id}`);
            } catch (error) {
                console.error('Error deleting image from server:', error);
                setFormErrors(prev => ({
                    ...prev,
                    images: 'Có lỗi khi xóa ảnh. Vui lòng thử lại.'
                }));
                return;
            }
        }

        // Xóa ảnh khỏi state local
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter(img => img !== imageToRemove)
        }));
    };
    
    const validateForm = () => {
        const errors = {};
        
        // Required field validations
        if (!formData.name) {
            errors.name = 'Tên không gian là bắt buộc';
        } else if (formData.name.length < 3) {
            errors.name = 'Tên không gian phải có ít nhất 3 ký tự';
        } else if (formData.name.length > 200) {
            errors.name = 'Tên không gian không được vượt quá 200 ký tự';
        }
        
        if (!formData.address) {
            errors.address = 'Địa chỉ là bắt buộc';
        } else if (formData.address.length > 500) {
            errors.address = 'Địa chỉ không được vượt quá 500 ký tự';
        }
        
        if (!formData.type) {
            errors.type = 'Loại không gian là bắt buộc';
        }
        
        if (!formData.capacity || parseInt(formData.capacity) <= 0) {
            errors.capacity = 'Sức chứa phải lớn hơn 0';
        }
        
        if (!formData.pricePerHour || parseFloat(formData.pricePerHour) <= 0) {
            errors.pricePerHour = 'Giá theo giờ phải lớn hơn 0';
        }
        
        // Optional field validations
        if (formData.description && formData.description.length > 2000) {
            errors.description = 'Mô tả không được vượt quá 2000 ký tự';
        }
        
        if (formData.pricePerDay && parseFloat(formData.pricePerDay) <= 0) {
            errors.pricePerDay = 'Giá theo ngày phải lớn hơn 0 nếu có';
        }
        
        if (formData.latitude && (parseFloat(formData.latitude) < -90 || parseFloat(formData.latitude) > 90)) {
            errors.latitude = 'Vĩ độ phải trong khoảng -90 đến 90';
        }
        
        if (formData.longitude && (parseFloat(formData.longitude) < -180 || parseFloat(formData.longitude) > 180)) {
            errors.longitude = 'Kinh độ phải trong khoảng -180 đến 180';
        }
        
        if (formData.accessInstructions && formData.accessInstructions.length > 1000) {
            errors.accessInstructions = 'Hướng dẫn truy cập không được vượt quá 1000 ký tự';
        }
        
        if (formData.houseRules && formData.houseRules.length > 1000) {
            errors.houseRules = 'Nội quy không được vượt quá 1000 ký tự';
        }
        
        // Validate booking settings ranges
        if (formData.minBookingDurationMinutes && (parseInt(formData.minBookingDurationMinutes) < 1 || parseInt(formData.minBookingDurationMinutes) > 1440)) {
            errors.minBookingDurationMinutes = 'Thời gian đặt tối thiểu phải trong khoảng 1-1440 phút';
        }
        
        if (formData.maxBookingDurationMinutes && (parseInt(formData.maxBookingDurationMinutes) < 1 || parseInt(formData.maxBookingDurationMinutes) > 10080)) {
            errors.maxBookingDurationMinutes = 'Thời gian đặt tối đa phải trong khoảng 1-10080 phút';
        }
        
        if (formData.cancellationNoticeHours && (parseInt(formData.cancellationNoticeHours) < 0 || parseInt(formData.cancellationNoticeHours) > 168)) {
            errors.cancellationNoticeHours = 'Thời gian huỷ trước phải trong khoảng 0-168 giờ';
        }
        
        if (formData.cleaningDurationMinutes && (parseInt(formData.cleaningDurationMinutes) < 0 || parseInt(formData.cleaningDurationMinutes) > 1440)) {
            errors.cleaningDurationMinutes = 'Thời gian dọn dẹp phải trong khoảng 0-1440 phút';
        }
        
        if (formData.bufferMinutes && (parseInt(formData.bufferMinutes) < 0 || parseInt(formData.bufferMinutes) > 1440)) {
            errors.bufferMinutes = 'Thời gian đệm phải trong khoảng 0-1440 phút';
        }
        
        // Validate times if provided
        if (formData.openTime && !formData.closeTime) {
            errors.closeTime = 'Thời gian đóng cửa là bắt buộc nếu có thời gian mở cửa';
        }
        if (formData.closeTime && !formData.openTime) {
            errors.openTime = 'Thời gian mở cửa là bắt buộc nếu có thời gian đóng cửa';
        }
        
        // Validate that open time is before close time (if both are provided)
        // Special case: 00:00 as close time means 24-hour operation
        if (formData.openTime && formData.closeTime) {
            const openTimeMinutes = parseTimeToMinutes(formData.openTime);
            const closeTimeMinutes = parseTimeToMinutes(formData.closeTime);
            
            // If close time is 00:00, it means 24-hour operation (valid)
            // Otherwise, close time must be after open time
            if (closeTimeMinutes !== 0 && openTimeMinutes >= closeTimeMinutes) {
                errors.closeTime = 'Thời gian đóng cửa phải sau thời gian mở cửa (hoặc chọn 00:00 cho hoạt động 24/7)';
            }
        }
        
        // Validate min/max booking duration logic
        if (formData.minBookingDurationMinutes && formData.maxBookingDurationMinutes && 
            parseInt(formData.minBookingDurationMinutes) > parseInt(formData.maxBookingDurationMinutes)) {
            errors.maxBookingDurationMinutes = 'Thời gian đặt tối đa phải lớn hơn hoặc bằng thời gian đặt tối thiểu';
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
                // Ensure it's exactly HH:MM:SS format, not HH:MM:SS:SS
                const timeParts = timeString.split(':');
                if (timeParts.length === 2) {
                    return `${timeParts[0]}:${timeParts[1]}:00`;
                } else if (timeParts.length === 3) {
                    return timeString; // Already in HH:MM:SS format
                }
                return `${timeString}:00`; // Fallback
            };

            // Prepare the data in the format expected by the backend (PascalCase)
            const spaceData = {
                Name: formData.name,
                Description: formData.description || null,
                Address: formData.address,
                Latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                Longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                Type: formData.type,
                Capacity: parseInt(formData.capacity || 0, 10),
                PricePerHour: parseFloat(formData.pricePerHour || 0),
                PricePerDay: formData.pricePerDay ? parseFloat(formData.pricePerDay) : null,
                OpenTime: formatTimeSpan(formData.openTime),
                CloseTime: formatTimeSpan(formData.closeTime),
                AccessInstructions: formData.accessInstructions || null,
                HouseRules: formData.houseRules || null,
                SelectedSystemAmenityIds: (() => {
                    // Ensure we only send GUIDs, not objects
                    const amenities = formData.selectedSystemAmenityIds || formData.systemAmenities || [];
                    return amenities.map(amenity => {
                        if (typeof amenity === 'string') return amenity;
                        if (amenity && amenity.systemFeatureId) return amenity.systemFeatureId;
                        if (amenity && amenity.SystemFeatureId) return amenity.SystemFeatureId;
                        return amenity;
                    }).filter(id => id && typeof id === 'string');
                })(),
                CustomAmenityNames: formData.customAmenityNames || [],
                SelectedSystemServices: (() => {
                    const services = formData.selectedSystemServices || [];
                    return services.map(service => {
                        if (typeof service === 'string') {
                            return {
                                SystemFeatureId: service,
                                PriceOverride: null,
                                Notes: null,
                                IsIncludedInBasePrice: false
                            };
                        }
                        // If it's already an object, ensure it has the correct structure
                        if (service && (service.systemFeatureId || service.SystemFeatureId)) {
                            return {
                                SystemFeatureId: service.systemFeatureId || service.SystemFeatureId,
                                PriceOverride: service.priceOverride || service.PriceOverride || null,
                                Notes: service.notes || service.Notes || null,
                                IsIncludedInBasePrice: service.isIncludedInBasePrice || service.IsIncludedInBasePrice || false
                            };
                        }
                        return service;
                    }).filter(service => service && (service.SystemFeatureId || service.systemFeatureId));
                })(),
                CustomServiceRequests: formData.customServiceRequests || [],
                MinBookingDurationMinutes: parseInt(formData.minBookingDurationMinutes || 30),
                MaxBookingDurationMinutes: parseInt(formData.maxBookingDurationMinutes || 1440),
                CancellationNoticeHours: parseInt(formData.cancellationNoticeHours || 24),
                CleaningDurationMinutes: parseInt(formData.cleaningDurationMinutes || 0),
                BufferMinutes: parseInt(formData.bufferMinutes || 0)
            };
            
            console.log("Submitting space data:", spaceData);
            
            let result;
            if (initialData.id) {
                // For update, wrap the data in the format expected by backend
                result = await dispatch(updateSpaceAsync({ 
                    id: initialData.id, 
                    updatedSpace: spaceData 
                })).unwrap();
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
            
            {/* Required Fields Information */}
            <div className="alert alert-info mb-4">
                <h6 className="mb-2"><i className="fas fa-info-circle me-2"></i>Thông tin bắt buộc</h6>
                <p className="mb-1">Các trường có dấu <span className="text-danger">*</span> là bắt buộc:</p>
                <ul className="mb-0 ps-3">
                    <li><strong>Tên không gian</strong>: 3-200 ký tự</li>
                    <li><strong>Địa chỉ</strong>: Tối đa 500 ký tự</li>
                    <li><strong>Loại không gian</strong>: Chọn loại phù hợp</li>
                    <li><strong>Sức chứa</strong>: Tối thiểu 1 người</li>
                    <li><strong>Giá theo giờ</strong>: Tối thiểu 1 VND</li>
                </ul>
            </div>
            
            <div className="mb-3">
                <label className="form-label">Tên không gian <span className="text-danger">*</span></label>
                <input 
                    type="text"
                    className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="off"
                    placeholder="Nhập tên không gian (3-200 ký tự)"
                    required
                />
                <small className="text-muted">Tên không gian phải có từ 3-200 ký tự</small>
                {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
            </div>
            
            <div className="mb-3">
                <label className="form-label">Mô tả</label>
                <textarea 
                    className={`form-control ${formErrors.description ? 'is-invalid' : ''}`}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Mô tả chi tiết về không gian (tối đa 2000 ký tự)"
                />
                <small className="text-muted">Mô tả tối đa 2000 ký tự</small>
                {formErrors.description && <div className="invalid-feedback">{formErrors.description}</div>}
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
                    placeholder="Nhập địa chỉ đầy đủ của không gian (tối đa 500 ký tự)"
                    required
                />
                <small className="text-muted">Địa chỉ đầy đủ, tối đa 500 ký tự</small>
                {formErrors.address && <div className="invalid-feedback">{formErrors.address}</div>}
            </div>
            
            <Row>
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label">Vĩ độ (Latitude)</label>
                        <input 
                            type="number"
                            className={`form-control ${formErrors.latitude ? 'is-invalid' : ''}`}
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                            autoComplete="off"
                            step="0.000001"
                            min="-90"
                            max="90"
                            placeholder="Ví dụ: 10.7756587"
                        />
                        <small className="text-muted">Vĩ độ của địa điểm (-90 đến 90). Để trống nếu không biết</small>
                        {formErrors.latitude && <div className="invalid-feedback">{formErrors.latitude}</div>}
                    </div>
                </Col>
                
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label">Kinh độ (Longitude)</label>
                        <input 
                            type="number"
                            className={`form-control ${formErrors.longitude ? 'is-invalid' : ''}`}
                            name="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                            autoComplete="off"
                            step="0.000001"
                            min="-180"
                            max="180"
                            placeholder="Ví dụ: 106.7004238"
                        />
                        <small className="text-muted">Kinh độ của địa điểm (-180 đến 180). Để trống nếu không biết</small>
                        {formErrors.longitude && <div className="invalid-feedback">{formErrors.longitude}</div>}
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
                            required
                        />
                        <small className="text-muted">Số người tối đa có thể sử dụng không gian cùng lúc (tối thiểu 1 người)</small>
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
                            min="1"
                            step="1000"
                            placeholder="Ví dụ: 50000"
                            required
                        />
                        <small className="text-muted">Giá thuê theo giờ, tối thiểu 1 VND</small>
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
                            min="1"
                            step="1000"
                            placeholder="Ví dụ: 300000 (để trống nếu không có)"
                        />
                        <small className="text-muted">Giá thuê theo ngày (tùy chọn), tối thiểu 1 VND nếu có</small>
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
                        <label className="form-label">
                            <i className="bi bi-clock me-2 text-primary"></i>
                            Giờ mở cửa
                        </label>
                        <div className="input-group time-input-group">
                            <input 
                                type="time"
                                className={`form-control ${formErrors.openTime ? 'is-invalid' : ''}`}
                                name="openTime"
                                value={formData.openTime || ''}
                                onChange={handleChange}
                                placeholder="07:00"
                                step="900" // 15-minute step (900 seconds)
                                style={{ 
                                    fontSize: '1.1rem',
                                    letterSpacing: '0.5px',
                                    textAlign: 'center'
                                }}
                                min="00:00"
                                max="23:59"
                            />
                            <span className="input-group-text">
                                <i className="bi bi-sunrise text-warning"></i>
                            </span>
                        </div>
                        {/* Quick preset buttons for open time */}
                        <div className="mt-2 time-preset-buttons">
                            <small className="text-muted d-block mb-1">Nhanh:</small>
                            <div className="btn-group btn-group-sm" role="group">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setFormData(prev => ({ ...prev, openTime: '06:00' }))}
                                >
                                    6:00
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setFormData(prev => ({ ...prev, openTime: '07:00' }))}
                                >
                                    7:00
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setFormData(prev => ({ ...prev, openTime: '08:00' }))}
                                >
                                    8:00
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setFormData(prev => ({ ...prev, openTime: '09:00' }))}
                                >
                                    9:00
                                </button>
                            </div>
                        </div>
                        <small className="text-muted mt-1 d-block">
                            <i className="bi bi-info-circle me-1"></i>
                            Giờ bắt đầu hoạt động (định dạng 24h). Để trống nếu luôn mở
                        </small>
                        {formErrors.openTime && <div className="invalid-feedback">{formErrors.openTime}</div>}
                    </div>
                </Col>
                
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label">
                            <i className="bi bi-clock-fill me-2 text-primary"></i>
                            Giờ đóng cửa
                        </label>
                        <div className="input-group time-input-group">
                            <input 
                                type="time"
                                className={`form-control ${formErrors.closeTime ? 'is-invalid' : ''}`}
                                name="closeTime"
                                value={formData.closeTime || ''}
                                onChange={handleChange}
                                placeholder="22:00"
                                step="900" // 15-minute step (900 seconds)
                                style={{ 
                                    fontSize: '1.1rem',
                                    letterSpacing: '0.5px',
                                    textAlign: 'center'
                                }}
                                min="00:00"
                                max="23:59"
                            />
                            <span className="input-group-text">
                                <i className="bi bi-sunset text-orange"></i>
                            </span>
                        </div>
                        {/* Quick preset buttons for close time */}
                        <div className="mt-2 time-preset-buttons">
                            <small className="text-muted d-block mb-1">Nhanh:</small>
                            <div className="btn-group btn-group-sm" role="group">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setFormData(prev => ({ ...prev, closeTime: '18:00' }))}
                                >
                                    18:00
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setFormData(prev => ({ ...prev, closeTime: '20:00' }))}
                                >
                                    20:00
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setFormData(prev => ({ ...prev, closeTime: '22:00' }))}
                                >
                                    22:00
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setFormData(prev => ({ ...prev, closeTime: '00:00' }))}
                                    title="Hoạt động 24/7"
                                >
                                    00:00 (24h)
                                </button>
                            </div>
                        </div>
                        <small className="text-muted mt-1 d-block">
                            <i className="bi bi-info-circle me-1"></i>
                            Giờ kết thúc hoạt động (định dạng 24h). Để trống nếu luôn mở. Chọn 00:00 cho hoạt động 24/7.
                        </small>
                        {formErrors.closeTime && <div className="invalid-feedback">{formErrors.closeTime}</div>}
                    </div>
                </Col>
            </Row>
            
            {/* Time Range Preview */}
            {formData.openTime && formData.closeTime && (
                <Row className="mb-3">
                    <Col>
                        <div className="time-range-preview">
                            <i className="bi bi-clock-history me-2"></i>
                            <strong>Thời gian hoạt động:</strong> 
                            {formData.closeTime === '00:00' ? (
                                <span className="text-success ms-1">
                                    {formData.openTime} - 24/7 (Hoạt động 24 giờ)
                                </span>
                            ) : (
                                <span className="ms-1">
                                    {formData.openTime} - {formData.closeTime}
                                    {(() => {
                                        const openMinutes = parseTimeToMinutes(formData.openTime);
                                        const closeMinutes = parseTimeToMinutes(formData.closeTime);
                                        const duration = closeMinutes - openMinutes;
                                        if (duration > 0) {
                                            const hours = Math.floor(duration / 60);
                                            const minutes = duration % 60;
                                            return ` (${hours}h${minutes > 0 ? ` ${minutes}m` : ''})`;
                                        }
                                        return '';
                                    })()}
                                </span>
                            )}
                        </div>
                    </Col>
                </Row>
            )}
            
            <div className="mb-3">
                <label className="form-label">Hướng dẫn truy cập</label>
                <textarea
                    className={`form-control ${formErrors.accessInstructions ? 'is-invalid' : ''}`}
                    name="accessInstructions"
                    rows="2"
                    value={formData.accessInstructions}
                    onChange={handleChange}
                    placeholder="Hướng dẫn cho khách hàng cách ra vào không gian (tối đa 1000 ký tự)"
                />
                <small className="text-muted">Hướng dẫn chi tiết để khách hàng có thể truy cập không gian (tối đa 1000 ký tự)</small>
                {formErrors.accessInstructions && <div className="invalid-feedback">{formErrors.accessInstructions}</div>}
            </div>
            
            <div className="mb-3">
                <label className="form-label">Nội quy không gian</label>
                <textarea
                    className={`form-control ${formErrors.houseRules ? 'is-invalid' : ''}`}
                    name="houseRules"
                    rows="2"
                    value={formData.houseRules}
                    onChange={handleChange}
                    placeholder="Các quy tắc và điều kiện sử dụng không gian (tối đa 1000 ký tự)"
                />
                <small className="text-muted">Quy định sử dụng không gian cho khách hàng (tối đa 1000 ký tự)</small>
                {formErrors.houseRules && <div className="invalid-feedback">{formErrors.houseRules}</div>}
            </div>
            
            <h5 className="mt-4 mb-3">Cài đặt đặt chỗ</h5>
            <Row>
                <Col md={4}>
                    <div className="mb-3">
                        <label className="form-label">Thời gian đặt tối thiểu (phút)</label>
                        <input 
                            type="number"
                            className={`form-control ${formErrors.minBookingDurationMinutes ? 'is-invalid' : ''}`}
                            name="minBookingDurationMinutes"
                            value={formData.minBookingDurationMinutes}
                            onChange={handleChange}
                            min="1"
                            max="1440"
                            placeholder="30"
                        />
                        <small className="text-muted">Thời gian đặt chỗ tối thiểu (1-1440 phút, mặc định: 30)</small>
                        {formErrors.minBookingDurationMinutes && <div className="invalid-feedback">{formErrors.minBookingDurationMinutes}</div>}
                    </div>
                </Col>
                
                <Col md={4}>
                    <div className="mb-3">
                        <label className="form-label">Thời gian đặt tối đa (phút)</label>
                        <input 
                            type="number"
                            className={`form-control ${formErrors.maxBookingDurationMinutes ? 'is-invalid' : ''}`}
                            name="maxBookingDurationMinutes"
                            value={formData.maxBookingDurationMinutes}
                            onChange={handleChange}
                            min="1"
                            max="10080"
                            placeholder="1440"
                        />
                        <small className="text-muted">Thời gian đặt chỗ tối đa (1-10080 phút, mặc định: 1440 = 1 ngày)</small>
                        {formErrors.maxBookingDurationMinutes && <div className="invalid-feedback">{formErrors.maxBookingDurationMinutes}</div>}
                    </div>
                </Col>
                
                <Col md={4}>
                    <div className="mb-3">
                        <label className="form-label">Thời gian huỷ trước (giờ)</label>
                        <input 
                            type="number"
                            className={`form-control ${formErrors.cancellationNoticeHours ? 'is-invalid' : ''}`}
                            name="cancellationNoticeHours"
                            value={formData.cancellationNoticeHours}
                            onChange={handleChange}
                            min="0"
                            max="168"
                            placeholder="24"
                        />
                        <small className="text-muted">Thời gian tối thiểu để huỷ đặt chỗ (0-168 giờ, mặc định: 24)</small>
                        {formErrors.cancellationNoticeHours && <div className="invalid-feedback">{formErrors.cancellationNoticeHours}</div>}
                    </div>
                </Col>
            </Row>
            
            <Row>
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label">Thời gian dọn dẹp (phút)</label>
                        <input 
                            type="number"
                            className={`form-control ${formErrors.cleaningDurationMinutes ? 'is-invalid' : ''}`}
                            name="cleaningDurationMinutes"
                            value={formData.cleaningDurationMinutes}
                            onChange={handleChange}
                            min="0"
                            max="1440"
                            placeholder="0"
                        />
                        <small className="text-muted">Thời gian cần để dọn dẹp giữa các lần đặt (0-1440 phút, mặc định: 0)</small>
                        {formErrors.cleaningDurationMinutes && <div className="invalid-feedback">{formErrors.cleaningDurationMinutes}</div>}
                    </div>
                </Col>
                
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label">Thời gian đệm (phút)</label>
                        <input 
                            type="number"
                            className={`form-control ${formErrors.bufferMinutes ? 'is-invalid' : ''}`}
                            name="bufferMinutes"
                            value={formData.bufferMinutes}
                            onChange={handleChange}
                            min="0"
                            max="1440"
                            placeholder="0"
                        />
                        <small className="text-muted">Thời gian đệm bổ sung giữa các lần đặt (0-1440 phút, mặc định: 0)</small>
                        {formErrors.bufferMinutes && <div className="invalid-feedback">{formErrors.bufferMinutes}</div>}
                    </div>
                </Col>
            </Row>
            
            {/* Image Upload Section */}
            <div className="mb-4">
                <h5 className="mt-4 mb-3">Hình ảnh không gian</h5>
                
                <div className="mb-3">
                    <label className="form-label">Tải lên hình ảnh</label>
                    <input 
                        type="file"
                        className="form-control"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files)}
                        disabled={uploadingImages || !initialData.id}
                    />
                    <small className="text-muted">
                        {!initialData.id 
                            ? "Vui lòng lưu space trước khi upload ảnh"
                            : "Chọn nhiều hình ảnh để hiển thị không gian của bạn. Định dạng: JPG, PNG, WEBP"
                        }
                    </small>
                    {formErrors.images && <div className="text-danger mt-1">{formErrors.images}</div>}
                    {uploadingImages && <div className="text-info mt-1">Đang tải ảnh lên...</div>}
                </div>

                {/* Image Preview */}
                {formData.images && formData.images.length > 0 && (
                    <div className="row g-3">
                        {formData.images.map((image, index) => (
                            <div key={image.id || index} className="col-md-4 col-sm-6">
                                <div className="position-relative">
                                    <img 
                                        src={image.imageUrl || image.url} 
                                        alt={image.caption || `Space image ${index + 1}`}
                                        className="img-fluid rounded"
                                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                        onClick={() => handleRemoveImage(image)}
                                        style={{ zIndex: 10 }}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
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
