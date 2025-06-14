// src/features/spaceSearch/components/AmenitiesFilter.jsx (Conceptual Update)
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Form from 'react-bootstrap/Form';
import { setFilter, selectSpaceSearchFilters } from '../slices/spaceSearchSlice';
// Assume you have a selector for the fetched system amenities list:
// import { selectSystemAmenities, fetchSystemAmenitiesListIfNeeded } from '../slices/amenitiesSlice'; // or from spaceSearchSlice

const AmenitiesFilter = () => {
    const dispatch = useDispatch();
    const currentFilters = useSelector(selectSpaceSearchFilters);
    // const systemAmenitiesList = useSelector(selectSystemAmenities); // [{id: 'guid', name: 'WIFI'}, ...]
    // const amenitiesStatus = useSelector(selectAmenitiesStatus);

    // useEffect(() => {
    //   dispatch(fetchSystemAmenitiesListIfNeeded()); // Fetch if not already loaded
    // }, [dispatch]);

    // For now, using placeholder amenity options. Replace with fetched data.
    const placeholderSystemAmenities = [
        { id: 'guid-for-wifi', name: 'WIFI' }, // Replace with actual GUIDs
        { id: 'guid-for-printer', name: 'Máy in' },
        { id: 'guid-for-projector', name: 'Máy chiếu' }
    ];

    const handleChange = (amenityGuid) => {
        dispatch(setFilter({ filterName: 'amenities', value: amenityGuid }));
    };

    // if (amenitiesStatus === 'loading') return <p>Loading amenities...</p>;

    return (
        <div className="mb-4">
            <h5>Tiện ích</h5>
            {placeholderSystemAmenities.map(option => (
                <Form.Check
                    key={option.id}
                    type="checkbox"
                    id={`amenity-${option.id}`}
                    label={option.name}
                    value={option.id} // Value is the GUID
                    checked={currentFilters.amenities.includes(option.id)}
                    onChange={() => handleChange(option.id)}
                    className="mb-1"
                />
            ))}
        </div>
    );
};
export default AmenitiesFilter;