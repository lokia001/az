// src/features/comments/components/CommentItem.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Alert from 'react-bootstrap/Alert';
import AddCommentForm from './AddCommentForm';
import { fetchRepliesForComment, toggleRepliesVisibility, updateComment, deleteComment, clearUpdateStatus, clearDeleteStatus } from '../slices/commentSlice';
import { selectIsAuthenticated, selectCurrentUser } from '../../auth/slices/authSlice';
import { getCachedUserInfo } from '../../../utils/userCache';
import { formatVietnameseTime } from '../../../utils/timeUtils';
import { DEFAULT_PROFILE_AVATAR } from '../../profile/services/profileApi';
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

const CommentItem = ({ comment, parentEntityType, parentEntityId, communityId, canComment }) => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const currentUser = useSelector(selectCurrentUser);
    const [showReplyForm, setShowReplyForm] = useState(false);

    // REPLY PAGINATION STATE - Cách đơn giản nhất
    const [visibleRepliesCount, setVisibleRepliesCount] = useState(3); // Hiển thị 3 reply đầu tiên
    const REPLIES_INCREMENT = 5; // Mỗi lần "Xem thêm" load thêm 5 reply

    // Author info state (same logic as PostCard)
    const [authorInfo, setAuthorInfo] = useState({
        displayName: 'Đang tải...',
        avatarUrl: DEFAULT_PROFILE_AVATAR
    });

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content || '');

    // Selectors for update/delete status
    const updateStatus = useSelector((state) => state.comments.updateStatus);
    const updateError = useSelector((state) => state.comments.updateError);
    const deleteStatus = useSelector((state) => state.comments.deleteStatus);
    const deleteError = useSelector((state) => state.comments.deleteError);

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
    }, [dispatch, comment.id, reactionStatus, isAuthenticated]); // Add isAuthenticated dependency

    // Load author info effect (same logic as PostCard)
    useEffect(() => {
        const loadAuthorInfo = async () => {
            if (!comment) return;
            
            if (comment.author || comment.authorUser) {
                // If we already have author info, use it
                const authorData = comment.author || comment.authorUser;
                setAuthorInfo({
                    displayName: authorData.fullName || authorData.username || 'Người dùng',
                    avatarUrl: authorData.avatarUrl || DEFAULT_PROFILE_AVATAR
                });
            } else if (comment.userId || comment.authorUserId) {
                // Fetch author info from cache/API
                try {
                    const userId = comment.userId || comment.authorUserId;
                    const userInfo = await getCachedUserInfo(userId);
                    setAuthorInfo(userInfo);
                } catch (error) {
                    console.warn('Failed to load comment author info:', error);
                    // Fallback
                    const userId = comment.userId || comment.authorUserId;
                    setAuthorInfo({
                        displayName: comment.authorName || `User ${userId.slice(-6)}`,
                        avatarUrl: `https://ui-avatars.com/api/?name=User+${userId.slice(-6)}&size=30&background=random&color=ffffff&format=png`
                    });
                }
            } else {
                // No author info available
                setAuthorInfo({
                    displayName: comment.authorName || 'Người dùng ẩn danh',
                    avatarUrl: DEFAULT_PROFILE_AVATAR
                });
            }
        };

        loadAuthorInfo();
    }, [comment]);

    const handleToggleReplies = () => {
        dispatch(toggleRepliesVisibility(comment.id)); // Toggle local showReplies flag
        // If we want to show replies and they haven't been loaded yet (and there are replies to load)
        if (!comment.showReplies && !comment.replies?.length && comment.replyCount > 0) {
            console.log(`[CommentItem] Fetching replies for comment ${comment.id}`);
            dispatch(fetchRepliesForComment(comment.id));
        }
    };

    // Hàm load thêm reply (cách đơn giản)
    const handleLoadMoreReplies = () => {
        setVisibleRepliesCount(prev => prev + REPLIES_INCREMENT);
    };

    // Hàm reset reply count khi thu gọn
    const handleCollapseReplies = () => {
        dispatch(toggleRepliesVisibility(comment.id));
        setVisibleRepliesCount(3); // Reset về 3 reply đầu tiên
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

    // Check if current user can edit/delete comment
    const canEditComment = () => {
        if (!isAuthenticated || !comment || !currentUser) return false;
        return (currentUser.id || currentUser.userId) === (comment.userId || comment.authorUserId);
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setEditContent(comment.content || '');
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent(comment.content || '');
        dispatch(clearUpdateStatus());
    };

    const handleSaveEdit = () => {
        if (!editContent.trim()) {
            alert('Nội dung bình luận không được để trống.');
            return;
        }
        dispatch(updateComment({
            commentId: comment.id,
            updateData: { content: editContent.trim() }
        }));
    };

    const handleDeleteClick = () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.')) {
            dispatch(deleteComment(comment.id));
        }
    };

    // Effect to handle successful update
    useEffect(() => {
        if (updateStatus === 'succeeded') {
            setIsEditing(false);
            dispatch(clearUpdateStatus());
        }
    }, [updateStatus, dispatch]);

    const reactionButtonDisabled = !isAuthenticated || setReactionOpStatus === 'loading' || reactionStatus === 'loading';
    const commentTime = formatVietnameseTime(comment.createdAt);

    return (
        <div className={`comment-item-wrapper d-flex mb-3 ${comment.parentCommentId ? 'is-reply ms-md-4 ms-3' : 'is-top-level'}`}>
            <img 
                src={authorInfo.avatarUrl} 
                alt={`${authorInfo.displayName} avatar`} 
                className="rounded-circle" 
                style={{ 
                    width: '30px', 
                    height: '30px', 
                    marginRight: '10px', 
                    marginTop: '5px',
                    objectFit: 'cover',
                    border: '1px solid #dee2e6'
                }}
                onError={(e) => {
                    // Fallback if avatar fails to load
                    if (e.target.src !== DEFAULT_PROFILE_AVATAR) {
                        e.target.src = DEFAULT_PROFILE_AVATAR;
                    }
                }}
            />

            <div className="comment-content-wrapper flex-grow-1">
                <div className="comment-bubble bg-light p-2 rounded border"> 
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="fw-bold text-dark">{authorInfo.displayName}</small>
                        <small className="text-muted">{commentTime}</small>
                    </div>
                    {!isEditing ? (
                        <p className="mb-1" style={{ whiteSpace: 'pre-line' }}>{comment.content}</p>
                    ) : (
                        <Form.Control
                            as="textarea"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                            className="mb-1"
                            style={{ resize: 'none' }}
                        />
                    )}
                </div>
                <div className="comment-actions mt-1 d-flex align-items-center">
                    {/* Reaction buttons */}
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

                    {/* Love Button for Comment */}
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

                    {/* Reply button */}
                    {canComment && (
                        <Button 
                            variant="link" 
                            size="sm" 
                            className="text-muted p-0 me-2" 
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            disabled={isEditing}
                        >
                            {showReplyForm ? 'Hủy' : 'Trả lời'}
                        </Button>
                    )}

                    {/* Show replies button */}
                    {comment.replyCount > 0 && (
                        <Button 
                            variant="link" 
                            size="sm" 
                            className="text-muted p-0 me-2" 
                            onClick={comment.showReplies ? handleCollapseReplies : handleToggleReplies}
                            disabled={isEditing}
                        >
                            {comment.showReplies ? 'Ẩn' : 'Xem'} {comment.replyCount} trả lời 
                            {comment.repliesLoading && <Spinner animation="border" size="sm" className="ms-1" />}
                        </Button>
                    )}

                    {/* Edit/Delete buttons for comment author */}
                    {canEditComment() && (
                        <div className="ms-auto">
                            {!isEditing ? (
                                <ButtonGroup size="sm">
                                    <Button 
                                        variant="outline-primary" 
                                        onClick={handleEditClick}
                                        disabled={updateStatus === 'loading' || deleteStatus === 'loading'}
                                    >
                                        ✏️ Sửa
                                    </Button>
                                    <Button 
                                        variant="outline-danger" 
                                        onClick={handleDeleteClick}
                                        disabled={updateStatus === 'loading' || deleteStatus === 'loading'}
                                    >
                                        {deleteStatus === 'loading' && <Spinner as="span" size="sm" animation="border" className="me-1" />}
                                        🗑️ Xóa
                                    </Button>
                                </ButtonGroup>
                            ) : (
                                <ButtonGroup size="sm">
                                    <Button 
                                        variant="success" 
                                        onClick={handleSaveEdit}
                                        disabled={updateStatus === 'loading'}
                                    >
                                        {updateStatus === 'loading' && <Spinner as="span" size="sm" animation="border" className="me-1" />}
                                        💾 Lưu
                                    </Button>
                                    <Button 
                                        variant="secondary" 
                                        onClick={handleCancelEdit}
                                        disabled={updateStatus === 'loading'}
                                    >
                                        ✖️ Hủy
                                    </Button>
                                </ButtonGroup>
                            )}
                        </div>
                    )}

                    {/* Error display for update/delete */}
                    {(updateStatus === 'failed' || deleteStatus === 'failed') && (
                        <Alert variant="danger" className="mt-2 mb-0">
                            {updateError || deleteError || 'Có lỗi xảy ra.'}
                        </Alert>
                    )}
                </div>
                {showReplyForm && canComment && (<div className="reply-form-container mt-2"><AddCommentForm parentEntityType={parentEntityType} parentEntityId={parentEntityId} parentCommentIdForReply={comment.id} onCommentAdded={handleReplyAdded} onCancelReply={() => setShowReplyForm(false)} isReplyForm={true} communityId={communityId} /></div>
                )}
                <Collapse in={comment.showReplies}>
                    <div className="mt-2">
                        {comment.repliesLoading && !comment.replies?.length && <div className="ms-4"><Spinner size="sm" /> Đang tải trả lời...</div>}
                        {comment.replies && comment.replies.slice(0, visibleRepliesCount).map(reply => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                parentEntityType={parentEntityType} // Pass down original parent info
                                parentEntityId={parentEntityId} // Pass down original parent info
                                communityId={communityId} // *** THÊM ***
                                canComment={canComment} // *** THÊM ***
                            />
                        ))}
                        
                        {/* Nút "Xem thêm reply" - Cách đơn giản nhất */}
                        {comment.replies && comment.replies.length > visibleRepliesCount && (
                            <div className="ms-4 mt-2">
                                <Button 
                                    variant="outline-secondary" 
                                    size="sm"
                                    onClick={handleLoadMoreReplies}
                                >
                                    Xem thêm {Math.min(REPLIES_INCREMENT, comment.replies.length - visibleRepliesCount)} trả lời
                                </Button>
                                <small className="text-muted ms-2">
                                    ({visibleRepliesCount}/{comment.replies.length})
                                </small>
                            </div>
                        )}
                        
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