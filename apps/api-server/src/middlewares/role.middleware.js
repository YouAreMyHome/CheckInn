/**
 * Role-based Access Control Middleware
 * 
 * Restricts access to routes based on user roles
 * Used after authentication middleware
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const AppError = require('../utils/appError');

/**
 * Restrict access to specific roles
 * @param {...string} roles - Allowed roles
 * @returns {Function} Express middleware function
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user exists (should be set by auth middleware)
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Check if user is admin
 * Convenience function for admin-only routes
 */
const adminOnly = restrictTo('Admin');

/**
 * Check if user is hotel partner or admin
 * For hotel management routes
 */
const hotelManagerOrAdmin = restrictTo('HotelPartner', 'Admin');

/**
 * Check if user owns the resource or is admin
 * @param {string} resourceIdField - Field name containing resource owner ID
 */
const ownerOrAdmin = (resourceIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Admin can access everything
    if (req.user.role === 'Admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceOwnerId = req.params.userId || req.body[resourceIdField] || req.user._id;
    
    if (req.user._id.toString() !== resourceOwnerId.toString()) {
      return next(new AppError('Access denied. You can only access your own resources', 403));
    }

    next();
  };
};

/**
 * Dynamic role checker
 * Allows checking multiple role combinations
 */
const checkRole = (roleConfig) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    let hasAccess = false;

    if (Array.isArray(roleConfig)) {
      // Simple array of roles
      hasAccess = roleConfig.includes(req.user.role);
    } else if (typeof roleConfig === 'object') {
      // Complex role configuration
      const userRole = req.user.role;
      
      if (roleConfig.allow && roleConfig.allow.includes(userRole)) {
        hasAccess = true;
      }
      
      if (roleConfig.deny && roleConfig.deny.includes(userRole)) {
        hasAccess = false;
      }
      
      // Check conditions
      if (roleConfig.conditions) {
        for (const condition of roleConfig.conditions) {
          if (condition.role === userRole && condition.check(req)) {
            hasAccess = condition.allow;
            break;
          }
        }
      }
    }

    if (!hasAccess) {
      return next(new AppError('Access denied. Insufficient permissions', 403));
    }

    next();
  };
};

module.exports = {
  restrictTo,
  adminOnly,
  hotelManagerOrAdmin,
  ownerOrAdmin,
  checkRole
};