// Frontend/src/features/ownerRegistration/components/OwnerRegistrationForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import {
    submitOwnerRegistration,
    selectActionStatus,
    selectActionError,
    clearActionError
} from '../slices/ownerRegistrationSlice';

const OwnerRegistrationForm = ({ onSuccess }) => {
    const dispatch = useDispatch();
    const actionStatus = useSelector(selectActionStatus);
    const actionError = useSelector(selectActionError);

    const [formData, setFormData] = useState({
        companyName: '',
        description: '',
        businessPhone: '',
        businessAddress: '',
        website: '',
        businessLicense: ''
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (actionStatus === 'succeeded') {
            // Form submitted successfully
            if (onSuccess) {
                onSuccess();
            }
        }
    }, [actionStatus, onSuccess]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear specific field error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.companyName.trim()) {
            errors.companyName = 'Tên công ty là bắt buộc';
        } else if (formData.companyName.length > 200) {
            errors.companyName = 'Tên công ty không được vượt quá 200 ký tự';
        }

        if (formData.description && formData.description.length > 1000) {
            errors.description = 'Mô tả không được vượt quá 1000 ký tự';
        }

        if (formData.businessPhone && formData.businessPhone.length > 20) {
            errors.businessPhone = 'Số điện thoại không được vượt quá 20 ký tự';
        }

        if (formData.businessAddress && formData.businessAddress.length > 500) {
            errors.businessAddress = 'Địa chỉ không được vượt quá 500 ký tự';
        }

        if (formData.website) {
            if (formData.website.length > 200) {
                errors.website = 'Website không được vượt quá 200 ký tự';
            } else {
                // Basic URL validation
                const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
                if (!urlPattern.test(formData.website)) {
                    errors.website = 'Vui lòng nhập URL website hợp lệ';
                }
            }
        }

        if (formData.businessLicense && formData.businessLicense.length > 100) {
            errors.businessLicense = 'Giấy phép kinh doanh không được vượt quá 100 ký tự';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // Clean up the data before submission
        const cleanData = Object.fromEntries(
            Object.entries(formData).map(([key, value]) => [
                key, 
                typeof value === 'string' ? value.trim() : value
            ])
        );

        // Remove empty optional fields
        Object.keys(cleanData).forEach(key => {
            if (key !== 'companyName' && (!cleanData[key] || cleanData[key] === '')) {
                delete cleanData[key];
            }
        });

        dispatch(submitOwnerRegistration(cleanData));
    };

    const handleClearError = () => {
        dispatch(clearActionError());
    };

    return (
        <Card>
            <Card.Header>
                <h5 className="mb-0">Đăng ký trở thành chủ không gian</h5>
            </Card.Header>
            <Card.Body>
                {actionError && (
                    <Alert variant="danger" dismissible onClose={handleClearError}>
                        {actionError}
                    </Alert>
                )}

                <Alert variant="info">
                    <strong>Lưu ý:</strong> Yêu cầu đăng ký của bạn sẽ được gửi đến quản trị viên hệ thống để xem xét và phê duyệt. 
                    Bạn sẽ nhận được thông báo khi yêu cầu được xử lý.
                </Alert>

                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Tên công ty/doanh nghiệp <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleInputChange}
                                    isInvalid={!!formErrors.companyName}
                                    placeholder="Nhập tên công ty hoặc doanh nghiệp"
                                    maxLength={200}
                                    disabled={actionStatus === 'loading'}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.companyName}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Số điện thoại kinh doanh</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="businessPhone"
                                    value={formData.businessPhone}
                                    onChange={handleInputChange}
                                    isInvalid={!!formErrors.businessPhone}
                                    placeholder="Nhập số điện thoại kinh doanh"
                                    maxLength={20}
                                    disabled={actionStatus === 'loading'}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.businessPhone}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Mô tả về doanh nghiệp</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            isInvalid={!!formErrors.description}
                            placeholder="Mô tả ngắn gọn về doanh nghiệp, lĩnh vực hoạt động, kinh nghiệm..."
                            maxLength={1000}
                            disabled={actionStatus === 'loading'}
                        />
                        <Form.Text className="text-muted">
                            {formData.description.length}/1000 ký tự
                        </Form.Text>
                        <Form.Control.Feedback type="invalid">
                            {formErrors.description}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Địa chỉ kinh doanh</Form.Label>
                        <Form.Control
                            type="text"
                            name="businessAddress"
                            value={formData.businessAddress}
                            onChange={handleInputChange}
                            isInvalid={!!formErrors.businessAddress}
                            placeholder="Nhập địa chỉ trụ sở/văn phòng kinh doanh"
                            maxLength={500}
                            disabled={actionStatus === 'loading'}
                        />
                        <Form.Control.Feedback type="invalid">
                            {formErrors.businessAddress}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Website</Form.Label>
                                <Form.Control
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                    isInvalid={!!formErrors.website}
                                    placeholder="https://example.com"
                                    maxLength={200}
                                    disabled={actionStatus === 'loading'}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.website}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Mã số thuế/Giấy phép kinh doanh</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="businessLicense"
                                    value={formData.businessLicense}
                                    onChange={handleInputChange}
                                    isInvalid={!!formErrors.businessLicense}
                                    placeholder="Nhập mã số thuế hoặc số giấy phép"
                                    maxLength={100}
                                    disabled={actionStatus === 'loading'}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.businessLicense}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={actionStatus === 'loading'}
                        >
                            {actionStatus === 'loading' ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                    {' '}Đang gửi...
                                </>
                            ) : (
                                'Gửi yêu cầu đăng ký'
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default OwnerRegistrationForm;
