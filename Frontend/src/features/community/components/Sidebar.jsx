// src/components/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import {
    fetchMyJoinedCommunities,
    selectMyJoinedCommunities,
    selectMyJoinedCommunitiesStatus,
    selectMyJoinedCommunitiesError,
    // REMOVE: setSelectedCommunity, // Sidebar will not dispatch this directly anymore
    selectSelectedCommunityId, // Keep for highlighting active community
    searchCommunities,
    setCommunitySearchFilter,
    resetCommunitySearchFilters,
} from '../slices/communitySlice';
import { selectIsAuthenticated } from '../../auth/slices/authSlice'; // *** THÊM import selectIsAuthenticated ***
import CreateCommunityModal from './CreateCommunityModal';

const getGroupIconUrl = (community) => { /* ... same ... */
    if (community.communityCoverImageUrl) {
        if (community.communityCoverImageUrl.startsWith('http')) return community.communityCoverImageUrl;
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        return `${baseUrl}${community.communityCoverImageUrl}`;
    }
    return `https://via.placeholder.com/40x40/777/fff?text=${community.communityName?.charAt(0) || 'G'}`;
};

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const communities = useSelector(selectMyJoinedCommunities); // *** SỬA: Rename từ myJoinedCommunities thành communities ***
    const status = useSelector(selectMyJoinedCommunitiesStatus);
    const error = useSelector(selectMyJoinedCommunitiesError);
    const isAuthenticated = useSelector(selectIsAuthenticated); // *** SỬA: Dùng selector thay vì direct state ***
    const selectedCommunityIdForHighlight = useSelector(selectSelectedCommunityId); // For styling active item

    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        if (isAuthenticated && (status === 'idle' || status === 'failed')) {
            dispatch(fetchMyJoinedCommunities());
        }
    }, [dispatch, isAuthenticated, status]);

    // Basic inline styles (same as before)
    const styles = { /* ... */
        sidebar: { width: '280px', backgroundColor: '#f8f9fa', padding: '15px', borderRight: '1px solid #e7e7e7', height: '100vh', display: 'flex', flexDirection: 'column', overflowY: 'auto' },
        sidebarHeader: { marginBottom: '20px', textAlign: 'center' },
        logo: { fontSize: '1.5rem', fontWeight: 'bold' },
        searchBar: { marginBottom: '20px' },
        searchInput: { width: '100%', padding: '8px 12px', borderRadius: '20px', border: '1px solid #ced4da', fontSize: '0.9rem' },
        mainNav: { marginBottom: '20px' },
        navList: { listStyle: 'none', padding: 0 },
        navItem: { marginBottom: '5px' },
        navLink: { display: 'flex', alignItems: 'center', padding: '10px 15px', textDecoration: 'none', color: '#333', borderRadius: '5px', transition: 'background-color 0.2s ease' },
        activeNavLink: { backgroundColor: '#007bff', color: 'white', fontWeight: '500' },
        createSection: { marginBottom: '20px', padding: '0 10px' },
        joinedGroups: { marginTop: '10px', borderTop: '1px solid #e0e0e0', paddingTop: '15px', flexShrink: 0 },
        joinedGroupsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 10px' },
        groupList: { listStyle: 'none', padding: 0, maxHeight: 'calc(100vh - 450px)', overflowY: 'auto' },
        groupListItem: { marginBottom: '2px' },
        groupLink: { display: 'flex', alignItems: 'center', padding: '8px 10px', textDecoration: 'none', color: '#212529', borderRadius: '4px', transition: 'background-color 0.1s ease' },
        activeGroupLink: { backgroundColor: '#ddeeff', fontWeight: '500' }, // Style for active community
        groupIcon: { width: '32px', height: '32px', marginRight: '10px', objectFit: 'cover' },
        groupInfo: { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
        groupName: { fontSize: '0.9rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
        groupActivity: { fontSize: '0.75rem', color: '#6c757d' },
    };

    return (
        <aside className="sidebar" style={styles.sidebar}>
            {/* <div style={styles.sidebarHeader}><div style={styles.logo}><Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}><span>CoworkingHub</span></Link></div></div> */}
            <div style={styles.searchBar}>
                <input 
                    type="text" 
                    placeholder="🔍 Tìm kiếm cộng đồng..." 
                    style={styles.searchInput} 
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            navigate('/community');
                            // Dispatch search action with the input value
                            dispatch(setCommunitySearchFilter({ 
                                filterName: 'NameKeyword', 
                                value: e.target.value 
                            }));
                            dispatch(searchCommunities());
                            // Add a small delay for the component to fully mount before dispatching search
                            setTimeout(() => {
                                // Try to find and trigger the simulate click on the parent component
                                const event = new CustomEvent('searchCommunity', {
                                    detail: { keyword: e.target.value }
                                });
                                document.dispatchEvent(event);
                            }, 100);
                        }
                    }} 
                />
            </div>
            <nav style={styles.mainNav}>
                <ul style={styles.navList}>
                    <li style={styles.navItem}>
                        <NavLink 
                            to="/community" 
                            end 
                            style={({ isActive }) => ({ 
                                ...styles.navLink, 
                                ...(isActive ? styles.activeNavLink : {}) 
                            })}
                            onClick={() => {
                                // Dispatch search action when clicking "Khám phá CĐ"
                                dispatch(resetCommunitySearchFilters());
                                dispatch(searchCommunities());
                            }}
                        >
                            <span>🏠</span> Khám phá CĐ
                        </NavLink>
                    </li>
                </ul>
            </nav>

            {isAuthenticated && (<div style={styles.createSection}><Button variant="primary" className="w-100" onClick={() => setShowCreateModal(true)}>+ Tạo Cộng đồng Mới</Button></div>)}

            {isAuthenticated && (
                <div style={styles.joinedGroups}>
                    <div style={styles.joinedGroupsHeader}><h4>Cộng đồng của bạn</h4></div>
                    {status === 'loading' && <div className="text-center p-3"><Spinner size="sm" /></div>}
                    {status === 'failed' && error && <Alert variant="danger" className="m-2 small p-2">Lỗi: {String(error)}</Alert>}
                    {status === 'succeeded' && (
                        <ul style={styles.groupList}>
                            {communities.length > 0 ? communities.map(comm => (
                                <li key={comm.communityId} style={styles.groupListItem}>
                                    <Link
                                        to={`/communities/${comm.communityId}`}
                                        style={comm.communityId === selectedCommunityIdForHighlight
                                            ? { ...styles.groupLink, ...styles.activeGroupLink }
                                            : styles.groupLink
                                        }
                                    >
                                        <Image src={getGroupIconUrl(comm)} alt={`${comm.communityName} Icon`} roundedCircle style={styles.groupIcon} />
                                        <div style={styles.groupInfo}>
                                            <span style={styles.groupName}>{comm.communityName}</span>
                                            <small style={styles.groupActivity}>Vai trò: {comm.roleInCommunity}</small>
                                        </div>
                                    </Link>
                                </li>
                            )) : <p className="text-muted small p-2">Bạn chưa tham gia cộng đồng nào.</p>}
                        </ul>
                    )}
                </div>
            )}
            <CreateCommunityModal show={showCreateModal} onHide={() => setShowCreateModal(false)} />
        </aside>
    );
};
export default Sidebar;