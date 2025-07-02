// src/pages/OwnerProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
// Import Bootstrap Icons CSS
import 'bootstrap-icons/font/bootstrap-icons.css';

import { getPublicOwnerProfile } from '../services/api';

function OwnerProfilePage() {
    const { ownerId } = useParams();
    const navigate = useNavigate();
    
    const [ownerProfile, setOwnerProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOwnerProfile = async () => {
            if (!ownerId) {
                setError('ID chủ không gian không hợp lệ.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                console.log(`[OwnerProfilePage] Fetching owner profile for ID: ${ownerId}`);
                const data = await getPublicOwnerProfile(ownerId);
                setOwnerProfile(data);
                console.log('[OwnerProfilePage] Owner profile fetched successfully:', data);
            } catch (error) {
                console.error('[OwnerProfilePage] Error fetching owner profile:', error);
                if (error.response?.status === 404) {
                    setError('Không tìm thấy thông tin chủ không gian.');
                } else {
                    setError('Có lỗi xảy ra khi tải thông tin chủ không gian.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOwnerProfile();
    }, [ownerId]);

    if (loading) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                <p className="mt-3">Đang tải thông tin chủ không gian...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="text-center py-5">
                <Alert variant="danger">
                    <h4>Có lỗi xảy ra</h4>
                    <p>{error}</p>
                    <Button variant="outline-primary" onClick={() => navigate(-1)}>
                        Quay lại
                    </Button>
                </Alert>
            </Container>
        );
    }

    if (!ownerProfile) {
        return (
            <Container className="text-center py-5">
                <Alert variant="info">
                    <h4>Thông tin chưa có sẵn</h4>
                    <p>Chủ không gian này chưa cập nhật thông tin công ty công khai.</p>
                    <p className="small text-muted">ID: {ownerId}</p>
                    <Button variant="outline-primary" onClick={() => navigate(-1)}>
                        Quay lại không gian
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        onClick={() => navigate(-1)}
                        className="mb-3"
                    >
                        ← Quay lại
                    </Button>
                    <h1 className="h2 mb-0">Thông tin chủ không gian</h1>
                </Col>
            </Row>

            <Row>
                <Col lg={8} className="mx-auto">
                    <Card>
                        <Card.Body className="p-4">
                            {/* Company Header */}
                            <div className="text-center mb-4">
                                {/* Company Logo/Avatar */}
                                <div className="mx-auto mb-3">
                                    {ownerProfile.LogoUrl || ownerProfile.logoUrl ? (
                                        <img 
                                            src={ownerProfile.LogoUrl || ownerProfile.logoUrl}
                                            alt={`Logo ${ownerProfile.CompanyName || ownerProfile.companyName}`}
                                            className="rounded-circle"
                                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div 
                                            className="bg-primary text-white rounded-circle mx-auto d-flex align-items-center justify-content-center"
                                            style={{ width: '100px', height: '100px', fontSize: '36px', fontWeight: 'bold' }}
                                        >
                                            {(ownerProfile.CompanyName || ownerProfile.companyName || 'C').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                {/* Company Name */}
                                <h2 className="h3 mb-2">
                                    {ownerProfile.CompanyName || ownerProfile.companyName}
                                    {(ownerProfile.IsVerified || ownerProfile.isVerified) && (
                                        <Badge bg="success" className="ms-2">
                                            <i className="bi bi-patch-check me-1"></i>
                                            Đã xác minh
                                        </Badge>
                                    )}
                                </h2>
                            </div>

                            {/* Company Description */}
                            {(ownerProfile.Description || ownerProfile.description) && (
                                <div className="mb-4">
                                    <h5 className="mb-3">
                                        <i className="bi bi-info-circle me-2 text-primary"></i>
                                        Giới thiệu
                                    </h5>
                                    <p className="text-muted">
                                        {ownerProfile.Description || ownerProfile.description}
                                    </p>
                                </div>
                            )}

                            {/* Contact Information */}
                            <div className="mb-4">
                                <h5 className="mb-3">
                                    <i className="bi bi-telephone me-2 text-primary"></i>
                                    Thông tin liên hệ
                                </h5>
                                
                                <Row className="g-3">
                                    {/* Website */}
                                    {(ownerProfile.Website || ownerProfile.website) && (
                                        <Col md={6}>
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-globe me-2 text-muted"></i>
                                                <div>
                                                    <strong>Website:</strong>
                                                    <br />
                                                    <a 
                                                        href={ownerProfile.Website || ownerProfile.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-decoration-none"
                                                    >
                                                        {(ownerProfile.Website || ownerProfile.website).replace(/^https?:\/\//, '')}
                                                        <i className="bi bi-box-arrow-up-right ms-1 small"></i>
                                                    </a>
                                                </div>
                                            </div>
                                        </Col>
                                    )}

                                    {/* User ID for reference */}
                                    <Col md={6}>
                                        <div className="d-flex align-items-center">
                                            <i className="bi bi-person me-2 text-muted"></i>
                                            <div>
                                                <strong>ID chủ không gian:</strong>
                                                <br />
                                                <code className="small text-muted">
                                                    {ownerProfile.UserId || ownerProfile.userId}
                                                </code>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            {/* Actions */}
                            <div className="text-center">
                                <Row className="justify-content-center">
                                    <Col xs="auto">
                                        <Button 
                                            variant="primary" 
                                            onClick={() => navigate(-1)}
                                            className="me-2"
                                        >
                                            <i className="bi bi-arrow-left me-2"></i>
                                            Quay lại không gian
                                        </Button>
                                    </Col>
                                    {(ownerProfile.Website || ownerProfile.website) && (
                                        <Col xs="auto">
                                            <Button 
                                                variant="outline-primary"
                                                href={ownerProfile.Website || ownerProfile.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <i className="bi bi-globe me-2"></i>
                                                Truy cập website
                                            </Button>
                                        </Col>
                                    )}
                                </Row>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default OwnerProfilePage;
