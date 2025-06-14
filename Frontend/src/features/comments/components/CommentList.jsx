// src/features/comments/components/CommentList.jsx
import React, { useEffect, useState } from 'react'; // useState might not be needed if showAddCommentForm is handled differently
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import CommentItem from './CommentItem';
import AddCommentForm from './AddCommentForm';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import { selectIsAuthenticated } from '../../auth/slices/authSlice';
import {
    fetchCommentsForParent,
    setCurrentParentEntityForComments,
    selectCommentsForCurrentParent,
    selectCommentsPagination,
    selectCommentsStatus,
    selectCommentsError,
    setCommentsPage,
    selectCurrentParentEntityInfo,
    clearCurrentParentEntityForComments, // For cleanup
} from '../slices/commentSlice';

const defaultPaginationState = { PageNumber: 1, PageSize: 5, totalCount: 0, totalPages: 0 };

const CommentList = ({ parentEntityType, parentId }) => {
    const dispatch = useDispatch();

    // These selectors now refer to the *globally active* comment thread in commentSlice
    const activeParentInSlice = useSelector(selectCurrentParentEntityInfo);
    const comments = useSelector(selectCommentsForCurrentParent);
    const pagination = useSelector(selectCommentsPagination); // This will be for the activeParentInSlice
    const status = useSelector(selectCommentsStatus);         // This too
    const error = useSelector(selectCommentsError);           // And this

    const isAuthenticated = useSelector(selectIsAuthenticated);
    const [showTopLevelAddCommentForm, setShowTopLevelAddCommentForm] = useState(false);

    // Determine if *this instance* of CommentList is for the parent currently active in Redux
    const isThisListInstanceCurrentlyActiveInSlice =
        activeParentInSlice.type === parentEntityType &&
        activeParentInSlice.id === parentId;

    console.log(`[CommentList] Render for ${parentEntityType}/${parentId}. IsActiveInSlice: ${isThisListInstanceCurrentlyActiveInSlice}, SliceStatus: "${status}", SliceActiveParent: ${activeParentInSlice.type}/${activeParentInSlice.id}`);

    // Effect 1: When this component's parentId/parentEntityType props change,
    // tell Redux to make this the active parent for comments.
    useEffect(() => {
        console.log(`[CommentList E1] for ${parentEntityType}/${parentId}. Current active in slice: ${activeParentInSlice.type}/${activeParentInSlice.id}`);
        if (parentEntityType && parentId) {
            // Only dispatch if this component's target is different from what's already active in slice
            if (activeParentInSlice.type !== parentEntityType || activeParentInSlice.id !== parentId) {
                dispatch(setCurrentParentEntityForComments({ parentEntityType, parentId }));
            }
        }
        // Cleanup when this CommentList instance unmounts, if it was the active one
        return () => {
            if (activeParentInSlice.type === parentEntityType && activeParentInSlice.id === parentId) {
                // Consider if clearing is always desired or if state should persist briefly
                // dispatch(clearCurrentParentEntityForComments());
            }
        };
    }, [dispatch, parentEntityType, parentId, activeParentInSlice.type, activeParentInSlice.id]);


    // Effect 2: Fetch comments ONLY IF this component instance is for the
    // currently active parent in Redux AND the status for that parent is 'idle'.
    useEffect(() => {
        console.log(`[CommentList E2] for ${parentEntityType}/${parentId}. IsThisActive: ${isThisListInstanceCurrentlyActiveInSlice}, StatusForActive: ${status}, Page: ${pagination.PageNumber}`);
        if (isThisListInstanceCurrentlyActiveInSlice && status === 'idle') {
            console.log(`[CommentList E2] Dispatching fetchCommentsForParent for ${parentId}, Page: ${pagination.PageNumber}`);
            dispatch(fetchCommentsForParent({
                parentEntityType, // Use props for clarity
                parentId,       // Use props
                pageNumber: pagination.PageNumber, // pagination is for the active parent
                pageSize: pagination.PageSize,
            }));
        }
    }, [dispatch, parentEntityType, parentId, isThisListInstanceCurrentlyActiveInSlice, status, pagination.PageNumber, pagination.PageSize]);


    const handleLoadMore = () => {
        if (parentId && isThisListInstanceCurrentlyActiveInSlice && status !== 'loading' && pagination.PageNumber < pagination.totalPages) {
            dispatch(setCommentsPage({ parentId, pageNumber: pagination.PageNumber + 1 }));
        }
    };
    const handleTopLevelCommentAdded = () => setShowTopLevelAddCommentForm(false);

    // If this CommentList instance is not the one Redux is currently focused on,
    // render minimally or nothing, as its data (comments, status, pagination) will be stale or empty.
    // The parent <Collapse> in PostCard controls its visibility.
    if (!isThisListInstanceCurrentlyActiveInSlice) {
        // This can happen briefly when switching between posts' comment sections.
        // Returning null or a minimal placeholder is fine.
        return <div className="mt-2 py-3 text-center text-muted small">...</div>;
    }

    // --- RENDER LOGIC for the active CommentList ---
    if (status === 'loading' && comments.length === 0) {
        return (<div className="text-center py-3"><Spinner animation="border" size="sm" /> Đang tải bình luận...</div>);
    }
    if (status === 'failed' && error) {
        return <Alert variant="danger" className="mt-2 py-2 px-3">Lỗi tải bình luận: {String(error)}</Alert>;
    }

    return (
        <div className="mt-2">
            <h5 className="mb-3 visually-hidden">Bình luận ({pagination.totalCount || 0})</h5>

            {isAuthenticated && (
                <div className="mb-3">
                    {!showTopLevelAddCommentForm && (
                        <Button variant="outline-primary" size="sm" onClick={() => setShowTopLevelAddCommentForm(true)}>
                            Viết bình luận mới...
                        </Button>
                    )}
                    <Collapse in={showTopLevelAddCommentForm}>
                        <div> {/* Wrapper for Collapse */}
                            <AddCommentForm
                                parentEntityType={parentEntityType}
                                parentEntityId={parentId}
                                onCommentAdded={handleTopLevelCommentAdded}
                                onCancelReply={() => setShowTopLevelAddCommentForm(false)} // Use onCancelReply to hide form
                                isReplyForm={false} // Explicitly false for top-level
                            />
                        </div>
                    </Collapse>
                </div>
            )}
            {!isAuthenticated && !showTopLevelAddCommentForm && (
                <Alert variant="light" className="text-center small p-2">
                    Vui lòng <Link to="/login">đăng nhập</Link> để bình luận.
                </Alert>
            )}

            {(isAuthenticated || comments.length > 0 || status === 'loading') && comments.length > 0 && <hr className="my-2" />}


            {status === 'succeeded' && comments.length === 0 && (
                <p className="text-muted small text-center mt-2">Chưa có bình luận nào.</p>
            )}

            {comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} parentEntityType={parentEntityType} parentEntityId={parentId} />
            ))}

            {status === 'loading' && comments.length > 0 && (
                <div className="text-center mt-2"><Spinner animation="border" size="sm" /> Đang tải thêm...</div>
            )}

            {status === 'succeeded' && comments.length > 0 && pagination.PageNumber < pagination.totalPages && (
                <div className="text-center mt-3">
                    <Button variant="outline-secondary" size="sm" onClick={handleLoadMore}>Xem thêm bình luận</Button>
                </div>
            )}
        </div>
    );
};

export default CommentList;