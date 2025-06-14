// src/features/adminUserManagement/components/UserListFilters.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { setAdminUserFilter, resetAdminUserFilters, selectAdminUserFilters, fetchAdminUsers } from '../slices/adminUserSlice';

const UserListFilters = () => {
    const dispatch = useDispatch();
    const currentFilters = useSelector(selectAdminUserFilters);

    const [localFilters, setLocalFilters] = useState(currentFilters);

    useEffect(() => {
        setLocalFilters(currentFilters); // Sync local state if Redux filters change (e.g., on reset)
    }, [currentFilters]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyFilters = () => {
        // Dispatch each filter change individually or a combined action
        Object.keys(localFilters).forEach(key => {
            if (localFilters[key] !== currentFilters[key]) { // Only dispatch if changed
                dispatch(setAdminUserFilter({ filterName: key, value: localFilters[key] }));
            }
        });
        // After setting filters, a fetch will be triggered by useEffect in page component
        // or dispatch fetchAdminUsers explicitly if setAdminUserFilter doesn't change status to 'idle'
        // dispatch(fetchAdminUsers()); // Usually not needed if page useEffect handles it
    };

    const handleReset = () => {
        dispatch(resetAdminUserFilters());
        // fetchAdminUsers will be triggered by page component's useEffect due to filter state change
    };

    return (
        <Card className="mb-3">
            <Card.Header>Lọc danh sách người dùng</Card.Header>
            <Card.Body>
                <Form>
                    <Row className="g-3">
                        <Col md={6} lg={3}>
                            <Form.Group controlId="filterUsername">
                                <Form.Label size="sm">Tên đăng nhập</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="Username"
                                    size="sm"
                                    value={localFilters.Username}
                                    onChange={handleChange}
                                    placeholder="Nhập username..."
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6} lg={3}>
                            <Form.Group controlId="filterEmail">
                                <Form.Label size="sm">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="Email"
                                    size="sm"
                                    value={localFilters.Email}
                                    onChange={handleChange}
                                    placeholder="Nhập email..."
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6} lg={3}>
                            <Form.Group controlId="filterRole">
                                <Form.Label size="sm">Vai trò</Form.Label>
                                <Form.Select
                                    name="Role"
                                    size="sm"
                                    value={localFilters.Role}
                                    onChange={handleChange}
                                >
                                    <option value="">Tất cả vai trò</option>
                                    <option value="User">User</option>
                                    <option value="Owner">Owner</option>
                                    <option value="SysAdmin">SysAdmin</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6} lg={3}>
                            <Form.Group controlId="filterIsActive">
                                <Form.Label size="sm">Trạng thái</Form.Label>
                                <Form.Select
                                    name="IsActive"
                                    size="sm"
                                    value={localFilters.IsActive} // Handles "true", "false", ""
                                    onChange={handleChange}
                                >
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="true">Đang hoạt động</option>
                                    <option value="false">Bị vô hiệu hóa</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col xs={12} className="d-flex justify-content-end align-items-end gap-2 mt-3">
                            <Button variant="outline-secondary" size="sm" onClick={handleReset}>Xóa bộ lọc</Button>
                            <Button variant="primary" size="sm" onClick={handleApplyFilters}>Áp dụng</Button>
                        </Col>
                    </Row>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default UserListFilters;