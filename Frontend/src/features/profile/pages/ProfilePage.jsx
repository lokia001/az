// src/features/profile/pages/ProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import {
    fetchProfile,
    updateProfile,
    changePassword,
    uploadProfilePicture,
    requestAccountDeletion,
    selectProfileData,
    selectProfileLoading,
    selectProfileError,
    selectUpdateStatus,
    selectUpdateError,
    selectPasswordStatus,
    selectPasswordError,
    selectUploadPictureStatus,
    selectUploadPictureError,
    resetUpdateStatus,
    resetPasswordStatus,
    resetUploadPictureStatus
} from '../slices/profileSlice';
import ProfileTabs from '../components/ProfileTabs';
import '../styles/profile.css';

function ProfilePage() {
    const dispatch = useDispatch();
    const profileData = useSelector(selectProfileData);
    const isLoading = useSelector(selectProfileLoading);
    const error = useSelector(selectProfileError);
    const updateStatus = useSelector(selectUpdateStatus);
    const updateError = useSelector(selectUpdateError);
    const passwordStatus = useSelector(selectPasswordStatus);
    const passwordError = useSelector(selectPasswordError);
    const uploadPictureStatus = useSelector(selectUploadPictureStatus);
    const uploadPictureError = useSelector(selectUploadPictureError);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Fetch profile data on component mount
    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    // Handle profile update
    const handleUpdateProfile = (profileData) => {
        dispatch(updateProfile(profileData))
            .then(() => {
                setTimeout(() => dispatch(resetUpdateStatus()), 3000);
            });
    };

    // Handle password change
    const handleChangePassword = (passwordData) => {
        dispatch(changePassword(passwordData))
            .then((resultAction) => {
                if (!resultAction.error) {
                    setPasswordSuccess(true);
                    setTimeout(() => {
                        setPasswordSuccess(false);
                        dispatch(resetPasswordStatus());
                    }, 3000);
                }
            });
    };

    // Handle profile picture upload
    const handleUploadProfilePicture = (formData) => {
        dispatch(uploadProfilePicture(formData))
            .then(() => {
                setTimeout(() => dispatch(resetUploadPictureStatus()), 3000);
            });
    };

    // Handle account deletion request
    const handleAccountDeletion = (reason) => {
        dispatch(requestAccountDeletion(reason));
    };

    if (isLoading) {
        return (
            <Container className="py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
                <p className="mt-3">Đang tải thông tin tài khoản...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <Alert.Heading>Lỗi khi tải thông tin tài khoản</Alert.Heading>
                    <p>{error}</p>
                    <button className="btn btn-outline-danger" onClick={() => dispatch(fetchProfile())}>
                        Thử lại
                    </button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            <Row>
                <Col>
                    <h2 className="mb-4 text-center">Quản lý tài khoản</h2>
                    <ProfileTabs
                        profile={profileData}
                        updateProfile={handleUpdateProfile}
                        changePassword={handleChangePassword}
                        uploadProfilePicture={handleUploadProfilePicture}
                        requestAccountDeletion={handleAccountDeletion}
                        isUpdating={updateStatus === 'loading'}
                        updateError={updateError}
                        isChangingPassword={passwordStatus === 'loading'}
                        passwordError={passwordError}
                        passwordSuccess={passwordSuccess}
                        isUploadingPicture={uploadPictureStatus === 'loading'}
                        uploadPictureError={uploadPictureError}
                    />
                </Col>
            </Row>
        </Container>
    );
}

export default ProfilePage;
