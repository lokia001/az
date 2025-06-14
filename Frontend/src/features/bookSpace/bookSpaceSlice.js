// // src/features/bookSpace/bookSpaceSlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import * as api from '../../services/api';
// // Dữ liệu bộ lọc mô phỏng
// const mockFilterData = {
//     spaceTypes: ['Không gian làm việc', 'Phòng riêng', 'Nhóm', 'Bàn cố định', 'Bàn linh hoạt'],
//     amenities: ['WIFI', 'Máy in', 'Bảng trắng', 'Điều hòa', 'Nước uống miễn phí', 'Bãi đậu xe'],
//     priceRanges: [
//         { label: 'Dưới 200$', value: [0, 200] },
//         { label: '200$ - 500$', value: [200, 500] },
//         { label: 'Trên 500$', value: [500, Infinity] },
//     ],
//     rentalOptions: ['Ngày', 'Tuần', 'Tháng'],
// };

// export const fetchBookSpaceFilters = createAsyncThunk(
//     'bookSpace/fetchFilters',
//     async () => {
//         return new Promise((resolve) => {
//             setTimeout(() => {
//                 resolve(mockFilterData);
//             }, 500);
//         });
//     }
// );

// const initialState = {
//     filters: {
//         location: '',
//         spaceType: [],
//         priceRange: [0, Infinity],
//         amenities: [],
//         rentalType: 'NGÀY',
//     },
//     spaces: [],
//     loading: 'idle',
//     error: null,
//     filterData: null,
//     sortOption: 'name', // Thêm state sortOption với giá trị mặc định
// }

// export const bookSpaceSlice = createSlice({
//     name: 'bookSpace',
//     initialState,
//     reducers: {
//         setLocationFilter: (state, action) => {
//             state.filters.location = action.payload;
//         },
//         // Ví dụ ĐÚNG cách làm
//         toggleSpaceTypeFilter: (state, action) => {
//             const type = action.payload;
//             if (state.filters.spaceType.includes(type)) {
//                 state.filters.spaceType = state.filters.spaceType.filter(t => t !== type); // Tạo mảng mới
//             } else {
//                 state.filters.spaceType = [...state.filters.spaceType, type]; // Tạo mảng mới
//             }
//         },
//         setPriceRangeFilter: (state, action) => {
//             state.filters.priceRange = action.payload;
//         },
//         toggleAmenityFilter: (state, action) => {
//             const amenity = action.payload;
//             if (state.filters.amenities.includes(amenity)) {
//                 state.filters.amenities = state.filters.amenities.filter(a => a !== amenity);
//             } else {
//                 state.filters.amenities.push(amenity);
//             }
//         },
//         setRentalTypeFilter: (state, action) => {
//             state.filters.rentalType = action.payload;
//         },
//         clearAllFilters: (state) => {
//             state.filters = {
//                 ...state.filters,
//                 location: '',
//                 spaceType: [],
//                 priceRange: [0, Infinity],
//                 amenities: [],
//                 rentalType: 'NGÀY',
//             };
//         },
//         setFilteredSpaces: (state, action) => {
//             state.spaces = action.payload;
//         },
//         setFilterData: (state, action) => {
//             state.filterData = action.payload;
//         },
//         setSortOption: (state, action) => {
//             state.sortOption = action.payload; // Reducer để cập nhật sortOption
//         },
//     },
//     extraReducers: (builder) => {
//         builder
//             .addCase(fetchBookSpaceFilters.pending, (state) => {
//                 state.loading = 'pending';
//             })
//             .addCase(fetchBookSpaceFilters.fulfilled, (state, action) => {
//                 state.loading = 'succeeded';
//                 state.filterData = action.payload;
//             })
//             .addCase(fetchBookSpaceFilters.rejected, (state, action) => {
//                 state.loading = 'failed';
//                 state.error = action.error.message;
//             });
//     },
// });

// export const {
//     setLocationFilter,
//     toggleSpaceTypeFilter,
//     setPriceRangeFilter,
//     toggleAmenityFilter,
//     setRentalTypeFilter,
//     clearAllFilters,
//     setFilteredSpaces,
//     setFilterData,
//     setSortOption, // Export action setSortOption
// } = bookSpaceSlice.actions;

