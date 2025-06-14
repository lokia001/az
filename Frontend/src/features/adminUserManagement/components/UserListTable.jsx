// src/features/adminUserManagement/components/UserListTable.jsx
import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import { FaEdit, FaToggleOn, FaToggleOff, FaEye } from 'react-icons/fa';

const UserListTable = ({ users, onToggleActive, onChangeRole, onViewDetails }) => {
    if (!users || users.length === 0) {
        return <p className="text-center text-muted">Không có người dùng nào phù hợp.</p>;
    }

    return (
        <Row xs={1} sm={2} lg={3} className="g-3">
            {users.map((user, index) => (
                <Col key={user.id}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <Card.Title className="mb-0">{user.username}</Card.Title>
                                    <Card.Subtitle className="text-muted mt-1">
                                        {user.email}
                                    </Card.Subtitle>
                                </div>
                                <Badge bg={user.role === 'SysAdmin' ? 'danger' : user.role === 'Owner' ? 'warning' : 'info'}>
                                    {user.role}
                                </Badge>
                            </div>
                            
                            <Card.Text>
                                <small className="text-muted d-block">Họ tên: {user.fullName || '-'}</small>
                                <small className="text-muted d-block">
                                    Ngày tạo: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                </small>
                                <div className="mt-2">
                                    {user.isActive ? (
                                        <Badge bg="success">Hoạt động</Badge>
                                    ) : (
                                        <Badge bg="secondary">Vô hiệu hóa</Badge>
                                    )}
                                </div>
                            </Card.Text>
                        </Card.Body>
                        <Card.Footer className="bg-transparent border-top-0">
                            <div className="d-flex justify-content-between gap-2">
                                <Button variant="outline-primary" size="sm" title="Xem chi tiết" onClick={() => onViewDetails(user.id)}>
                                    <FaEye /> Chi tiết
                                </Button>
                                <Button
                                    variant={user.isActive ? "outline-warning" : "outline-success"}
                                    size="sm"
                                    title={user.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                                    onClick={() => onToggleActive(user.id, !user.isActive)}
                                >
                                    {user.isActive ? <FaToggleOff /> : <FaToggleOn />}
                                </Button>
                                <Button variant="outline-info" size="sm" title="Đổi vai trò" onClick={() => onChangeRole(user.id, user.role)}>
                                    <FaEdit />
                                </Button>
                            </div>
                        </Card.Footer>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default UserListTable;