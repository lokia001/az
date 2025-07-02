// src/features/ownerBookingManagement/components/AddOwnerBookingModal.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    Modal, Form, Button, Row, Col, Alert, Spinner,
    InputGroup, Badge, Card, ListGroup, Accordion, ButtonGroup
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Search, CheckCircle, XCircle, FunnelFill } from 'react-bootstrap-icons';
import { getOwnerSpaces, searchUsers, getSystemAmenities, getSystemSpaceServices } from '../../../services/api';
import { selectOwnerBookingCreateStatus, selectOwnerBookingCreateError, clearCreateStatus } from '../slices/ownerBookingSlice';

const AddOwnerBookingModal = ({ 
    show, 
    onHide, 
    onSubmit, 
    isSubmitting = false,
    error = null,
    currentUser = null  // Add currentUser prop
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    
    // Redux state
    const createStatus = useSelector(selectOwnerBookingCreateStatus);
    const createError = useSelector(selectOwnerBookingCreateError);
    
    // Form state
    const [formData, setFormData] = useState({
        spaceId: '',
        startTime: null,
        endTime: null,
        numberOfPeople: 1,
        notes: '',
        isGuestBooking: false,
        userId: null,
        guestName: '',
        guestEmail: '',
        guestPhone: ''
    });
    
    // UI state
    const [spaces, setSpaces] = useState([]);
    const [loadingSpaces, setLoadingSpaces] = useState(false);
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [searchedUsers, setSearchedUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [validation, setValidation] = useState({});
    const [priceInfo, setPriceInfo] = useState(null);
    
    // Filter states
    const [allSpaces, setAllSpaces] = useState([]); // Store original spaces
    const [spaceFilters, setSpaceFilters] = useState({
        priceRange: 'all',
        selectedAmenities: [],
        selectedServices: [],
        spaceType: 'all',
        showFilters: false
    });
    const [systemAmenities, setSystemAmenities] = useState([]);
    const [systemSpaceServices, setSystemSpaceServices] = useState([]);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [showAllServices, setShowAllServices] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (show) {
            resetForm();
            loadSpaces();
            loadSystemAmenities();
            loadSystemSpaceServices();
        }
    }, [show]);

    // Calculate price when time changes
    useEffect(() => {
        if (formData.startTime && formData.endTime && selectedSpace) {
            calculatePrice();
        } else {
            setPriceInfo(null);
        }
    }, [formData.startTime, formData.endTime, selectedSpace]);

    // Filter spaces when filters change
    useEffect(() => {
        if (allSpaces.length > 0) {
            const filtered = filterSpaces(allSpaces);
            setSpaces(filtered);
        }
    }, [allSpaces, spaceFilters]);

    // Monitor create status for success notification
    useEffect(() => {
        if (createStatus === 'succeeded') {
            setShowSuccessModal(true);
            // Reset form after showing success
            setTimeout(() => {
                resetForm();
                onHide();
                dispatch(clearCreateStatus());
            }, 2500);
        }
    }, [createStatus, dispatch, onHide]);

    const resetForm = () => {
        setFormData({
            spaceId: '',
            startTime: null,
            endTime: null,
            numberOfPeople: 1,
            notes: '',
            isGuestBooking: false,
            userId: null,
            guestName: '',
            guestEmail: '',
            guestPhone: ''
        });
        setSelectedSpace(null);
        setSelectedUser(null);
        setUserSearchQuery('');
        setSearchedUsers([]);
        setValidation({});
        setPriceInfo(null);
        setSpaceFilters({
            priceRange: 'all',
            selectedAmenities: [],
            selectedServices: [],
            spaceType: 'all',
            showFilters: false
        });
        setShowSuccessModal(false);
    };

    const loadSpaces = async () => {
        try {
            if (!currentUser?.id) {
                console.error('Current user ID not available for loading spaces');
                return;
            }
            
            setLoadingSpaces(true);
            const spacesData = await getOwnerSpaces(currentUser.id);
            setAllSpaces(spacesData || []);
            setSpaces(spacesData || []);
        } catch (error) {
            console.error('Failed to load spaces:', error);
        } finally {
            setLoadingSpaces(false);
        }
    };

    const loadSystemAmenities = async () => {
        try {
            const amenitiesData = await getSystemAmenities();
            setSystemAmenities(amenitiesData || []);
        } catch (error) {
            console.error('Failed to load system amenities:', error);
        }
    };

    const loadSystemSpaceServices = async () => {
        try {
            const servicesData = await getSystemSpaceServices();
            setSystemSpaceServices(servicesData || []);
        } catch (error) {
            console.error('Failed to load system space services:', error);
        }
    };

    const filterSpaces = (spacesToFilter) => {
        return spacesToFilter.filter(space => {
            // Price filter
            if (spaceFilters.priceRange !== 'all') {
                const pricePerHour = space.pricePerHour || 0;
                switch (spaceFilters.priceRange) {
                    case 'under_100k':
                        if (pricePerHour >= 100000) return false;
                        break;
                    case '100k_300k':
                        if (pricePerHour < 100000 || pricePerHour > 300000) return false;
                        break;
                    case '300k_500k':
                        if (pricePerHour < 300000 || pricePerHour > 500000) return false;
                        break;
                    case 'over_500k':
                        if (pricePerHour < 500000) return false;
                        break;
                }
            }

            // Space type filter
            if (spaceFilters.spaceType !== 'all') {
                if (space.type !== spaceFilters.spaceType) return false;
            }

            // Amenities filter
            if (spaceFilters.selectedAmenities.length > 0) {
                const spaceAmenityIds = space.systemAmenities?.map(a => a.id) || [];
                const hasAllSelectedAmenities = spaceFilters.selectedAmenities.every(
                    amenityId => spaceAmenityIds.includes(amenityId)
                );
                if (!hasAllSelectedAmenities) return false;
            }

            // Services filter
            if (spaceFilters.selectedServices.length > 0) {
                const spaceServiceIds = space.systemServices?.map(s => s.id) || [];
                const hasAllSelectedServices = spaceFilters.selectedServices.every(
                    serviceId => spaceServiceIds.includes(serviceId)
                );
                if (!hasAllSelectedServices) return false;
            }

            return true;
        });
    };

    const calculatePrice = () => {
        if (!formData.startTime || !formData.endTime || !selectedSpace) {
            setPriceInfo(null);
            return;
        }

        const start = new Date(formData.startTime);
        const end = new Date(formData.endTime);
        const durationMs = end - start;
        const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));

        if (durationHours <= 0) {
            setPriceInfo(null);
            return;
        }

        const pricePerHour = selectedSpace.pricePerHour || 0;
        const totalPrice = durationHours * pricePerHour;

        setPriceInfo({
            duration: durationHours,
            pricePerHour,
            totalPrice
        });
    };

    const handleSpaceChange = (spaceId) => {
        const space = spaces.find(s => s.id === spaceId);
        setSelectedSpace(space);
        setFormData(prev => ({ ...prev, spaceId }));
    };

    const handlePriceFilterChange = (priceRange) => {
        setSpaceFilters(prev => ({ ...prev, priceRange }));
    };

    const handleAmenityFilterToggle = (amenityId) => {
        setSpaceFilters(prev => ({
            ...prev,
            selectedAmenities: prev.selectedAmenities.includes(amenityId)
                ? prev.selectedAmenities.filter(id => id !== amenityId)
                : [...prev.selectedAmenities, amenityId]
        }));
    };

    const handleServiceFilterToggle = (serviceId) => {
        setSpaceFilters(prev => ({
            ...prev,
            selectedServices: prev.selectedServices.includes(serviceId)
                ? prev.selectedServices.filter(id => id !== serviceId)
                : [...prev.selectedServices, serviceId]
        }));
    };

    const handleSpaceTypeFilterChange = (spaceType) => {
        setSpaceFilters(prev => ({ ...prev, spaceType }));
    };

    const toggleFilters = () => {
        setSpaceFilters(prev => ({ ...prev, showFilters: !prev.showFilters }));
    };

    const clearFilters = () => {
        setSpaceFilters({
            priceRange: 'all',
            selectedAmenities: [],
            selectedServices: [],
            spaceType: 'all',
            showFilters: false
        });
    };

    const handleUserSearch = async (query) => {
        setUserSearchQuery(query);
        
        if (query.length < 2) {
            setSearchedUsers([]);
            return;
        }

        try {
            setLoadingUsers(true);
            const users = await searchUsers(query);
            setSearchedUsers(users || []);
        } catch (error) {
            console.error('Failed to search users:', error);
            setSearchedUsers([]);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setFormData(prev => ({
            ...prev,
            userId: user.id,
            isGuestBooking: false
        }));
        setUserSearchQuery(user.fullName || user.username);
        setSearchedUsers([]);
    };

    const handleGuestBookingToggle = () => {
        setFormData(prev => ({
            ...prev,
            isGuestBooking: !prev.isGuestBooking,
            userId: null
        }));
        setSelectedUser(null);
        setUserSearchQuery('');
        setSearchedUsers([]);
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.spaceId) {
            errors.spaceId = 'Vui lòng chọn không gian';
        }

        if (!formData.startTime) {
            errors.startTime = 'Vui lòng chọn thời gian bắt đầu';
        }

        if (!formData.endTime) {
            errors.endTime = 'Vui lòng chọn thời gian kết thúc';
        }

        if (formData.startTime && formData.endTime) {
            const startTime = new Date(formData.startTime);
            const endTime = new Date(formData.endTime);
            
            if (endTime <= startTime) {
                errors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
            } else if (selectedSpace) {
                // Validate booking duration constraints
                const durationMs = endTime - startTime;
                const durationMinutes = Math.ceil(durationMs / (1000 * 60));
                
                if (selectedSpace.minBookingDurationMinutes && durationMinutes < selectedSpace.minBookingDurationMinutes) {
                    errors.endTime = `Thời gian đặt tối thiểu là ${selectedSpace.minBookingDurationMinutes} phút`;
                }
                
                if (selectedSpace.maxBookingDurationMinutes && durationMinutes > selectedSpace.maxBookingDurationMinutes) {
                    errors.endTime = `Thời gian đặt tối đa là ${Math.floor(selectedSpace.maxBookingDurationMinutes / 60)} giờ ${selectedSpace.maxBookingDurationMinutes % 60 !== 0 ? `${selectedSpace.maxBookingDurationMinutes % 60} phút` : ''}`;
                }

                // Validate operating hours
                if (selectedSpace.openTime && selectedSpace.closeTime) {
                    const startHour = startTime.getHours();
                    const startMinute = startTime.getMinutes();
                    const endHour = endTime.getHours();
                    const endMinute = endTime.getMinutes();

                    const [openHour, openMinute] = selectedSpace.openTime.split(':').map(Number);
                    const [closeHour, closeMinute] = selectedSpace.closeTime.split(':').map(Number);

                    const startTimeMinutes = startHour * 60 + startMinute;
                    const endTimeMinutes = endHour * 60 + endMinute;
                    const openTimeMinutes = openHour * 60 + openMinute;
                    const closeTimeMinutes = closeHour * 60 + closeMinute;

                    // Check if operates across midnight
                    const operatesAcrossMidnight = closeTimeMinutes < openTimeMinutes;

                    if (!operatesAcrossMidnight) {
                        // Normal operating hours (e.g., 9:00 - 18:00)
                        if (startTimeMinutes < openTimeMinutes || endTimeMinutes > closeTimeMinutes) {
                            errors.startTime = `Không gian chỉ hoạt động từ ${selectedSpace.openTime} đến ${selectedSpace.closeTime}`;
                        }
                    } else {
                        // Operates across midnight (e.g., 22:00 - 06:00)
                        if (startTimeMinutes < openTimeMinutes && startTimeMinutes > closeTimeMinutes) {
                            errors.startTime = `Không gian chỉ hoạt động từ ${selectedSpace.openTime} đến ${selectedSpace.closeTime} (qua đêm)`;
                        }
                        if (endTimeMinutes < openTimeMinutes && endTimeMinutes > closeTimeMinutes) {
                            errors.endTime = `Không gian chỉ hoạt động từ ${selectedSpace.openTime} đến ${selectedSpace.closeTime} (qua đêm)`;
                        }
                    }
                }
            }
        }

        if (formData.numberOfPeople < 1) {
            errors.numberOfPeople = 'Số người phải lớn hơn 0';
        } else if (selectedSpace && selectedSpace.capacity && formData.numberOfPeople > selectedSpace.capacity) {
            errors.numberOfPeople = `Số người không được vượt quá sức chứa ${selectedSpace.capacity} người`;
        }

        if (formData.isGuestBooking) {
            if (!formData.guestName?.trim()) {
                errors.guestName = 'Vui lòng nhập tên khách';
            }
            if (!formData.guestEmail?.trim()) {
                errors.guestEmail = 'Vui lòng nhập email khách';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guestEmail)) {
                errors.guestEmail = 'Email không hợp lệ';
            }
        } else {
            if (!formData.userId) {
                errors.userId = 'Vui lòng chọn khách hàng hoặc chuyển sang đặt chỗ khách';
            }
        }

        setValidation(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const bookingData = {
            spaceId: formData.spaceId,
            startTime: formData.startTime.toISOString(),
            endTime: formData.endTime.toISOString(),
            numberOfPeople: parseInt(formData.numberOfPeople),
            notes: formData.notes || '',
            ...(formData.isGuestBooking ? {
                guestName: formData.guestName,
                guestEmail: formData.guestEmail,
                guestPhone: formData.guestPhone || ''
            } : {
                userId: formData.userId
            })
        };

        await onSubmit(bookingData);
    };

    return (
        <>
        <Modal show={show} onHide={onHide} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Thêm đặt chỗ mới</Modal.Title>
            </Modal.Header>
            
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && (
                        <Alert variant="danger">
                            {error}
                        </Alert>
                    )}

                    {/* Space Selection */}
                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <Form.Label>Không gian <span className="text-danger">*</span></Form.Label>
                                    <Button 
                                        variant="outline-secondary" 
                                        size="sm"
                                        onClick={toggleFilters}
                                    >
                                        <FunnelFill className="me-1" />
                                        Lọc ({spaces.length}/{allSpaces.length})
                                    </Button>
                                </div>
                                
                                {/* Compact Filter Section */}
                                {spaceFilters.showFilters && (
                                    <Card className="mb-3">
                                        <Card.Body>
                                            <Row>
                                                <Col md={4}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label className="small">Khoảng giá</Form.Label>
                                                        <Form.Select
                                                            size="sm"
                                                            value={spaceFilters.priceRange}
                                                            onChange={(e) => handlePriceFilterChange(e.target.value)}
                                                        >
                                                            <option value="all">Tất cả giá</option>
                                                            <option value="under_100k">Dưới 100k₫/giờ</option>
                                                            <option value="100k_300k">100k - 300k₫/giờ</option>
                                                            <option value="300k_500k">300k - 500k₫/giờ</option>
                                                            <option value="over_500k">Trên 500k₫/giờ</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={4}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label className="small">Loại không gian</Form.Label>
                                                        <Form.Select
                                                            size="sm"
                                                            value={spaceFilters.spaceType}
                                                            onChange={(e) => handleSpaceTypeFilterChange(e.target.value)}
                                                        >
                                                            <option value="all">Tất cả loại</option>
                                                            <option value="Individual">Cá nhân</option>
                                                            <option value="Group">Nhóm</option>
                                                            <option value="MeetingRoom">Phòng họp</option>
                                                            <option value="EntireOffice">Văn phòng</option>
                                                            <option value="Studio">Studio</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label className="small">
                                                            Tiện ích ({spaceFilters.selectedAmenities.length})
                                                        </Form.Label>
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {(showAllAmenities ? systemAmenities : systemAmenities.slice(0, 4)).map(amenity => (
                                                                <Form.Check
                                                                    key={amenity.id}
                                                                    type="checkbox"
                                                                    id={`amenity-${amenity.id}`}
                                                                    label={amenity.name}
                                                                    className="small"
                                                                    checked={spaceFilters.selectedAmenities.includes(amenity.id)}
                                                                    onChange={() => handleAmenityFilterToggle(amenity.id)}
                                                                />
                                                            ))}
                                                        </div>
                                                        {systemAmenities.length > 4 && (
                                                            <div 
                                                                className="text-primary small" 
                                                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                                                onClick={() => setShowAllAmenities(!showAllAmenities)}
                                                            >
                                                                {showAllAmenities 
                                                                    ? 'Thu gọn'
                                                                    : `+${systemAmenities.length - 4} tiện ích khác`
                                                                }
                                                            </div>
                                                        )}
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label className="small">
                                                            Dịch vụ ({spaceFilters.selectedServices.length})
                                                        </Form.Label>
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {(showAllServices ? systemSpaceServices : systemSpaceServices.slice(0, 4)).map(service => (
                                                                <Form.Check
                                                                    key={service.id}
                                                                    type="checkbox"
                                                                    id={`service-${service.id}`}
                                                                    label={service.name}
                                                                    className="small"
                                                                    checked={spaceFilters.selectedServices.includes(service.id)}
                                                                    onChange={() => handleServiceFilterToggle(service.id)}
                                                                />
                                                            ))}
                                                        </div>
                                                        {systemSpaceServices.length > 4 && (
                                                            <div 
                                                                className="text-primary small" 
                                                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                                                onClick={() => setShowAllServices(!showAllServices)}
                                                            >
                                                                {showAllServices 
                                                                    ? 'Thu gọn'
                                                                    : `+${systemSpaceServices.length - 4} dịch vụ khác`
                                                                }
                                                            </div>
                                                        )}
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <div className="d-flex justify-content-end">
                                                <Button 
                                                    variant="outline-secondary" 
                                                    size="sm"
                                                    onClick={clearFilters}
                                                >
                                                    Xóa bộ lọc
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                )}
                                
                                <Form.Select
                                    value={formData.spaceId}
                                    onChange={(e) => handleSpaceChange(e.target.value)}
                                    isInvalid={!!validation.spaceId}
                                    disabled={loadingSpaces}
                                >
                                    <option value="">Chọn không gian...</option>
                                    {spaces.map(space => (
                                        <option key={space.id} value={space.id}>
                                            {space.name} - {space.pricePerHour?.toLocaleString()}₫/giờ
                                            {space.type && (
                                                ` [${space.type === 'Individual' ? 'Cá nhân' :
                                                space.type === 'Group' ? 'Nhóm' :
                                                space.type === 'MeetingRoom' ? 'Phòng họp' :
                                                space.type === 'EntireOffice' ? 'Văn phòng' :
                                                space.type === 'Studio' ? 'Studio' :
                                                space.type}]`
                                            )}
                                            {space.capacity && ` (${space.capacity} người)`}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {validation.spaceId}
                                </Form.Control.Feedback>
                                {loadingSpaces && (
                                    <Form.Text className="text-muted">
                                        <Spinner size="sm" className="me-1" />
                                        Đang tải không gian...
                                    </Form.Text>
                                )}
                                {!loadingSpaces && spaces.length === 0 && allSpaces.length > 0 && (
                                    <Form.Text className="text-warning">
                                        Không có không gian nào phù hợp với bộ lọc hiện tại.
                                    </Form.Text>
                                )}
                            </Form.Group>

                            {/* Space Details Information */}
                            {selectedSpace && (
                                <Card className="mt-3">
                                    <Card.Header>
                                        <h6 className="mb-0">Thông tin không gian: {selectedSpace.name}</h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={6}>
                                                <div className="mb-3">
                                                    <h6 className="text-muted mb-2">Thông tin cơ bản</h6>
                                                    <p className="mb-1"><strong>Loại:</strong> {
                                                        selectedSpace.type === 'Individual' ? 'Cá nhân' :
                                                        selectedSpace.type === 'Group' ? 'Nhóm' :
                                                        selectedSpace.type === 'MeetingRoom' ? 'Phòng họp' :
                                                        selectedSpace.type === 'EntireOffice' ? 'Văn phòng' :
                                                        selectedSpace.type === 'Studio' ? 'Studio' :
                                                        selectedSpace.type
                                                    }</p>
                                                    <p className="mb-1"><strong>Sức chứa:</strong> {selectedSpace.capacity} người</p>
                                                    <p className="mb-1"><strong>Địa chỉ:</strong> {selectedSpace.address}</p>
                                                </div>

                                                {/* Operating Hours & Booking Constraints */}
                                                <div className="mb-3">
                                                    <h6 className="text-muted mb-2">Thời gian & Ràng buộc</h6>
                                                    {selectedSpace.openTime && selectedSpace.closeTime && (
                                                        <p className="mb-1"><strong>Giờ hoạt động:</strong> {
                                                            (() => {
                                                                const openParts = selectedSpace.openTime.split(':');
                                                                const closeParts = selectedSpace.closeTime.split(':');
                                                                const openHour = openParts[0] || '00';
                                                                const openMinute = openParts[1] || '00';
                                                                const closeHour = closeParts[0] || '23';
                                                                const closeMinute = closeParts[1] || '59';
                                                                const openDisplay = `${openHour.padStart(2, '0')}:${openMinute.padStart(2, '0')}`;
                                                                const closeDisplay = `${closeHour.padStart(2, '0')}:${closeMinute.padStart(2, '0')}`;
                                                                return `${openDisplay} - ${closeDisplay}`;
                                                            })()
                                                        }</p>
                                                    )}
                                                    {selectedSpace.minBookingDurationMinutes && (
                                                        <p className="mb-1"><strong>Đặt tối thiểu:</strong> {selectedSpace.minBookingDurationMinutes} phút</p>
                                                    )}
                                                    {selectedSpace.maxBookingDurationMinutes && (
                                                        <p className="mb-1"><strong>Đặt tối đa:</strong> {Math.floor(selectedSpace.maxBookingDurationMinutes / 60)} giờ {selectedSpace.maxBookingDurationMinutes % 60 !== 0 ? `${selectedSpace.maxBookingDurationMinutes % 60} phút` : ''}</p>
                                                    )}
                                                    {selectedSpace.cancellationNoticeHours && (
                                                        <p className="mb-1"><strong>Báo trước khi hủy:</strong> {selectedSpace.cancellationNoticeHours} giờ</p>
                                                    )}
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                {/* Amenities */}
                                                {selectedSpace.systemAmenities && selectedSpace.systemAmenities.length > 0 && (
                                                    <div className="mb-3">
                                                        <h6 className="text-muted mb-2">Tiện ích</h6>
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {selectedSpace.systemAmenities.map(amenity => (
                                                                <Badge key={amenity.id} bg="secondary" className="small">
                                                                    {amenity.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Services */}
                                                {selectedSpace.systemServices && selectedSpace.systemServices.length > 0 && (
                                                    <div className="mb-3">
                                                        <h6 className="text-muted mb-2">Dịch vụ</h6>
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {selectedSpace.systemServices.map(service => (
                                                                <Badge key={service.id} bg="info" className="small">
                                                                    {service.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Custom Amenities */}
                                                {selectedSpace.customAmenities && selectedSpace.customAmenities.length > 0 && (
                                                    <div className="mb-3">
                                                        <h6 className="text-muted mb-2">Tiện ích tùy chỉnh</h6>
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {selectedSpace.customAmenities.map(amenity => (
                                                                <Badge key={amenity.id} bg="outline-secondary" className="small">
                                                                    {amenity.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Custom Services */}
                                                {selectedSpace.customServices && selectedSpace.customServices.length > 0 && (
                                                    <div className="mb-3">
                                                        <h6 className="text-muted mb-2">Dịch vụ tùy chỉnh</h6>
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {selectedSpace.customServices.map(service => (
                                                                <Badge key={service.id} bg="outline-info" className="small">
                                                                    {service.name}
                                                                    {service.price && (
                                                                        <span className="ms-1">({service.price.toLocaleString()}₫)</span>
                                                                    )}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Additional Info */}
                                                {(selectedSpace.accessInstructions || selectedSpace.houseRules) && (
                                                    <div className="mb-3">
                                                        <h6 className="text-muted mb-2">Thông tin bổ sung</h6>
                                                        {selectedSpace.accessInstructions && (
                                                            <p className="mb-1 small"><strong>Hướng dẫn vào:</strong> {selectedSpace.accessInstructions}</p>
                                                        )}
                                                        {selectedSpace.houseRules && (
                                                            <p className="mb-1 small"><strong>Nội quy:</strong> {selectedSpace.houseRules}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            )}
                        </Col>
                    </Row>

                    {/* Time Selection */}
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Thời gian bắt đầu <span className="text-danger">*</span></Form.Label>
                                <DatePicker
                                    selected={formData.startTime}
                                    onChange={(date) => setFormData(prev => ({ ...prev, startTime: date }))}
                                    showTimeSelect
                                    timeIntervals={15}
                                    timeCaption="Giờ"
                                    dateFormat="dd/MM/yyyy HH:mm"
                                    timeFormat="HH:mm"
                                    className={`form-control ${validation.startTime ? 'is-invalid' : ''}`}
                                    placeholderText="Chọn thời gian bắt đầu..."
                                    minDate={new Date()}
                                />
                                {validation.startTime && (
                                    <div className="invalid-feedback d-block">
                                        {validation.startTime}
                                    </div>
                                )}
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Thời gian kết thúc <span className="text-danger">*</span></Form.Label>
                                <DatePicker
                                    selected={formData.endTime}
                                    onChange={(date) => setFormData(prev => ({ ...prev, endTime: date }))}
                                    showTimeSelect
                                    timeIntervals={15}
                                    timeCaption="Giờ"
                                    dateFormat="dd/MM/yyyy HH:mm"
                                    timeFormat="HH:mm"
                                    className={`form-control ${validation.endTime ? 'is-invalid' : ''}`}
                                    placeholderText="Chọn thời gian kết thúc..."
                                    minDate={formData.startTime || new Date()}
                                />
                                {validation.endTime && (
                                    <div className="invalid-feedback d-block">
                                        {validation.endTime}
                                    </div>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Price Info */}
                    {priceInfo && (
                        <Alert variant="info" className="mb-3">
                            <strong>Thông tin giá:</strong>
                            <br />
                            Thời lượng: {priceInfo.duration} giờ
                            <br />
                            Giá: {priceInfo.pricePerHour.toLocaleString()}₫/giờ
                            <br />
                            <strong>Tổng tiền: {priceInfo.totalPrice.toLocaleString()}₫</strong>
                        </Alert>
                    )}

                    {/* Customer Selection */}
                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Khách hàng</Form.Label>
                                <div className="mb-2">
                                    <Form.Check
                                        type="switch"
                                        id="guest-booking-switch"
                                        label="Đặt chỗ cho khách vãng lai (không có tài khoản)"
                                        checked={formData.isGuestBooking}
                                        onChange={handleGuestBookingToggle}
                                    />
                                </div>
                                
                                {formData.isGuestBooking ? (
                                    // Guest booking form
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-2">
                                                <Form.Label>Tên khách <span className="text-danger">*</span></Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formData.guestName}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                                                    placeholder="Nhập tên khách..."
                                                    isInvalid={!!validation.guestName}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {validation.guestName}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-2">
                                                <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    value={formData.guestEmail}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, guestEmail: e.target.value }))}
                                                    placeholder="Nhập email..."
                                                    isInvalid={!!validation.guestEmail}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {validation.guestEmail}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Số điện thoại</Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    value={formData.guestPhone}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, guestPhone: e.target.value }))}
                                                    placeholder="Nhập số điện thoại..."
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                ) : (
                                    // User search form
                                    <div>
                                        <InputGroup>
                                            <Form.Control
                                                type="text"
                                                value={userSearchQuery}
                                                onChange={(e) => handleUserSearch(e.target.value)}
                                                placeholder="Tìm khách hàng theo tên hoặc email..."
                                                isInvalid={!!validation.userId}
                                            />
                                            <InputGroup.Text>
                                                {loadingUsers ? <Spinner size="sm" /> : <Search />}
                                            </InputGroup.Text>
                                        </InputGroup>
                                        {validation.userId && (
                                            <div className="invalid-feedback d-block">
                                                {validation.userId}
                                            </div>
                                        )}
                                        
                                        {selectedUser && (
                                            <Card className="mt-2">
                                                <Card.Body className="py-2">
                                                    <div className="d-flex align-items-center">
                                                        <CheckCircle className="text-success me-2" />
                                                        <div>
                                                            <strong>{selectedUser.fullName}</strong>
                                                            <br />
                                                            <small className="text-muted">{selectedUser.email}</small>
                                                        </div>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            className="ms-auto"
                                                            onClick={() => {
                                                                setSelectedUser(null);
                                                                setFormData(prev => ({ ...prev, userId: null }));
                                                                setUserSearchQuery('');
                                                            }}
                                                        >
                                                            <XCircle />
                                                        </Button>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        )}
                                        
                                        {searchedUsers.length > 0 && !selectedUser && (
                                            <ListGroup className="mt-2">
                                                {searchedUsers.map(user => (
                                                    <ListGroup.Item
                                                        key={user.id}
                                                        action
                                                        onClick={() => handleUserSelect(user)}
                                                        className="d-flex justify-content-between align-items-center"
                                                    >
                                                        <div>
                                                            <strong>{user.fullName}</strong>
                                                            <br />
                                                            <small className="text-muted">{user.email}</small>
                                                        </div>
                                                        <Badge bg="secondary">Chọn</Badge>
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        )}
                                    </div>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Additional Details */}
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Số người</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    value={formData.numberOfPeople}
                                    onChange={(e) => setFormData(prev => ({ ...prev, numberOfPeople: e.target.value }))}
                                    isInvalid={!!validation.numberOfPeople}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validation.numberOfPeople}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Notes */}
                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Ghi chú</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Nhập ghi chú (tùy chọn)..."
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Spinner size="sm" className="me-2" />}
                        {isSubmitting ? 'Đang tạo...' : 'Tạo đặt chỗ'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>

        {/* Success Modal */}
        <Modal 
            show={showSuccessModal} 
            onHide={() => setShowSuccessModal(false)}
            centered
            className="booking-success-modal"
        >
            <Modal.Body className="text-center py-4">
                <div className="booking-success-icon mb-3">
                    <CheckCircle size={48} className="text-success" />
                </div>
                <h5 className="mb-3">Đặt chỗ thành công!</h5>
                <p className="mb-2">
                    {formData.isGuestBooking 
                        ? `Đặt chỗ cho khách "${formData.guestName}" đã được tạo thành công.`
                        : `Đặt chỗ cho khách hàng "${selectedUser?.fullName || selectedUser?.username || ''}" đã được tạo thành công.`
                    }
                </p>
                <p className="text-muted mb-0">
                    <strong>Email xác nhận đã được gửi!</strong>
                </p>
            </Modal.Body>
        </Modal>
        </>
    );
};

export default AddOwnerBookingModal;
