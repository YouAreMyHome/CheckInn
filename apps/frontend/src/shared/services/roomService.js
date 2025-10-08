import api from './api';

const roomService = {
  // Get all rooms for a hotel
  async getRoomsByHotel(hotelId, params = {}) {
    try {
      const response = await api.get(`/hotels/${hotelId}/rooms`, { params });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch rooms');
    }
  },

  // Get room by ID
  async getRoomById(roomId) {
    try {
      const response = await api.get(`/rooms/${roomId}`);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch room details');
    }
  },

  // Check room availability
  async checkAvailability(roomId, checkIn, checkOut) {
    try {
      const response = await api.post(`/rooms/${roomId}/availability`, {
        checkIn,
        checkOut
      });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to check availability');
    }
  },

  // Create room (for hotel managers)
  async createRoom(hotelId, roomData) {
    try {
      const response = await api.post(`/hotels/${hotelId}/rooms`, roomData);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to create room');
    }
  },

  // Update room
  async updateRoom(roomId, roomData) {
    try {
      const response = await api.patch(`/rooms/${roomId}`, roomData);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to update room');
    }
  },

  // Delete room
  async deleteRoom(roomId) {
    try {
      const response = await api.delete(`/rooms/${roomId}`);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to delete room');
    }
  },

  // Get room types for a hotel
  async getRoomTypes(hotelId) {
    try {
      const response = await api.get(`/hotels/${hotelId}/room-types`);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch room types');
    }
  }
};

export { roomService };