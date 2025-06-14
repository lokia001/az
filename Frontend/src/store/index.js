// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import existing slices only
// import authReducer from '../features/auth/slices/authSlice'; // File không tồn tại
// import chatbotReducer from '../features/chatbot/chatbotSlice';
import spaceSearchReducer from '../features/spaceSearch/slices/spaceSearchSlice';
import adminUserReducer from '../features/adminUserManagement/slices/adminUserSlice';
import communityReducer from '../features/community/slices/communitySlice';
import commentReducer from '../features/comments/slices/commentSlice';
import reviewReducer from '../features/reviews/slices/reviewSlice';
import reactionReducer from '../features/reactions/slices/reactionSlice';
import postDetailReducer from '../features/posts/slices/postDetailSlice';
import manageSpaceReducer from '../features/manageSpace/manageSpaceSlice';
import spaceDetailReducer from '../features/spaceDetail/slices/spaceDetailSlice';
import amenityReducer from '../features/amenities/amenitySlice';
import bookSpaceReducer from '../features/bookSpace/bookSpaceSlice';

// Import restored slice files
import usersReducer from '../features/users/slices/usersSlice';
import profileReducer from '../features/profile/slices/profileSlice';
import systemSpaceServicesReducer from '../features/systemItems/slices/systemSpaceServicesSlice';
import systemAmenitiesReducer from '../features/systemItems/slices/systemAmenitiesSlice';
import bookingReducer from '../features/booking/slices/bookingSlice';
import ownerBookingReducer from '../features/ownerBookingManagement/slices/ownerBookingSlice';
import myBookingsReducer from '../features/myBookings/slices/myBookingsSlice';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: [] // Empty whitelist since auth is removed
};

// Removed persistedAuthReducer since authReducer doesn't exist

// My bookings management
export const store = configureStore({
    reducer: {
        // auth: persistedAuthReducer, // Removed since authReducer doesn't exist
        // chatbot: chatbotReducer,
        spaceSearch: spaceSearchReducer,
        adminUsers: adminUserReducer,
        community: communityReducer,
        comments: commentReducer,
        reviews: reviewReducer,
        reactions: reactionReducer,
        postDetail: postDetailReducer,
        manageSpace: manageSpaceReducer,
        spaceDetail: spaceDetailReducer,
        amenities: amenityReducer,
        bookSpace: bookSpaceReducer,
        // Restored slices
        users: usersReducer,
        profile: profileReducer,
        systemSpaceServices: systemSpaceServicesReducer,
        systemAmenities: systemAmenitiesReducer,
        booking: bookingReducer,
        ownerBooking: ownerBookingReducer,
        myBookings: myBookingsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);