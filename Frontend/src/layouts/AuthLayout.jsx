// src/layouts/AuthLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
// import styles from './AuthLayout.module.css'; // Hoặc file CSS khác

function AuthLayout() {
    return (
        <div>
            <div >
                <Outlet />
            </div>
            {/* Không có Navbar ở đây */}
        </div>
    );
}

export default AuthLayout;