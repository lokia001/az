// src/components/Results/ResultsArea.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { selectBookSpaceSpaces, selectBookSpaceLoading } from '../../features/bookSpace/bookSpaceSlice';
import ResultItem from './ResultItem'; // Giả sử bạn có một component để hiển thị mỗi kết quả

function ResultsArea() {
    const spaces = useSelector(selectBookSpaceSpaces);
    const loading = useSelector(selectBookSpaceLoading);

    if (loading === 'pending') {
        return <div>Đang tải kết quả...</div>;
    }

    if (spaces.length === 0) {
        return <div>Không có không gian làm việc nào phù hợp.</div>;
    }

    return (
        <div className="results-area">
            <h2>Kết quả tìm kiếm</h2>
            {spaces.map(space => (
                <ResultItem key={space.id} space={space} />
            ))}
        </div>
    );
}

export default ResultsArea;