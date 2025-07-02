// Frontend/src/features/ownerRegistration/components/OwnerRegistrationStatus.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Alert, Button, Badge, Spinner, Row, Col } from 'react-bootstrap';
import {
    getMyOwnerRegistration,
    cancelOwnerRegistration,
    selectUserRequest,
    selectUserRequestStatus,
    selectUserRequestError,
    selectActionStatus,
    selectActionError,
    clearUserRequestError,
    clearActionError
} from '../slices/ownerRegistrationSlice';

const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
        case 'pending':
            return 'warning';
        case 'approved':
            return 'success';
        case 'rejected':
            return 'danger';
        case 'cancelled':
            return 'secondary';
        default:
            return 'primary';
    }
};

const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
        case 'pending':
            return 'Đang chờ duyệt';
        case 'approved':
            return 'Đã được phê duyệt';
        case 'rejected':
            return 'Đã bị từ chối';
        case 'cancelled':
            return 'Đã hủy';
        default:
            return status || 'Không xác định';
    }
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

const OwnerRegistrationStatus = ({ onNewRegistration }) => {
    const dispatch = useDispatch();
    const userRequest = useSelector(selectUserRequest);
    const userRequestStatus = useSelector(selectUserRequestStatus);
    const userRequestError = useSelector(selectUserRequestError);
    const actionStatus = useSelector(selectActionStatus);
    const actionError = useSelector(selectActionError);

    useEffect(() => {
        dispatch(getMyOwnerRegistration());
    }, [dispatch]);

    const handleCancelRequest = () => {
        if (userRequest && window.confirm('Bạn có chắc chắn muốn hủy yêu cầu đăng ký này?')) {
            dispatch(cancelOwnerRegistration(userRequest.id));
        }
    };

    const handleClearUserRequestError = () => {
        dispatch(clearUserRequestError());
    };

    const handleClearActionError = () => {
        dispatch(clearActionError());
    };

    if (userRequestStatus === 'loading') {
        return (
            <Card>
                <Card.Body className="text-center">
                    <Spinner animation="border" />
                    <p className="mt-2">Đang tải thông tin yêu cầu...</p>
                </Card.Body>
            </Card>
        );
    }

    if (userRequestStatus === 'failed') {
        return (
            <Card>
                <Card.Body>
                    <Alert variant="danger" dismissible onClose={handleClearUserRequestError}>
                        {userRequestError}
                    </Alert>
                </Card.Body>
            </Card>
        );
    }

    if (!userRequest) {
        return (
            <Card>
                <Card.Body>
                    <Alert variant="info">
                        Bạn chưa có yêu cầu đăng ký làm chủ không gian nào. 
                        {onNewRegistration && (
                            <>
                                {' '}
                                <Button variant="link" className="p-0" onClick={onNewRegistration}>
                                    Đăng ký ngay
                                </Button>
                            </>
                        )}
                    </Alert>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Trạng thái yêu cầu đăng ký</h5>
                <Badge bg={getStatusVariant(userRequest.status)} className="fs-6">
                    {getStatusText(userRequest.status)}
                </Badge>
            </Card.Header>
            <Card.Body>
                {actionError && (
                    <Alert variant="danger" dismissible onClose={handleClearActionError}>
                        {actionError}
                    </Alert>
                )}

                <Row>
                    <Col md={6}>
                        <h6>Thông tin đăng ký</h6>
                        <p><strong>Tên công ty:</strong> {userRequest.companyName}</p>
                        {userRequest.businessPhone && (
                            <p><strong>Số điện thoại:</strong> {userRequest.businessPhone}</p>
                        )}
                        {userRequest.businessAddress && (
                            <p><strong>Địa chỉ:</strong> {userRequest.businessAddress}</p>
                        )}
                        {userRequest.website && (
                            <p><strong>Website:</strong> 
                                <a href={userRequest.website} target="_blank" rel="noopener noreferrer" className="ms-1">
                                    {userRequest.website}
                                </a>
                            </p>
                        )}
                        {userRequest.businessLicense && (
                            <p><strong>Giấy phép KD:</strong> {userRequest.businessLicense}</p>
                        )}
                    </Col>
                    <Col md={6}>
                        <h6>Thời gian</h6>
                        <p><strong>Ngày gửi:</strong> {formatDate(userRequest.createdAt)}</p>
                        {userRequest.updatedAt && (
                            <p><strong>Cập nhật lần cuối:</strong> {formatDate(userRequest.updatedAt)}</p>
                        )}
                        {userRequest.processedAt && (
                            <p><strong>Ngày xử lý:</strong> {formatDate(userRequest.processedAt)}</p>
                        )}
                        {userRequest.processedByUsername && (
                            <p><strong>Người xử lý:</strong> {userRequest.processedByUsername}</p>
                        )}
                    </Col>
                </Row>

                {userRequest.description && (
                    <div className="mt-3">
                        <h6>Mô tả doanh nghiệp</h6>
                        <p className="text-muted">{userRequest.description}</p>
                    </div>
                )}

                {userRequest.adminNotes && (
                    <Alert variant="info">
                        <strong>Ghi chú từ quản trị viên:</strong>
                        <p className="mb-0 mt-2">{userRequest.adminNotes}</p>
                    </Alert>
                )}

                {userRequest.rejectionReason && (
                    <Alert variant="danger">
                        <strong>Lý do từ chối:</strong>
                        <p className="mb-0 mt-2">{userRequest.rejectionReason}</p>
                    </Alert>
                )}

                {userRequest.status === 'Pending' && (
                    <div className="mt-3">
                        <Button
                            variant="outline-danger"
                            onClick={handleCancelRequest}
                            disabled={actionStatus === 'loading'}
                        >
                            {actionStatus === 'loading' ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                    {' '}Đang hủy...
                                </>
                            ) : (
                                'Hủy yêu cầu'
                            )}
                        </Button>
                    </div>
                )}

                {userRequest.status === 'Approved' && (
                    <Alert variant="success" className="mt-3">
                        <strong>Chúc mừng!</strong> Yêu cầu đăng ký của bạn đã được phê duyệt. 
                        Bạn hiện đã có quyền chủ không gian và có thể bắt đầu đăng tải các không gian của mình.
                    </Alert>
                )}

                {(userRequest.status === 'Rejected' || userRequest.status === 'Cancelled') && onNewRegistration && (
                    <div className="mt-3">
                        <Button variant="primary" onClick={onNewRegistration}>
                            Đăng ký mới
                        </Button>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default OwnerRegistrationStatus;
