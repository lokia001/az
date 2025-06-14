// src/features/manageSpace/pages/OwnerSpaceDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Breadcrumb, Alert, Spinner, Button } from 'react-bootstrap';
import SpaceDetails from '../components/SpaceDetails';
import { fetchSpaceDetail } from '../../spaceDetail/slices/spaceDetailSlice';
import * as api from '../../../services/api';

const OwnerSpaceDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [space, setSpace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Get current user
    const currentUser = useSelector(state => state.auth.user);
    const isOwner = currentUser?.roles?.includes('Owner') || currentUser?.roles?.includes('SysAdmin');
    
    useEffect(() => {
        const loadSpaceDetail = async () => {
            try {
                setLoading(true);
                // Use the proper API method to fetch space by ID
                // Use the findSpace function from the API
                const spaceData = await api.findSpace(id);
                setSpace(spaceData);
                setError(null);
            } catch (err) {
                console.error("Error loading space details:", err);
                setError(err.message || 'Không thể tải thông tin không gian');
            } finally {
                setLoading(false);
            }
        };
        
        if (id) {
            loadSpaceDetail();
        }
    }, [id, dispatch]);
    
    // If not an owner, redirect to user view
    useEffect(() => {
        if (currentUser && !isOwner) {
            navigate(`/spaces/${id}`);
        }
    }, [currentUser, isOwner, id, navigate]);
    
    return (
        <Container className="py-4">
            <Breadcrumb className="mb-4">
                <Breadcrumb.Item href="/">Trang chủ</Breadcrumb.Item>
                <Breadcrumb.Item href="/owner/manage-spaces">Quản lý không gian</Breadcrumb.Item>
                <Breadcrumb.Item active>Chi tiết không gian</Breadcrumb.Item>
            </Breadcrumb>
            
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h2 mb-0">Chi tiết không gian</h1>
                <Button 
                    variant="outline-secondary"
                    onClick={() => navigate('/owner/manage-spaces')}
                >
                    Quay lại danh sách
                </Button>
            </div>
            
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </Spinner>
                    <p className="mt-2">Đang tải thông tin không gian...</p>
                </div>
            ) : error ? (
                <Alert variant="danger">
                    <Alert.Heading>Có lỗi xảy ra!</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            ) : !space ? (
                <Alert variant="warning">
                    <Alert.Heading>Không tìm thấy không gian</Alert.Heading>
                    <p>Không gian bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                </Alert>
            ) : (
                <SpaceDetails space={space} isOwner={true} />
            )}
        </Container>
    );
};

export default OwnerSpaceDetailPage;
