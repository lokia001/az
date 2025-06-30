// src/features/community/components/MainFeed.jsx
import React from 'react';
import PostCard from './PostCard';
import Spinner from 'react-bootstrap/Spinner';

const MainFeed = ({ posts, isLoadingMore }) => {
    if (!posts || posts.length === 0) {
        // The parent CommunityPlatformPage now handles "No posts" or "Select community" messages.
        // This component will only be rendered if there's an intention to show posts or loading state.
        return null;
    }

    return (
        <div className="feed-list">
            {posts.map(postSummary => (
                <PostCard
                    key={postSummary.id}
                    post={postSummary} // Pass the whole postSummary object
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