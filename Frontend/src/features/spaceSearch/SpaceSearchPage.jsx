// src/features/spaceSearch/SpaceSearchPage.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import BootstrapPagination from 'react-bootstrap/Pagination';
import _debounce from 'lodash/debounce'; // For debouncing space filtering

import {
    fetchSpaces,
    setPage,
    setFilter, // We'll use this to set the locationQuery for filtering spaces
    selectSpaceSearchFilters,
    selectSpaceSearchSortBy,
    selectSpaceSearchResults,
    selectSpaceSearchPagination,
    selectSpaceSearchStatus,
    selectSpaceSearchError,
    clearSearchError,
} from './slices/spaceSearchSlice';

import { geocodeAddress } from '../../utils/geocoding.js'; // Adjusted path

import FilterSidebar from './components/FilterSidebar';
import LocationSearchBar from './components/LocationSearchBar';
import SelectedFiltersDisplay from './components/SelectedFiltersDisplay';
import SortOptions from './components/SortOptions';
import SpaceListItem from './components/SpaceListItem'; // Adjusted pathSpaceListItem
import InteractiveMap from './components/InteractiveMap'; // Adjusted path for the map component

// Placeholder for Map Component - Will receive mapCenter, mapZoom, and markers
const MapViewPlaceholder = ({ center, zoom, markers }) => {
    console.log('[MapViewPlaceholder] Props received - Center:', center, 'Zoom:', zoom, 'Markers:', markers);
    return (
        <div className="border bg-light text-center" style={{ height: '100%', minHeight: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'sticky', top: '80px' }}>
            <h5>Bản đồ (Placeholder)</h5>
            <p className="small">Trung tâm: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}</p>
            <p className="small">Zoom: {zoom}</p>
            <p className="small">Số lượng markers: {markers.length}</p>
            {markers.length > 0 && markers[0].isGeocodedLocation && (
                <p className="small text-primary">Marker tìm kiếm: {markers[0].title}</p>
            )}
        </div>
    );
};

// Default map settings
const DEFAULT_MAP_CENTER = { lat: 10.7769, lng: 106.7009 }; // Ho Chi Minh City center (example)
const DEFAULT_MAP_ZOOM = 12;

