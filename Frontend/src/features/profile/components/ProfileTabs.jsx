// src/features/profile/components/ProfileTabs.jsx
import React, { useState } from 'react';
import { Nav, Tab, Container } from 'react-bootstrap';
import { FaUser, FaEdit, FaLock, FaCog } from 'react-icons/fa';
import ProfileView from './ProfileView';
import ProfileEdit from './ProfileEdit';
import ChangePassword from './ChangePassword';
import AccountSettings from './AccountSettings';

const ProfileTabs = ({
    profile,
    updateProfile,
    changePassword,
    uploadProfilePicture,
    requestAccountDeletion,
    isUpdating,
    updateError,
    isChangingPassword,
    passwordError,
    passwordSuccess,
    isUploadingPicture,
    uploadPictureError
}) => {
    const [activeTab, setActiveTab] = useState('view');
    const [isEditing, setIsEditing] = useState(false);

    const handleUpdateProfile = (profileData) => {
        updateProfile(profileData);
        // Close edit mode after successful update (you might want to wait for success)
        setIsEditing(false);
        setActiveTab('view');
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setActiveTab('edit');
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setActiveTab('view');
    };

    return (
        <Container fluid>
            <Tab.Container id="profile-tabs" activeKey={activeTab} onSelect={setActiveTab}>
                <Nav variant="tabs" className="mb-4">
                    <Nav.Item>
                        <Nav.Link eventKey="view">
                            <FaUser className="me-2" />
                            Thông tin cá nhân
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="edit">
                            <FaEdit className="me-2" />
                            Chỉnh sửa
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="password">
                            <FaLock className="me-2" />
                            Đổi mật khẩu
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="settings">
                            <FaCog className="me-2" />
                            Cài đặt tài khoản
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
                    <Tab.Pane eventKey="view">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4>Thông tin tài khoản</h4>
                            <button 
                                className="btn btn-primary"
                                onClick={handleEditClick}
                            >
                                <FaEdit className="me-1" />
                                Chỉnh sửa
                            </button>
                        </div>
                        <ProfileView profile={profile} />
                    </Tab.Pane>

                    <Tab.Pane eventKey="edit">
                        <ProfileEdit
                            profile={profile}
                            onSave={handleUpdateProfile}
                            onCancel={handleCancelEdit}
                            isLoading={isUpdating}
                            error={updateError}
                            onUploadProfilePicture={uploadProfilePicture}
                            isUploadingPicture={isUploadingPicture}
                            uploadPictureError={uploadPictureError}
                        />
                    </Tab.Pane>

                    <Tab.Pane eventKey="password">
                        <ChangePassword
                            onChangePassword={changePassword}
                            isLoading={isChangingPassword}
                            error={passwordError}
                            success={passwordSuccess}
                        />
                    </Tab.Pane>

                    <Tab.Pane eventKey="settings">
                        <AccountSettings
                            profile={profile}
                            onRequestAccountDeletion={requestAccountDeletion}
                        />
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </Container>
    );
};

export default ProfileTabs;
