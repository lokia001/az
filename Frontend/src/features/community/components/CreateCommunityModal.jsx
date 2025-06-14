// src/features/community/components/CreateCommunityModal.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { createCommunity, selectCreateCommunityStatus, selectCreateCommunityError, clearCreateCommunityStatus } from '../slices/communitySlice';

const CreateCommunityModal = ({ show, onHide }) => {
    const dispatch = useDispatch();
    const createStatus = useSelector(selectCreateCommunityStatus);
    const createError = useSelector(selectCreateCommunityError);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        // Reset form and errors when modal is shown/hidden or status changes
        if (show) {
            setName('');
            setDescription('');
            setCoverImageUrl('');
            setIsPublic(true);
            setFormErrors({});
            // dispatch(clearCreateCommunityStatus()); // Clear status from previous attempts
        }
    }, [show]); // Removed dispatch from deps

    useEffect(() => {
        if (createStatus === 'succeeded' && show) { // Check show to prevent closing if re-opened quickly
            alert('Cộng đồng đã được tạo thành công!');
            onHide(); // Close modal on success
            dispatch(clearCreateCommunityStatus()); // Reset status after handling
        }
    }, [createStatus, dispatch, onHide, show]);


    const validateForm = () => {
        const errors = {};
        if (!name.trim()) errors.name = 'Tên cộng đồng không được để trống.';
        else if (name.trim().length < 3 || name.trim().length > 100) errors.name = 'Tên cộng đồng phải từ 3 đến 100 ký tự.';
        if (description.trim().length > 500) errors.description = 'Mô tả không được quá 500 ký tự.';
        if (coverImageUrl.trim() && !/^https?:\/\/.+\..+/.test(coverImageUrl.trim())) errors.coverImageUrl = 'URL ảnh bìa không hợp lệ.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        dispatch(clearCreateCommunityStatus()); // Clear previous errors before new attempt
        dispatch(createCommunity({
            name: name.trim(),
            description: description.trim() || null, // Send null if empty
            coverImageUrl: coverImageUrl.trim() || null, // Send null if empty
            isPublic,
        }));
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Tạo Cộng đồng Mới</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {createStatus === 'failed' && createError && (
                        <Alert variant="danger" onClose={() => dispatch(clearCreateCommunityStatus())} dismissible>
                            Lỗi tạo cộng đồng: {String(createError)}
                        </Alert>
                    )}
                    <Form.Group className="mb-3" controlId="commName">
                        <Form.Label>Tên Cộng đồng *</Form.Label>
                        <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} isInvalid={!!formErrors.name} required />
                        <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="commDesc">
                        <Form.Label>Mô tả (Tùy chọn)</Form.Label>
                        <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} isInvalid={!!formErrors.description} />
                        <Form.Control.Feedback type="invalid">{formErrors.description}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="commCoverImage">
                        <Form.Label>URL Ảnh bìa (Tùy chọn)</Form.Label>
                        <Form.Control type="url" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} isInvalid={!!formErrors.coverImageUrl} placeholder="https://example.com/image.jpg" />
                        <Form.Control.Feedback type="invalid">{formErrors.coverImageUrl}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="commIsPublic">
                        <Form.Check type="switch" label="Công khai (Mọi người có thể thấy và tham gia)" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={createStatus === 'loading'}>Hủy</Button>
                    <Button variant="primary" type="submit" disabled={createStatus === 'loading'}>
                        {createStatus === 'loading' ? <Spinner as="span" size="sm" /> : 'Tạo Cộng đồng'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};
export default CreateCommunityModal;