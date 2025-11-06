/**
 * Optimized Authentication Middleware for CheckInn Hotel Booking Platform
 * 
 * Balance giữa security features và performance
 * Optional tracking để tránh errors khi utils chưa ready
 * 
 * @author CheckInn Team
 * @version 2.0.0 - Optimized
 */

const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { promisify } = require('util');
const User = require('../models/User.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Optional dependencies - không crash nếu không tồn tại
let ActivityTracker = null;
let FraudDetection = null;
try {
  ActivityTracker = require('../utils/activityTracker');
  FraudDetection = require('../utils/fraudDetection');
} catch (error) {
  console.warn('⚠️ ActivityTracker/FraudDetection not available. Running in basic mode.');
}

/**
 * ============================================================================
 * CORE AUTHENTICATION MIDDLEWARE
 * ============================================================================
 */

/**
 * Protect routes - Optimized JWT verification với optional tracking
 */
const protect = catchAsync(async (req, res, next) => {
  // 1) Extract token từ multiple sources (Bearer, cookies, query)
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  } else if (req.query?.token) {
    // Allow token in query for special cases (email verification)
    token = req.query.token;
  }

  if (!token) {
    return next(new AppError('Authentication required. Please log in to access this resource.', 401));
  }

  try {
    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user exists - single optimized query
    const currentUser = await User.findById(decoded.id)
      .select('+active +status +loginAttempts +lockUntil +passwordChangedAt');
    
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 4) Security checks - order by likelihood để fail fast
    if (!currentUser.active) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 403));
    }

    if (currentUser.status === 'suspended') {
      return next(new AppError('Phiên đăng nhập của bạn đã bị tạm dừng do tài khoản bị khóa. Vui lòng liên hệ bộ phận hỗ trợ.', 403));
    }
    
    if (currentUser.status === 'inactive') {
      return next(new AppError('Phiên đăng nhập của bạn đã bị tạm dừng do tài khoản không hoạt động. Vui lòng liên hệ bộ phận hỗ trợ.', 403));
    }

    if (currentUser.isLocked) {
      return next(new AppError('Account temporarily locked due to too many failed login attempts. Try again later.', 423));
    }

    // 5) Check if password changed after token issued
    if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('Password recently changed. Please log in again.', 401));
    }

    // 6) Optional: Fraud detection (chỉ chạy nếu có FraudDetection)
    if (FraudDetection) {
      const deviceInfo = {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date()
      };

      try {
        const suspiciousActivity = await FraudDetection.checkSuspiciousLogin(currentUser._id, deviceInfo);
        if (suspiciousActivity.isSuspicious && suspiciousActivity.riskLevel > 80) {
          // Optional: Log suspicious activity
          if (ActivityTracker) {
            ActivityTracker.trackActivity({
              activityType: 'suspicious_login_blocked',
              req,
              userId: currentUser._id,
              customData: {
                riskLevel: suspiciousActivity.riskLevel,
                reasons: suspiciousActivity.reasons
              }
            }).catch(err => console.error('ActivityTracker error:', err));
          }

          return next(new AppError('Suspicious activity detected. Please verify your identity.', 403));
        }
      } catch (fraudError) {
        // Don't block user nếu fraud detection fails
        console.error('FraudDetection error:', fraudError.message);
      }
    }

    // 7) Update last activity - non-blocking fire-and-forget
    User.findByIdAndUpdate(decoded.id, {
      lastActive: new Date(),
      lastIP: req.ip
    }).exec().catch(err => console.error('Update lastActive error:', err));

    // 8) Optional: Track auth success (non-blocking)
    if (ActivityTracker) {
      ActivityTracker.trackActivity({
        activityType: 'auth_success',
        req,
        userId: currentUser._id,
        customData: { authMethod: 'jwt' }
      }).catch(err => console.error('ActivityTracker error:', err));
    }

    // Grant access
    req.user = currentUser;
    next();

  } catch (error) {
    // Optional: Track failure (non-blocking)
    if (ActivityTracker) {
      ActivityTracker.trackActivity({
        activityType: 'auth_failed',
        req,
        customData: {
          error: error.message,
          errorType: error.name
        }
      }).catch(err => console.error('ActivityTracker error:', err));
    }

    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    } else if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }
    return next(new AppError('Authentication failed.', 401));
  }
});

/**
 * ============================================================================
 * AUTHORIZATION MIDDLEWARE
 * ============================================================================
 */

/**
 * Role-based authorization - Optimized with optional tracking
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Fast sync check
    if (!req.user) {
      return next(new AppError('Authentication required before authorization.', 401));
    }

    // Normalize user roles: support `role` (string) or `roles` (array)
    let userRoles = [];
    if (Array.isArray(req.user.roles) && req.user.roles.length) {
      userRoles = req.user.roles.map(r => String(r).toLowerCase());
    } else if (req.user.role) {
      userRoles = [String(req.user.role).toLowerCase()];
    }

    const allowed = roles.map(r => String(r).toLowerCase());

    const hasRole = userRoles.some(ur => allowed.includes(ur));

    if (!hasRole) {
      // Optional: Track unauthorized attempt (non-blocking)
      if (ActivityTracker) {
        ActivityTracker.trackActivity({
          activityType: 'unauthorized_access_attempt',
          req,
          userId: req.user._id,
          customData: {
            requiredRoles: roles,
            userRoles: userRoles,
            rawUserRole: req.user.role,
            resource: req.route?.path
          }
        }).catch(err => console.error('ActivityTracker error:', err));
      }

      // Emit a helpful console message to aid debugging in dev
      console.warn(`Authorization denied. Required: ${roles.join(', ')}. User roles: ${userRoles.join(', ') || 'none'}. User id: ${req.user._id}`);

      return next(new AppError('Insufficient permissions for this action.', 403));
    }

    // Optional: Track authorized access (non-blocking)
    if (ActivityTracker) {
      ActivityTracker.trackActivity({
        activityType: 'authorized_access',
        req,
        userId: req.user._id,
        customData: {
          role: req.user.role,
          resource: req.route?.path
        }
      }).catch(err => console.error('ActivityTracker error:', err));
    }

    next();
  };
};

/**
 * Optional authentication - không fail nếu token invalid
 */
