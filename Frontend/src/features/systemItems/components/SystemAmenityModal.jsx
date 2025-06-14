// src/features/systemItems/components/SystemAmenityModal.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { createSystemAmenity, updateSystemAmenity } from '../slices/systemAmenitiesSlice';

const SystemAmenityModal = ({ show, onHide, amenity }) => {
    const dispatch = useDispatch();
    const createStatus = useSelector(state => state.systemAmenities.createStatus);
    const updateStatus = useSelector(state => state.systemAmenities.updateStatus);
    const createError = useSelector(state => state.systemAmenities.createError);
    const updateError = useSelector(state => state.systemAmenities.updateError);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '',
        isActive: true
    });

    useEffect(() => {
        if (amenity) {
            setFormData({
                name: amenity.name || '',
                description: amenity.description || '',
                icon: amenity.icon || '',
                isActive: amenity.isActive !== undefined ? amenity.isActive : true
            });
        } else {
            setFormData({
                name: '',
                description: '',
                icon: '',
                isActive: true
            });
        }
    }, [amenity]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (amenity) {
            await dispatch(updateSystemAmenity({
                amenityId: amenity.id,
                amenityData: formData
            }));
        } else {
            await dispatch(createSystemAmenity(formData));
        }
        
        if (createStatus === 'succeeded' || updateStatus === 'succeeded') {
            onHide();
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {amenity ? 'Chỉnh sửa Tiện ích' : 'Thêm Tiện ích Mới'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {(createError || updateError) && (
                        <Alert variant="danger">
                            {createError || updateError}
                        </Alert>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>Tên tiện ích *</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Mô tả</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Icon</Form.Label>
                        <Form.Control
                            type="text"
                            name="icon"
                            value={formData.icon}
                            onChange={handleChange}
                            placeholder="Nhập tên icon (ví dụ: FaBed)"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            name="isActive"
                            label="Kích hoạt"
                            checked={formData.isActive}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Hủy
                    </Button>
                    <Button 
                        variant="primary" 
                        type="submit"
                        disabled={createStatus === 'loading' || updateStatus === 'loading'}
                    >
                        {createStatus === 'loading' || updateStatus === 'loading' ? (
                            'Đang xử lý...'
                        ) : (
                            amenity ? 'Cập nhật' : 'Tạo mới'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default SystemAmenityModal;
