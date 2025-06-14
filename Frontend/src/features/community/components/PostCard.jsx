// src/features/community/components/PostCard.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import Spinner from 'react-bootstrap/Spinner';
import CommentList from '../../comments/components/CommentList';
import {
    selectCommentsPagination as selectPostCommentsPagination,
    selectCommentsStatus as selectPostCommentsStatus,
    selectCurrentParentEntityInfo,
    setCurrentParentEntityForComments,
    clearCurrentParentEntityForComments,
} from '../../comments/slices/commentSlice';
import {
    fetchReactionSummary,
    setReaction,
    removeReaction,
    selectReactionSummary,
    selectSetReactionStatus,
} from '../../reactions/slices/reactionSlice';
import { selectIsAuthenticated } from '../../auth/slices/authSlice';

// Define available reaction types (as per your API spec)
const REACTION_TYPES = {
    LIKE: "Like",
    LOVE: "Love",
    HAHA: "Haha",
    WOW: "Wow",
    SAD: "Sad",
    ANGRY: "Angry",
};

const PostCard = ({ post }) => {
    const dispatch = useDispatch();
    const [showComments, setShowComments] = useState(false);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // --- Reaction State ---
    const reactionData = useSelector(selectReactionSummary("Post", post.id));
    const { data: reactionSummary, status: reactionStatus } = reactionData;
    const setReactionOpStatus = useSelector(selectSetReactionStatus); // For disabling buttons during API call

    const likesCount = reactionSummary?.counts?.[REACTION_TYPES.LIKE] || 0;
    const lovesCount = reactionSummary?.counts?.[REACTION_TYPES.LOVE] || 0;
    // Add other counts similarly:
    // const hahaCount = reactionSummary?.counts?.[REACTION_TYPES.HAHA] || 0;

    const currentUserReaction = reactionSummary?.currentUserReactionType; // e.g., "Like", "Love", null

    useEffect(() => {
        if (post.id && reactionStatus === 'idle') {
            dispatch(fetchReactionSummary({ targetEntityType: "Post", targetEntityId: post.id }));
        }
    }, [dispatch, post.id, reactionStatus]);

    // --- Comment Count State (same as before) ---
    const currentCommentingParent = useSelector(selectCurrentParentEntityInfo);
    const postIsActiveCommentParent = currentCommentingParent.type === "Post" && currentCommentingParent.id === post.id;
    const commentsDataForThisPost = useSelector(state => {
        if (postIsActiveCommentParent) {
            return { pagination: selectPostCommentsPagination(state), status: selectPostCommentsStatus(state) };
        }
        return null;
    }); // Same logic
    let commentButtonText = post.initialCommentsCount || 0;
    if (postIsActiveCommentParent) { /* ... same logic for commentButtonText ... */
        if (commentsDataForThisPost?.status === 'loading') commentButtonText = <Spinner as="span" animation="border" size="sm" />;
        else if (commentsDataForThisPost?.status === 'succeeded') commentButtonText = commentsDataForThisPost.pagination.totalCount;
        else if (commentsDataForThisPost?.status === 'failed') commentButtonText = "Lỗi";
        else if (commentsDataForThisPost?.status === 'idle' && showComments) commentButtonText = <Spinner as="span" animation="border" size="sm" />;
    }

    const handleToggleComments = () => { /* ... same as before ... */
        const newShowState = !showComments; setShowComments(newShowState);
        if (newShowState) { dispatch(setCurrentParentEntityForComments({ parentEntityType: "Post", parentId: post.id })); }
        else { if (postIsActiveCommentParent) { dispatch(clearCurrentParentEntityForComments()); } }
    };

    // *** MODIFIED: Generic Handle Reaction Click ***
    const handleReactionClick = (reactionTypeToSet) => {
        if (!isAuthenticated || setReactionOpStatus === 'loading') return;

        if (currentUserReaction === reactionTypeToSet) {
            // User is clicking the same active reaction again - so, remove it
            dispatch(removeReaction({
                targetEntityType: "Post",
                targetEntityId: post.id,
                reactionTypeToRemove: reactionTypeToSet // API expects this (can be null to remove any)
            }));
        } else {
            // User is setting a new reaction (or changing from another type)
            // POST /api/reactions handles changing if one already exists by this user for this target
            dispatch(setReaction({
                targetEntityType: "Post",
                targetEntityId: post.id,
                reactionType: reactionTypeToSet
            }));
        }
    };

    const authorDisplayName = post.authorUserId ? `User ${post.authorUserId.substring(0, 8)}...` : 'Ẩn danh';
    const authorAvatar = post.authorUserId ? `https://i.pravatar.cc/40?u=${post.authorUserId}` : `https://via.placeholder.com/40x40/777/fff?text=A`;
    const postTime = post.createdAt ? new Date(post.createdAt).toLocaleString('vi-VN') : 'Không rõ thời gian';

    const reactionButtonDisabled = !isAuthenticated || setReactionOpStatus === 'loading' || reactionStatus === 'loading';

    return (
        <Card className="post-card mb-3 shadow-sm border rounded">
            <Card.Header className="d-flex align-items-center justify-content-between p-2 bg-light border-bottom">
                <div className="d-flex align-items-center"><img src={authorAvatar} alt={`${authorDisplayName} Avatar`} className="rounded-circle me-2" style={{ width: '32px', height: '32px', objectFit: 'cover' }} /><div><small className="fw-bold d-block">{authorDisplayName}</small><small className="text-muted">{postTime}</small></div></div>
                <div>{post.isPinned && <Badge bg="warning" text="dark" className="me-1">Ghim</Badge>}{post.isLocked && <Badge bg="secondary" className="me-1">Khóa</Badge>}</div>
            </Card.Header>
            <Card.Body className="p-3">
                <Card.Title as="h5" className="mb-2"><Link to={`/posts/${post.id}`} className="text-decoration-none text-dark">{post.title || 'Bài đăng không có tiêu đề'}</Link></Card.Title>
                <Card.Text className="text-muted small">Nhấp vào tiêu đề để xem chi tiết...</Card.Text>
            </Card.Body>

            <Card.Footer className="p-2 bg-light d-flex justify-content-start align-items-center border-top">
                {/* Like Button */}
                <Button
                    variant={currentUserReaction === REACTION_TYPES.LIKE ? "primary" : "outline-secondary"}
                    size="sm"
                    className="me-2 action-btn"
                    onClick={() => handleReactionClick(REACTION_TYPES.LIKE)}
                    disabled={reactionButtonDisabled}
                >
                    <span className="icon">👍</span>
                    {/* Text changes if it's the current reaction */}
                    {currentUserReaction === REACTION_TYPES.LIKE ? 'Đã thích' : 'Thích'}
                    {likesCount > 0 && <span className="count ms-1">({likesCount})</span>}
                    {setReactionOpStatus === 'loading' && currentUserReaction === REACTION_TYPES.LIKE && <Spinner as="span" size="sm" animation="border" className="ms-1" />}
                </Button>

                {/* Love Button */}
                <Button
                    variant={currentUserReaction === REACTION_TYPES.LOVE ? "danger" : "outline-secondary"} // Example: danger variant for Love
                    size="sm"
                    className="me-2 action-btn"
                    onClick={() => handleReactionClick(REACTION_TYPES.LOVE)}
                    disabled={reactionButtonDisabled}
                >
                    <span className="icon">❤️</span>
                    {currentUserReaction === REACTION_TYPES.LOVE ? 'Đã yêu thích' : 'Yêu thích'}
                    {lovesCount > 0 && <span className="count ms-1">({lovesCount})</span>}
                    {setReactionOpStatus === 'loading' && currentUserReaction === REACTION_TYPES.LOVE && <Spinner as="span" size="sm" animation="border" className="ms-1" />}
                </Button>

                {/* Placeholder for other reaction buttons (Haha, Wow, Sad, Angry) - to be added similarly */}
                {/*
                <Button variant="outline-secondary" size="sm" className="me-2 action-btn" onClick={() => handleReactionClick(REACTION_TYPES.HAHA)} disabled={reactionButtonDisabled}>😂 Haha</Button>
                */}

                <Button variant="outline-secondary" size="sm" className="me-2 action-btn" onClick={handleToggleComments} aria-controls={`comments-for-post-${post.id}`} aria-expanded={showComments}>
                    <span className="icon">💬</span> Bình luận <span className="count">({commentButtonText})</span>
                </Button>
                <Button variant="outline-secondary" size="sm" className="action-btn">
                    <span className="icon">↪️</span> Chia sẻ
                </Button>

            </Card.Footer>
            <Collapse in={showComments}><div id={`comments-for-post-${post.id}`} className="border-top px-3 pb-2 pt-1">
                {post.id && showComments && (
                    <CommentList parentEntityType="Post" parentId={post.id} />
                )}
            </div>
            </Collapse>
        </Card>
    );
};
export default PostCard;