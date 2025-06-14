// src/components/Results/ResultItem.jsx
import React from 'react';
import './ResultItem.css'; // Import CSS cho ResultItem
import { Link } from 'react-router-dom';

function ResultItem({ space }) {
    return (
        <div className="result-item">
            <div className="result-image">
                {space.image ? (
                    <img src={space.image} alt={space.name} />
                ) : (
                    <div className="placeholder-image">Không có ảnh</div>
                )}
            </div>
            <div className="result-info">
                <h3 className="result-title">{space.name}</h3>
                <p className="result-address">Địa chỉ: {space.address}</p>
                <p className="result-price">Giá: {space.price}$</p>
                {/* Thêm các thông tin khác bạn muốn hiển thị */}
            </div>
            <Link to={`/space/${space.id}`} className="view-details-button">
                Xem chi tiết
            </Link>
        </div>
    );
}

export default ResultItem;