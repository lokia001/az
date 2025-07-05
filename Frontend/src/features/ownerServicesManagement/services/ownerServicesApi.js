import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_BASE_URL}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const ownerServicesApi = createApi({
  reducerPath: 'ownerServicesApi',
  baseQuery,
  tagTypes: ['PrivateService', 'BookingService'],
  endpoints: (builder) => ({
    // Private Services Management
    getOwnerServices: builder.query({
      query: () => '/owner/private-services',
      providesTags: ['PrivateService'],
    }),

    getOwnerServiceById: builder.query({
      query: (id) => `/owner/private-services/${id}`,
      providesTags: (result, error, id) => [{ type: 'PrivateService', id }],
    }),

    createOwnerService: builder.mutation({
      query: (serviceData) => ({
        url: '/owner/private-services',
        method: 'POST',
        body: serviceData,
      }),
      invalidatesTags: ['PrivateService'],
    }),

    updateOwnerService: builder.mutation({
      query: ({ id, serviceData }) => ({
        url: `/owner/private-services/${id}`,
        method: 'PUT',
        body: serviceData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PrivateService', id },
        'PrivateService',
      ],
    }),

    deleteOwnerService: builder.mutation({
      query: (id) => ({
        url: `/owner/private-services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PrivateService'],
    }),

    // Booking Services Management
    getBookingServices: builder.query({
      query: (bookingId) => `/bookings/${bookingId}/services`,
      providesTags: (result, error, bookingId) => [
        { type: 'BookingService', id: bookingId },
      ],
    }),

    addServiceToBooking: builder.mutation({
      query: ({ bookingId, serviceData }) => ({
        url: `/bookings/${bookingId}/services`,
        method: 'POST',
        body: serviceData,
      }),
      invalidatesTags: (result, error, { bookingId }) => [
        { type: 'BookingService', id: bookingId },
      ],
    }),

    updateBookingService: builder.mutation({
      query: ({ bookingId, serviceId, serviceData }) => ({
        url: `/bookings/${bookingId}/services/${serviceId}`,
        method: 'PUT',
        body: serviceData,
      }),
      invalidatesTags: (result, error, { bookingId }) => [
        { type: 'BookingService', id: bookingId },
      ],
    }),

    removeServiceFromBooking: builder.mutation({
      query: ({ bookingId, serviceId }) => ({
        url: `/bookings/${bookingId}/services/${serviceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { bookingId }) => [
        { type: 'BookingService', id: bookingId },
      ],
    }),
  }),
});

export const {
  useGetOwnerServicesQuery,
  useGetOwnerServiceByIdQuery,
  useCreateOwnerServiceMutation,
  useUpdateOwnerServiceMutation,
  useDeleteOwnerServiceMutation,
  useGetBookingServicesQuery,
  useAddServiceToBookingMutation,
  useUpdateBookingServiceMutation,
  useRemoveServiceFromBookingMutation,
} = ownerServicesApi;
