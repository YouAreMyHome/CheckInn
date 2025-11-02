import api from '@services/api';

const userService = {
  // Get all users with filters and pagination
  async getUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.role && params.role !== 'all') queryParams.append('role', params.role);
      if (params.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      console.log('🔄 Fetching users with params:', params);
      const response = await api.get(`/admin/users?${queryParams}`);
      console.log('✅ Users API response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ getUsers error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch users');
    }
  },

  // Get single user by ID
  async getUser(userId) {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch user');
    }
  },

  // Create new user
  async createUser(userData) {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to create user');
    }
  },

  // Update user
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to update user');
    }
  },

  // Delete user
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to delete user');
    }
  },

  // Bulk delete users
  async bulkDeleteUsers(userIds) {
    try {
      const response = await api.delete('/admin/users/bulk', {
        data: { userIds }
      });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to delete users');
    }
  },

  // Update user status (activate/suspend)
  async updateUserStatus(userId, status) {
    try {
      // Ensure status is a string and userId is valid
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const validStatuses = ['active', 'suspended', 'inactive'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status. Must be active, suspended, or inactive');
      }

      const response = await api.patch(`/admin/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Update user status error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to update user status');
    }
  },

  // Get user statistics
  async getUserStats() {
    try {
      const response = await api.get('/admin/users/stats');
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch user statistics');
    }
  },

  // Export users data
  async exportUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.format) queryParams.append('format', params.format); // csv, xlsx
      if (params.role && params.role !== 'all') queryParams.append('role', params.role);
      if (params.status && params.status !== 'all') queryParams.append('status', params.status);
      
      const response = await api.get(`/admin/users/export?${queryParams}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.${params.format || 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Export completed successfully' };
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to export users');
    }
  },

  // Get user activity logs
  async getUserActivityLogs(userId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      
      const response = await api.get(`/admin/users/${userId}/activity?${queryParams}`);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch user activity');
    }
  },

  // Reset user password
  async resetUserPassword(userId) {
    try {
      const response = await api.post(`/admin/users/${userId}/reset-password`);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to reset user password');
    }
  },

  // Send notification to user
  async sendNotificationToUser(userId, notification) {
    try {
      const response = await api.post(`/admin/users/${userId}/notifications`, notification);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to send notification');
    }
  }
};

export default userService;