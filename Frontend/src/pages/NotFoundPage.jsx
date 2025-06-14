import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

// SVG Icons (giữ nguyên như trước)
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z" clipRule="evenodd" />
    </svg>
);

function NotFoundPage() {
    return (
        <div className={styles.notFoundContainer}>
            <div className={styles.contentWrapper}>
                {/* 2. Hình ảnh minh họa */}
                <img
                    src="https://shorturl.at/F9E32" // Đảm bảo bạn có ảnh này trong public/images
                    alt="404 Not Found"
                    className={styles.illustration}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const placeholder = document.createElement('div');
                        placeholder.className = styles.illustrationPlaceholder;
                        placeholder.textContent = "Ảnh minh họa 404";
                        e.target.parentNode.insertBefore(placeholder, e.target);
                    }}
                />

                {/* 3. Tiêu đề lỗi */}
                <h1 className={styles.errorCode}>
                    404
                </h1>
                <h2 className={styles.errorTitle}>
                    Ối! Trang này không tồn tại.
                </h2>

                {/* 4. Thông điệp giải thích */}
                <p className={styles.errorMessage}>
                    Có vẻ như bạn đã lạc vào không gian trống rỗng. Đường dẫn bạn tìm kiếm có thể đã bị xóa, đổi tên, hoặc không bao giờ tồn tại. Đừng lo lắng, chúng tôi sẽ giúp bạn tìm đường trở lại!
                </p>

                {/* 5. Các tùy chọn điều hướng */}
                <div className={styles.actionsContainer}>
                    <Link
                        to="/"
                        className={`${styles.actionButton} ${styles.buttonPrimary}`}
                    >
                        <HomeIcon />
                        Quay về Trang chủ
                    </Link>
                    <Link
                        to="/explore-spaces" // Hoặc /book-space, /search tùy theo route của bạn
                        className={`${styles.actionButton} ${styles.buttonSecondary}`}
                    >
                        <SearchIcon />
                        Tìm kiếm không gian
                    </Link>
                    <Link
                        to="/contact-us" // Hoặc /support, /help tùy theo route của bạn
                        className={`${styles.actionButton} ${styles.buttonOutline}`}
                    >
                        <ChatIcon />
                        Liên hệ hỗ trợ
                    </Link>
                </div>

                <p className={styles.contactNote}>
                    Nếu bạn nghĩ đây là một lỗi, vui lòng <Link to="/contact-us" className={styles.contactLink}>báo cho chúng tôi</Link>.
                </p>
            </div>
        </div>
    );
}

export default NotFoundPage;