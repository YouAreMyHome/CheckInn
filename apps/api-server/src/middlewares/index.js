/**
 * Main Middleware Index for CheckInn Hotel Booking Platform
 * 
 * Complete middleware configuration với full functionality
 * 
 * @author CheckInn Team
 * @version 2.0.0
 */

const rateLimiting = require('./rateLimiting.middleware');
const securityMiddleware = require('./security.middleware');
const loggingMiddleware = require('./logging.middleware');
const errorController = require('../controllers/error.controller');
const checkPartnerVerified = require('./checkPartnerVerified.middleware');

/**
 * ============================================================================
 * SIMPLE MIDDLEWARE BUNDLES
 * ============================================================================
 */

// Basic security bundle
const basicSecurity = [
  securityMiddleware.securityHeaders,
  securityMiddleware.cors
];

// Basic logging bundle
const basicLogging = [
  loggingMiddleware.requestLogger
];

// Basic rate limiting bundle
const basicRateLimit = [
  rateLimiting.basic
];

/**
 * ============================================================================
 * EXPORTS
 * ============================================================================
 */

// Import additional middleware for authentication
let authMiddleware, authSimpleMiddleware, validationMiddleware;

try {
  authMiddleware = require('./auth.middleware');
  console.log('✅ Auth middleware (optimized) loaded');
} catch (error) {
  console.log('⚠️  Auth middleware not found:', error.message);
}

try {
  authSimpleMiddleware = require('./auth.simple.middleware');
  console.log('✅ Auth simple middleware (fallback) loaded');
} catch (error) {
  console.log('⚠️  Auth simple middleware not found:', error.message);
}

try {
  validationMiddleware = require('./validation.middleware');
  console.log('✅ Validation middleware loaded');
} catch (error) {
  console.log('⚠️  Validation middleware not found:', error.message);
}

module.exports = {
  // Individual middleware
  rateLimiting: {
    ...rateLimiting,
    auth: rateLimiting.basic // Alias for auth rate limiting
  },
  security: securityMiddleware,
  logging: loggingMiddleware,
  errorHandler: errorController.globalErrorHandler,
  checkPartnerVerified, // NEW: Partner verification check
  
  // Authentication middleware (use optimized middleware as default, fallback to simple)
  auth: authMiddleware || authSimpleMiddleware || {
    protect: (req, res, next) => {
      res.status(501).json({ error: 'Auth middleware not available' });
    },
    restrictTo: (...roles) => (req, res, next) => {
      res.status(501).json({ error: 'Auth middleware not available' });
    }
  },
  
  // Validation middleware
  validation: validationMiddleware || {
    validateRegister: (req, res, next) => next(),
    validateLogin: (req, res, next) => next(),
    validateEmail: (req, res, next) => next(),
    validatePasswordReset: (req, res, next) => next(),
    validatePasswordUpdate: (req, res, next) => next(),
    validateUserUpdate: (req, res, next) => next()
  },
  
  // Middleware bundles
  basicSecurity,
  basicLogging,
  basicRateLimit,
  
  // Utilities
  utils: {
    applyMiddleware: (router, middlewares) => {
      if (Array.isArray(middlewares)) {
        middlewares.forEach(middleware => {
          if (typeof middleware === 'function') {
            router.use(middleware);
          }
        });
      }
    }
  },
  
  // Route-specific middleware bundles
  routes: {
    protected: authMiddleware ? [authMiddleware.protect] : [],
    booking: authMiddleware ? [authMiddleware.protect] : []
  },
  
  // Aliases for compatibility
  rateLimit: rateLimiting,
  
  // Setup functions
  setupGlobalErrorHandlers: errorController.setupGlobalErrorHandlers
};