import React from 'react';
import styles from './PendingRequests.module.css';

function PendingRequests({ requests }) {
    return (
        <div className="pendingRequestsContainer">
            <h2>Pending group requests (3)</h2> {/* Thay đổi số lượng */}
            <p className="pendingRequestsInfo">View groups and friend requests you've invited to join. Some groups may require you to answer questions in order to approve your join request.</p>
            <div className={styles.requestsList}>
                {requests.map(request => (
                    <div key={request.id} className="requestItem">
                        <img src={request.avatar} alt={request.user} className="requestAvatar" />
                        <div className="requestDetails">
                            <div className="requestUser">{request.user}</div>
                            <div className="requestTime">{request.time}</div>
                        </div>
                        <div className="requestActions">
                            <button className="updateResponsesButton">Update responses</button>
                            {/* Icon menu */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PendingRequests;