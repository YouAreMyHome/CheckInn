import api from './api';

const userService = {
  // Get all users (admin only)
  async getAllUsers(params = {}) {
    try {
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch users');
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch user details');
    }
  },

  // Update user (admin)
  async updateUser(userId, userData) {
    try {
      const response = await api.patch(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to update user');
    }
  },

  // Delete user (admin)
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to delete user');
    }
  },

  // Ban user (admin)
  async banUser(userId, reason) {
    try {
      const response = await api.patch(`/users/${userId}/ban`, { reason });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to ban user');
    }
  },

  // Unban user (admin)
  async unbanUser(userId) {
    try {
      const response = await api.patch(`/users/${userId}/unban`);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to unban user');
    }
  },

  // Get user statistics (admin)
  async getUserStats() {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch user statistics');
    }
  },

  // Search users
  async searchUsers(searchQuery) {
    try {
      const response = await api.get('/users/search', { 
        params: { q: searchQuery } 
      });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Search failed');
    }
  },

  // Update current user's profile
  async updateProfile(profileData) {
    try {
      const response = await api.patch('/users/profile', profileData);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to update profile');
    }
  }
};

export { userService };