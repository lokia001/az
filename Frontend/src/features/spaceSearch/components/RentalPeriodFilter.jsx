// src/features/spaceSearch/components/RentalPeriodFilter.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Form from 'react-bootstrap/Form';
import { setFilter, selectSpaceSearchFilters } from '../slices/spaceSearchSlice';

const rentalPeriodOptions = [
    { label: 'Ngày', value: 'Ngày' }, // Values should match what API expects or be mapped
    { label: 'Tuần', value: 'Tuần' },
    { label: 'Tháng', value: 'Tháng' },
];

const RentalPeriodFilter = () => {
    const dispatch = useDispatch();
    const currentFilters = useSelector(selectSpaceSearchFilters);

    const handleChange = (event) => {
        dispatch(setFilter({ filterName: 'rentalPeriod', value: event.target.value }));
    };

    return (
        <div className="mb-4">
            <h5>Thời gian thuê</h5>
            <Form.Select
                aria-label="Rental period select"
                value={currentFilters.rentalPeriod}
                onChange={handleChange}
            >
                {rentalPeriodOptions.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </Form.Select>
        </div>
    );
};
export default RentalPeriodFilter;