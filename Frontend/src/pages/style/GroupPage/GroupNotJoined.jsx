import React from 'react';
import PendingRequests from './PendingRequests.jsx';
import GroupList from './GroupList.jsx';
import styles from './GroupNotJoined.module.css';

function GroupNotJoined() {
    // Dữ liệu giả định cho pending requests
    const pendingRequestsData = [
        {
            id: 'req1',
            user: 'SV K21 - ICTU',
            time: '40 weeks ago',
            avatar: 'https://via.placeholder.com/50/abcdef', // Placeholder avatar
        },
        {
            id: 'req2',
            user: 'Lâm Lăn Náo',
            time: 'a year ago',
            avatar: 'https://via.placeholder.com/50/fedcba', // Placeholder avatar
        },
        {
            id: 'req3',
            user: 'Ninja School Online Sv3 Katana ( solargod1ros )',
            time: '2 years ago',
            avatar: 'https://via.placeholder.com/50/aabbcc', // Placeholder avatar
        },
    ];

    // Dữ liệu giả định cho các nhóm có thể tham gia
    const allGroupsData = [
        {
            id: 'g1',
            name: 'HỌC LẠI - CHĂM TIỀN ĐỒ KHOA CÔNG NGHỆ THÔNG TIN',
            lastActive: 'a week ago',
            memberCount: 99,
            coverImage: 'https://via.placeholder.com/300/ff0000', // Placeholder cover
        },
        {
            id: 'g2',
            name: 'Cộng đồng CNTT cho người mới bắt đầu - IT For Beginners',
            lastActive: 'a week ago',
            memberCount: 123,
            coverImage: 'https://via.placeholder.com/300/00ff00', // Placeholder cover
        },
        {
            id: 'g3',
            name: 'Cộng đồng dân AI Automation Việt Nam',
            lastActive: 'a week ago',
            memberCount: 456,
            coverImage: 'https://via.placeholder.com/300/0000ff', // Placeholder cover
        },
        // ... Thêm dữ liệu nhóm khác
    ];

    return (
        <div
            className={styles.groupNotJoinedContainer}
        >
            <PendingRequests requests={pendingRequestsData} />
            <div className={styles.allGroupsSection}>
                <h2>All groups you've joined (99)</h2> {/* Thay đổi số lượng */}
                <GroupList groups={allGroupsData} isJoined={false} />
            </div>
        </div>
    );
}

export default GroupNotJoined;