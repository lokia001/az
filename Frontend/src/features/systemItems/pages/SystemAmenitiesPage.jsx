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
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6); // 6 items per page (2 rows of 3 cards)

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

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAmenities = amenities?.slice(indexOfFirstItem, indexOfLastItem) || [];
    const totalPages = Math.ceil((amenities?.length || 0) / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
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

            <div className="row g-3">
                {currentAmenities?.length > 0 ? (
                    currentAmenities.map(amenity => (
                        <div key={amenity.id} className="col-12 col-md-6 col-lg-4">
                            <div className="card h-100 shadow-sm border">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h5 className="card-title mb-0">{amenity.name}</h5>
                                        <span className={`badge ${amenity.isActive ? "bg-success" : "bg-secondary"}`}>
                                            {/* {amenity.isActive ? "Hoạt động" : "Không hoạt động"} */}
                                        </span>
                                    </div>
                                    <p className="card-text text-muted">{amenity.description}</p>
                                    {amenity.icon && (
                                        <div className="mt-3">
                                            <span className="badge bg-info me-2">
                                                Icon: {amenity.icon}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="card-footer bg-transparent border-top-0">
                                    <div className="d-flex justify-content-end gap-2">
                                        <button
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => handleEdit(amenity)}
                                        >
                                            <FaEdit className="me-1" /> Sửa
                                        </button>
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => handleDelete(amenity.id)}
                                        >
                                            <FaTrash className="me-1" /> Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12">
                        <div className="alert alert-info">
                            Chưa có tiện ích nào trong hệ thống. Hãy thêm tiện ích mới!
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <nav aria-label="Amenities pagination" className="mt-4">
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button 
                                className="page-link" 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Trước
                            </button>
                        </li>
                        
                        {[...Array(totalPages)].map((_, index) => {
                            const pageNumber = index + 1;
                            return (
                                <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                                    <button 
                                        className="page-link" 
                                        onClick={() => handlePageChange(pageNumber)}
                                    >
                                        {pageNumber}
                                    </button>
                                </li>
                            );
                        })}
                        
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button 
                                className="page-link" 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Sau
                            </button>
                        </li>
                    </ul>
                </nav>
            )}

            <SystemAmenityModal
                show={showModal}
                onHide={handleCloseModal}
                amenity={selectedAmenity}
            />
        </Container>
    );
};

export default SystemAmenitiesPage;
