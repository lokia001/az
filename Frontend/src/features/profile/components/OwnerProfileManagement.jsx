// src/features/profile/components/OwnerProfileManagement.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaBuilding, FaGlobe, FaEdit, FaSave, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { getMyOwnerProfile, createOwnerProfile, updateOwnerProfile } from '../../../services/api';

const OwnerProfileManagement = () => {
    const [ownerProfile, setOwnerProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    // Form data
    const [formData, setFormData] = useState({
        companyName: '',
        description: '',
        website: '',
        logoUrl: '',
        contactInfo: '',
        businessLicenseNumber: '',
        taxCode: ''
    });

    useEffect(() => {
        loadOwnerProfile();
    }, []);

    const loadOwnerProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const data = await getMyOwnerProfile();
            setOwnerProfile(data);
            
            // Populate form with existing data
            setFormData({
                companyName: data.CompanyName || data.companyName || '',
                description: data.Description || data.description || '',
                website: data.Website || data.website || '',
                logoUrl: data.LogoUrl || data.logoUrl || '',
                contactInfo: data.ContactInfo || data.contactInfo || '',
                businessLicenseNumber: data.BusinessLicenseNumber || data.businessLicenseNumber || '',
                taxCode: data.TaxCode || data.taxCode || ''
            });
            
        } catch (error) {
            console.error('Error loading owner profile:', error);
            if (error.response?.status === 404) {
                // No owner profile exists yet - this is normal
                setOwnerProfile(null);
                setError(null);
            } else {
                setError('Không thể tải thông tin doanh nghiệp');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEdit = () => {
        setIsEditing(true);
        setSuccess(false);
        setError(null);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form data to original values
        if (ownerProfile) {
            setFormData({
                companyName: ownerProfile.CompanyName || ownerProfile.companyName || '',
                description: ownerProfile.Description || ownerProfile.description || '',
                website: ownerProfile.Website || ownerProfile.website || '',
                logoUrl: ownerProfile.LogoUrl || ownerProfile.logoUrl || '',
                contactInfo: ownerProfile.ContactInfo || ownerProfile.contactInfo || '',
                businessLicenseNumber: ownerProfile.BusinessLicenseNumber || ownerProfile.businessLicenseNumber || '',
                taxCode: ownerProfile.TaxCode || ownerProfile.taxCode || ''
            });
        } else {
            setFormData({
                companyName: '',
                description: '',
                website: '',
                logoUrl: '',
                contactInfo: '',
                businessLicenseNumber: '',
                taxCode: ''
            });
        }
        setError(null);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            
            // Prepare API payload
            const payload = {
                CompanyName: formData.companyName,
                Description: formData.description || null,
                Website: formData.website || null,
                LogoUrl: formData.logoUrl || null,
                ContactInfo: formData.contactInfo || null,
                BusinessLicenseNumber: formData.businessLicenseNumber || null,
                TaxCode: formData.taxCode || null
            };
            
            if (ownerProfile) {
                // Update existing profile
                await updateOwnerProfile(payload);
            } else {
                // Create new profile
                await createOwnerProfile(payload);
            }
            
            setIsEditing(false);
            setSuccess(true);
            
            // Hide success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
            
            // Reload data
            await loadOwnerProfile();
            
        } catch (error) {
            console.error('Error saving owner profile:', error);
            setError('Không thể lưu thông tin doanh nghiệp: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-4">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Đang tải thông tin doanh nghiệp...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>
                    <FaBuilding className="me-2 text-primary" />
                    Thông tin doanh nghiệp
                </h4>
                {!isEditing && (
                    <Button variant="primary" onClick={handleEdit}>
                        <FaEdit className="me-1" />
                        {ownerProfile ? 'Chỉnh sửa' : 'Tạo mới'}
                    </Button>
                )}
            </div>

            {success && (
                <Alert variant="success" className="mb-3">
                    <FaCheckCircle className="me-2" />
                    Thông tin doanh nghiệp đã được cập nhật thành công!
                </Alert>
            )}

            {error && (
                <Alert variant="danger" className="mb-3">
                    {error}
                </Alert>
            )}

            <Card>
                <Card.Body>
                    {!ownerProfile && !isEditing ? (
                        <div className="text-center py-4">
                            <FaBuilding size={48} className="text-muted mb-3" />
                            <h5>Chưa có thông tin doanh nghiệp</h5>
                            <p className="text-muted">Tạo thông tin doanh nghiệp để khách hàng có thể liên hệ với bạn dễ dàng hơn.</p>
                            <Button variant="primary" onClick={handleEdit}>
                                <FaEdit className="me-1" />
                                Tạo thông tin doanh nghiệp
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            <strong>Tên công ty *</strong>
                                        </Form.Label>
                                        {isEditing ? (
                                            <Form.Control
                                                type="text"
                                                name="companyName"
                                                value={formData.companyName}
                                                onChange={handleInputChange}
                                                placeholder="Nhập tên công ty"
                                                required
                                            />
                                        ) : (
                                            <div className="form-control-plaintext">
                                                {ownerProfile?.CompanyName || ownerProfile?.companyName || '-'}
                                                {(ownerProfile?.IsVerified || ownerProfile?.isVerified) && (
                                                    <Badge bg="success" className="ms-2">
                                                        <FaCheckCircle className="me-1" />
                                                        Đã xác minh
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            <strong>Website</strong>
                                        </Form.Label>
                                        {isEditing ? (
                                            <Form.Control
                                                type="url"
                                                name="website"
                                                value={formData.website}
                                                onChange={handleInputChange}
                                                placeholder="https://example.com"
                                            />
                                        ) : (
                                            <div className="form-control-plaintext">
                                                {(ownerProfile?.Website || ownerProfile?.website) ? (
                                                    <a 
                                                        href={ownerProfile.Website || ownerProfile.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-decoration-none"
                                                    >
                                                        <FaGlobe className="me-1" />
                                                        {(ownerProfile.Website || ownerProfile.website).replace(/^https?:\/\//, '')}
                                                    </a>
                                                ) : '-'}
                                            </div>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            <strong>Logo công ty</strong>
                                        </Form.Label>
                                        {isEditing ? (
                                            <Form.Control
                                                type="url"
                                                name="logoUrl"
                                                value={formData.logoUrl}
                                                onChange={handleInputChange}
                                                placeholder="https://example.com/logo.png"
                                            />
                                        ) : (
                                            <div className="form-control-plaintext">
                                                {(ownerProfile?.LogoUrl || ownerProfile?.logoUrl) ? (
                                                    <div className="d-flex align-items-center">
                                                        <img 
                                                            src={ownerProfile.LogoUrl || ownerProfile.logoUrl}
                                                            alt="Logo công ty"
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                            className="rounded me-2"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'inline';
                                                            }}
                                                        />
                                                        <span style={{ display: 'none' }}>Logo không thể tải</span>
                                                        <a 
                                                            href={ownerProfile.LogoUrl || ownerProfile.logoUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-decoration-none small"
                                                        >
                                                            Xem logo
                                                        </a>
                                                    </div>
                                                ) : '-'}
                                            </div>
                                        )}
                                        {isEditing && (
                                            <Form.Text className="text-muted">
                                                Nhập URL trực tiếp đến file hình ảnh logo (jpg, png, gif)
                                            </Form.Text>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>
                                    <strong>Mô tả doanh nghiệp</strong>
                                </Form.Label>
                                {isEditing ? (
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Mô tả về doanh nghiệp, dịch vụ, kinh nghiệm..."
                                    />
                                ) : (
                                    <div className="form-control-plaintext">
                                        {ownerProfile?.Description || ownerProfile?.description || '-'}
                                    </div>
                                )}
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            <strong>Thông tin liên hệ</strong>
                                        </Form.Label>
                                        {isEditing ? (
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name="contactInfo"
                                                value={formData.contactInfo}
                                                onChange={handleInputChange}
                                                placeholder="Email, số điện thoại, địa chỉ..."
                                            />
                                        ) : (
                                            <div className="form-control-plaintext">
                                                {ownerProfile?.ContactInfo || ownerProfile?.contactInfo || '-'}
                                            </div>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            <strong>Số giấy phép kinh doanh</strong>
                                        </Form.Label>
                                        {isEditing ? (
                                            <Form.Control
                                                type="text"
                                                name="businessLicenseNumber"
                                                value={formData.businessLicenseNumber}
                                                onChange={handleInputChange}
                                                placeholder="Số GPKD (nếu có)"
                                            />
                                        ) : (
                                            <div className="form-control-plaintext">
                                                {ownerProfile?.BusinessLicenseNumber || ownerProfile?.businessLicenseNumber || '-'}
                                            </div>
                                        )}
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            <strong>Mã số thuế</strong>
                                        </Form.Label>
                                        {isEditing ? (
                                            <Form.Control
                                                type="text"
                                                name="taxCode"
                                                value={formData.taxCode}
                                                onChange={handleInputChange}
                                                placeholder="Mã số thuế (nếu có)"
                                            />
                                        ) : (
                                            <div className="form-control-plaintext">
                                                {ownerProfile?.TaxCode || ownerProfile?.taxCode || '-'}
                                            </div>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>

                            {isEditing && (
                                <div className="d-flex gap-2 justify-content-end">
                                    <Button
                                        variant="outline-secondary"
                                        onClick={handleCancel}
                                        disabled={saving}
                                    >
                                        <FaTimes className="me-1" />
                                        Hủy
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleSave}
                                        disabled={saving || !formData.companyName.trim()}
                                    >
                                        {saving ? (
                                            <>
                                                <Spinner size="sm" className="me-1" />
                                                Đang lưu...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave className="me-1" />
                                                Lưu thông tin
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </Card.Body>
            </Card>

            {ownerProfile && !isEditing && (
                <div className="mt-3">
                    <small className="text-muted">
                        Thông tin này sẽ được hiển thị công khai cho khách hàng xem khi họ truy cập vào chi tiết không gian của bạn.
                    </small>
                </div>
            )}
        </div>
    );
};

export default OwnerProfileManagement;
