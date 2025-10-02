/**
 * Enhanced Authentication Middleware for CheckInn Hotel Booking Platform
 * 
 * Comprehensive authentication và authorization với security features,
 * session management, và activity tracking
 * 
 * @author CheckInn Team
 * @version 2.0.0
 */

const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { promisify } = require('util');
const User = require('../models/User.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIResponse = require('../utils/apiResponse');
const ActivityTracker = require('../utils/activityTracker');
const FraudDetection = require('../utils/fraudDetection');

/**
 * ============================================================================
 * CORE AUTHENTICATION MIDDLEWARE
 * ============================================================================
 */

/**
 * Protect routes - verify JWT token với enhanced security
 */
const protect = catchAsync(async (req, res, next) => {
  const startTime = Date.now();
  
  // 1) Extract token từ multiple sources
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.query.token) {
    // Allow token in query for special cases (like email verification links)
    token = req.query.token;
  }

  if (!token) {
    return next(new AppError('Authentication required. Please log in to access this resource.', 401));
  }

  try {
    // 2) Verify token và decode payload
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id).select('+active +loginAttempts +lockUntil');
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 4) Check if account is locked
    if (currentUser.isLocked) {
      return next(new AppError('Account temporarily locked due to too many failed login attempts. Try again later.', 423));
    }

    // 5) Check if user is active
    if (!currentUser.active) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 403));
    }

    // 6) Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('Password recently changed. Please log in again.', 401));
    }

    // 7) Security checks - detect suspicious activity
    const deviceInfo = {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    };

    const suspiciousActivity = await FraudDetection.checkSuspiciousLogin(currentUser._id, deviceInfo);
    if (suspiciousActivity.isSuspicious && suspiciousActivity.riskLevel > 80) {
      // Log suspicious activity
      await ActivityTracker.trackActivity({
        activityType: 'suspicious_login_blocked',
        req,
        userId: currentUser._id,
        customData: {
          riskLevel: suspiciousActivity.riskLevel,
          reasons: suspiciousActivity.reasons
        }
      });

      return next(new AppError('Suspicious activity detected. Please verify your identity.', 403));
    }

    // 8) Update last activity
    await User.findByIdAndUpdate(decoded.id, {
      lastActive: new Date(),
      lastIP: req.ip,
      'deviceInfo.lastSeen': new Date()
    });

    // 9) Track authentication success
    const authTime = Date.now() - startTime;
    await ActivityTracker.trackActivity({
      activityType: 'auth_success',
      req,
      userId: currentUser._id,
      customData: {
        authMethod: 'jwt',
        authTime,
        deviceInfo
      }
    });

    // Grant access
    req.user = currentUser;
    req.authTime = authTime;
    next();

  } catch (error) {
    // Track authentication failure
    await ActivityTracker.trackActivity({
      activityType: 'auth_failure',
      req,
      customData: {
        error: error.message,
        tokenProvided: !!token
      }
    });

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
 * Role-based authorization với enhanced permissions
 */
const restrictTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required before authorization.', 401));
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      // Track unauthorized access attempt
      await ActivityTracker.trackActivity({
        activityType: 'unauthorized_access_attempt',
        req,
        userId: req.user._id,
        customData: {
          requiredRoles: roles,
          userRole: req.user.role,
          resource: req.route?.path
        }
      });

      return next(new AppError('Insufficient permissions for this action.', 403));
    }

    // Track authorized access
    await ActivityTracker.trackActivity({
      activityType: 'authorized_access',
      req,
      userId: req.user._id,
      customData: {
        role: req.user.role,
        resource: req.route?.path
      }
    });

    next();
  });
};

/**
 * Optional authentication for public routes với user context
 */
const optionalAuth = catchAsync(async (req, res, next) => {
  let token;
  
  // Extract token từ multiple sources
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id).select('+active');
      
      if (currentUser && currentUser.active && !currentUser.changedPasswordAfter(decoded.iat)) {
        req.user = currentUser;
        
        // Update last activity for authenticated users
        await User.findByIdAndUpdate(decoded.id, {
          lastActive: new Date(),
          lastIP: req.ip
        });
      }
    } catch (error) {
      // Invalid token but continue without user context
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
 * Check resource ownership với flexible ownership patterns
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

    // Find the resource
    const resource = await Model.findById(resourceId);
    if (!resource) {
      return next(new AppError('Resource not found.', 404));
    }

    // Admin bypass (if allowed)
    if (allowAdmin && req.user.role === 'Admin') {
      req.resource = resource;
      return next();
    }

    // Self ownership check (for user profiles)
    if (allowSelf && resourceId === req.user._id.toString()) {
      req.resource = resource;
      return next();
    }

    // Resource ownership check
    const ownerId = resource[ownerField] || resource.user || resource.createdBy;
    if (!ownerId || ownerId.toString() !== req.user._id.toString()) {
      // Track unauthorized resource access
      await ActivityTracker.trackActivity({
        activityType: 'unauthorized_resource_access',
        req,
        userId: req.user._id,
        customData: {
          resourceType: Model.modelName,
          resourceId,
          attemptedAction: req.method
        }
      });

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
 * Enhanced permission check với granular controls
 */
const checkPermission = (action, resource) => {
  return catchAsync(async (req, res, next) => {
    const user = req.user;
    const permissions = user.permissions || [];

    // Admin bypass
    if (user.role === 'Admin') {
      return next();
    }

    // Check specific permission
    const hasPermission = permissions.some(permission => 
      permission.action === action && permission.resource === resource
    );

    if (!hasPermission) {
      await ActivityTracker.trackActivity({
        activityType: 'permission_denied',
        req,
        userId: user._id,
        customData: {
          requiredAction: action,
          requiredResource: resource,
          userPermissions: permissions
        }
      });

      return next(new AppError(`Permission denied for ${action} on ${resource}.`, 403));
    }

    next();
  });
};

/**
 * Rate limiting cho authentication routes
 */
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    ActivityTracker.trackActivity({
      activityType: 'auth_rate_limit_hit',
      req,
      customData: {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Verify user email before sensitive operations
 */
const requireVerifiedEmail = catchAsync(async (req, res, next) => {
  if (!req.user.emailVerified) {
    return next(new AppError('Email verification required for this action.', 403));
  }
  next();
});

module.exports = {
  protect,
  restrictTo,
  optionalAuth,
  checkOwnership,
  checkPermission,
  authRateLimit,
  requireVerifiedEmail
};
