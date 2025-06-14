// src/components/common/StarRatingDisplay.jsx
import React from 'react';

/**
 * Displays a read-only star rating.
 * @param {object} props
 * @param {number} props.rating - The rating value (e.g., 0 to 5).
 * @param {string} [props.size="md"] - "sm", "md", "lg" for font size.
 * @param {string} [props.color="#ffc107"] - Color for filled stars.
 * @param {string} [props.className] - Additional CSS classes.
 */
const StarRatingDisplay = ({ rating = 0, size = "md", color = "#ffc107", className = "" }) => {
    const ratingRounded = Math.round(rating * 2) / 2; // Rounds to nearest 0.5
    let starFontSize;
    switch (size) {
        case "sm": starFontSize = "1em"; break;
        case "lg": starFontSize = "1.5em"; break;
        case "md":
        default: starFontSize = "1.2em"; break;
    }

    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= ratingRounded) {
            stars.push(<span key={i} style={{ color, marginRight: '2px' }}>★</span>); // Full star
        } else if (i - 0.5 === ratingRounded) {
            stars.push(<span key={i} style={{ color, marginRight: '2px' }}>⭐</span>); // Placeholder for half-star, needs better icon or SVG
            // For now, using full star if > .25, empty if < .75
            // This simple version just rounds.
        } else {
            stars.push(<span key={i} style={{ color: '#e4e5e9', marginRight: '2px' }}>☆</span>); // Empty star
        }
    }

    return (
        <div className={`d-inline-block ${className}`} style={{ fontSize: starFontSize }} aria-label={`Rating: ${rating} out of 5 stars`}>
            {stars}
        </div>
    );
};

export default StarRatingDisplay;