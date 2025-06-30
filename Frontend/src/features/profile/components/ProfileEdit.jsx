// src/features/profile/components/ProfileEdit.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner, Image } from 'react-bootstrap';
import { FaUser, FaSave, FaTimes, FaUpload, FaImage } from 'react-icons/fa';
import { DEFAULT_PROFILE_AVATAR } from '../services/profileApi';

const ProfileEdit = ({ 
    profile, 
    onSave, 
    onCancel, 
    isLoading = false, 
    error = null,
    onUploadProfilePicture,
    isUploadingPicture = false,
    uploadPictureError = null
}) => {
    // Xác định xem có phải Owner không
    const isOwner = profile?.role === 'Owner';
    const ownerProfile = profile?.ownerProfile;

    const [formData, setFormData] = useState({
        fullName: '',
        gender: '',
        dateOfBirth: '',
        bio: '',
        phoneNumber: '',
        address: '',
        avatarUrl: '',
        // Owner profile fields
        companyName: '',
        contactInfo: '',
        description: '',
        businessLicenseNumber: '',
        taxCode: '',
        website: '',
        logoUrl: ''
    });

    const [errors, setErrors] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    // Memoize avatar URL to prevent rerender
    const avatarUrl = useMemo(() => {
        if (previewUrl) return previewUrl;
        if (profile?.avatarUrl) return profile.avatarUrl;
        return DEFAULT_PROFILE_AVATAR;
    }, [previewUrl, profile?.avatarUrl]);

    // Memoize onError handler to prevent rerender
    const handleImageError = useCallback((e) => {
        if (e.target.src !== DEFAULT_PROFILE_AVATAR) {
            console.log('Avatar failed to load:', e.target.src, 'Falling back to default');
            e.target.src = DEFAULT_PROFILE_AVATAR;
        }
    }, []);

    useEffect(() => {
        if (profile) {
            setFormData({
                fullName: profile.fullName || '',
                gender: profile.gender || '',
                dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
                bio: profile.bio || '',
                phoneNumber: profile.phoneNumber || '',
                address: profile.address || '',
                avatarUrl: profile.avatarUrl || '',
                // Owner profile fields
                companyName: ownerProfile?.companyName || '',
                contactInfo: ownerProfile?.contactInfo || '',
                description: ownerProfile?.description || '',
                businessLicenseNumber: ownerProfile?.businessLicenseNumber || '',
                taxCode: ownerProfile?.taxCode || '',
                website: ownerProfile?.website || '',
                logoUrl: ownerProfile?.logoUrl || ''
            });
        }
    }, [profile, ownerProfile]);

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

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file hình ảnh hợp lệ');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước file không được vượt quá 5MB');
                return;
            }

            setSelectedFile(file);
            
            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadPicture = () => {
        if (selectedFile && onUploadProfilePicture) {
            const formData = new FormData();
            formData.append('profilePicture', selectedFile);
            onUploadProfilePicture(formData);
        }
    };

    const handleCancelUpload = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (formData.fullName && formData.fullName.length > 100) {
            newErrors.fullName = 'Họ tên không được vượt quá 100 ký tự';
        }

        if (formData.bio && formData.bio.length > 500) {
            newErrors.bio = 'Giới thiệu không được vượt quá 500 ký tự';
        }

        if (formData.phoneNumber && !/^[\d\s\-\+\(\)]+$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
        }

        if (formData.phoneNumber && formData.phoneNumber.length > 20) {
            newErrors.phoneNumber = 'Số điện thoại không được vượt quá 20 ký tự';
        }

        if (formData.address && formData.address.length > 255) {
            newErrors.address = 'Địa chỉ không được vượt quá 255 ký tự';
        }

        if (formData.avatarUrl && formData.avatarUrl.length > 512) {
            newErrors.avatarUrl = 'URL avatar không được vượt quá 512 ký tự';
        }

        // Validate URL format if provided
        if (formData.avatarUrl && formData.avatarUrl.trim()) {
            try {
                new URL(formData.avatarUrl);
            } catch {
                newErrors.avatarUrl = 'URL avatar không hợp lệ';
            }
        }

        if (formData.dateOfBirth) {
            const birthDate = new Date(formData.dateOfBirth);
            const today = new Date();
            if (birthDate > today) {
                newErrors.dateOfBirth = 'Ngày sinh không được là ngày trong tương lai';
            }
        }

        // Owner profile validations
        if (isOwner) {
            if (formData.companyName && formData.companyName.length > 100) {
                newErrors.companyName = 'Tên công ty không được vượt quá 100 ký tự';
            }

            if (formData.contactInfo && formData.contactInfo.length > 255) {
                newErrors.contactInfo = 'Thông tin liên hệ không được vượt quá 255 ký tự';
            }

            if (formData.description && formData.description.length > 500) {
                newErrors.description = 'Mô tả không được vượt quá 500 ký tự';
            }

            if (formData.businessLicenseNumber && formData.businessLicenseNumber.length > 50) {
                newErrors.businessLicenseNumber = 'Số giấy phép kinh doanh không được vượt quá 50 ký tự';
            }

            if (formData.taxCode && formData.taxCode.length > 20) {
                newErrors.taxCode = 'Mã số thuế không được vượt quá 20 ký tự';
            }

            if (formData.website && formData.website.length > 255) {
                newErrors.website = 'URL website không được vượt quá 255 ký tự';
            }

            if (formData.logoUrl && formData.logoUrl.length > 512) {
                newErrors.logoUrl = 'URL logo không được vượt quá 512 ký tự';
            }

            // Validate URL format if provided
            if (formData.logoUrl && formData.logoUrl.trim()) {
                try {
                    new URL(formData.logoUrl);
                } catch {
                    newErrors.logoUrl = 'URL logo không hợp lệ';
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        if (isOwner) {
            // Prepare data for Owner update
            const updateData = {
                // User fields
                fullName: formData.fullName.trim() || null,
                gender: formData.gender || null,
                dateOfBirth: formData.dateOfBirth || null,
                bio: formData.bio.trim() || null,
                phoneNumber: formData.phoneNumber.trim() || null,
                address: formData.address.trim() || null,
                avatarUrl: formData.avatarUrl.trim() || null,
                // Owner profile fields
                ownerProfile: {
                    companyName: formData.companyName.trim() || null,
                    contactInfo: formData.contactInfo.trim() || null,
                    description: formData.description.trim() || null,
                    businessLicenseNumber: formData.businessLicenseNumber.trim() || null,
                    taxCode: formData.taxCode.trim() || null,
                    website: formData.website.trim() || null,
                    logoUrl: formData.logoUrl.trim() || null
                }
            };
            onSave(updateData);
        } else {
            // Prepare data for regular User update
            const updateData = {
                fullName: formData.fullName.trim() || null,
                gender: formData.gender || null,
                dateOfBirth: formData.dateOfBirth || null,
                bio: formData.bio.trim() || null,
                phoneNumber: formData.phoneNumber.trim() || null,
                address: formData.address.trim() || null,
                avatarUrl: formData.avatarUrl.trim() || null
            };
            onSave(updateData);
        }
    };

    return (
        <Card>
            <Card.Header className="bg-success text-white">
                <h5 className="mb-0">
                    <FaUser className="me-2" />
                    Chỉnh sửa thông tin cá nhân
                </h5>
            </Card.Header>
            <Card.Body>
                {error && (
                    <Alert variant="danger" className="mb-3">
                        <strong>Lỗi:</strong> {error}
                    </Alert>
                )}

                {uploadPictureError && (
                    <Alert variant="danger" className="mb-3">
                        <strong>Lỗi upload avatar:</strong> {uploadPictureError}
                    </Alert>
                )}

                {/* Avatar Upload Section */}
                <Card className="mb-4">
                    <Card.Header className="bg-info text-white">
                        <h6 className="mb-0">
                            <FaImage className="me-2" />
                            Ảnh đại diện
                        </h6>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={4} className="text-center">
                                <Image
                                    src={avatarUrl}
                                    alt="Profile Avatar"
                                    roundedCircle
                                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                    onError={handleImageError}
                                />
                            </Col>
                            <Col md={8}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Chọn ảnh mới</Form.Label>
                                    <Form.Control
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        disabled={isUploadingPicture}
                                    />
                                    <Form.Text className="text-muted">
                                        Chấp nhận: JPG, PNG, GIF. Kích thước tối đa: 5MB
                                    </Form.Text>
                                </Form.Group>

                                {selectedFile && (
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="info"
                                            size="sm"
                                            onClick={handleUploadPicture}
                                            disabled={isUploadingPicture}
                                        >
                                            {isUploadingPicture ? (
                                                <>
                                                    <Spinner size="sm" className="me-1" />
                                                    Đang tải lên...
                                                </>
                                            ) : (
                                                <>
                                                    <FaUpload className="me-1" />
                                                    Tải lên
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={handleCancelUpload}
                                            disabled={isUploadingPicture}
                                        >
                                            Hủy
                                        </Button>
                                    </div>
                                )}

                                <Form.Group className="mt-3">
                                    <Form.Label>Hoặc nhập URL ảnh</Form.Label>
                                    <Form.Control
                                        type="url"
                                        name="avatarUrl"
                                        value={formData.avatarUrl}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.avatarUrl}
                                        placeholder="https://example.com/avatar.jpg"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.avatarUrl}
                                    </Form.Control.Feedback>
                                    <Form.Text className="text-muted">
                                        Để trống để sử dụng avatar mặc định
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Họ và tên</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.fullName}
                                    placeholder="Nhập họ và tên đầy đủ"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.fullName}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Giới tính</Form.Label>
                                <Form.Select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.gender}
                                >
                                    <option value="">Chọn giới tính</option>
                                    <option value="Male">Nam</option>
                                    <option value="Female">Nữ</option>
                                    <option value="Other">Khác</option>
                                    <option value="PreferNotToSay">Không muốn chia sẻ</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.gender}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Ngày sinh</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.dateOfBirth}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.dateOfBirth}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Số điện thoại</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.phoneNumber}
                                    placeholder="Ví dụ: 0123456789"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.phoneNumber}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Địa chỉ</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.address}
                                    placeholder="Nhập địa chỉ hiện tại"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.address}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Giới thiệu bản thân</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.bio}
                                    placeholder="Viết một vài dòng giới thiệu về bản thân..."
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.bio}
                                </Form.Control.Feedback>
                                <Form.Text className="text-muted">
                                    {formData.bio.length}/500 ký tự
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    {isOwner && (
                        <>
                            <Card className="mb-4">
                                <Card.Header className="bg-warning text-white">
                                    <h6 className="mb-0">
                                        <FaUser className="me-2" />
                                        Thông tin công ty
                                    </h6>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Tên công ty</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="companyName"
                                                    value={formData.companyName}
                                                    onChange={handleInputChange}
                                                    isInvalid={!!errors.companyName}
                                                    placeholder="Nhập tên công ty"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.companyName}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Thông tin liên hệ</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="contactInfo"
                                                    value={formData.contactInfo}
                                                    onChange={handleInputChange}
                                                    isInvalid={!!errors.contactInfo}
                                                    placeholder="Nhập thông tin liên hệ"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.contactInfo}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Mô tả</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    isInvalid={!!errors.description}
                                                    placeholder="Nhập mô tả về công ty"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.description}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Số giấy phép kinh doanh</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="businessLicenseNumber"
                                                    value={formData.businessLicenseNumber}
                                                    onChange={handleInputChange}
                                                    isInvalid={!!errors.businessLicenseNumber}
                                                    placeholder="Nhập số giấy phép"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.businessLicenseNumber}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Mã số thuế</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="taxCode"
                                                    value={formData.taxCode}
                                                    onChange={handleInputChange}
                                                    isInvalid={!!errors.taxCode}
                                                    placeholder="Nhập mã số thuế"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.taxCode}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>URL website</Form.Label>
                                                <Form.Control
                                                    type="url"
                                                    name="website"
                                                    value={formData.website}
                                                    onChange={handleInputChange}
                                                    isInvalid={!!errors.website}
                                                    placeholder="https://example.com"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.website}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={12}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Logo công ty</Form.Label>
                                                <Form.Control
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileSelect}
                                                    disabled={isUploadingPicture}
                                                />
                                                <Form.Text className="text-muted">
                                                    Chấp nhận: JPG, PNG, GIF. Kích thước tối đa: 5MB
                                                </Form.Text>
                                            </Form.Group>

                                            {selectedFile && (
                                                <div className="d-flex gap-2">
                                                    <Button
                                                        variant="info"
                                                        size="sm"
                                                        onClick={handleUploadPicture}
                                                        disabled={isUploadingPicture}
                                                    >
                                                        {isUploadingPicture ? (
                                                            <>
                                                                <Spinner size="sm" className="me-1" />
                                                                Đang tải lên...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FaUpload className="me-1" />
                                                                Tải lên
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        onClick={handleCancelUpload}
                                                        disabled={isUploadingPicture}
                                                    >
                                                        Hủy
                                                    </Button>
                                                </div>
                                            )}

                                            <Form.Group className="mt-3">
                                                <Form.Label>Hoặc nhập URL logo</Form.Label>
                                                <Form.Control
                                                    type="url"
                                                    name="logoUrl"
                                                    value={formData.logoUrl}
                                                    onChange={handleInputChange}
                                                    isInvalid={!!errors.logoUrl}
                                                    placeholder="https://example.com/logo.jpg"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.logoUrl}
                                                </Form.Control.Feedback>
                                                <Form.Text className="text-muted">
                                                    Để trống để sử dụng logo mặc định
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </>
                    )}

                    <div className="d-flex gap-2 justify-content-end">
                        <Button
                            type="button"
                            variant="outline-secondary"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            <FaTimes className="me-1" />
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            variant="success"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Spinner size="sm" className="me-1" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <FaSave className="me-1" />
                                    Lưu thay đổi
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default ProfileEdit;
