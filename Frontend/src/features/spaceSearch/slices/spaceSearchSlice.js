// src/features/spaceSearch/slices/spaceSearchSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchSpacesAPI } from '../services/spaceApi';

// --- Helper to generate selected filter tags from current filters ---
const generateSelectedFilterTags = (currentFilters, systemAmenitiesList = []) => {
    const tags = [];
    // Location/Keyword Tag
    if (currentFilters.locationQuery && currentFilters.locationQuery.trim() !== '') {
        tags.push({ id: 'location_query_tag', type: 'locationQuery', label: `Từ khóa: ${currentFilters.locationQuery}`, value: currentFilters.locationQuery });
    }
    // Space Types Tags
    if (currentFilters.spaceTypes && currentFilters.spaceTypes.length > 0) {
        currentFilters.spaceTypes.forEach(stValue => { // stValue should be API enum string e.g. "MeetingRoom"
            let label = stValue; // Default to API value
            if (stValue === 'Individual') label = 'Cá nhân';
            else if (stValue === 'Group') label = 'Nhóm';
            else if (stValue === 'MeetingRoom') label = 'Phòng Họp';
            else if (stValue === 'EntireOffice') label = 'Toàn bộ Văn phòng';
            tags.push({ id: `st_${stValue}`, type: 'spaceTypes', label: `Loại: ${label}`, value: stValue });
        });
    }
    // Price Tag (MaxPricePerHour)
    if (currentFilters.price === 'under_200') { // Assuming 'price' state holds the UI selection value
        tags.push({ id: 'price_under_200', type: 'price', label: 'Giá: Dưới $200', value: 'under_200' });
    }
    // MinCapacity Tag
    if (currentFilters.minCapacity && parseInt(currentFilters.minCapacity, 10) > 0) {
        tags.push({ id: 'min_capacity', type: 'minCapacity', label: `Sức chứa tối thiểu: ${currentFilters.minCapacity}`, value: currentFilters.minCapacity });
    }
    // Amenities Tags
    // currentFilters.amenities should store GUIDs. We need systemAmenitiesList to get names for labels.
    if (currentFilters.amenities && currentFilters.amenities.length > 0 && systemAmenitiesList.length > 0) {
        currentFilters.amenities.forEach(amGuid => {
            const amenityDetail = systemAmenitiesList.find(sa => sa.id === amGuid);
            const label = amenityDetail ? amenityDetail.name : amGuid; // Fallback to Guid if name not found
            tags.push({ id: `am_${amGuid}`, type: 'amenities', label: `Tiện ích: ${label}`, value: amGuid });
        });
    }
    // Availability Dates Tags
    if (currentFilters.availabilityStart && currentFilters.availabilityEnd) {
        const startDate = new Date(currentFilters.availabilityStart).toLocaleDateString('vi-VN');
        const endDate = new Date(currentFilters.availabilityEnd).toLocaleDateString('vi-VN');
        tags.push({ id: 'availability_dates', type: 'availability', label: `Trống từ: ${startDate} - ${endDate}`, value: { start: currentFilters.availabilityStart, end: currentFilters.availabilityEnd } });
    }
    // Rental Period - No direct API mapping, so no tag unless you derive it.
    return tags;
};
// --- End Helper ---

const initialFilterState = {
    locationQuery: '',   // Maps to Keyword or Address
    spaceTypes: [],      // Array of API enum strings: e.g., ["MeetingRoom"] (UI should allow only one if API takes one Type)
    price: null,         // UI value e.g., 'under_200', which maps to MaxPricePerHour
    amenities: [],       // Array of Amenity GUIDs
    minCapacity: null,   // Integer
    availabilityStart: null, // ISO DateTime string
    availabilityEnd: null,   // ISO DateTime string
    // rentalPeriod: 'Ngày', // Kept for UI, but no direct API mapping in this search
};

