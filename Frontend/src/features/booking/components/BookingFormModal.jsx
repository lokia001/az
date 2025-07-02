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
import './BookingFormModal.css';
import './BookingFormModal.v2.css';

// Inline styles for better visibility
const styles = {
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
    }
};

const BookingFormModal = ({ show, onHide, space }) => {
    const dispatch = useDispatch();
    
    // Get booking state from Redux
    const bookingCreateStatus = useSelector(state => state.booking.createStatus);
    const bookingCreateError = useSelector(state => state.booking.createError);

    const [startDateTime, setStartDateTime] = useState(new Date());
    const [endDateTime, setEndDateTime] = useState(new Date());
    
    // Separate date and time inputs for better UX
    const [bookingDate, setBookingDate] = useState(''); // Start date
    const [endDate, setEndDate] = useState(''); // End date
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    
    const [numGuests, setNumGuests] = useState(1);
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [showToast, setShowToast] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    // Dynamic booking constraints based on space data
    const getBookingConstraints = () => {
        if (!space) return {
            minDurationMinutes: 30,
            maxDurationMinutes: 480,
            maxDurationHours: 8
        };
        
        return {
            minDurationMinutes: space.minBookingDurationMinutes || 30,
            maxDurationMinutes: space.maxBookingDurationMinutes || 480,
            maxDurationHours: Math.floor((space.maxBookingDurationMinutes || 480) / 60)
        };
    };

    const constraints = getBookingConstraints();

    // Helper functions to work with separate date/time inputs
    const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatTimeForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const combineDateTime = (dateStr, timeStr) => {
        if (!dateStr || !timeStr) return null;
        const [year, month, day] = dateStr.split('-').map(Number);
        const [hours, minutes] = timeStr.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes);
    };

    // Generate time options with fixed 15-minute intervals for better UX
    const timeOptions = useMemo(() => {
        const options = [];
        // Always use 15-minute intervals for time selection regardless of space constraints
        const stepMinutes = 15;
        
        // Parse space opening/closing hours if available
        let openHour = 0, openMinute = 0;
        let closeHour = 23, closeMinute = 59;
        
        if (space?.openTime) {
            // Parse time string like "06:00:00" or "6:00"
            const openParts = space.openTime.split(':').map(Number);
            openHour = openParts[0] || 0;
            openMinute = openParts[1] || 0;
        }
        
        if (space?.closeTime) {
            // Parse time string like "22:00:00" or "22:00"
            const closeParts = space.closeTime.split(':').map(Number);
            closeHour = closeParts[0] || 23;
            closeMinute = closeParts[1] || 59;
        }
        
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += stepMinutes) {
                // Check if this time falls within operating hours
                const currentTime = hour * 60 + minute; // Convert to minutes for comparison
                const openTimeMinutes = openHour * 60 + openMinute;
                const closeTimeMinutes = closeHour * 60 + closeMinute;
                
                // Handle case where space operates across midnight (e.g., 22:00 to 06:00)
                const isWithinHours = closeTimeMinutes > openTimeMinutes
                    ? (currentTime >= openTimeMinutes && currentTime <= closeTimeMinutes)
                    : (currentTime >= openTimeMinutes || currentTime <= closeTimeMinutes);
                
                // Only add time options that fall within operating hours
                if (!space?.openTime && !space?.closeTime) {
                    // If no operating hours are set, allow all times
                    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                    const displayStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                    options.push({ value: timeStr, label: displayStr });
                } else if (isWithinHours) {
                    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                    const displayStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                    options.push({ value: timeStr, label: displayStr });
                }
            }
        }
        return options;
    }, [space?.openTime, space?.closeTime]);

    // Update startDateTime and endDateTime when individual inputs change
    useEffect(() => {
        if (bookingDate && startTime) {
            const newStartDateTime = combineDateTime(bookingDate, startTime);
            if (newStartDateTime) {
                setStartDateTime(newStartDateTime);
            }
        }
    }, [bookingDate, startTime]);

    useEffect(() => {
        if (endDate && endTime) {
            const newEndDateTime = combineDateTime(endDate, endTime);
            if (newEndDateTime) {
                setEndDateTime(newEndDateTime);
            }
        }
    }, [endDate, endTime]);

    // Helper function to get next valid start time based on space constraints
    const getNextValidStartTime = (time) => {
        const validTime = new Date(time);
        validTime.setSeconds(0);
        validTime.setMilliseconds(0);

        // Round to next 15-minute interval for UI consistency
        const stepMinutes = 15;
        validTime.setMinutes(Math.ceil(validTime.getMinutes() / stepMinutes) * stepMinutes);
        
        // Handle hour rollover if minutes were 60 or more
        if (validTime.getMinutes() >= 60) {
            validTime.setHours(validTime.getHours() + Math.floor(validTime.getMinutes() / 60));
            validTime.setMinutes(validTime.getMinutes() % 60);
        }

        return validTime;
    };

    // Get suggested booking duration based on space constraints
    const getSuggestedDuration = () => {
        const minHours = Math.ceil(constraints.minDurationMinutes / 60);
        const maxHours = constraints.maxDurationHours;
        
        // Suggest a reasonable duration: at least minimum, but not more than 4 hours or half of max
        return Math.min(Math.max(minHours, 1), Math.min(4, Math.ceil(maxHours / 2)));
    };

    // Set initial values when modal opens
    useEffect(() => {
        if (show && space) {
            const now = new Date();
            const validStartTime = getNextValidStartTime(now);
            
            const suggestedDurationHours = getSuggestedDuration();
            const defaultEnd = new Date(validStartTime);
            defaultEnd.setHours(defaultEnd.getHours() + suggestedDurationHours);
            
            // Set combined datetime states
            setStartDateTime(validStartTime);
            setEndDateTime(defaultEnd);
            
            // Set individual input states
            setBookingDate(formatDateForInput(validStartTime));
            setEndDate(formatDateForInput(defaultEnd)); // End date might be different if crossing midnight
            setStartTime(formatTimeForInput(validStartTime));
            setEndTime(formatTimeForInput(defaultEnd));
            
            setNumGuests(1);
            setAdditionalNotes('');
            setFormErrors({});
            setShowSuccessMessage(false);
            
            // Clear any previous booking status
            dispatch(clearCreateStatus());
        }
    }, [show]); // Only depend on show to avoid reinitializing when space changes

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

    // Helper function to validate booking times against operating hours
    const validateBookingWithinOperatingHours = (startDateTime, endDateTime) => {
        if (!space?.openTime || !space?.closeTime) {
            return { valid: true };
        }
        
        // Parse operating hours
        const openParts = space.openTime.split(':').map(Number);
        const closeParts = space.closeTime.split(':').map(Number);
        const openHour = openParts[0] || 0;
        const openMinute = openParts[1] || 0;
        const closeHour = closeParts[0] || 23;
        const closeMinute = closeParts[1] || 59;
        
        // Format time for display
        const formatDisplayTime = (hour, minute) => {
            return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        };
        
        const openTimeDisplay = formatDisplayTime(openHour, openMinute);
        const closeTimeDisplay = formatDisplayTime(closeHour, closeMinute);
        
        // Check if operating hours span across midnight
        const operatingAcrossMidnight = closeHour < openHour || (closeHour === openHour && closeMinute < openMinute);
        
        // Validate start time
        const startHour = startDateTime.getHours();
        const startMinute = startDateTime.getMinutes();
        const startTimeMinutes = startHour * 60 + startMinute;
        const openTimeMinutes = openHour * 60 + openMinute;
        const closeTimeMinutes = closeHour * 60 + closeMinute;
        
        const isStartWithinHours = operatingAcrossMidnight
            ? (startTimeMinutes >= openTimeMinutes || startTimeMinutes <= closeTimeMinutes)
            : (startTimeMinutes >= openTimeMinutes && startTimeMinutes <= closeTimeMinutes);
            
        if (!isStartWithinHours) {
            if (operatingAcrossMidnight) {
                return { 
                    valid: false, 
                    error: `Không gian chỉ hoạt động từ ${openTimeDisplay} đến ${closeTimeDisplay} (qua ngày hôm sau)`
                };
            } else {
                return { 
                    valid: false, 
                    error: `Không gian chỉ hoạt động từ ${openTimeDisplay} đến ${closeTimeDisplay}`
                };
            }
        }
        
        // Validate end time
        const endHour = endDateTime.getHours();
        const endMinute = endDateTime.getMinutes();
        const endTimeMinutes = endHour * 60 + endMinute;
        
        const isEndWithinHours = operatingAcrossMidnight
            ? (endTimeMinutes >= openTimeMinutes || endTimeMinutes <= closeTimeMinutes)
            : (endTimeMinutes >= openTimeMinutes && endTimeMinutes <= closeTimeMinutes);
            
        if (!isEndWithinHours) {
            if (operatingAcrossMidnight) {
                return { 
                    valid: false, 
                    error: `Thời gian kết thúc phải trong giờ hoạt động (${openTimeDisplay} - ${closeTimeDisplay} qua ngày hôm sau)`
                };
            } else {
                return { 
                    valid: false, 
                    error: `Thời gian kết thúc phải trong giờ hoạt động (${openTimeDisplay} - ${closeTimeDisplay})`
                };
            }
        }
        
        return { valid: true };
    };

    // Validation function for the form
    const validateForm = () => {
        const errors = {};
        const now = new Date();
        now.setSeconds(0);
        now.setMilliseconds(0);

        // Validate start date
        if (!bookingDate) {
            errors.startDate = 'Vui lòng chọn ngày bắt đầu';
        } else {
            const selectedDate = new Date(bookingDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                errors.startDate = 'Không thể chọn ngày trong quá khứ';
            }
        }

        // Validate end date
        if (!endDate) {
            errors.endDate = 'Vui lòng chọn ngày kết thúc';
        } else if (bookingDate) {
            const startDateObj = new Date(bookingDate);
            const endDateObj = new Date(endDate);
            
            if (endDateObj < startDateObj) {
                errors.endDate = 'Ngày kết thúc không thể trước ngày bắt đầu';
            }
        }

        // Validate start time
        if (!startTime) {
            errors.startTime = 'Vui lòng chọn giờ bắt đầu';
        } else if (bookingDate) {
            const startDateTime = combineDateTime(bookingDate, startTime);
            if (startDateTime && startDateTime < now) {
                errors.startTime = 'Thời gian bắt đầu không được ở quá khứ';
            }
        }

        // Validate end time
        if (!endTime) {
            errors.endTime = 'Vui lòng chọn giờ kết thúc';
        } else if (startTime && bookingDate && endDate) {
            const startDateTime = combineDateTime(bookingDate, startTime);
            const endDateTime = combineDateTime(endDate, endTime);
            
            if (startDateTime && endDateTime) {
                if (endDateTime <= startDateTime) {
                    errors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
                } else {
                    // Calculate duration in minutes
                    const durationMinutes = (endDateTime - startDateTime) / (1000 * 60);
                    
                    if (durationMinutes > constraints.maxDurationMinutes) {
                        const maxHours = Math.floor(constraints.maxDurationMinutes / 60);
                        const maxMins = constraints.maxDurationMinutes % 60;
                        if (maxMins === 0) {
                            errors.endTime = `Thời gian đặt không được vượt quá ${maxHours} giờ`;
                        } else {
                            errors.endTime = `Thời gian đặt không được vượt quá ${maxHours} giờ ${maxMins} phút`;
                        }
                    } else if (durationMinutes < constraints.minDurationMinutes) {
                        const minHours = Math.floor(constraints.minDurationMinutes / 60);
                        const minMins = constraints.minDurationMinutes % 60;
                        if (minHours === 0) {
                            errors.endTime = `Thời gian đặt phải ít nhất ${minMins} phút`;
                        } else if (minMins === 0) {
                            errors.endTime = `Thời gian đặt phải ít nhất ${minHours} giờ`;
                        } else {
                            errors.endTime = `Thời gian đặt phải ít nhất ${minHours} giờ ${minMins} phút`;
                        }
                    }
                    
                    // Validate operating hours if space has them
                    if (space?.openTime && space?.closeTime) {
                        const isValidOperatingHours = validateBookingWithinOperatingHours(startDateTime, endDateTime);
                        if (!isValidOperatingHours.valid) {
                            errors.startTime = isValidOperatingHours.error;
                        }
                    }
                }
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
    }, [bookingCreateStatus, dispatch]); // Removed onHide from dependencies to prevent loops

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

                    {/* Operating Hours Info */}
                    {space?.openTime && space?.closeTime && (
                        <Alert variant="warning" className="mb-3">
                            <div className="d-flex align-items-center">
                                <i className="bi bi-clock me-2"></i>
                                <div>
                                    <strong>Giờ hoạt động:</strong>{' '}
                                    {(() => {
                                        const openParts = space.openTime.split(':');
                                        const closeParts = space.closeTime.split(':');
                                        const openHour = openParts[0] || '00';
                                        const openMinute = openParts[1] || '00';
                                        const closeHour = closeParts[0] || '23';
                                        const closeMinute = closeParts[1] || '59';
                                        const openDisplay = `${openHour.padStart(2, '0')}:${openMinute.padStart(2, '0')}`;
                                        const closeDisplay = `${closeHour.padStart(2, '0')}:${closeMinute.padStart(2, '0')}`;
                                        
                                        // Check if operates across midnight
                                        const operatesAcrossMidnight = parseInt(closeHour) < parseInt(openHour) || 
                                            (parseInt(closeHour) === parseInt(openHour) && parseInt(closeMinute) < parseInt(openMinute));
                                            
                                        return operatesAcrossMidnight 
                                            ? `${openDisplay} - ${closeDisplay} (qua ngày hôm sau)`
                                            : `${openDisplay} - ${closeDisplay}`;
                                    })()}
                                </div>
                            </div>
                        </Alert>
                    )}

                    <Form onSubmit={handleConfirmBooking}>
                        <div style={styles.timeSection} className="booking-time-section mb-4">
                            <h6 className="text-primary mb-3">
                                <i className="bi bi-clock-history me-2"></i>
                                Thời gian đặt chỗ
                            </h6>
                            
                            {/* Start Date Time */}
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">
                                            <i className="bi bi-calendar3 me-2"></i>
                                            Ngày bắt đầu
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={bookingDate}
                                            onChange={(e) => setBookingDate(e.target.value)}
                                            min={formatDateForInput(new Date())}
                                            isInvalid={!!formErrors.startDate}
                                        />
                                        {formErrors.startDate && (
                                            <Form.Control.Feedback type="invalid">
                                                <i className="bi bi-exclamation-circle me-1"></i>
                                                {formErrors.startDate}
                                            </Form.Control.Feedback>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">
                                            <i className="bi bi-clock me-2"></i>
                                            Giờ bắt đầu
                                        </Form.Label>
                                        <Form.Select
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            isInvalid={!!formErrors.startTime}
                                        >
                                            <option value="">Chọn giờ bắt đầu</option>
                                            {timeOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        {formErrors.startTime && (
                                            <Form.Control.Feedback type="invalid">
                                                <i className="bi bi-exclamation-circle me-1"></i>
                                                {formErrors.startTime}
                                            </Form.Control.Feedback>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* End Date Time */}
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">
                                            <i className="bi bi-calendar-check me-2"></i>
                                            Ngày kết thúc
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            min={bookingDate || formatDateForInput(new Date())}
                                            isInvalid={!!formErrors.endDate}
                                        />
                                        {formErrors.endDate && (
                                            <Form.Control.Feedback type="invalid">
                                                <i className="bi bi-exclamation-circle me-1"></i>
                                                {formErrors.endDate}
                                            </Form.Control.Feedback>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">
                                            <i className="bi bi-clock-fill me-2"></i>
                                            Giờ kết thúc
                                        </Form.Label>
                                        <Form.Select
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            isInvalid={!!formErrors.endTime}
                                        >
                                            <option value="">Chọn giờ kết thúc</option>
                                            {timeOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        {formErrors.endTime && (
                                            <Form.Control.Feedback type="invalid">
                                                <i className="bi bi-exclamation-circle me-1"></i>
                                                {formErrors.endTime}
                                            </Form.Control.Feedback>
                                        )}
                                        <Form.Text className="text-muted">
                                            <i className="bi bi-info-circle me-1"></i>
                                            {(() => {
                                                const maxHours = Math.floor(constraints.maxDurationMinutes / 60);
                                                const maxMins = constraints.maxDurationMinutes % 60;
                                                const minHours = Math.floor(constraints.minDurationMinutes / 60);
                                                const minMins = constraints.minDurationMinutes % 60;
                                                
                                                let text = '';
                                                if (maxMins === 0) {
                                                    text = `Tối đa ${maxHours}h`;
                                                } else {
                                                    text = `Tối đa ${maxHours}h${maxMins}p`;
                                                }
                                                
                                                if (minHours === 0) {
                                                    text += `, tối thiểu ${minMins}p`;
                                                } else if (minMins === 0) {
                                                    text += `, tối thiểu ${minHours}h`;
                                                } else {
                                                    text += `, tối thiểu ${minHours}h${minMins}p`;
                                                }
                                                
                                                return text;
                                            })()}
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>
                            
                            {/* Dynamic Booking Suggestions */}
                            <div className="booking-suggestions mb-3">
                                <h6 className="text-secondary mb-2">
                                    <i className="bi bi-lightbulb me-2"></i>
                                    Gợi ý đặt chỗ
                                </h6>
                                {(() => {
                                    // Generate smart duration suggestions based on space constraints
                                    const durations = [];
                                    const minMinutes = constraints.minDurationMinutes;
                                    const maxMinutes = constraints.maxDurationMinutes;
                                    
                                    // Helper function to format duration label
                                    const formatDurationLabel = (totalMinutes) => {
                                        const hours = Math.floor(totalMinutes / 60);
                                        const minutes = totalMinutes % 60;
                                        
                                        if (hours === 0) return `${minutes} phút`;
                                        if (minutes === 0) {
                                            if (hours === 1) return '1 giờ';
                                            if (hours === 2) return '2 giờ';
                                            if (hours === 3) return '3 giờ';
                                            if (hours === 4) return '4 giờ';
                                            if (hours === 8) return space.pricePerDay ? '8 giờ (cả ngày)' : '8 giờ';
                                            return `${hours} giờ`;
                                        }
                                        return `${hours}g${minutes}p`;
                                    };
                                    
                                    // Always add minimum duration as first option
                                    durations.push({
                                        totalMinutes: minMinutes,
                                        label: formatDurationLabel(minMinutes),
                                        isMin: true
                                    });
                                    
                                    // Generate smart suggestions based on space constraints
                                    const suggestionMinutes = [];
                                    
                                    // Add common durations that make sense for the space
                                    const commonOptions = [30, 60, 120, 180, 240, 300, 360, 480];
                                    commonOptions.forEach(minutes => {
                                        if (minutes >= minMinutes && 
                                            minutes <= maxMinutes && 
                                            minutes % minMinutes === 0 &&
                                            minutes !== minMinutes) {
                                            suggestionMinutes.push(minutes);
                                        }
                                    });
                                    
                                    // If space has daily pricing, prioritize full/half day options
                                    if (space.pricePerDay) {
                                        [240, 480].forEach(minutes => { // 4 hours, 8 hours
                                            if (minutes >= minMinutes && 
                                                minutes <= maxMinutes && 
                                                minutes % minMinutes === 0 &&
                                                !suggestionMinutes.includes(minutes)) {
                                                suggestionMinutes.unshift(minutes); // Add to beginning
                                            }
                                        });
                                    }
                                    
                                    // Add max duration if different from others and reasonable
                                    if (maxMinutes >= minMinutes && 
                                        maxMinutes % minMinutes === 0 &&
                                        !suggestionMinutes.includes(maxMinutes) &&
                                        maxMinutes !== minMinutes) {
                                        suggestionMinutes.push(maxMinutes);
                                    }
                                    
                                    // Convert to duration objects and deduplicate
                                    suggestionMinutes.forEach(minutes => {
                                        if (!durations.some(d => d.totalMinutes === minutes)) {
                                            durations.push({
                                                totalMinutes: minutes,
                                                label: formatDurationLabel(minutes),
                                                isMax: minutes === maxMinutes
                                            });
                                        }
                                    });
                                    
                                    // Sort by duration and limit to 4-5 suggestions
                                    durations.sort((a, b) => a.totalMinutes - b.totalMinutes);
                                    const limitedDurations = durations.slice(0, 5);
                                    
                                    // Create suggestion text instead of buttons
                                    return (
                                        <div className="suggestion-text-list">
                                            <div className="row">
                                                {limitedDurations.map((duration, index) => {
                                                    // Calculate price for this suggestion
                                                    const durationHours = duration.totalMinutes / 60;
                                                    const estimatedCost = space.pricePerHour ? space.pricePerHour * durationHours : 0;
                                                    
                                                    return (
                                                        <div key={index} className="col-6 mb-2">
                                                            <div className="d-flex align-items-center">
                                                                <i className="bi bi-clock text-primary me-2" style={{ fontSize: '0.9rem' }}></i>
                                                                <div className="flex-grow-1">
                                                                    <span className="fw-medium">{duration.label}</span>
                                                                    {duration.isMin && <small className="text-muted ms-1">(tối thiểu)</small>}
                                                                    {duration.isMax && <small className="text-muted ms-1">(tối đa)</small>}
                                                                    {estimatedCost > 0 && (
                                                                        <div className="small text-success">
                                                                            ~{estimatedCost.toLocaleString('vi-VN')} VND
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })()}
                                <small className="text-muted d-block mt-2">
                                    <i className="bi bi-info-circle me-1"></i>
                                    Các gợi ý thời gian phổ biến cho không gian này
                                </small>
                            </div>
                            
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
                                        style={{ width: `${(calculatedDurationHours / constraints.maxDurationHours) * 100}%` }}
                                        aria-valuenow={calculatedDurationHours}
                                        aria-valuemin="0"
                                        aria-valuemax={constraints.maxDurationHours}
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