import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../constants';
import { storage, handleApiError } from '../utils';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = storage.get(STORAGE_KEYS.TOKEN);
    if (token) {
      // Check if token is expired before making request
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (payload.exp && payload.exp < currentTime) {
          // Token is expired, don't send it
          console.log('Token expired, clearing auth data');
          clearAuthData();
          return config;
        }
        
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        // Invalid token format, clear it
        console.error('Invalid token format:', error);
        clearAuthData();
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag to prevent infinite refresh token calls
let isRefreshing = false;
let failedQueue = [];
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

const clearAuthData = () => {
  storage.remove(STORAGE_KEYS.TOKEN);
  storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
  storage.remove(STORAGE_KEYS.USER);
  refreshAttempts = 0;
};

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, add this request to the queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const refreshToken = storage.get(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken && refreshAttempts < MAX_REFRESH_ATTEMPTS) {
          refreshAttempts++;
          
          const response = await api.post('/auth/refresh', {
            refreshToken,
          });
          
          const { token } = response.data.data;
          storage.set(STORAGE_KEYS.TOKEN, token);
          
          // Reset attempts on successful refresh
          refreshAttempts = 0;
          processQueue(null, token);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } else {
          // No refresh token or too many attempts, clear storage and redirect
          throw new Error('No refresh token available or too many attempts');
        }
      } catch (refreshError) {
        // Refresh failed, clear storage and redirect
        processQueue(refreshError, null);
        clearAuthData();
        
        // Only redirect to login if we're not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API - theo API Documentation
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

// Hotels API - theo API Documentation
export const hotelsAPI = {
  // Public endpoints
  getAll: (params) => api.get('/hotels', { params }),
  getById: (id) => api.get(`/hotels/${id}`),
  
  // Partner endpoints (cần auth)
  getMyHotels: () => api.get('/hotels/my/hotels'),
  create: (hotelData) => api.post('/hotels', hotelData),
  update: (id, hotelData) => api.put(`/hotels/${id}`, hotelData),
  delete: (id) => api.delete(`/hotels/${id}`),
  uploadImages: (id, formData) => api.post(`/hotels/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Reviews endpoints
  getReviews: (id, params) => api.get(`/hotels/${id}/reviews`, { params }),
  addReview: (id, reviewData) => api.post(`/hotels/${id}/reviews`, reviewData),
  
  // Featured hotels
  getFeaturedHotels: (params) => api.get('/hotels/featured', { params }),
};

// Search API - theo API Documentation
export const searchAPI = {
  hotels: (params) => api.get('/search/hotels', { params }),
};

// Rooms API - theo API Documentation
export const roomsAPI = {
  // Get rooms for specific hotel với query params theo API doc
  getByHotel: (params) => api.get('/rooms', { params }), // hotelId is in params
  getById: (id) => api.get(`/rooms/${id}`),
  
  // Partner endpoints
  create: (roomData) => api.post('/rooms', roomData),
  update: (id, roomData) => api.put(`/rooms/${id}`, roomData),
  delete: (id) => api.delete(`/rooms/${id}`),
  checkAvailability: (id, checkIn, checkOut) => api.get(`/rooms/${id}/availability`, {
    params: { checkIn, checkOut }
  }),
  updatePricing: (id, pricingData) => api.put(`/rooms/${id}/pricing`, pricingData),
  uploadImages: (id, formData) => api.post(`/rooms/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Bookings API - theo API Documentation
export const bookingsAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getById: (id) => api.get(`/bookings/${id}`),
  getMyBookings: (params) => api.get('/bookings/my-bookings', { params }),
  getHotelBookings: (params) => api.get('/bookings/hotel', { params }),
  cancel: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
  confirm: (id) => api.put(`/bookings/${id}/confirm`),
  checkIn: (id) => api.put(`/bookings/${id}/check-in`),
  checkOut: (id) => api.put(`/bookings/${id}/check-out`),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
};

// Generic API wrapper with proper error handling theo API Documentation
export const apiRequest = async (apiCall) => {
  try {
    const response = await apiCall();
    
    // Đảm bảo response theo format của API Documentation
    if (response.data.success !== undefined) {
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
        errors: response.data.errors || null,
      };
    }
    
    // Fallback cho response không theo standard format
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Success',
      errors: null,
    };
  } catch (error) {
    const errorInfo = handleApiError(error);
    return {
      success: false,
      data: null,
      message: errorInfo.message,
      status: errorInfo.status,
      errors: error.response?.data?.errors || null,
    };
  }
};

// Generic pagination wrapper theo API Documentation
export const paginatedRequest = async (apiCall, params = {}) => {
  try {
    const response = await apiCall({
      page: 1,
      limit: 10,
      ...params,
    });
    
    return {
      success: true,
      data: response.data.data || [],
      pagination: response.data.pagination || {},
      message: response.data.message || 'Success',
    };
  } catch (error) {
    const errorInfo = handleApiError(error);
    return {
      success: false,
      data: [],
      pagination: {},
      message: errorInfo.message,
      status: errorInfo.status,
      errors: error.response?.data?.errors || null,
    };
  }
};

export default api;