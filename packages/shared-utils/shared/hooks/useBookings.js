import { useState, useCallback } from 'react';
import { bookingsAPI, apiRequest, paginatedRequest } from '../services/api';

// Hook cho booking operations theo API Documentation
export const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [booking, setBooking] = useState(null);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create booking theo API Documentation
  const createBooking = useCallback(async (bookingData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiRequest(() => bookingsAPI.create(bookingData));
      
      if (result.success) {
        return { success: true, data: result.data.booking };
      } else {
        setError(result.message);
        return { success: false, message: result.message, errors: result.errors };
      }
    } catch (error) {
      const errorMessage = 'Lỗi khi tạo đặt phòng';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get my bookings theo API Documentation
  const getMyBookings = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await paginatedRequest(
        (requestParams) => bookingsAPI.getMyBookings(requestParams),
        params
      );
      
      if (result.success) {
        setBookings(result.data);
        setPagination(result.pagination);
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = 'Lỗi khi tải danh sách đặt phòng';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get booking by ID theo API Documentation
  const getBookingById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiRequest(() => bookingsAPI.getById(id));
      
      if (result.success) {
        setBooking(result.data.booking);
        return { success: true, data: result.data.booking };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = 'Lỗi khi tải thông tin đặt phòng';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancel booking theo API Documentation
  const cancelBooking = useCallback(async (id, reason) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiRequest(() => bookingsAPI.cancel(id, reason));
      
      if (result.success) {
        // Update local booking state
        if (booking && booking._id === id) {
          setBooking({ ...booking, status: 'Cancelled' });
        }
        
        // Update bookings list
        setBookings(prevBookings => 
          prevBookings.map(b => 
            b._id === id ? { ...b, status: 'Cancelled' } : b
          )
        );
        
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = 'Lỗi khi hủy đặt phòng';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [booking]);

  // Update booking status (for hotel partners)
  const updateBookingStatus = useCallback(async (id, status) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiRequest(() => bookingsAPI.updateStatus(id, status));
      
      if (result.success) {
        // Update local booking state
        if (booking && booking._id === id) {
          setBooking({ ...booking, status });
        }
        
        // Update bookings list
        setBookings(prevBookings => 
          prevBookings.map(b => 
            b._id === id ? { ...b, status } : b
          )
        );
        
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = 'Lỗi khi cập nhật trạng thái đặt phòng';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [booking]);

  return {
    bookings,
    booking,
    pagination,
    isLoading,
    error,
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    updateBookingStatus,
    setError,
  };
};