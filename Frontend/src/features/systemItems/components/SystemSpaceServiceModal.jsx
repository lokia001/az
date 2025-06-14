// src/features/systemItems/components/SystemSpaceServiceModal.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { createSystemSpaceService, updateSystemSpaceService } from '../slices/systemSpaceServicesSlice';

const SystemSpaceServiceModal = ({ show, onHide, service }) => {
    const dispatch = useDispatch();
    const createStatus = useSelector(state => state.systemSpaceServices.createStatus);
    const updateStatus = useSelector(state => state.systemSpaceServices.updateStatus);
    const createError = useSelector(state => state.systemSpaceServices.createError);
    const updateError = useSelector(state => state.systemSpaceServices.updateError);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        isActive: true
    });

    useEffect(() => {
        if (service) {
            setFormData({
                name: service.name || '',
                description: service.description || '',
                category: service.category || '',
                price: service.price?.toString() || '',
                isActive: service.isActive !== undefined ? service.isActive : true
            });
        } else {
            setFormData({
                name: '',
                description: '',
                category: '',
                price: '',
                isActive: true
            });
        }
    }, [service]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const submitData = {
            ...formData,
            price: formData.price ? parseFloat(formData.price) : 0
        };

        if (service) {
            await dispatch(updateSystemSpaceService({
                serviceId: service.id,
                serviceData: submitData
            }));
        } else {
            await dispatch(createSystemSpaceService(submitData));
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

    const categories = ['Dọn dẹp', 'An ninh', 'Internet', 'Điện nước', 'Khác'];

    return (
        <Modal show={show} onHide={onHide} centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {service ? 'Chỉnh sửa Dịch vụ' : 'Thêm Dịch vụ Mới'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {(createError || updateError) && (
                        <Alert variant="danger">
                            {createError || updateError}
                        </Alert>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>Tên dịch vụ *</Form.Label>
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
                        <Form.Label>Loại dịch vụ</Form.Label>
                        <Form.Select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            <option value="">Chọn loại dịch vụ</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Giá dịch vụ (VND)</Form.Label>
                        <Form.Control
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            step="1000"
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
                            service ? 'Cập nhật' : 'Tạo mới'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default SystemSpaceServiceModal;
