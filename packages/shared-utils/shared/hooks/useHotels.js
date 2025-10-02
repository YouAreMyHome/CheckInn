import { useState, useCallback } from 'react';
import { hotelsAPI, searchAPI, apiRequest, paginatedRequest } from '../services/api';

// Hook cho hotel operations theo API Documentation
export const useHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get hotels with filters theo API Documentation
  const getHotels = useCallback(async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await paginatedRequest(
        (params) => hotelsAPI.getAll(params),
        filters
      );
      
      if (result.success) {
        setHotels(result.data);
        setPagination(result.pagination);
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = 'Lỗi khi tải danh sách khách sạn';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search hotels theo API Documentation
  const searchHotels = useCallback(async (searchParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await paginatedRequest(
        (params) => searchAPI.hotels(params),
        searchParams
      );
      
      if (result.success) {
        setHotels(result.data);
        setPagination(result.pagination);
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = 'Lỗi khi tìm kiếm khách sạn';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get hotel by ID theo API Documentation
  const getHotelById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiRequest(() => hotelsAPI.getById(id));
      
      if (result.success) {
        setHotel(result.data.hotel);
        return { success: true, data: result.data.hotel };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = 'Lỗi khi tải thông tin khách sạn';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create hotel (Partner only)
  const createHotel = useCallback(async (hotelData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiRequest(() => hotelsAPI.create(hotelData));
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, message: result.message, errors: result.errors };
      }
    } catch (error) {
      const errorMessage = 'Lỗi khi tạo khách sạn';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update hotel (Partner only)
  const updateHotel = useCallback(async (id, hotelData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiRequest(() => hotelsAPI.update(id, hotelData));
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, message: result.message, errors: result.errors };
      }
    } catch (error) {
      const errorMessage = 'Lỗi khi cập nhật khách sạn';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    hotels,
    hotel,
    pagination,
    isLoading,
    error,
    getHotels,
    searchHotels,
    getHotelById,
    createHotel,
    updateHotel,
    setError,
  };
};