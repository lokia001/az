// ----- PHẦN 2: REACT COMPONENT CHO FORM ĐĂNG KÝ (Ví dụ: RegistrationForm.jsx) -----
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUser, resetRegistrationState, selectRegistrationLoading, selectRegistrationSuccess, selectRegistrationError } from '../../../features/auth/registrationSlice'; // Giả sử slice ở cùng thư mục hoặc điều chỉnh đường dẫn

// --- COMPONENT ĐĂNG KÝ ---
const RegistrationForm = () => {
    // --- State cho Form Inputs ---
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // API yêu cầu confirmPassword
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [formErrors, setFormErrors] = useState({}); // Lỗi validation phía client

    // --- Hooks từ Redux và React Router ---
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // --- Lấy state từ Redux store ---
    const isLoading = useSelector(selectRegistrationLoading);
    const registrationSuccess = useSelector(selectRegistrationSuccess);
    const registrationError = useSelector(selectRegistrationError); // Lỗi từ API

    // --- Effect để xử lý sau khi đăng ký thành công hoặc khi component unmount ---
    useEffect(() => {
        if (registrationSuccess) {
            alert('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.'); // Hoặc dùng một component Toast/Notification
            dispatch(resetRegistrationState()); // Reset trạng thái Redux
            navigate('/login'); // Chuyển hướng đến trang đăng nhập
        }

        // Cleanup: Reset trạng thái Redux khi component unmount
        return () => {
            dispatch(resetRegistrationState());
        };
    }, [registrationSuccess, dispatch, navigate]);

    // --- Logic Validate Form phía Client ---
    const validateForm = () => {
        const newErrors = {};
        if (!email) newErrors.email = 'Email không được để trống';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email không hợp lệ';

        if (!username) newErrors.username = 'Username không được để trống';
        else if (username.length < 3) newErrors.username = 'Username phải có ít nhất 3 ký tự';

        if (!password) newErrors.password = 'Mật khẩu không được để trống';
        else if (password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';

        if (!confirmPassword) newErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu';
        else if (password !== confirmPassword) newErrors.confirmPassword = 'Mật khẩu không khớp';

        if (!fullName) newErrors.fullName = 'Họ và tên không được để trống';
        // Thêm validation cho phoneNumber nếu cần (ví dụ: định dạng số)
        if (!phoneNumber) newErrors.phoneNumber = 'Số điện thoại không được để trống';


        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- Xử lý Submit Form ---
    const handleSubmit = (event) => {
        event.preventDefault();
        setFormErrors({}); // Reset lỗi client trước
        // dispatch(resetRegistrationState()); // Reset lỗi API trước khi thử lại (tùy chọn)

        if (validateForm()) {
            const userData = {
                username,
                email,
                password,
                confirmPassword, // Gửi confirmPassword như API yêu cầu
                fullName,
                phoneNumber,
            };
            dispatch(registerUser(userData));
        }
    };

    // --- JSX Rendering ---
    // (Sử dụng inline styles đơn giản cho mục đích demo, bạn có thể dùng CSS Modules hoặc styled-components)
    const styles = { /* ... copy styles từ form bạn đã cung cấp và điều chỉnh nếu cần ... */
        container: { maxWidth: '450px', margin: '40px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', fontFamily: 'Arial, sans-serif' },
        title: { textAlign: 'center', marginBottom: '25px' },
        inputGroup: { marginBottom: '15px' },
        label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
        input: { width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' },
        inputError: { borderColor: 'red' },
        errorMessage: { color: 'red', fontSize: '0.9em', marginTop: '5px' },
        apiError: { color: 'red', textAlign: 'center', marginBottom: '15px', padding: '10px', border: '1px solid red', borderRadius: '4px', backgroundColor: '#ffe0e0' },
        submitButton: { width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' },
        loadingText: { textAlign: 'center', fontStyle: 'italic' }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Tạo tài khoản người dùng</h2>

            {/* Hiển thị lỗi từ API */}
            {registrationError && (
                <div style={styles.apiError}>
                    <p>Lỗi đăng ký:</p>
                    {typeof registrationError === 'string' ? <p>{registrationError}</p> :
                        (registrationError.message ? <p>{registrationError.message}</p> :
                            (registrationError.errors ? <ul>{Object.entries(registrationError.errors).map(([field, messages]) => messages.map((msg, idx) => <li key={`${field}-${idx}`}>{msg}</li>))}</ul> :
                                <p>Đã có lỗi không xác định xảy ra.</p>
                            )
                        )}
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                {/* Full Name */}
                <div style={styles.inputGroup}>
                    <label htmlFor="fullName" style={styles.label}>Họ và Tên</label>
                    <input
                        type="text"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nhập họ và tên"
                        style={formErrors.fullName ? { ...styles.input, ...styles.inputError } : styles.input}
                    />
                    {formErrors.fullName && <p style={styles.errorMessage}>{formErrors.fullName}</p>}
                </div>

                {/* Email */}
                <div style={styles.inputGroup}>
                    <label htmlFor="email" style={styles.label}>Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập địa chỉ email"
                        style={formErrors.email ? { ...styles.input, ...styles.inputError } : styles.input}
                    />
                    {formErrors.email && <p style={styles.errorMessage}>{formErrors.email}</p>}
                </div>

                {/* Username */}
                <div style={styles.inputGroup}>
                    <label htmlFor="username" style={styles.label}>Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Chọn tên đăng nhập"
                        style={formErrors.username ? { ...styles.input, ...styles.inputError } : styles.input}
                    />
                    {formErrors.username && <p style={styles.errorMessage}>{formErrors.username}</p>}
                </div>

                {/* Phone Number */}
                <div style={styles.inputGroup}>
                    <label htmlFor="phoneNumber" style={styles.label}>Số điện thoại</label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Nhập số điện thoại"
                        style={formErrors.phoneNumber ? { ...styles.input, ...styles.inputError } : styles.input}
                    />
                    {formErrors.phoneNumber && <p style={styles.errorMessage}>{formErrors.phoneNumber}</p>}
                </div>

                {/* Password */}
                <div style={styles.inputGroup}>
                    <label htmlFor="password" style={styles.label}>Mật khẩu</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Tạo mật khẩu"
                        style={formErrors.password ? { ...styles.input, ...styles.inputError } : styles.input}
                    />
                    {formErrors.password && <p style={styles.errorMessage}>{formErrors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div style={styles.inputGroup}>
                    <label htmlFor="confirmPassword" style={styles.label}>Nhập lại mật khẩu</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Xác nhận mật khẩu"
                        style={formErrors.confirmPassword ? { ...styles.input, ...styles.inputError } : styles.input}
                    />
                    {formErrors.confirmPassword && <p style={styles.errorMessage}>{formErrors.confirmPassword}</p>}
                </div>

                <button type="submit" style={styles.submitButton} disabled={isLoading}>
                    {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                </button>
            </form>

            {/* Link to Login (nếu cần) */}
            <p style={{ textAlign: 'center', marginTop: '20px' }}>
                Đã có tài khoản? <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Đăng nhập</a>
            </p>
        </div>
    );
};

export default RegistrationForm;