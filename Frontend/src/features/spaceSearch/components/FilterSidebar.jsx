// src/features/spaceSearch/components/FilterSidebar.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import SpaceTypeFilter from './SpaceTypeFilter';
import PriceFilter from './PriceFilter';
import AmenitiesFilter from './AmenitiesFilter';
import RentalPeriodFilter from './RentalPeriodFilter';
import { clearSidebarFilters } from '../slices/spaceSearchSlice';

const FilterSidebar = () => {
    const dispatch = useDispatch();

    const handleClearFilters = () => {
        dispatch(clearSidebarFilters());
    };

    return (
        <Card>
            <Card.Header as="h5">Bộ lọc</Card.Header>
            <Card.Body>
                <SpaceTypeFilter />
                <PriceFilter />
                <AmenitiesFilter />
                <RentalPeriodFilter />
                <hr />
                <div className="d-grid">
                    <Button variant="outline-danger" onClick={handleClearFilters}>
                        Xóa bộ lọc
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default FilterSidebar;