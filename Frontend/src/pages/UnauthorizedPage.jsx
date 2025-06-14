import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 text-center">
                    <h1 className="display-1 text-danger">403</h1>
                    <h2 className="mb-4">Không có quyền truy cập</h2>
                    <p className="lead mb-4">
                        Xin lỗi, bạn không có quyền truy cập vào trang này.
                    </p>
                    <div className="d-flex gap-2 justify-content-center">
                        <Link to="/" className="btn btn-primary">
                            <i className="bi bi-house me-2"></i>
                            Trang chủ
                        </Link>
                        <Link to="/auth/login" className="btn btn-outline-secondary">
                            <i className="bi bi-box-arrow-in-right me-2"></i>
                            Đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
