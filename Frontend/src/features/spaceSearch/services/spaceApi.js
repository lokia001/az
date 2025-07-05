// src/features/spaceSearch/services/spaceApi.js
import apiClient from '../../../services/apiClient'; // Adjusted path

export const searchSpacesAPI = async (params = {}) => {
    const apiQueryParams = {};

    // --- Map frontend filter state to backend API query parameter names ---
    // params comes from spaceSearchSlice state (filters, pagination, sortBy)

    // Keyword (from your UI's "Location Search Bar" which might act as a general keyword/address search)
    if (params.locationQuery && params.locationQuery.trim() !== '') {
        // Decide if locationQuery maps to Keyword, Address, or both.
        // For simplicity, let's map it to Keyword for now.
        // If you have separate inputs for Keyword and Address, map them accordingly.
        apiQueryParams.Keyword = params.locationQuery.trim();
        // OR if you want to also search by address with the same input:
        // apiQueryParams.Address = params.locationQuery.trim(); // If API supports searching both
    }

    // Type (from your UI's "Loại không gian")
    // Your UI uses 'workspace', 'private_room'. API expects 'Individual', 'Group', 'MeetingRoom', 'EntireOffice'.
    // We need a mapping if they are different. Assuming direct mapping for now if values match.
    // If your UI values are 'workspace', 'private_room', you'll need to map them.
    // For now, I'll assume your UI values in spaceTypes array will be the API enum strings.
    if (params.spaceTypes && params.spaceTypes.length > 0) {
        // API expects a single 'Type' string, not an array.
        // If user can select multiple, your API needs to support it (e.g. Type=MeetingRoom&Type=Group)
        // Or, the UI should only allow selecting one type if API takes one.
        // Assuming UI allows only one type selection for now, or you send the first one.
        if (params.spaceTypes.length === 1) {
            apiQueryParams.Type = params.spaceTypes[0];
        }
        // If API supports multiple types like Type=val1&Type=val2, then:
        // apiQueryParams.Type = params.spaceTypes; // Axios will handle array as multiple params
    }

    // MaxPricePerHour (from your UI's "Giá cả" - e.g., "Dưới $200")
    if (params.price === 'under_200') {
        apiQueryParams.MaxPricePerHour = 200.00;
    }
    // Add other conditions for params.price if you have more options

    // AmenityIds (from your UI's "Tiện ích")
    // Your UI stores amenity names like "WIFI", "Printer". API expects Guids.
    // This requires a mapping from name to Guid. This mapping usually comes from another API call
    // that fetches all available system amenities with their Ids and names.
    // For now, I'll assume params.amenities CONTAINS THE GUIDs.
    if (params.amenities && params.amenities.length > 0) {
        apiQueryParams.AmenityIds = params.amenities; // Axios handles array as AmenityIds=guid1&AmenityIds=guid2
    }

    // MinCapacity - You'll need a UI for this. Assuming it's in params.minCapacity
    if (params.minCapacity && parseInt(params.minCapacity, 10) > 0) {
        apiQueryParams.MinCapacity = parseInt(params.minCapacity, 10);
    }

    // AvailabilityStartDate & AvailabilityEndDate - You'll need UI for these (Date pickers)
    // Assuming they are in params.availabilityStart and params.availabilityEnd as ISO strings
    if (params.availabilityStart && params.availabilityEnd) {
        apiQueryParams.AvailabilityStartDate = params.availabilityStart;
        apiQueryParams.AvailabilityEndDate = params.availabilityEnd;
    }

    // RentalPeriod - Your API description doesn't have a direct 'RentalPeriod' query param.
    // This filter might need to be translated into AvailabilityStartDate/EndDate, or it's a client-side concept
    // that doesn't map directly to this specific API search. We'll ignore it for API call for now.

    // SortBy - Your API description doesn't explicitly list sort parameters.
    // Assuming it might accept something like 'sortBy=name&sortOrder=asc'
    // We'll ignore sortBy for the API call for now unless you confirm param names.
    // if (params.sortBy) {
    //   apiQueryParams.SortByField = params.sortBy; // e.g., 'name', 'price'
    //   apiQueryParams.SortDirection = params.sortOrder || 'asc';
    // }

    // Pagination
    if (params.pageNumber) {
        apiQueryParams.PageNumber = params.pageNumber;
    }
    if (params.pageSize) {
        apiQueryParams.PageSize = params.pageSize;
    }

    const endpoint = '/api/spaces/search';
    console.log(`[SpaceApiService] Calling GET ${endpoint} with query params:`, apiQueryParams);
    try {
        const response = await apiClient.get(endpoint, { params: apiQueryParams });
        if (response.data && Array.isArray(response.data.items)) {
            return response.data;
        }
        console.error('[SpaceApiService] Unexpected API response structure:', response.data);
        return { items: [], pageNumber: 1, pageSize: params.pageSize || 10, totalCount: 0, totalPages: 0 };
    } catch (error) {
        let errorMessage = 'Failed to fetch spaces.';
        // ... (error message extraction logic from previous full code) ...
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            errorMessage = errorData.message || errorData.title || (typeof errorData === 'string' ? errorData : JSON.stringify(errorData));
        } else if (error.message) {
            errorMessage = error.message;
        }
        console.error('[SpaceApiService] Error fetching spaces. Message:', errorMessage);
        throw new Error(errorMessage);
    }
};