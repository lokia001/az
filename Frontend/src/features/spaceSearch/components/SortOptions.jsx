// src/features/spaceSearch/components/SortOptions.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Form from 'react-bootstrap/Form';
import { setSortBy, selectSpaceSearchSortBy } from '../slices/spaceSearchSlice';

const sortOptionsValues = [
    'Tên', // Default
    'Giá thấp đến cao',
    'Giá cao đến thấp',
    'Phổ biến nhất', // You'll need to map these to API sort fields
];

const SortOptions = () => {
    const dispatch = useDispatch();
    const currentSortBy = useSelector(selectSpaceSearchSortBy);

    const handleChange = (event) => {
        dispatch(setSortBy(event.target.value));
    };

    return (
        <div className="d-flex align-items-center">
            <Form.Label htmlFor="sort-options-select" className="me-2 mb-0 visually-hidden">Sắp xếp theo:</Form.Label>
            <Form.Select
                id="sort-options-select"
                aria-label="Sort by selection"
                value={currentSortBy}
                onChange={handleChange}
                size="sm"
                style={{ minWidth: '180px' }}
            >
                {sortOptionsValues.map(option => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </Form.Select>
        </div>
    );
};

export default SortOptions;