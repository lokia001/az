// src/features/reviews/components/ReviewList.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ReviewItem from './ReviewItem';
import AddReviewForm from './AddReviewForm';
import {
    fetchReviewsForSpace,
    selectReviewsForSpace,
    selectReviewsPaginationForSpace,
    selectReviewsStatusForSpace,
    selectReviewsErrorForSpace,
    // clearReviewsForSpace, // Let's manage clearing more explicitly if needed
    setReviewsPage, // Make sure this is exported and imported if used for pagination
} from '../slices/reviewSlice'; // Ensure setReviewsPage is exported if you use it
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom'; // For login link
import { selectIsAuthenticated, selectCurrentUser } from '../../auth/slices/authSlice';

const ReviewList = ({ spaceId }) => {
    const dispatch = useDispatch();
    // Use memoized selector functions for performance optimization
    const selectReviewsForCurrentSpace = React.useCallback(
        state => selectReviewsForSpace(spaceId)(state), 
        [spaceId]
    );
    const selectPaginationForCurrentSpace = React.useCallback(
        state => selectReviewsPaginationForSpace(spaceId)(state), 
        [spaceId]
    );
    const selectStatusForCurrentSpace = React.useCallback(
        state => selectReviewsStatusForSpace(spaceId)(state), 
        [spaceId]
    );
    const selectErrorForCurrentSpace = React.useCallback(
        state => selectReviewsErrorForSpace(spaceId)(state), 
        [spaceId]
    );
    
    // Apply memoized selectors
    const reviews = useSelector(selectReviewsForCurrentSpace);
    const pagination = useSelector(selectPaginationForCurrentSpace);
    const status = useSelector(selectStatusForCurrentSpace);
    const error = useSelector(selectErrorForCurrentSpace);

    const isAuthenticated = useSelector(selectIsAuthenticated);
    const currentUser = useSelector(selectCurrentUser);
    const spaceIdRef = React.useRef(spaceId);
    const [showAddReviewForm, setShowAddReviewForm] = useState(false);

    // Fetch reviews when spaceId changes, or when page changes for the current spaceId
    useEffect(() => {
        if (!spaceId) return;
        
        // Only fetch if we're in idle status or if we previously failed and want to retry
        if (status === 'idle' || status === 'failed') {
            console.log(`[ReviewList] Fetching reviews for space: ${spaceId}, Page: ${pagination?.PageNumber || 1}, Status: ${status}`);
            dispatch(fetchReviewsForSpace({
                spaceId,
                pageNumber: pagination?.PageNumber || 1,
                pageSize: pagination?.PageSize || 5,
                forceRefresh: status === 'failed'
            }));
        }
    }, [dispatch, spaceId, status]);


    // Cleanup when the component unmounts or spaceId changes
    useEffect(() => {
        // Track if spaceId has changed
        if (spaceIdRef.current !== spaceId) {
            console.log(`[ReviewList] SpaceId changed from ${spaceIdRef.current} to ${spaceId}`);
            spaceIdRef.current = spaceId;
        }
        
        // Cleanup function for when component unmounts or spaceId changes
        return () => {
            // We could use clearReviewsForSpace here if needed for memory management
            // dispatch(clearReviewsForSpace(spaceId));
            console.log(`[ReviewList] Unmounting or spaceId changing for ${spaceId}`);
        };
    }, [spaceId, dispatch]);
    
    const handleReviewAdded = () => {
        setShowAddReviewForm(false);
        // The addNewReview thunk in reviewSlice should dispatch fetchReviewsForSpace(page 1, forceRefresh: true)
    };

    const handleLoadMoreReviews = () => {
        if (spaceId && status !== 'loading' && pagination && pagination.PageNumber < pagination.totalPages) {
            // Dispatch with spaceId and the new page number
            dispatch(setReviewsPage({ spaceId, pageNumber: pagination.PageNumber + 1 }));
        }
    };

    const currentUserHasReviewed = currentUser && reviews.some(review => review.userId === currentUser.id);
    const canPostReview = isAuthenticated && !currentUserHasReviewed;

    // --- RENDER LOGIC ---
    if (!spaceId && status === 'idle') { // No space selected yet
        return <Alert variant="info" className="mt-3 text-center">Vui lòng chọn không gian để xem đánh giá.</Alert>;
    }

    // Main loading state (usually for the first fetch)
    if (status === 'loading' && (!reviews || reviews.length === 0)) {
        return (
            <div className="text-center mt-4">
                <Spinner animation="border" size="sm" /> Đang tải đánh giá...
            </div>
        );
    }

    // Error state
    if (status === 'failed' && error) {
        return <Alert variant="danger" className="mt-3">Lỗi tải đánh giá: {String(error)}</Alert>;
    }

    // Succeeded state
    return (
        <div className="mt-3"> {/* Adjusted margin */}
            {isAuthenticated && (
                <div className="mb-3 text-end">
                    {canPostReview && !showAddReviewForm && (
                        <Button variant="outline-success" onClick={() => setShowAddReviewForm(true)}>
                            Viết đánh giá
                        </Button>
                    )}
                    {!canPostReview && !showAddReviewForm && currentUserHasReviewed && (
                        <p className="text-muted small"><em>Bạn đã đánh giá không gian này.</em></p>
                    )}
                </div>
            )}

            {showAddReviewForm && isAuthenticated && (
                <AddReviewForm
                    spaceId={spaceId}
                    // bookingId={relevantBookingId}
                    onReviewAdded={handleReviewAdded}
                    onCancel={() => setShowAddReviewForm(false)}
                />
            )}
            {!isAuthenticated && (
                <Alert variant="light" className="text-center small p-2">
                    Vui lòng <Link to="/login">đăng nhập</Link> để viết đánh giá hoặc xem tất cả đánh giá.
                </Alert>
            )}


            {status === 'succeeded' && reviews.length === 0 && (
                <p className="text-muted text-center mt-3">Chưa có đánh giá nào cho không gian này.</p>
            )}

            {reviews.map(review => (
                <ReviewItem key={review.id} review={review} />
            ))}

            {/* Loading more indicator (if already some reviews are shown) */}
            {status === 'loading' && reviews.length > 0 && (
                <div className="text-center mt-2"><Spinner animation="border" size="sm" /> Đang tải thêm...</div>
            )}

            {status === 'succeeded' && reviews.length > 0 && pagination && pagination.PageNumber < pagination.totalPages && (
                <div className="text-center mt-3">
                    <Button variant="outline-primary" size="sm" onClick={handleLoadMoreReviews}>
                        Xem thêm đánh giá
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ReviewList;