const initialState = {
    filters: { ...initialFilterState },
    // systemAmenitiesList: [], // To store {id, name} for all system amenities, fetched separately
    selectedFilterTags: generateSelectedFilterTags(initialFilterState),
    sortBy: 'Tên', // UI display value, map to API field if needed
    sortOrder: 'asc',
    results: [],
    pagination: { pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
    status: 'idle',
    error: null,
};

export const fetchSpaces = createAsyncThunk(
    'spaceSearch/fetchSpaces',
    async (_, { getState, rejectWithValue }) => {
        const state = getState().spaceSearch;
        const paramsForApi = {
            // Map state.filters to the structure searchSpacesAPI expects
            locationQuery: state.filters.locationQuery,
            spaceTypes: state.filters.spaceTypes, // Ensure this is correctly formatted for API (single string or array)
            price: state.filters.price,           // searchSpacesAPI will map this to MaxPricePerHour
            amenities: state.filters.amenities,     // Should be array of GUIDs
            minCapacity: state.filters.minCapacity,
            availabilityStart: state.filters.availabilityStart,
            availabilityEnd: state.filters.availabilityEnd,
            // sortBy and sortOrder if API supports them
            // sortBy: state.sortBy,
            // sortOrder: state.sortOrder,
            pageNumber: state.pagination.pageNumber,
            pageSize: state.pagination.pageSize,
        };
        console.log('[SpaceSearchSlice] fetchSpaces thunk with paramsForApi:', paramsForApi);
        try {
            const apiResponse = await searchSpacesAPI(paramsForApi);
            return apiResponse;
        } catch (error) {
            return rejectWithValue(error.message || 'Thunk: Failed to fetch spaces.');
        }
    }
);

const spaceSearchSlice = createSlice({
    name: 'spaceSearch',
    initialState,
    reducers: {
        setFilter: (state, action) => {
            const { filterName, value } = action.payload;
            if (filterName === 'spaceTypes' || filterName === 'amenities') { // These are arrays
                const currentArray = state.filters[filterName];
                if (currentArray.includes(value)) {
                    state.filters[filterName] = currentArray.filter(item => item !== value);
                } else {
                    // If spaceTypes should only allow one selection based on API (Type: string)
                    if (filterName === 'spaceTypes') {
                        state.filters[filterName] = [value]; // Replace, don't push
                    } else {
                        state.filters[filterName].push(value);
                    }
                }
            } else { // For locationQuery, price, minCapacity, availabilityStart, availabilityEnd
                state.filters[filterName] = value;
            }
            state.pagination.pageNumber = 1;
            state.status = 'idle';
            state.error = null;
            state.selectedFilterTags = generateSelectedFilterTags(state.filters /*, state.systemAmenitiesList */);
        },
        setSortBy: (state, action) => { /* ... */
            state.sortBy = action.payload;
            state.pagination.pageNumber = 1;
            state.status = 'idle';
        },
        setPage: (state, action) => { /* ... */
            state.pagination.pageNumber = action.payload;
            state.status = 'idle';
        },
        clearSidebarFilters: (state) => { /* ... */
            const currentLocationQuery = state.filters.locationQuery;
            state.filters = { ...initialFilterState }; // Reset to "0 condition"
            state.filters.locationQuery = currentLocationQuery; // Restore location
            state.pagination.pageNumber = 1;
            state.status = 'idle';
            state.selectedFilterTags = generateSelectedFilterTags(state.filters /*, state.systemAmenitiesList */);
        },
        removeFilterTag: (state, action) => {
            const { type, value } = action.payload;
            if (type === 'locationQuery') state.filters.locationQuery = '';
            else if (type === 'spaceTypes') state.filters.spaceTypes = state.filters.spaceTypes.filter(item => item !== value);
            else if (type === 'amenities') state.filters.amenities = state.filters.amenities.filter(item => item !== value);
            else if (type === 'price') state.filters.price = null;
            else if (type === 'minCapacity') state.filters.minCapacity = null;
            else if (type === 'availability') {
                state.filters.availabilityStart = null;
                state.filters.availabilityEnd = null;
            }
            // Add other filter types if necessary
            state.pagination.pageNumber = 1;
            state.status = 'idle';
            state.selectedFilterTags = generateSelectedFilterTags(state.filters /*, state.systemAmenitiesList */);
        },
        clearAllSelectedTags: (state) => { /* ... */
            state.filters = { ...initialFilterState };
            state.pagination.pageNumber = 1;
            state.status = 'idle';
            state.selectedFilterTags = generateSelectedFilterTags(state.filters /*, state.systemAmenitiesList */);
        },
        clearSearchError: (state) => { state.error = null; },
        // Add reducer for when systemAmenitiesList is fetched and fulfilled
        // e.g., .addCase(fetchSystemAmenitiesList.fulfilled, (state, action) => { state.systemAmenitiesList = action.payload; })
    },
    extraReducers: (builder) => { /* ... same as before ... */
        builder
            .addCase(fetchSpaces.pending, (state) => {
                state.status = 'loading'; state.error = null;
            })
            .addCase(fetchSpaces.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.results = action.payload.items;
                state.pagination = {
                    pageNumber: action.payload.pageNumber,
                    pageSize: action.payload.pageSize,
                    totalCount: action.payload.totalCount,
                    totalPages: action.payload.totalPages,
                };
                state.error = null;
            })
            .addCase(fetchSpaces.rejected, (state, action) => {
                state.status = 'failed'; state.error = action.payload; state.results = [];
            });
    },
});

export const {
    setFilter, setSortBy, setPage,
    clearSidebarFilters, removeFilterTag, clearAllSelectedTags, clearSearchError,
} = spaceSearchSlice.actions;

// Selectors remain the same
export const selectSpaceSearchFilters = (state) => state.spaceSearch.filters;
export const selectSelectedFilterTags = (state) => state.spaceSearch.selectedFilterTags;
export const selectSpaceSearchSortBy = (state) => state.spaceSearch.sortBy;
export const selectSpaceSearchResults = (state) => state.spaceSearch.results;
export const selectSpaceSearchPagination = (state) => state.spaceSearch.pagination;
export const selectSpaceSearchStatus = (state) => state.spaceSearch.status;
export const selectSpaceSearchError = (state) => state.spaceSearch.error;

export default spaceSearchSlice.reducer;