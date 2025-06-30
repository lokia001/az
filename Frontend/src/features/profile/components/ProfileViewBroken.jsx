// src/features/profile/components/ProfileView.jsx
import React, { useMemo, useCallback } from 'react';
import { Card, Row, Col, Badge, Image } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaPhone, FaMapMarker, FaBirthdayCake, FaCalendar } from 'react-icons/fa';
import { DEFAULT_PROFILE_AVATAR } from '../services/profileApi';

const ProfileView = ({ profile }) => {
    if (!profile) {
        return (
            <Card>
                <Card.Body className="text-center">
                    <p>Không có thông tin profile để hiển thị.</p>
                </Card.Body>
            </Card>
        );
    }

    // Xác định xem có phải Owner không
    const isOwner = profile.role === 'Owner';
    const ownerProfile = profile.ownerProfile;

    const formatDate = useMemo(() => (dateString) => {
        if (!dateString) return 'Chưa cập nhật';
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch {
            return 'Không hợp lệ';
        }
    }, []);

    const getRoleText = useMemo(() => (role) => {
        const roleMap = {
            'User': 'Người dùng',
            'Owner': 'Chủ sở hữu không gian',
            'SysAdmin': 'Quản trị viên hệ thống'
        };
        return roleMap[role] || role;
    }, []);

    const getRoleVariant = useMemo(() => (role) => {
        const variantMap = {
            'User': 'primary',
            'Owner': 'success',
            'SysAdmin': 'danger'
        };
        return variantMap[role] || 'secondary';
    }, []);

    const getGenderText = useMemo(() => (gender) => {
        const genderMap = {
            'Male': 'Nam',
            'Female': 'Nữ',
            'Other': 'Khác',
            'PreferNotToSay': 'Không muốn chia sẻ'
        };
        return genderMap[gender] || 'Chưa cập nhật';
    }, []);

    // Memoize avatar URL to prevent rerender
    const avatarUrl = useMemo(() => {
        return profile.avatarUrl || DEFAULT_PROFILE_AVATAR;
    }, [profile.avatarUrl]);

    // Memoize onError handler to prevent rerender
    const handleImageError = useCallback((e) => {
        // Prevent infinite loop by checking if already set to default
        if (e.target.src !== DEFAULT_PROFILE_AVATAR) {
            console.log('Avatar failed to load:', e.target.src, 'Falling back to default');
            e.target.src = DEFAULT_PROFILE_AVATAR;
        }
    }, []);

    return (
        <Card>
            <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                    <FaUser className="me-2" />
                    Thông tin cá nhân
                </h5>
            </Card.Header>
            <Card.Body>
                <Row className="mb-4">
                    <Col md={3} className="text-center">
                        <Image
                            src={avatarUrl}
                            alt="Avatar"
                            roundedCircle
                            style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                            onError={handleImageError}
                        />
                        <div className="mt-2">
                            <Badge bg={getRoleVariant(profile.role)} className="fs-6">
                                {getRoleText(profile.role)}
                            </Badge>
                        </div>
                    </Col>
                    <Col md={9}>
                        {/* Thông tin cơ bản */}
                        <Row className="mb-3">
                            <Col sm={6}>
                                <div className="d-flex align-items-center mb-2">
                                    <FaUser className="text-muted me-2" />
                                    <div>
                                        <small className="text-muted d-block">Tên người dùng</small>
                                        <strong>{profile.username}</strong>
                                    </div>
                                </div>
                            </Col>
                            <Col sm={6}>
                                <div className="d-flex align-items-center mb-2">
                                    <FaEnvelope className="text-muted me-2" />
                                    <div>
                                        <small className="text-muted d-block">Email</small>
                                        <strong>{profile.email}</strong>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        {/* Hiển thị thông tin khác nhau dựa vào role */}
                        {isOwner && ownerProfile ? (
                            // Thông tin cho Owner
                            <>
                                <Row className="mb-3">
                                    <Col sm={6}>
                                        <div className="d-flex align-items-center mb-2">
                                            <FaUser className="text-muted me-2" />
                                            <div>
                                                <small className="text-muted d-block">Tên công ty</small>
                                                <strong>{ownerProfile.companyName || 'Chưa cập nhật'}</strong>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col sm={6}>
                                        <div className="d-flex align-items-center mb-2">
                                            <FaPhone className="text-muted me-2" />
                                            <div>
                                                <small className="text-muted d-block">Thông tin liên hệ</small>
                                                <strong>{ownerProfile.contactInfo || 'Chưa cập nhật'}</strong>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col sm={6}>
                                        <div className="d-flex align-items-center mb-2">
                                            <FaUser className="text-muted me-2" />
                                            <div>
                                                <small className="text-muted d-block">Giấy phép kinh doanh</small>
                                                <strong>{ownerProfile.businessLicenseNumber || 'Chưa cập nhật'}</strong>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col sm={6}>
                                        <div className="d-flex align-items-center mb-2">
                                            <FaUser className="text-muted me-2" />
                                            <div>
                                                <small className="text-muted d-block">Mã số thuế</small>
                                                <strong>{ownerProfile.taxCode || 'Chưa cập nhật'}</strong>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                {ownerProfile.website && (
                                    <Row className="mb-3">
                                        <Col sm={12}>
                                            <div className="d-flex align-items-center mb-2">
                                                <FaUser className="text-muted me-2" />
                                                <div>
                                                    <small className="text-muted d-block">Website</small>
                                                    <strong>
                                                        <a href={ownerProfile.website} target="_blank" rel="noopener noreferrer">
                                                            {ownerProfile.website}
                                                        </a>
                                                    </strong>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                )}

                                <Row className="mb-3">
                                    <Col sm={12}>
                                        <div className="mb-2">
                                            <small className="text-muted d-block">Mô tả công ty</small>
                                            <p className="mb-0">{ownerProfile.description || 'Chưa có mô tả'}</p>
                                        </div>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col sm={6}>
                                        <div className="d-flex align-items-center mb-2">
                                            <FaCalendar className="text-muted me-2" />
                                            <div>
                                                <small className="text-muted d-block">Trạng thái xác minh</small>
                                                <Badge bg={ownerProfile.isVerified ? 'success' : 'warning'}>
                                                    {ownerProfile.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col sm={6}>
                                        <div className="d-flex align-items-center mb-2">
                                            <FaCalendar className="text-muted me-2" />
                                            <div>
                                                <small className="text-muted d-block">Ngày tạo</small>
                                                <strong>{formatDate(ownerProfile.createdAt)}</strong>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </>
                        ) : (
                            // Thông tin cho User thông thường
                            <>
                                <Row className="mb-3">
                                    <Col sm={6}>
                                        <div className="d-flex align-items-center mb-2">
                                            <FaUser className="text-muted me-2" />
                                            <div>
                                                <small className="text-muted d-block">Họ và tên</small>
                                                <strong>{profile.fullName || 'Chưa cập nhật'}</strong>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col sm={6}>
                                        <div className="d-flex align-items-center mb-2">
                                            <FaUser className="text-muted me-2" />
                                            <div>
                                                <small className="text-muted d-block">Giới tính</small>
                                                <strong>{getGenderText(profile.gender)}</strong>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col sm={6}>
                                        <div className="d-flex align-items-center mb-2">
                                            <FaBirthdayCake className="text-muted me-2" />
                                            <div>
                                                <small className="text-muted d-block">Ngày sinh</small>
                                                <strong>{formatDate(profile.dateOfBirth)}</strong>
                                            </div>
                                        </div>
                                    </Col>
                                                        <div className="d-flex align-items-center mb-2">
                                            <FaPhone className="text-muted me-2" />
                                            <div>
                                                <small className="text-muted d-block">Số điện thoại</small>
                                                <strong>{profile.phoneNumber || 'Chưa cập nhật'}</strong>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col sm={12}>
                                        <div className="d-flex align-items-start mb-2">
                                            <FaMapMarker className="text-muted me-2 mt-1" />
                                            <div>
                                                <small className="text-muted d-block">Địa chỉ</small>
                                                <strong>{profile.address || 'Chưa cập nhật'}</strong>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                {profile.bio && (
                                    <Row className="mb-3">
                                        <Col sm={12}>
                                            <div className="d-flex align-items-start mb-2">
                                                <FaUser className="text-muted me-2 mt-1" />
                                                <div>
                                                    <small className="text-muted d-block">Giới thiệu</small>
                                                    <p className="mb-0">{profile.bio}</p>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                )}

                                <Row>
                                    <Col sm={12}>
                                        <div className="d-flex align-items-center">
                                            <FaCalendar className="text-muted me-2" />
                                            <div>
                                                <small className="text-muted d-block">Ngày tham gia</small>
                                                <strong>{formatDate(profile.createdAt)}</strong>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </>
                        )}
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default React.memo(ProfileView);
