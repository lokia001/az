// src/features/community/components/EditCommunityModal.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { 
    updateCommunity, 
    selectUpdateCommunityStatus, 
    selectUpdateCommunityError, 
    clearUpdateCommunityStatus 
} from '../slices/communitySlice';

const EditCommunityModal = ({ show, onHide, community }) => {
    const dispatch = useDispatch();
    const updateStatus = useSelector(selectUpdateCommunityStatus);
    const updateError = useSelector(selectUpdateCommunityError);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [formErrors, setFormErrors] = useState({});

    // Initialize form with community data
    useEffect(() => {
        if (show && community) {
            setName(community.name || '');
            setDescription(community.description || '');
            setCoverImageUrl(community.coverImageUrl || '');
            setIsPublic(community.isPublic ?? true);
            setFormErrors({});
        }
    }, [show, community]);

    // Handle successful update
    useEffect(() => {
        if (updateStatus === 'succeeded' && show) {
            // Close modal after successful update
            setTimeout(() => {
                onHide();
                dispatch(clearUpdateCommunityStatus());
            }, 1000);
        }
    }, [updateStatus, dispatch, onHide, show]);

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
        if (!validateForm() || !community) return;

        dispatch(clearUpdateCommunityStatus());
        dispatch(updateCommunity({
            communityId: community.id,
            updateData: {
                name: name.trim(),
                description: description.trim() || null,
                coverImageUrl: coverImageUrl.trim() || null,
                isPublic,
            }
        }));
    };

    const handleClose = () => {
        dispatch(clearUpdateCommunityStatus());
        onHide();
    };

    if (!community) return null;

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static" size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Chỉnh sửa Cộng đồng</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {updateStatus === 'succeeded' && (
                        <Alert variant="success">
                            Cộng đồng đã được cập nhật thành công!
                        </Alert>
                    )}
                    
                    {updateStatus === 'failed' && updateError && (
                        <Alert variant="danger" onClose={() => dispatch(clearUpdateCommunityStatus())} dismissible>
                            Lỗi cập nhật cộng đồng: {updateError}
                        </Alert>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>Tên cộng đồng <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nhập tên cộng đồng..."
                            maxLength={100}
                            isInvalid={!!formErrors.name}
                            disabled={updateStatus === 'loading'}
                        />
                        <Form.Control.Feedback type="invalid">
                            {formErrors.name}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Mô tả</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Mô tả về cộng đồng (tùy chọn)..."
                            maxLength={500}
                            isInvalid={!!formErrors.description}
                            disabled={updateStatus === 'loading'}
                        />
                        <Form.Control.Feedback type="invalid">
                            {formErrors.description}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                            {description.length}/500 ký tự
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>URL ảnh bìa</Form.Label>
                        <Form.Control
                            type="url"
                            value={coverImageUrl}
                            onChange={(e) => setCoverImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg (tùy chọn)..."
                            isInvalid={!!formErrors.coverImageUrl}
                            disabled={updateStatus === 'loading'}
                        />
                        <Form.Control.Feedback type="invalid">
                            {formErrors.coverImageUrl}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Check
                            type="switch"
                            id="edit-community-public-switch"
                            label="Cộng đồng công khai"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            disabled={updateStatus === 'loading'}
                        />
                        <Form.Text className="text-muted">
                            {isPublic 
                                ? "Mọi người có thể tìm thấy và tham gia cộng đồng này." 
                                : "Chỉ những người được mời mới có thể tham gia cộng đồng này."
                            }
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={handleClose}
                        disabled={updateStatus === 'loading'}
                    >
                        Hủy
                    </Button>
                    <Button 
                        variant="primary" 
                        type="submit"
                        disabled={updateStatus === 'loading'}
                    >
                        {updateStatus === 'loading' ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                Đang cập nhật...
                            </>
                        ) : (
                            'Cập nhật'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default EditCommunityModal;
