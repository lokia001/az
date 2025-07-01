// src/features/comments/components/AddCommentForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { addNewComment, selectCreateCommentStatus, selectCreateCommentError, clearCreateCommentStatus } from '../slices/commentSlice';
import { selectCurrentUser } from '../../auth/slices/authSlice'; // To get current user's avatar
import { DEFAULT_PROFILE_AVATAR } from '../../profile/services/profileApi';

const AddCommentForm = ({ parentEntityType, parentEntityId, parentCommentIdForReply = null, onCommentAdded, onCancelReply, communityId }) => {


    const dispatch = useDispatch();
    const currentUser = useSelector(selectCurrentUser);
    const createStatus = useSelector(selectCreateCommentStatus);
    const createError = useSelector(selectCreateCommentError);

    const [content, setContent] = useState('');
    const [formError, setFormError] = useState('');

    useEffect(() => {
        // Clear error when parentEntityId changes (meaning form is for a new item)
        dispatch(clearCreateCommentStatus());
    }, [parentEntityId, dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('==> [AddCommentForm] handleSubmit - parentEntityType:', parentEntityType, 'parentEntityId:', parentEntityId, 'content:', content.trim());
        if (!content.trim()) {
            setFormError('Nội dung bình luận không được để trống.');
            return;
        }
        if (content.trim().length > 2000) {
            setFormError('Nội dung bình luận không được quá 2000 ký tự.');
            return;
        }
        setFormError('');
        dispatch(clearCreateCommentStatus()); // Clear previous API errors

        dispatch(addNewComment({
            parentEntityType,
            parentEntityId: parentEntityId,
            content: content.trim(),
            parentCommentId: parentCommentIdForReply, // Use this for replies
            // parentCommentId: null, // For top-level comments
        }))
            .unwrap()
            .then(() => {
                setContent(''); // Clear input on success
                if (onCommentAdded) onCommentAdded(); // Callback for parent
            })
            .catch(err => {
                // Error is already in Redux state (createError), no need to set local error
                console.error("Failed to add comment from form:", err);
            });
    };

    const userAvatar = currentUser?.avatarUrl || DEFAULT_PROFILE_AVATAR;
    const placeholderText = parentCommentIdForReply ? "Viết trả lời..." : "Viết bình luận...";

    return (
        <Form onSubmit={handleSubmit} className={`mt-2 mb-2 ${parentCommentIdForReply ? 'ms-5 p-2 border-start border-2' : 'd-flex align-items-start'}`}>
            {!parentCommentIdForReply && ( // Only show avatar for top-level comment form
                <img 
                    src={userAvatar} 
                    alt="Your avatar" 
                    className="rounded-circle" 
                    style={{ 
                        width: '40px', 
                        height: '40px', 
                        marginRight: '10px', 
                        marginTop: '5px',
                        objectFit: 'cover',
                        border: '1px solid #dee2e6'
                    }}
                    onError={(e) => {
                        if (e.target.src !== DEFAULT_PROFILE_AVATAR) {
                            e.target.src = DEFAULT_PROFILE_AVATAR;
                        }
                    }}
                />
            )}
            <div className="flex-grow-1">
                <Form.Group controlId={`commentContent-${parentCommentIdForReply || parentEntityId}`}>
                    <Form.Control
                        as="textarea"
                        rows={parentCommentIdForReply ? 2 : 3} // Smaller for replies
                        placeholder={placeholderText}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        isInvalid={!!formError || (createStatus === 'failed' && !!createError)}
                        disabled={createStatus === 'loading'}
                        className="mb-2"
                    />
                    <Form.Control.Feedback type="invalid">
                        {formError || (createStatus === 'failed' && String(createError))}
                    </Form.Control.Feedback>
                </Form.Group>
                <div className="text-end">
                    {parentCommentIdForReply && onCancelReply && ( // Show cancel button for reply form
                        <Button variant="link" size="sm" onClick={onCancelReply} className="me-2 text-muted">Hủy</Button>
                    )}
                    <Button variant="primary" type="submit" size="sm" disabled={createStatus === 'loading' || !content.trim()}>
                        {createStatus === 'loading' ? <Spinner as="span" size="sm" /> : (parentCommentIdForReply ? 'Gửi trả lời' : 'Gửi bình luận')}
                    </Button>
                </div>
            </div>
        </Form>
    );
};


export default AddCommentForm;