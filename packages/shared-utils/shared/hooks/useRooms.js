import { useState, useCallback } from 'react';
import { roomsAPI, apiRequest } from '../services/api';

// Hook cho room operations theo API Documentation
export const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get rooms for hotel theo API Documentation
  const getRoomsByHotel = useCallback(async (params) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Params phải chứa hotelId theo API doc
      const result = await apiRequest(() => roomsAPI.getByHotel(params));
      
      if (result.success) {
        setRooms(result.data.rooms || []);
        return { success: true, data: result.data.rooms };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = 'Lỗi khi tải danh sách phòng';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get room by ID
  const getRoomById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiRequest(() => roomsAPI.getById(id));
      
      if (result.success) {
        setRoom(result.data.room);
        return { success: true, data: result.data.room };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = 'Lỗi khi tải thông tin phòng';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check room availability
  const checkAvailability = useCallback(async (roomId, checkIn, checkOut) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiRequest(() => 
        roomsAPI.checkAvailability(roomId, checkIn, checkOut)
      );
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = 'Lỗi khi kiểm tra tình trạng phòng';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create room (Partner only)
  const createRoom = useCallback(async (roomData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiRequest(() => roomsAPI.create(roomData));
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, message: result.message, errors: result.errors };
      }
    } catch (error) {
      const errorMessage = 'Lỗi khi tạo phòng';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update room (Partner only)
  const updateRoom = useCallback(async (id, roomData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiRequest(() => roomsAPI.update(id, roomData));
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, message: result.message, errors: result.errors };
      }
    } catch (error) {
      const errorMessage = 'Lỗi khi cập nhật phòng';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    rooms,
    room,
    isLoading,
    error,
    getRoomsByHotel,
    getRoomById,
    checkAvailability,
    createRoom,
    updateRoom,
    setError,
  };
};