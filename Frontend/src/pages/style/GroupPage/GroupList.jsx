import React from 'react';
import GroupCardNotJoined from './GroupCardNotJoined.jsx';
import GroupCardJoined from './GroupCardJoined.jsx';
import styles from './GroupList.module.css';

function GroupList({ groups, isJoined }) {
    return (
        <div className={styles.groupListContainer}>
            {groups.map(group => (
                isJoined ? (
                    <GroupCardJoined key={group.id} group={group} />
                ) : (
                    <GroupCardNotJoined key={group.id} group={group} />
                )
            ))}
        </div>
    );
}

export default GroupList;