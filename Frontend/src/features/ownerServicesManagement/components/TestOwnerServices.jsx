import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../../auth/slices/authSlice';

const TestOwnerServices = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get auth info from Redux store
  const currentUser = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token = localStorage.getItem('accessToken'); // Get token from localStorage as backup

  const testAPI = async () => {
    setLoading(true);
    setTestResult('Testing...');
    
    try {
      // Test basic fetch to API
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      setTestResult(`API Base URL: ${baseUrl}`);
      
      // Test if we can reach the API at all
      const response = await fetch(`${baseUrl}/api/owner/private-services`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add auth header if available
          ...(token && {
            'Authorization': `Bearer ${token}`
          })
        }
      });
      
      setTestResult(prev => prev + `\n\nStatus: ${response.status}`);
      setTestResult(prev => prev + `\nStatus Text: ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(prev => prev + `\nData: ${JSON.stringify(data, null, 2)}`);
      } else {
        const errorText = await response.text();
        setTestResult(prev => prev + `\nError: ${errorText}`);
      }
      
    } catch (error) {
      setTestResult(prev => prev + `\nFetch Error: ${error.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Owner Services - Debug Page</h1>
      <p>Testing API connectivity and authentication</p>
      
      {!isAuthenticated && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <strong>⚠️ Warning:</strong> You are not authenticated. Please <a href="/login">login</a> first to test the API.
        </div>
      )}
      
      {currentUser && currentUser.role !== 'Owner' && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <strong>⚠️ Warning:</strong> Current user role is "{currentUser.role}" but API requires "Owner" role.
        </div>
      )}
      
      <button 
        onClick={testAPI} 
        disabled={loading}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>
      
      {testResult && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace'
        }}>
          {testResult}
        </div>
      )}
      
      <div style={{ marginTop: '2rem' }}>
        <h3>Authentication Info:</h3>
        <ul>
          <li>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</li>
          <li>Current User: {currentUser ? JSON.stringify(currentUser, null, 2) : 'None'}</li>
          <li>Access Token exists: {token ? 'Yes' : 'No'}</li>
          <li>Token (first 20 chars): {token ? token.substring(0, 20) + '...' : 'None'}</li>
        </ul>
        
        <h3>Environment Info:</h3>
        <ul>
          <li>VITE_API_BASE_URL: {import.meta.env.VITE_API_BASE_URL}</li>
          <li>Mode: {import.meta.env.MODE}</li>
        </ul>
      </div>
    </div>
  );
};

export default TestOwnerServices;
