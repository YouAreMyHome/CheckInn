/**
 * Enhanced Error Controller for CheckInn Hotel Booking Platform
 * 
 * Comprehensive error handling với detailed logging, user-friendly messages,
 * security considerations, và monitoring integration
 * 
 * @author CheckInn Team
 * @version 2.0.0
 */

const APIResponse = require('../utils/apiResponse');
const AppError = require('../utils/appError');
const { logger } = require('../middlewares/logging.middleware');
const ActivityTracker = require('../utils/activityTracker');

/**
 * ============================================================================
 * ERROR TYPE HANDLERS
 * ============================================================================
 */

/**
 * Handle MongoDB CastError (invalid ObjectId)
 */
const handleCastErrorDB = (err) => {
  const field = err.path === '_id' ? 'ID' : err.path;
  const message = `Invalid ${field} format: ${err.value}`;
  return new AppError(message, 400, {
    field: err.path,
    value: err.value,
    type: 'validation_error'
  });
};

/**
 * Handle MongoDB duplicate key error
 */
const handleDuplicateFieldsDB = (err) => {
  let field = 'field';
  let value = 'value';
  
  try {
    // Extract field name và value từ error
    if (err.keyValue) {
      field = Object.keys(err.keyValue)[0];
      value = Object.values(err.keyValue)[0];
    } else if (err.errmsg) {
      const match = err.errmsg.match(/index: (.+?)_/);
      field = match ? match[1] : 'field';
      const valueMatch = err.errmsg.match(/dup key: { (.+?) }/);
      value = valueMatch ? valueMatch[1] : 'value';
    }
  } catch (e) {
    logger.error('Error parsing duplicate key error', { error: e.message });
  }

  // User-friendly messages cho common fields
  const fieldMessages = {
    email: 'This email address is already registered. Please use a different email or try logging in.',
    username: 'This username is already taken. Please choose a different username.',
    phone: 'This phone number is already registered.',
    name: 'A hotel with this name already exists in this location.'
  };

  const message = fieldMessages[field] || `The ${field} '${value}' is already in use. Please choose a different value.`;
  
  return new AppError(message, 409, {
    field,
    value,
    type: 'duplicate_error'
  });
};

/**
 * Handle Mongoose validation errors
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(error => ({
    field: error.path,
    message: error.message,
    value: error.value,
    kind: error.kind
  }));

  const message = `Validation failed: ${errors.map(e => e.message).join('; ')}`;
  
  return new AppError(message, 400, {
    validationErrors: errors,
    type: 'validation_error'
  });
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => {
  return new AppError('Invalid authentication token. Please log in again.', 401, {
    type: 'authentication_error',
    action: 'login_required'
  });
};

const handleJWTExpiredError = () => {
  return new AppError('Your session has expired. Please log in again.', 401, {
    type: 'authentication_error',
    action: 'login_required',
    reason: 'token_expired'
  });
};

/**
 * Handle rate limiting errors
 */
const handleRateLimitError = (err) => {
  const retryAfter = err.retryAfter || 900; // 15 minutes default
  return new AppError('Too many requests. Please try again later.', 429, {
    type: 'rate_limit_error',
    retryAfter,
    action: 'wait_and_retry'
  });
};

/**
 * Handle file upload errors
 */
const handleMulterError = (err) => {
  const errorMap = {
    'LIMIT_FILE_SIZE': {
      message: 'File too large. Maximum size is 5MB per file.',
      maxSize: '5MB'
    },
    'LIMIT_FILE_COUNT': {
      message: 'Too many files. Maximum is 10 files per request.',
      maxFiles: 10
    },
    'LIMIT_FIELD_KEY': {
      message: 'Field name too long.',
      action: 'check_form_field_names'
    },
    'LIMIT_FIELD_VALUE': {
      message: 'Field value too long.',
      action: 'reduce_field_size'
    },
    'LIMIT_FIELD_COUNT': {
      message: 'Too many form fields.',
      action: 'reduce_form_complexity'
    },
    'LIMIT_UNEXPECTED_FILE': {
      message: 'Unexpected file field.',
      action: 'check_form_configuration'
    }
  };

  const errorInfo = errorMap[err.code] || {
    message: 'File upload error. Please try again.'
  };

  return new AppError(errorInfo.message, 400, {
    type: 'file_upload_error',
    code: err.code,
    field: err.field,
    ...errorInfo
  });
};

/**
 * Handle MongoDB connection errors
 */
