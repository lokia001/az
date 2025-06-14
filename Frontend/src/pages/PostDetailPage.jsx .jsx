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

import {
    fetchPostDetails,
    selectCurrentPost,
    selectPostDetailStatus,
    selectPostDetailError,
    clearCurrentPostDetail,
} from '../features/posts/slices/postDetailSlice';

import CommentList from '../features/comments/components/CommentList';

// IMPORT REACTION ACTIONS AND SELECTORS
import {
    fetchReactionSummary,
    setReaction,
    removeReaction,
    selectReactionSummary,
    selectSetReactionStatus, // To disable button while liking/unliking
} from '../features/reactions/slices/reactionSlice'; // Adjust path if needed
import { selectIsAuthenticated } from '../features/auth/slices/authSlice';


// Helper for author avatar (same as before)
const getAuthorAvatar = (post) => {
    if (post?.authorAvatarUrl) {
        if (post.authorAvatarUrl.startsWith('http')) return post.authorAvatarUrl;
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        return `${baseUrl}${post.authorAvatarUrl.startsWith('/') ? post.authorAvatarUrl : '/' + post.authorAvatarUrl}`;
    }
    return `https://i.pravatar.cc/50?u=${post?.authorUserId || 'default'}`;
};

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

    const post = useSelector(selectCurrentPost); // The detailed PostDto
    const status = useSelector(selectPostDetailStatus);
    const error = useSelector(selectPostDetailError);
    const isAuthenticated = useSelector(selectIsAuthenticated);

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
            // Clear previous post detail only if fetching a different post
            if (post && post.id !== postId && status !== 'idle' && status !== 'loading') {
                dispatch(clearCurrentPostDetail());
            }
            // Dispatch fetch if status is idle or if postId changed
            if (status === 'idle' || (post && post.id !== postId)) {
                dispatch(fetchPostDetails(postId));
            }
        }
        return () => {
            console.log('[PostDetailPage] Unmounting, clearing current post detail.');
            dispatch(clearCurrentPostDetail()); // Clear post detail when leaving the page
        };
    }, [dispatch, postId]); // Removed 'status' and 'post' to simplify and rely on postId change

    // Effect 2: Fetch reaction summary for the loaded post
    useEffect(() => {
        // Fetch reactions only if post is loaded, has an ID, and reaction status is idle
        if (post && post.id && reactionStatusForPost === 'idle') {
            console.log(`[PostDetailPage] Fetching reaction summary for post ${post.id}`);
            dispatch(fetchReactionSummary({ targetEntityType: "Post", targetEntityId: post.id }));
        }
    }, [dispatch, post, reactionStatusForPost]); // Depend on post (for post.id) and reactionStatusForPost


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


    if (status === 'loading') {
        return (<Container className="text-center py-5"><Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} /><p className="mt-3">Đang tải bài đăng...</p></Container>);
    }
    if (status === 'failed' && error) {
        return (<Container className="text-center py-5"><Alert variant="danger"><h4>Lỗi tải bài đăng</h4><p>{String(error)}</p><Button variant="outline-primary" onClick={() => navigate(-1)}>Quay lại</Button></Alert></Container>);
    }
    if (status !== 'loading' && !post) { // Succeeded but no post, or idle and no post
        return (<Container className="text-center py-5"><Alert variant="warning">Không tìm thấy thông tin bài đăng.</Alert><Button variant="outline-primary" onClick={() => navigate(-1)}>Quay lại</Button></Container>);
    }
    if (!post) return null; // Should be caught by above

    const authorName = post.authorName || `User ${post.authorUserId?.substring(0, 8)}...`;
    const reactionButtonDisabled = !isAuthenticated || setReactionOpStatus === 'loading' || reactionStatusForPost === 'loading';

    return (
        <Container className="py-4">
            <Row className="justify-content-center">
                <Col md={10} lg={8}>
                    <Button variant="outline-secondary" size="sm" onClick={() => navigate(post.communityId ? `/communities/${post.communityId}` : -1)} className="mb-3">
                        ← Quay lại {post.communityName || 'Cộng đồng'}
                    </Button>

                    <Card className="shadow-sm">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <Image src={getAuthorAvatar(post)} roundedCircle width={45} height={45} className="me-3" />
                                <div>
                                    <h5 className="mb-0">{authorName}</h5>
                                    <small className="text-muted">
                                        Đã đăng trong <Link to={`/communities/${post.communityId}`}>{post.communityName || 'một cộng đồng'}</Link>
                                        {' vào lúc '}
                                        {new Date(post.createdAt).toLocaleString('vi-VN')}
                                    </small>
                                </div>
                            </div>
                            <div>
                                {post.isPinned && <Badge bg="warning" text="dark" className="me-1">Ghim</Badge>}
                                {post.isLocked && <Badge bg="secondary">Khóa</Badge>}
                            </div>
                        </Card.Header>

                        <Card.Body>
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
                        <CommentList parentEntityType="Post" parentId={post.id} />
                    </div>

                </Col>
            </Row>
        </Container>
    );
}

export default PostDetailPage;