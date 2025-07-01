import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, InputGroup, Modal, Badge, Spinner, Alert, ToggleButton, Dropdown, ButtonGroup, Table, Pagination } from 'react-bootstrap';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaFilter, FaEye, FaCalendarAlt, FaStar, FaToggleOn, FaToggleOff, FaList, FaTh } from 'react-icons/fa';
import { fetchSpaces, selectManageSpaces, selectManageSpaceLoading, selectManageSpaceError, deleteSpaceAsync } from '../manageSpaceSlice';
import SpaceForm from './SpaceForm';
import SpaceDetails from './SpaceDetails';
import '../styles/OwnerSpacesPage.css';

const SPACE_STATUSES = {
    Available: { label: 'Trống', variant: 'success' },
    Booked: { label: 'Đã đặt', variant: 'primary' },
    Maintenance: { label: 'Đang bảo trì', variant: 'warning' },
    Draft: { label: 'Bản nháp', variant: 'secondary' },
    Disabled: { label: 'Đã ẩn', variant: 'danger' }
};

const OwnerSpacesPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const spaces = useSelector(selectManageSpaces);
    const loading = useSelector(selectManageSpaceLoading);
    const error = useSelector(selectManageSpaceError);
    const currentUser = useSelector(state => state.auth.user);

    // Add pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(9);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [viewMode, setViewMode] = useState('grid');
    const [priceRange, setPriceRange] = useState('all');
    const [capacityRange, setCapacityRange] = useState('all');
    const [amenityFilter, setAmenityFilter] = useState([]);
    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    // Update statistics calculation
    const calculateStatistics = useCallback(() => {
        if (!spaces) return;
        
        const stats = {
            total: spaces.length,
            active: spaces.filter(s => s.status === 'Available').length,
            booked: spaces.filter(s => s.status === 'Booked').length,
            maintenance: spaces.filter(s => s.status === 'Maintenance').length,
            draft: spaces.filter(s => s.status === 'Draft').length,
            disabled: spaces.filter(s => s.status === 'Disabled').length
        };
        setStatistics(stats);
    }, [spaces]);

    // Add statistics state
    const [statistics, setStatistics] = useState({
        total: 0,
        active: 0,
        booked: 0,
        maintenance: 0,
        draft: 0,
        disabled: 0
    });

    // Use a refreshSpaces function that can be called whenever needed
    const refreshSpaces = useCallback(async () => {
        if (currentUser?.id) {
            try {
                await dispatch(fetchSpaces()).unwrap();
                console.log("Spaces refreshed successfully");
            } catch (error) {
                console.error("Failed to refresh spaces:", error);
            }
        }
    }, [dispatch, currentUser]);

    // Initial load and when refresh is triggered
    useEffect(() => {
        refreshSpaces();
    }, [refreshSpaces, refreshTrigger]);

    // Update statistics when spaces change
    useEffect(() => {
        calculateStatistics();
    }, [spaces, calculateStatistics]);

    const applyPriceFilter = (space) => {
        if (priceRange === 'all') return true;
        const [min, max] = priceRange.split('-');
        const price = space.price || 0;
        if (max === '+') return price >= parseInt(min);
        return price >= parseInt(min) && price <= parseInt(max);
    };

    const applyCapacityFilter = (space) => {
        if (capacityRange === 'all') return true;
        const [min, max] = capacityRange.split('-');
        const capacity = space.capacity || 0;
        if (max === '+') return capacity >= parseInt(min);
        return capacity >= parseInt(min) && capacity <= parseInt(max);
    };

    const applyAmenitiesFilter = (space) => {
        if (!amenityFilter.length) return true;
        return amenityFilter.every(amenity => space.amenities?.includes(amenity));
    };

    const sortSpaces = (a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case 'name':
                comparison = (a.name || '').localeCompare(b.name || '');
                break;
            case 'price':
                comparison = (a.price || 0) - (b.price || 0);
                break;
            case 'rating':
                comparison = (a.rating || 0) - (b.rating || 0);
                break;
            case 'views':
                comparison = (a.viewCount || 0) - (b.viewCount || 0);
                break;
            default:
                comparison = 0;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
    };

    const filteredSpaces = spaces?.filter(space => {
        if (!space) return false;
        
        const matchesSearch = searchQuery === '' || 
            space.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            space.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            space.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || space.status === filterStatus;
        const matchesType = filterType === 'all' || space.type === filterType;
        const matchesPrice = applyPriceFilter(space);
        const matchesCapacity = applyCapacityFilter(space);
        const matchesAmenities = applyAmenitiesFilter(space);
        
        return matchesSearch && matchesStatus && matchesType && 
               matchesPrice && matchesCapacity && matchesAmenities;
    })?.sort(sortSpaces) || [];

    // Calculate pagination
    const totalPages = Math.ceil(filteredSpaces.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSpaces.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
    };

    const handleCreateSpace = () => {
        setSelectedSpace(null);
        setShowCreateModal(true);
    };

    const handleEditSpace = (space) => {
        setSelectedSpace(space);
        setShowEditModal(true);
    };

    const handleViewSpace = (space) => {
        // Navigate to the detailed view
        navigate(`/owner/manage-spaces/${space.id}`);
    };

    const handleDeleteSpace = (spaceId) => {
        setDeleteConfirmation(spaceId);
    };

    const confirmDeleteSpace = async () => {
        if (deleteConfirmation) {
            try {
                await dispatch(deleteSpaceAsync(deleteConfirmation)).unwrap();
                setDeleteConfirmation(null);
                // Trigger refresh using the counter
                setRefreshTrigger(prev => prev + 1);
            } catch (error) {
                console.error('Error deleting space:', error);
                setDeleteConfirmation(null);
            }
        }
    };

    const handleFormSubmit = useCallback(async (success, result) => {
        console.log("Form submit callback called with success:", success);
        
        // Close modals first to prevent navigation issues
        setShowCreateModal(false);
        setShowEditModal(false);
        
        // Only refresh if submission was successful
        if (success) {
            // Use timeout to ensure modals are closed before refresh
            setTimeout(() => {
                setRefreshTrigger(prev => prev + 1);
            }, 100);
        }
    }, []);

    const handleCloseModals = useCallback(() => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setShowDetailsModal(false);
        setSelectedSpace(null);
        setDeleteConfirmation(null);
    }, []);

    if (loading === 'pending' && !spaces?.length) {
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

    const handleToggleActive = async (spaceId, currentStatus) => {
        const newStatus = currentStatus === 'Disabled' ? 'Available' : 'Disabled';
        try {
            // Instead of using updateSpaceStatusAsync, we'll update through the API directly
            const response = await fetch(`/api/spaces/${spaceId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                setRefreshTrigger(prev => prev + 1);
            } else {
                throw new Error('Failed to update status');
            }
        } catch (error) {
            console.error('Error toggling space status:', error);
        }
    };

    const handleViewBookings = (spaceId) => {
        navigate(`/owner/spaces/${spaceId}/bookings`);
    };

    // Helper to get the display image (cover image or first image)
    const getSpaceImageUrl = (space) => {
        if (space.spaceImages && space.spaceImages.length > 0) {
            // First try to find cover image
            const coverImage = space.spaceImages.find(img => img.isCoverImage);
            // If no cover image, use the first image
            const imageToUse = coverImage || space.spaceImages[0];
            
            if (imageToUse && imageToUse.imageUrl) {
                const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
                let imgUrl = imageToUse.imageUrl;
                
                // If it's already a full URL (like Cloudinary), return as is
                if (imgUrl.startsWith('http')) {
                    return imgUrl;
                }
                
                // Remove any accidental /api prefix
                if (imgUrl.startsWith('/api/uploads/')) {
                    imgUrl = imgUrl.replace('/api', '');
                }
                // Always prepend baseUrl if not absolute
                const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                const cleanImgUrl = imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`;
                return `${cleanBaseUrl}${cleanImgUrl}`;
            }
        }
        // Fallback to legacy imageUrls or placeholder
        return space.imageUrls?.[0] || '/placeholder-space.jpg';
    };

    // Function to format date in a readable way
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Function to render space status badge
    const renderStatusBadge = (status) => {
        const statusConfig = SPACE_STATUSES[status] || SPACE_STATUSES.DISABLED;
        return (
            <Badge bg={statusConfig.variant}>
                {statusConfig.label}
            </Badge>
        );
    };

    const renderSpaceCard = (space) => (
        <Card className="h-100 shadow-sm">
            <Card.Img 
                variant="top" 
                src={getSpaceImageUrl(space)} 
                style={{ height: '200px', objectFit: 'cover' }}
            />
            <Card.Body>
                <Card.Title className="d-flex justify-content-between align-items-start">
                    <span>{space.name}</span>
                    {renderStatusBadge(space.status)}
                </Card.Title>
                
                <div className="mb-2">
                    <small className="text-muted d-block">
                        <FaFilter className="me-1" /> {space.type}
                    </small>
                    <small className="text-muted d-block">
                        <strong>Giá:</strong> {space.price?.toLocaleString('vi-VN')}đ/giờ
                    </small>
                    {space.nextBooking && (
                        <small className="text-primary d-block">
                            <FaCalendarAlt className="me-1" />
                            Đặt chỗ tiếp theo: {formatDate(space.nextBooking)}
                        </small>
                    )}
                    {space.currentBooking && (
                        <small className="text-success d-block">
                            Đang sử dụng bởi: {space.currentBooking.customerName}
                        </small>
                    )}
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center">
                        <FaStar className="text-warning me-1" />
                        <span>{space.rating || 0}/5</span>
                        <small className="text-muted ms-1">({space.reviewCount || 0} đánh giá)</small>
                    </div>
                    <small className="text-muted">
                        {space.viewCount || 0} lượt xem
                    </small>
                </div>

                <Card.Text className="small">{space.description}</Card.Text>
            </Card.Body>
            
            <Card.Footer className="bg-transparent">
                <div className="d-flex justify-content-between">
                    <ButtonGroup size="sm">
                        <Button
                            variant="outline-primary"
                            onClick={() => handleViewSpace(space)}
                        >
                            <FaEye className="me-1" /> Chi tiết
                        </Button>
                        <Button
                            variant="outline-info"
                            onClick={() => handleViewBookings(space.id)}
                        >
                            <FaCalendarAlt className="me-1" /> Lịch đặt
                        </Button>
                    </ButtonGroup>
                    
                    <ButtonGroup size="sm">
                        <Button
                            variant="outline-secondary"
                            onClick={() => handleEditSpace(space)}
                        >
                            <FaEdit className="me-1" /> Sửa
                        </Button>
                        <Button
                            variant={space.status === 'Disabled' ? 'outline-success' : 'outline-warning'}
                            onClick={() => handleToggleActive(space.id, space.status)}
                        >
                            {space.status === 'Disabled' ? <FaToggleOff /> : <FaToggleOn />}
                        </Button>
                        <Button
                            variant="outline-danger"
                            onClick={() => handleDeleteSpace(space.id)}
                        >
                            <FaTrash className="me-1" />
                        </Button>
                    </ButtonGroup>
                </div>
            </Card.Footer>
        </Card>
    );

    return (
        <Container className="py-4">
            {/* Statistics Section */}
            <div className="statistics-section bg-light p-3 rounded mb-4">
                <Row className="g-3">
                    <Col xs={12}>
                        <h5 className="mb-3">Tổng quan không gian</h5>
                    </Col>
                    <Col xs={6} md={2}>
                        <div className="text-center">
                            <div className="bg-white rounded p-2">
                                <h6>Tổng số</h6>
                                <h3>{statistics.total}</h3>
                            </div>
                        </div>
                    </Col>
                    <Col xs={6} md={2}>
                        <div className="text-center">
                            <div className="bg-white rounded p-2">
                                <h6>Đang hoạt động</h6>
                                <h3 className="text-success">{statistics.active}</h3>
                                <small className="text-muted">{(statistics.active / statistics.total * 100).toFixed(1)}%</small>
                            </div>
                        </div>
                    </Col>
                    <Col xs={6} md={2}>
                        <div className="text-center">
                            <div className="bg-white rounded p-2">
                                <h6>Đã đặt</h6>
                                <h3 className="text-primary">{statistics.booked}</h3>
                                <small className="text-muted">{(statistics.booked / statistics.total * 100).toFixed(1)}%</small>
                            </div>
                        </div>
                    </Col>
                    <Col xs={6} md={2}>
                        <div className="text-center">
                            <div className="bg-white rounded p-2">
                                <h6>Bảo trì</h6>
                                <h3 className="text-warning">{statistics.maintenance}</h3>
                                <small className="text-muted">{(statistics.maintenance / statistics.total * 100).toFixed(1)}%</small>
                            </div>
                        </div>
                    </Col>
                    <Col xs={6} md={2}>
                        <div className="text-center">
                            <div className="bg-white rounded p-2">
                                <h6>Đã ẩn</h6>
                                <h3 className="text-secondary">{statistics.disabled}</h3>
                                <small className="text-muted">{(statistics.disabled / statistics.total * 100).toFixed(1)}%</small>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Quản lý không gian của tôi</h2>
                <div className="d-flex gap-2">
                    <ButtonGroup>
                        <ToggleButton
                            type="radio"
                            variant="outline-primary"
                            checked={viewMode === 'grid'}
                            onChange={() => setViewMode('grid')}
                        >
                            <FaTh /> Lưới
                        </ToggleButton>
                        <ToggleButton
                            type="radio"
                            variant="outline-primary"
                            checked={viewMode === 'list'}
                            onChange={() => setViewMode('list')}
                        >
                            <FaList /> Danh sách
                        </ToggleButton>
                    </ButtonGroup>
                    <Button 
                        variant="primary" 
                        onClick={handleCreateSpace}
                    >
                        <FaPlus className="me-2" /> Thêm không gian mới
                    </Button>
                </div>
            </div>

            {/* Enhanced Filters */}
            <div className="filters-section bg-light p-3 rounded mb-4">
                <Row className="g-3">
                    <Col md={4}>
                        <InputGroup>
                            <Form.Control
                                placeholder="Tìm kiếm theo tên, địa chỉ, ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <InputGroup.Text>
                                <FaSearch />
                            </InputGroup.Text>
                        </InputGroup>
                    </Col>
                    <Col md={4}>
                        <Form.Select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            {Object.values(SPACE_STATUSES).map(status => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col md={4}>
                        <Form.Select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">Tất cả loại</option>
                            <option value="Meeting">Phòng họp</option>
                            <option value="Individual">Không gian cá nhân</option>
                            <option value="Office">Văn phòng</option>
                            <option value="Event">Không gian sự kiện</option>
                            <option value="Coworking">Không gian làm việc chung</option>
                        </Form.Select>
                    </Col>

                    <Col md={3}>
                        <Form.Select
                            value={priceRange}
                            onChange={(e) => setPriceRange(e.target.value)}
                        >
                            <option value="all">Tất cả mức giá</option>
                            <option value="0-100000">Dưới 100,000đ/giờ</option>
                            <option value="100000-200000">100,000đ - 200,000đ/giờ</option>
                            <option value="200000-500000">200,000đ - 500,000đ/giờ</option>
                            <option value="500000+">Trên 500,000đ/giờ</option>
                        </Form.Select>
                    </Col>
                    <Col md={3}>
                        <Form.Select
                            value={capacityRange}
                            onChange={(e) => setCapacityRange(e.target.value)}
                        >
                            <option value="all">Tất cả sức chứa</option>
                            <option value="1-4">1-4 người</option>
                            <option value="5-10">5-10 người</option>
                            <option value="11-20">11-20 người</option>
                            <option value="20+">Trên 20 người</option>
                        </Form.Select>
                    </Col>
                    <Col md={3}>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" id="amenities-filter">
                                Tiện ích ({amenityFilter.length})
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {['Máy chiếu', 'Wifi', 'Bảng trắng', 'TV', 'Điều hòa'].map(amenity => (
                                    <Form.Check
                                        key={amenity}
                                        type="checkbox"
                                        label={amenity}
                                        checked={amenityFilter.includes(amenity)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setAmenityFilter([...amenityFilter, amenity]);
                                            } else {
                                                setAmenityFilter(amenityFilter.filter(a => a !== amenity));
                                            }
                                        }}
                                        className="px-3 py-2"
                                    />
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                    <Col md={3}>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" id="sort-filter">
                                Sắp xếp theo
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item 
                                    active={sortBy === 'name'} 
                                    onClick={() => setSortBy('name')}
                                >
                                    Tên không gian
                                </Dropdown.Item>
                                <Dropdown.Item 
                                    active={sortBy === 'price'} 
                                    onClick={() => setSortBy('price')}
                                >
                                    Giá
                                </Dropdown.Item>
                                <Dropdown.Item 
                                    active={sortBy === 'rating'} 
                                    onClick={() => setSortBy('rating')}
                                >
                                    Đánh giá
                                </Dropdown.Item>
                                <Dropdown.Item 
                                    active={sortBy === 'views'} 
                                    onClick={() => setSortBy('views')}
                                >
                                    Lượt xem
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item 
                                    onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                                >
                                    {sortDirection === 'asc' ? 'Tăng dần' : 'Giảm dần'}
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                </Row>
            </div>

            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

            {/* Spaces Display - update the mapping to use currentItems instead of filteredSpaces */}
            {viewMode === 'grid' ? (
                <>
                    <Row xs={1} md={2} lg={3} className="g-4">
                        {currentItems.length > 0 ? (
                            currentItems.map(space => (
                                <Col key={space.id}>
                                    {renderSpaceCard(space)}
                                </Col>
                            ))
                        ) : (
                            <Col xs={12}>
                                <Alert variant="info">
                                    Không tìm thấy không gian nào. Hãy thêm không gian mới!
                                </Alert>
                            </Col>
                        )}
                    </Row>
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <Pagination>
                                <Pagination.First
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(1)}
                                />
                                <Pagination.Prev
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                />
                                {[...Array(totalPages)].map((_, index) => (
                                    <Pagination.Item
                                        key={index + 1}
                                        active={currentPage === index + 1}
                                        onClick={() => handlePageChange(index + 1)}
                                    >
                                        {index + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next
                                    disabled={currentPage === totalPages}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                />
                                <Pagination.Last
                                    disabled={currentPage === totalPages}
                                    onClick={() => handlePageChange(totalPages)}
                                />
                            </Pagination>
                        </div>
                    )}
                    <div className="text-center mt-3">
                        <Form.Select 
                            style={{ width: 'auto', display: 'inline-block' }}
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value={9}>9 mỗi trang</option>
                            <option value={18}>18 mỗi trang</option>
                            <option value={27}>27 mỗi trang</option>
                            <option value={36}>36 mỗi trang</option>
                        </Form.Select>
                    </div>
                </>
            ) : (
                <>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên không gian</th>
                                <th>Trạng thái</th>
                                <th>Loại</th>
                                <th>Giá/giờ</th>
                                <th>Sức chứa</th>
                                <th>Đánh giá</th>
                                <th>Lượt xem</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map(space => (
                                <tr key={space.id}>
                                    <td>{space.id}</td>
                                    <td>{space.name}</td>
                                    <td>{renderStatusBadge(space.status)}</td>
                                    <td>{space.type}</td>
                                    <td>{space.price?.toLocaleString('vi-VN')}đ</td>
                                    <td>{space.capacity}</td>
                                    <td>
                                        <FaStar className="text-warning me-1" />
                                        {space.rating || 0}/5 ({space.reviewCount || 0})
                                    </td>
                                    <td>{space.viewCount || 0}</td>
                                    <td>
                                        <ButtonGroup size="sm">
                                            <Button
                                                variant="outline-primary"
                                                onClick={() => handleViewSpace(space)}
                                                title="Xem chi tiết"
                                            >
                                                <FaEye />
                                            </Button>
                                            <Button
                                                variant="outline-info"
                                                onClick={() => handleViewBookings(space.id)}
                                                title="Xem lịch đặt"
                                            >
                                                <FaCalendarAlt />
                                            </Button>
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => handleEditSpace(space)}
                                                title="Chỉnh sửa"
                                            >
                                                <FaEdit />
                                            </Button>
                                            <Button
                                                variant={space.status === 'Disabled' ? 'outline-success' : 'outline-warning'}
                                                onClick={() => handleToggleActive(space.id, space.status)}
                                                title={space.status === 'Disabled' ? 'Kích hoạt' : 'Vô hiệu hóa'}
                                            >
                                                {space.status === 'Disabled' ? <FaToggleOff /> : <FaToggleOn />}
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                onClick={() => handleDeleteSpace(space.id)}
                                                title="Xóa"
                                            >
                                                <FaTrash />
                                            </Button>
                                        </ButtonGroup>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <div>
                                <Form.Select 
                                    style={{ width: 'auto' }}
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value={10}>10 mỗi trang</option>
                                    <option value={20}>20 mỗi trang</option>
                                    <option value={50}>50 mỗi trang</option>
                                    <option value={100}>100 mỗi trang</option>
                                </Form.Select>
                            </div>
                            <Pagination className="mb-0">
                                <Pagination.First
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(1)}
                                />
                                <Pagination.Prev
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                />
                                {[...Array(totalPages)].map((_, index) => (
                                    <Pagination.Item
                                        key={index + 1}
                                        active={currentPage === index + 1}
                                        onClick={() => handlePageChange(index + 1)}
                                    >
                                        {index + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next
                                    disabled={currentPage === totalPages}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                />
                                <Pagination.Last
                                    disabled={currentPage === totalPages}
                                    onClick={() => handlePageChange(totalPages)}
                                />
                            </Pagination>
                        </div>
                    )}
                </>
            )}

            {/* Create Space Modal */}
            {showCreateModal && (
                <Modal
                    show={showCreateModal}
                    onHide={handleCloseModals}
                    size="lg"
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Thêm không gian mới</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <SpaceForm 
                            onSubmit={handleFormSubmit}
                            onCancel={handleCloseModals}
                        />
                    </Modal.Body>
                </Modal>
            )}

            {/* Edit Space Modal */}
            {showEditModal && selectedSpace && (
                <Modal
                    show={showEditModal}
                    onHide={handleCloseModals}
                    size="lg"
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Chỉnh sửa không gian</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <SpaceForm 
                            initialData={selectedSpace}
                            onSubmit={handleFormSubmit}
                            onCancel={handleCloseModals}
                        />
                    </Modal.Body>
                </Modal>
            )}

            {/* View Space Details Modal */}
            {showDetailsModal && selectedSpace && (
                <Modal
                    show={showDetailsModal}
                    onHide={handleCloseModals}
                    size="lg"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Chi tiết không gian</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <SpaceDetails space={selectedSpace} />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button 
                            variant="secondary" 
                            onClick={handleCloseModals}
                            type="button"
                        >
                            Đóng
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                show={!!deleteConfirmation}
                onHide={() => setDeleteConfirmation(null)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc chắn muốn xóa không gian này không? Hành động này không thể hoàn tác.
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => setDeleteConfirmation(null)}
                        type="button"
                    >
                        Hủy
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={confirmDeleteSpace}
                        type="button"
                    >
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default OwnerSpacesPage;