const handleMongoNetworkError = (err) => {
  return new AppError('Database connection error. Please try again later.', 503, {
    type: 'database_error',
    action: 'retry_later'
  });
};

/**
 * Handle request timeout errors
 */
const handleTimeoutError = (err) => {
  return new AppError('Request timeout. The operation took too long to complete.', 408, {
    type: 'timeout_error',
    action: 'retry_request'
  });
};

/**
 * Handle CORS errors
 */
const handleCORSError = (err) => {
  return new AppError('Cross-origin request blocked. Please check your request origin.', 403, {
    type: 'cors_error',
    action: 'check_origin'
  });
};

/**
 * Handle payment errors
 */
const handlePaymentError = (err) => {
  const paymentErrorMap = {
    'card_declined': 'Your card was declined. Please try a different payment method.',
    'insufficient_funds': 'Insufficient funds. Please check your account balance.',
    'invalid_card': 'Invalid card details. Please check your card information.',
    'expired_card': 'Your card has expired. Please use a different card.',
    'processing_error': 'Payment processing error. Please try again or contact support.'
  };

  const message = paymentErrorMap[err.code] || 'Payment failed. Please try again or contact support.';
  
  return new AppError(message, 402, {
    type: 'payment_error',
    code: err.code,
    action: 'retry_payment'
  });
};

/**
 * ============================================================================
 * ERROR RESPONSE HANDLERS
 * ============================================================================
 */

/**
 * Development error handler - detailed error information
 */
const sendErrorDev = async (err, req, res) => {
  // Log error với full details
  logger.error('Development error', {
    type: 'dev-error',
    requestId: req.requestId,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode
    },
    request: {
      method: req.method,
      url: req.url,
      body: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers,
      user: req.user?.email
    }
  });

  // Track error in development
  await ActivityTracker.trackActivity({
    activityType: 'dev_error',
    req,
    userId: req.user?._id,
    customData: {
      errorName: err.name,
      errorMessage: err.message,
      statusCode: err.statusCode
    }
  });

  // Send detailed error response
  APIResponse.error(res, {
    message: err.message,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      isOperational: err.isOperational
    },
    request: {
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString()
    },
    details: err.details
  }, err.statusCode || 500);
};

/**
 * Production error handler - user-friendly error messages
 */
const sendErrorProd = async (err, req, res) => {
  // Generate error ID for tracking
  const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Log error với security considerations
  const logData = {
    type: 'prod-error',
    errorId,
    requestId: req.requestId,
    error: {
      name: err.name,
      message: err.message,
      statusCode: err.statusCode,
      isOperational: err.isOperational
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?._id,
      timestamp: new Date().toISOString()
    }
  };

  // Include stack trace only for server errors
  if (err.statusCode >= 500) {
    logData.error.stack = err.stack;
  }

  logger.error('Production error', logData);

  // Track error activity
  await ActivityTracker.trackActivity({
    activityType: 'prod_error',
    req,
    userId: req.user?._id,
    customData: {
      errorId,
      errorName: err.name,
      statusCode: err.statusCode,
      isOperational: err.isOperational
    }
  });

  // Prepare response based on error type
  if (err.isOperational) {
    // Operational errors - safe to send to client
    const response = {
      message: err.message,
      errorId,
      timestamp: new Date().toISOString()
    };

    // Add additional context if available
    if (err.details) {
      response.details = err.details;
    }

    // Add suggestions for specific error types
    if (err.statusCode === 400) {
      response.suggestion = 'Please check your request data and try again.';
    } else if (err.statusCode === 401) {
      response.suggestion = 'Please log in and try again.';
      response.action = 'login_required';
    } else if (err.statusCode === 403) {
      response.suggestion = 'You do not have permission for this action.';
    } else if (err.statusCode === 404) {
      response.suggestion = 'The requested resource was not found.';
    } else if (err.statusCode === 429) {
      response.suggestion = 'Please wait before making more requests.';
      response.retryAfter = err.details?.retryAfter || 900;
    }

    APIResponse.error(res, response, err.statusCode);
  } else {
    // Programming errors - don't leak sensitive information
    logger.error('Unhandled error in production', {
      errorId,
      error: err,
      stack: err.stack,
      request: logData.request
    });

    // Send generic error message
    APIResponse.error(res, {
      message: 'An unexpected error occurred. Please try again later.',
      errorId,
      timestamp: new Date().toISOString(),
      suggestion: 'If the problem persists, please contact support.',
      support: {
        email: 'support@checkin.com',
        phone: '+84 123 456 789'
      }
    }, 500);
  }
};

