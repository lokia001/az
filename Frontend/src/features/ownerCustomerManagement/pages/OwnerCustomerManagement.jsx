import React, { useEffect, useState } from 'react';
import { Container, Table, Form, Row, Col, Alert, Spinner, Pagination } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import CustomerDetailModal from '../../../components/CustomerDetailModal';
import { selectCurrentUser } from '../../auth/slices/authSlice';
import { fetchOwnerCustomersAPI, getCustomerDetailsAPI } from '../services/ownerCustomerApi';

const OwnerCustomerManagement = () => {
    const dispatch = useDispatch();
    const currentUser = useSelector(selectCurrentUser);
    
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        pageSize: 10
    });
    const [filters, setFilters] = useState({
        search: '',
        bookingStatus: 'all'
    });

    const handleShowDetails = async (customer) => {
        try {
            setDetailLoading(true);
            const customerDetails = await getCustomerDetailsAPI(customer.id, currentUser.id);
            setSelectedCustomer(customerDetails);
            setShowDetailModal(true);
        } catch (error) {
            console.error('Error loading customer details:', error);
            setError('Không thể tải chi tiết khách hàng. Vui lòng thử lại.');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleFilter = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
        loadCustomers(1, { ...filters, [filterType]: value });
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
        loadCustomers(page, filters);
    };

    const loadCustomers = async (page, currentFilters) => {
        if (!currentUser?.id) {
            setError('Vui lòng đăng nhập để xem danh sách khách hàng.');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const response = await fetchOwnerCustomersAPI(currentUser.id, {
                pageNumber: page,
                pageSize: pagination.pageSize,
                search: currentFilters.search,
                bookingStatus: currentFilters.bookingStatus
            });
            
            setCustomers(response.data || []);
            setPagination(prev => ({
                ...prev,
                currentPage: response.pageNumber || page,
                totalPages: response.totalPages || 1
            }));
            
        } catch (err) {
            setError('Không thể tải danh sách khách hàng. Vui lòng thử lại sau.');
            console.error('Error loading customers:', err);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers(pagination.currentPage, filters);
    }, []);

    const renderPagination = () => {
        if (pagination.totalPages <= 1) return null;

        return (
            <Pagination className="justify-content-center mt-3">
                <Pagination.First onClick={() => handlePageChange(1)} disabled={pagination.currentPage === 1} />
                <Pagination.Prev 
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                />
                
                {[...Array(pagination.totalPages)].map((_, idx) => (
                    <Pagination.Item
                        key={idx + 1}
                        active={idx + 1 === pagination.currentPage}
                        onClick={() => handlePageChange(idx + 1)}
                    >
                        {idx + 1}
                    </Pagination.Item>
                ))}

                <Pagination.Next
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                />
                <Pagination.Last
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.currentPage === pagination.totalPages}
                />
            </Pagination>
        );
    };

    if (loading && !customers.length) {
        return (
            <Container className="py-4 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </Spinner>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4">Quản lý Khách hàng</h2>

            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}

            {/* Filters */}
            <Row className="mb-4">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Tìm kiếm</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Tìm theo tên, email, hoặc số điện thoại..."
                            value={filters.search}
                            onChange={(e) => handleFilter('search', e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Trạng thái đặt chỗ</Form.Label>
                        <Form.Select
                            value={filters.bookingStatus}
                            onChange={(e) => handleFilter('bookingStatus', e.target.value)}
                        >
                            <option value="all">Tất cả</option>
                            <option value="active">Đang có đặt chỗ</option>
                            <option value="completed">Đã hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            {/* Customers Table */}
            <div className="table-responsive">
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Tên khách hàng</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Tổng số đặt chỗ</th>
                            <th>Lần đặt chỗ gần nhất</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.length > 0 ? (
                            customers.map(customer => (
                                <tr key={customer.id}>
                                    <td>{customer.name}</td>
                                    <td>{customer.email}</td>
                                    <td>{customer.phone}</td>
                                    <td>
                                        <span className="badge bg-primary me-1">{customer.totalBookings}</span>
                                        {customer.completedBookings > 0 && (
                                            <span className="badge bg-success me-1">
                                                {customer.completedBookings} hoàn thành
                                            </span>
                                        )}
                                        {customer.cancelledBookings > 0 && (
                                            <span className="badge bg-danger">
                                                {customer.cancelledBookings} đã hủy
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {customer.lastBooking 
                                            ? new Date(customer.lastBooking).toLocaleDateString('vi-VN')
                                            : 'Chưa có'
                                        }
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => handleShowDetails(customer)}
                                            disabled={detailLoading}
                                        >
                                            {detailLoading ? 'Đang tải...' : 'Xem chi tiết'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">
                                    {loading ? 'Đang tải...' : 'Chưa có khách hàng nào.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Pagination */}
            {renderPagination()}

            {/* Customer Detail Modal */}
            <CustomerDetailModal
                show={showDetailModal}
                onHide={() => {
                    setShowDetailModal(false);
                    setSelectedCustomer(null);
                }}
                customer={selectedCustomer}
                isLoading={detailLoading}
            />
        </Container>
    );
};

export default OwnerCustomerManagement;
