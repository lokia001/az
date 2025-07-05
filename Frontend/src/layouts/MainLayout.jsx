import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Footer/Footer';
import CustomChatWidget from '../features/chatbot/components/CustomChatWidget';
import "./MainLayout.css";

function MainLayout() {
    const { isAuthenticated, currentUser } = useSelector(state => state.auth);
    const location = useLocation();
    const isOwner = currentUser?.role?.toLowerCase() === 'owner';
    const isAdmin = currentUser?.role?.toLowerCase() === 'sysadmin' || currentUser?.role?.toLowerCase() === 'admin';
    
    // Chatbot chỉ hiển thị ở home page và không phải Owner/Admin
    const shouldShowChatbot = location.pathname === '/' && !isOwner && !isAdmin;

    return (
        <div className="site-wrapper" >
            <Navbar />
            <div className="content"  >
                <Outlet />
            </div>
            {shouldShowChatbot && <CustomChatWidget />}
            <Footer />
        </div>
    );
}

export default MainLayout;