// src/pages/PostDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Image from 'react-bootstrap/Image';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import {
    fetchPostDetail,
    updatePost,
    deletePost,
    clearPostDetail,
    clearUpdateStatus,
    clearDeleteStatus,
} from '../features/posts/slices/postDetailSlice';

// *** THÊM import cho community membership ***
import { 
    fetchMyJoinedCommunities,
    selectMyJoinedCommunities,
    selectMyJoinedCommunitiesStatus 
} from '../features/community/slices/communitySlice';

import CommentList from '../features/comments/components/CommentList';
import { getCachedUserInfo } from '../utils/userCache';
import { formatVietnameseTime } from '../utils/timeUtils';
import { DEFAULT_PROFILE_AVATAR } from '../features/profile/services/profileApi';

// IMPORT REACTION ACTIONS AND SELECTORS
import {
    fetchReactionSummary,
    setReaction,
    removeReaction,
    selectReactionSummary,
    selectSetReactionStatus, // To disable button while liking/unliking
} from '../features/reactions/slices/reactionSlice'; // Adjust path if needed
import { selectIsAuthenticated, selectCurrentUser } from '../features/auth/slices/authSlice';
import { 
    setActiveCommentPost, 
    clearActiveCommentPost 
} from '../features/community/slices/communitySlice';

// Helper for post image URL (same as before)
const getPostImageUrl = (urlPath) => {
    if (!urlPath) return null;
    if (urlPath.startsWith('http')) return urlPath;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    return `${baseUrl}${urlPath.startsWith('/') ? urlPath : '/' + urlPath}`;
};

// Define available reaction types (as per your API spec)
const REACTION_TYPES = {
    LIKE: "Like",
    LOVE: "Love",
    HAHA: "Haha",
    WOW: "Wow",
    SAD: "Sad",
    ANGRY: "Angry",
};


