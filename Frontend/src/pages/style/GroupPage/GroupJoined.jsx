import React from 'react';
import PostItem from './PostItem.jsx';
import './GroupJoined.module.css';

function GroupJoined() {
    // Dữ liệu giả định cho các bài post
    const postsData = [
        {
            id: 'p1',
            author: 'Lee Tea',
            time: '36m',
            content: 'Thấy template này đơn giản mà hay chính lại chữ để lấy thời tiết lúc 7h thông báo về telegram để góp vui cùng.\n\nFile json ở bình luận nhé. Have fun!!!\n#share #template #n8n',
            likes: 10,
            comments: 5,
            shares: 2,
            authorAvatar: 'https://via.placeholder.com/40/abcdef', // Placeholder avatar
            image: 'https://via.placeholder.com/400/fedcba', // Placeholder image (nếu có)
        },
        {
            id: 'p2',
            author: 'Lưu Hùng',
            time: 'Hôm qua lúc 16:52',
            content: 'Lấy giá vàng lúc 7h thông báo về telegram 💰 Ngắn gọn\nFile json ở bình luận\np/s Full stack Đần gì cũng chơi 😂... Xem thêm',
            likes: 20,
            comments: 10,
            shares: 7,
            authorAvatar: 'https://via.placeholder.com/40/aabbcc', // Placeholder avatar
            // ... Thêm dữ liệu cho các loại post khác (video, link, ...)
        },
        // ... Thêm dữ liệu post khác
    ];

    return (
        <div className="groupJoinedContainer">
            {/* Phần tạo bài viết mới (giống Facebook) */}
            <div className="createPost">
                {/* Avatar người dùng và input để viết bài */}
                <h3>groupjoin -------- Write something...</h3>
            </div>
            <div className="recentActivitySection">
                <h2>Recent activity</h2>
                {postsData.map(post => (
                    <PostItem key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
}

export default GroupJoined;