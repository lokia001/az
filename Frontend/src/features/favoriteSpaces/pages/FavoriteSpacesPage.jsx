// Frontend/src/features/favoriteSpaces/pages/FavoriteSpacesPage.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
    fetchFavoriteSpaces,
    selectFavoriteSpaces,
    selectFavoriteSpacesStatus,
    selectFavoriteSpacesError 
} from '../slices/favoriteSpacesSlice';
import FavoriteButton from '../components/FavoriteButton';
import { selectIsAuthenticated } from '../../auth/slices/authSlice';

const FavoriteSpacesPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const favoriteSpaces = useSelector(selectFavoriteSpaces);
    const status = useSelector(selectFavoriteSpacesStatus);
    const error = useSelector(selectFavoriteSpacesError);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchFavoriteSpaces());
        }
    }, [dispatch, isAuthenticated]);

    const handleSpaceClick = (spaceId) => {
        navigate(`/spaces/${spaceId}`);
    };

    const getImageUrl = (space) => {
        // Default image logic - you may need to adjust this based on your space data structure
        return space.spaceImageUrl || '/images/default-space.jpg';
    };

    if (!isAuthenticated) {
        return (
            <Container className="py-4">
                <Alert variant="warning" className="text-center">
                    <h5>Vui lòng đăng nhập</h5>
                    <p>Bạn cần đăng nhập để xem danh sách không gian yêu thích.</p>
                </Alert>
            </Container>
        );
    }

    if (status === 'loading') {
        return (
            <Container className="py-4 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </Spinner>
                <p className="mt-2">Đang tải danh sách yêu thích...</p>
            </Container>
        );
    }

    if (status === 'failed') {
        return (
            <Container className="py-4">
                <Alert variant="danger">
                    <h5>Lỗi khi tải dữ liệu</h5>
                    <p>{error || 'Không thể tải danh sách không gian yêu thích.'}</p>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <Row className="mb-4">
                <Col>
                    <h2 className="mb-3">
                        Không gian yêu thích 
                        <Badge bg="secondary" className="ms-2">{favoriteSpaces.length}</Badge>
                    </h2>
                    <p className="text-muted">
                        Danh sách các không gian làm việc bạn đã lưu để xem sau.
                    </p>
                </Col>
            </Row>

            {favoriteSpaces.length === 0 ? (
                <Row>
                    <Col>
                        <Alert variant="info" className="text-center">
                            <h5>Chưa có không gian yêu thích</h5>
                            <p>
                                Bạn chưa lưu không gian nào. Hãy tìm kiếm và lưu những không gian làm việc 
                                mà bạn quan tâm để dễ dàng truy cập sau này.
                            </p>
                        </Alert>
                    </Col>
                </Row>
            ) : (
                <Row>
                    {favoriteSpaces.map((favoriteSpace) => (
                        <Col key={favoriteSpace.id} xs={12} sm={6} lg={4} className="mb-4">
                            <Card 
                                className="h-100 shadow-sm hover-card"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSpaceClick(favoriteSpace.spaceId)}
                            >
                                <Card.Img
                                    variant="top"
                                    src={getImageUrl(favoriteSpace)}
                                    style={{ height: '200px', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.src = '/images/default-space.jpg';
                                    }}
                                />
                                <Card.Body className="d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <Card.Title className="h6 mb-0 flex-grow-1">
                                            {favoriteSpace.spaceName || 'Không gian làm việc'}
                                        </Card.Title>
                                        <FavoriteButton 
                                            spaceId={favoriteSpace.spaceId}
                                            size="sm"
                                            showCount={false}
                                            className="ms-2"
                                        />
                                    </div>
                                    
                                    {favoriteSpace.spaceAddress && (
                                        <Card.Text className="text-muted small mb-2">
                                            📍 {favoriteSpace.spaceAddress}
                                        </Card.Text>
                                    )}
                                    
                                    {favoriteSpace.spacePricePerHour && (
                                        <Card.Text className="text-primary fw-bold mb-2">
                                            {favoriteSpace.spacePricePerHour.toLocaleString()} VNĐ/giờ
                                        </Card.Text>
                                    )}
                                    
                                    <Card.Text className="text-muted small mt-auto">
                                        Đã lưu: {new Date(favoriteSpace.createdAt).toLocaleDateString('vi-VN')}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default FavoriteSpacesPage;