// export const selectBookSpaceFilters = (state) => state.bookSpace.filters;
// export const selectBookSpaceSpaces = (state) => state.bookSpace.spaces;
// export const selectBookSpaceLoading = (state) => state.bookSpace.loading;
// export const selectBookSpaceError = (state) => state.bookSpace.error;
// export const selectBookSpaceFilterData = (state) => state.bookSpace.filterData;
// export const selectSortOption = (state) => state.bookSpace.sortOption; // Export selector sortOption

// // Thunk mô phỏng việc lọc và sắp xếp không gian
// // export const filterSpaces = () => (dispatch, getState) => {
// //     const filters = selectBookSpaceFilters(getState());
// //     const sortOption = selectSortOption(getState()); // Lấy sortOption từ state
// //     const allSpaces = [
// //         { id: '1', name: 'Không gian làm việc A', address: 'Đà Nẵng', price: 200, amenities: ['WIFI', 'BÀN ĐỨNG'], spaceType: 'Không gian làm việc', image: 'url_anh_1.jpg' },
// //         { id: '2', name: 'Phòng riêng B', address: 'Đà Nẵng', price: 400, amenities: ['WIFI', 'MÁY IN', 'Phòng riêng'], spaceType: 'Phòng riêng', image: 'url_anh_2.jpg' },
// //         { id: '3', name: 'Không gian nhóm C', address: 'Hà Nội', price: 300, amenities: ['WIFI', 'Bảng trắng'], spaceType: 'Nhóm', image: 'url_anh_3.jpg' },
// //         // Thêm dữ liệu mô phỏng khác nếu cần
// //     ];

// //     let filteredSpaces = allSpaces.filter(space => {
// //         if (filters.location && !space.address.toLowerCase().includes(filters.location.toLowerCase())) {
// //             return false;
// //         }
// //         if (filters.spaceType.length > 0 && !filters.spaceType.includes(space.spaceType)) {
// //             return false;
// //         }
// //         if (space.price < filters.priceRange[0] || space.price > filters.priceRange[1]) {
// //             return false;
// //         }
// //         if (filters.amenities.length > 0 && !filters.amenities.every(amenity => space.amenities.includes(amenity))) {
// //             return false;
// //         }
// //         return true;
// //     });

// //     // Áp dụng sắp xếp
// //     switch (sortOption) {
// //         case 'name':
// //             filteredSpaces.sort((a, b) => a.name.localeCompare(b.name));
// //             break;
// //         case 'price_asc':
// //             filteredSpaces.sort((a, b) => a.price - b.price);
// //             break;
// //         case 'price_desc':
// //             filteredSpaces.sort((a, b) => b.price - a.price);
// //             break;
// //         default:
// //             break;
// //     }

// //     // Hiển thị một số kết quả ban đầu (ví dụ: 5) nếu không có bộ lọc nào
// //     const initialResultsCount = 5;
// //     const resultsToDisplay = Object.values(filters).every(filter => !filter || (Array.isArray(filter) && filter.length === 0) || (typeof filter === 'number' && filter === Infinity) || filter === 'NGÀY' || filter === '')
// //         ? filteredSpaces.slice(0, initialResultsCount)
// //         : filteredSpaces;

// //     dispatch(setFilteredSpaces(filteredSpaces));
// // };
// export const filterSpaces = createAsyncThunk(
//     'bookSpace/filterSpaces',
//     async (_, { getState, rejectWithValue }) => {
//         try {
//             const { filters, sortOption } = getState().bookSpace;

//             // Logic gọi API backend với các bộ lọc
//             let params = {}
//             if (filters.location)
//                 params.location = filters.location

//             const response = await api.getSpaces(params);
//             return response.data;
//         } catch (error) {
//             return rejectWithValue(error.message);
//         }
//     }
// );


// export default bookSpaceSlice.reducer;
///////////////////////

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/api.js';

