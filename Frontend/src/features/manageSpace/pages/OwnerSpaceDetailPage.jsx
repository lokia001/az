// src/features/manageSpace/pages/OwnerSpaceDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
    Container, 
    Breadcrumb, 
    Alert, 
    Spinner, 
    Button, 
    Row, 
    Col, 
    Card, 
    Badge, 
    Modal,
    Tabs,
    Tab,
    Table,
    ButtonGroup,
    Form,
    Dropdown
} from 'react-bootstrap';
import { 
    FaEdit, 
    FaTrash, 
    FaCalendarAlt, 
    FaChartBar, 
    FaUsers, 
    FaDollarSign,
    FaStar,
    FaMapMarkerAlt,
    FaClock,
    FaCamera,
    FaToggleOn,
    FaToggleOff,
    FaEye
} from 'react-icons/fa';
import { deleteSpaceAsync } from '../manageSpaceSlice';
import SpaceForm from '../components/SpaceForm';
import * as api from '../../../services/api';

// Space status configuration matching OwnerSpacesPage
const SPACE_STATUSES = {
    Available: { label: 'Trống', variant: 'success' },
    Booked: { label: 'Đang sử dụng', variant: 'primary' },
    Maintenance: { label: 'Đang bảo trì', variant: 'warning' },
    Cleaning: { label: 'Đang dọn dẹp', variant: 'info' }
};

const OwnerSpaceDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [space, setSpace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    // Get current user
    const currentUser = useSelector(state => state.auth.user);
    const authLoading = useSelector(state => state.auth.loading) || false;
    const isOwner = currentUser?.roles?.includes('Owner') || currentUser?.roles?.includes('SysAdmin');
    
    useEffect(() => {
        const loadSpaceDetail = async () => {
            try {
                setLoading(true);
                const spaceData = await api.findSpace(id);
                setSpace(spaceData);
                setError(null);
            } catch (err) {
                console.error("Error loading space details:", err);
                setError(err.message || 'Không thể tải thông tin không gian');
            } finally {
                setLoading(false);
            }
        };
        
        if (id) {
            loadSpaceDetail();
        }
    }, [id, dispatch, refreshTrigger]);
    
    // Debug logging
    useEffect(() => {
        console.log('OwnerSpaceDetailPage - User data:', {
            currentUser,
            authLoading,
            isOwner,
            userRoles: currentUser?.roles
        });
    }, [currentUser, authLoading, isOwner]);
    
    // Temporarily disable redirect to debug the issue
    /*
    // If not an owner, redirect to user view (but only after auth is loaded and user roles are available)
    useEffect(() => {
        // Only redirect if we're sure the user is not an owner and authentication is complete
        if (!authLoading && currentUser && currentUser.id) {
            // Check if user has roles and is NOT an owner
            if (currentUser.roles && Array.isArray(currentUser.roles) && !isOwner) {
                console.log('Redirecting non-owner to user view:', currentUser.roles);
                navigate(`/spaces/${id}`);
            } else if (!currentUser.roles || !Array.isArray(currentUser.roles)) {
                // If roles are not properly loaded, don't redirect yet
                console.log('User roles not properly loaded yet, waiting...');
            }
        }
    }, [currentUser, isOwner, id, navigate, authLoading]);
    */

    const handleEditSpace = () => {
        setShowEditModal(true);
    };

    const handleFormSubmit = async () => {
        // Close modal and refresh data
        setShowEditModal(false);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
    };

    const handleDeleteSpace = async () => {
        try {
            await dispatch(deleteSpaceAsync(space.id)).unwrap();
            navigate('/owner/manage-spaces');
        } catch (error) {
            console.error('Error deleting space:', error);
        }
    };

    const handleToggleStatus = async (newStatus) => {
        if (!newStatus) return;
        
        const actualCurrentStatus = getActualSpaceStatus(space);
        
        // Warning when manually setting to Booked status
        if (newStatus === 'Booked') {
            const confirmed = window.confirm(
                'Cảnh báo: Bạn đang chuyển trạng thái thành "Đang sử dụng" thủ công. ' +
                'Thông thường trạng thái này được quản lý tự động bởi hệ thống booking. ' +
                'Bạn có chắc chắn muốn tiếp tục?'
            );
            if (!confirmed) return;
        }
        
        // Don't change if it's the same status
        if (newStatus === actualCurrentStatus) {
            alert('Không gian đã ở trạng thái này rồi.');
            return;
        }
        
        try {
            console.log('Updating space status from', actualCurrentStatus, 'to', newStatus);
            
            // Use the regular space update API with complete space data but only change status
            const updatedSpace = {
                ...space,
                status: newStatus
            };
            
            await api.updateSpace(space.id, updatedSpace);
            console.log('Status update successful');
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Error toggling space status:', error);
            alert('Có lỗi xảy ra khi cập nhật trạng thái không gian');
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            Available: { label: 'Trống', variant: 'success' },
            Booked: { label: 'Đang sử dụng', variant: 'primary' },
            Maintenance: { label: 'Bảo trì', variant: 'warning' },
            Cleaning: { label: 'Đang dọn dẹp', variant: 'info' }
        };
        return configs[status] || configs.Available;
    };

    const getNextStatus = (currentStatus) => {
        switch (currentStatus) {
            case 'Available':
                return { label: 'Bảo trì', variant: 'warning' };
            case 'Maintenance':
                return { label: 'Đang dọn dẹp', variant: 'info' };
            case 'Cleaning':
                return { label: 'Trống', variant: 'success' };
            case 'Booked':
                return { label: 'Bảo trì', variant: 'warning' };
            default:
                return { label: 'Trống', variant: 'success' };
        }
    };

    const getAvailableStatuses = (currentStatus) => {
        // Return all possible statuses
        const allStatuses = [
            { value: 'Available', label: 'Trống', variant: 'success' },
            { value: 'Booked', label: 'Đang sử dụng', variant: 'primary' },
            { value: 'Maintenance', label: 'Bảo trì', variant: 'warning' },
            { value: 'Cleaning', label: 'Đang dọn dẹp', variant: 'info' }
        ];
        
        // Filter out the current status
        return allStatuses.filter(status => status.value !== currentStatus);
    };

    const getSpaceImageUrl = (space, index = 0) => {
        if (space && space.spaceImages && space.spaceImages.length > index && space.spaceImages[index].imageUrl) {
            const imgUrl = space.spaceImages[index].imageUrl;
            if (imgUrl.startsWith('http')) {
                return imgUrl;
            }
            const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
            const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            const cleanImgUrl = imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`;
            return `${cleanBaseUrl}${cleanImgUrl}`;
        }
        return '/placeholder-space.jpg';
    };

    // Helper function to calculate the actual space status based on booking state
    const getActualSpaceStatus = (space) => {
        if (!space) return 'Available';
        
        // Check if space has a current active booking (someone is checked in)
        const hasActiveBooking = space.currentBooking && space.currentBooking.status === 'CheckedIn';
        
        if (space.status === 'Maintenance') {
            return 'Maintenance';
        } else if (space.status === 'Cleaning') {
            return 'Cleaning';
        } else if (hasActiveBooking) {
            // Space is currently being used (someone checked in)
            return 'Booked';
        } else {
            // Space is available for booking
            return 'Available';
        }
    };

    if (loading || (authLoading && !currentUser)) {
        return (
            <Container className="py-4">
                <div className="text-center py-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </Spinner>
                    <p className="mt-2">Đang tải thông tin không gian...</p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-4">
                <Alert variant="danger">
                    <Alert.Heading>Có lỗi xảy ra!</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            </Container>
        );
    }

    if (!space) {
        return (
            <Container className="py-4">
                <Alert variant="warning">
                    <Alert.Heading>Không tìm thấy không gian</Alert.Heading>
                    <p>Không gian bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                </Alert>
            </Container>
        );
    }

    const actualStatus = getActualSpaceStatus(space);
    const statusConfig = getStatusConfig(actualStatus);

    return (
        <Container className="py-4">
            <Breadcrumb className="mb-4">
                <Breadcrumb.Item href="/">Trang chủ</Breadcrumb.Item>
                <Breadcrumb.Item href="/owner/manage-spaces">Quản lý không gian</Breadcrumb.Item>
                <Breadcrumb.Item active>Chi tiết không gian</Breadcrumb.Item>
            </Breadcrumb>
            
            {/* Header */}
            <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <div className="d-flex align-items-center gap-3 mb-2">
                        <h1 className="h2 mb-0">{space.name}</h1>
                        <Badge bg={statusConfig.variant}>{statusConfig.label}</Badge>
                    </div>
                    <p className="text-muted mb-0">ID: {space.id}</p>
                </div>
                <div className="d-flex gap-2">
                    {/* <Button 
                        variant="outline-info"
                        onClick={() => navigate(`/spaces/${space.id}`)}
                        title="Xem như khách hàng"
                    >
                        <FaEye className="me-1" /> Xem trước
                    </Button> */}
                    <Button 
                        variant="outline-secondary"
                        onClick={() => navigate('/owner/manage-spaces')}
                    >
                        Quay lại danh sách
                    </Button>
                </div>
            </div>

            {/* Action Buttons */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Thao tác quản lý</h5>
                                <ButtonGroup>
                                    <Button 
                                        variant="primary"
                                        onClick={handleEditSpace}
                                    >
                                        <FaEdit className="me-1" /> Chỉnh sửa
                                    </Button>
                                    <Button 
                                        variant="info"
                                        onClick={() => navigate(`/owner/spaces/${space.id}/bookings`)}
                                    >
                                        <FaCalendarAlt className="me-1" /> Quản lý booking
                                    </Button>
                                    <Dropdown>
                                        <Dropdown.Toggle variant="secondary" id="status-dropdown">
                                            <FaToggleOn className="me-1" /> Chuyển trạng thái
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {getAvailableStatuses(actualStatus).map((status) => (
                                                <Dropdown.Item 
                                                    key={status.value}
                                                    onClick={() => handleToggleStatus(status.value)}
                                                >
                                                    <Badge bg={status.variant} className="me-2">
                                                        {status.label}
                                                    </Badge>
                                                    Chuyển sang {status.label}
                                                </Dropdown.Item>
                                            ))}
                                            {getAvailableStatuses(actualStatus).length === 0 && (
                                                <Dropdown.Item disabled>
                                                    <small className="text-muted">
                                                        Không có trạng thái khác để chuyển
                                                    </small>
                                                </Dropdown.Item>
                                            )}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    <Button 
                                        variant="danger"
                                        onClick={() => setShowDeleteModal(true)}
                                    >
                                        <FaTrash className="me-1" /> Xóa
                                    </Button>
                                </ButtonGroup>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Main Content */}
            <Tabs defaultActiveKey="overview" className="mb-4">
                <Tab eventKey="overview" title="Tổng quan">
                    <Row>
                        <Col lg={8}>
                            <Card className="mb-4">
                                <Card.Body>
                                    <h5 className="card-title">Thông tin cơ bản</h5>
                                    <Row>
                                        <Col sm={6}>
                                            <Table borderless size="sm">
                                                <tbody>
                                                    <tr>
                                                        <td><strong>Loại:</strong></td>
                                                        <td>{space.type || 'N/A'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Sức chứa:</strong></td>
                                                        <td>{space.capacity || 'N/A'} người</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Giá/giờ:</strong></td>
                                                        <td>{space.pricePerHour ? `${space.pricePerHour.toLocaleString('vi-VN')}đ` : 'N/A'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Giá/ngày:</strong></td>
                                                        <td>{space.pricePerDay ? `${space.pricePerDay.toLocaleString('vi-VN')}đ` : 'N/A'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Chủ sở hữu ID:</strong></td>
                                                        <td>{space.ownerId || 'N/A'}</td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </Col>
                                        <Col sm={6}>
                                            <Table borderless size="sm">
                                                <tbody>
                                                    <tr>
                                                        <td><strong>Giờ hoạt động:</strong></td>
                                                        <td>{space.openTime || 'N/A'} - {space.closeTime || 'N/A'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Đặt tối thiểu:</strong></td>
                                                        <td>{space.minBookingDurationMinutes || 'N/A'} phút</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Đặt tối đa:</strong></td>
                                                        <td>{space.maxBookingDurationMinutes || 'N/A'} phút</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Thời gian dọn dẹp:</strong></td>
                                                        <td>{space.cleaningDurationMinutes || 'N/A'} phút</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Thời gian nghỉ:</strong></td>
                                                        <td>{space.bufferMinutes || 'N/A'} phút</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Thông báo hủy trước:</strong></td>
                                                        <td>{space.cancellationNoticeHours || 'N/A'} giờ</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Ngày tạo:</strong></td>
                                                        <td>{space.createdAt ? new Date(space.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            <Card className="mb-4">
                                <Card.Body>
                                    <h5 className="card-title">Mô tả</h5>
                                    <p>{space.description || 'Không có mô tả'}</p>
                                </Card.Body>
                            </Card>

                            <Card className="mb-4">
                                <Card.Body>
                                    <h5 className="card-title">Chính sách & Quy định</h5>
                                    <Row>
                                        <Col md={6}>
                                            <h6>Hướng dẫn vào chỗ:</h6>
                                            <p>{space.accessInstructions || 'N/A'}</p>
                                        </Col>
                                        <Col md={6}>
                                            <h6>Nội quy:</h6>
                                            <p>{space.houseRules || 'N/A'}</p>
                                        </Col>
                                    </Row>
                                    
                                    <Row className="mt-3">
                                        <Col md={12}>
                                            <h6>URL Slug:</h6>
                                            <p className="text-muted">{space.slug || 'N/A'}</p>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                            
                            <Card className="mb-4">
                                <Card.Body>                    <h5 className="card-title">Tiện ích & Dịch vụ</h5>
                    <Row>
                        <Col md={6}>
                            <h6>Tiện ích hệ thống:</h6>
                            {space.systemAmenities?.length > 0 ? (
                                <ul className="list-unstyled">
                                    {space.systemAmenities.map((amenity, index) => (
                                        <li key={index}>
                                            <span className="badge bg-primary me-2">Hệ thống</span>
                                            ✓ {amenity.name || amenity}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted">Chưa có tiện ích hệ thống nào</p>
                            )}
                            
                            <h6 className="mt-3">Tiện ích tùy chỉnh:</h6>
                            {space.customAmenities?.length > 0 ? (
                                <ul className="list-unstyled">
                                    {space.customAmenities.map((amenity, index) => (
                                        <li key={index}>
                                            <span className="badge bg-secondary me-2">Tùy chỉnh</span>
                                            ✓ {amenity.name || amenity}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted">Chưa có tiện ích tùy chỉnh nào</p>
                            )}
                        </Col>
                        <Col md={6}>
                            <h6>Dịch vụ hệ thống:</h6>
                            {space.systemServices?.length > 0 ? (
                                <ul className="list-unstyled">
                                    {space.systemServices.map((service, index) => (
                                        <li key={index}>
                                            <span className="badge bg-info me-2">Hệ thống</span>
                                            ✓ {service.name || service}
                                            {service.priceOverride && (
                                                <span className="text-muted"> - {service.priceOverride.toLocaleString('vi-VN')}đ</span>
                                            )}
                                            {service.isIncludedInBasePrice && (
                                                <span className="badge bg-success ms-1">Miễn phí</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted">Chưa có dịch vụ hệ thống nào</p>
                            )}
                            
                            <h6 className="mt-3">Dịch vụ tùy chỉnh:</h6>
                            {space.customServices?.length > 0 ? (
                                <ul className="list-unstyled">
                                    {space.customServices.map((service, index) => (
                                        <li key={index}>
                                            <span className="badge bg-warning me-2">Tùy chỉnh</span>
                                            ✓ {service.name || service}
                                            {service.price && (
                                                <span className="text-muted"> - {service.price.toLocaleString('vi-VN')}đ</span>
                                            )}
                                            {service.isIncludedInBasePrice && (
                                                <span className="badge bg-success ms-1">Miễn phí</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted">Chưa có dịch vụ tùy chỉnh nào</p>
                            )}
                        </Col>
                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={4}>
                            <Card className="mb-4">
                                <Card.Body>
                                    <h5 className="card-title d-flex align-items-center">
                                        <FaMapMarkerAlt className="me-2" />
                                        Vị trí & Địa chỉ
                                    </h5>                    <Table borderless size="sm">
                        <tbody>
                            <tr>
                                <td><strong>Địa chỉ:</strong></td>
                                <td>{space.address || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td><strong>Latitude:</strong></td>
                                <td>{space.latitude || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td><strong>Longitude:</strong></td>
                                <td>{space.longitude || 'N/A'}</td>
                            </tr>
                            {space.latitude && space.longitude && (
                                <tr>
                                    <td><strong>Tọa độ:</strong></td>
                                    <td>
                                        <small className="text-muted">
                                            {space.latitude}, {space.longitude}
                                        </small>
                                    </td>
                                </tr>
                            )}
                            <tr>
                                <td><strong>Slug:</strong></td>
                                <td>{space.slug || 'N/A'}</td>
                            </tr>
                        </tbody>
                    </Table>
                                </Card.Body>
                            </Card>

                            <Card className="mb-4">
                                <Card.Body>
                                    <h5 className="card-title d-flex align-items-center">
                                        <FaCamera className="me-2" />
                                        Hình ảnh ({space.spaceImages?.length || 0})
                                    </h5>
                                    {space.spaceImages?.length > 0 ? (
                                        <Row xs={2} className="g-2">
                                            {space.spaceImages.slice(0, 4).map((img, index) => (
                                                <Col key={index}>
                                                    <img
                                                        src={getSpaceImageUrl(space, index)}
                                                        alt={`Ảnh ${index + 1}`}
                                                        className="img-fluid rounded"
                                                        style={{ height: '80px', objectFit: 'cover', width: '100%' }}
                                                    />
                                                </Col>
                                            ))}
                                        </Row>
                                    ) : (
                                        <p className="text-muted">Chưa có hình ảnh</p>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>
            </Tabs>

            {/* Edit Space Modal */}
            {showEditModal && space && (
                <Modal
                    show={showEditModal}
                    onHide={handleCloseEditModal}
                    size="lg"
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Chỉnh sửa không gian</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <SpaceForm 
                            initialData={space}
                            onSubmit={handleFormSubmit}
                            onCancel={handleCloseEditModal}
                        />
                    </Modal.Body>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa không gian</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Bạn có chắc chắn muốn xóa không gian <strong>"{space.name}"</strong> không?</p>
                    <Alert variant="warning">
                        <small>
                            <strong>Lưu ý:</strong> Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến không gian này sẽ bị xóa vĩnh viễn.
                        </small>
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={handleDeleteSpace}>
                        Xóa không gian
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default OwnerSpaceDetailPage;
