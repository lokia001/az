// src/utils/timeUtils.js

/**
 * Format time to Vietnamese relative time or absolute time
 * @param {string|Date} dateInput - Date string or Date object
 * @param {Object} options - Formatting options
 * @param {boolean} options.relative - Show relative time (default: true)
 * @param {boolean} options.showSeconds - Show seconds in relative time (default: false)
 * @returns {string} Formatted time string
 */
export const formatVietnameseTime = (dateInput, options = {}) => {
    const { relative = true, showSeconds = false } = options;
    
    if (!dateInput) return 'Không rõ thời gian';
    
    try {
        // Parse the date
        // Backend sends UTC time without 'Z' suffix like "2025-06-21T02:36:21.5016357"
        // JavaScript parses this as local time, so we need to explicitly add 'Z'
        let dateString = dateInput;
        if (typeof dateInput === 'string' && !dateInput.includes('Z') && !dateInput.includes('+')) {
            // Add 'Z' to indicate UTC time
            dateString = dateInput + 'Z';
        }
        
        const date = new Date(dateString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'Thời gian không hợp lệ';
        }
        
        // If not relative, return formatted absolute time
        if (!relative) {
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Ho_Chi_Minh'
            });
        }
        
        // Calculate relative time
        // Backend sends time like "2025-06-21T02:36:21.5016357" without timezone
        // This gets parsed as local time, which is correct for Vietnam timezone
        const now = new Date();
        const timeDiff = now - date;
        
        // Handle future dates (shouldn't happen normally)
        if (timeDiff < 0) {
            return 'Trong tương lai';
        }
        
        // Less than 30 seconds
        if (timeDiff < 30000) {
            return 'Vừa xong';
        }
        
        // Less than 1 minute
        if (timeDiff < 60000) {
            if (showSeconds) {
                const seconds = Math.floor(timeDiff / 1000);
                return `${seconds} giây trước`;
            }
            return 'Vừa xong';
        }
        
        // Less than 1 hour
        if (timeDiff < 3600000) {
            const minutes = Math.floor(timeDiff / 60000);
            return `${minutes} phút trước`;
        }
        
        // Less than 24 hours
        if (timeDiff < 86400000) {
            const hours = Math.floor(timeDiff / 3600000);
            return `${hours} giờ trước`;
        }
        
        // Less than 30 days
        if (timeDiff < 2592000000) {
            const days = Math.floor(timeDiff / 86400000);
            return `${days} ngày trước`;
        }
        
        // More than 30 days - show absolute date
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh'
        });
        
    } catch (error) {
        console.error('Error formatting time:', error, 'Input:', dateInput);
        return 'Thời gian không hợp lệ';
    }
};

/**
 * Format date to Vietnamese short format (for lists, etc.)
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatVietnameseDate = (dateInput) => {
    if (!dateInput) return '';
    
    try {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return '';
        
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

/**
 * Format date time to Vietnamese full format
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted datetime string
 */
export const formatVietnameseDateTime = (dateInput) => {
    if (!dateInput) return '';
    
    try {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return '';
        
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh'
        });
    } catch (error) {
        console.error('Error formatting datetime:', error);
        return '';
    }
};

/**
 * Format date time to Vietnamese 24-hour format (clear format for booking management)
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted datetime string with 24-hour format
 */
export const formatVietnameseDateTime24h = (dateInput) => {
    if (!dateInput) return '';
    
    try {
        // Handle UTC time string without Z suffix
        let dateString = dateInput;
        if (typeof dateInput === 'string' && !dateInput.includes('Z') && !dateInput.includes('+')) {
            dateString = dateInput + 'Z';
        }
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        // Convert to Vietnam timezone
        const vietnamTime = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
        
        // Format to dd/MM/yyyy HH:mm
        const day = vietnamTime.getDate().toString().padStart(2, '0');
        const month = (vietnamTime.getMonth() + 1).toString().padStart(2, '0');
        const year = vietnamTime.getFullYear();
        const hours = vietnamTime.getHours().toString().padStart(2, '0');
        const minutes = vietnamTime.getMinutes().toString().padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
        console.error('Error formatting datetime:', error);
        return '';
    }
};

/**
 * Format date time to Vietnamese short format for cards (just time if today, date+time if not today)
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted datetime string
 */
export const formatVietnameseSmartTime = (dateInput) => {
    if (!dateInput) return '';
    
    try {
        let dateString = dateInput;
        if (typeof dateInput === 'string' && !dateInput.includes('Z') && !dateInput.includes('+')) {
            dateString = dateInput + 'Z';
        }
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        const vietnamTime = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
        const now = new Date();
        const vietnamNow = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
        
        const isToday = vietnamTime.toDateString() === vietnamNow.toDateString();
        const isTomorrow = vietnamTime.toDateString() === new Date(vietnamNow.getTime() + 24 * 60 * 60 * 1000).toDateString();
        const isYesterday = vietnamTime.toDateString() === new Date(vietnamNow.getTime() - 24 * 60 * 60 * 1000).toDateString();
        
        const hours = vietnamTime.getHours().toString().padStart(2, '0');
        const minutes = vietnamTime.getMinutes().toString().padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;
        
        if (isToday) {
            return `Hôm nay ${timeStr}`;
        } else if (isTomorrow) {
            return `Ngày mai ${timeStr}`;
        } else if (isYesterday) {
            return `Hôm qua ${timeStr}`;
        } else {
            const day = vietnamTime.getDate().toString().padStart(2, '0');
            const month = (vietnamTime.getMonth() + 1).toString().padStart(2, '0');
            return `${day}/${month} ${timeStr}`;
        }
    } catch (error) {
        console.error('Error formatting smart time:', error);
        return '';
    }
};

/**
 * Check if a date is today
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {boolean} True if date is today
 */
export const isToday = (dateInput) => {
    if (!dateInput) return false;
    
    try {
        const date = new Date(dateInput);
        const today = new Date();
        
        return date.toDateString() === today.toDateString();
    } catch (error) {
        return false;
    }
};

/**
 * Check if a date is yesterday
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {boolean} True if date is yesterday
 */
export const isYesterday = (dateInput) => {
    if (!dateInput) return false;
    
    try {
        const date = new Date(dateInput);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        return date.toDateString() === yesterday.toDateString();
    } catch (error) {
        return false;
    }
};

export default {
    formatVietnameseTime,
    formatVietnameseDate,
    formatVietnameseDateTime,
    formatVietnameseDateTime24h,
    formatVietnameseSmartTime,
    isToday,
    isYesterday
};
