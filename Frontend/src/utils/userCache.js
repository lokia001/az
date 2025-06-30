// src/utils/userCache.js
import { getUserDetailsAPI } from '../features/users/services/userApi';
import { DEFAULT_PROFILE_AVATAR } from '../features/profile/services/profileApi';

// Simple in-memory cache for user info
const userCache = new Map();
const cacheTTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get user info with caching
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User info with displayName and avatarUrl
 */
export const getCachedUserInfo = async (userId) => {
    if (!userId) {
        return {
            displayName: 'Người dùng ẩn danh',
            avatarUrl: DEFAULT_PROFILE_AVATAR
        };
    }

    // Check cache first
    const cacheKey = userId;
    const cached = userCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < cacheTTL)) {
        return cached.data;
    }

    try {
        // Fetch from API
        const userDetails = await getUserDetailsAPI(userId);
        
        const userInfo = {
            displayName: userDetails.fullName || userDetails.username || `User ${userId.slice(-6)}`,
            avatarUrl: userDetails.avatarUrl || DEFAULT_PROFILE_AVATAR,
            username: userDetails.username,
            fullName: userDetails.fullName
        };

        // Cache the result
        userCache.set(cacheKey, {
            data: userInfo,
            timestamp: Date.now()
        });

        return userInfo;
    } catch (error) {
        console.warn(`Failed to fetch user info for ${userId}:`, error);
        
        // Return fallback info
        const fallback = {
            displayName: `User ${userId.slice(-6)}`,
            avatarUrl: `https://ui-avatars.com/api/?name=User+${userId.slice(-6)}&size=40&background=random&color=ffffff&format=png`
        };

        // Cache the fallback for a shorter time to retry later
        userCache.set(cacheKey, {
            data: fallback,
            timestamp: Date.now() - cacheTTL + 30000 // Will expire in 30 seconds
        });

        return fallback;
    }
};

/**
 * Clear user cache (useful for testing or when user info changes)
 */
export const clearUserCache = () => {
    userCache.clear();
};

/**
 * Remove specific user from cache
 * @param {string} userId - User ID to remove from cache
 */
export const invalidateUserCache = (userId) => {
    userCache.delete(userId);
};
