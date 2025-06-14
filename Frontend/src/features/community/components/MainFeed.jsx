// src/features/community/components/MainFeed.jsx
import React from 'react';
import PostCard from './PostCard';
import Spinner from 'react-bootstrap/Spinner'; // For inline loading indicator

const MainFeed = ({ posts, isLoadingMore }) => { // Added isLoadingMore prop

    if (!posts || posts.length === 0) {
        // The parent CommunityPlatformPage now handles "No posts" or "Select community" messages.
        // This component will only be rendered if there's an intention to show posts or loading state.
        return null;
    }

    return (
        <div className="feed-list">
            {posts.map(postSummary => ( // postSummary is PostSummaryDto
                <PostCard
                    key={postSummary.id}
                    id={postSummary.id}
                    // Pass the whole postSummary object which now might have commentsCount
                    post={postSummary} // <-- PASS THE WHOLE OBJECT
                    // Derive other props for PostCard from postSummary
                    avatar={`https://i.pravatar.cc/40?u=${postSummary.authorUserId}`} // Placeholder
                    author={`User ID: ${postSummary.authorUserId}`} // Placeholder
                    title={postSummary.title}
                    time={new Date(postSummary.createdAt).toLocaleString('vi-VN')}
                    isPinned={postSummary.isPinned}
                    isLocked={postSummary.isLocked}
                // Likes and specific comment count for display on button are now derived inside PostCard from post.commentsCount
                />
            ))}
            {isLoadingMore && (
                <div className="text-center my-3">
                    <Spinner animation="border" size="sm" /> Đang tải thêm...
                </div>
            )}
        </div>
    );
};

export default MainFeed;