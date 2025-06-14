// src/components/Layout/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    selectIsAuthenticated,
    selectCurrentUser,
    logoutUser as logout,
    selectAuthStatus
} from '../../features/auth/slices/authSlice';
import api from '../../services/apiClient';
import { useTranslation } from 'react-i18next';
import styles from './Navbar.module.css';

// Icons
const BellIcon = () => <span>🔔</span>;
const SearchIcon = () => <span>🔍</span>;
const MenuIcon = () => <span>☰</span>;
const CloseIcon = () => <span>✕</span>;
const UserIcon = () => <span>👤</span>;
const DownArrowIcon = () => <span>▼</span>;

function Navbar() {
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Redux state
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const currentUser = useSelector(selectCurrentUser);
    const authStatus = useSelector(selectAuthStatus);
    const currentRefreshToken = useSelector(state => state.auth.refreshToken);

    // UI state
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    const [hasNewNotifications, setHasNewNotifications] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchScope, setSearchScope] = useState('spaces');
    const [isScopeDropdownOpen, setIsScopeDropdownOpen] = useState(false);
    const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);

    // Refs for dropdowns
    const accountDropdownRef = useRef(null);
    const languageDropdownRef = useRef(null);
    const notificationDropdownRef = useRef(null);
    const scopeDropdownRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
                setIsAccountDropdownOpen(false);
            }
            if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
                setIsLanguageDropdownOpen(false);
            }
            if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
                setIsNotificationDropdownOpen(false);
            }
            if (scopeDropdownRef.current && !scopeDropdownRef.current.contains(event.target)) {
                setIsScopeDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Event handlers
    const handleLogout = async () => {
        setIsAccountDropdownOpen(false);
        setIsMobileMenuOpen(false);
        
        try {
            // Immediately dispatch logout to clear local state
            dispatch(logout());
            
            // No need to call a backend endpoint since it doesn't exist
            // The backend doesn't have a /auth/logout or /api/auth/logout endpoint
            // Token invalidation would be handled by the backend separately
            
            console.log('User logged out successfully');
            
            // Use replace instead of navigate to prevent back button from returning to protected pages
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Error during logout:', error);
            // Still navigate to login even if there was an error
            navigate('/login', { replace: true });
        }
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setIsLanguageDropdownOpen(false);
        setIsMobileMenuOpen(false);
    };

    const toggleAccountDropdown = () => setIsAccountDropdownOpen(!isAccountDropdownOpen);
    const toggleLanguageDropdown = () => setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const toggleNotificationDropdown = () => setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
    const toggleScopeDropdown = () => setIsScopeDropdownOpen(!isScopeDropdownOpen);

    const handleScopeChange = (newScope) => {
        setSearchScope(newScope);
        setIsScopeDropdownOpen(false);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        console.log(`Searching for "${searchQuery}" in "${searchScope}"`);
        // Navigate to search results
        if (searchScope === 'spaces') {
            navigate(`/searchPage?q=${encodeURIComponent(searchQuery)}`);
        } else {
            navigate(`/communities/search?q=${encodeURIComponent(searchQuery)}`);
        }
        setIsMobileSearchVisible(false);
    };

    // Get first owned space for Owner users
    const firstOwnedSpace = currentUser?.ownedSpaces && Array.isArray(currentUser.ownedSpaces) && currentUser.ownedSpaces.length > 0
        ? currentUser.ownedSpaces[0]
        : null;
    const firstOwnedSpaceId = firstOwnedSpace?.id;

    // Get navigation links based on user role
    const getNavLinks = () => {
        let links = [];

        if (!isAuthenticated) {
            links = [
                { path: '/', label: 'Trang chủ' },
                { path: '/searchPage', label: 'Tìm kiếm' },
                { path: '/community', label: 'Cộng đồng' },
                { path: '/about-us', label: 'Về chúng tôi' },
            ];
        } else {
            const userRole = currentUser?.role?.toLowerCase();

            switch (userRole) {
                case 'owner':
                    links = [
                        { path: '/owner/dashboard', label: 'Dashboard' },
                        { path: '/owner/manage-spaces', label: 'Space' },
                        { path: '/owner/bookings', label: 'Booking' },
                        { path: '/owner/customers', label: 'Customer' },
                        { path: '/community', label: 'Community' },
                        { path: '/profile', label: 'Profile' },
                    ];
                    break;
                case 'sysadmin':
                case 'admin':
                    links = [
                        { path: '/admin/dashboard', label: 'Dashboard' },
                        { path: '/admin/users', label: 'Users' },
                        { path: '/admin/system-amenities', label: 'System Amenities' },
                        { path: '/admin/system-space-services', label: 'System Space Services' },
                        { path: '/admin/community', label: 'Community' },
                        { path: '/admin/reports', label: 'Reports' },
                        { path: '/admin/settings', label: 'Settings' },
                    ];
                    break;
                default: // User
                    links = [
                        { path: '/', label: 'Trang chủ' },
                        { path: '/searchPage', label: 'Tìm kiếm' },
                        { path: '/community', label: 'Cộng đồng' },
                        { path: '/my-bookings', label: 'Booking của tôi' },
                    ];
                    break;
            }
        }

        return links;
    };

    // Get account dropdown items
    const getAccountDropdownItems = () => {
        if (!isAuthenticated) return [];

        const userRole = currentUser?.role?.toLowerCase();
        let items = [];

        switch (userRole) {
            case 'owner':
                items = [
                    { path: '/profile', label: 'Hồ sơ công ty' },
                    { path: '/billing', label: 'Thanh toán' },
                    { path: '/settings', label: 'Cài đặt' },
                ];
                break;
            case 'sysadmin':
            case 'admin':
                items = [
                    { path: '/admin/profile', label: 'Hồ sơ Admin' },
                    { path: '/admin/system-logs', label: 'System Logs' },
                    { path: '/admin/security', label: 'Security' },
                ];
                break;
            default: // User
                items = [
                    { path: '/profile', label: 'Hồ sơ của tôi' },
                    { path: '/account-settings', label: 'Cài đặt tài khoản' },
                ];
                break;
        }

        return items;
    };

    // Render search bar
    const renderSearchBar = (isMobileContext = false) => {
        // Don't render search bar for Owner role or unauthenticated users
        if (!isAuthenticated || currentUser?.role?.toLowerCase() !== 'user') return null;

        return (
            <form
                className={`${styles.searchBarContainer} ${isMobileContext ? styles.mobileSearchInSidebar : ''}`}
                onSubmit={handleSearchSubmit}
            >
                <div className={styles.scopeSwitcherWrapper} ref={scopeDropdownRef}>
                    <button type="button" className={styles.scopeSwitcherButton} onClick={toggleScopeDropdown}>
                        {searchScope === 'Không gian' } 
                        {/* <DownArrowIcon /> */}
                    </button>
                    {isScopeDropdownOpen && (
                        <div className={styles.scopeDropdown}>
                            <button type="button" onClick={() => handleScopeChange('spaces')}>Không gian</button>
                            <button type="button" onClick={() => handleScopeChange('community')}>Cộng đồng</button>
                        </div>
                    )}
                </div>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder={searchScope === 'spaces' ? 'Tìm kiếm không gian...' : 'Tìm kiếm cộng đồng...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className={styles.searchSubmitButton} aria-label="Tìm kiếm">
                    <SearchIcon />
                </button>
            </form>
        );
    };

    const navLinks = getNavLinks();
    const accountItems = getAccountDropdownItems();
    const isUserRole = isAuthenticated && currentUser?.role?.toLowerCase() === 'user';
    const isOwnerRole = isAuthenticated && currentUser?.role?.toLowerCase() === 'owner';
    const isAdminRole = isAuthenticated && (currentUser?.role?.toLowerCase() === 'sysadmin' || currentUser?.role?.toLowerCase() === 'admin');

    return (
        <>
            <nav className={styles.navbar}>
                <div className={styles.navbarInner}>
                    {/* Logo */}
                    <NavLink to="/" className={styles.logo} onClick={() => setIsMobileMenuOpen(false)}>
                        <img
                            src='https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2F5%2F52%2FFree_logo.svg%2F1200px-Free_logo.svg.png&f=1&nofb=1&ipt=7e0a3e478ff75382cd574bb0458681602da0fc8c7aeb81729dc46298402981d9'
                            alt="Working Space"
                        />
                        <span>Working Space</span>
                    </NavLink>

                    {/* Desktop Middle: Search Bar (User role) or Nav Links */}
                    <div className={styles.navMiddleDesktop}>
                        {isUserRole && renderSearchBar()}
                        {(isOwnerRole || isAdminRole) && (
                            <div className={styles.navLinksContainerDesktop}>
                                {navLinks.map(link => (
                                    <NavLink
                                        key={link.path}
                                        to={link.path}
                                        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                                    >
                                        {link.label}
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Actions */}
                    <div className={styles.navRight}>
                        {/* Desktop Nav Links for User role (when search bar is in middle) */}
                        {isUserRole && (
                            <div className={styles.navLinksContainerDesktop}>
                                {navLinks.slice(2).map(link => ( // Skip home and search
                                    <NavLink
                                        key={link.path}
                                        to={link.path}
                                        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                                    >
                                        {link.label}
                                    </NavLink>
                                ))}
                            </div>
                        )}

                        {/* Language Switcher */}
                        <div className={styles.languageSwitcher} ref={languageDropdownRef}>
                            <button onClick={toggleLanguageDropdown} className={styles.iconButton} aria-label={t('language')}>
                                🌐 {i18n.language.toUpperCase()}
                            </button>
                            {isLanguageDropdownOpen && (
                                <div className={styles.dropdownMenu} style={{ minWidth: '80px' }}>
                                    <button className={styles.dropdownItem} onClick={() => changeLanguage('en')}>English</button>
                                    <button className={styles.dropdownItem} onClick={() => changeLanguage('vi')}>Tiếng Việt</button>
                                </div>
                            )}
                        </div>

                        {isAuthenticated && (
                            <>
                                {/* Notifications */}
                                <div className={styles.notificationIconWrapper} ref={notificationDropdownRef}>
                                    <button onClick={toggleNotificationDropdown} className={`${styles.iconButton} ${styles.notificationButton}`} aria-label="Thông báo">
                                        <BellIcon />
                                        {hasNewNotifications && <span className={styles.notificationBadge}></span>}
                                    </button>
                                    {isNotificationDropdownOpen && (
                                        <div className={styles.dropdownMenu} style={{ minWidth: '250px', right: 0, left: 'auto' }}>
                                            <div className={styles.dropdownHeader}>Thông báo</div>
                                            <div className={styles.dropdownItem}>Không có thông báo mới</div>
                                        </div>
                                    )}
                                </div>

                                {/* User Account Menu */}
                                <div className={styles.userAccountMenu} ref={accountDropdownRef}>
                                    <button onClick={toggleAccountDropdown} className={styles.avatarButton} aria-label="Menu tài khoản">
                                        {currentUser?.avatarUrl ? (
                                            <img src={currentUser.avatarUrl} alt={currentUser.username || 'User Avatar'} className={styles.avatar} />
                                        ) : (
                                            <UserIcon />
                                        )}
                                    </button>
                                    {isAccountDropdownOpen && (
                                        <div className={styles.dropdownMenu} style={{ minWidth: '180px', right: 0, left: 'auto' }}>
                                            <div className={styles.dropdownHeader}>
                                                {currentUser?.fullName || currentUser?.username || 'Tài khoản'}
                                            </div>
                                            {accountItems.map(item => (
                                                <NavLink key={item.path} to={item.path} className={styles.dropdownItem} onClick={() => setIsAccountDropdownOpen(false)}>
                                                    {item.label}
                                                </NavLink>
                                            ))}
                                            <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutButton}`}>
                                                Đăng xuất
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {!isAuthenticated && (
                            <div className={styles.authButtonsDesktop}>
                                <NavLink to="/login" className={`${styles.navButton} ${styles.loginButton}`}>Đăng nhập</NavLink>
                                <NavLink to="/register" className={`${styles.navButton} ${styles.signupButton}`}>Đăng ký</NavLink>
                            </div>
                        )}

                        {/* Mobile Icons */}
                        <button onClick={toggleMobileMenu} className={styles.hamburgerButton} aria-label="Mở menu">
                            <MenuIcon />
                        </button>
                        {isUserRole && (
                            <button onClick={() => setIsMobileSearchVisible(true)} className={styles.mobileSearchTrigger} aria-label="Tìm kiếm">
                                <SearchIcon />
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* MOBILE COMPONENTS TEMPORARILY DISABLED TO FIX DUAL NAVBAR ISSUE */}
            {/* Will re-enable after fixing the dual navbar problem */}
        </>
    );
}

export default Navbar;
// src/components/Layout/Navbar.jsx