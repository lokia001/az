import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchSpaces,
    selectManageSpaces,
    selectManageSpaceLoading,
    selectManageSpaceError,
    deleteSpaceAsync
} from '../manageSpaceSlice';
import {
    fetchAmenities,
    selectAmenities
} from '../../amenities/amenitySlice';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';

function SpaceDetails({ space: propSpace = null, isOwner = true }) {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const spaces = useSelector(selectManageSpaces);
    const loading = useSelector(selectManageSpaceLoading);
    const error = useSelector(selectManageSpaceError);
    const amenities = useSelector(selectAmenities);
    const currentUser = useSelector(state => state.auth.user);

    const [space, setSpace] = useState(propSpace);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        // If space is directly provided as prop, use it
        if (propSpace) {
            setSpace(propSpace);
            return;
        }
        
        // Otherwise, fetch spaces if needed and find the one with matching ID
        if (loading === 'idle' && spaces.length === 0) {
            dispatch(fetchSpaces());
        }
        dispatch(fetchAmenities());
    }, [dispatch, propSpace]);

    useEffect(() => {
        // Only look for space in spaces list if it wasn't provided as prop
        if (!propSpace && id) {
            const found = spaces.find(s => s.id === id);
            setSpace(found);
        }
    }, [spaces, id, propSpace]);
    
    // Check if the current user is the owner of this space
    const isSpaceOwner = space && currentUser && 
                        (currentUser.roles?.includes('Owner') || 
                         currentUser.roles?.includes('SysAdmin') ||
                         space.ownerId === currentUser.id);

    const handleDeleteClick = () => setShowDeleteModal(true);

    const confirmDelete = async () => {
        await dispatch(deleteSpaceAsync(space.id));
        setShowDeleteModal(false);
        navigate('/manage-space');
    };

    const cancelDelete = () => setShowDeleteModal(false);

    const getAmenityNames = (ids) => {
        return ids
            ?.map(id => amenities.find(a => a.id === id)?.name)
            .filter(Boolean)
            .join(', ') || 'Không có tiện ích';
    };

    if (loading === 'pending') return <div>Đang tải dữ liệu...</div>;
    if (error) return <div>Lỗi: {error}</div>;
    if (!space) return <div>Không tìm thấy không gian.</div>;

    return (
        <Container className="space-details-container py-4">
            <Card>
                <Card.Header className="bg-white border-bottom-0 pb-0">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h2 className="h3 mb-1">{space.name}</h2>
                            <p className="text-muted mb-2">
                                <i className="bi bi-geo-alt me-1"></i> {space.address}
                            </p>
                            <Badge bg={space.status === 'Available' ? 'success' : 'warning'} className="mb-3">
                                {space.status}
                            </Badge>
                        </div>
                        {isSpaceOwner && isOwner && (
                            <div className="space-actions">
                                <Button 
                                    variant="outline-primary" 
                                    size="sm" 
                                    className="me-2"
                                    onClick={() => navigate(`/owner/manage-spaces/edit/${space.id}`)}
                                >
                                    <i className="bi bi-pencil me-1"></i> Sửa
                                </Button>
                                <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={handleDeleteClick}
                                >
                                    <i className="bi bi-trash me-1"></i> Xóa
                                </Button>
                            </div>
                        )}
                    </div>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={8}>
                            <Card.Subtitle className="mb-3 text-muted">Chi tiết không gian</Card.Subtitle>
                            
                            <Row className="mb-4">
                                <Col sm={6}>
                                    <p><strong>Loại không gian:</strong> {space.type}</p>
                                    <p><strong>Sức chứa:</strong> {space.capacity} người</p>
                                    <p><strong>Giờ hoạt động:</strong> {space.openTime || '--'} - {space.closeTime || '--'}</p>
                                    <p><strong>Giá theo giờ:</strong> {space.pricePerHour?.toLocaleString() || space.basePrice?.toLocaleString()}₫</p>
                                    {space.pricePerDay && <p><strong>Giá theo ngày:</strong> {space.pricePerDay?.toLocaleString()}₫</p>}
                                </Col>
                                <Col sm={6}>
                                    <p><strong>Thời gian đặt tối thiểu:</strong> {space.minBookingDurationMinutes || 30} phút</p>
                                    <p><strong>Thời gian đặt tối đa:</strong> {space.maxBookingDurationMinutes || 1440} phút</p>
                                    <p><strong>Báo hủy trước:</strong> {space.cancellationNoticeHours || 24} giờ</p>
                                    <p><strong>Thời gian dọn dẹp:</strong> {space.cleaningDurationMinutes || 0} phút</p>
                                </Col>
                            </Row>
                            
                            <div className="mb-4">
                                <h5>Mô tả</h5>
                                <p>{space.description || '(Không có mô tả)'}</p>
                            </div>
                            
                            {(space.houseRules || space.accessInstructions) && (
                                <div className="mb-4">
                                    <h5>Hướng dẫn & Quy định</h5>
                                    {space.accessInstructions && (
                                        <div className="mb-2">
                                            <h6>Hướng dẫn vào chỗ:</h6>
                                            <p>{space.accessInstructions}</p>
                                        </div>
                                    )}
                                    {space.houseRules && (
                                        <div>
                                            <h6>Nội quy:</h6>
                                            <p>{space.houseRules}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <div className="mb-4">
                                <h5>Tiện ích</h5>
                                <p>{getAmenityNames(space.selectedSystemAmenityIds || space.systemAmenities || space.amenities)}</p>
                            </div>
                        </Col>
                        
                        <Col md={4}>
                            <Card className="mb-4">
                                <Card.Body>
                                    <h5>Vị trí</h5>
                                    <p>
                                        <strong>Địa chỉ:</strong> {space.address}<br/>
                                        {(space.latitude && space.longitude) && (
                                            <span><strong>Tọa độ:</strong> {space.latitude}, {space.longitude}</span>
                                        )}
                                    </p>
                                    {/* Placeholder for map (could be added later) */}
                                    <div 
                                        className="bg-light text-center p-5 rounded" 
                                        style={{width: '100%', height: '150px'}}
                                    >
                                        <span className="text-muted">Bản đồ vị trí</span>
                                    </div>
                                </Card.Body>
                            </Card>
                            
                            <Card>
                                <Card.Body>
                                    <h5>Hình ảnh</h5>
                                    <div className="space-images">
                                        {space.imageUrls?.length > 0 ? 
                                            <Row xs={2} className="g-2">
                                                {space.imageUrls.map((url, index) => (
                                                    <Col key={index}>
                                                        <img
                                                            src={url}
                                                            alt={`Ảnh ${index + 1}`}
                                                            className="img-fluid rounded"
                                                        />
                                                    </Col>
                                                ))}
                                            </Row>
                                            : 
                                            <p className="text-muted">Không có ảnh</p>
                                        }
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {showDeleteModal && (
                <DeleteConfirmationModal
                    space={space}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}
        </Container>
    );
}

export default SpaceDetails;
