/**
 * Partner Service for CheckInn Hotel Booking Platform
 * 
 * Handles all partner/hotel-manager API calls
 * - Registration & onboarding
 * - Dashboard analytics
 * - Earnings tracking
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

import api from './api';

const partnerService = {
  /**
   * ========================================================================
   * REGISTRATION & ONBOARDING
   * ========================================================================
   */

  /**
   * Register as hotel partner (complete - all steps at once)
   * NEW: Recommended approach
   * @param {Object} data - Complete registration data
   * @returns {Promise}
   */
  async registerComplete(data) {
    try {
      const response = await api.post('/partner/register-complete', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  /**
   * Register as hotel partner (legacy - step 1 only)
   * @deprecated Use registerComplete instead
   * @param {Object} data - Registration data
   * @returns {Promise}
   */
  async register(data) {
    try {
      const response = await api.post('/partner/register', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  /**
   * Get onboarding status
   * @returns {Promise}
   */
  async getOnboardingStatus() {
    try {
      const response = await api.get('/partner/onboarding-status');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch onboarding status');
    }
  },

  /**
   * Update business information
   * @param {Object} data - Business info data
   * @returns {Promise}
   */
  async updateBusinessInfo(data) {
    try {
      const response = await api.put('/partner/business-info', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update business info');
    }
  },

  /**
   * Update bank account
   * @param {Object} data - Bank account data
   * @returns {Promise}
   */
  async updateBankAccount(data) {
    try {
      const response = await api.put('/partner/bank-account', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update bank account');
    }
  },

  /**
   * Upload verification documents
   * @param {Array} documents - Array of {type, url}
   * @returns {Promise}
   */
  async uploadDocuments(documents) {
    try {
      const response = await api.post('/partner/documents', { documents });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload documents');
    }
  },

  /**
   * Complete onboarding process
   * @returns {Promise}
   */
  async completeOnboarding() {
    try {
      const response = await api.post('/partner/complete-onboarding');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to complete onboarding');
    }
  },

  /**
   * ========================================================================
   * DASHBOARD & ANALYTICS
   * ========================================================================
   */

  /**
   * Get partner dashboard data
   * @returns {Promise}
   */
  async getDashboard() {
    try {
      const response = await api.get('/partner/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  },

  /**
   * Get partner's hotels
   * @returns {Promise}
   */
  async getMyHotels() {
    try {
      const response = await api.get('/partner/hotels');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch hotels');
    }
  },

  /**
   * Get partner earnings
   * @param {Object} params - Query parameters {startDate, endDate}
   * @returns {Promise}
   */
  async getEarnings(params = {}) {
    try {
      const response = await api.get('/partner/earnings', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch earnings');
    }
  }
};

export default partnerService;
export { partnerService };
