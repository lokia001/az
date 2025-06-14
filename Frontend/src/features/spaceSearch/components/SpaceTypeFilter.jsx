// src/features/spaceSearch/components/SpaceTypeFilter.jsx (Conceptual Update)
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Form from 'react-bootstrap/Form';
import { setFilter, selectSpaceSearchFilters } from '../slices/spaceSearchSlice';

// UI Label to API Value mapping
const spaceTypeOptions = [
    { label: 'Chỗ ngồi cá nhân', value: 'Individual' },
    { label: 'Không gian nhóm', value: 'Group' },
    { label: 'Phòng họp', value: 'MeetingRoom' },
    { label: 'Toàn bộ văn phòng', value: 'EntireOffice' },
];

const SpaceTypeFilter = () => {
    const dispatch = useDispatch();
    const currentFilters = useSelector(selectSpaceSearchFilters);

    // API expects a single Type string, so UI should reflect this (e.g. radio or single select)
    // If using checkboxes and API takes single Type, it will only use the first selected.
    // Let's change to radio for single selection to match API's `Type: string`
    const handleChange = (apiValue) => {
        // If you want to allow deselecting a radio (which is not standard radio behavior)
        // you might need custom logic or treat it as setting type to null/empty.
        // For now, selecting a radio sets the type.
        dispatch(setFilter({ filterName: 'spaceTypes', value: apiValue })); // spaceTypes in slice will become [apiValue]
    };

    return (
        <div className="mb-4">
            <h5>Loại không gian</h5>
            {/* Assuming API takes one Type, use radio buttons or a select dropdown */}
            {spaceTypeOptions.map(option => (
                <Form.Check
                    key={option.value}
                    type="radio" // Changed to radio for single selection
                    name="spaceTypeFilterGroup" // Group radios
                    id={`space-type-${option.value}`}
                    label={option.label}
                    value={option.value} // This is the API enum string
                    // currentFilters.spaceTypes is an array. If it's single select, it should hold one item.
                    checked={currentFilters.spaceTypes[0] === option.value}
                    onChange={() => handleChange(option.value)}
                    className="mb-1"
                />
            ))}
            {/* Option to clear space type filter */}
            <Form.Check
                type="radio"
                name="spaceTypeFilterGroup"
                id="space-type-any"
                label="Bất kỳ loại nào"
                value="" // Represents no type filter
                checked={!currentFilters.spaceTypes || currentFilters.spaceTypes.length === 0}
                onChange={() => handleChange("")} // Send empty string or handle null in slice
                className="mb-1 mt-2"
            />
        </div>
    );
};
export default SpaceTypeFilter;