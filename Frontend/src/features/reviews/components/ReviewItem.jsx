// src/features/reviews/components/ReviewItem.jsx
import React from 'react';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';

// Placeholder StarRating component (can be imported from a shared location later
import StarRatingDisplay from '../../../components/common/StarRatingDisplay'; // <-- IMPORT

const ReviewItem = ({ review }) => {
    // Assuming review.userId is available. Fetching full user details for each review is often too much for a list.
    // You might have a way to get basic author info (name, avatar) if the ReviewDto is enriched by backend.
    // For now, using placeholders.
    const authorName = `User ${review.userId.substring(0, 6)}...`;
    const authorAvatar = `https://i.pravatar.cc/40?u=${review.userId}`;

    return (
        <Card className="mb-3">
            <Card.Body>
                <div className="d-flex align-items-start mb-2">
                    <Image src={authorAvatar} roundedCircle width={40} height={40} className="me-3" />
                    <div>
                        <Card.Title as="h6" className="mb-0">{authorName}</Card.Title>
                        <StarRatingDisplay rating={review.rating} size="sm" />
                    </div>
                    <small className="text-muted ms-auto">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</small>
                </div>
                {review.commentText && (
                    <Card.Text style={{ whiteSpace: 'pre-line' }}>{review.commentText}</Card.Text>
                )}
                {review.bookingId && <small className="text-muted d-block mt-2">Từ đặt chỗ: ...{review.bookingId.substring(0, 8)}</small>}
            </Card.Body>
            {/* Add Edit/Delete buttons here later if currentUser.id === review.userId */}
        </Card>
    );
};

export default ReviewItem;