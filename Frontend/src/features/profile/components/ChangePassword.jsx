// src/features/profile/components/ChangePassword.jsx
import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const ChangePassword = ({ 
    onChangePassword, 
    isLoading = false, 
    error = null, 
    success = false 
}) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
        } else if (formData.newPassword.length > 100) {
            newErrors.newPassword = 'Mật khẩu mới không được vượt quá 100 ký tự';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        if (formData.currentPassword === formData.newPassword) {
            newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const passwordData = {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
        };

        onChangePassword(passwordData);
    };

    const handleReset = () => {
        setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setErrors({});
    };

    return (
        <Card>
            <Card.Header className="bg-warning text-dark">
                <h5 className="mb-0">
                    <FaLock className="me-2" />
                    Đổi mật khẩu
                </h5>
            </Card.Header>
            <Card.Body>
                {error && (
                    <Alert variant="danger" className="mb-3">
                        <strong>Lỗi:</strong> {error}
                    </Alert>
                )}

                {success && (
                    <Alert variant="success" className="mb-3">
                        <strong>Thành công:</strong> Mật khẩu đã được đổi thành công!
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Mật khẩu hiện tại</Form.Label>
                        <div className="position-relative">
                            <Form.Control
                                type={showPasswords.current ? "text" : "password"}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                isInvalid={!!errors.currentPassword}
                                placeholder="Nhập mật khẩu hiện tại"
                                disabled={isLoading}
                            />
                            <Button
                                variant="link"
                                className="position-absolute end-0 top-0 border-0 bg-transparent"
                                style={{ zIndex: 10 }}
                                onClick={() => togglePasswordVisibility('current')}
                                disabled={isLoading}
                            >
                                {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                            </Button>
                        </div>
                        <Form.Control.Feedback type="invalid">
                            {errors.currentPassword}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Mật khẩu mới</Form.Label>
                        <div className="position-relative">
                            <Form.Control
                                type={showPasswords.new ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                isInvalid={!!errors.newPassword}
                                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                                disabled={isLoading}
                            />
                            <Button
                                variant="link"
                                className="position-absolute end-0 top-0 border-0 bg-transparent"
                                style={{ zIndex: 10 }}
                                onClick={() => togglePasswordVisibility('new')}
                                disabled={isLoading}
                            >
                                {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                            </Button>
                        </div>
                        <Form.Control.Feedback type="invalid">
                            {errors.newPassword}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                        <div className="position-relative">
                            <Form.Control
                                type={showPasswords.confirm ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                isInvalid={!!errors.confirmPassword}
                                placeholder="Nhập lại mật khẩu mới"
                                disabled={isLoading}
                            />
                            <Button
                                variant="link"
                                className="position-absolute end-0 top-0 border-0 bg-transparent"
                                style={{ zIndex: 10 }}
                                onClick={() => togglePasswordVisibility('confirm')}
                                disabled={isLoading}
                            >
                                {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                            </Button>
                        </div>
                        <Form.Control.Feedback type="invalid">
                            {errors.confirmPassword}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-flex gap-2 justify-content-end">
                        <Button
                            type="button"
                            variant="outline-secondary"
                            onClick={handleReset}
                            disabled={isLoading}
                        >
                            Đặt lại
                        </Button>
                        <Button
                            type="submit"
                            variant="warning"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Spinner size="sm" className="me-1" />
                                    Đang đổi...
                                </>
                            ) : (
                                <>
                                    <FaLock className="me-1" />
                                    Đổi mật khẩu
                                </>
                            )}
                        </Button>
                    </div>
                </Form>

                <hr className="mt-4" />
                <div className="text-muted small">
                    <h6>Lưu ý bảo mật:</h6>
                    <ul className="mb-0">
                        <li>Mật khẩu nên có ít nhất 6 ký tự</li>
                        <li>Sử dụng kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                        <li>Không chia sẻ mật khẩu với người khác</li>
                        <li>Thay đổi mật khẩu định kỳ để đảm bảo an toàn</li>
                    </ul>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ChangePassword;
