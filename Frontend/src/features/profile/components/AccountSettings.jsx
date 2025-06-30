// src/features/profile/components/AccountSettings.jsx
import React, { useState } from 'react';
import { Card, Form, Button, Alert, Modal, Row, Col } from 'react-bootstrap';
import { FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const AccountSettings = ({
    profile,
    onRequestAccountDeletion
}) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');

    const handleDeleteAccount = () => {
        if (deleteReason.trim()) {
            onRequestAccountDeletion({ reason: deleteReason });
            setShowDeleteModal(false);
            setDeleteReason('');
        }
    };

    return (
        <>
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="border-danger">
                        <Card.Header className="bg-danger text-white">
                            <h5 className="mb-0">
                                <FaTrash className="me-2" />
                                Vùng nguy hiểm
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <h6 className="text-danger">Xóa tài khoản</h6>
                            <p className="text-muted">
                                Một khi bạn xóa tài khoản, tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn. 
                                Hành động này không thể hoàn tác.
                            </p>
                            
                            <div className="d-grid mb-3">
                                <Button
                                    variant="outline-danger"
                                    onClick={() => setShowDeleteModal(true)}
                                >
                                    <FaTrash className="me-1" />
                                    Yêu cầu xóa tài khoản
                                </Button>
                            </div>

                            <div className="p-3 bg-light rounded">
                                <h6 className="text-warning">
                                    <FaExclamationTriangle className="me-1" />
                                    Lưu ý quan trọng:
                                </h6>
                                <ul className="mb-0 text-muted small">
                                    <li>Tất cả dữ liệu cá nhân sẽ bị xóa</li>
                                    <li>Lịch sử đặt chỗ sẽ bị xóa</li>
                                    <li>Bài đăng và bình luận sẽ bị xóa</li>
                                    <li>Tài khoản không thể khôi phục sau khi xóa</li>
                                </ul>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Account Deletion Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
            <Modal.Header closeButton className="bg-danger text-white">
                <Modal.Title>
                    <FaExclamationTriangle className="me-2" />
                    Xác nhận xóa tài khoản
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Alert variant="warning">
                    <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác!
                </Alert>
                
                <p>
                    Để xác nhận xóa tài khoản, vui lòng cho chúng tôi biết lý do:
                </p>
                
                <Form.Group>
                    <Form.Label>Lý do xóa tài khoản *</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        placeholder="Vui lòng cho biết lý do bạn muốn xóa tài khoản..."
                        required
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button 
                    variant="secondary" 
                    onClick={() => setShowDeleteModal(false)}
                >
                    Hủy
                </Button>
                <Button 
                    variant="danger" 
                    onClick={handleDeleteAccount}
                    disabled={!deleteReason.trim()}
                >
                    <FaTrash className="me-1" />
                    Xác nhận xóa
                </Button>
            </Modal.Footer>
        </Modal>
        </>
    );
};

export default React.memo(AccountSettings);
