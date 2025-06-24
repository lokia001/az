import React, { useEffect, useState } from 'react';
import { Container, Table, Form, Row, Col, Alert, Spinner, Pagination } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import CustomerDetailModal from '../../../components/CustomerDetailModal';

const OwnerCustomerManagement = () => {
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [loading, setLoading] = useState(false);
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

    const handleShowDetails = (customer) => {
        setSelectedCustomer(customer);
        setShowDetailModal(true);
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
        try {
            setLoading(true);
            // TODO: Replace with actual API call
            // const response = await api.get('/owner/customers', { 
            //     params: { 
            //         page,
            //         pageSize: pagination.pageSize,
            //         search: currentFilters.search,
            //         bookingStatus: currentFilters.bookingStatus 
            //     }
            // });
            // setCustomers(response.data.items);
            // setPagination(prev => ({
            //     ...prev,
            //     currentPage: response.data.currentPage,
            //     totalPages: response.data.totalPages
            // }));

            // Mock data for now
            setCustomers([
                { id: 1, name: 'John Doe', email: 'john@example.com', phone: '0123456789', totalBookings: 5, lastBooking: '2024-01-15' },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', totalBookings: 3, lastBooking: '2024-01-10' },
            ]);
            
        } catch (err) {
            setError('Failed to load customers. Please try again later.');
            console.error('Error loading customers:', err);
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
                                    <td>{customer.totalBookings}</td>
                                    <td>{new Date(customer.lastBooking).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => handleShowDetails(customer)}
                                        >
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">
                                    Không có khách hàng nào.
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
            />
        </Container>
    );
};

export default OwnerCustomerManagement;
