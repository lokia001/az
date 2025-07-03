import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom'; // << THÊM VÀO để lấy spaceId từ URL
import { 
    Container, Table, Button, Badge, Form, Row, Col, 
    Pagination, Spinner, Alert, Card, Stack, InputGroup,
    Dropdown, Modal
} from 'react-bootstrap';
import { Calendar2, Grid, List, Download, Gear, Plus } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
    fetchOwnerBookings,
    updateBookingStatus,
    createOwnerBooking,
    setOwnerBookingFilter,
    setOwnerBookingPage,
    resetOwnerBookingFilters,
    exportOwnerBookings,
    selectOwnerBookings,
    selectOwnerBookingFilters,
    selectOwnerBookingPagination,
    selectOwnerBookingStatus,
    selectOwnerBookingError,
    selectOwnerBookingStats,
    selectOwnerBookingCreateStatus,
    selectOwnerBookingCreateError
} from './slices/ownerBookingSlice';
import { selectCurrentUser } from '../auth/slices/authSlice';
import { formatVietnameseDateTime } from '../../utils/timeUtils';
import { getOwnerSpaces } from '../../services/api';
import { getStatusText, fetchOwnerBookingsAPI } from './services/ownerBookingApi';
import AddOwnerBookingModal from './components/AddOwnerBookingModal';
import ConflictAlert from './components/ConflictAlert';

