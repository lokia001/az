import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, InputGroup, Modal, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaFilter, FaEye } from 'react-icons/fa';
import { fetchSpaces, selectManageSpaces, selectManageSpaceLoading, selectManageSpaceError, deleteSpaceAsync } from '../manageSpaceSlice';
import SpaceForm from './SpaceForm';
import SpaceDetails from './SpaceDetails';
import '../styles/OwnerSpacesPage.css';

const OwnerSpacesPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const spaces = useSelector(selectManageSpaces);
    const loading = useSelector(selectManageSpaceLoading);
    const error = useSelector(selectManageSpaceError);
    const currentUser = useSelector(state => state.auth.user);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Use a refreshSpaces function that can be called whenever needed
    const refreshSpaces = useCallback(async () => {
        if (currentUser?.id) {
            try {
                await dispatch(fetchSpaces()).unwrap();
                console.log("Spaces refreshed successfully");
            } catch (error) {
                console.error("Failed to refresh spaces:", error);
            }
        }
    }, [dispatch, currentUser]);

    // Initial load and when refresh is triggered
    useEffect(() => {
        refreshSpaces();
    }, [refreshSpaces, refreshTrigger]);

    const handleCreateSpace = () => {
        setSelectedSpace(null);
        setShowCreateModal(true);
    };

    const handleEditSpace = (space) => {
        setSelectedSpace(space);
        setShowEditModal(true);
    };

    const handleViewSpace = (space) => {
        // Navigate to the detailed view
        navigate(`/owner/manage-spaces/${space.id}`);
    };

    const handleDeleteSpace = (spaceId) => {
        setDeleteConfirmation(spaceId);
    };

    const confirmDeleteSpace = async () => {
        if (deleteConfirmation) {
            try {
                await dispatch(deleteSpaceAsync(deleteConfirmation)).unwrap();
                setDeleteConfirmation(null);
                // Trigger refresh using the counter
                setRefreshTrigger(prev => prev + 1);
            } catch (error) {
                console.error('Error deleting space:', error);
                setDeleteConfirmation(null);
            }
        }
    };

    const handleFormSubmit = useCallback(async (success, result) => {
        console.log("Form submit callback called with success:", success);
        
        // Close modals first to prevent navigation issues
        setShowCreateModal(false);
        setShowEditModal(false);
        
        // Only refresh if submission was successful
        if (success) {
            // Use timeout to ensure modals are closed before refresh
            setTimeout(() => {
                setRefreshTrigger(prev => prev + 1);
            }, 100);
        }
    }, []);

    const handleCloseModals = useCallback(() => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setShowDetailsModal(false);
        setSelectedSpace(null);
        setDeleteConfirmation(null);
    }, []);

    const filteredSpaces = spaces?.filter(space => {
        if (!space) return false;
        
        const matchesSearch = searchQuery === '' || 
            space.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            space.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            space.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || space.status === filterStatus;
        const matchesType = filterType === 'all' || space.type === filterType;
        
        return matchesSearch && matchesStatus && matchesType;
    }) || [];

    if (loading === 'pending' && !spaces?.length) {
        return (
            <Container className="py-4">
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </Spinner>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Quản lý không gian của tôi</h2>
                <Button 
                    variant="primary" 
                    onClick={handleCreateSpace}
                    type="button"
                >
                    <FaPlus className="me-2" /> Thêm không gian mới
                </Button>
            </div>

            {/* Search and Filters */}
            <Row className="mb-4">
                <Col md={4}>
                    <InputGroup>
                        <Form.Control
                            placeholder="Tìm kiếm theo tên, địa chỉ..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <InputGroup.Text>
                            <FaSearch />
                        </InputGroup.Text>
                    </InputGroup>
                </Col>
                <Col md={4}>
                    <Form.Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="Available">Có sẵn</option>
                        <option value="Unavailable">Không có sẵn</option>
                        <option value="Maintenance">Bảo trì</option>
                    </Form.Select>
                </Col>
                <Col md={4}>
                    <Form.Select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">Tất cả loại</option>
                        <option value="Individual">Cá nhân</option>
                        <option value="Group">Nhóm</option>
                        <option value="Event">Sự kiện</option>
                    </Form.Select>
                </Col>
            </Row>

            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

            {/* Spaces Grid */}
            <Row xs={1} md={2} lg={3} className="g-4">
                {filteredSpaces.length > 0 ? (
                    filteredSpaces.map(space => (
                        <Col key={space.id}>
                            <Card className="h-100 shadow-sm">
                                <Card.Img 
                                    variant="top" 
                                    src={space.imageUrls?.[0] || '/placeholder-space.jpg'} 
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                                <Card.Body>
                                    <Card.Title className="d-flex justify-content-between align-items-start">
                                        <span>{space.name}</span>
                                        <Badge bg={space.status === 'Available' ? 'success' : 'secondary'}>
                                            {space.status}
                                        </Badge>
                                    </Card.Title>
                                    <Card.Text className="mb-2">{space.description}</Card.Text>
                                    <Card.Text className="small text-muted">
                                        <FaFilter className="me-1" /> {space.type}
                                    </Card.Text>
                                </Card.Body>
                                <Card.Footer className="bg-transparent">
                                    <div className="d-flex justify-content-between">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleViewSpace(space)}
                                            type="button"
                                        >
                                            <FaEye className="me-1" /> Chi tiết
                                        </Button>
                                        <div>
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleEditSpace(space)}
                                                type="button"
                                            >
                                                <FaEdit className="me-1" /> Sửa
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDeleteSpace(space.id)}
                                                type="button"
                                            >
                                                <FaTrash className="me-1" /> Xóa
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col xs={12}>
                        <Alert variant="info">
                            Không tìm thấy không gian nào. Hãy thêm không gian mới!
                        </Alert>
                    </Col>
                )}
            </Row>

            {/* Create Space Modal */}
            {showCreateModal && (
                <Modal
                    show={showCreateModal}
                    onHide={handleCloseModals}
                    size="lg"
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Thêm không gian mới</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <SpaceForm 
                            onSubmit={handleFormSubmit}
                            onCancel={handleCloseModals}
                        />
                    </Modal.Body>
                </Modal>
            )}

            {/* Edit Space Modal */}
            {showEditModal && selectedSpace && (
                <Modal
                    show={showEditModal}
                    onHide={handleCloseModals}
                    size="lg"
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Chỉnh sửa không gian</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <SpaceForm 
                            initialData={selectedSpace}
                            onSubmit={handleFormSubmit}
                            onCancel={handleCloseModals}
                        />
                    </Modal.Body>
                </Modal>
            )}

            {/* View Space Details Modal */}
            {showDetailsModal && selectedSpace && (
                <Modal
                    show={showDetailsModal}
                    onHide={handleCloseModals}
                    size="lg"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Chi tiết không gian</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <SpaceDetails space={selectedSpace} />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button 
                            variant="secondary" 
                            onClick={handleCloseModals}
                            type="button"
                        >
                            Đóng
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                show={!!deleteConfirmation}
                onHide={() => setDeleteConfirmation(null)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc chắn muốn xóa không gian này không? Hành động này không thể hoàn tác.
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => setDeleteConfirmation(null)}
                        type="button"
                    >
                        Hủy
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={confirmDeleteSpace}
                        type="button"
                    >
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default OwnerSpacesPage;
