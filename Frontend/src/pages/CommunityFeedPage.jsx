// src/pages/CommunityFeedPage.jsx
import React, { useEffect, useState, useMemo } from 'react'; // useMemo might be useful later
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Added Link, useNavigate
import Sidebar from '../features/community/components/Sidebar';
import MainFeed from '../features/community/components/MainFeed';
import CreatePostModal from '../features/community/components/CreatePostModal'; // If create post is here
import EditCommunityModal from '../features/community/components/EditCommunityModal'; // *** THÊM ***
import {
    setSelectedCommunity,
    fetchCommunityPosts,
    selectSelectedCommunityId,
    selectSelectedCommunityName,
    selectCommunityPosts,
    selectCommunityPostsStatus,
    selectCommunityPostsError,
    selectCommunityPostsPagination,
    setCommunityPostsPage,
    clearSelectedCommunity, // For cleanup
    selectMyJoinedCommunities, // To get community name if not in selectedCommunityName
    // *** THÊM imports cho community management ***
    fetchCommunityDetail,
    deleteCommunity,
    selectCommunityDetail,
    selectCommunityDetailStatus,
    selectCommunityDetailError,
    selectDeleteCommunityStatus,
    selectDeleteCommunityError,
    clearDeleteCommunityStatus,
} from '../features/community/slices/communitySlice';
import { selectIsAuthenticated, selectCurrentUser } from '../features/auth/slices/authSlice'; // *** THÊM ***
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import BootstrapPagination from 'react-bootstrap/Pagination';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button'; // For Create Post button
import Dropdown from 'react-bootstrap/Dropdown'; // *** THÊM cho menu actions ***

const CommunityFeedPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // *** THÊM ***
    const { communityId: communityIdFromUrl } = useParams();

    const selectedCommunityIdFromState = useSelector(selectSelectedCommunityId);
    let selectedCommunityName = useSelector(selectSelectedCommunityName); // Let, because we might derive it
    const posts = useSelector(selectCommunityPosts);
    const postsStatus = useSelector(selectCommunityPostsStatus);
    const postsError = useSelector(selectCommunityPostsError);
    const postsPagination = useSelector(selectCommunityPostsPagination);
    const myJoinedCommunities = useSelector(selectMyJoinedCommunities); // To find name if needed

    // *** THÊM state cho community management ***
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const currentUser = useSelector(selectCurrentUser);
    const communityDetail = useSelector(selectCommunityDetail);
    const communityDetailStatus = useSelector(selectCommunityDetailStatus);
    const communityDetailError = useSelector(selectCommunityDetailError);
    const deleteStatus = useSelector(selectDeleteCommunityStatus);
    const deleteError = useSelector(selectDeleteCommunityError);

    const [showCreatePostModal, setShowCreatePostModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false); // *** THÊM ***

    // Effect 1: Set/update selected community in Redux when URL changes or component mounts
    useEffect(() => {
        if (communityIdFromUrl) {
            // Try to find the community name from already fetched joined communities
            // This avoids an extra API call for community details just for the name here
            const communityDetails = myJoinedCommunities.find(c => c.communityId === communityIdFromUrl);
            const name = communityDetails ? communityDetails.communityName : `Cộng đồng ${communityIdFromUrl.substring(0, 8)}...`;

            console.log(`[CommunityFeedPage] URL param communityId: ${communityIdFromUrl}. Dispatching setSelectedCommunity with name: ${name}`);
            dispatch(setSelectedCommunity({ id: communityIdFromUrl, name: name }));
        } else {
            // If somehow this page is rendered without a communityIdFromUrl, clear selection
            dispatch(clearSelectedCommunity());
        }
        // Cleanup: When navigating away from a specific community feed, clear the selection
        // This ensures if user goes to /community (general), it doesn't show old posts.
        return () => {
            // This cleanup might be too aggressive if navigating between different community feeds quickly.
            // Consider if this is the desired UX.
            // dispatch(clearSelectedCommunity());
        };
    }, [dispatch, communityIdFromUrl, myJoinedCommunities]); // myJoinedCommunities to get name

    // Effect 2: Fetch posts when selectedCommunityId (now synced with URL) changes,
    // or page changes, or status is 'idle' for the current selected community.
    useEffect(() => {
        console.log(`[CommunityFeedPage] useEffect for posts. SelectedCIdInState: ${selectedCommunityIdFromState}, URL_C_ID: ${communityIdFromUrl}, PostsStatus: ${postsStatus}, Page: ${postsPagination.PageNumber}`);
        // Ensure we are fetching for the community ID that is in the URL
        if (communityIdFromUrl && communityIdFromUrl === selectedCommunityIdFromState && postsStatus === 'idle') {
            console.log(`[CommunityFeedPage] Dispatching fetchCommunityPosts for C_ID: ${communityIdFromUrl}, Page: ${postsPagination.PageNumber}`);
            dispatch(fetchCommunityPosts({
                communityId: communityIdFromUrl,
                pageNumber: postsPagination.PageNumber,
                pageSize: postsPagination.PageSize
            }));
        }
    }, [dispatch, communityIdFromUrl, selectedCommunityIdFromState, postsStatus, postsPagination.PageNumber, postsPagination.PageSize]);

    // *** THÊM: Effect để fetch community detail ***
    useEffect(() => {
        if (communityIdFromUrl && (!communityDetail || communityDetail.id !== communityIdFromUrl)) {
            console.log(`[CommunityFeedPage] Fetching community detail for ID: ${communityIdFromUrl}`);
            dispatch(fetchCommunityDetail(communityIdFromUrl));
        }
    }, [dispatch, communityIdFromUrl, communityDetail]);

    // *** THÊM: Effect để handle delete thành công ***
    useEffect(() => {
        if (deleteStatus === 'succeeded') {
            console.log('[CommunityFeedPage] Community deleted successfully, navigating to community list');
            navigate('/community');
            dispatch(clearDeleteCommunityStatus());
        }
    }, [deleteStatus, navigate, dispatch]);

    // If selectedCommunityName from state is null but we have a communityIdFromUrl, try to use it or a placeholder
    if (!selectedCommunityName && communityIdFromUrl) {
        const communityDetails = myJoinedCommunities.find(c => c.communityId === communityIdFromUrl);
        selectedCommunityName = communityDetails ? communityDetails.communityName : `Cộng đồng ${communityIdFromUrl.substring(0, 8)}...`;
    }


    const handlePageChange = (newPage) => { /* ... same ... */
        if (postsStatus !== 'loading' && communityIdFromUrl) dispatch(setCommunityPostsPage(newPage));
    };
    const renderPagination = () => { /* ... same ... */
        if (!postsPagination.totalPages || postsPagination.totalPages <= 1 || posts.length === 0) return null;
        let items = []; const maxPagesToShow = 5;
        let startPage = Math.max(1, postsPagination.PageNumber - Math.floor(maxPagesToShow / 2)); let endPage = Math.min(postsPagination.totalPages, startPage + maxPagesToShow - 1); if (endPage - startPage + 1 < maxPagesToShow) startPage = Math.max(1, endPage - maxPagesToShow + 1);
        if (startPage > 1) { items.push(<BootstrapPagination.First key="first" onClick={() => handlePageChange(1)} disabled={postsStatus === 'loading'} />); items.push(<BootstrapPagination.Prev key="prev" onClick={() => handlePageChange(postsPagination.PageNumber - 1)} disabled={postsPagination.PageNumber <= 1 || postsStatus === 'loading'} />); if (startPage > 2) items.push(<BootstrapPagination.Ellipsis key="start-ellipsis" disabled />); }
        for (let number = startPage; number <= endPage; number++) { items.push(<BootstrapPagination.Item key={number} active={number === postsPagination.PageNumber} onClick={() => handlePageChange(number)} disabled={postsStatus === 'loading'}>{number}</BootstrapPagination.Item>); }
        if (endPage < postsPagination.totalPages) { if (endPage < postsPagination.totalPages - 1) items.push(<BootstrapPagination.Ellipsis key="end-ellipsis" disabled />); items.push(<BootstrapPagination.Next key="next" onClick={() => handlePageChange(postsPagination.PageNumber + 1)} disabled={postsPagination.PageNumber >= postsPagination.totalPages || postsStatus === 'loading'} />); items.push(<BootstrapPagination.Last key="last" onClick={() => handlePageChange(postsPagination.totalPages)} disabled={postsStatus === 'loading'} />); }
        return <BootstrapPagination className="justify-content-center mt-3">{items}</BootstrapPagination>;
    };

    let contentToRender;
    if (!communityIdFromUrl) {
        contentToRender = <Alert variant="warning" className="text-center">Không có thông tin cộng đồng để hiển thị. <Link to="/community">Quay lại trang cộng đồng.</Link></Alert>;
    } else if (postsStatus === 'loading' && posts.length === 0) {
        contentToRender = <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p>Đang tải bài đăng...</p></div>;
    } else if (postsStatus === 'failed' && postsError) {
        contentToRender = <Alert variant="danger">Lỗi tải bài đăng: {String(postsError)}</Alert>;
    } else if (postsStatus === 'succeeded' && posts.length === 0) {
        contentToRender = <Alert variant="info">Chưa có bài đăng nào trong cộng đồng này.</Alert>;
    } else if (posts.length > 0) {
        contentToRender = (
            <>
                <MainFeed posts={posts} isLoadingMore={postsStatus === 'loading' && posts.length > 0} />
                {renderPagination()}
            </>
        );
    } else if (postsStatus === 'idle') { // About to fetch
        contentToRender = <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p>Đang chuẩn bị tải bài đăng...</p></div>;
    } else {
        contentToRender = <Alert variant="light" className="text-center">Đang tải hoặc không có bài đăng.</Alert>;
    }

    // *** THÊM: Function kiểm tra quyền edit/delete community ***
    const canManageCommunity = () => {
        if (!isAuthenticated || !currentUser || !communityDetail) {
            return false;
        }
        // Chỉ người tạo community (CreatedByUserId) mới có quyền edit/delete
        return (currentUser.id || currentUser.userId) === communityDetail.createdByUserId;
    };

    // *** THÊM: Handler cho delete community ***
    const handleDeleteCommunity = () => {
        if (!communityDetail) return;
        
        const confirmMessage = `Bạn có chắc chắn muốn xóa cộng đồng "${communityDetail.name}" không?\n\nHành động này không thể hoàn tác!`;
        if (window.confirm(confirmMessage)) {
            dispatch(deleteCommunity(communityDetail.id));
        }
    };

    return (
        <>
            <div className="community-platform-wrapper" style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
                <Sidebar />
                <Container fluid style={{ flexGrow: 1, padding: '20px', overflowY: 'auto' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h2 className="mb-0">
                                {selectedCommunityName || `Cộng đồng`}
                            </h2>
                            {/* *** THÊM: Hiển thị thông tin community detail *** */}
                            {communityDetail && (
                                <div className="text-muted small mt-1">
                                    {communityDetail.memberCount || 0} thành viên • {communityDetail.postCount || 0} bài đăng
                                    {!communityDetail.isPublic && <span className="badge bg-secondary ms-2">Riêng tư</span>}
                                </div>
                            )}
                        </div>
                        
                        <div className="d-flex align-items-center gap-2">
                            {communityIdFromUrl && (
                                <Button variant="success" onClick={() => setShowCreatePostModal(true)}>
                                    + Tạo Bài Đăng
                                </Button>
                            )}
                            
                            {/* *** THÊM: Menu quản lý community cho chủ sở hữu *** */}
                            {canManageCommunity() && (
                                <Dropdown>
                                    <Dropdown.Toggle variant="outline-secondary" size="sm">
                                        ⚙️ Quản lý
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={() => setShowEditModal(true)}>
                                            ✏️ Chỉnh sửa cộng đồng
                                        </Dropdown.Item>
                                        <Dropdown.Divider />
                                        <Dropdown.Item 
                                            onClick={handleDeleteCommunity}
                                            className="text-danger"
                                            disabled={deleteStatus === 'loading'}
                                        >
                                            {deleteStatus === 'loading' ? (
                                                <>
                                                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                                                    Đang xóa...
                                                </>
                                            ) : (
                                                '🗑️ Xóa cộng đồng'
                                            )}
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            )}
                        </div>
                    </div>

                    {/* *** THÊM: Hiển thị lỗi community detail hoặc delete *** */}
                    {communityDetailStatus === 'failed' && communityDetailError && (
                        <Alert variant="warning" className="mb-3">
                            Không thể tải thông tin cộng đồng: {communityDetailError}
                        </Alert>
                    )}
                    
                    {deleteStatus === 'failed' && deleteError && (
                        <Alert variant="danger" className="mb-3" onClose={() => dispatch(clearDeleteCommunityStatus())} dismissible>
                            Lỗi xóa cộng đồng: {deleteError}
                        </Alert>
                    )}
                    {contentToRender}
                </Container>
            </div>
            {selectedCommunityIdFromState && ( // Modal needs selectedCommunityId to be set
                <CreatePostModal
                    show={showCreatePostModal}
                    onHide={() => setShowCreatePostModal(false)}
                />
            )}
            
            {/* *** THÊM: EditCommunityModal *** */}
            {communityDetail && (
                <EditCommunityModal
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    community={communityDetail}
                />
            )}
        </>
    );
};
export default CommunityFeedPage;