const OwnerBookingManagement = () => {
    const { spaceId } = useParams(); // << LẤY spaceId từ URL
    const { t } = useTranslation();
    
    // Fallback translation function for missing keys
    const getTranslation = (key, fallback) => {
        try {
            const translated = t(key);
            return translated === key ? fallback : translated;
        } catch {
            return fallback;
        }
    };
    
    const dispatch = useDispatch();
    const [viewMode, setViewMode] = useState('list');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showAddBookingModal, setShowAddBookingModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [ownerSpaces, setOwnerSpaces] = useState([]);
    const [loadingSpaces, setLoadingSpaces] = useState(true);
    const [spacesError, setSpacesError] = useState(null);
    
    // State cho global conflict detection
    const [allOwnerBookings, setAllOwnerBookings] = useState([]);
    const [loadingAllBookings, setLoadingAllBookings] = useState(false);
    
    // Redux state
    const currentUser = useSelector(selectCurrentUser);
    const bookings = useSelector(selectOwnerBookings);
    const filters = useSelector(selectOwnerBookingFilters);
    const pagination = useSelector(selectOwnerBookingPagination);
    const status = useSelector(selectOwnerBookingStatus);
    const error = useSelector(selectOwnerBookingError);
    const stats = useSelector(selectOwnerBookingStats);
    const createStatus = useSelector(selectOwnerBookingCreateStatus);
    const createError = useSelector(selectOwnerBookingCreateError);

    // Fetch owner's spaces first
    useEffect(() => {
        const fetchSpaces = async () => {
            if (!currentUser?.id) return;
            
            try {
                setLoadingSpaces(true);
                const spaces = await getOwnerSpaces(currentUser.id);
                setOwnerSpaces(spaces);
                
                // Determine which space to select
                let selectedSpaceId = null;
                
                // 1. Priority: spaceId from URL parameter (when navigating from space management)
                if (spaceId && spaces.find(space => space.id === spaceId)) {
                    selectedSpaceId = spaceId;
                }
                // 2. Fallback: first space if no space is currently selected
                else if (spaces.length > 0 && !filters.spaceId) {
                    selectedSpaceId = spaces[0].id;
                }
                
                // Set selected space and fetch bookings
                if (selectedSpaceId) {
                    dispatch(setOwnerBookingFilter({ filterName: 'spaceId', value: selectedSpaceId }));
                    dispatch(fetchOwnerBookings());
                }
            } catch (error) {
                console.error("Failed to fetch owner spaces:", error);
                setSpacesError(error.message || "Failed to load spaces");
            } finally {
                setLoadingSpaces(false);
            }
        };
        
        fetchSpaces();
    }, [currentUser?.id, spaceId, dispatch]); // << THÊM spaceId vào dependencies

    useEffect(() => {
        dispatch(fetchOwnerBookings());
    }, [dispatch]);

    // Fetch all bookings for global conflict detection
    useEffect(() => {
        const fetchAllOwnerBookings = async () => {
            if (!currentUser?.id || loadingSpaces || ownerSpaces.length === 0) {
                return;
            }
            
            try {
                setLoadingAllBookings(true);
                const allBookings = [];
                
                // Fetch bookings for all owner spaces
                for (const space of ownerSpaces) {
                    try {
                        const spaceBookings = await fetchOwnerBookingsAPI({
                            spaceId: space.id,
                            status: '', // All statuses
                            pageNumber: 1,
                            pageSize: 1000 // Large number to get all bookings
                        });
                        
                        // Add space info to each booking for grouping
                        const bookingsWithSpace = spaceBookings.data.map(booking => ({
                            ...booking,
                            spaceName: space.name,
                            spaceId: space.id
                        }));
                        
                        allBookings.push(...bookingsWithSpace);
                    } catch (error) {
                        console.error(`Failed to fetch bookings for space ${space.name}:`, error);
                    }
                }
                
                setAllOwnerBookings(allBookings);
            } catch (error) {
                console.error('Failed to fetch all owner bookings:', error);
            } finally {
                setLoadingAllBookings(false);
            }
        };
        
        fetchAllOwnerBookings();
    }, [currentUser?.id, ownerSpaces, bookings, loadingSpaces]); // Re-fetch when bookings change and not loading

    // Handle modal closing after successful booking creation
    useEffect(() => {
        if (createStatus === 'succeeded' && showAddBookingModal) {
            // Close modal after the success notification is shown (handled by the modal itself)
            setTimeout(() => {
                setShowAddBookingModal(false);
            }, 2500); // Match the timeout in AddOwnerBookingModal
        }
    }, [createStatus, showAddBookingModal]);

    const handleFilter = (filterName, value) => {
        dispatch(setOwnerBookingFilter({ filterName, value }));
        dispatch(fetchOwnerBookings());
    };

    const handleDateRangeChange = (startDate, endDate) => {
        dispatch(setOwnerBookingFilter({ 
            filterName: 'dateFrom', 
            value: startDate ? startDate.toISOString() : '' 
        }));
        dispatch(setOwnerBookingFilter({ 
            filterName: 'dateTo', 
            value: endDate ? endDate.toISOString() : '' 
        }));
        dispatch(fetchOwnerBookings());
    };

    const handlePageChange = (page) => {
        dispatch(setOwnerBookingPage(page));
        dispatch(fetchOwnerBookings());
    };

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            await dispatch(updateBookingStatus({ bookingId, newStatus })).unwrap();
            dispatch(fetchOwnerBookings());
            // Removed fetchOwnerBookingStats call as it's not essential
        } catch (error) {
            console.error('Failed to update booking status:', error);
        }
    };

    const handleConflictResolution = async (bookingId, action) => {
        await handleStatusUpdate(bookingId, action);
    };

    const handleExport = async () => {
        try {
            const blob = await dispatch(exportOwnerBookings()).unwrap();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bookings-${new Date().toISOString().split('T')[0]}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export bookings:', error);
        }
    };

    const handleCreateBooking = async (bookingData) => {
        try {
            await dispatch(createOwnerBooking(bookingData)).unwrap();
            // Modal will handle success notification and closing
            // Refresh bookings list
            dispatch(fetchOwnerBookings());
        } catch (error) {
            console.error('Failed to create booking:', error);
            // Error will be handled by the modal component via createError
        }
    };

    const renderStatusBadge = (status) => {
        let variant = 'secondary';
        switch (status) {
            case 'Pending': variant = 'warning'; break;
            case 'Confirmed': variant = 'success'; break;
            case 'CheckedIn': variant = 'primary'; break;
            case 'Checkout': variant = 'info'; break;
            case 'Completed': variant = 'info'; break;
            case 'OverduePending': variant = 'danger'; break;
            case 'OverdueCheckin': variant = 'danger'; break;
            case 'OverdueCheckout': variant = 'danger'; break;
            case 'NoShow': variant = 'dark'; break;
            case 'Cancelled': variant = 'danger'; break;
            case 'Abandoned': variant = 'warning'; break;
            case 'External': variant = 'light'; break;
            case 'Conflict': variant = 'danger'; break;
            default: variant = 'secondary';
        }
        
        // Try to get translation, fallback to Vietnamese status text
        const translatedText = getTranslation(`booking.status.${status.toLowerCase()}`, status);
        const statusText = translatedText === status ? getStatusText(status) : translatedText;
        
        return <Badge bg={variant}>{statusText}</Badge>;
    };

    const renderStats = () => null;

    const renderToolbar = () => (
        <Stack direction="horizontal" gap={3} className="mb-4">
            <Button 
                variant="primary" 
                size="sm"
                onClick={() => setShowAddBookingModal(true)}
                disabled={!filters.spaceId || loadingSpaces}
            >
                <Plus className="me-1" /> Thêm đặt chỗ
            </Button>
            <div className="vr" />
            <Button variant="outline-secondary" size="sm" 
                onClick={() => setViewMode('list')}
                active={viewMode === 'list'}>
                <List className="me-1" /> Danh sách
            </Button>
            <Button variant="outline-secondary" size="sm" 
                onClick={() => setViewMode('calendar')}
                active={viewMode === 'calendar'}>
                <Calendar2 className="me-1" /> Lịch
            </Button>
            <div className="ms-auto" />
            <Button variant="outline-success" size="sm" onClick={handleExport}>
                <Download className="me-1" /> Xuất Excel
            </Button>
            <Button variant="outline-secondary" size="sm">
                <Gear className="me-1" /> Cài đặt
            </Button>
        </Stack>
    );

    const renderFilters = () => (
        <Row className="mb-4 g-3">
            {/* Space selector */}
            <Col md={3}>
                <Form.Group>
                    <Form.Label>Không gian</Form.Label>
                    <Form.Select
                        value={filters.spaceId}
                        onChange={(e) => handleFilter('spaceId', e.target.value)}
                        disabled={loadingSpaces}
                    >
                        {ownerSpaces.map(space => (
                            <option key={space.id} value={space.id}>
                                {space.name}
                            </option>
                        ))}
                    </Form.Select>
                    {loadingSpaces && (
                        <Form.Text className="text-muted">
                            Đang tải...
                        </Form.Text>
                    )}
                    {spacesError && (
                        <Form.Text className="text-danger">
                            {spacesError}
                        </Form.Text>
                    )}
                </Form.Group>
            </Col>
            <Col md={3}>
                <Form.Group>
                    <Form.Label>Trạng thái</Form.Label>
                    <Form.Select
                        value={filters.status}
                        onChange={(e) => handleFilter('status', e.target.value)}
                    >
                        <option value="">Tất cả</option>
                        <option value="Pending">Chờ xác nhận</option>
                        <option value="Confirmed">Đã xác nhận</option>
                        <option value="Cancelled">Đã hủy</option>
                        <option value="Completed">Hoàn thành</option>
                    </Form.Select>
                </Form.Group>
            </Col>
            <Col md={3}>
                <Form.Group>
                    <Form.Label>Khách hàng</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Tìm theo tên khách hàng..."
                        value={filters.customerName}
                        onChange={(e) => handleFilter('customerName', e.target.value)}
                    />
                </Form.Group>
            </Col>
            <Col md={3}>
                <Form.Group>
                    <Form.Label>Khoảng thời gian</Form.Label>
                    <InputGroup>
                        <DatePicker
                            selectsRange
                            startDate={filters.dateFrom ? new Date(filters.dateFrom) : null}
                            endDate={filters.dateTo ? new Date(filters.dateTo) : null}
                            onChange={([start, end]) => handleDateRangeChange(start, end)}
                            className="form-control"
                            placeholderText="Chọn khoảng thời gian..."
                        />
                        <Button variant="outline-secondary" 
                            onClick={() => handleDateRangeChange(null, null)}>
                            Xóa
                        </Button>
                    </InputGroup>
                </Form.Group>
            </Col>
        </Row>
    );

    const renderBookingActions = (booking) => (
        <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" size="sm" id={`booking-${booking.id}-actions`}>
                Hành động
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item onClick={() => {
                    setSelectedBooking(booking);
                    setShowDetailModal(true);
                }}>
                    Xem chi tiết
                </Dropdown.Item>
                
                {/* Pending status actions */}
                {booking.status === 'Pending' && (
                    <>
                        <Dropdown.Item onClick={() => handleStatusUpdate(booking.id, 'Confirmed')}>
                            ✓ Xác nhận đặt chỗ
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleStatusUpdate(booking.id, 'Cancelled')}>
                            ✗ Từ chối đặt chỗ
                        </Dropdown.Item>
                    </>
                )}
                
                {/* Conflict status actions */}
                {booking.status === 'Conflict' && (
                    <>
                        <Dropdown.Item 
                            onClick={() => handleStatusUpdate(booking.id, 'Confirmed')}
                            className="text-success"
                        >
                            ✓ Xác nhận (sẽ hủy booking xung đột khác)
                        </Dropdown.Item>
                        <Dropdown.Item 
                            onClick={() => handleStatusUpdate(booking.id, 'Cancelled')}
                            className="text-danger"
                        >
                            ✗ Hủy booking này
                        </Dropdown.Item>
                    </>
                )}
                
                {/* Confirmed status actions */}
                {booking.status === 'Confirmed' && (
                    <>
                        <Dropdown.Item onClick={() => handleStatusUpdate(booking.id, 'CheckedIn')}>
                            📍 Check-in khách hàng
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleStatusUpdate(booking.id, 'NoShow')}>
                            ❌ Đánh dấu không đến
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleStatusUpdate(booking.id, 'Cancelled')}>
                            🚫 Hủy đặt chỗ
                        </Dropdown.Item>
                    </>
                )}
                
                {/* CheckedIn status actions */}
                {booking.status === 'CheckedIn' && (
                    <>
                        <Dropdown.Item onClick={() => handleStatusUpdate(booking.id, 'Completed')}>
                            ✅ Check-out & Hoàn thành
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleStatusUpdate(booking.id, 'Cancelled')}>
                            🚫 Hủy đặt chỗ
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleStatusUpdate(booking.id, 'Abandoned')}>
                            🚨 Đánh dấu bỏ cuộc (sự cố)
                        </Dropdown.Item>
                    </>
                )}
                
                {/* Overdue status actions */}
                {(booking.status === 'OverduePending' || booking.status === 'OverdueCheckin' || booking.status === 'OverdueCheckout') && (
                    <>
                        <Dropdown.Item onClick={() => handleStatusUpdate(booking.id, 'Completed')}>
                            ✅ Hoàn thành (muộn)
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleStatusUpdate(booking.id, 'Cancelled')}>
                            🚫 Hủy đặt chỗ
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleStatusUpdate(booking.id, 'Abandoned')}>
                            🏃 Đánh dấu bỏ trốn
                        </Dropdown.Item>
                    </>
                )}
                
                {/* General Cancel and Abandon actions for active bookings */}
                {['Pending', 'Confirmed'].includes(booking.status) && (
                    <>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={() => handleStatusUpdate(booking.id, 'Abandoned')}>
                            🚨 Đánh dấu bỏ cuộc (sự cố khẩn cấp)
                        </Dropdown.Item>
                    </>
                )}
                
                {/* Contact customer - available for most statuses */}
                {!['Cancelled', 'Abandoned', 'Completed'].includes(booking.status) && (
                    <>
                        <Dropdown.Divider />
                        <Dropdown.Item>
                            📞 Liên hệ khách hàng
                        </Dropdown.Item>
                    </>
                )}
            </Dropdown.Menu>
        </Dropdown>
    );

    const renderBookingsTable = () => (
        <div className="table-responsive">
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Khách hàng</th>
                        <th>Email nhận thông báo</th>
                        <th>Không gian</th>
                        <th>Thời gian bắt đầu</th>
                        <th>Thời gian kết thúc</th>
                        <th>Thời lượng</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(bookings) && bookings.map((booking) => (
                        <tr key={booking.id}>
                            <td>{booking.id}</td>
                            <td>{booking.customerName}</td>
                            <td>
                                <div>
                                    <span className="text-muted small" title={booking.notificationEmail || 'Sử dụng email đăng ký'}>
                                        {booking.notificationEmail || <em className="text-secondary">Email đăng ký</em>}
                                    </span>
                                </div>
                            </td>
                            <td>{booking.spaceName}</td>
                            <td>{formatVietnameseDateTime(booking.startTime)}</td>
                            <td>{formatVietnameseDateTime(booking.endTime)}</td>
                            <td>{booking.duration} giờ</td>
                            <td>{booking.totalPrice?.toLocaleString()} ₫</td>
                            <td>{renderStatusBadge(booking.status)}</td>
                            <td>{renderBookingActions(booking)}</td>
                        </tr>
                    ))}
                    {(!Array.isArray(bookings) || !bookings.length) && (
                        <tr>
                            <td colSpan="10" className="text-center py-4">
                                {status === 'loading' ? (
                                    <Spinner animation="border" size="sm" className="me-2" />
                                ) : (
                                    'Chưa có đặt chỗ nào'
                                )}
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );

    const renderPagination = () => {
        if (!pagination || !pagination.totalPages) return null;
        const items = [];
        const totalPages = parseInt(pagination.totalPages) || 0;
        const currentPage = parseInt(pagination.PageNumber) || 1;
        
        if (totalPages <= 1) return null;
        
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => handlePageChange(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }
        return <Pagination className="justify-content-center mt-3">{items}</Pagination>;
    };

    // Fetch all bookings from all owner's spaces for global conflict detection
    const fetchAllOwnerBookings = async () => {
        if (!currentUser?.id || ownerSpaces.length === 0) return;
        
        try {
            setLoadingAllBookings(true);
            const allBookingsPromises = ownerSpaces.map(async (space) => {
                try {
                    const response = await fetch(`/api/bookings/space/${space.id}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.ok) {
                        const spaceBookings = await response.json();
                        // Add spaceName to each booking for display
                        return spaceBookings.map(booking => ({
                            ...booking,
                            spaceName: space.name
                        }));
                    }
                    return [];
                } catch (error) {
                    console.error(`Failed to fetch bookings for space ${space.id}:`, error);
                    return [];
                }
            });
            
            const allBookingsArrays = await Promise.all(allBookingsPromises);
            const flatBookings = allBookingsArrays.flat();
            setAllOwnerBookings(flatBookings);
        } catch (error) {
            console.error('Failed to fetch all owner bookings:', error);
        } finally {
            setLoadingAllBookings(false);
        }
    };

    // Fetch all bookings when spaces are loaded
    useEffect(() => {
        if (ownerSpaces.length > 0) {
            fetchAllOwnerBookings();
        }
    }, [ownerSpaces, currentUser?.id]);

    // Refetch all bookings when current space bookings change (indicating updates)
    useEffect(() => {
        if (ownerSpaces.length > 0 && bookings) {
            fetchAllOwnerBookings();
        }
    }, [bookings]);

    useEffect(() => {
        fetchAllOwnerBookings();
    }, [ownerSpaces, currentUser?.id]);

    if (status === 'loading' && !bookings.length) {
        return (
            <Container className="py-4">
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </Spinner>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4">Quản lý đặt chỗ</h2>

            {error && (
                <Alert variant="danger" dismissible>
                    {error}
                </Alert>
            )}

            {/* Conflict Alert - hiển thị cảnh báo xung đột booking global */}
            <ConflictAlert 
                bookings={allOwnerBookings} 
                onResolveConflict={handleConflictResolution}
                loading={loadingAllBookings}
            />

            {/* Show loading state when spaces are loading */}
            {loadingSpaces ? (
                <div className="text-center py-4">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </Spinner>
                    <div className="mt-2">Đang tải danh sách không gian...</div>
                </div>
            ) : spacesError ? (
                <Alert variant="danger">
                    {spacesError}
                </Alert>
            ) : ownerSpaces.length === 0 ? (
                <Alert variant="info">
                    Bạn chưa có không gian nào. Vui lòng đăng ký không gian trước.
                </Alert>
            ) : (
                <>
                    {renderStats()}
                    {renderToolbar()}
                    {renderFilters()}
                    {viewMode === 'list' ? renderBookingsTable() : <div>Chế độ lịch sẽ có sớm...</div>}
                    {renderPagination()}
                </>
            )}

            {/* Booking Detail Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết đặt chỗ</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedBooking && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Khách hàng:</strong> {selectedBooking.customerName}
                                </Col>
                                <Col md={6}>
                                    <strong>Email nhận thông báo:</strong> 
                                    <br />
                                    <span className="text-muted">
                                        {selectedBooking.notificationEmail || <em className="text-secondary">Sử dụng email đăng ký của khách hàng</em>}
                                    </span>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Không gian:</strong> {selectedBooking.spaceName}
                                </Col>
                                <Col md={6}>
                                    <strong>Số người:</strong> {selectedBooking.numberOfPeople} người
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Thời gian bắt đầu:</strong> {new Date(selectedBooking.startTime).toLocaleString()}
                                </Col>
                                <Col md={6}>
                                    <strong>Thời gian kết thúc:</strong> {new Date(selectedBooking.endTime).toLocaleString()}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Tổng tiền:</strong> {selectedBooking.totalPrice?.toLocaleString()} ₫
                                </Col>
                                <Col md={6}>
                                    <strong>Trạng thái:</strong> {renderStatusBadge(selectedBooking.status)}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col>
                                    <strong>Ghi chú:</strong>
                                    <p className="mt-2">{selectedBooking.notes || 'Không có ghi chú'}</p>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Add Booking Modal */}
            <AddOwnerBookingModal 
                show={showAddBookingModal} 
                onHide={() => setShowAddBookingModal(false)}
                onSubmit={handleCreateBooking}
                isSubmitting={createStatus === 'loading'}
                error={createError}
                currentUser={currentUser}
            />
        </Container>
    );
};

export default OwnerBookingManagement;