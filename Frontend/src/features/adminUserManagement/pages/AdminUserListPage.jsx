// src/features/adminUserManagement/pages/AdminUserListPage.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import BootstrapPagination from 'react-bootstrap/Pagination'; // Aliased

import {
    fetchAdminUsers,
    setAdminUserPage,
    selectAdminAllUsers,
    selectAdminUserFilters,
    selectAdminUserPagination,
    selectAdminUserListStatus,
    selectAdminUserListError,
    prepareUserForAction, // <-- IMPORT
    clearUserForAction,   // <-- IMPORT
    selectAdminUserForAction, // <-- IMPORT
    // Import actions for user operations later
} from '../slices/adminUserSlice';

import UserListFilters from '../components/UserListFilters';
import UserListTable from '../components/UserListTable';
import ChangeRoleModal from '../components/ChangeRoleModal';
import UserDetailModal from '../components/UserDetailModal';

const AdminUserListPage = () => {
    const dispatch = useDispatch();

    const users = useSelector(selectAdminAllUsers);
    const filters = useSelector(selectAdminUserFilters);
    const pagination = useSelector(selectAdminUserPagination);
    const status = useSelector(selectAdminUserListStatus);
    const error = useSelector(selectAdminUserListError);
    const userForModal = useSelector(selectAdminUserForAction);


    // Modal states
    const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
    const [showUserDetailModal, setShowUserDetailModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        console.log('[AdminUserListPage] useEffect - Fetching users. Filters:', filters, 'Page:', pagination.PageNumber);
        // Simplified condition to fetch users when filters or pagination changes
        dispatch(fetchAdminUsers());
    }, [filters, pagination.PageNumber, dispatch]); 

    // More robust useEffect for fetching:
    // const prevFiltersRef = useRef(filters);
    // const prevPageRef = useRef(pagination.PageNumber);
    // useEffect(() => {
    //   if (status === 'loading') return; // Don't fetch if already loading

    //   const filtersHaveChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters);
    //   const pageHasChanged = prevPageRef.current !== pagination.PageNumber;

    //   if (filtersHaveChanged) {
    //       prevFiltersRef.current = filters;
    //       // If filters change, page is reset to 1 in reducer, so this effect will run again for page 1
    //       dispatch(fetchAdminUsers({ ...filters, PageNumber: 1 })); // Fetch page 1 with new filters
    //   } else if (pageHasChanged) {
    //       prevPageRef.current = pagination.PageNumber;
    //       dispatch(fetchAdminUsers()); // Fetch current page with existing filters
    //   } else if (status === 'idle') { // Initial load or after reset
    //       dispatch(fetchAdminUsers());
    //   }
    // }, [filters, pagination.PageNumber, status, dispatch]);


    const handlePageChange = (newPageNumber) => {
        if (status === 'loading' || newPageNumber === pagination.PageNumber) return;
        dispatch(setAdminUserPage(newPageNumber));
    };

    const renderPaginationItems = () => { /* ... same ... */
        if (!pagination.totalPages || pagination.totalPages <= 1) return null;
        let items = []; const maxPagesToShow = 7;
        let startPage = Math.max(1, pagination.PageNumber - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);
        if (endPage - startPage + 1 < maxPagesToShow) startPage = Math.max(1, endPage - maxPagesToShow + 1);
        if (startPage > 1) { items.push(<BootstrapPagination.First key="first" onClick={() => handlePageChange(1)} disabled={status === 'loading'} />); items.push(<BootstrapPagination.Prev key="prev" onClick={() => handlePageChange(pagination.PageNumber - 1)} disabled={pagination.PageNumber <= 1 || status === 'loading'} />); if (startPage > 2) items.push(<BootstrapPagination.Ellipsis key="start-ellipsis" disabled />); }
        for (let number = startPage; number <= endPage; number++) { items.push(<BootstrapPagination.Item key={number} active={number === pagination.PageNumber} onClick={() => handlePageChange(number)} disabled={status === 'loading'}>{number}</BootstrapPagination.Item>); }
        if (endPage < pagination.totalPages) { if (endPage < pagination.totalPages - 1) items.push(<BootstrapPagination.Ellipsis key="end-ellipsis" disabled />); items.push(<BootstrapPagination.Next key="next" onClick={() => handlePageChange(pagination.PageNumber + 1)} disabled={pagination.PageNumber >= pagination.totalPages || status === 'loading'} />); items.push(<BootstrapPagination.Last key="last" onClick={() => handlePageChange(pagination.totalPages)} disabled={status === 'loading'} />); }
        return <BootstrapPagination className="justify-content-center mt-3">{items}</BootstrapPagination>;
    };

    // Action Handlers for UserListTable
    const handleToggleActive = (userId, newStatus) => {
        // TODO: Implement when setAdminUserActiveStatusAPI and thunk are ready
        alert(`TODO: Set user ${userId} active to ${newStatus}`);
    };

    const handleOpenChangeRoleModal = (user) => { // user object from the list
        dispatch(prepareUserForAction(user)); // Set user in Redux state for modal
        setShowChangeRoleModal(true);
    };

    const handleCloseChangeRoleModal = () => {
        setShowChangeRoleModal(false);
        dispatch(clearUserForAction()); // Clear user from Redux state
    };

    const handleViewDetails = (userId) => {
        const userToView = users.find(u => u.id === userId);
        if (userToView) {
            setSelectedUser(userToView);
            setShowUserDetailModal(true);
        } else {
            alert(`Không tìm thấy thông tin người dùng ${userId}`);
        }
    };

    return (
        <> {/* Fragment to include Modal */}
            <Container fluid className="py-3">
                <h2 className="mb-3">Quản lý Tài khoản Người dùng</h2>
                <UserListFilters />

                {status === 'loading' && <div className="text-center my-5"><Spinner animation="border" variant="primary" /><p>Đang tải...</p></div>}
                {status === 'failed' && error && <Alert variant="danger">Lỗi: {String(error)}</Alert>}

                {status === 'succeeded' && (
                    <>
                        <UserListTable
                            users={users}
                            onToggleActive={handleToggleActive}
                            onChangeRole={(userId) => { // Find user object to pass to modal
                                const userToEdit = users.find(u => u.id === userId);
                                if (userToEdit) handleOpenChangeRoleModal(userToEdit);
                            }}
                            onViewDetails={handleViewDetails}
                        />
                        {users.length > 0 && renderPaginationItems()}
                        {users.length === 0 && <Alert variant="info">Không tìm thấy người dùng.</Alert>}
                    </>
                )}
            </Container>

            {/* Render Change Role Modal */}
            {userForModal && (
                <ChangeRoleModal
                    show={showChangeRoleModal}
                    onHide={handleCloseChangeRoleModal}
                    user={userForModal}
                />
            )}
            
            {/* Render User Detail Modal */}
            {selectedUser && (
                <UserDetailModal
                    show={showUserDetailModal}
                    onHide={() => {
                        setShowUserDetailModal(false);
                        setSelectedUser(null);
                    }}
                    user={selectedUser}
                />
            )}
        </>
    );
};

export default AdminUserListPage;