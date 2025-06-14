// src/features/comments/components/CommentItem.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'react-bootstrap/Image';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import Spinner from 'react-bootstrap/Spinner';
import AddCommentForm from './AddCommentForm';
import { fetchRepliesForComment, toggleRepliesVisibility } from '../slices/commentSlice';
import { selectIsAuthenticated } from '../../auth/slices/authSlice';
import {
    fetchReactionSummary,
    setReaction,
    removeReaction,
    selectReactionSummary,
    selectSetReactionStatus,
} from '../../reactions/slices/reactionSlice';

// Define available reaction types (as per your API spec)
const REACTION_TYPES = {
    LIKE: "Like",
    LOVE: "Love",
    // HAHA: "Haha", WOW: "Wow", SAD: "Sad", ANGRY: "Angry" // Add others later
};

const CommentItem = ({ comment, parentEntityType, parentEntityId }) => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const [showReplyForm, setShowReplyForm] = useState(false);

    // --- Reaction State for THIS comment ---
    const reactionData = useSelector(selectReactionSummary("Comment", comment.id));
    const { data: reactionSummary, status: reactionStatus } = reactionData;
    const setReactionOpStatus = useSelector(selectSetReactionStatus);

    const likesCount = reactionSummary?.counts?.[REACTION_TYPES.LIKE] || 0;
    const lovesCount = reactionSummary?.counts?.[REACTION_TYPES.LOVE] || 0;
    const currentUserReaction = reactionSummary?.currentUserReactionType;

    useEffect(() => {
        if (comment.id && reactionStatus === 'idle') {
            dispatch(fetchReactionSummary({ targetEntityType: "Comment", targetEntityId: comment.id }));
        }
    }, [dispatch, comment.id, reactionStatus]);

    const authorDisplayName = comment.userId ? `User ${comment.userId.substring(0, 8)}...` : 'Ẩn danh';
    const authorAvatar = comment.userId ? `https://i.pravatar.cc/30?u=${comment.userId}` : `https://via.placeholder.com/30x30/777/fff?text=A`;

    const handleToggleReplies = () => {
        dispatch(toggleRepliesVisibility(comment.id)); // Toggle local showReplies flag
        // If we want to show replies and they haven't been loaded yet (and there are replies to load)
        if (!comment.showReplies && !comment.replies?.length && comment.replyCount > 0) {
            console.log(`[CommentItem] Fetching replies for comment ${comment.id}`);
            dispatch(fetchRepliesForComment(comment.id));
        }
    };
    const handleReplyAdded = () => {
        setShowReplyForm(false); // Close reply form
        // Replies list will update via fetchRepliesForComment or if addNewComment re-fetches parent's replies
        // For simplicity, if a reply is added, we might want to ensure replies are visible and re-fetched.
        if (!comment.showReplies) {
            dispatch(toggleRepliesVisibility(comment.id)); // Make sure replies section is open
        }
        dispatch(fetchRepliesForComment(comment.id));
    };

    // *** MODIFIED: Generic Handle Reaction Click for Comment ***
    const handleReactionClick = (reactionTypeToSet) => {
        if (!isAuthenticated || setReactionOpStatus === 'loading') return;

        if (currentUserReaction === reactionTypeToSet) {
            dispatch(removeReaction({
                targetEntityType: "Comment",
                targetEntityId: comment.id,
                reactionTypeToRemove: reactionTypeToSet
            }));
        } else {
            dispatch(setReaction({
                targetEntityType: "Comment",
                targetEntityId: comment.id,
                reactionType: reactionTypeToSet
            }));
        }
    };

    const reactionButtonDisabled = !isAuthenticated || setReactionOpStatus === 'loading' || reactionStatus === 'loading';

    return (
        <div className={`comment-item-wrapper d-flex mb-3 ${comment.parentCommentId ? 'is-reply ms-md-4 ms-3' : 'is-top-level'}`}>
            <Image src={authorAvatar} alt={`${authorDisplayName} avatar`} roundedCircle style={{ width: '30px', height: '30px', marginRight: '10px', marginTop: '5px' }} />

            <div className="comment-content-wrapper flex-grow-1">
                <div className="comment-bubble bg-light p-2 rounded border"> <div className="d-flex justify-content-between align-items-center mb-1">
                    <small className="fw-bold text-dark">{authorDisplayName}</small>
                    <small className="text-muted">{new Date(comment.createdAt).toLocaleString('vi-VN')}</small>
                </div>
                    <p className="mb-1" style={{ whiteSpace: 'pre-line' }}>{comment.content}</p>
                </div>
                <div className="comment-actions mt-1">
                    {/* Like Button for Comment */}
                    {isAuthenticated && (
                        <Button
                            variant={currentUserReaction === REACTION_TYPES.LIKE ? "link" : "link"}
                            size="sm"
                            className={`text-muted p-0 me-2 ${currentUserReaction === REACTION_TYPES.LIKE ? 'text-primary fw-bold' : ''}`}
                            onClick={() => handleReactionClick(REACTION_TYPES.LIKE)}
                            disabled={reactionButtonDisabled}
                        >
                            <span className="icon">👍</span> {currentUserReaction === REACTION_TYPES.LIKE ? 'Đã thích' : 'Thích'}
                            {likesCount > 0 && (<span className="ms-1">({likesCount})</span>)}
                            {setReactionOpStatus === 'loading' && currentUserReaction !== REACTION_TYPES.LIKE && <Spinner animation="border" size="sm" className="ms-1" />}
                        </Button>
                    )}

                    {/* *** NEW: Love Button for Comment *** */}
                    {isAuthenticated && (
                        <Button
                            variant={currentUserReaction === REACTION_TYPES.LOVE ? "link" : "link"}
                            size="sm"
                            className={`text-muted p-0 me-2 ${currentUserReaction === REACTION_TYPES.LOVE ? 'text-danger fw-bold' : ''}`}
                            onClick={() => handleReactionClick(REACTION_TYPES.LOVE)}
                            disabled={reactionButtonDisabled}
                        >
                            <span className="icon">❤️</span> {currentUserReaction === REACTION_TYPES.LOVE ? 'Đã yêu thích' : 'Yêu thích'}
                            {lovesCount > 0 && (<span className="ms-1">({lovesCount})</span>)}
                            {setReactionOpStatus === 'loading' && currentUserReaction !== REACTION_TYPES.LOVE && <Spinner animation="border" size="sm" className="ms-1" />}
                        </Button>
                    )}

                    {isAuthenticated && (<Button variant="link" size="sm" className="text-muted p-0 me-2" onClick={() => setShowReplyForm(!showReplyForm)}>{showReplyForm ? 'Hủy' : 'Trả lời'}</Button>)}
                    {comment.replyCount > 0 && (<Button variant="link" size="sm" className="text-muted p-0" onClick={handleToggleReplies}>{comment.showReplies ? 'Ẩn' : 'Xem'} {comment.replyCount} trả lời {comment.repliesLoading && <Spinner animation="border" size="sm" className="ms-1" />}</Button>)}
                </div>
                {showReplyForm && isAuthenticated && (<div className="reply-form-container mt-2"><AddCommentForm parentEntityType={parentEntityType} parentEntityId={parentEntityId} parentCommentIdForReply={comment.id} onCommentAdded={handleReplyAdded} onCancelReply={() => setShowReplyForm(false)} isReplyForm={true} /></div>
                )}
                <Collapse in={comment.showReplies}>
                    <div className="mt-2">
                        {comment.repliesLoading && !comment.replies?.length && <div className="ms-4"><Spinner size="sm" /> Đang tải trả lời...</div>}
                        {comment.replies && comment.replies.map(reply => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                parentEntityType={parentEntityType} // Pass down original parent info
                                parentEntityId={parentEntityId} // Pass down original parent info
                            />
                        ))}
                        {comment.showReplies && comment.replies?.length === 0 && comment.replyCount > 0 && !comment.repliesLoading && (
                            <small className="text-muted ms-4">Không tải được trả lời hoặc không có.</small>
                        )}
                    </div>
                </Collapse>
            </div>
        </div>
    );
};
export default CommentItem;