export const fetchBookSpaceFilters = createAsyncThunk(
    'bookSpace/fetchFilters',
    async () => {
        // Giả lập call API (thay bằng gọi API thật)
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    spaceTypes: ['Không gian làm việc', 'Phòng riêng'],
                    amenities: ['WIFI', 'Máy in'],
                    priceRanges: [{ label: 'Dưới 200$', value: [0, 200] }],
                    rentalOptions: ['Ngày', 'Tuần'],
                });
            }, 500);
        });
    }
);

// Thunk để lấy danh sách không gian từ backend
export const filterSpaces = createAsyncThunk(
    'bookSpace/filterSpaces',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { filters, sortOption } = getState().bookSpace;
            // Logic gọi API backend với các bộ lọc
            let params = {
                sort: sortOption,
                location: filters.location,
                // Bạn cần chuyển đổi các mảng và đối tượng thành string nếu backend yêu cầu
                spaceType: filters.spaceType.join(','), // Chuyển mảng spaceType thành string
                // Các bộ lọc khác
            };
            console.log("==>Params gửi lên backend:", params); //In ra cái params
            const response = await api.getSpaces(params);
            console.log("<==Dữ liệu nhận từ backend:", response);
            return response;
        } catch (error) {
            console.error("Lỗi khi tải không gian:", error); //Test lại để còn thấy lỗi gì ko
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    filters: {
        location: '',
        spaceTypes: [],
        spaceType: [], // Đổi tên để đồng nhất với backend
        priceRange: [0, Infinity],
        amenities: [],
        rentalType: 'NGÀY',
    },
    spaces: [],
    loading: 'idle',
    error: null,
    filterData: null,
    sortOption: 'name',
};

export const bookSpaceSlice = createSlice({
    name: 'bookSpace',
    initialState,
    reducers: {
        setLocationFilter: (state, action) => {
            state.filters.location = action.payload;
        },
        toggleSpaceTypeFilter: (state, action) => {
            const type = action.payload;
            if (state.filters.spaceType.includes(type)) {
                state.filters.spaceType = state.filters.spaceType.filter(t => t !== type);
            } else {
                state.filters.spaceType.push(type);
            }
        },
        setPriceRangeFilter: (state, action) => {
            state.filters.priceRange = action.payload;
        },
        toggleAmenityFilter: (state, action) => {
            const amenity = action.payload;
            if (state.filters.amenities.includes(amenity)) {
                state.filters.amenities = state.filters.amenities.filter(a => a !== amenity);
            } else {
                state.filters.amenities.push(amenity);
            }
        },
        setRentalTypeFilter: (state, action) => {
            state.filters.rentalType = action.payload;
        },
        clearAllFilters: (state) => {
            state.filters = initialState.filters;
        },
        setFilteredSpaces: (state, action) => {
            state.spaces = action.payload;
        },
        setFilterData: (state, action) => {
            state.filterData = action.payload;
        },
        setSortOption: (state, action) => {
            state.sortOption = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBookSpaceFilters.pending, (state) => {
                state.loading = 'pending';
            })
            .addCase(fetchBookSpaceFilters.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.filterData = action.payload;
            })
            .addCase(fetchBookSpaceFilters.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.error.message;
            })
            .addCase(filterSpaces.pending, (state) => {
                state.loading = 'pending';
            })
            .addCase(filterSpaces.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.spaces = action.payload; // Lưu kết quả vào state spaces
            })
            .addCase(filterSpaces.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            });
    },
});

export const {
    setLocationFilter,
    toggleSpaceTypeFilter,
    setPriceRangeFilter,
    toggleAmenityFilter,
    setRentalTypeFilter,
    clearAllFilters,
    setFilteredSpaces,
    setFilterData,
    setSortOption,
} = bookSpaceSlice.actions;

export const selectBookSpaceFilters = (state) => state.bookSpace.filters;
export const selectBookSpaceSpaces = (state) => state.bookSpace.spaces;
export const selectBookSpaceLoading = (state) => state.bookSpace.loading;
export const selectBookSpaceError = (state) => state.bookSpace.error;
export const selectBookSpaceFilterData = (state) => state.bookSpace.filterData;
export const selectSortOption = (state) => state.bookSpace.sortOption;

export default bookSpaceSlice.reducer;