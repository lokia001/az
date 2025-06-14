import React, { useState, useEffect }
    from 'react';
import { Modal, Button, Form, Row, Col, Image, ProgressBar } from 'react-bootstrap';
import { FaStar, FaRegStar, FaCamera, FaPaperPlane } from 'react-icons/fa';

// Component StarRating có thể tái sử dụng
const StarRatingInput = ({ rating, setRating, totalStars = 5, size = "1.5em" }) => {
    const [hoverRating, setHoverRating] = useState(0);
    return (
        <div className="star-rating-input">
            {[...Array(totalStars)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <span
                        key={starValue}
                        style={{ cursor: 'pointer', color: '#ffc107', fontSize: size, marginRight: '0.2em' }}
                        onClick={() => setRating(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                    >
                        {(hoverRating || rating) >= starValue ? <FaStar /> : <FaRegStar />}
                    </span>
                );
            })}
            {rating > 0 && <span className="ms-2 text-muted">({rating}/{totalStars})</span>}
        </div>
    );
};


const PostReviewModal = ({ show, onHide, spaceName, bookingId, onSubmitReview }) => {
    const [overallRating, setOverallRating] = useState(5); // Mặc định 5 sao
    const [comment, setComment] = useState('');
    const [uploadedImages, setUploadedImages] = useState([]); // Mảng các file ảnh
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Ví dụ về các tiêu chí đánh giá chi tiết
    const initialCriteriaRatings = {
        location: 5,
        comfort: 5,
        wifi: 5,
        amenities: 5,
        value: 5,
    };
    const [criteriaRatings, setCriteriaRatings] = useState(initialCriteriaRatings);

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            // Giới hạn số lượng hoặc kích thước file nếu cần
            setUploadedImages(prev => [...prev, ...files].slice(0, 5)); // Ví dụ: giới hạn 5 ảnh

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 5));
        }
    };

    const removeImagePreview = (indexToRemove) => {
        setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
        setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleCriteriaChange = (criterion, value) => {
        setCriteriaRatings(prev => ({ ...prev, [criterion]: parseInt(value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const reviewData = {
            bookingId, // Hoặc spaceId nếu review gắn trực tiếp vào space
            overallRating,
            comment,
            criteriaRatings, // Gửi cả đánh giá theo tiêu chí
            // uploadedImages, // Bạn sẽ cần xử lý việc upload file này lên server
        };
        console.log("Submitting Review Data (Mock):", reviewData);
        // Giả lập gọi API
        // await onSubmitReview(reviewData, uploadedImages); // Hàm này sẽ xử lý logic submit thực tế
        await new Promise(resolve => setTimeout(resolve, 1500));
        alert(`Review for booking ${bookingId} submitted (Mock)! Thank you!`);

        setIsSubmitting(false);
        // Reset form và đóng modal
        setOverallRating(5);
        setComment('');
        setUploadedImages([]);
        setImagePreviews([]);
        setCriteriaRatings(initialCriteriaRatings);
        onHide();
    };

    // Cleanup object URLs khi component unmount hoặc imagePreviews thay đổi
    useEffect(() => {
        return () => {
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);


    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Leave a Review for {spaceName || "Your Recent Booking"}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <p className="text-muted small">Your feedback helps us and other users. Please share your experience.</p>

                    <Form.Group className="mb-4" controlId="overallRating">
                        <Form.Label className="fw-bold">Overall Rating <span className="text-danger">*</span></Form.Label>
                        <StarRatingInput rating={overallRating} setRating={setOverallRating} />
                    </Form.Group>

                    {/* <h5 className="mb-3">Detailed Ratings (Optional)</h5> */}




                    <Form.Group className="mb-4 mt-4" controlId="reviewComment">
                        <Form.Label className="fw-bold">Your Review / Comment <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            placeholder="Share details of your own experience at this place..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                            minLength={10} // Ví dụ validation
                        />
                        <Form.Text className="text-muted">Minimum 10 characters.</Form.Text>
                    </Form.Group>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={onHide} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" /> Submitting...</>
                        ) : (
                            <><FaPaperPlane className="me-1" /> Submit Review</>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default PostReviewModal;