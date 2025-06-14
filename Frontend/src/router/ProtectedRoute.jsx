import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectCurrentUser } from '../features/auth/slices/authSlice';

const ProtectedRoute = ({ allowedRoles, children, redirectTo = '/auth/login' }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const currentUser = useSelector(selectCurrentUser);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = currentUser?.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
            return <Navigate to="/unauthorized" state={{ from: location }} replace />;
        }
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
