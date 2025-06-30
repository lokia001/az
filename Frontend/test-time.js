// Test formatVietnameseTime function
const formatVietnameseTime = (dateInput, options = {}) => {
    const { relative = true, showSeconds = false } = options;
    
    if (!dateInput) return 'Không rõ thời gian';
    
    try {
        // Parse the date
        const date = new Date(dateInput);
        
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
        // Assume backend sends UTC time, convert to Vietnam time for comparison
        const now = new Date();
        
        // Get Vietnam time offset (+7 hours = 25200000 ms)
        const vietnamOffset = 7 * 60 * 60 * 1000;
        
        // Convert UTC date to Vietnam time by adding 7 hours
        const dateVN = new Date(date.getTime() + vietnamOffset);
        const nowVN = new Date(now.getTime() + vietnamOffset);
        
        const timeDiff = nowVN - dateVN;
        
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
        console.error('Error formatting time:', error);
        return 'Thời gian không hợp lệ';
    }
};

// Test
const now = new Date();
const nowUTC = now.toISOString();
console.log('Current UTC time:', nowUTC);
console.log('Current local time:', now.toString());
console.log('Current VN time:', now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));
console.log('Formatted result:', formatVietnameseTime(nowUTC));
console.log('---');

// Test với thời gian 1 giờ trước
const oneHourAgo = new Date(now.getTime() - 3600000);
const oneHourAgoUTC = oneHourAgo.toISOString();
console.log('1 hour ago UTC:', oneHourAgoUTC);
console.log('1 hour ago VN time:', oneHourAgo.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));
console.log('Formatted result:', formatVietnameseTime(oneHourAgoUTC));
