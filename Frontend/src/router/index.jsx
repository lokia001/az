import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import { AuthLayout, MainLayout } from '../layouts';
import { Link, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux'; // Import useSelector
import { selectIsAuthenticated, selectCurrentUser, logoutUser, selectAuthStatus } from '../features/auth/slices/authSlice';
import {
    HomePage, NotFoundPage, AboutUs, Community, OwnerDashboard, AdminDashboard
} from '../pages';
import SystemLogs from '../components/SystemLogs';
import MyBookingsPage from '../pages/MyBookings/MyBookingsPage';

// import SpaceList from '../features/manageSpace/components/SpaceList';
// import SpaceForm from '../features/manageSpace/components/SpaceForm';
// import AmenityForm from '../components/AmenityForm';
// import SpaceDetails from '../features/manageSpace/components/SpaceDetails';
// import AmenityList from '../components/AmenityList';
// import EditSpacePage from '../features/manageSpace/components/EditSpacePage';
// import OwnerDashboard from '../pages/OwnerDashboard';
// import BookingManagementPage from '../pages/BookingManagementPage';
// import CustomerManagement from '../pages/CustomerManagement';
// import StaffManagementPage from '../pages/StaffManagementPage';
// import ManageFacilitiesServices from '../pages/ManageFacilitiesServices';
// import SpacePolicyManagement from '../pages/SpacePolicyManagement';
// import ProfilePage from '../pages/ProfilePage';
// import PricingAndOffersPage from '../pages/PricingAndOffersPage';
// import SettingsPage from '../pages/SettingsPage';
// import ReportPage from '../pages/ReportPage';
// import UserReportsPage from '../pages/UserReportsPage';
// import SystemDashboard from '../pages/SystemDashboard';
// import AlertManagementPage from '../pages/AlertManagementPage';
// import SystemLogs from '../pages/SystemLogs';
// import SupportTicketsPage from '../pages/SupportTicketsPage';
// import SpaceManagementPage from '../pages/SpaceManagementPage';
// import AddSpacePage from '../pages/AddSpacePage';
// import CustomerSpaceSearchPage from '../pages/CustomerSpaceSearchPage';
// import MyBookingsPage from '../pages/MyBookingsPage';
// import CommunityPage from '../pages/CommunityPage';
// import CommunityPage from '../CommunityPage';
import LoginForm from '../features/auth/components/LoginForm';
import RegisterForm from '../features/auth/components/RegisterForm';
import SpaceSearchPage from '../features/spaceSearch/SpaceSearchPage';
import SpaceDetailPage from '../pages/SpaceDetailPage';
import OwnerProfilePage from '../pages/OwnerProfilePage';
import AdminUserListPage from '../features/adminUserManagement/pages/AdminUserListPage';
import CommunityPlatformPage from '../pages/CommunityPlatformPage';
import CommunityFeedPage from '../pages/CommunityFeedPage';
import PostDetailPage from '../pages/PostDetailPage';
import OwnerRegistrationPage from '../features/ownerRegistration/pages/OwnerRegistrationPage';
import AdminOwnerRegistrationPage from '../features/ownerRegistration/pages/AdminOwnerRegistrationPage';
// import CommunitySearchPage from '../pages/CommunitySearchPage';
import SystemAmenitiesPage from '../features/systemItems/pages/SystemAmenitiesPage';
import SystemSpaceServicesPage from '../features/systemItems/pages/SystemSpaceServicesPage';
import AdminServicesAmenitiesPage from '../pages/AdminServicesAmenitiesPage';
import ProfilePage from '../features/profile/pages/ProfilePage';
import FavoriteSpacesPage from '../features/favoriteSpaces/pages/FavoriteSpacesPage';
import NearbySpacesPage from '../features/nearbySpaces/pages/NearbySpacesPage';

import OwnerSpacesPage from '../features/manageSpace/components/OwnerSpacesPage.jsx';
// import CreateSpacePage from '../features/manageSpace/pages/CreateSpacePage.jsx';
// import EditSpacePage from '../features/manageSpace/components/EditSpacePage.jsx';
import SpaceDetails from '../features/manageSpace/components/SpaceDetails.jsx';
import OwnerSpaceDetailPage from '../features/manageSpace/pages/OwnerSpaceDetailPage.jsx';
import OwnerBookingManagement from '../features/ownerBookingManagement/OwnerBookingManagement.jsx';
import OwnerCustomerManagement from '../features/ownerCustomerManagement/pages/OwnerCustomerManagement.jsx';
import OwnerServicesManagementPage from '../features/ownerServicesManagement/pages/OwnerServicesManagementPage.jsx';
import TestOwnerServices from '../features/ownerServicesManagement/components/TestOwnerServices.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleBasedHomepage from '../components/RoleBasedHomepage.jsx';


// AppNavbar component đã được loại bỏ để tránh hiện nhiều navbar


const AppRouter = () => {
    return (
        <Router>
            {/* Đã loại bỏ <AppNavbar /> ở đây vì đã có trong MainLayout */}
            <Routes>
                <Route path="/" element={<MainLayout />}> {/* MainLayout là layout */}

                    {/* mock */}
                    {/* <Route path="/customer-management" element={<CustomerManagement />} />
                    <Route path="/m" element={<MyBookingsPage />} />  */}
                    {/* end mock */}

                    {/* ok home */}
                    <Route index element={<RoleBasedHomepage />} /> {/* RoleBasedHomepage sẽ redirect theo role hoặc hiển thị HomePage */}
                    {/* Các routes con khác của MainLayout */}

                    {/* guest */}
                    <Route path="about-us" element={<AboutUs />} />
                    <Route path="explore" element={<SpaceSearchPage />} />

                    {/* Owner Routes */}
                    <Route path="/owner/dashboard" element={<OwnerDashboard />} />
                    <Route path="/owner/services-amenities" element={
                        <ProtectedRoute requiredRole="Owner">
                            <OwnerServicesManagementPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/owner/services-amenities-debug" element={
                        <ProtectedRoute requiredRole="Owner">
                            <TestOwnerServices />
                        </ProtectedRoute>
                    } />
                    
                    {/* Admin Routes */}
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/accounts" element={<AdminUserListPage />} />
                    <Route path="/admin/services-amenities" element={<AdminServicesAmenitiesPage />} />

                    {/* ---mangage space*/}
                    {/* <Route path="manage-space" element={<SpaceList />} />
                    <Route path="/manage-space/:id" element={<SpaceDetails />} />
                    <Route path="/space/new" element={<SpaceForm />} /> 
                    <Route path="/space/edit/:id" element={<EditSpacePage />} />
                    <Route path="/amenity/new" element={<AmenityForm />} /> 
                    <Route path="amenities" element={<AmenityList />} /> */}


                    {/* Space Management Routes */}
                    <Route path="/admin/system-amenities" element={<SystemAmenitiesPage />} />
                    <Route path="/admin/system-space-services" element={<SystemSpaceServicesPage />} />
                    
                    {/* Owner Space Management */}
                    <Route path="/owner/spaces" element={<OwnerSpacesPage />} />
                    <Route path="/owner/manage-spaces" element={<OwnerSpacesPage />} />
                    <Route path="/owner/manage-spaces/:id" element={<OwnerSpaceDetailPage />} />
                    <Route path="/owner/bookings" element={<OwnerBookingManagement />} />
                    <Route path="/owner/spaces/:spaceId/bookings" element={<OwnerBookingManagement />} />
                    <Route path="/owner/customers" element={<OwnerCustomerManagement />} />

                    {/* <Route path="/bookings/space/:id" element={<OwnerBookingManagement />} /> */}
{/* <Route path="/owner/bookings" element={<OwnerBookingManagement />} /> */}

                    {/* ok end */}



                    {/* start  ok */}
                    <Route path="/searchPage" element={<SpaceSearchPage />} />
                    <Route path="/spaces/:spaceIdOrSlug" element={<SpaceDetailPage />} />
                    <Route path="/owner/:ownerId" element={<OwnerProfilePage />} />
                    <Route path="/owner-registration" element={
                        <ProtectedRoute requiredRole="User">
                            <OwnerRegistrationPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/users" element={<AdminUserListPage />} />
                    <Route path="/admin/owner-registration" element={
                        <ProtectedRoute requiredRole="SysAdmin">
                            <AdminOwnerRegistrationPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/community" element={<CommunityPlatformPage />} />
                    {/* System Admin Routes */}
                    <Route path="/admin/community" element={<NotFoundPage message="Admin Community Management - Coming Soon" />} />
                    <Route path="/my-bookings" element={<MyBookingsPage />} />
                    <Route path="/admin/reports" element={<NotFoundPage message="Admin Reports - Coming Soon" />} />
                    <Route path="/admin/settings" element={<NotFoundPage message="Admin Settings - Coming Soon" />} />
                    <Route path="/admin/profile" element={<NotFoundPage message="Admin Profile - Coming Soon" />} />
                    <Route path="/admin/security" element={<NotFoundPage message="Security Settings - Coming Soon" />} />
                    {/* End System Admin Routes */}
                    <Route
                        path="/communities/:communityId" // Route for a specific community's feed
                        element={<CommunityFeedPage />} // Render the new page component
                    />
                    <Route path="/posts/:postId" element={<PostDetailPage />} />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    } />
                    <Route path="/favorites" element={
                        <ProtectedRoute>
                            <FavoriteSpacesPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/nearby-spaces" element={
                        <ProtectedRoute>
                            <NearbySpacesPage />
                        </ProtectedRoute>
                    } />
                    {/* <Route path="/communities/search" element={<CommunitySearchPage />} /> */}
                    {/*  end ok*/}
                    {/* <Route path="/space-management" element={<SpaceManagementPage />} />
                    <Route path="/space-management/add" element={<AddSpacePage />} />

                    <Route path="/OwnerDashboard" element={<OwnerDashboard />} />
                    <Route path="/BookingManagement" element={<BookingManagementPage />} />
                    <Route path="/CustomerManagement" element={<CustomerManagement />} />
                    <Route path="/StaffManagement" element={<StaffManagementPage />} />
                    <Route path="/facilities-services-management" element={<ManageFacilitiesServices />} />
                    <Route path="/SpacePolicyManagement" element={<SpacePolicyManagement />} />
                    <Route path="/ProfilePage" element={<ProfilePage />} />
                    <Route path="/PricingAndOffersPage" element={<PricingAndOffersPage />} />
                    <Route path="/SettingsPage" element={<SettingsPage />} />
                    <Route path="/ReportPage" element={<ReportPage />} />
                    <Route path="/UserReportsPage" element={<UserReportsPage />} />
                    <Route path="/forget-password" element={<UserReportsPage />} /> */}

                    {/* admin*/}
                    {/* <Route path="/system-user-management" element={<SystemUserManagementPage />} />
                    <Route path="/system-dashboard" element={<SystemDashboard />} />
                    <Route path="/AlertManagementPage" element={<AlertManagementPage />} />
                    <Route path="/SystemLogs" element={<SystemLogs />} />
                    <Route path="/SupportTicketsPage" element={<SupportTicketsPage />} /> */}


                    {/* error */}
                    <Route path="*" element={<NotFoundPage />} />
                </Route>

                <Route path="/" element={<AuthLayout />}>
                    {/* ok final */}
                    <Route path="/register" element={<RegisterForm />} />
                    <Route path="/login" element={<LoginForm />} />

                    {/* ok end final */}
                    {/* <Route path="/user/register" element={<RegisterForm />} /> */}
                    {/* <Route path="/forgot-password" element={<ForgotPasswordForm />} /> */}
                    {/* <Route path="/reset-password" element={<ResetPasswordForm />} /> */}


                </Route>

                {/* Các routes không sử dụng MainLayout (ví dụ: AuthLayout) */}
            </Routes>
        </Router>
    );
};

export default AppRouter;