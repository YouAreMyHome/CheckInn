import api from './api';

const bookingService = {
  // Create booking
  async createBooking(bookingData) {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to create booking');
    }
  },

  // Get user's bookings
  async getMyBookings(params = {}) {
    try {
      const response = await api.get('/bookings/my-bookings', { params });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch bookings');
    }
  },

  // Get user's bookings (alias for getMyBookings)
  async getUserBookings(params = {}) {
    return this.getMyBookings(params);
  },

  // Get booking by ID
  async getBookingById(bookingId) {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch booking details');
    }
  },

  // Update booking
  async updateBooking(bookingId, updateData) {
    try {
      const response = await api.patch(`/bookings/${bookingId}`, updateData);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to update booking');
    }
  },

  // Cancel booking
  async cancelBooking(bookingId, reason) {
    try {
      const response = await api.patch(`/bookings/${bookingId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to cancel booking');
    }
  },

  // Get hotel bookings (for hotel managers)
  async getHotelBookings(hotelId, params = {}) {
    try {
      const response = await api.get(`/hotels/${hotelId}/bookings`, { params });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch hotel bookings');
    }
  },

  // Check in guest
  async checkIn(bookingId) {
    try {
      const response = await api.patch(`/bookings/${bookingId}/check-in`);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to check in guest');
    }
  },

  // Check out guest
  async checkOut(bookingId) {
    try {
      const response = await api.patch(`/bookings/${bookingId}/check-out`);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to check out guest');
    }
  },

  // Calculate booking price
  async calculatePrice(roomId, checkIn, checkOut, guests) {
    try {
      const response = await api.post('/bookings/calculate-price', {
        roomId,
        checkIn,
        checkOut,
        guests
      });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to calculate price');
    }
  }
};

export { bookingService };