// src/features/booking/components/BookingFormModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createBooking, clearCreateStatus } from '../slices/bookingSlice';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import './BookingFormModal.css';
import './BookingFormModal.v2.css';

// Inline styles for better visibility
const styles = {
    calendarWrapper: {
        position: 'relative',
        marginBottom: '20px'
    },
    timeSection: {
        background: '#f8f9fa',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
    },
    durationDisplay: {
        background: '#fff',
        padding: '10px 15px',
        borderRadius: '6px',
        border: '1px solid #dee2e6',
        marginTop: '15px',
        textAlign: 'center'
    },
    priceEstimate: {
        background: '#f8f9fa',
        padding: '15px 20px',
        borderRadius: '8px',
        marginTop: '20px'
    },
    timeLabel: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px',
        color: '#495057',
        fontWeight: '600'
    },
    timeIcon: {
        marginRight: '8px',
        fontSize: '1.1em'
    },
    picker: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        backgroundColor: '#fff'
    },
    errorPicker: {
        border: '1px solid #dc3545'
    },
    errorText: {
        color: '#dc3545',
        fontSize: '14px',
        marginTop: '5px'
    }
};

const BookingFormModal = ({ show, onHide, space }) => {
    const dispatch = useDispatch();
    
    // Get booking state from Redux
    const bookingCreateStatus = useSelector(state => state.booking.createStatus);
    const bookingCreateError = useSelector(state => state.booking.createError);

    const [startDateTime, setStartDateTime] = useState(new Date());
    const [endDateTime, setEndDateTime] = useState(new Date());
    const [numGuests, setNumGuests] = useState(1);
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [showToast, setShowToast] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    // Helper function to get next valid start time
    const getNextValidStartTime = (time) => {
        const validTime = new Date(time);
        validTime.setSeconds(0);
        validTime.setMilliseconds(0);

        // Round to next 30 minutes
        validTime.setMinutes(Math.ceil(validTime.getMinutes() / 30) * 30);
        
        // Handle hour rollover if minutes were 60
        if (validTime.getMinutes() === 60) {
            validTime.setHours(validTime.getHours() + 1);
            validTime.setMinutes(0);
        }

        return validTime;
    };

    // Set initial values when modal opens
    useEffect(() => {
        if (show) {
            const now = new Date();
            const validStartTime = getNextValidStartTime(now);
            
            const defaultEnd = new Date(validStartTime);
            defaultEnd.setHours(defaultEnd.getHours() + 2); // Default 2 hour duration
            
            setStartDateTime(validStartTime);
            setEndDateTime(defaultEnd);
            setNumGuests(1);
            setAdditionalNotes('');
            setFormErrors({});
            setShowSuccessMessage(false);
            
            // Clear any previous booking status
            dispatch(clearCreateStatus());
        }
    }, [show, dispatch]);

    const calculatedDurationHours = useMemo(() => {
        if (!startDateTime || !endDateTime) return 0;
        const durationMillis = endDateTime.getTime() - startDateTime.getTime();
        return durationMillis / (1000 * 60 * 60); // Convert milliseconds to hours
    }, [startDateTime, endDateTime]);

    const estimatedPrice = useMemo(() => {
        if (space && space.pricePerHour && calculatedDurationHours > 0) {
            return space.pricePerHour * calculatedDurationHours;
        }
        return 0;
    }, [space, calculatedDurationHours]);


    // Validation function for the form
    const validateForm = () => {
        const errors = {};
        const now = new Date();
        now.setSeconds(0);
        now.setMilliseconds(0);

        // Validate start time
        if (!startDateTime) {
            errors.startTime = 'Vui lòng chọn thời gian bắt đầu';
        } else {
            const startTime = new Date(startDateTime);
            startTime.setSeconds(0);
            startTime.setMilliseconds(0);
            
            if (startTime < now) {
                errors.startTime = 'Thời gian bắt đầu không được ở quá khứ';
            }
            
            // Check if the minutes are on a 30-minute interval
            if (startTime.getMinutes() % 30 !== 0) {
                errors.startTime = 'Thời gian bắt đầu phải là khung giờ 30 phút (VD: 9:00, 9:30)';
            }

        }

        // Validate end time
        if (!endDateTime) {
            errors.endTime = 'Vui lòng chọn thời gian kết thúc';
        } else {
            const endTime = new Date(endDateTime);
            endTime.setSeconds(0);
            endTime.setMilliseconds(0);

            if (endTime <= startDateTime) {
                errors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
            }

            // Check if the minutes are on a 30-minute interval
            if (endTime.getMinutes() % 30 !== 0) {
                errors.endTime = 'Thời gian kết thúc phải là khung giờ 30 phút (VD: 9:00, 9:30)';
            }

            // Calculate duration in hours
            const duration = (endTime - startDateTime) / (1000 * 60 * 60);
            
            if (duration > 8) {
                errors.endTime = 'Thời gian đặt không được vượt quá 8 giờ';
            } else if (duration < 0.5) {
                errors.endTime = 'Thời gian đặt phải ít nhất 30 phút';
            }

            // Check if booking spans across days
            if (startDateTime.getDate() !== endTime.getDate()) {
                errors.endTime = 'Không thể đặt chỗ qua ngày khác';
            }
        }

        // Validate number of guests
        if (!numGuests || numGuests < 1) {
            errors.numGuests = 'Vui lòng nhập ít nhất 1 khách';
        } else if (space && numGuests > space.capacity) {
            errors.numGuests = `Sức chứa tối đa là ${space.capacity} khách`;
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Monitor booking status changes
    useEffect(() => {
        if (bookingCreateStatus === 'succeeded') {
            setShowSuccessMessage(true);
            // Close modal after showing success message
            setTimeout(() => {
                onHide();
                dispatch(clearCreateStatus());
            }, 2000);
        }
    }, [bookingCreateStatus, dispatch, onHide]);

    const handleConfirmBooking = async (e) => {
        e.preventDefault();
        setFormErrors({});

        if (!validateForm()) {
            return;
        }

        const bookingData = {
            spaceId: space.id,
            startTime: startDateTime.toISOString(),  
            endTime: endDateTime.toISOString(),
            numberOfPeople: parseInt(numGuests, 10),
            notes: additionalNotes || '',
            totalPrice: estimatedPrice,
            status: 'Pending' // Default status for new bookings
        };

        console.log('Booking Data to be submitted:', bookingData);
        
        // Dispatch the create booking action
        dispatch(createBooking(bookingData));
    };

    if (!space) return null; // Don't render if no space data

    return (
        <>
            <Modal show={show} onHide={onHide} size="lg" className="booking-form-modal">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Đặt không gian: {space?.name}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="info" className="mb-3">
                        <p className="mb-1"><strong>Bạn đang đặt:</strong> {space?.name}</p>
                        {space?.pricePerHour && (
                            <p className="mb-1">
                                <strong>Giá:</strong> {space.pricePerHour.toLocaleString('vi-VN')} VND/giờ
                            </p>
                        )}
                        <p className="mb-0">
                            <strong>Sức chứa:</strong> {space?.capacity} người
                        </p>
                    </Alert>

                    <Form onSubmit={handleConfirmBooking}>
                        <div style={styles.timeSection} className="booking-time-section mb-4">
                            <h6 className="text-primary mb-3">
                                <i className="bi bi-clock-history me-2"></i>
                                Thời gian đặt chỗ
                            </h6>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <div style={styles.timeLabel}>
                                            <i className="bi bi-clock" style={styles.timeIcon}></i>
                                            Thời gian bắt đầu
                                        </div>
                                        <div className="datetime-picker-wrapper">
                                            <DateTimePicker
                                                onChange={setStartDateTime}
                                                value={startDateTime}
                                                format="dd/MM/y HH:mm"
                                                disableClock={false}
                                                minDate={new Date()}
                                                className={`form-control larger-picker ${formErrors.startTime ? 'is-invalid' : ''}`}
                                                calendarIcon={<i className="bi bi-calendar3"></i>}
                                                clearIcon={null}
                                                hourPlaceholder="HH"
                                                minutePlaceholder="mm"
                                                dayPlaceholder="DD"
                                                monthPlaceholder="MM"
                                                yearPlaceholder="YYYY"
                                                minuteStep={30}
                                                locale="vi-VN"
                                                autoFocus
                                            />
                                            {formErrors.startTime && (
                                                <div className="invalid-feedback d-block">
                                                    <i className="bi bi-exclamation-circle me-1"></i>
                                                    {formErrors.startTime}
                                                </div>
                                            )}
                                            <small className="text-muted d-block mt-1">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Chọn khung giờ 30 phút
                                            </small>
                                        </div>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <div style={styles.timeLabel}>
                                            <i className="bi bi-clock-fill" style={styles.timeIcon}></i>
                                            Thời gian kết thúc
                                        </div>
                                        <div className="datetime-picker-wrapper">
                                            <DateTimePicker
                                                onChange={setEndDateTime}
                                                value={endDateTime}
                                                format="dd/MM/y HH:mm"
                                                disableClock={false}
                                                minDate={startDateTime}
                                                className={`form-control larger-picker ${formErrors.endTime ? 'is-invalid' : ''}`}
                                                calendarIcon={<i className="bi bi-calendar3"></i>}
                                                clearIcon={null}
                                                hourPlaceholder="HH"
                                                minutePlaceholder="mm"
                                                dayPlaceholder="DD"
                                                monthPlaceholder="MM"
                                                yearPlaceholder="YYYY"
                                                minuteStep={30}
                                                locale="vi-VN"
                                            />
                                            {formErrors.endTime && (
                                                <div className="invalid-feedback d-block">
                                                    <i className="bi bi-exclamation-circle me-1"></i>
                                                    {formErrors.endTime}
                                                </div>
                                            )}
                                            <small className="text-muted d-block mt-1">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Tối đa 8 giờ
                                            </small>
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>
                            
                            <div style={styles.durationDisplay}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <i className="bi bi-stopwatch me-2 text-primary"></i>
                                        <strong>Thời lượng:</strong>
                                        <span className="ms-2">{calculatedDurationHours.toFixed(1)} giờ</span>
                                    </div>
                                    <div className="text-success">
                                        <i className="bi bi-cash me-2"></i>
                                        <strong>{estimatedPrice.toLocaleString('vi-VN')} VND</strong>
                                    </div>
                                </div>
                                <div className="progress mt-2" style={{ height: '6px' }}>
                                    <div 
                                        className="progress-bar bg-primary" 
                                        role="progressbar" 
                                        style={{ width: `${(calculatedDurationHours / 8) * 100}%` }}
                                        aria-valuenow={calculatedDurationHours}
                                        aria-valuemin="0"
                                        aria-valuemax="8"
                                    ></div>
                                </div>
                                <small className="text-muted d-block mt-1">
                                    Giá cuối cùng sẽ được xác nhận khi đặt phòng
                                </small>
                            </div>
                        </div>

                        <Form.Group className="mb-3" controlId="numGuests">
                            <Form.Label className="fw-bold">
                                <i className="bi bi-people me-2"></i>
                                Số lượng khách *
                            </Form.Label>
                            <Form.Control
                                type="number"
                                value={numGuests}
                                onChange={(e) => setNumGuests(parseInt(e.target.value, 10))}
                                min="1"
                                max={space.capacity}
                                isInvalid={!!formErrors.numGuests}
                            />
                            <Form.Text className="text-muted">
                                <i className="bi bi-info-circle me-1"></i>
                                Tối đa: {space.capacity} người
                            </Form.Text>
                            <Form.Control.Feedback type="invalid">
                                <i className="bi bi-exclamation-circle me-1"></i>
                                {formErrors.numGuests}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="additionalNotes">
                            <Form.Label className="fw-bold">
                                <i className="bi bi-pencil me-2"></i>
                                Ghi chú bổ sung (Tùy chọn)
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Mọi yêu cầu đặc biệt hoặc thông tin bổ sung..."
                                value={additionalNotes}
                                onChange={(e) => setAdditionalNotes(e.target.value)}
                            />
                        </Form.Group>

                        {/* Display API error message during booking submission */}
                        {bookingCreateStatus === 'failed' && bookingCreateError && (
                            <Alert variant="danger">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                {bookingCreateError}
                            </Alert>
                        )}

                        {formErrors.general && (
                            <Alert variant="danger" className="mt-3">{formErrors.general}</Alert>
                        )}

                    </Form>
                </Modal.Body>
                
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirmBooking}
                        disabled={bookingCreateStatus === 'loading'}
                    >
                        {bookingCreateStatus === 'loading' ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Đang xử lý...
                            </>
                        ) : 'Xác nhận đặt phòng'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Success Modal */}
            <Modal 
                show={showSuccessMessage} 
                onHide={() => setShowSuccessMessage(false)}
                centered
                className="booking-success-modal"
            >
                <Modal.Body className="text-center py-4">
                    <div className="booking-success-icon">
                        <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <h5 className="mb-3">Đặt phòng thành công!</h5>
                    <p className="mb-0">Bạn đã đặt phòng "{space?.name}" thành công.</p>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default BookingFormModal;