// Frontend/src/features/ownerRegistration/pages/AdminOwnerRegistrationPage.jsx
import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import AdminOwnerRegistrationList from '../components/AdminOwnerRegistrationList';
import ProcessRegistrationModal from '../components/ProcessRegistrationModal';

const AdminOwnerRegistrationPage = () => {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showProcessModal, setShowProcessModal] = useState(false);
    const [isApproval, setIsApproval] = useState(false);

    const handleViewDetails = (request) => {
        // For now, just show the process modal with details
        // You could create a separate details modal if needed
        setSelectedRequest(request);
        setIsApproval(true); // Default to approval for viewing
        setShowProcessModal(true);
    };

    const handleProcessRequest = (request, approval) => {
        setSelectedRequest(request);
        setIsApproval(approval);
        setShowProcessModal(true);
    };

    const handleCloseProcessModal = () => {
        setShowProcessModal(false);
        setSelectedRequest(null);
    };

    return (
        <Container fluid className="my-4">
            <Row>
                <Col>
                    <h2 className="mb-4">Quản lý yêu cầu đăng ký chủ không gian</h2>
                    
                    <AdminOwnerRegistrationList 
                        onViewDetails={handleViewDetails}
                        onProcessRequest={handleProcessRequest}
                    />

                    <ProcessRegistrationModal
                        show={showProcessModal}
                        onHide={handleCloseProcessModal}
                        request={selectedRequest}
                        isApproval={isApproval}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default AdminOwnerRegistrationPage;
