import React from 'react';
import './GroupCardNotJoined.module.css';

function GroupCardNotJoined({ group }) {
    return (
        <div className="groupCardNotJoinedContainer">
            {group.coverImage && <img src={group.coverImage} alt={group.name} className="groupCover" />}
            <div className="groupCardInfo">
                <h3 className="groupName">{group.name}</h3>
                <div className="groupMeta">{group.memberCount} members</div>
                <div className="groupMeta">Last active {group.lastActive}</div>
            </div>
            <div className="groupActions">
                <button className="viewGroupButton">View group</button>
                {/* Icon menu */}
            </div>
        </div>
    );
}

export default GroupCardNotJoined;