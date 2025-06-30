// src/components/RoleBasedHomepage.jsx
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectIsAuthenticated, selectCurrentUser } from '../features/auth/slices/authSlice';
import HomePage from '../pages/HomePage';

const RoleBasedHomepage = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const currentUser = useSelector(selectCurrentUser);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated && currentUser) {
            const userRole = currentUser.role?.toLowerCase();
            
            switch (userRole) {
                case 'owner':
                    navigate('/owner/dashboard', { replace: true });
                    break;
                case 'sysadmin':
                case 'admin':
                    navigate('/admin/dashboard', { replace: true });
                    break;
                case 'user':
                default:
                    // User role stays on homepage (introduction page)
                    break;
            }
        }
        // Guest users (not authenticated) stay on homepage
    }, [isAuthenticated, currentUser, navigate]);

    // Always render the HomePage for guests and users
    // Owner and Admin will be redirected, so they won't see this
    return <HomePage />;
};

export default RoleBasedHomepage;
