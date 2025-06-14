// src/features/spaceSearch/components/PriceFilter.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Form from 'react-bootstrap/Form';
import { setFilter, selectSpaceSearchFilters } from '../slices/spaceSearchSlice';

const priceOptions = [
    { label: 'Dưới $200', value: 'under_200' },
    // Add more price options here if needed, e.g.,
    // { label: '$200 - $500', value: '200_500' },
    // { label: 'Trên $500', value: 'over_500' },
    { label: 'Bất kỳ giá nào', value: null } // Option to clear price filter
];

const PriceFilter = () => {
    const dispatch = useDispatch();
    const currentFilters = useSelector(selectSpaceSearchFilters);

    const handleChange = (value) => {
        dispatch(setFilter({ filterName: 'price', value: value }));
    };

    return (
        <div className="mb-4">
            <h5>Giá cả</h5>
            {priceOptions.map(option => (
                <Form.Check
                    key={option.value || 'any_price'}
                    type="radio"
                    id={`price-${option.value || 'any'}`}
                    label={option.label}
                    name="priceFilter"
                    value={option.value == null ? '' : option.value}
                    checked={currentFilters.price === option.value}
                    onChange={() => handleChange(option.value)}
                    className="mb-1"
                />
            ))}
        </div>
    );
};
export default PriceFilter;