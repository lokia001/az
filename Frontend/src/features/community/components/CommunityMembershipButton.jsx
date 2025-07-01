// src/features/community/components/CommunityMembershipButton.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import {
    joinCommunity,
    leaveCommunity,
    checkMembership,
    selectJoinCommunityStatus,
    selectJoinCommunityError,
    selectLeaveCommunityStatus,
    selectLeaveCommunityError,
    selectMembershipCheckStatus,
    selectCurrentCommunityMembership,
    selectIsCurrentUserMemberOfSelectedCommunity,
    clearJoinCommunityStatus,
    clearLeaveCommunityStatus,
} from '../slices/communitySlice';
import { selectIsAuthenticated } from '../../auth/slices/authSlice';

const CommunityMembershipButton = ({ communityId, communityDetail }) => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isMember = useSelector(selectIsCurrentUserMemberOfSelectedCommunity);
    const membership = useSelector(selectCurrentCommunityMembership);
    
    const joinStatus = useSelector(selectJoinCommunityStatus);
    const joinError = useSelector(selectJoinCommunityError);
    const leaveStatus = useSelector(selectLeaveCommunityStatus);
    const leaveError = useSelector(selectLeaveCommunityError);
    const membershipCheckStatus = useSelector(selectMembershipCheckStatus);

    // Check membership when component mounts or communityId changes
    useEffect(() => {
        if (isAuthenticated && communityId && membershipCheckStatus === 'idle') {
            dispatch(checkMembership(communityId));
        }
    }, [dispatch, communityId, isAuthenticated, membershipCheckStatus]);

    // Clear status after successful operations
    useEffect(() => {
        if (joinStatus === 'succeeded') {
            // Re-check membership after successful join
            dispatch(checkMembership(communityId));
            const timer = setTimeout(() => {
                dispatch(clearJoinCommunityStatus());
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [joinStatus, dispatch, communityId]);

    useEffect(() => {
        if (leaveStatus === 'succeeded') {
            // Re-check membership after successful leave
            dispatch(checkMembership(communityId));
            const timer = setTimeout(() => {
                dispatch(clearLeaveCommunityStatus());
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [leaveStatus, dispatch, communityId]);

    const handleJoinCommunity = () => {
        if (communityId) {
            dispatch(joinCommunity(communityId));
        }
    };

    const handleLeaveCommunity = () => {
        if (communityId && window.confirm('Bạn có chắc chắn muốn rời khỏi cộng đồng này không?')) {
            dispatch(leaveCommunity(communityId));
        }
    };

    // Don't show button if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    // Don't show button if this is a private community and user is not a member
    if (communityDetail && !communityDetail.isPublic && !isMember) {
        return (
            <Button variant="outline-secondary" disabled>
                Cộng đồng riêng tư
            </Button>
        );
    }

    // Loading state while checking membership
    if (membershipCheckStatus === 'loading') {
        return (
            <Button variant="outline-primary" disabled>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Đang kiểm tra...
            </Button>
        );
    }

    // Show leave button if user is member
    if (isMember) {
        const isAdmin = membership?.role === 'Admin';
        const isModerator = membership?.role === 'Moderator';
        
        return (
            <div className="d-flex flex-column">
                <Button 
                    variant="outline-danger" 
                    onClick={handleLeaveCommunity}
                    disabled={leaveStatus === 'loading'}
                >
                    {leaveStatus === 'loading' ? (
                        <>
                            <Spinner as="span" animation="border" size="sm" className="me-2" />
                            Đang rời...
                        </>
                    ) : (
                        'Rời cộng đồng'
                    )}
                </Button>
                
                {/* Show membership status */}
                <small className="text-muted mt-1">
                    {isAdmin ? '👑 Quản trị viên' : 
                     isModerator ? '🛡️ Điều hành viên' : 
                     '👤 Thành viên'}
                </small>
                
                {/* Show success/error messages */}
                
                {leaveError && (
                    <small className="text-danger mt-1">{leaveError}</small>
                )}
            </div>
        );
    }

    // Show join button if user is not member
    return (
        <div className="d-flex flex-column">
            <Button 
                variant="primary" 
                onClick={handleJoinCommunity}
                disabled={joinStatus === 'loading'}
            >
                {joinStatus === 'loading' ? (
                    <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Đang tham gia...
                    </>
                ) : (
                    'Tham gia cộng đồng'
                )}
            </Button>
            
            {/* Show success/error messages */}
            
            {joinError && (
                <small className="text-danger mt-1">{joinError}</small>
            )}
        </div>
    );
};

export default CommunityMembershipButton;
