// src/features/ownerBookingManagement/components/AddOwnerBookingModal.jsx
import React, { useState, useEffect } from 'react';
import { 
    Modal, Form, Button, Row, Col, Alert, Spinner,
    InputGroup, Badge, Card, ListGroup
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Search, CheckCircle, XCircle } from 'react-bootstrap-icons';
import { getOwnerSpaces, searchUsers } from '../../../services/api';

const AddOwnerBookingModal = ({ 
    show, 
    onHide, 
    onSubmit, 
    isSubmitting = false,
    error = null 
}) => {
    const { t } = useTranslation();
    
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

    // Reset form when modal opens/closes
    useEffect(() => {
        if (show) {
            resetForm();
            loadSpaces();
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
    };

    const loadSpaces = async () => {
        try {
            setLoadingSpaces(true);
            const spacesData = await getOwnerSpaces();
            setSpaces(spacesData || []);
        } catch (error) {
            console.error('Failed to load spaces:', error);
        } finally {
            setLoadingSpaces(false);
        }
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
            if (new Date(formData.endTime) <= new Date(formData.startTime)) {
                errors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
            }
        }

        if (formData.numberOfPeople < 1) {
            errors.numberOfPeople = 'Số người phải lớn hơn 0';
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
                                <Form.Label>Không gian <span className="text-danger">*</span></Form.Label>
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
                            </Form.Group>
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
                                    timeIntervals={30}
                                    dateFormat="dd/MM/yyyy HH:mm"
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
                                    timeIntervals={30}
                                    dateFormat="dd/MM/yyyy HH:mm"
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
    );
};

export default AddOwnerBookingModal;
