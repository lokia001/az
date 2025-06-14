import React from 'react';
import './GroupCardJoined.module.css';

function GroupCardJoined({ group }) {
    return (
        <div className="groupCardJoinedContainer">
            {/* Có thể hiển thị avatar nhóm hoặc thông tin khác */}
            <div className="groupAvatarPlaceholder">
                {group.name.substring(0, 2).toUpperCase()} {/* Placeholder avatar */}
            </div>
            <div className="groupInfo">
                <h3 className="groupName">{group.name}</h3>
                <div className="groupMeta">Last active {group.lastActive}</div>
            </div>
            {/* Icon menu */}
        </div>
    );
}

export default GroupCardJoined;