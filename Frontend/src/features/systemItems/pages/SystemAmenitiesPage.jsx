// src/features/systemItems/pages/SystemAmenitiesPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { fetchSystemAmenities, deleteSystemAmenity } from '../slices/systemAmenitiesSlice';
import SystemAmenityModal from '../components/SystemAmenityModal';

const SystemAmenitiesPage = () => {
    const dispatch = useDispatch();
    const amenities = useSelector(state => state.systemAmenities.amenities);
    const status = useSelector(state => state.systemAmenities.status);
    const error = useSelector(state => state.systemAmenities.error);

    const [showModal, setShowModal] = useState(false);
    const [selectedAmenity, setSelectedAmenity] = useState(null);

    useEffect(() => {
        // Fetch data when component mounts
        dispatch(fetchSystemAmenities());
    }, [dispatch]);

    const handleAdd = () => {
        setSelectedAmenity(null);
        setShowModal(true);
    };

    const handleEdit = (amenity) => {
        setSelectedAmenity(amenity);
        setShowModal(true);
    };

    const handleDelete = (amenityId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tiện ích này?')) {
            dispatch(deleteSystemAmenity(amenityId));
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedAmenity(null);
    };

    if (status === 'loading' && !amenities?.length) {
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
                <h2>Quản lý Tiện ích Hệ thống</h2>
                <Button variant="primary" onClick={handleAdd}>
                    <FaPlus className="me-2" /> Thêm tiện ích mới
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Row xs={1} sm={2} lg={3} className="g-4">
                {amenities?.length > 0 ? (
                    amenities.map(amenity => (
                        <Col key={amenity.id}>
                            <Card className="h-100 shadow-sm">
                                <Card.Body>
                                    <Card.Title className="d-flex justify-content-between align-items-start">
                                        <span>{amenity.name}</span>
                                        <Badge bg={amenity.isActive ? "success" : "secondary"}>
                                            {/* {amenity.isActive ? "Hoạt động" : "Không hoạt động"} */}
                                        </Badge>
                                    </Card.Title>
                                    <Card.Text>{amenity.description}</Card.Text>
                                    {amenity.icon && (
                                        <div className="mt-3">
                                            <Badge bg="info" className="me-2">
                                                Icon: {amenity.icon}
                                            </Badge>
                                        </div>
                                    )}
                                </Card.Body>
                                <Card.Footer className="bg-transparent border-top-0">
                                    <div className="d-flex justify-content-end gap-2">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleEdit(amenity)}
                                        >
                                            <FaEdit className="me-1" /> Sửa
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(amenity.id)}
                                        >
                                            <FaTrash className="me-1" /> Xóa
                                        </Button>
                                    </div>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col xs={12}>
                        <Alert variant="info">
                            Chưa có tiện ích nào trong hệ thống. Hãy thêm tiện ích mới!
                        </Alert>
                    </Col>
                )}
            </Row>

            <SystemAmenityModal
                show={showModal}
                onHide={handleCloseModal}
                amenity={selectedAmenity}
            />
        </Container>
    );
};

export default SystemAmenitiesPage;
