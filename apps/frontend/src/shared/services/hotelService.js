import api from './api';

const hotelService = {
  // Get all hotels with search and filtering
  async getHotels(params = {}) {
    try {
      const response = await api.get('/hotels', { params });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch hotels');
    }
  },

  // Get hotel by ID
  async getHotelById(id) {
    try {
      const response = await api.get(`/hotels/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch hotel details');
    }
  },

  // Search hotels
  async searchHotels(searchData) {
    try {
      const response = await api.post('/hotels/search', searchData);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Search failed');
    }
  },

  // Create hotel (for hotel managers)
  async createHotel(hotelData) {
    try {
      const response = await api.post('/hotels', hotelData);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to create hotel');
    }
  },

  // Update hotel
  async updateHotel(id, hotelData) {
    try {
      const response = await api.patch(`/hotels/${id}`, hotelData);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to update hotel');
    }
  },

  // Delete hotel
  async deleteHotel(id) {
    try {
      const response = await api.delete(`/hotels/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to delete hotel');
    }
  },

  // Get hotels by owner (for hotel managers)
  async getMyHotels() {
    try {
      const response = await api.get('/hotels/my-hotels');
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch your hotels');
    }
  },

  // Upload hotel images
  async uploadHotelImages(hotelId, images) {
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      const response = await api.post(`/hotels/${hotelId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to upload images');
    }
  }
};

export { hotelService };