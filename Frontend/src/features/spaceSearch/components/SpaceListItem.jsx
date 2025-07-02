// src/features/spaceSearch/components/SpaceListItem.jsx
import React from 'react';
import Card from 'react-bootstrap/Card'; // Using Card for structure, can be a div too
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button'; // For View Details button
import { Link, useNavigate } from 'react-router-dom'; // For navigation
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/slices/authSlice';
import Modal from 'react-bootstrap/Modal';
import FavoriteButton from '../../favoriteSpaces/components/FavoriteButton';

// Helper to get the display image (cover image or first image)
const getImageUrl = (space) => {
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
            const finalUrl = `${cleanBaseUrl}${cleanImgUrl}`;
            console.log('SpaceListItem getImageUrl:', { 
                spaceId: space.id, 
                coverImageId: coverImage?.id, 
                isCover: !!coverImage, 
                finalUrl 
            });
            return finalUrl;
        }
    }
    return `https://via.placeholder.com/150x100?text=${encodeURIComponent(space.name || 'Space')}`;
};

// Helper to format amenities
const formatAmenities = (space, limit = 3) => {
    const amenities = [];
    if (space.systemAmenities) {
        space.systemAmenities.forEach(am => amenities.push(am.name.replace('systemAmenityId_', '')));
    }
    if (space.customAmenities) {
        space.customAmenities.forEach(am => amenities.push(am.name));
    }
    if (amenities.length === 0) return 'Không có tiện ích nổi bật.';
    const displayed = amenities.slice(0, limit);
    let text = displayed.join(', ');
    if (amenities.length > limit) {
        text += `, +${amenities.length - limit} khác`;
    }
    return text;
};


const SpaceListItem = ({ space }) => {
    if (!space) return null;

    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const detailLink = `/spaces/${space.slug || space.id}`;
    const [showImageManager, setShowImageManager] = React.useState(false);

    // Map API type to displayable tag text if needed
    const getDisplayType = (apiType) => {
        switch (apiType) {
            case 'Individual': return 'Cá nhân';
            case 'Group': return 'Nhóm';
            case 'MeetingRoom': return 'Phòng Họp';
            case 'EntireOffice': return 'Văn phòng';
            default: return apiType;
        }
    };

    const handleCardClick = (e) => {
        // Prevent navigation if a button, link, or interactive element inside the card was clicked
        if (e.target.closest('button') || 
            e.target.closest('a') || 
            e.target.closest('.btn') ||
            e.target.closest('.favorite-btn') ||
            e.target.closest('.favorite-button') ||
            e.target.closest('[data-favorite-button]') ||
            e.target.closest('[role="button"]') ||
            e.target.closest('input') ||
            e.target.closest('select') ||
            e.target.closest('textarea')) {
            e.stopPropagation();
            return;
        }
        navigate(detailLink);
    };

    return (
        <Card className="mb-3 shadow-sm w-100"
            style={{ border: '1px solid #e0e0e0', cursor: 'pointer' }}
            onClick={handleCardClick}
        >
            <Row className="g-0">
                <Col md={3} className="d-flex align-items-center justify-content-center p-2">
                    <Image
                        src={getImageUrl(space)}
                        alt={`Hình ảnh của ${space.name}`}
                        style={{
                            width: '100%',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '0.25rem'
                        }}
                    />
                    {/* Nếu user là owner thì cho phép sửa ảnh */}
                    {user && space && user.id === space.ownerId && (
                        <div className="image-actions mt-2">
                            <Button variant="primary" size="sm" onClick={e => { e.stopPropagation(); setShowImageManager(true); }}>Quản lý ảnh</Button>
                        </div>
                    )}
                    <Modal show={showImageManager} onHide={() => setShowImageManager(false)} size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>Quản lý ảnh không gian</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        </Modal.Body>
                    </Modal>
                </Col>
                <Col md={9}>
                    <Card.Body className="d-flex flex-column h-100"> {/* Flex column for spacing */}
                        <div>
                            <Card.Title as="h5" className="mb-1">
                                {space.name || 'Không gian chưa đặt tên'}
                            </Card.Title>
                            <p className="text-muted small mb-2">{space.address || 'Chưa có địa chỉ'}</p>
                        </div>

                        <Card.Text className="small mb-2" style={{ flexGrow: 1, maxHeight: '60px', overflow: 'hidden' }}>
                            {space.description || 'Không có mô tả.'}
                        </Card.Text>

                        <div className="mb-2">
                            <Badge pill bg="primary" className="me-2">{getDisplayType(space.type)}</Badge>
                            {space.capacity && <Badge pill bg="info" className="me-2">Sức chứa: {space.capacity} người</Badge>}
                        </div>

                        <div className="mb-2">
                            <p className="mb-1 small text-muted"><strong>Tiện ích:</strong> {formatAmenities(space, 3)}</p>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-auto">
                            {space.pricePerHour != null ? (
                                <strong className="text-success fs-5">${space.pricePerHour.toFixed(2)}/giờ</strong>
                            ) : (
                                <span className="text-muted">Liên hệ giá</span>
                            )}
                            <div className="d-flex gap-2 align-items-center">
                                <FavoriteButton 
                                    spaceId={space.id} 
                                    size="sm"
                                    showCount={false}
                                    className="favorite-btn"
                                />
                                <Button as={Link} to={detailLink} variant="outline-primary" size="sm">
                                    Xem chi tiết
                                </Button>
                            </div>
                        </div>
                    </Card.Body>
                </Col>
            </Row>
        </Card>
    );
};

export default SpaceListItem;