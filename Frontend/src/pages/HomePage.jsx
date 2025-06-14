import React, { lazy, Suspense, Component } from 'react';

import HeroSection from './style/HomePage/HeroSection';
import WhyBook from './style/HomePage/WhyBook';
import WorkplaceAnywhere from './style/HomePage/WorkplaceAnywhere';
import HelpedCompanies from './style/HomePage/HelpedCompanies';
import TopCities from './style/HomePage/TopCities';
import NewestOffices from './style/HomePage/NewestOffices';
import FindAnywhere from './style/HomePage/FindAnywhere';
import WhatIsCoworker from './style/HomePage/WhatIsCoworker';
import CoworkingDetails from './style/HomePage/CoworkingDetails';

// Error Boundary Component
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to console
        console.error("Error caught by ErrorBoundary:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // Improved error message with helpful options for users
            return (
                <div style={{ padding: '20px', margin: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px', border: '1px solid #e0e0e0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ color: '#dc3545', marginBottom: '10px' }}>Kết nối với chatbot không thành công</h2>
                    <p>Đang gặp vấn đề kết nối với chatbot. Điều này có thể do:</p>
                    <ul style={{ marginBottom: '15px', paddingLeft: '20px' }}>
                        <li>Backend API chưa được khởi động</li>
                        <li>Kết nối mạng không ổn định</li>
                        <li>Dialogflow API không phản hồi</li>
                    </ul>
                    <div style={{ marginTop: '15px' }}>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                backgroundColor: '#0d6efd',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '8px 12px',
                                marginRight: '10px',
                                cursor: 'pointer'
                            }}
                        >
                            Tải lại trang
                        </button>
                        <button
                            onClick={() => this.setState({ hasError: false })}
                            style={{
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '8px 12px',
                                cursor: 'pointer'
                            }}
                        >
                            Thử lại chatbot
                        </button>
                    </div>
                    <p style={{ marginTop: '15px', fontSize: '0.9rem', color: '#6c757d' }}>
                        Bạn vẫn có thể tiếp tục trải nghiệm trang web trong khi chúng tôi khắc phục vấn đề này.
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

// Lazy load the chatbot for better performance
const Chatbot = lazy(() => import('../features/chatbot/components/Chatbot'));

function HomePage() {
    return (
        <> {/* Sử dụng Fragment để không tạo thêm div thừa */}
            <ErrorBoundary>
                <Suspense fallback={<div />}>
                    <Chatbot />
                </Suspense>
            </ErrorBoundary>
            <HeroSection />
            <div className="container"> {/* Bọc các phần nội dung chính bên trong container */}
                <WhyBook />
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', padding: '40px 20px' }}>
                    {/* <WorkplaceAnywhere /> */}
                    {/* <HelpedCompanies /> */}
                </div>
                {/* <TopCities /> */}
                {/* <NewestOffices /> */}
                <FindAnywhere />
                <WhatIsCoworker />
                <CoworkingDetails />
            </div>
        </>
    );
}

export default HomePage;