/**
 * Handle unhandled promise rejections
 */
const handleUnhandledRejection = (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    type: 'unhandled-rejection',
    reason: reason.message || reason,
    stack: reason.stack,
    promise: promise.toString()
  });
  
  // Graceful shutdown
  process.exit(1);
};

/**
 * Handle uncaught exceptions
 */
const handleUncaughtException = (error) => {
  logger.error('Uncaught Exception', {
    type: 'uncaught-exception',
    error: error.message,
    stack: error.stack
  });
  
  // Graceful shutdown
  process.exit(1);
};

/**
 * ============================================================================
 * MAIN ERROR HANDLING MIDDLEWARE
 * ============================================================================
 */

/**
 * Global error handling middleware
 */
const globalErrorHandler = async (err, req, res, next) => {
  // Prevent duplicate error handling
  if (res.headersSent) {
    return next(err);
  }

  // Set default error properties
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.timestamp = err.timestamp || new Date().toISOString();

  // Enhanced error logging
  const errorContext = {
    requestId: req.requestId,
    userId: req.user?._id,
    ip: req.ip,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    timestamp: err.timestamp
  };

  // Log error với appropriate level
  if (err.statusCode >= 500) {
    logger.error('Server Error', { ...errorContext, error: err });
  } else if (err.statusCode >= 400) {
    logger.warn('Client Error', { ...errorContext, error: { name: err.name, message: err.message } });
  }

  // Development environment - detailed errors
  if (process.env.NODE_ENV === 'development') {
    return await sendErrorDev(err, req, res);
  }

  // Production environment - handle và transform errors
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;

  // Transform known error types
  try {
    // MongoDB errors
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    } else if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    } else if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    } else if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
      error = handleMongoNetworkError(error);
    }
    
    // Authentication errors
    else if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    } else if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }
    
    // Upload errors
    else if (error.name === 'MulterError') {
      error = handleMulterError(error);
    }
    
    // Request errors
    else if (error.type === 'entity.too.large') {
      error = new AppError('Request body too large. Maximum size is 10MB.', 413, {
        type: 'request_size_error',
        maxSize: '10MB'
      });
    } else if (error.code === 'EBADCSRFTOKEN') {
      error = new AppError('Invalid CSRF token. Please refresh the page.', 403, {
        type: 'csrf_error',
        action: 'refresh_page'
      });
    }
    
    // Rate limiting errors
    else if (error.name === 'TooManyRequestsError') {
      error = handleRateLimitError(error);
    }
    
    // Timeout errors
    else if (error.code === 'ETIMEDOUT' || error.name === 'TimeoutError') {
      error = handleTimeoutError(error);
    }
    
    // CORS errors
    else if (error.name === 'CORSError') {
      error = handleCORSError(error);
    }
    
    // Payment errors
    else if (error.type === 'StripeCardError' || error.type === 'payment_error') {
      error = handlePaymentError(error);
    }
    
    // Generic syntax errors
    else if (error.name === 'SyntaxError') {
      error = new AppError('Invalid request format. Please check your request data.', 400, {
        type: 'syntax_error',
        action: 'check_request_format'
      });
    }

  } catch (handlingError) {
    // Error occurred while handling error - log và continue với original
    logger.error('Error in error handler', {
      originalError: err,
      handlingError,
      requestId: req.requestId
    });
    error = err;
  }

  // Send production error response
  await sendErrorProd(error, req, res);
};

/**
 * ============================================================================
 * ERROR SETUP FUNCTIONS
 * ============================================================================
 */

/**
 * Setup global error handlers
 */
const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  process.on('unhandledRejection', handleUnhandledRejection);
  
  // Handle uncaught exceptions
  process.on('uncaughtException', handleUncaughtException);
  
  logger.info('Global error handlers configured');
};

/**
 * ============================================================================
 * EXPORTS
 * ============================================================================
 */

module.exports = globalErrorHandler;
module.exports.setupGlobalErrorHandlers = setupGlobalErrorHandlers;
module.exports.handleCastErrorDB = handleCastErrorDB;
module.exports.handleDuplicateFieldsDB = handleDuplicateFieldsDB;
module.exports.handleValidationErrorDB = handleValidationErrorDB;
module.exports.handleJWTError = handleJWTError;
module.exports.handleJWTExpiredError = handleJWTExpiredError;
module.exports.handleMulterError = handleMulterError;
