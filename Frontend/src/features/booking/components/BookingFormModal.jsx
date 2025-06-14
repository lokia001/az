// src/features/booking/components/BookingFormModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createBooking, clearCreateStatus } from '../slices/bookingSlice';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import './BookingFormModal.css';

// Inline styles for better visibility
const styles = {
    calendarWrapper: {
        position: 'relative',
        marginBottom: '20px'
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

    // Set initial values when modal opens
    useEffect(() => {
        if (show) {
            const now = new Date();
            // Round to next 30 minutes
            now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30);
            now.setSeconds(0);
            now.setMilliseconds(0);
            
            const defaultEnd = new Date(now);
            defaultEnd.setHours(defaultEnd.getHours() + 2); // Default 2 hour duration
            
            setStartDateTime(now);
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

        // Validate start time
        if (!startDateTime) {
            errors.startTime = 'Vui lòng chọn thời gian bắt đầu';
        } else if (startDateTime < now) {
            errors.startTime = 'Thời gian bắt đầu không được ở quá khứ';
        }

        // Validate end time
        if (!endDateTime) {
            errors.endTime = 'Vui lòng chọn thời gian kết thúc';
        } else if (endDateTime <= startDateTime) {
            errors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
        }

        // Calculate duration in hours
        const duration = (endDateTime - startDateTime) / (1000 * 60 * 60);
        if (duration > 8) {
            errors.endTime = 'Thời gian đặt không được vượt quá 8 giờ';
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
            numberOfGuests: parseInt(numGuests, 10),
            notes: additionalNotes,
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
            <Modal show={show} onHide={onHide} size="lg">
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
                        <div className="datetime-picker-container mb-4">
                            <Form.Group>
                                <Form.Label>Thời gian bắt đầu</Form.Label>
                                <div className="datetime-picker-wrapper">
                                    <DateTimePicker
                                        onChange={setStartDateTime}
                                        value={startDateTime}
                                        format="y-MM-dd HH:mm"
                                        disableClock={false}
                                        minDate={new Date()}
                                        className={formErrors.startTime ? 'is-invalid' : ''}
                                        calendarIcon={null}
                                        clearIcon={null}
                                        hourPlaceholder="hh"
                                        minutePlaceholder="mm"
                                        dayPlaceholder="dd"
                                        monthPlaceholder="mm"
                                        yearPlaceholder="yyyy"
                                    />
                                    {formErrors.startTime && (
                                        <div className="invalid-feedback d-block">
                                            {formErrors.startTime}
                                        </div>
                                    )}
                                </div>
                            </Form.Group>
                        </div>

                        <div className="datetime-picker-container mb-4">
                            <Form.Group>
                                <Form.Label>Thời gian kết thúc</Form.Label>
                                <div className="datetime-picker-wrapper">
                                    <DateTimePicker
                                        onChange={setEndDateTime}
                                        value={endDateTime}
                                        format="y-MM-dd HH:mm"
                                        disableClock={false}
                                        minDate={startDateTime}
                                        className={formErrors.endTime ? 'is-invalid' : ''}
                                        calendarIcon={null}
                                        clearIcon={null}
                                        hourPlaceholder="hh"
                                        minutePlaceholder="mm"
                                        dayPlaceholder="dd"
                                        monthPlaceholder="mm"
                                        yearPlaceholder="yyyy"
                                    />
                                    {formErrors.endTime && (
                                        <div className="invalid-feedback d-block">
                                            {formErrors.endTime}
                                        </div>
                                    )}
                                </div>
                            </Form.Group>
                        </div>

                        <Form.Group className="mb-3" controlId="numGuests">
                            <Form.Label>Số lượng khách *</Form.Label>
                            <Form.Control
                                type="number"
                                value={numGuests}
                                onChange={(e) => setNumGuests(parseInt(e.target.value, 10))}
                                min="1"
                                max={space.capacity}
                                isInvalid={!!formErrors.numGuests}
                            />
                            <Form.Text className="text-muted">Tối đa: {space.capacity} người</Form.Text>
                            <Form.Control.Feedback type="invalid">{formErrors.numGuests}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="additionalNotes">
                            <Form.Label>Ghi chú bổ sung (Tùy chọn)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Mọi yêu cầu đặc biệt hoặc thông tin..."
                                value={additionalNotes}
                                onChange={(e) => setAdditionalNotes(e.target.value)}
                            />
                        </Form.Group>

                        <div className="text-end mt-4">
                            <h5 className="mb-1">Giá ước tính:
                                <span className="text-success fw-bold ms-2">
                                    {estimatedPrice.toLocaleString('vi-VN')} VND
                                </span>
                            </h5>
                            <p className="text-muted small">
                                (Thời gian: {calculatedDurationHours.toFixed(1)} giờ. Giá cuối cùng sẽ được xác nhận khi đặt phòng.)
                            </p>
                        </div>

                        {/* Display API error message during booking submission */}
                        {bookingCreateStatus === 'failed' && bookingCreateError && (
                            <Alert variant="danger" className="mt-3">{bookingCreateError}</Alert>
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