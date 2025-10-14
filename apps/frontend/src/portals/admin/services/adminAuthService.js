// Admin Authentication Service
import { authService as baseAuthService } from '../../../shared/services/authService';

class AdminAuthService {
  // Admin login với validation role
  async adminLogin(email, password) {
    try {
      const result = await baseAuthService.login({ email, password });
      
      // Check if we got user data in the response
      if (!result.data || !result.data.user) {
        throw new Error('Invalid login response format');
      }
      
      // Verify admin role
      if (result.data.user.role !== 'Admin') {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(result.data.user));
      
      // Track admin login
      this.trackAdminActivity('login', {
        email,
        userId: result.data.user._id || result.data.user.id,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
      
      return result;
    } catch (error) {
      // Enhanced error logging for debugging
      console.error('Admin Login Error Details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request: { email, password: '***masked***' }
      });
      
      // Track failed admin login attempt
      this.trackAdminActivity('login_failed', {
        email,
        error: error.message,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
      
      throw error;
    }
  }

  // Admin forgot password
  async adminForgotPassword(email) {
    try {
      // Use base auth service for forgot password
      const result = await baseAuthService.forgotPassword(email);
      
      // Track admin password reset request
      this.trackAdminActivity('password_reset_requested', {
        email,
        timestamp: new Date().toISOString()
      });
      
      return result;
    } catch (error) {
      // Track failed password reset request
      this.trackAdminActivity('password_reset_failed', {
        email,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      throw new Error(error.message || 'Failed to send reset email');
    }
  }

  // Admin reset password
  async adminResetPassword(token, password, confirmPassword) {
    try {
      // Validate passwords match on client side
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // Use base auth service for password reset
      const result = await baseAuthService.resetPassword(token, password);
      
      // Track successful password reset
      this.trackAdminActivity('password_reset_completed', {
        timestamp: new Date().toISOString()
      });
      
      return result;
    } catch (error) {
      // Track failed password reset
      this.trackAdminActivity('password_reset_failed', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      throw new Error(error.message || 'Failed to reset password');
    }
  }

  // Validate reset token
  async validateResetToken(token) {
    try {
      // Use base auth service for token validation
      const result = await baseAuthService.validateResetToken(token);
      return result;
    } catch (error) {
      throw new Error(error.message || 'Invalid or expired token');
    }
  }

  // Admin logout với audit log
  async adminLogout() {
    try {
      const user = this.getCurrentUser();
      
      // Track admin logout
      if (user) {
        this.trackAdminActivity('logout', {
          userId: user._id || user.id,
          timestamp: new Date().toISOString()
        });
      }
      
      // Clear admin session data
      this.clearAdminSession();
      
      // Clear user data
      localStorage.removeItem('user');
      
      return await baseAuthService.logout();
    } catch (error) {
      console.error('Admin logout error:', error);
      // Even if logout fails, clear local data
      this.clearAdminSession();
      localStorage.removeItem('user');
      throw error;
    }
  }

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        return null;
      }
      
      // Handle case where data might be double-quoted
      let cleanedData = userData;
      if (userData.startsWith('""') && userData.endsWith('""')) {
        cleanedData = userData.slice(2, -2);
      } else if (userData.startsWith('"') && userData.endsWith('"') && userData.includes('"{')) {
        // Handle case where entire JSON is quoted as string
        cleanedData = userData.slice(1, -1);
      }
      
      // Try to parse the JSON
      const user = JSON.parse(cleanedData);
      return user;
      
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      console.log('Raw userData:', localStorage.getItem('user'));
      
      // Clear corrupted data
      localStorage.removeItem('user');
      return null;
    }
  }

  // Check if current user is admin
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'Admin';
  }

  // Track admin activities for audit log
  trackAdminActivity(activity, data = {}) {
    try {
      // Store in localStorage for now, should be sent to audit API
      const auditLogs = JSON.parse(localStorage.getItem('adminAuditLogs') || '[]');
      
      const logEntry = {
        id: Date.now(),
        activity,
        data,
        timestamp: new Date().toISOString(),
        sessionId: this.getSessionId()
      };
      
      auditLogs.push(logEntry);
      
      // Keep only last 100 entries to prevent localStorage overflow
      if (auditLogs.length > 100) {
        auditLogs.splice(0, auditLogs.length - 100);
      }
      
      localStorage.setItem('adminAuditLogs', JSON.stringify(auditLogs));
      
      // TODO: Send to audit API in production
      console.log('Admin Activity:', logEntry);
      
    } catch (error) {
      console.error('Failed to track admin activity:', error);
    }
  }

  // Get or create session ID for tracking
  getSessionId() {
    let sessionId = sessionStorage.getItem('adminSessionId');
    if (!sessionId) {
      sessionId = 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('adminSessionId', sessionId);
    }
    return sessionId;
  }

  // Get admin audit logs
  getAdminAuditLogs() {
    try {
      return JSON.parse(localStorage.getItem('adminAuditLogs') || '[]');
    } catch {
      return [];
    }
  }

  // Clear admin session data
  clearAdminSession() {
    sessionStorage.removeItem('adminSessionId');
    localStorage.removeItem('adminAuditLogs');
  }
}

export const adminAuthService = new AdminAuthService();