function PostDetailPage() {
    const { postId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Author info state (same as PostCard)
    const [authorInfo, setAuthorInfo] = useState({
        displayName: 'Đang tải...',
        avatarUrl: DEFAULT_PROFILE_AVATAR
    });
    
    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        title: '',
        content: ''
    });

    const post = useSelector((state) => state.postDetail.post);
    const loading = useSelector((state) => state.postDetail.loading);
    const error = useSelector((state) => state.postDetail.error);
    const updateStatus = useSelector((state) => state.postDetail.updateStatus);
    const deleteStatus = useSelector((state) => state.postDetail.deleteStatus);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const currentUser = useSelector(selectCurrentUser);
    
    // *** THÊM: Community membership state ***
    const myJoinedCommunities = useSelector(selectMyJoinedCommunities);
    const myJoinedCommunitiesStatus = useSelector(selectMyJoinedCommunitiesStatus);

    // Derived status to avoid creating new objects
    const status = loading ? 'loading' : error ? 'failed' : 'succeeded';

    // --- REACTION STATE for the current post ---
    // We use post.id once 'post' is loaded.
    const reactionData = useSelector(selectReactionSummary("Post", post?.id)); // Pass post.id only when post is available
    const { data: reactionSummary, status: reactionStatusForPost } = reactionData; // Renamed reactionStatus to avoid clash
    const setReactionOpStatus = useSelector(selectSetReactionStatus);

    const likesCount = reactionSummary?.counts?.[REACTION_TYPES.LIKE] || 0;
    const lovesCount = reactionSummary?.counts?.[REACTION_TYPES.LOVE] || 0;
    // Add other counts (hahaCount, wowCount, etc.) if you implement more buttons
    const currentUserReaction = reactionSummary?.currentUserReactionType;


    // Effect 1: Fetch post details
    useEffect(() => {
        if (postId) {
            console.log(`[PostDetailPage] Fetching details for post ID: ${postId}`);
            console.log(`[PostDetailPage] Current loading: ${loading}, post exists: ${!!post}, post.id: ${post?.id}`);
            
            // Clear previous post if we're loading a different one
            if (post && post.id !== postId) {
                console.log(`[PostDetailPage] Clearing previous post (${post.id}) before fetching new one (${postId})`);
                dispatch(clearPostDetail());
            }
            
            // Always fetch if we don't have the right post 
            if (!post || post.id !== postId) {
                console.log(`[PostDetailPage] Dispatching fetchPostDetail for ${postId}`);
                dispatch(fetchPostDetail(postId));
            }
        }
        return () => {
            console.log('[PostDetailPage] Unmounting, clearing current post detail.');
            dispatch(clearPostDetail()); // Clear post detail when leaving the page
            dispatch(clearActiveCommentPost()); // Clear active comment post when leaving
        };
    }, [dispatch, postId]); // Simplified dependencies

    // Effect 1.5: Set active comment post for this page
    useEffect(() => {
        if (post && post.id) {
            console.log(`[PostDetailPage] Setting active comment post to ${post.id}`);
            dispatch(setActiveCommentPost(post.id));
        }
    }, [dispatch, post]);

    // *** THÊM: Effect để fetch myJoinedCommunities cho membership check ***
    useEffect(() => {
        // Chỉ fetch nếu chưa bao giờ fetch (status = 'idle') và đã authenticated
        if (isAuthenticated && myJoinedCommunitiesStatus === 'idle') {
            console.log('[PostDetailPage] Fetching myJoinedCommunities for membership check');
            dispatch(fetchMyJoinedCommunities());
        }
    }, [dispatch, isAuthenticated, myJoinedCommunitiesStatus]);
    
    // *** DEBUG: Log authentication và community state (chỉ khi có thay đổi quan trọng) ***
    useEffect(() => {
        console.log(`[PostDetailPage] DEBUG: isAuthenticated=${isAuthenticated}, post.CommunityId=${post?.CommunityId}, myJoinedCommunitiesStatus=${myJoinedCommunitiesStatus}, joinedCommunitiesCount=${myJoinedCommunities.length}`);
    }, [isAuthenticated, post?.CommunityId, myJoinedCommunitiesStatus]); // Remove myJoinedCommunities.length to avoid frequent updates

    // Effect 2: Fetch reaction summary for the loaded post
    useEffect(() => {
        // Fetch reactions only if post is loaded, has an ID, and reaction status is idle
        if (post && post.id && reactionStatusForPost === 'idle') {
            console.log(`[PostDetailPage] Fetching reaction summary for post ${post.id}`);
            dispatch(fetchReactionSummary({ targetEntityType: "Post", targetEntityId: post.id }));
        }
    }, [dispatch, post, reactionStatusForPost, isAuthenticated]); // Add isAuthenticated dependency

    // Effect 3: Load author info (same logic as PostCard)
    useEffect(() => {
        const loadAuthorInfo = async () => {
            if (!post) return;
            
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
                    // Fallback
                    setAuthorInfo({
                        displayName: post.authorName || `User ${post.authorUserId.slice(-6)}`,
                        avatarUrl: `https://ui-avatars.com/api/?name=User+${post.authorUserId.slice(-6)}&size=45&background=random&color=ffffff&format=png`
                    });
                }
            } else {
                // No author info available
                setAuthorInfo({
                    displayName: post.authorName || 'Người dùng ẩn danh',
                    avatarUrl: DEFAULT_PROFILE_AVATAR
                });
            }
        };

        loadAuthorInfo();
    }, [post]);

    // Effect 4: Initialize edit form when post loads
    useEffect(() => {
        if (post && !isEditing) {
            setEditFormData({
                title: post.title || '',
                content: post.content || ''
            });
        }
    }, [post, isEditing]);

    // Effect 5: Handle successful update
    useEffect(() => {
        if (updateStatus === 'succeeded') {
            setIsEditing(false);
            dispatch(clearUpdateStatus());
        }
    }, [updateStatus, dispatch]);

    // Effect 6: Handle successful delete (redirect)
    useEffect(() => {
        if (deleteStatus === 'succeeded') {
            // Redirect to community or home
            if (post?.communityId) {
                navigate(`/communities/${post.communityId}`);
            } else {
                navigate('/');
            }
        }
    }, [deleteStatus, post, navigate]);

    const handleReactionClick = (reactionTypeToSet) => {
        if (!isAuthenticated || setReactionOpStatus === 'loading' || !post || !post.id) return;

        if (currentUserReaction === reactionTypeToSet) {
            dispatch(removeReaction({
                targetEntityType: "Post",
                targetEntityId: post.id,
                reactionTypeToRemove: reactionTypeToSet
            }));
        } else {
            dispatch(setReaction({
                targetEntityType: "Post",
                targetEntityId: post.id,
                reactionType: reactionTypeToSet
            }));
        }
    };

    // Check if current user can edit/delete post
    const canEditPost = () => {
        if (!isAuthenticated || !post || !currentUser) {
            console.log('[PostDetailPage] canEditPost - missing requirements:', { 
                isAuthenticated, 
                hasPost: !!post, 
                hasCurrentUser: !!currentUser 
            });
            return false;
        }
        console.log('[PostDetailPage] canEditPost check:', { 
            currentUser: currentUser,
            post: post,
            currentUserId: currentUser.id || currentUser.userId, 
            postAuthorUserId: post.authorUserId,
            match: (currentUser.id || currentUser.userId) === post.authorUserId 
        });
        return (currentUser.id || currentUser.userId) === post.authorUserId;
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Reset form data to original
        setEditFormData({
            title: post.title || '',
            content: post.content || ''
        });
    };

    const handleSaveEdit = () => {
        if (!editFormData.title.trim() || !editFormData.content.trim()) {
            alert('Tiêu đề và nội dung không được để trống.');
            return;
        }
        dispatch(updatePost({
            postId: post.id,
            updateData: {
                title: editFormData.title.trim(),
                content: editFormData.content.trim()
            }
        }));
    };

    const handleDeleteClick = () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài đăng này không? Hành động này không thể hoàn tác.')) {
            dispatch(deletePost(post.id));
        }
    };

    const handleFormChange = (field, value) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };


    if (status === 'loading') {
        return (<Container className="text-center py-5"><Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} /><p className="mt-3">Đang tải bài đăng...</p></Container>);
    }
    if (status === 'failed' && error) {
        return (<Container className="text-center py-5"><Alert variant="danger"><h4>Lỗi tải bài đăng</h4><p>{String(error)}</p><Button variant="outline-primary" onClick={() => navigate(-1)}>Quay lại</Button></Alert></Container>);
    }
    
    // Debug logging
    console.log('[PostDetailPage] Render debug:', { 
        status, 
        loading,
        hasPost: !!post, 
        postId: post?.id, 
        paramPostId: postId,
        error 
    });

    if (status === 'loading') {
        return (<Container className="text-center py-5"><Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} /><p className="mt-3">Đang tải bài đăng...</p></Container>);
    }
    
    if (status === 'failed') {
        return (<Container className="text-center py-5"><Alert variant="danger"><h4>Lỗi tải bài đăng</h4><p>{String(error || 'Có lỗi xảy ra')}</p><Button variant="outline-primary" onClick={() => navigate(-1)}>Quay lại</Button></Alert></Container>);
    }
    
    // Only show "not found" if fetch succeeded but no post data
    if (status === 'succeeded' && !post) {
        return (<Container className="text-center py-5"><Alert variant="warning">Không tìm thấy thông tin bài đăng.</Alert><Button variant="outline-primary" onClick={() => navigate(-1)}>Quay lại</Button></Container>);
    }
    
    // Still loading or waiting
    if (!post) {
        return (<Container className="text-center py-5"><Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} /><p className="mt-3">Đang tải bài đăng...</p></Container>);
    }

    const postTime = formatVietnameseTime(post.createdAt);
    const reactionButtonDisabled = !isAuthenticated || setReactionOpStatus === 'loading' || reactionStatusForPost === 'loading';

    return (
        <Container className="py-4">
            <Row className="justify-content-center">
                <Col md={10} lg={8}>
                    <Button variant="outline-secondary" size="sm" onClick={() => navigate(post.CommunityId ? `/communities/${post.CommunityId}` : -1)} className="mb-3">
                        ← Quay lại {post.CommunityName || 'Cộng đồng'}
                    </Button>

                    <Card className="shadow-sm">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <img 
                                    src={authorInfo.avatarUrl} 
                                    alt={`${authorInfo.displayName} Avatar`} 
                                    className="rounded-circle me-3" 
                                    style={{ 
                                        width: '45px', 
                                        height: '45px', 
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
                                    <h5 className="mb-0">{authorInfo.displayName}</h5>
                                    <small className="text-muted">
                                        Đã đăng trong <Link to={`/communities/${post.CommunityId}`}>{post.CommunityName || 'một cộng đồng'}</Link>
                                        {' • '}
                                        {postTime}
                                    </small>
                                </div>
                            </div>
                            <div>
                                {post.isPinned && <Badge bg="warning" text="dark" className="me-1">Ghim</Badge>}
                                {post.isLocked && <Badge bg="secondary" className="me-1">Khóa</Badge>}
                                
                                {/* Edit/Delete buttons for post author */}
                                {canEditPost() && !isEditing && (
                                    <ButtonGroup className="ms-2">
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={handleEditClick}
                                            disabled={updateStatus === 'loading' || deleteStatus === 'loading'}
                                        >
                                            ✏️ Sửa
                                        </Button>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={handleDeleteClick}
                                            disabled={updateStatus === 'loading' || deleteStatus === 'loading'}
                                        >
                                            {deleteStatus === 'loading' && <Spinner as="span" size="sm" animation="border" className="me-1" />}
                                            🗑️ Xóa
                                        </Button>
                                    </ButtonGroup>
                                )}
                                
                                {/* Save/Cancel buttons when editing */}
                                {canEditPost() && isEditing && (
                                    <ButtonGroup className="ms-2">
                                        <Button 
                                            variant="success" 
                                            size="sm"
                                            onClick={handleSaveEdit}
                                            disabled={updateStatus === 'loading'}
                                        >
                                            {updateStatus === 'loading' && <Spinner as="span" size="sm" animation="border" className="me-1" />}
                                            💾 Lưu
                                        </Button>
                                        <Button 
                                            variant="secondary" 
                                            size="sm"
                                            onClick={handleCancelEdit}
                                            disabled={updateStatus === 'loading'}
                                        >
                                            ✖️ Hủy
                                        </Button>
                                    </ButtonGroup>
                                )}
                            </div>
                        </Card.Header>

                        <Card.Body>
                            {isEditing ? (
                                // Edit form
                                <div>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tiêu đề bài đăng</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={editFormData.title}
                                            onChange={(e) => handleFormChange('title', e.target.value)}
                                            placeholder="Nhập tiêu đề bài đăng..."
                                            maxLength={200}
                                            disabled={updateStatus === 'loading'}
                                        />
                                        <Form.Text className="text-muted">
                                            {editFormData.title.length}/200 ký tự
                                        </Form.Text>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nội dung bài đăng</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={8}
                                            value={editFormData.content}
                                            onChange={(e) => handleFormChange('content', e.target.value)}
                                            placeholder="Nhập nội dung bài đăng..."
                                            maxLength={10000}
                                            disabled={updateStatus === 'loading'}
                                        />
                                        <Form.Text className="text-muted">
                                            {editFormData.content.length}/10000 ký tự
                                        </Form.Text>
                                    </Form.Group>
                                    {updateStatus === 'failed' && (
                                        <Alert variant="danger" className="mb-3">
                                            {error || 'Có lỗi xảy ra khi cập nhật bài đăng.'}
                                        </Alert>
                                    )}
                                </div>
                            ) : (
                                // View mode
                                <div>
                                    <Card.Title as="h1" className="mb-3">{post.title}</Card.Title>
                                    {post.imageUrls && post.imageUrls.length > 0 && (
                                        <div className="mb-3 text-center"> {/* Center images */}
                                            {post.imageUrls.map((url, index) => (
                                                <Image key={index} src={getPostImageUrl(url)} fluid rounded className="mb-2" alt={`Post image ${index + 1}`} style={{ maxHeight: '400px', objectFit: 'contain' }} />
                                            ))}
                                        </div>
                                    )}
                                    <div className="post-full-content" style={{ whiteSpace: 'pre-line', fontSize: '1.1rem', lineHeight: '1.7' }}
                                        dangerouslySetInnerHTML={{ __html: post.content }} // Assuming content is safe HTML or Markdown converted to HTML
                                    // If plain text, just {post.content}
                                    />
                                </div>
                            )}
                        </Card.Body>

                        <Card.Footer className="bg-light p-3">
                            <div className="d-flex justify-content-start align-items-center mb-2">
                                <Button
                                    variant={currentUserReaction === REACTION_TYPES.LIKE ? "primary" : "outline-secondary"}
                                    size="sm" className="me-2 action-btn"
                                    onClick={() => handleReactionClick(REACTION_TYPES.LIKE)}
                                    disabled={reactionButtonDisabled}
                                >
                                    <span className="icon">👍</span> {currentUserReaction === REACTION_TYPES.LIKE ? 'Đã thích' : 'Thích'}
                                    {likesCount > 0 && <span className="count ms-1">({likesCount})</span>}
                                    {setReactionOpStatus === 'loading' && currentUserReaction !== REACTION_TYPES.LIKE && reactionSummary?.reactionTypeBeingSet === REACTION_TYPES.LIKE && <Spinner as="span" size="sm" animation="border" className="ms-1" />}
                                </Button>
                                <Button
                                    variant={currentUserReaction === REACTION_TYPES.LOVE ? "danger" : "outline-secondary"}
                                    size="sm" className="me-2 action-btn"
                                    onClick={() => handleReactionClick(REACTION_TYPES.LOVE)}
                                    disabled={reactionButtonDisabled}
                                >
                                    <span className="icon">❤️</span> {currentUserReaction === REACTION_TYPES.LOVE ? 'Đã yêu thích' : 'Yêu thích'}
                                    {lovesCount > 0 && <span className="count ms-1">({lovesCount})</span>}
                                    {setReactionOpStatus === 'loading' && currentUserReaction !== REACTION_TYPES.LOVE && reactionSummary?.reactionTypeBeingSet === REACTION_TYPES.LOVE && <Spinner as="span" size="sm" animation="border" className="ms-1" />}
                                </Button>
                                {/* Add other reaction buttons here (Haha, Wow, Sad, Angry) following the same pattern */}
                            </div>
                            <div className="text-muted small">
                                Lượt xem: {post.viewCount || 0}
                                {/* Display total likes and loves if counts are available and non-zero */}
                                {likesCount > 0 && <span className="ms-2">· {likesCount} lượt thích</span>}
                                {lovesCount > 0 && <span className="ms-2">· {lovesCount} lượt yêu thích</span>}
                            </div>
                        </Card.Footer>
                    </Card>

                    <div className="mt-4">
                        {/* *** DEBUG: Log post.CommunityId để kiểm tra *** */}
                        {console.log(`[PostDetailPage] RENDER: post.CommunityId="${post.CommunityId}", typeof=${typeof post.CommunityId}`)}
                        <CommentList 
                            parentEntityType="Post" 
                            parentId={post.id} 
                            communityId={post.CommunityId} 
                        />
                    </div>

                </Col>
            </Row>
        </Container>
    );
}

export default PostDetailPage;