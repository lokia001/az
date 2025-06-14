// src/features/auth/components/RegisterForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import translation hook
import {
    registerUser,
    selectAuthStatus,
    selectAuthError,
    clearAuthError,
    // selectIsAuthenticated // Not strictly needed here if we always redirect to login
} from '../slices/authSlice'; // Using the main authSlice

const RegisterForm = () => {
    // --- State for Form Inputs ---
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState(''); // Kept for UI, but not sent to current register API
    // const [phoneNumber, setPhoneNumber] = useState(''); // Omitted as not in API
    const [formErrors, setFormErrors] = useState({});

    const { t } = useTranslation(); // Get the translation function
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const authStatus = useSelector(selectAuthStatus);
    const authError = useSelector(selectAuthError);
    // const isAuthenticated = useSelector(selectIsAuthenticated); // If we wanted to redirect if already logged in

    // Effect to handle after registration attempt
    useEffect(() => {
        // Check if the *last operation* was a successful registration.
        // We need a way to distinguish if 'succeeded' is from login or register if on the same slice.
        // For now, if authStatus is succeeded and we are on the register page, assume it was register.
        // A more robust way might involve a specific flag in the slice or action meta.
        if (authStatus === 'succeeded' && window.location.pathname.includes('/register')) {
            alert(t('register.successMessage'));
            // Our registerUser thunk logs the user in. So navigate to home or dashboard.
            // If you strictly want to go to login page, then navigate('/login')
            navigate('/');
        }
        
        // Log authentication status changes
        console.log('Auth status changed:', authStatus);
        
        // Log authentication error for debugging (kể cả khi status không phải là 'failed')
        if (authError) {
            console.log('Registration error detected:', authError);
        }

        // Cleanup: Clear API error when component unmounts
        return () => {
            dispatch(clearAuthError());
        };
    }, [authStatus, dispatch, navigate, t, authError]);


    const handleInputChange = (setter, fieldName) => (e) => {
        setter(e.target.value);
        if (formErrors[fieldName]) {
            setFormErrors(prev => ({ ...prev, [fieldName]: null }));
        }
        
        // Clear API error when user starts typing (sau một số thay đổi)
        if (authError && (fieldName === 'email' || fieldName === 'username')) {
            // Chỉ xóa lỗi khi người dùng sửa các trường có thể gây ra lỗi từ server
            console.log('Clearing auth error on input change');
            dispatch(clearAuthError());
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!fullName.trim()) newErrors.fullName = t('error.emptyFullName');

        if (!email.trim()) newErrors.email = t('error.emptyEmail');
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t('error.invalidEmail');

        if (!username.trim()) newErrors.username = t('error.emptyUsername');
        else if (username.trim().length < 3) newErrors.username = t('error.shortUsername');

        if (!password) newErrors.password = t('error.emptyPassword');
        else if (password.length < 6) newErrors.password = t('error.shortPassword');

        if (!confirmPassword) newErrors.confirmPassword = t('error.emptyConfirmPassword');
        else if (password !== confirmPassword) newErrors.confirmPassword = t('error.passwordMismatch');

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (authStatus === 'loading') return; // Prevent multiple submissions

        if (validateForm()) {
            const userDataForApi = {
                username: username.trim(),
                email: email.trim(),
                password: password,
                role: "User" // Hardcoded role for self-registration as per your requirement
                // fullName is not sent to this specific API endpoint
            };
            dispatch(registerUser(userDataForApi));
        }
    };

    // --- Inline Styles (copied and slightly adapted from your provided styles) ---
    const styles = {
        container: { maxWidth: '450px', margin: '40px auto', padding: '30px', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
        title: { textAlign: 'center', color: '#333', marginBottom: '25px', fontSize: '24px', fontWeight: '600' },
        inputGroup: { marginBottom: '20px' },
        label: { display: 'block', marginBottom: '8px', color: '#555', fontSize: '14px', fontWeight: '500' },
        input: { width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', fontSize: '16px', transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out' },
        inputError: { borderColor: '#e74c3c', boxShadow: '0 0 0 0.2rem rgba(231, 76, 60, 0.25)' },
        errorMessage: { color: '#e74c3c', fontSize: '13px', marginTop: '6px' },
        apiErrorMessage: { color: '#e74c3c', fontSize: '14px', marginTop: '10px', marginBottom: '10px', textAlign: 'center', padding: '10px', border: '1px solid #e74c3c', borderRadius: '4px', backgroundColor: '#f8d7da' },
        submitButton: { width: '100%', padding: '14px', backgroundColor: '#28a745', /* Green for register */ color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', transition: 'background-color 0.2s ease-in-out' },
        submitButtonDisabled: { backgroundColor: '#6c757d', cursor: 'not-allowed' },
        loginLinkContainer: { textAlign: 'center', marginTop: '25px', fontSize: '14px', color: '#555' },
        link: { color: '#007bff', textDecoration: 'none', fontWeight: '500' },
    };


    return (
        <div style={styles.container}>
            <h2 style={styles.title}>{t('register.title')}</h2>

            {/* Hiển thị lỗi từ backend nếu có - luôn hiển thị khi có lỗi */}
            {authError && (
                <div style={styles.apiErrorMessage}>
                    <p>{authError}</p>
                </div>
            )}
            
            {/* Debug information - chỉ hiển thị trong môi trường development */}
            {/* {process.env.NODE_ENV !== 'production' && (
                <div style={{...styles.apiErrorMessage, backgroundColor: '#f0f0f0', color: '#666'}}>
                    <p>Debug: Auth status: {authStatus}</p>
                    <p>Error: {authError ? authError : 'No error message'}</p>
                </div>
            )} */}

            <form onSubmit={handleSubmit} noValidate>
                <div style={styles.inputGroup}>
                    <label htmlFor="fullName" style={styles.label}>{t('register.fullName')}</label>
                    <input
                        type="text" id="fullName" value={fullName}
                        onChange={handleInputChange(setFullName, 'fullName')}
                        placeholder={t('register.fullNamePlaceholder')}
                        style={formErrors.fullName ? { ...styles.input, ...styles.inputError } : styles.input}
                        disabled={authStatus === 'loading'}
                    />
                    {formErrors.fullName && <p style={styles.errorMessage}>{formErrors.fullName}</p>}
                </div>

                <div style={styles.inputGroup}>
                    <label htmlFor="email" style={styles.label}>{t('register.email')}</label>
                    <input
                        type="email" id="email" value={email}
                        onChange={handleInputChange(setEmail, 'email')}
                        placeholder={t('register.emailPlaceholder')}
                        style={formErrors.email ? { ...styles.input, ...styles.inputError } : styles.input}
                        disabled={authStatus === 'loading'}
                    />
                    {formErrors.email && <p style={styles.errorMessage}>{formErrors.email}</p>}
                </div>

                <div style={styles.inputGroup}>
                    <label htmlFor="username" style={styles.label}>{t('register.username')}</label>
                    <input
                        type="text" id="username" value={username}
                        onChange={handleInputChange(setUsername, 'username')}
                        placeholder={t('register.usernamePlaceholder')}
                        style={formErrors.username ? { ...styles.input, ...styles.inputError } : styles.input}
                        disabled={authStatus === 'loading'}
                    />
                    {formErrors.username && <p style={styles.errorMessage}>{formErrors.username}</p>}
                </div>

                <div style={styles.inputGroup}>
                    <label htmlFor="password" style={styles.label}>{t('register.password')}</label>
                    <input
                        type="password" id="password" value={password}
                        onChange={handleInputChange(setPassword, 'password')}
                        placeholder={t('register.passwordPlaceholder')}
                        style={formErrors.password ? { ...styles.input, ...styles.inputError } : styles.input}
                        disabled={authStatus === 'loading'}
                    />
                    {formErrors.password && <p style={styles.errorMessage}>{formErrors.password}</p>}
                </div>

                <div style={styles.inputGroup}>
                    <label htmlFor="confirmPassword" style={styles.label}>{t('register.confirmPassword')}</label>
                    <input
                        type="password" id="confirmPassword" value={confirmPassword}
                        onChange={handleInputChange(setConfirmPassword, 'confirmPassword')}
                        placeholder={t('register.confirmPasswordPlaceholder')}
                        style={formErrors.confirmPassword ? { ...styles.input, ...styles.inputError } : styles.input}
                        disabled={authStatus === 'loading'}
                    />
                    {formErrors.confirmPassword && <p style={styles.errorMessage}>{formErrors.confirmPassword}</p>}
                </div>

                <button
                    type="submit"
                    style={authStatus === 'loading' ? { ...styles.submitButton, ...styles.submitButtonDisabled } : styles.submitButton}
                    disabled={authStatus === 'loading'}
                >
                    {authStatus === 'loading' ? t('register.processing') : t('register.submit')}
                </button>
            </form>

            <p style={styles.loginLinkContainer}>
                {t('register.haveAccount')} <Link to="/login" style={styles.link}>{t('register.loginNow')}</Link>
            </p>
        </div>
    );
};

export default RegisterForm;