const SpaceSearchPage = () => {
    const dispatch = useDispatch();

    // Redux state for space filtering and results
    const filters = useSelector(selectSpaceSearchFilters); // Contains locationQuery for filtering spaces
    const sortBy = useSelector(selectSpaceSearchSortBy);
    const spaceResults = useSelector(selectSpaceSearchResults);
    const pagination = useSelector(selectSpaceSearchPagination);
    const spaceSearchStatus = useSelector(selectSpaceSearchStatus);
    const spaceSearchError = useSelector(selectSpaceSearchError);

    // Local state for map and geocoding
    const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER);
    const [mapZoom, setMapZoom] = useState(DEFAULT_MAP_ZOOM);
    const [searchLocationMarker, setSearchLocationMarker] = useState(null); // { lat, lng, title, isGeocodedLocation: true }
    const [isGeocoding, setIsGeocoding] = useState(false); // Loading state for geocoding
    const [geocodingError, setGeocodingError] = useState(null);

    const isInitialMount = useRef(true);

    // This function is passed to LocationSearchBar
    // It handles geocoding and then updates Redux filter for space search
    const handleSearchLocationAndFilterSpaces = useCallback(async (addressQuery) => {
        console.log('[SpaceSearchPage] handleSearchLocationAndFilterSpaces called with addressQuery:', addressQuery);
        setGeocodingError(null);

        if (!addressQuery || !addressQuery.trim()) {
            setSearchLocationMarker(null);
            setMapCenter(DEFAULT_MAP_CENTER); // Reset map to default if query is cleared
            setMapZoom(DEFAULT_MAP_ZOOM);
            // Also clear the locationQuery filter in Redux to stop filtering spaces by location
            if (filters.locationQuery !== '') { // Only dispatch if it actually changes
                dispatch(setFilter({ filterName: 'locationQuery', value: '' }));
            }
            return;
        }

        setIsGeocoding(true);
        try {
            const coordinates = await geocodeAddress(addressQuery);
            if (coordinates) {
                console.log('[SpaceSearchPage] Geocoding success:', coordinates);
                setMapCenter(coordinates);
                setMapZoom(14); // Zoom in on geocoded location
                setSearchLocationMarker({ ...coordinates, title: addressQuery, isGeocodedLocation: true });
                // NOW, set this geocoded addressQuery as the filter for fetching spaces
                // This will trigger the useEffect below to fetch spaces
                if (filters.locationQuery !== addressQuery) { // Only dispatch if it actually changes
                    dispatch(setFilter({ filterName: 'locationQuery', value: addressQuery }));
                }
            } else {
                console.warn('[SpaceSearchPage] Geocoding failed to find coordinates for:', addressQuery);
                setGeocodingError(`Không tìm thấy vị trí cho: "${addressQuery}". Vui lòng thử lại.`);
                setSearchLocationMarker(null);
                // Don't change map center if geocoding fails, or reset to default
                // setMapCenter(DEFAULT_MAP_CENTER);
                // setMapZoom(DEFAULT_MAP_ZOOM);
                // Clear locationQuery filter in Redux if previous one existed and this one failed
                if (filters.locationQuery !== '') {
                    dispatch(setFilter({ filterName: 'locationQuery', value: '' }));
                }
            }
        } catch (error) {
            console.error('[SpaceSearchPage] Error during handleSearchLocation:', error);
            setGeocodingError('Lỗi xảy ra trong quá trình tìm kiếm vị trí.');
            setSearchLocationMarker(null);
        } finally {
            setIsGeocoding(false);
        }
    }, [dispatch, filters.locationQuery]); // Added filters.locationQuery

    // Debounced version of handleSearchLocationAndFilterSpaces for typing
    // This is if you want geocoding to happen as user types (after debounce)
    // The current LocationSearchBar triggers on Enter/Blur.
    // If you want on-type geocoding, LocationSearchBar would call this debounced function.
    // const debouncedGeocodeAndFilter = useCallback(_debounce(handleSearchLocationAndFilterSpaces, 1000), [handleSearchLocationAndFilterSpaces]);


    // Effect to fetch spaces when Redux filters (esp. locationQuery), sortBy, or pageNumber change
    useEffect(() => {
        console.log('[SpaceSearchPage] useEffect for FETCHING SPACES. Filters:', filters, 'SortBy:', sortBy, 'Page:', pagination.pageNumber);
        if (spaceSearchError && spaceSearchStatus !== 'loading') dispatch(clearSearchError());

        const hasActiveFiltersForSpaceSearch =
            (filters.locationQuery && filters.locationQuery.trim() !== '') || // Location is a primary trigger
            (filters.spaceTypes && filters.spaceTypes.length > 0) ||
            filters.price ||
            (filters.amenities && filters.amenities.length > 0) ||
            (filters.minCapacity && parseInt(filters.minCapacity) > 0) ||
            (filters.availabilityStart && filters.availabilityEnd);

        if (isInitialMount.current) {
            isInitialMount.current = false;
            if (hasActiveFiltersForSpaceSearch) {
                console.log('[SpaceSearchPage] Initial mount WITH active filters, dispatching fetchSpaces.');
                dispatch(fetchSpaces());
            } else {
                console.log('[SpaceSearchPage] Initial mount with NO active filters, NOT fetching spaces.');
            }
            return;
        }

        // For subsequent changes, fetch if any relevant filter is active.
        // The API should handle empty `locationQuery` if other filters are present,
        // or the thunk can prevent API call if `locationQuery` is mandatory.
        // For now, let's assume if locationQuery is empty, but other filters are set, we still search.
        // Or, make locationQuery mandatory for any search:
        if (filters.locationQuery && filters.locationQuery.trim() !== '') {
            console.log('[SpaceSearchPage] Dependencies changed (locationQuery present), dispatching fetchSpaces.');
            dispatch(fetchSpaces());
        } else if (!filters.locationQuery || filters.locationQuery.trim() === '') {
            // If location query is cleared, but other filters might be active
            // Decide if you want to fetch based on other filters or clear results
            console.log('[SpaceSearchPage] Location query is empty. Fetching based on other filters (if any).');
            // To fetch based on other filters even if location is empty:
            dispatch(fetchSpaces());
            // To clear results if location is mandatory for search:
            // dispatch(clearSearchResultsAction()); // You'd need this action
        }

    }, [filters, sortBy, pagination.pageNumber, dispatch]); // Key dependencies for fetching spaces

    const handlePageChange = (newPageNumber) => { /* ... same as before ... */
        if (spaceSearchStatus === 'loading' || newPageNumber === pagination.pageNumber) return;
        dispatch(setPage(newPageNumber));
    };
    const renderPaginationItems = () => { /* ... same as before ... */
        if (!pagination.totalPages || pagination.totalPages <= 1) return null;
        let items = []; const maxPagesToShow = 5;
        let startPage = Math.max(1, pagination.pageNumber - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);
        if (endPage - startPage + 1 < maxPagesToShow) startPage = Math.max(1, endPage - maxPagesToShow + 1);
        if (startPage > 1) { items.push(<BootstrapPagination.First key="first" onClick={() => handlePageChange(1)} disabled={spaceSearchStatus === 'loading'} />); items.push(<BootstrapPagination.Prev key="prev" onClick={() => handlePageChange(pagination.pageNumber - 1)} disabled={pagination.pageNumber <= 1 || spaceSearchStatus === 'loading'} />); if (startPage > 2) items.push(<BootstrapPagination.Ellipsis key="start-ellipsis" disabled />); }
        for (let number = startPage; number <= endPage; number++) { items.push(<BootstrapPagination.Item key={number} active={number === pagination.pageNumber} onClick={() => handlePageChange(number)} disabled={spaceSearchStatus === 'loading'}>{number}</BootstrapPagination.Item>); }
        if (endPage < pagination.totalPages) { if (endPage < pagination.totalPages - 1) items.push(<BootstrapPagination.Ellipsis key="end-ellipsis" disabled />); items.push(<BootstrapPagination.Next key="next" onClick={() => handlePageChange(pagination.pageNumber + 1)} disabled={pagination.pageNumber >= pagination.totalPages || spaceSearchStatus === 'loading'} />); items.push(<BootstrapPagination.Last key="last" onClick={() => handlePageChange(pagination.totalPages)} disabled={spaceSearchStatus === 'loading'} />); }
        return <BootstrapPagination className="justify-content-center mt-4">{items}</BootstrapPagination>;
    };

    const renderResultsList = () => { /* ... same as before ... */
        if (spaceSearchStatus === 'loading' && spaceResults.length === 0) { return <div className="text-center py-5"><Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} /><p className="mt-2">Đang tải không gian...</p></div>; }
        if (spaceSearchStatus === 'failed' && spaceSearchError) { return <Alert variant="danger" className="mt-3">Lỗi tìm kiếm không gian: {String(spaceSearchError)}</Alert>; }
        const anyFilterActive = Object.values(filters).some(val => Array.isArray(val) ? val.length > 0 : (val != null && val !== ''));
        if (spaceSearchStatus === 'succeeded' && spaceResults.length === 0 && anyFilterActive) { return <Alert variant="warning" className="mt-3 text-center">Không có không gian làm việc nào phù hợp với tìm kiếm của bạn.</Alert>; }
        if (spaceSearchStatus !== 'loading' && spaceResults.length === 0 && !anyFilterActive) { return <Alert variant="info" className="mt-3 text-center">Vui lòng chọn bộ lọc hoặc nhập từ khóa để tìm kiếm không gian.</Alert>; }
        if (spaceResults.length > 0) { return (<> {spaceSearchStatus === 'loading' && <div className="text-center my-2"><Spinner size="sm" animation="border" /> Đang cập nhật...</div>} {spaceResults.map((space) => (<SpaceListItem key={space.id} space={space} />))} {renderPaginationItems()} </>); }
        return null;
    };

    // Prepare markers for the map
    const mapMarkers = [];
    if (searchLocationMarker) {
        mapMarkers.push(searchLocationMarker); // Add the geocoded location marker first
    }
    spaceResults.forEach(space => {
        // CRITICAL: Assuming your 'space' object has 'latitude' and 'longitude'
        if (space.latitude != null && space.longitude != null) {
            mapMarkers.push({
                lat: space.latitude,
                lng: space.longitude,
                title: space.name,
                id: space.id, // For identifying the space
                address: space.address, // For popup
                pricePerHour: space.pricePerHour, // For popup
                isGeocodedLocation: false, // Differentiate from the main search marker
            });
        } else {
            console.warn(`Space "${space.name}" (ID: ${space.id}) is missing latitude/longitude.`);
        }
    });

    return (
        <Container fluid className="py-3 px-md-4">
            <Row>
                <Col md={4} lg={3} className="mb-4 mb-md-0">
                    <div style={{ position: 'sticky', top: '80px' }}>
                        <FilterSidebar />
                    </div>
                </Col>
                <Col md={8} lg={9}>
                    <LocationSearchBar
                        onSearchLocation={handleSearchLocationAndFilterSpaces}
                        isGeocoding={isGeocoding}
                    />
                    {geocodingError && <Alert variant="warning" className="mt-0 mb-3 py-2 small">{geocodingError}</Alert>}
                    <SelectedFiltersDisplay />
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                        <span className="text-muted me-3 mb-2 mb-sm-0">
                            {spaceSearchStatus === 'succeeded' && (filters.locationQuery || Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : f !== ''))) ? `Tìm thấy ${pagination.totalCount} kết quả` : (spaceSearchStatus !== 'loading' ? ' ' : '')}
                        </span>
                        <SortOptions />
                    </div>
                    <Row>
                        <Col lg={7} xl={8} className="mb-4 mb-lg-0">
                            {renderResultsList()}
                        </Col>
                        <Col lg={5} xl={4}>
                            {/* Use the actual InteractiveMap component */}
                            <div style={{ height: 'calc(100vh - 100px)', minHeight: '500px', position: 'sticky', top: '80px' }}> {/* Ensure map has height */}
                                <InteractiveMap
                                    center={mapCenter}
                                    zoom={mapZoom}
                                    markers={mapMarkers}
                                // onMarkerClick={(markerData) => console.log('Space marker clicked:', markerData)}
                                />
                            </div>
                        </Col>
                    </Row>
                    {(filters.locationQuery.trim() || spaceResults.length > 0) && ( /* ... OSM attribution ... */
                        <p className="text-muted small mt-5 text-center">Dữ liệu bản đồ © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors</p>
                    )}
                </Col>
            </Row>
        </Container>
    );
};
export default SpaceSearchPage;