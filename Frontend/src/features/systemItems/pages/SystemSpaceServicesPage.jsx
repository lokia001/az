// src/features/systemItems/pages/SystemSpaceServicesPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { fetchSystemSpaceServices, deleteSystemSpaceService } from '../slices/systemSpaceServicesSlice';
import SystemSpaceServiceModal from '../components/SystemSpaceServiceModal';

const SystemSpaceServicesPage = () => {
    const dispatch = useDispatch();
    const services = useSelector(state => state.systemSpaceServices.services);
    const status = useSelector(state => state.systemSpaceServices.status);
    const error = useSelector(state => state.systemSpaceServices.error);

    const [showModal, setShowModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchSystemSpaceServices());
        }
    }, [status, dispatch]);

    const handleAdd = () => {
        setSelectedService(null);
        setShowModal(true);
    };

    const handleEdit = (service) => {
        setSelectedService(service);
        setShowModal(true);
    };

    const handleDelete = async (serviceId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
            dispatch(deleteSystemSpaceService(serviceId));
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedService(null);
    };

    if (status === 'loading') {
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
                <h2>Quản lý Dịch vụ Không gian</h2>
                <Button variant="primary" onClick={handleAdd}>
                    <FaPlus className="me-2" /> Thêm dịch vụ mới
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Row xs={1} sm={2} lg={3} className="g-4">
                {services.map(service => (
                    <Col key={service.id}>
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <Card.Title className="d-flex justify-content-between align-items-start">
                                    {service.name}
                                    <Badge bg={service.isActive ? "success" : "secondary"}>
                                        {/* {service.isActive ? "Hoạt động" : "Không hoạt động"} */}
                                    </Badge>
                                </Card.Title>
                                <Card.Text>{service.description}</Card.Text>
                                <div className="mt-2">
                                    <Badge bg="info" className="me-2">
                                        Loại: {service.category || 'N/A'}
                                    </Badge>
                                    {service.price && (
                                        <Badge bg="primary">
                                            Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.price)}
                                        </Badge>
                                    )}
                                </div>
                            </Card.Body>
                            <Card.Footer className="bg-transparent border-top-0">
                                <div className="d-flex justify-content-end gap-2">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleEdit(service)}
                                    >
                                        <FaEdit /> Sửa
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDelete(service.id)}
                                    >
                                        <FaTrash /> Xóa
                                    </Button>
                                </div>
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>

            <SystemSpaceServiceModal
                show={showModal}
                onHide={handleCloseModal}
                service={selectedService}
            />
        </Container>
    );
};

export default SystemSpaceServicesPage;
