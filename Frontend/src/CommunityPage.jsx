// src/pages/CommunityPlatformPage.jsx (Renamed from Community1Page.jsx)
import React from 'react';
import Sidebar from './features/community/components/Sidebar'; // Assuming Sidebar is now a general app component
import MainFeed from './features/community/components/MainFeed'; // Path to your MainFeed
// import './style.css'; // Your main community platform styles

// Mock data for posts - will be replaced by API data for a specific community or global feed
const mockFeedPosts = [
    { id: 'p1', avatar: 'https://i.pravatar.cc/40?u=user1', author: 'Nguyễn An', groupInfo: 'Workshop Pitching Startup', time: '1 hour ago', content: "Thông báo quan trọng: Buổi Workshop 'Tối ưu hóa quy trình làm việc Agile' sẽ diễn ra vào lúc 10:00 sáng ngày 25/05 tại Phòng đa năng số 3. Đăng ký tham gia ngay!", imageUrl: 'https://via.placeholder.com/600x350/007BFF/FFFFFF?Text=Workshop+Agile', likes: 12, comments: 3, canJoin: true, },
    // ... other mock posts from your original file
];

const CommunityPlatformPage = () => {
    // In a real app, MainFeed would get posts based on selected community or global feed
    // For now, it uses mock data.
    // The Sidebar will fetch and display user's joined communities.

    return (
        <div className="community-platform-wrapper" style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' /* Adjust for navbar */ }}>
            <Sidebar /> {/* Sidebar now fetches its own data */}
            <div style={{ flexGrow: 1, padding: '20px', overflowY: 'auto' }}> {/* Main content area */}
                {/*
                    This MainFeed will eventually need to be more dynamic.
                    If on a specific community page, it shows posts for that community.
                    If on a general feed, it shows aggregated posts.
                    For now, it's just showing mock posts.
                */}
                <MainFeed posts={mockFeedPosts} />
            </div>
        </div>
    );
};

export default CommunityPlatformPage;