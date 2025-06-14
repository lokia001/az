import React from 'react';
import { useSelector } from 'react-redux';
import { selectBookSpaceSpaces, selectBookSpaceLoading } from '../../features/bookSpace/bookSpaceSlice';
import ResultItem from './ResultItem';
import './ResultsAreaWithCount.css'; // Tạo file CSS cho component này

function ResultsAreaWithCount() {

    const spaces = useSelector(selectBookSpaceSpaces);
    const loading = useSelector(selectBookSpaceLoading);

    console.log("Giá trị spaces trong ResultsAreaWithCount:", spaces);
    if (loading === 'pending') {
        return <div>Đang tải kết quả...</div>;
    }

    return (
        <div className="results-area-with-count-container">
            {/* <h2>Kết quả tìm kiếm</h2> */}
            {spaces.length > 0 && (
                <div className="results-count">
                    Hiển thị {spaces.length} kết quả
                </div>
            )}
            <div className="results-list">
                {spaces.map(space => (
                    <ResultItem key={space.id} space={space} />
                ))}
            </div>
            {spaces.length === 0 && loading !== 'pending' && (
                <div>Không có không gian làm việc nào phù hợp với tìm kiếm của bạn.</div>
            )}
        </div>
    );
}

export default ResultsAreaWithCount;