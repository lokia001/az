// Frontend/src/features/nearbySpaces/components/NearbySpaceCard.jsx
import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getSpaceImageUrl } from '../../../utils/imageUtils';
import FavoriteButton from '../../favoriteSpaces/components/FavoriteButton';

const NearbySpaceCard = ({ space }) => {
    const navigate = useNavigate();

    const handleCardClick = (e) => {
        // Prevent navigation if clicking on interactive elements
        if (e.target.closest('button') || e.target.closest('.favorite-button')) {
            e.stopPropagation();
            return;
        }
        navigate(`/spaces/${space.id}`);
    };

    return (
        <Card 
            className="h-100 shadow-sm hover-card"
            style={{ cursor: 'pointer' }}
            onClick={handleCardClick}
        >
            <Card.Img
                variant="top"
                src={space.coverImageUrl || getSpaceImageUrl(null, null, { width: 300, height: 200 })}
                style={{ height: '200px', objectFit: 'cover' }}
                alt={space.name}
            />
            <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="h6 mb-0 flex-grow-1">
                        {space.name || 'Không gian làm việc'}
                    </Card.Title>
                    <FavoriteButton 
                        spaceId={space.id}
                        size="sm"
                        showCount={false}
                        className="ms-2"
                    />
                </div>

                {space.address && (
                    <Card.Text className="text-muted small mb-2">
                        📍 {space.address}
                    </Card.Text>
                )}

                <div className="mb-2">
                    <Badge bg="primary" className="me-2">{space.type}</Badge>
                    <Badge bg="info" className="me-2">Sức chứa: {space.capacity}</Badge>
                    <Badge bg="success">📍 {space.distanceKm} km</Badge>
                </div>

                {space.pricePerHour && (
                    <Card.Text className="text-primary fw-bold mb-2">
                        {space.pricePerHour.toLocaleString()} VNĐ/giờ
                    </Card.Text>
                )}

                {space.description && (
                    <Card.Text className="text-muted small mt-auto" style={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical' 
                    }}>
                        {space.description}
                    </Card.Text>
                )}

                {(space.averageRating || space.reviewCount > 0) && (
                    <div className="mt-2">
                        <small className="text-muted">
                            ⭐ {space.averageRating?.toFixed(1) || 'N/A'} ({space.reviewCount} đánh giá)
                        </small>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default NearbySpaceCard;
