// src/features/auth/components/LoginForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom'; // Link for navigation
import { useTranslation } from 'react-i18next'; // Import translation hook
import {
    loginUser,
    selectIsAuthenticated,
    selectAuthStatus,
    selectAuthError,
    clearAuthError
} from '../slices/authSlice'; // Correct path to your new authSlice

// GIẢ LẬP ICON (Keeping these as they are in your original code)
const GoogleIcon = () => <span style={{ marginRight: '8px', color: '#DB4437' }}>G</span>;
const FacebookIcon = () => <span style={{ marginRight: '8px', color: '#4267B2' }}>F</span>;

function LoginForm() {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formErrors, setFormErrors] = useState({}); // For client-side validation errors
    
    const { t } = useTranslation(); // Get the translation function
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isAuthenticated = useSelector(selectIsAuthenticated);
    const authStatus = useSelector(selectAuthStatus); // 'idle', 'loading', 'succeeded', 'failed'
    const authError = useSelector(selectAuthError);   // API error message from Redux

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/'); // Or to a dashboard page
        }
    }, [isAuthenticated, navigate]);

    // Clear API errors when component unmounts or inputs change
    useEffect(() => {
        return () => {
            dispatch(clearAuthError());
        };
    }, [dispatch]);

    const handleInputChange = (setter, fieldName) => (e) => {
        setter(e.target.value);
        if (formErrors[fieldName]) {
            setFormErrors(prev => ({ ...prev, [fieldName]: null }));
        }
        if (authError) { // Clear API error when user starts typing
            dispatch(clearAuthError());
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!usernameOrEmail.trim()) {
            newErrors.usernameOrEmail = t('error.emptyUsernameOrEmail'); // Use translation key
        }
        if (!password) {
            newErrors.password = t('error.emptyPassword'); // Use translation key
        }
        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        // Dispatch the loginUser thunk with the correct payload structure
        dispatch(loginUser({ usernameOrEmail, password }));
    };

    const handleSocialLogin = (provider) => {
        console.log(`Attempting to login with ${provider}`);
        // For now, we can keep the alert or integrate with actual social login later
        alert(`Chức năng đăng nhập với ${provider} chưa được triển khai.`);
        // Example: window.location.href = `/api/auth/${provider}`; // If backend handles redirect
    };

    // If already authenticated (e.g., due to fast redirect), render nothing or a loader
    if (isAuthenticated && authStatus !== 'loading') {
        return null; // Or <Navigate to="/" replace /> if not handled by useEffect yet
    }

    // Inline styles from your original component
    const styles = {
        container: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', maxWidth: '400px', margin: '40px auto', padding: '30px', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
        title: { textAlign: 'center', color: '#333', marginBottom: '25px', fontSize: '24px', fontWeight: '600' },
        inputGroup: { marginBottom: '20px' },
        label: { display: 'block', marginBottom: '8px', color: '#555', fontSize: '14px', fontWeight: '500' },
        input: { width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', fontSize: '16px', transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out' },
        inputFocus: { borderColor: '#007bff', boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)' }, // Added for focus
        inputError: { borderColor: '#e74c3c', boxShadow: '0 0 0 0.2rem rgba(231, 76, 60, 0.25)' },
        errorMessage: { color: '#e74c3c', fontSize: '13px', marginTop: '6px' },
        apiErrorMessage: { color: '#e74c3c', fontSize: '14px', marginTop: '10px', marginBottom: '10px', textAlign: 'center', padding: '10px', border: '1px solid #e74c3c', borderRadius: '4px', backgroundColor: '#f8d7da' },
        forgotPasswordContainer: { textAlign: 'right', marginBottom: '20px', fontSize: '14px' },
        submitButton: { width: '100%', padding: '14px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', transition: 'background-color 0.2s ease-in-out' },
        submitButtonDisabled: { backgroundColor: '#6c757d', cursor: 'not-allowed' },
        socialLoginContainer: { marginTop: '30px', textAlign: 'center' },
        dividerText: { margin: '20px 0', color: '#777', fontSize: '14px', display: 'flex', alignItems: 'center', textAlign: 'center' },
        dividerLine: { flexGrow: 1, height: '1px', backgroundColor: '#ddd', margin: '0 10px' }, // For the divider line
        socialButton: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontSize: '15px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out', backgroundColor: '#fff' },
        googleButton: { color: '#444' }, // You might want to style these more distinctively
        facebookButton: { color: '#444' },
        registerLink: { textAlign: 'center', marginTop: '25px', fontSize: '14px', color: '#555' },
        link: { color: '#007bff', textDecoration: 'none', fontWeight: '500' },
    };
    // Add focus style to input (example of enhancing inline styles)
    // This is a bit tricky with pure inline styles without event handlers for focus/blur on each input
    // For simplicity, I'll omit direct focus style changes here, but it's something CSS classes handle better.

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>{t('login.title')}</h2>
            {authError && (<p style={styles.apiErrorMessage}>{authError}</p>)}
            <form onSubmit={handleSubmit} noValidate>
                <div style={styles.inputGroup}>
                    <label htmlFor="usernameOrEmail" style={styles.label}>{t('login.usernameOrEmail')}</label>
                    <input
                        type="text"
                        id="usernameOrEmail"
                        value={usernameOrEmail}
                        onChange={handleInputChange(setUsernameOrEmail, 'usernameOrEmail')}
                        placeholder={t('login.placeholderUsernameOrEmail')}
                        style={formErrors.usernameOrEmail ? { ...styles.input, ...styles.inputError } : styles.input}
                        disabled={authStatus === 'loading'}
                        required
                    />
                    {formErrors.usernameOrEmail && <p style={styles.errorMessage}>{formErrors.usernameOrEmail}</p>}
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="password" style={styles.label}>{t('login.password')}</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={handleInputChange(setPassword, 'password')}
                        placeholder={t('login.placeholderPassword')}
                        style={formErrors.password ? { ...styles.input, ...styles.inputError } : styles.input}
                        disabled={authStatus === 'loading'}
                        required
                    />
                    {formErrors.password && <p style={styles.errorMessage}>{formErrors.password}</p>}
                </div>
                <div style={styles.forgotPasswordContainer}>
                    {/* Use Link component for SPA navigation */}
                    <Link to="/forgot-password" style={styles.link}>{t('login.forgotPassword')}</Link>
                </div>
                <button
                    type="submit"
                    style={authStatus === 'loading' ? { ...styles.submitButton, ...styles.submitButtonDisabled } : styles.submitButton}
                    disabled={authStatus === 'loading'}
                >
                    {authStatus === 'loading' ? t('login.processing') : t('login.submit')}
                </button>
            </form>
            <div style={styles.socialLoginContainer}>
                <p style={styles.dividerText}>
                    <span style={styles.dividerLine}></span>
                    {t('login.orLoginWith')}
                    <span style={styles.dividerLine}></span>
                </p>
                <button onClick={() => handleSocialLogin('Google')} style={{ ...styles.socialButton, ...styles.googleButton }} disabled={authStatus === 'loading'}>
                    <GoogleIcon /> {t('login.googleLogin')}
                </button>
                <button onClick={() => handleSocialLogin('Facebook')} style={{ ...styles.socialButton, ...styles.facebookButton }} disabled={authStatus === 'loading'}>
                    <FacebookIcon /> {t('login.facebookLogin')}
                </button>
            </div>
            <p style={styles.registerLink}>
                {t('login.noAccount')} <Link to="/register" style={styles.link}>{t('login.registerNow')}</Link>
            </p>
        </div>
    );
}

export default LoginForm;