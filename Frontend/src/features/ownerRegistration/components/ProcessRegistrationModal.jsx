// Frontend/src/features/ownerRegistration/components/ProcessRegistrationModal.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Button, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import {
    processOwnerRegistration,
    selectProcessStatus,
    selectProcessError,
    clearProcessError
} from '../slices/ownerRegistrationSlice';

const ProcessRegistrationModal = ({ show, onHide, request, isApproval }) => {
    const dispatch = useDispatch();
    const processStatus = useSelector(selectProcessStatus);
    const processError = useSelector(selectProcessError);

    const [formData, setFormData] = useState({
        adminNotes: '',
        rejectionReason: ''
    });

    useEffect(() => {
        if (show) {
            // Reset form when modal opens
            setFormData({
                adminNotes: '',
                rejectionReason: ''
            });
            dispatch(clearProcessError());
        }
    }, [show, dispatch]);

    useEffect(() => {
        if (processStatus === 'succeeded') {
            // Close modal on success
            onHide();
        }
    }, [processStatus, onHide]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!request) return;

        const processData = {
            isApproved: isApproval,
            adminNotes: formData.adminNotes.trim() || null,
            rejectionReason: !isApproval ? formData.rejectionReason.trim() || null : null
        };

        dispatch(processOwnerRegistration({
            requestId: request.id,
            processData
        }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!request) return null;

    const modalTitle = isApproval ? 'Phê duyệt yêu cầu đăng ký' : 'Từ chối yêu cầu đăng ký';
    const submitButtonText = isApproval ? 'Phê duyệt' : 'Từ chối';
    const submitButtonVariant = isApproval ? 'success' : 'danger';

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{modalTitle}</Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {processError && (
                        <Alert variant="danger" dismissible onClose={() => dispatch(clearProcessError())}>
                            {processError}
                        </Alert>
                    )}

                    {/* Request Information */}
                    <div className="mb-4">
                        <h6>Thông tin yêu cầu</h6>
                        <Row>
                            <Col md={6}>
                                <p><strong>Tên công ty:</strong> {request.companyName}</p>
                                <p><strong>Người dùng:</strong> {request.username} ({request.userEmail})</p>
                                <p><strong>Ngày gửi:</strong> {formatDate(request.createdAt)}</p>
                            </Col>
                            <Col md={6}>
                                {request.businessPhone && (
                                    <p><strong>Số điện thoại:</strong> {request.businessPhone}</p>
                                )}
                                {request.businessAddress && (
                                    <p><strong>Địa chỉ:</strong> {request.businessAddress}</p>
                                )}
                                {request.website && (
                                    <p><strong>Website:</strong> 
                                        <a href={request.website} target="_blank" rel="noopener noreferrer" className="ms-1">
                                            {request.website}
                                        </a>
                                    </p>
                                )}
                                {request.businessLicense && (
                                    <p><strong>Giấy phép KD:</strong> {request.businessLicense}</p>
                                )}
                            </Col>
                        </Row>

                        {request.description && (
                            <div className="mt-3">
                                <strong>Mô tả doanh nghiệp:</strong>
                                <p className="mt-2 p-3 bg-light rounded">{request.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Processing Form */}
                    <div className="border-top pt-3">
                        <h6>Xử lý yêu cầu</h6>
                        
                        <Alert variant={isApproval ? 'success' : 'warning'}>
                            <strong>
                                {isApproval 
                                    ? 'Bạn sắp phê duyệt yêu cầu này. Người dùng sẽ được thăng cấp thành Owner.' 
                                    : 'Bạn sắp từ chối yêu cầu này. Vui lòng cung cấp lý do từ chối.'}
                            </strong>
                        </Alert>

                        <Form.Group className="mb-3">
                            <Form.Label>Ghi chú của quản trị viên</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="adminNotes"
                                value={formData.adminNotes}
                                onChange={handleInputChange}
                                placeholder={isApproval 
                                    ? "Ghi chú về việc phê duyệt (tùy chọn)..."
                                    : "Ghi chú thêm (tùy chọn)..."}
                                maxLength={1000}
                                disabled={processStatus === 'loading'}
                            />
                            <Form.Text className="text-muted">
                                {formData.adminNotes.length}/1000 ký tự
                            </Form.Text>
                        </Form.Group>

                        {!isApproval && (
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Lý do từ chối <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="rejectionReason"
                                    value={formData.rejectionReason}
                                    onChange={handleInputChange}
                                    placeholder="Vui lòng cung cấp lý do từ chối rõ ràng..."
                                    maxLength={500}
                                    required={!isApproval}
                                    disabled={processStatus === 'loading'}
                                />
                                <Form.Text className="text-muted">
                                    {formData.rejectionReason.length}/500 ký tự
                                </Form.Text>
                            </Form.Group>
                        )}
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={processStatus === 'loading'}>
                        Hủy
                    </Button>
                    <Button 
                        type="submit" 
                        variant={submitButtonVariant}
                        disabled={processStatus === 'loading' || (!isApproval && !formData.rejectionReason.trim())}
                    >
                        {processStatus === 'loading' ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                {' '}Đang xử lý...
                            </>
                        ) : (
                            submitButtonText
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ProcessRegistrationModal;
