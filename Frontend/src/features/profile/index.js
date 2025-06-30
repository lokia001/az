// src/features/profile/index.js
export { default as ProfilePage } from './pages/ProfilePage';
export { default as ProfileView } from './components/ProfileView';
export { default as ProfileEdit } from './components/ProfileEdit';
export { default as ChangePassword } from './components/ChangePassword';
export { default as AccountSettings } from './components/AccountSettings';
export { default as ProfileTabs } from './components/ProfileTabs';

// Export Redux stuff
export * from './slices/profileSlice';

// Export API functions
export * from './services/profileApi';
export * from './services/profileApiFixed';
