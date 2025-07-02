// Frontend/src/features/ownerRegistration/components/AdminOwnerRegistrationList.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Card, 
    Table, 
    Button, 
    Badge, 
    Form, 
    Row, 
    Col, 
    InputGroup,
    Pagination,
    Spinner,
    Alert,
    OverlayTrigger,
    Tooltip
} from 'react-bootstrap';
import { Eye, Check, X, Search, Filter } from 'react-bootstrap-icons';
import {
    getOwnerRegistrationRequests,
    setAdminFilters,
    setAdminPage,
    resetAdminFilters,
    selectAdminRequests,
    selectAdminPagination,
    selectAdminFilters,
    selectAdminRequestsStatus,
    selectAdminRequestsError,
    clearAdminRequestsError
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
            return 'Chờ duyệt';
        case 'approved':
            return 'Đã duyệt';
        case 'rejected':
            return 'Từ chối';
        case 'cancelled':
            return 'Đã hủy';
        default:
            return status || 'N/A';
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

const AdminOwnerRegistrationList = ({ onViewDetails, onProcessRequest }) => {
    const dispatch = useDispatch();
    const requests = useSelector(selectAdminRequests);
    const pagination = useSelector(selectAdminPagination);
    const filters = useSelector(selectAdminFilters);
    const status = useSelector(selectAdminRequestsStatus);
    const error = useSelector(selectAdminRequestsError);

    const [showFilters, setShowFilters] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        dispatch(getOwnerRegistrationRequests({
            pageNumber: pagination.pageNumber,
            pageSize: pagination.pageSize,
            ...filters
        }));
    }, [dispatch, pagination.pageNumber, pagination.pageSize, filters]);

    const handlePageChange = (pageNumber) => {
        dispatch(setAdminPage(pageNumber));
    };

    const handleFilterChange = (name, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleApplyFilters = () => {
        dispatch(setAdminFilters(localFilters));
        dispatch(setAdminPage(1)); // Reset to first page when filtering
    };

    const handleResetFilters = () => {
        setLocalFilters({
            status: '',
            fromDate: '',
            toDate: '',
            searchTerm: ''
        });
        dispatch(resetAdminFilters());
    };

    const handleClearError = () => {
        dispatch(clearAdminRequestsError());
    };

    const renderPagination = () => {
        if (pagination.totalPages <= 1) return null;

        const items = [];
        const currentPage = pagination.pageNumber;
        const totalPages = pagination.totalPages;

        // Previous button
        items.push(
            <Pagination.Prev
                key="prev"
                disabled={!pagination.hasPreviousPage || status === 'loading'}
                onClick={() => handlePageChange(currentPage - 1)}
            />
        );

        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            items.push(<Pagination.Item key={1} onClick={() => handlePageChange(1)}>1</Pagination.Item>);
            if (startPage > 2) {
                items.push(<Pagination.Ellipsis key="start-ellipsis" />);
            }
        }

        for (let page = startPage; page <= endPage; page++) {
            items.push(
                <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => handlePageChange(page)}
                    disabled={status === 'loading'}
                >
                    {page}
                </Pagination.Item>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                items.push(<Pagination.Ellipsis key="end-ellipsis" />);
            }
            items.push(
                <Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>
                    {totalPages}
                </Pagination.Item>
            );
        }

        // Next button
        items.push(
            <Pagination.Next
                key="next"
                disabled={!pagination.hasNextPage || status === 'loading'}
                onClick={() => handlePageChange(currentPage + 1)}
            />
        );

        return (
            <Pagination className="justify-content-center mt-3">
                {items}
            </Pagination>
        );
    };

    return (
        <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Danh sách yêu cầu đăng ký</h5>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={16} /> Bộ lọc
                    </Button>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => dispatch(getOwnerRegistrationRequests({
                            pageNumber: pagination.pageNumber,
                            pageSize: pagination.pageSize,
                            ...filters
                        }))}
                        disabled={status === 'loading'}
                    >
                        Làm mới
                    </Button>
                </div>
            </Card.Header>

            {showFilters && (
                <Card.Header className="border-top">
                    <Row>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Trạng thái</Form.Label>
                                <Form.Select
                                    value={localFilters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="Pending">Chờ duyệt</option>
                                    <option value="Approved">Đã duyệt</option>
                                    <option value="Rejected">Từ chối</option>
                                    <option value="Cancelled">Đã hủy</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Từ ngày</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={localFilters.fromDate}
                                    onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Đến ngày</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={localFilters.toDate}
                                    onChange={(e) => handleFilterChange('toDate', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Tìm kiếm</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Tên công ty, user..."
                                        value={localFilters.searchTerm}
                                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                                    />
                                    <Button variant="outline-secondary" onClick={handleApplyFilters}>
                                        <Search size={16} />
                                    </Button>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mt-2">
                        <Col>
                            <Button variant="primary" size="sm" onClick={handleApplyFilters}>
                                Áp dụng bộ lọc
                            </Button>
                            <Button variant="outline-secondary" size="sm" className="ms-2" onClick={handleResetFilters}>
                                Xóa bộ lọc
                            </Button>
                        </Col>
                    </Row>
                </Card.Header>
            )}

            <Card.Body>
                {error && (
                    <Alert variant="danger" dismissible onClose={handleClearError}>
                        {error}
                    </Alert>
                )}

                {status === 'loading' ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" />
                        <p className="mt-2">Đang tải danh sách yêu cầu...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <Alert variant="info">
                        Không có yêu cầu đăng ký nào.
                    </Alert>
                ) : (
                    <>
                        <div className="table-responsive">
                            <Table striped hover>
                                <thead>
                                    <tr>
                                        <th>Tên công ty</th>
                                        <th>Người dùng</th>
                                        <th>Trạng thái</th>
                                        <th>Ngày gửi</th>
                                        <th>Ngày xử lý</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((request) => (
                                        <tr key={request.id}>
                                            <td>
                                                <strong>{request.companyName}</strong>
                                                {request.businessPhone && (
                                                    <div className="text-muted small">
                                                        {request.businessPhone}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div>{request.username}</div>
                                                <div className="text-muted small">{request.userEmail}</div>
                                            </td>
                                            <td>
                                                <Badge bg={getStatusVariant(request.status)}>
                                                    {getStatusText(request.status)}
                                                </Badge>
                                            </td>
                                            <td>{formatDate(request.createdAt)}</td>
                                            <td>
                                                {request.processedAt ? formatDate(request.processedAt) : 'N/A'}
                                                {request.processedByUsername && (
                                                    <div className="text-muted small">
                                                        {request.processedByUsername}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    <OverlayTrigger
                                                        overlay={<Tooltip>Xem chi tiết</Tooltip>}
                                                    >
                                                        <Button
                                                            variant="outline-info"
                                                            size="sm"
                                                            onClick={() => onViewDetails(request)}
                                                        >
                                                            <Eye size={16} />
                                                        </Button>
                                                    </OverlayTrigger>
                                                    
                                                    {request.status === 'Pending' && (
                                                        <>
                                                            <OverlayTrigger
                                                                overlay={<Tooltip>Phê duyệt</Tooltip>}
                                                            >
                                                                <Button
                                                                    variant="outline-success"
                                                                    size="sm"
                                                                    onClick={() => onProcessRequest(request, true)}
                                                                >
                                                                    <Check size={16} />
                                                                </Button>
                                                            </OverlayTrigger>
                                                            
                                                            <OverlayTrigger
                                                                overlay={<Tooltip>Từ chối</Tooltip>}
                                                            >
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    onClick={() => onProcessRequest(request, false)}
                                                                >
                                                                    <X size={16} />
                                                                </Button>
                                                            </OverlayTrigger>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>

                        {renderPagination()}

                        <div className="text-muted small mt-2">
                            Hiển thị {requests.length} trong tổng số {pagination.totalCount} yêu cầu
                        </div>
                    </>
                )}
            </Card.Body>
        </Card>
    );
};

export default AdminOwnerRegistrationList;
