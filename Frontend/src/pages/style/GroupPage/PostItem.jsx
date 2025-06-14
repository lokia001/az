import React from 'react';
import './PostItem.module.css';
import likeIcon from '../../../assets/react.svg'; // Placeholder
import commentIcon from '../../../assets/react.svg'; // Placeholder
import shareIcon from '../../../assets/react.svg'; // Placeholder

function PostItem({ post }) {
    return (
        <div className="postItemContainer">
            <div className="postHeader">
                <img src={post.authorAvatar} alt={post.author} className="authorAvatar" />
                <div className="authorInfo">
                    <div className="authorName">{post.author}</div>
                    <div className="postTime">{post.time}</div>
                </div>
                {/* Icon menu */}
            </div>
            <div className="postContent">
                <p>{post.content}</p>
                {post.image && <img src={post.image} alt="Post Image" className="postImage" />}
                {/* Hiển thị video, link, ... nếu có */}
            </div>
            <div className="postActions">
                <button className="actionButton">
                    <img src={likeIcon} alt="Like" className="actionIcon" /> {post.likes} Like
                </button>
                <button className="actionButton">
                    <img src={commentIcon} alt="Comment" className="actionIcon" /> {post.comments} Comments
                </button>
                <button className="actionButton">
                    <img src={shareIcon} alt="Share" className="actionIcon" /> {post.shares} Shares
                </button>
            </div>
        </div>
    );
}

export default PostItem;