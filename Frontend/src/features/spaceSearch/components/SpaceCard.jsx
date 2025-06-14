// src/features/spaceSearch/components/SpaceCard.jsx
import React from 'react';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
// import { Link } from 'react-router-dom'; // If you have detail pages

const SpaceCard = ({ space }) => {
    if (!space) return null;

    return (
        <Card className="mb-3 shadow-sm">
            {/* <Card.Img variant="top" src={space.spaceImages?.[0]?.url || 'https://via.placeholder.com/300x200?text=Space+Image'} alt={space.name} /> */}
            <Card.Body>
                <Card.Title as="h5">{space.name || 'Không gian chưa đặt tên'}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                    {space.address || 'Chưa có địa chỉ'}
                </Card.Subtitle>
                <Card.Text style={{ minHeight: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {space.description || 'Không có mô tả.'}
                </Card.Text>
                <div>
                    <Badge bg="info" className="me-2 mb-1">{space.type || 'N/A'}</Badge>
                    <Badge bg="secondary" className="me-2 mb-1">Sức chứa: {space.capacity || 'N/A'}</Badge>
                    {space.pricePerHour != null && <Badge bg="success" className="me-2 mb-1">Giá/giờ: ${space.pricePerHour}</Badge>}
                </div>
                {/* <Link to={`/spaces/${space.slug || space.id}`} className="btn btn-primary mt-2">Xem chi tiết</Link> */}
            </Card.Body>
            {(space.systemAmenities?.length > 0 || space.customAmenities?.length > 0) && (
                <Card.Footer className="text-muted small">
                    Tiện ích nổi bật:
                    {space.systemAmenities?.slice(0, 2).map(am => am.name.replace('systemAmenityId_', '')).join(', ')}
                    {space.systemAmenities?.length > 0 && space.customAmenities?.length > 0 && ', '}
                    {space.customAmenities?.slice(0, 2).map(am => am.name).join(', ')}
                    {(space.systemAmenities?.length + space.customAmenities?.length) > 2 && '...'}
                </Card.Footer>
            )}
        </Card>
    );
};

export default SpaceCard;