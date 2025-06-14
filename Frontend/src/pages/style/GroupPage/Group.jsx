import React, { useState, useEffect } from 'react';
import GroupNotJoined from './GroupNotJoined.jsx';
import GroupJoined from './GroupJoined.jsx';
import GroupSidebar from './GroupSidebar.jsx';
import styles from './Group.module.css'; // Import file CSS module

function GroupPage() {
    const [isJoined, setIsJoined] = useState(false);
    return (
        <div
            className={styles.groupPageContainer}
        >
            <GroupSidebar />
            <div className={styles.groupContent}>
                {isJoined
                    ?
                    <GroupJoined />
                    :
                    <GroupNotJoined />
                }
            </div>
        </div>
    );
}

export default GroupPage;