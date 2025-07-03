// src/features/community/components/CommunityExplorer.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Pagination from 'react-bootstrap/Pagination';
import Image from 'react-bootstrap/Image';
import Dropdown from 'react-bootstrap/Dropdown';
import {
  searchCommunities,
  setCommunitySearchFilter,
  setCommunitySearchPage,
  resetCommunitySearchFilters,
  selectSearchedCommunities,
  selectSearchStatus,
  selectSearchError,
  deleteCommunity,
  selectDeleteCommunityStatus,
  selectDeleteCommunityError,
  clearDeleteCommunityStatus,
} from '../slices/communitySlice';
import { selectIsAuthenticated, selectCurrentUser } from '../../auth/slices/authSlice';
import EditCommunityModal from './EditCommunityModal';

const CommunityExplorer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchedCommunities = useSelector(selectSearchedCommunities);
  const searchStatus = useSelector(selectSearchStatus);
  const searchError = useSelector(selectSearchError);
  
  // *** THÊM selectors cho auth và community management ***
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const deleteStatus = useSelector(selectDeleteCommunityStatus);
  const deleteError = useSelector(selectDeleteCommunityError);
  
  const [searchKeyword, setSearchKeyword] = useState('');
  const [editingCommunity, setEditingCommunity] = useState(null); // *** THÊM state cho edit modal ***
  const [showEditModal, setShowEditModal] = useState(false); // *** THÊM ***

  // Access the pagination info from Redux store
  const pagination = useSelector(state => state.community.searchPagination);

  useEffect(() => {
    // Reset filters when component mounts
    dispatch(resetCommunitySearchFilters());
    // Initial search without any filters
    dispatch(searchCommunities());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setCommunitySearchFilter({ filterName: 'NameKeyword', value: searchKeyword }));
    dispatch(searchCommunities());
  };

  const handlePageChange = (pageNumber) => {
    dispatch(setCommunitySearchPage(pageNumber));
    dispatch(searchCommunities());
  };

  const handleViewCommunity = (communityId) => {
    navigate(`/communities/${communityId}`);
  };

  // *** THÊM: Function kiểm tra quyền quản lý community ***
  const canManageCommunity = (community) => {
    if (!isAuthenticated || !currentUser || !community) {
      return false;
    }
    return (currentUser.id || currentUser.userId) === community.createdByUserId;
  };

  // *** THÊM: Handler cho edit community ***
  const handleEditCommunity = (community) => {
    setEditingCommunity(community);
    setShowEditModal(true);
  };

  // *** THÊM: Handler cho delete community ***
  const handleDeleteCommunity = (community) => {
    const confirmMessage = `Bạn có chắc chắn muốn xóa cộng đồng "${community.name}" không?\n\nHành động này không thể hoàn tác!`;
    if (window.confirm(confirmMessage)) {
      dispatch(deleteCommunity(community.id));
    }
  };

  // *** THÊM: Handle thành công delete ***
  useEffect(() => {
    if (deleteStatus === 'succeeded') {
      // Refresh community list
      dispatch(searchCommunities());
      dispatch(clearDeleteCommunityStatus());
    }
  }, [deleteStatus, dispatch]);

  // *** THÊM: Handle thành công update ***
  useEffect(() => {
    // Listen for successful update to refresh list
    // EditCommunityModal sẽ tự đóng sau khi thành công
    // Ta chỉ cần refresh list nếu đang ở trang explorer
    const handleUpdateSuccess = () => {
      if (showEditModal) {
        dispatch(searchCommunities());
        setShowEditModal(false);
        setEditingCommunity(null);
      }
    };
    
    // Ta sẽ listen qua updateStatus trong EditCommunityModal
    // Hoặc đơn giản hơn, chỉ refresh khi modal đóng
  }, [dispatch, showEditModal]);

  // Function to get community image URL
  const getCommunityImageUrl = (community) => {
    if (community.coverImageUrl) {
      if (community.coverImageUrl.startsWith('http')) return community.coverImageUrl;
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      return `${baseUrl}${community.coverImageUrl}`;
    }
    return `https://via.placeholder.com/300x150/777/fff?text=${community.name?.charAt(0) || 'C'}`;
  };

  // Render pagination controls
  const renderPagination = () => {
    const { PageNumber, totalPages } = pagination;
    if (totalPages <= 1) return null;

    const items = [];
    const maxItems = 5; // Max number of page buttons to show
    const startPage = Math.max(1, PageNumber - Math.floor(maxItems / 2));
    const endPage = Math.min(totalPages, startPage + maxItems - 1);

    // Previous button
    items.push(
      <Pagination.Prev 
        key="prev" 
        disabled={PageNumber === 1}
        onClick={() => handlePageChange(PageNumber - 1)}
      />
    );

    // First page and ellipsis if necessary
    if (startPage > 1) {
      items.push(<Pagination.Item key={1} onClick={() => handlePageChange(1)}>1</Pagination.Item>);
      if (startPage > 2) items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
    }

    // Page numbers
    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item 
          key={number} 
          active={number === PageNumber}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    // Last page and ellipsis if necessary
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
      items.push(
        <Pagination.Item 
          key={totalPages} 
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    // Next button
    items.push(
      <Pagination.Next 
        key="next" 
        disabled={PageNumber === totalPages}
        onClick={() => handlePageChange(PageNumber + 1)}
      />
    );

    return <Pagination>{items}</Pagination>;
  };

  return (
    <div className="community-explorer">
      <div className="container-fluid">
          {/* *** THÊM: Alert cho delete error *** */}
          {deleteStatus === 'failed' && deleteError && (
            <Alert variant="danger" className="mb-3" onClose={() => dispatch(clearDeleteCommunityStatus())} dismissible>
              Lỗi xóa cộng đồng: {deleteError}
            </Alert>
          )}

          <Row className="mb-4">
            <Col>
              <h2 className="mb-3">Khám phá Cộng đồng</h2>
              <Form onSubmit={handleSearch}>
                {/* <Row>
                  <Col md={6} className="mb-2">
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Tìm cộng đồng theo tên..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                      />
                      <Button type="submit" variant="primary">
                        Tìm kiếm
                      </Button>
                    </InputGroup>
                  </Col>
                </Row> */}
              </Form>

              {searchStatus === 'loading' && (
                <div className="text-center p-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </Spinner>
                </div>
              )}

              {searchStatus === 'failed' && (
                <Alert variant="danger">
                  Không thể tải danh sách cộng đồng: {searchError}
                </Alert>
              )}

              {searchStatus === 'succeeded' && (
                <>
                  <Row className="mb-3">
                    <Col>
                      <p>Hiển thị {searchedCommunities.length} kết quả từ {pagination.totalCount} cộng đồng</p>
                    </Col>
                  </Row>
                  
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {searchedCommunities.length > 0 ? (
                      searchedCommunities.map((community) => (
                        <Col key={community.id}>
                          <Card className="h-100 shadow-sm">
                            <div style={{ height: '150px', overflow: 'hidden' }}>
                              <Image 
                                src={getCommunityImageUrl(community)} 
                                alt={community.name} 
                                className="w-100 h-100"
                                style={{ objectFit: 'cover' }} 
                              />
                            </div>
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-start">
                                <Card.Title className="mb-0">{community.name}</Card.Title>
                                {/* *** THÊM: Dropdown quản lý cho chủ community *** */}
                                {canManageCommunity(community) && (
                                  <Dropdown>
                                    <Dropdown.Toggle variant="outline-secondary" size="sm">
                                      ⚙️
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                      <Dropdown.Item onClick={() => handleEditCommunity(community)}>
                                        ✏️ Chỉnh sửa
                                      </Dropdown.Item>
                                      <Dropdown.Divider />
                                      <Dropdown.Item 
                                        onClick={() => handleDeleteCommunity(community)}
                                        className="text-danger"
                                        disabled={deleteStatus === 'loading'}
                                      >
                                        🗑️ Xóa
                                      </Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>
                                )}
                              </div>
                              <Card.Text className="text-muted small">
                                {community.memberCount || 0} thành viên
                                {!community.isPublic && <span className="badge bg-secondary ms-2">Riêng tư</span>}
                              </Card.Text>
                              <Card.Text>
                                {community.description?.length > 100 
                                  ? `${community.description.substring(0, 100)}...` 
                                  : community.description}
                              </Card.Text>
                              <Button 
                                variant="outline-primary" 
                                onClick={() => handleViewCommunity(community.id)}
                                className="w-100"
                              >
                                Xem chi tiết
                              </Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))
                    ) : (
                      <Col xs={12}>
                        <Alert variant="info">
                          Không tìm thấy cộng đồng nào phù hợp với tìm kiếm của bạn.
                        </Alert>
                      </Col>
                    )}
                  </Row>
                  
                  <div className="d-flex justify-content-center mt-4">
                    {renderPagination()}
                  </div>
                </>
              )}

              {/* *** THÊM modal chỉnh sửa cộng đồng *** */}
              {editingCommunity && (
                <EditCommunityModal
                  show={showEditModal}
                  onHide={() => {
                    setShowEditModal(false);
                    setEditingCommunity(null);
                  }}
                  community={editingCommunity}
                />
              )}
            </Col>
          </Row>
        </div>
    </div>
  );
};

export default CommunityExplorer;
