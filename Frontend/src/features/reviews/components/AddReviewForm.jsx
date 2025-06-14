// src/features/reviews/components/AddReviewForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { addNewReview, selectCreateReviewStatus, selectCreateReviewError, clearCreateReviewStatus } from '../slices/reviewSlice';

// Simple Star Rating Input Component
const StarRatingInput = ({ rating, setRating, disabled }) => {
    return (
        <div className="mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <Button
                    key={star}
                    variant="link"
                    onClick={() => !disabled && setRating(star)}
                    className={`p-1 fs-4 ${rating >= star ? 'text-warning' : 'text-secondary'}`}
                    style={{ textDecoration: 'none', boxShadow: 'none' }}
                    disabled={disabled}
                    aria-label={`Rate ${star} stars`}
                >
                    {rating >= star ? '★' : '☆'}
                </Button>
            ))}
        </div>
    );
};


const AddReviewForm = ({ spaceId, bookingId, onReviewAdded, onCancel }) => {
    const dispatch = useDispatch();
    const createStatus = useSelector(selectCreateReviewStatus);
    const createError = useSelector(selectCreateReviewError);

    const [rating, setRating] = useState(0); // 0 means not rated yet
    const [commentText, setCommentText] = useState('');
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        // Reset form when spaceId changes or on mount if shown
        setRating(0);
        setCommentText('');
        setFormErrors({});
        dispatch(clearCreateReviewStatus());
    }, [spaceId, dispatch]); // Only reset if spaceId changes

    const validateForm = () => {
        const errors = {};
        if (rating === 0) errors.rating = 'Vui lòng chọn điểm đánh giá.';
        if (commentText.trim().length > 2000) errors.commentText = 'Nội dung không quá 2000 ký tự.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        dispatch(clearCreateReviewStatus());
        dispatch(addNewReview({
            spaceId,
            bookingId: bookingId || null, // Pass bookingId if available
            rating,
            commentText: commentText.trim() || null,
        }))
            .unwrap()
            .then(() => {
                alert('Cảm ơn bạn đã gửi đánh giá!');
                if (onReviewAdded) onReviewAdded();
            })
            .catch(err => { /* Error already in Redux state */ });
    };

    return (
        <Card className="mt-3 mb-4">
            <Card.Header as="h5">Viết đánh giá của bạn</Card.Header>
            <Card.Body>
                {createStatus === 'failed' && createError && (
                    <Alert variant="danger" onClose={() => dispatch(clearCreateReviewStatus())} dismissible>
                        Lỗi gửi đánh giá: {String(createError)}
                    </Alert>
                )}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="reviewRating">
                        <Form.Label>Điểm đánh giá của bạn *</Form.Label>
                        <StarRatingInput rating={rating} setRating={setRating} disabled={createStatus === 'loading'} />
                        {formErrors.rating && <Form.Text className="text-danger">{formErrors.rating}</Form.Text>}
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="reviewCommentText">
                        <Form.Label>Nhận xét (Tùy chọn)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Chia sẻ trải nghiệm của bạn về không gian này..."
                            isInvalid={!!formErrors.commentText}
                            disabled={createStatus === 'loading'}
                        />
                        <Form.Control.Feedback type="invalid">{formErrors.commentText}</Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-flex justify-content-end">
                        {onCancel && (
                            <Button variant="outline-secondary" onClick={onCancel} className="me-2" disabled={createStatus === 'loading'}>
                                Hủy
                            </Button>
                        )}
                        <Button variant="primary" type="submit" disabled={createStatus === 'loading' || rating === 0}>
                            {createStatus === 'loading' ? <Spinner as="span" size="sm" /> : 'Gửi đánh giá'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default AddReviewForm;