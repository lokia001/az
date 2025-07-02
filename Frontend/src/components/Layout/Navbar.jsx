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

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchScope, setSearchScope] = useState('spaces');
    const [isScopeDropdownOpen, setIsScopeDropdownOpen] = useState(false);
    const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);

    // Refs for dropdowns
    const accountDropdownRef = useRef(null);
    const languageDropdownRef = useRef(null);
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
            // Always redirect to homepage (introduction page) after logout
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Error during logout:', error);
            // Still navigate to homepage even if there was an error
            navigate('/', { replace: true });
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

    // Get navigation links based on user role
    const getNavLinks = () => {
        let links = [];

        if (!isAuthenticated) {
            // Guest - Explore, Community, About us
            links = [
                { path: '/explore', label: 'Explore' },
                { path: '/community', label: 'Community' },
                { path: '/about-us', label: 'About us' }
            ];
        } else {
            const userRole = currentUser?.role?.toLowerCase();

            switch (userRole) {
                case 'owner':
                    // Owner - Dash, Space, S&A, Book, Customer, Community
                    links = [
                        { path: '/owner/dashboard', label: 'Dash' },
                        { path: '/owner/manage-spaces', label: 'Space' },
                        { path: '/owner/services-amenities', label: 'S&A' },
                        { path: '/owner/bookings', label: 'Book' },
                        { path: '/owner/customers', label: 'Customer' },
                        { path: '/community', label: 'Community' }
                    ];
                    break;
                case 'sysadmin':
                case 'admin':
                    // SysAdmin - Dash, S&A, Account, Owner Reg, Community
                    links = [
                        { path: '/admin/dashboard', label: 'Dash' },
                        { path: '/admin/services-amenities', label: 'S&A' },
                        { path: '/admin/users', label: 'Users' },
                        { path: '/admin/owner-registration', label: 'Owner Reg' },
                        { path: '/community', label: 'Community' }
                    ];
                    break;
                default: // User
                    // User - Explore, Community, About us
                    links = [
                        { path: '/explore', label: 'Explore' },
                        { path: '/community', label: 'Community' },
                        { path: '/about-us', label: 'About us' }
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

        // Tất cả các role đều có Profile và Logout, chỉ khác nhau ở text hiển thị
        switch (userRole) {
            case 'owner':
                items = [
                    { path: '/profile', label: 'Profile' },
                    { path: '/favorites', label: 'Favorites' },
                    { path: '/nearby-spaces', label: 'Nearby Spaces' }
                ];
                break;
            case 'sysadmin':
            case 'admin':
                items = [
                    { path: '/profile', label: 'Profile' },
                    { path: '/favorites', label: 'Favorites' },
                    { path: '/nearby-spaces', label: 'Nearby Spaces' }
                ];
                break;
            default: // User
                items = [
                    { path: '/profile', label: 'Profile' },
                    { path: '/favorites', label: 'Favorites' },
                    { path: '/nearby-spaces', label: 'Nearby Spaces' },
                    { path: '/owner-registration', label: 'Become Owner' }
                ];
                break;
        }

        return items;
    };

    // Render search bar
    const renderSearchBar = (isMobileContext = false) => {
        // Only render search bar for User and Guest roles
        const userRole = currentUser?.role?.toLowerCase();
        if (isAuthenticated && userRole !== 'user') return null;

        return (
            <form
                className={`${styles.searchBarContainer} ${isMobileContext ? styles.mobileSearchInSidebar : ''}`}
                onSubmit={handleSearchSubmit}
            >
                <div className={styles.scopeSwitcherWrapper} ref={scopeDropdownRef}>
                    <button type="button" className={styles.scopeSwitcherButton} onClick={toggleScopeDropdown}>
                        {searchScope === 'spaces' ? 'Spaces' : 'Community'}
                        <DownArrowIcon />
                    </button>
                    {isScopeDropdownOpen && (
                        <div className={styles.scopeDropdown}>
                            <button type="button" onClick={() => handleScopeChange('spaces')}>Spaces</button>
                            <button type="button" onClick={() => handleScopeChange('community')}>Community</button>
                        </div>
                    )}
                </div>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder={searchScope === 'spaces' ? 'Search spaces...' : 'Search community...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className={styles.searchSubmitButton} aria-label="Search">
                    <SearchIcon />
                </button>
            </form>
        );
    };

    const navLinks = getNavLinks();
    const accountItems = getAccountDropdownItems();
    const userRole = currentUser?.role?.toLowerCase();
    const isGuest = !isAuthenticated;
    const isUser = isAuthenticated && userRole === 'user';
    const isOwner = isAuthenticated && userRole === 'owner';
    const isAdmin = isAuthenticated && (userRole === 'sysadmin' || userRole === 'admin');

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

                    {/* Desktop Middle: Search Bar (User/Guest) or Nav Links (Owner/Admin) */}
                    <div className={styles.navMiddleDesktop}>
                        {(isGuest || isUser) && renderSearchBar()}
                        {(isOwner || isAdmin) && (
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
                        {/* Desktop Nav Links for User/Guest role (when search bar is in middle) */}
                        {(isGuest || isUser) && (
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

                        {/* Language Switcher */}
                        <div className={styles.languageSwitcher} ref={languageDropdownRef}>
                            <button onClick={toggleLanguageDropdown} className={styles.iconButton} aria-label={t('language')}>
                                🌐 En
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
                                {/* User Account Menu - Avatar Dropdown */}
                                <div className={styles.userAccountMenu} ref={accountDropdownRef}>
                                    <button onClick={toggleAccountDropdown} className={styles.avatarButton} aria-label="Account menu">
                                        {currentUser?.avatarUrl ? (
                                            <img src={currentUser.avatarUrl} alt={currentUser.username || 'User Avatar'} className={styles.avatar} />
                                        ) : (
                                            <UserIcon />
                                        )}
                                    </button>
                                    {isAccountDropdownOpen && (
                                        <div className={styles.dropdownMenu} style={{ minWidth: '180px', right: 0, left: 'auto' }}>
                                            <div className={styles.dropdownHeader}>
                                                {currentUser?.fullName || currentUser?.username || 'Account'}
                                            </div>
                                            {accountItems.map(item => (
                                                <NavLink key={item.path} to={item.path} className={styles.dropdownItem} onClick={() => setIsAccountDropdownOpen(false)}>
                                                    {item.label}
                                                </NavLink>
                                            ))}
                                            <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutButton}`}>
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {!isAuthenticated && (
                            <div className={styles.authButtonsDesktop}>
                                <NavLink to="/login" className={`${styles.navButton} ${styles.loginButton}`}>Login</NavLink>
                                <NavLink to="/register" className={`${styles.navButton} ${styles.signupButton}`}>Register</NavLink>
                            </div>
                        )}

                        {/* Mobile Icons */}
                        <button onClick={toggleMobileMenu} className={styles.hamburgerButton} aria-label="Open menu">
                            <MenuIcon />
                        </button>
                        {(isGuest || isUser) && (
                            <button onClick={() => setIsMobileSearchVisible(true)} className={styles.mobileSearchTrigger} aria-label="Search">
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