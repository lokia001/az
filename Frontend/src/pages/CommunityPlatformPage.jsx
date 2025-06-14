// src/pages/CommunityPlatformPage.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from '../features/community/components/Sidebar';
import CommunityExplorer from '../features/community/components/CommunityExplorer';
import {
    selectSelectedCommunityId,
    clearSelectedCommunity, // Action to clear selection
} from '../features/community/slices/communitySlice';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap styles are applied
import Container from 'react-bootstrap/Container';
import { Link } from 'react-router-dom';

const CommunityPlatformPage = () => {
    const dispatch = useDispatch();
    const selectedCommunityId = useSelector(selectSelectedCommunityId);
    const [showExplorer, setShowExplorer] = useState(false);

    // When navigating to the general /community page,
    // if a specific community was previously selected, clear it.
    useEffect(() => {
        console.log('[CommunityPlatformPage] Current selectedCommunityId:', selectedCommunityId);
        if (selectedCommunityId) {
            console.log('[CommunityPlatformPage] On general page, clearing previously selected community.');
            dispatch(clearSelectedCommunity());
        }
        
        // Add event listener for search community event
        const handleSearchCommunity = () => {
            setShowExplorer(true);
        };
        
        document.addEventListener('searchCommunity', handleSearchCommunity);
        
        // Clean up event listener
        return () => {
            document.removeEventListener('searchCommunity', handleSearchCommunity);
        };
    }, [dispatch, selectedCommunityId]); // Run if selectedCommunityId changes

    return (
        <div className="community-platform-wrapper" style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
            <Sidebar />
            <Container fluid style={{ flexGrow: 1, padding: '20px', overflowY: 'auto' }}>
                {showExplorer ? (
                    <CommunityExplorer />
                ) : (
                    <Alert variant="light" className="text-center mt-5 p-4 shadow-sm">
                        <h4 className="alert-heading">Chào mừng đến Khu vực Cộng đồng!</h4>
                        <p className="mb-3">
                            Khám phá các cuộc thảo luận, chia sẻ kiến thức và kết nối với những người cùng chí hướng.
                        </p>
                        <p>
                            Chọn một cộng đồng từ danh sách "Cộng đồng của bạn" ở bên trái để xem các bài đăng,
                            hoặc <Button variant="outline-primary" size="sm" onClick={() => setShowExplorer(true)}>khám phá các cộng đồng khác</Button>.
                        </p>
                    </Alert>
                )}
            </Container>
        </div>
    );
};

export default CommunityPlatformPage;