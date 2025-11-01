/**
 * Simple Authentication Middleware for CheckInn
 * 
 * Basic JWT authentication without complex fraud detection
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * Simple protect middleware - verify JWT token
 */
const protect = catchAsync(async (req, res, next) => {
  // 1) Extract token
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Authentication required. Please log in to access this resource.', 401));
  }

  try {
    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists (include active and status fields)
    const currentUser = await User.findById(decoded.id).select('+active +status');
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 4) Check if user account is active
    if (currentUser.active === false) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 403));
    }

    // 5) Check user status
    if (currentUser.status === 'suspended') {
      return next(new AppError('Phiên đăng nhập của bạn đã bị tạm dừng do tài khoản bị khóa. Vui lòng liên hệ bộ phận hỗ trợ.', 403));
    }
    
    if (currentUser.status === 'inactive') {
      return next(new AppError('Phiên đăng nhập của bạn đã bị tạm dừng do tài khoản không hoạt động. Vui lòng liên hệ bộ phận hỗ trợ.', 403));
    }

    // 6) Add user to request
    req.user = currentUser;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    } else if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired. Please log in again.', 401));
    } else {
      return next(new AppError('Token verification failed.', 401));
    }
  }
});

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id).select('+active');
      
      if (currentUser && currentUser.active !== false) {
        req.user = currentUser;
      }
    } catch (error) {
      // Ignore token errors for optional auth
    }
  }

  next();
});

/**
 * Check if user is authenticated
 */
const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }
  next();
};

module.exports = {
  protect,
  optionalAuth,
  isAuthenticated
};