const optionalAuth = catchAsync(async (req, res, next) => {
  let token;
  
  // Extract token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id).select('+active +status +passwordChangedAt');
      
      // Validate user
      if (currentUser && 
          currentUser.active && 
          currentUser.status === 'active' &&
          (!currentUser.changedPasswordAfter || !currentUser.changedPasswordAfter(decoded.iat))) {
        req.user = currentUser;
        
        // Update last activity (non-blocking)
        User.findByIdAndUpdate(decoded.id, {
          lastActive: new Date(),
          lastIP: req.ip
        }).exec().catch(err => console.error('Update lastActive error:', err));
      }
    } catch (error) {
      // Invalid token - continue without user context
      req.user = null;
    }
  }
  
  next();
});

/**
 * ============================================================================
 * RESOURCE OWNERSHIP MIDDLEWARE
 * ============================================================================
 */

/**
 * Check resource ownership - Optimized với fast paths
 */
const checkOwnership = (Model, options = {}) => {
  const {
    resourceField = 'id',
    ownerField = 'owner',
    allowAdmin = true,
    allowSelf = false
  } = options;

  return catchAsync(async (req, res, next) => {
    const resourceId = req.params[resourceField];
    
    if (!resourceId) {
      return next(new AppError('Resource ID is required.', 400));
    }

    // Fast path: Admin bypass (nếu enabled)
    if (allowAdmin && req.user.role === 'Admin') {
      // Optionally load resource nếu cần
      if (Model) {
        const resource = await Model.findById(resourceId);
        req.resource = resource;
      }
      return next();
    }

    // Fast path: Self ownership (for user profiles)
    if (allowSelf && resourceId === req.user._id.toString()) {
      req.resource = req.user; // User already loaded
      return next();
    }

    // Load resource và check ownership
    const resource = await Model.findById(resourceId);
    if (!resource) {
      return next(new AppError('Resource not found.', 404));
    }

    const ownerId = resource[ownerField] || resource.user || resource.createdBy;
    if (!ownerId || ownerId.toString() !== req.user._id.toString()) {
      // Optional: Track unauthorized access (non-blocking)
      if (ActivityTracker) {
        ActivityTracker.trackActivity({
          activityType: 'unauthorized_resource_access',
          req,
          userId: req.user._id,
          customData: {
            resourceType: Model.modelName,
            resourceId,
            attemptedAction: req.method
          }
        }).catch(err => console.error('ActivityTracker error:', err));
      }

      return next(new AppError('You can only access resources that you own.', 403));
    }

    req.resource = resource;
    next();
  });
};

/**
 * ============================================================================
 * ADVANCED SECURITY MIDDLEWARE
 * ============================================================================
 */

/**
 * Granular permission check - Optimized sync operation
 */
const checkPermission = (action, resource) => {
  return (req, res, next) => {
    const user = req.user;

    // Fast path: Admin bypass
    if (user.role === 'Admin') {
      return next();
    }

    // Check specific permission
    const permissions = user.permissions || [];
    const hasPermission = permissions.some(permission => 
      permission.action === action && permission.resource === resource
    );

    if (!hasPermission) {
      // Optional: Track denial (non-blocking)
      if (ActivityTracker) {
        ActivityTracker.trackActivity({
          activityType: 'permission_denied',
          req,
          userId: user._id,
          customData: {
            requiredAction: action,
            requiredResource: resource,
            userPermissions: permissions
          }
        }).catch(err => console.error('ActivityTracker error:', err));
      }

      return next(new AppError(`Permission denied for ${action} on ${resource}.`, 403));
    }

    next();
  };
};

/**
 * Rate limiting cho authentication routes
 */
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    // Optional: Track rate limit (non-blocking)
    if (ActivityTracker) {
      ActivityTracker.trackActivity({
        activityType: 'auth_rate_limit_hit',
        req,
        customData: {
          ip: req.ip,
          userAgent: req.get('User-Agent')
        }
      }).catch(err => console.error('ActivityTracker error:', err));
    }

    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
      retryAfter: req.rateLimit.resetTime ? Math.round(req.rateLimit.resetTime / 1000) : 900
    });
  }
});

/**
 * Verify email before sensitive operations - Fast sync check
 */
const requireVerifiedEmail = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }
  
  if (!req.user.emailVerified) {
    return next(new AppError('Email verification required for this action.', 403));
  }
  
  next();
};

/**
 * Simple authenticated check (alternative to protect for simpler cases)
 */
const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }
  next();
};

module.exports = {
  protect,
  restrictTo,
  optionalAuth,
  checkOwnership,
  checkPermission,
  authRateLimit,
  requireVerifiedEmail,
  isAuthenticated
};
