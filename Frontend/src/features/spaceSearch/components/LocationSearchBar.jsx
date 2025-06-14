// src/features/spaceSearch/components/LocationSearchBar.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'; // To get initial locationQuery from Redux
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import { selectSpaceSearchFilters } from '../slices/spaceSearchSlice';

const LocationSearchBar = ({ onSearchLocation, isGeocoding }) => {
    const initialReduxLocationQuery = useSelector(selectSpaceSearchFilters).locationQuery;
    const [inputValue, setInputValue] = useState(initialReduxLocationQuery || '');

    // Sync with Redux if it changes externally (e.g., cleared by "Clear All Tags")
    useEffect(() => {
        if (initialReduxLocationQuery !== inputValue && !isGeocoding) { // Avoid sync during active geocoding
            setInputValue(initialReduxLocationQuery || '');
        }
    }, [initialReduxLocationQuery, isGeocoding]); // Removed inputValue from deps to avoid loop

    const handleChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleTriggerSearch = () => {
        if (inputValue.trim()) {
            onSearchLocation(inputValue.trim());
        } else {
            // If input is cleared, tell parent to clear location related state
            onSearchLocation(''); // Pass empty string to signify clearing
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission if it's part of a larger form
            handleTriggerSearch();
        }
    };

    return (
        <Form.Group className="mb-3">
            <InputGroup>
                <Form.Control
                    type="text"
                    placeholder="Nhập vị trí (nhấn Enter để tìm)"
                    value={inputValue}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    onBlur={handleTriggerSearch} // Trigger search on blur as well
                    aria-label="Location search input"
                    disabled={isGeocoding}
                />
                <Button variant="outline-secondary" onClick={handleTriggerSearch} disabled={isGeocoding}>
                    {isGeocoding ? 'Đang tìm...' : 'Tìm Vị Trí'}
                </Button>
            </InputGroup>
        </Form.Group>
    );
};

export default LocationSearchBar;