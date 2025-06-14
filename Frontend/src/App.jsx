import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppRouter from './router';
import { loadUserFromToken } from '../features/auth/slices/authSlice';

function App() {
  console.log('🚀 App component is rendering...');
  const dispatch = useDispatch();
  const authStatus = useSelector(state => state.auth.status);
  const currentUser = useSelector(state => state.auth.user);

  useEffect(() => {
    // Only load user if we have not already tried (status is 'idle')
    // and we don't already have a user, and there might be a token
    const hasAccessToken = localStorage.getItem('accessToken');
    
    if (authStatus === 'idle' && !currentUser && hasAccessToken) {
      console.log('Loading user data from token on app startup...');
      dispatch(loadUserFromToken());
    }
  }, [dispatch, authStatus, currentUser]);

  // Use real production router with real components
  return <AppRouter />;
}

export default App;