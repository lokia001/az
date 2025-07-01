// src/features/community/components/CreatePostModal.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import {
    createNewPost,
    selectCreatePostStatus,
    selectCreatePostError,
    clearCreatePostStatus,
    selectSelectedCommunityId, // To get the communityId to post to
    selectSelectedCommunityName
} from '../slices/communitySlice';

const CreatePostModal = ({ show, onHide, communityId: propCommunityId, communityName: propCommunityName }) => {
    const dispatch = useDispatch();
    const createStatus = useSelector(selectCreatePostStatus);
    const createError = useSelector(selectCreatePostError);
    const stateCommunityId = useSelector(selectSelectedCommunityId);
    const stateCommunityName = useSelector(selectSelectedCommunityName);

    // Use prop values if provided, otherwise fall back to Redux state
    const communityId = propCommunityId || stateCommunityId;
    const communityName = propCommunityName || stateCommunityName;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (show) {
            // Reset form when modal becomes visible
            setTitle('');
            setContent('');
            setFormErrors({});
            // dispatch(clearCreatePostStatus()); // Clear status from previous attempts when modal opens
        }
    }, [show]); // Removed dispatch from deps

    useEffect(() => {
        if (createStatus === 'succeeded' && show) {
            alert(`Bài đăng đã được tạo thành công trong cộng đồng "${communityName || 'đã chọn'}"!`);
            onHide(); // Close modal
            dispatch(clearCreatePostStatus()); // Reset status after handling
        }
    }, [createStatus, show, onHide, dispatch, communityName]);


    const validateForm = () => {
        const errors = {};
        if (!title.trim()) errors.title = 'Tiêu đề không được để trống.';
        else if (title.trim().length < 5 || title.trim().length > 200) errors.title = 'Tiêu đề phải từ 5 đến 200 ký tự.';
        if (!content.trim()) errors.content = 'Nội dung không được để trống.';
        else if (content.trim().length < 10 || content.trim().length > 10000) errors.content = 'Nội dung phải từ 10 đến 10000 ký tự.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm() || !communityId) {
            if (!communityId) alert("Lỗi: Không xác định được cộng đồng để đăng bài.");
            return;
        }
        dispatch(clearCreatePostStatus()); // Clear previous errors
        dispatch(createNewPost({
            communityId,
            title: title.trim(),
            content: content.trim(),
        }));
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Tạo Bài Đăng Mới trong "{communityName || 'Cộng đồng Hiện tại'}"</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {createStatus === 'failed' && createError && (
                        <Alert variant="danger" onClose={() => dispatch(clearCreatePostStatus())} dismissible>
                            Lỗi tạo bài đăng: {String(createError)}
                        </Alert>
                    )}
                    <Form.Group className="mb-3" controlId="postTitle">
                        <Form.Label>Tiêu đề *</Form.Label>
                        <Form.Control
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            isInvalid={!!formErrors.title}
                            required
                            disabled={createStatus === 'loading'}
                            placeholder="Nhập tiêu đề bài đăng (5-200 ký tự)"
                        />
                        <Form.Control.Feedback type="invalid">{formErrors.title}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="postContent">
                        <Form.Label>Nội dung *</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={8}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            isInvalid={!!formErrors.content}
                            required
                            disabled={createStatus === 'loading'}
                            placeholder="Nhập nội dung bài đăng (10-10000 ký tự)"
                        />
                        <Form.Control.Feedback type="invalid">{formErrors.content}</Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={createStatus === 'loading'}>Hủy</Button>
                    <Button variant="primary" type="submit" disabled={createStatus === 'loading'}>
                        {createStatus === 'loading' ? <Spinner as="span" size="sm" /> : 'Đăng Bài'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};
export default CreatePostModal;