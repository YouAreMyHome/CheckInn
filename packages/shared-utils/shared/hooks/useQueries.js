import { useQuery, useMutation, useQueryClient } from 'react-query';
import { hotelsAPI, searchAPI, roomsAPI, bookingsAPI } from '../services/api';

// Query keys cho cache management
export const QUERY_KEYS = {
  HOTELS: 'hotels',
  HOTEL_DETAIL: 'hotel-detail',
  HOTEL_SEARCH: 'hotel-search',
  ROOMS: 'rooms',
  ROOM_DETAIL: 'room-detail',
  BOOKINGS: 'bookings',
  BOOKING_DETAIL: 'booking-detail',
  MY_BOOKINGS: 'my-bookings',
};

// Hotels queries theo API Documentation
export const useHotelsQuery = (filters = {}) => {
  return useQuery(
    [QUERY_KEYS.HOTELS, filters],
    () => hotelsAPI.getAll(filters).then(res => res.data),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      select: (data) => ({
        hotels: data.data.hotels || [],
        pagination: data.data.pagination || {},
      }),
    }
  );
};

export const useHotelDetailQuery = (hotelId) => {
  return useQuery(
    [QUERY_KEYS.HOTEL_DETAIL, hotelId],
    () => hotelsAPI.getById(hotelId).then(res => res.data),
    {
      enabled: !!hotelId,
      staleTime: 10 * 60 * 1000, // 10 minutes for hotel details
      select: (data) => data.data.hotel,
    }
  );
};

export const useHotelSearchQuery = (searchParams) => {
  return useQuery(
    [QUERY_KEYS.HOTEL_SEARCH, searchParams],
    () => searchAPI.hotels(searchParams).then(res => res.data),
    {
      enabled: !!searchParams?.destination,
      staleTime: 2 * 60 * 1000, // 2 minutes for search results
      select: (data) => ({
        hotels: data.data.hotels || [],
        pagination: data.data.pagination || {},
      }),
    }
  );
};

// Rooms queries theo API Documentation
export const useRoomsQuery = (params) => {
  return useQuery(
    [QUERY_KEYS.ROOMS, params],
    () => roomsAPI.getByHotel(params).then(res => res.data),
    {
      enabled: !!params?.hotelId,
      staleTime: 3 * 60 * 1000, // 3 minutes
      select: (data) => data.data.rooms || [],
    }
  );
};

// Bookings queries theo API Documentation
export const useMyBookingsQuery = (params = {}) => {
  return useQuery(
    [QUERY_KEYS.MY_BOOKINGS, params],
    () => bookingsAPI.getMyBookings(params).then(res => res.data),
    {
      staleTime: 1 * 60 * 1000, // 1 minute for bookings
      select: (data) => ({
        bookings: data.data || [],
        pagination: data.pagination || {},
      }),
    }
  );
};

export const useBookingDetailQuery = (bookingId) => {
  return useQuery(
    [QUERY_KEYS.BOOKING_DETAIL, bookingId],
    () => bookingsAPI.getById(bookingId).then(res => res.data),
    {
      enabled: !!bookingId,
      staleTime: 30 * 1000, // 30 seconds for booking details
      select: (data) => data.data.booking,
    }
  );
};

// Mutations với optimistic updates
export const useCreateBookingMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (bookingData) => bookingsAPI.create(bookingData).then(res => res.data),
    {
      onSuccess: () => {
        // Invalidate bookings list để refresh data
        queryClient.invalidateQueries([QUERY_KEYS.MY_BOOKINGS]);
      },
      onError: (error) => {
        console.error('Booking creation failed:', error);
      },
    }
  );
};

export const useCancelBookingMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ bookingId, reason }) => bookingsAPI.cancel(bookingId, reason).then(res => res.data),
    {
      onMutate: async ({ bookingId }) => {
        // Optimistic update
        await queryClient.cancelQueries([QUERY_KEYS.MY_BOOKINGS]);
        
        const previousBookings = queryClient.getQueryData([QUERY_KEYS.MY_BOOKINGS]);
        
        // Update booking status optimistically
        queryClient.setQueryData([QUERY_KEYS.MY_BOOKINGS], (old) => {
          if (!old) return old;
          
          return {
            ...old,
            bookings: old.bookings.map(booking =>
              booking._id === bookingId 
                ? { ...booking, status: 'Cancelled' }
                : booking
            ),
          };
        });
        
        return { previousBookings };
      },
      onError: (err, variables, context) => {
        // Rollback optimistic update on error
        if (context?.previousBookings) {
          queryClient.setQueryData([QUERY_KEYS.MY_BOOKINGS], context.previousBookings);
        }
      },
      onSettled: () => {
        // Refetch to ensure consistency
        queryClient.invalidateQueries([QUERY_KEYS.MY_BOOKINGS]);
      },
    }
  );
};

// Prefetch utilities để improve UX
export const usePrefetchHotelDetail = () => {
  const queryClient = useQueryClient();
  
  return (hotelId) => {
    queryClient.prefetchQuery(
      [QUERY_KEYS.HOTEL_DETAIL, hotelId],
      () => hotelsAPI.getById(hotelId).then(res => res.data),
      {
        staleTime: 10 * 60 * 1000,
      }
    );
  };
};

export const usePrefetchRooms = () => {
  const queryClient = useQueryClient();
  
  return (params) => {
    queryClient.prefetchQuery(
      [QUERY_KEYS.ROOMS, params],
      () => roomsAPI.getByHotel(params).then(res => res.data),
      {
        staleTime: 3 * 60 * 1000,
      }
    );
  };
};