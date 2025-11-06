/**
 * Revenue Service for CheckInn Hotel Booking Platform
 * 
 * Handles all revenue & analytics API calls
 * - Revenue tracking
 * - Occupancy analytics
 * - Booking trends
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

import api from './api';

const revenueService = {
  /**
   * ========================================================================
   * PARTNER REVENUE
   * ========================================================================
   */

  /**
   * Get partner revenue summary across all hotels
   * @param {Object} params - Query parameters {startDate, endDate}
   * @returns {Promise}
   */
  async getPartnerSummary(params = {}) {
    try {
      const response = await api.get('/revenue/partner/summary', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch partner revenue');
    }
  },

  /**
   * ========================================================================
   * HOTEL REVENUE
   * ========================================================================
   */

  /**
   * Get hotel revenue for date range
   * @param {string} hotelId - Hotel ID
   * @param {Object} params - Query parameters {startDate, endDate}
   * @returns {Promise}
   */
  async getHotelRevenue(hotelId, params = {}) {
    try {
      const response = await api.get(`/revenue/hotel/${hotelId}`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch hotel revenue');
    }
  },

  /**
   * Get monthly revenue summary
   * @param {string} hotelId - Hotel ID
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {Promise}
   */
  async getMonthlyRevenue(hotelId, year, month) {
    try {
      const response = await api.get(`/revenue/hotel/${hotelId}/monthly`, {
        params: { year, month }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch monthly revenue');
    }
  },

  /**
   * ========================================================================
   * ANALYTICS
   * ========================================================================
   */

  /**
   * Get occupancy rate analytics
   * @param {string} hotelId - Hotel ID
   * @param {Object} params - Query parameters {startDate, endDate}
   * @returns {Promise}
   */
  async getOccupancyRate(hotelId, params = {}) {
    try {
      const response = await api.get(`/revenue/hotel/${hotelId}/occupancy`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch occupancy data');
    }
  },

  /**
   * Get booking trends
   * @param {string} hotelId - Hotel ID
   * @param {string} period - Period (7d, 30d, 90d, 1y)
   * @returns {Promise}
   */
  async getBookingTrends(hotelId, period = '30d') {
    try {
      const response = await api.get(`/revenue/hotel/${hotelId}/trends`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch booking trends');
    }
  },

  /**
   * ========================================================================
   * UTILITY METHODS
   * ========================================================================
   */

  /**
   * Format currency value
   * @param {number} value - Value to format
   * @param {string} currency - Currency code (default: VND)
   * @returns {string}
   */
  formatCurrency(value, currency = 'VND') {
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value);
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(value);
  },

  /**
   * Calculate growth rate
   * @param {number} current - Current value
   * @param {number} previous - Previous value
   * @returns {number} Growth rate percentage
   */
  calculateGrowthRate(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }
};

// Export utility functions as standalone exports
export const formatCurrency = (value, currency = 'VND') => {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(value);
};

export const calculateGrowthRate = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export default revenueService;
export { revenueService };
