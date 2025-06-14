// src/features/adminUserManagement/components/ChangeRoleModal.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { changeUserRole, selectAdminActionStatus, selectAdminActionError, clearActionError } from '../slices/adminUserSlice';

const USER_ROLES = ["User", "Owner", "SysAdmin"]; // Available roles from API spec

const ChangeRoleModal = ({ show, onHide, user }) => {
    const dispatch = useDispatch();
    const actionStatus = useSelector(selectAdminActionStatus);
    const actionError = useSelector(selectAdminActionError);

    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        if (user) {
            setSelectedRole(user.role); // Pre-fill with current role
        }
        if (!show) { // Clear error when modal is hidden
            dispatch(clearActionError());
        }
    }, [user, show, dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!user || !selectedRole || selectedRole === user.role) {
            // No change or no user, do nothing or show a message
            if (selectedRole === user.role) alert("Vai trò không thay đổi.");
            return;
        }
        console.log(`Dispatching changeUserRole for user ${user.id} to ${selectedRole}`);
        dispatch(changeUserRole({ userId: user.id, newRole: selectedRole }))
            .unwrap() // unwrap to handle promise here for closing modal
            .then(() => {
                alert(`Vai trò của người dùng ${user.username} đã được cập nhật thành công!`);
                onHide(); // Close modal on success
            })
            .catch((err) => {
                // Error is already in Redux state (actionError), no need to set local error
                console.error("Failed to change role:", err);
            });
    };

    if (!user) return null;

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Thay đổi vai trò cho: {user.username}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <p><strong>ID Người dùng:</strong> {user.id}</p>
                    <p><strong>Vai trò hiện tại:</strong> {user.role}</p>

                    {actionStatus === 'failed' && actionError && (
                        <Alert variant="danger" onClose={() => dispatch(clearActionError())} dismissible>
                            {String(actionError)}
                        </Alert>
                    )}

                    <Form.Group controlId="changeRoleSelect">
                        <Form.Label>Chọn vai trò mới *</Form.Label>
                        <Form.Select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            required
                            disabled={actionStatus === 'loading'}
                        >
                            {USER_ROLES.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={actionStatus === 'loading'}>
                        Hủy
                    </Button>
                    <Button variant="primary" type="submit" disabled={actionStatus === 'loading' || selectedRole === user.role}>
                        {actionStatus === 'loading' ? (
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                        ) : (
                            'Lưu thay đổi'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ChangeRoleModal;