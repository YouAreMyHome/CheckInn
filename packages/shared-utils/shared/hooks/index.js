// Export all hooks
export { useAuth } from './useAuth';
export { useHotels } from './useHotels';
export { useRooms } from './useRooms';
export { useBookings } from './useBookings';

// Export React Query hooks
export {
  useHotelsQuery,
  useHotelDetailQuery,
  useHotelSearchQuery,
  useRoomsQuery,
  useMyBookingsQuery,
  useBookingDetailQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
  usePrefetchHotelDetail,
  usePrefetchRooms,
  QUERY_KEYS,
} from './useQueries';