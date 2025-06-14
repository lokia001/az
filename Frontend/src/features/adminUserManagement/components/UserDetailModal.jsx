// src/features/adminUserManagement/components/UserDetailModal.jsx
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';

const UserDetailModal = ({ show, onHide, user }) => {
    if (!user) return null;
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    };
    
    const getRoleBadge = (role) => {
        let variant = 'info'; // default
        switch (role) {
            case 'SysAdmin':
                variant = 'danger';
                break;
            case 'Admin':
                variant = 'danger';
                break;
            case 'Owner':
                variant = 'warning';
                break;
            case 'User':
                variant = 'info';
                break;
            default:
                variant = 'secondary';
        }
        return <Badge bg={variant}>{role}</Badge>;
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Chi tiết người dùng</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="user-details">
                    <Row className="mb-3">
                        <Col md={3} className="fw-bold">ID:</Col>
                        <Col md={9}>{user.id}</Col>
                    </Row>
                    
                    <Row className="mb-3">
                        <Col md={3} className="fw-bold">Username:</Col>
                        <Col md={9}>{user.username}</Col>
                    </Row>
                    
                    <Row className="mb-3">
                        <Col md={3} className="fw-bold">Email:</Col>
                        <Col md={9}>{user.email}</Col>
                    </Row>
                    
                    <Row className="mb-3">
                        <Col md={3} className="fw-bold">Họ tên:</Col>
                        <Col md={9}>{user.fullName || 'Chưa cập nhật'}</Col>
                    </Row>
                    
                    <Row className="mb-3">
                        <Col md={3} className="fw-bold">Số điện thoại:</Col>
                        <Col md={9}>{user.phoneNumber || 'Chưa cập nhật'}</Col>
                    </Row>
                    
                    <Row className="mb-3">
                        <Col md={3} className="fw-bold">Vai trò:</Col>
                        <Col md={9}>{getRoleBadge(user.role)}</Col>
                    </Row>
                    
                    <Row className="mb-3">
                        <Col md={3} className="fw-bold">Trạng thái:</Col>
                        <Col md={9}>
                            {user.isActive ? 
                                <Badge bg="success">Hoạt động</Badge> : 
                                <Badge bg="secondary">Vô hiệu hóa</Badge>
                            }
                        </Col>
                    </Row>
                    
                    <Row className="mb-3">
                        <Col md={3} className="fw-bold">Ngày tạo:</Col>
                        <Col md={9}>{formatDate(user.createdAt)}</Col>
                    </Row>
                    
                    <Row className="mb-3">
                        <Col md={3} className="fw-bold">Cập nhật lần cuối:</Col>
                        <Col md={9}>{formatDate(user.updatedAt)}</Col>
                    </Row>
                    
                    {user.lastLoginDate && (
                        <Row className="mb-3">
                            <Col md={3} className="fw-bold">Đăng nhập gần đây:</Col>
                            <Col md={9}>{formatDate(user.lastLoginDate)}</Col>
                        </Row>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Đóng
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UserDetailModal;
