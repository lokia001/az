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
import { DEFAULT_PROFILE_AVATAR } from '../../profile/services/profileApi';
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
import { selectIsAuthenticated, selectCurrentUser } from '../../auth/slices/authSlice';
import { getCachedUserInfo } from '../../../utils/userCache';
import { formatVietnameseTime } from '../../../utils/timeUtils';
import { deletePost } from '../../posts/slices/postDetailSlice';
import { 
    setActiveCommentPost, 
    clearActiveCommentPost, 
    selectActiveCommentPostId 
} from '../slices/communitySlice';

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
    
    // *** THAY ĐỔI: Sử dụng global state thay vì local state ***
    const activeCommentPostId = useSelector(selectActiveCommentPostId);
    const showComments = activeCommentPostId === post.id; // true nếu post này đang active
    
    const [authorInfo, setAuthorInfo] = useState({
        displayName: 'Đang tải...',
        avatarUrl: DEFAULT_PROFILE_AVATAR
    });
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const currentUser = useSelector(selectCurrentUser);

    // --- Reaction State ---
    const reactionData = useSelector(selectReactionSummary("Post", post.id));
    const { data: reactionSummary, status: reactionStatus } = reactionData;
    const setReactionOpStatus = useSelector(selectSetReactionStatus); // For disabling buttons during API call

    const likesCount = reactionSummary?.counts?.[REACTION_TYPES.LIKE] || 0;
    const lovesCount = reactionSummary?.counts?.[REACTION_TYPES.LOVE] || 0;
    // Add other counts similarly:
    // const hahaCount = reactionSummary?.counts?.[REACTION_TYPES.HAHA] || 0;

    const currentUserReaction = reactionSummary?.currentUserReactionType; // e.g., "Like", "Love", null

   const currentCommentingParent = useSelector(selectCurrentParentEntityInfo);
    const postIsActiveCommentParent = currentCommentingParent.type === "Post" && currentCommentingParent.id === post.id;
   

    useEffect(() => {
        if (post.id && reactionStatus === 'idle') {
            dispatch(fetchReactionSummary({ targetEntityType: "Post", targetEntityId: post.id }));
        }
    }, [dispatch, post.id, reactionStatus, isAuthenticated]); // Add isAuthenticated dependency

    // *** THÊM: Effect để handle khi active comment post thay đổi ***
    useEffect(() => {
        // Nếu comment post active thay đổi và không phải là post này
        // thì clear comment state nếu post này đang là active comment parent
        if (activeCommentPostId !== post.id && postIsActiveCommentParent) {
            console.log(`[PostCard ${post.id}] Active comment post changed to ${activeCommentPostId}, clearing comment state`);
            dispatch(clearCurrentParentEntityForComments());
        }
    }, [activeCommentPostId, post.id, postIsActiveCommentParent, dispatch]);

    // Load author info
    useEffect(() => {
        const loadAuthorInfo = async () => {
            if (post.author || post.authorUser) {
                // If we already have author info, use it
                const authorData = post.author || post.authorUser;
                setAuthorInfo({
                    displayName: authorData.fullName || authorData.username || 'Người dùng',
                    avatarUrl: authorData.avatarUrl || DEFAULT_PROFILE_AVATAR
                });
            } else if (post.authorUserId) {
                // Fetch author info from cache/API
                try {
                    const userInfo = await getCachedUserInfo(post.authorUserId);
                    setAuthorInfo(userInfo);
                } catch (error) {
                    console.warn('Failed to load author info:', error);
                    // Keep default loading state or set fallback
                    setAuthorInfo({
                        displayName: `User ${post.authorUserId.slice(-6)}`,
                        avatarUrl: `https://ui-avatars.com/api/?name=User+${post.authorUserId.slice(-6)}&size=40&background=random&color=ffffff&format=png`
                    });
                }
            } else {
                // No author info available
                setAuthorInfo({
                    displayName: 'Người dùng ẩn danh',
                    avatarUrl: DEFAULT_PROFILE_AVATAR
                });
            }
        };

        loadAuthorInfo();
    }, [post.authorUserId, post.author, post.authorUser]);

    // --- Comment Count State (same as before) ---
    // const currentCommentingParent = useSelector(selectCurrentParentEntityInfo);
    // const postIsActiveCommentParent = currentCommentingParent.type === "Post" && currentCommentingParent.id === post.id;
   
   
    const commentsDataForThisPost = useSelector(state => {
        if (postIsActiveCommentParent) {
            return { pagination: selectPostCommentsPagination(state), status: selectPostCommentsStatus(state) };
        }
        return null;
    }); // Same logic
    // Logic hiển thị số comment: chính xác khi đã load, "?" khi chưa biết
    let commentButtonText;
    const initialCount = post.initialCommentsCount;
    
    if (postIsActiveCommentParent) {
        // Nếu đang active và đã có data từ Redux
        if (commentsDataForThisPost?.status === 'loading') {
            commentButtonText = <Spinner as="span" animation="border" size="sm" />;
        } else if (commentsDataForThisPost?.status === 'succeeded') {
            // Hiển thị số chính xác từ pagination
            commentButtonText = commentsDataForThisPost.pagination.totalCount;
        } else if (commentsDataForThisPost?.status === 'failed') {
            commentButtonText = "Lỗi";
        } else if (commentsDataForThisPost?.status === 'idle' && showComments) {
            commentButtonText = <Spinner as="span" animation="border" size="sm" />;
        } else {
            // Fallback
            commentButtonText = typeof initialCount === 'number' ? initialCount : "?";
        }
    } else {
        // Chưa active: hiển thị initial count hoặc "?" nếu không biết
        if (typeof initialCount === 'number' && initialCount >= 0) {
            commentButtonText = initialCount;
        } else {
            // Nếu không có thông tin initial, hiển thị "?" để báo hiệu cần click để biết
            commentButtonText = "?";
        }
    }

    const handleToggleComments = () => {
        if (showComments) {
            // Đang mở -> đóng comment của post này
            dispatch(clearActiveCommentPost());
            if (postIsActiveCommentParent) {
                dispatch(clearCurrentParentEntityForComments());
            }
        } else {
            // Đang đóng -> mở comment của post này
            // Trước tiên set post này là active (sẽ tự động đóng post khác nếu có)
            dispatch(setActiveCommentPost(post.id));
            // Sau đó set comment parent entity
            dispatch(setCurrentParentEntityForComments({ parentEntityType: "Post", parentId: post.id }));
        }
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

    // Get author display info with better fallbacks
    const getAuthorDisplayInfo = () => {
        return {
            displayName: authorInfo.displayName,
            avatarUrl: authorInfo.avatarUrl
        };
    };

    const { displayName: authorDisplayName, avatarUrl: authorAvatar } = getAuthorDisplayInfo();
    const postTime = formatVietnameseTime(post.createdAt);

    // Check if current user can edit/delete post
    const canEditPost = () => {
        if (!isAuthenticated || !post || !currentUser) {
            console.log('[PostCard] canEditPost - missing requirements:', { 
                isAuthenticated, 
                hasPost: !!post, 
                hasCurrentUser: !!currentUser 
            });
            return false;
        }
        console.log('[PostCard] canEditPost check:', { 
            currentUser: currentUser,
            post: post,
            currentUserId: currentUser.id || currentUser.userId, 
            postAuthorUserId: post.authorUserId,
            match: (currentUser.id || currentUser.userId) === post.authorUserId 
        });
        return (currentUser.id || currentUser.userId) === post.authorUserId;
    };

    const handleDeleteClick = () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài đăng này không?')) {
            dispatch(deletePost(post.id));
        }
    };

    const reactionButtonDisabled = !isAuthenticated || setReactionOpStatus === 'loading' || reactionStatus === 'loading';

    return (
        <Card className="post-card mb-3 shadow-sm border rounded">
            <Card.Header className="d-flex align-items-center justify-content-between p-2 bg-light border-bottom">
                <div className="d-flex align-items-center">
                    <img 
                        src={authorAvatar} 
                        alt={`${authorDisplayName} Avatar`} 
                        className="rounded-circle me-2" 
                        style={{ 
                            width: '32px', 
                            height: '32px', 
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
                    <div>
                        <small className="fw-bold d-block">{authorDisplayName}</small>
                        <small className="text-muted">{postTime}</small>
                    </div>
                </div>
                <div className="d-flex align-items-center">
                    {post.isPinned && <Badge bg="warning" text="dark" className="me-1">Ghim</Badge>}
                    {post.isLocked && <Badge bg="secondary" className="me-1">Khóa</Badge>}
                    
                    {/* Quick actions for post author */}
                    {canEditPost() && (
                        <div className="ms-2">
                            <Link to={`/posts/${post.id}`} className="btn btn-outline-primary btn-sm me-1">
                                ✏️
                            </Link>
                            <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={handleDeleteClick}
                                title="Xóa bài đăng"
                            >
                                🗑️
                            </Button>
                        </div>
                    )}
                </div>
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

                {canEditPost() && (
                    <div className="ms-auto">
                        <Button variant="outline-danger" size="sm" className="me-2" onClick={handleDeleteClick}>
                            <span className="icon">🗑️</span> Xóa
                        </Button>
                        <Link to={`/edit-post/${post.id}`} className="btn btn-outline-primary btn-sm">
                            <span className="icon">✏️</span> Sửa
                        </Link>
                    </div>
                )}
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