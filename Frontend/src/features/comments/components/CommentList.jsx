// src/features/comments/components/CommentList.jsx
import React, { useEffect, useState, useMemo } from 'react'; // *** THÊM useMemo ***
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import CommentItem from './CommentItem';
import AddCommentForm from './AddCommentForm';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import Pagination from 'react-bootstrap/Pagination';
import { selectIsAuthenticated } from '../../auth/slices/authSlice';
// *** THÊM import cho membership check ***
import { 
    selectIsCurrentUserMemberOfCommunity,
    selectMyJoinedCommunitiesStatus 
} from '../../community/slices/communitySlice';
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

const CommentList = ({ parentEntityType, parentId, communityId }) => {
    const dispatch = useDispatch();

    // These selectors now refer to the *globally active* comment thread in commentSlice
    const activeParentInSlice = useSelector(selectCurrentParentEntityInfo);
    const comments = useSelector(selectCommentsForCurrentParent);
    const pagination = useSelector(selectCommentsPagination); // This will be for the activeParentInSlice
    const status = useSelector(selectCommentsStatus);         // This too
    const error = useSelector(selectCommentsError);           // And this

    const isAuthenticated = useSelector(selectIsAuthenticated);
    
    // *** THÊM: Kiểm tra membership nếu đây là comment trong community ***
    // Normalize communityId - convert undefined/null to null for consistent checking
    const normalizedCommunityId = communityId || null;
    
    // Memoize selector để tránh recreate và infinite calls
    const membershipSelector = useMemo(() => {
        if (!normalizedCommunityId) {
            return () => true; // No community restriction
        }
        return selectIsCurrentUserMemberOfCommunity(normalizedCommunityId);
    }, [normalizedCommunityId]);
    
    const isCurrentUserMember = useSelector(membershipSelector);
    const myJoinedCommunitiesStatus = useSelector(selectMyJoinedCommunitiesStatus);
    
    // *** STRICT: Logic membership check nghiêm ngặt hơn ***
    const canComment = isAuthenticated && (
        !normalizedCommunityId ? true : // Không có communityId -> cho phép
        (myJoinedCommunitiesStatus === 'succeeded' && isCurrentUserMember) // Có communityId -> phải fetch succeeded VÀ là member
    );
    
    // *** DEBUG: Log để kiểm tra logic (tạm tắt để giảm noise) ***
    // console.log(`[CommentList] MEMBERSHIP CHECK: communityId="${communityId}", normalizedCommunityId="${normalizedCommunityId}", isAuthenticated=${isAuthenticated}, isCurrentUserMember=${isCurrentUserMember}, myJoinedCommunitiesStatus=${myJoinedCommunitiesStatus}, canComment=${canComment}`);
    
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
                // Reset to page 1 khi vào post mới để không bị giữ trạng thái trang cũ
                dispatch(setCommentsPage({ parentId, pageNumber: 1 }));
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
    
    // Hàm xử lý chuyển trang cho phân trang số
    const handlePageChange = (pageNumber) => {
        if (parentId && isThisListInstanceCurrentlyActiveInSlice && status !== 'loading') {
            dispatch(setCommentsPage({ parentId, pageNumber }));
        }
    };
    
    // Render phân trang số tương tự như post
    const renderPagination = () => {
        if (!pagination.totalPages || pagination.totalPages <= 1) return null;
        
        let items = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, pagination.PageNumber - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);
        
        // Điều chỉnh startPage nếu cần
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        // Nút Previous
        if (pagination.PageNumber > 1) {
            items.push(
                <Pagination.Prev 
                    key="prev" 
                    onClick={() => handlePageChange(pagination.PageNumber - 1)}
                    disabled={status === 'loading'}
                />
            );
        }
        
        // Số trang đầu và ellipsis nếu cần
        if (startPage > 1) {
            items.push(
                <Pagination.Item 
                    key={1} 
                    onClick={() => handlePageChange(1)}
                    disabled={status === 'loading'}
                >
                    1
                </Pagination.Item>
            );
            if (startPage > 2) {
                items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
            }
        }
        
        // Các số trang chính
        for (let number = startPage; number <= endPage; number++) {
            items.push(
                <Pagination.Item 
                    key={number} 
                    active={number === pagination.PageNumber}
                    onClick={() => handlePageChange(number)}
                    disabled={status === 'loading'}
                >
                    {number}
                </Pagination.Item>
            );
        }
        
        // Số trang cuối và ellipsis nếu cần
        if (endPage < pagination.totalPages) {
            if (endPage < pagination.totalPages - 1) {
                items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
            }
            items.push(
                <Pagination.Item 
                    key={pagination.totalPages} 
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={status === 'loading'}
                >
                    {pagination.totalPages}
                </Pagination.Item>
            );
        }
        
        // Nút Next
        if (pagination.PageNumber < pagination.totalPages) {
            items.push(
                <Pagination.Next 
                    key="next" 
                    onClick={() => handlePageChange(pagination.PageNumber + 1)}
                    disabled={status === 'loading'}
                />
            );
        }
        
        return (
            <div className="d-flex justify-content-center align-items-center mt-3">
                <Pagination size="sm">{items}</Pagination>
            </div>
        );
    };
    
    const handleTopLevelCommentAdded = () => setShowTopLevelAddCommentForm(false);

    // If this CommentList instance is not the one Redux is currently focused on,
    // render minimally or nothing, as its data (comments, status, pagination) will be stale or empty.
    // The parent <Collapse> in PostCard controls its visibility.
    if (!isThisListInstanceCurrentlyActiveInSlice) {
        // This can happen briefly when switching between posts' comment sections.
        // Returning null or a minimal placeholder is fine.
        return <div className="mt-2 py-3 text-center text-muted small">Đang chuyển đổi...</div>;
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
            <h5 className="mb-3 visually-hidden">
                Bình luận ({status === 'succeeded' ? pagination.totalCount : (status === 'loading' ? '...' : '?')})
            </h5>

            {canComment && (
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
                                communityId={normalizedCommunityId} // *** SỬA: Dùng normalizedCommunityId ***
                            />
                        </div>
                    </Collapse>
                </div>
            )}
            {!canComment && !showTopLevelAddCommentForm && (
                <Alert variant="light" className="text-center small p-2">
                    {!isAuthenticated ? (
                        <>Vui lòng <Link to="/login">đăng nhập</Link> để bình luận.</>
                    ) : myJoinedCommunitiesStatus === 'loading' ? (
                        <>Đang kiểm tra quyền bình luận...</>
                    ) : myJoinedCommunitiesStatus === 'failed' ? (
                        <>Lỗi kiểm tra quyền bình luận. Vui lòng thử lại.</>
                    ) : normalizedCommunityId && !isCurrentUserMember ? (
                        <>Bạn cần tham gia cộng đồng để bình luận.</>
                    ) : (
                        <>Không thể bình luận lúc này.</>
                    )}
                </Alert>
            )}

            {(isAuthenticated || comments.length > 0 || status === 'loading') && comments.length > 0 && <hr className="my-2" />}

            {status === 'succeeded' && comments.length === 0 && (
                <p className="text-muted small text-center mt-2">Chưa có bình luận nào.</p>
            )}

            {comments.map(comment => (
                <CommentItem 
                    key={comment.id} 
                    comment={comment} 
                    parentEntityType={parentEntityType} 
                    parentEntityId={parentId} 
                    communityId={normalizedCommunityId} 
                    canComment={canComment}
                />
            ))}

            {status === 'loading' && comments.length > 0 && (
                <div className="text-center mt-2">
                    <Spinner animation="border" size="sm" /> Đang tải trang {pagination.PageNumber}...
                </div>
            )}

            {/* Hiển thị phân trang số thay vì nút "Xem thêm" */}
            {status === 'succeeded' && comments.length > 0 && pagination.totalPages > 1 && renderPagination()}
            
            {/* Hiển thị thông tin trang hiện tại */}
            {status === 'succeeded' && comments.length > 0 && pagination.totalPages > 0 && (
                <div className="text-center mt-2">
                    <small className="text-muted">
                        Trang {pagination.PageNumber} / {pagination.totalPages} 
                        ({pagination.totalCount} bình luận)
                    </small>
                </div>
            )}
        </div>
    );
};

export default CommentList;