import React from 'react';
import GroupList from './GroupList.jsx';
// import './GroupSidebar.module.css';

function GroupSidebar() {
    // Dữ liệu giả định cho các nhóm đã tham gia
    const joinedGroupsData = [
        { id: 'jg1', name: '3X CLUB', lastActive: '36 weeks ago' },
        { id: 'jg2', name: 'SMAT 242', lastActive: '38 weeks ago' },
        { id: 'jg3', name: 'FAST LEARNING - TIM VU', lastActive: '37 weeks ago' },
        // ... Thêm dữ liệu nhóm đã tham gia khác
    ];

    return (
        <div className="groupSidebarContainer">
            <div className="groupsSection">
                <h2>Groups</h2>
                <div className="searchBar">
                    <input type="text" placeholder="Search groups" />
                    {/* Icon tìm kiếm */}
                </div>
                <button className="createGroupButton">+ Create new group</button>
            </div>
            <div className="yourGroupsSection">
                <div className="yourGroupsHeader">
                    <h2>Groups you've joined</h2>
                    <button className="seeAllButton">See all</button>
                </div>
                <GroupList groups={joinedGroupsData} isJoined={true} />
            </div>
        </div>
    );
}

export default GroupSidebar;