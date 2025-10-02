/**
 * Middleware Index for CheckInn Hotel Booking Platform
 * 
 * Centralized middleware configuration và exports
 * cho easy import và consistent usage across the application
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const authMiddleware = require('./auth.middleware');
const validationMiddleware = require('./validation.middleware');
const loggingMiddleware = require('./logging.middleware');
const rateLimiting = require('./rateLimiting.middleware.simple');
const securityMiddleware = require('./security.middleware');
const errorController = require('../controllers/error.controller');

/**
 * ============================================================================
 * MIDDLEWARE BUNDLES
 * ============================================================================
 */

/**
 * Essential security middleware bundle
 * Applied to all routes for basic protection
 */
const essentialSecurity = [
  securityMiddleware.securityHeaders,
  securityMiddleware.cors,
  securityMiddleware.xssProtection,
  securityMiddleware.mongoSanitize,
  securityMiddleware.hppProtection,
  securityMiddleware.intelligentCompression
];

/**
 * Advanced security middleware bundle
 * For sensitive routes requiring extra protection
 */
const advancedSecurity = [
  ...essentialSecurity,
  securityMiddleware.detectSuspiciousActivity,
  securityMiddleware.securityMonitor
];

/**
 * Authentication middleware bundle
 * For protected routes
 */
const authentication = [
  authMiddleware.protect
];

/**
 * Optional authentication middleware bundle
 * For public routes that can benefit from user context
 */
const optionalAuthentication = [
  authMiddleware.optionalAuth
];

/**
 * Logging middleware bundle
 * For request/response tracking
 */
const logging = [
  loggingMiddleware.requestLogger,
  loggingMiddleware.advancedRequestLogger
];

/**
 * Standard rate limiting bundle
 * For general API protection
 */
const standardRateLimit = [
  rateLimitingMiddleware.generalRateLimit,
  rateLimitingMiddleware.progressiveSlowDown,
  rateLimitingMiddleware.rateLimitMonitor
];

/**
 * Strict rate limiting bundle
 * For sensitive operations
 */
const strictRateLimit = [
  rateLimitingMiddleware.authRateLimit,
  rateLimitingMiddleware.rateLimitMonitor
];

/**
 * ============================================================================
 * ROUTE-SPECIFIC MIDDLEWARE CONFIGURATIONS
 * ============================================================================
 */

/**
 * Public routes middleware
 * For completely open endpoints
 */
const publicRoutes = [
  ...essentialSecurity,
  ...logging,
  ...optionalAuthentication,
  standardRateLimit[0], // General rate limit only
  rateLimitingMiddleware.rateLimitMonitor
];

/**
 * Protected routes middleware
 * For authenticated user endpoints
 */
const protectedRoutes = [
  ...essentialSecurity,
  ...logging,
  ...authentication,
  ...standardRateLimit
];

/**
 * Admin routes middleware
 * For administrative endpoints
 */
const adminRoutes = [
  ...advancedSecurity,
  ...logging,
  ...authentication,
  authMiddleware.restrictTo('Admin'),
  rateLimitingMiddleware.dynamicRateLimit(500),
  rateLimitingMiddleware.rateLimitMonitor
];

/**
 * Authentication routes middleware
 * For login/register endpoints
 */
const authRoutes = [
  ...essentialSecurity,
  ...logging,
  ...strictRateLimit,
  securityMiddleware.detectSuspiciousActivity
];

/**
 * File upload routes middleware
 * For upload endpoints
 */
const fileUploadRoutes = [
  ...advancedSecurity,
  ...logging,
  ...authentication,
  rateLimitingMiddleware.uploadRateLimit,
  securityMiddleware.secureFileUpload.validateFileType(),
  securityMiddleware.secureFileUpload.scanForMalware,
  rateLimitingMiddleware.rateLimitMonitor
];

/**
 * Booking routes middleware
 * For booking-related endpoints
 */
const bookingRoutes = [
  ...advancedSecurity,
  ...logging,
  ...authentication,
  rateLimitingMiddleware.bookingRateLimit,
  authMiddleware.requireVerifiedEmail,
  rateLimitingMiddleware.rateLimitMonitor
];

/**
 * Search routes middleware
 * For search endpoints
 */
const searchRoutes = [
  ...essentialSecurity,
  ...logging,
  ...optionalAuthentication,
  rateLimitingMiddleware.searchRateLimit,
  rateLimitingMiddleware.rateLimitMonitor
];

/**
 * ============================================================================
 * VALIDATION MIDDLEWARE SETS
 * ============================================================================
 */

/**
 * User validation middleware
 */
const userValidation = {
  register: [
    validationMiddleware.validateUserRegistration,
    validationMiddleware.sanitizeHtml(['name'])
  ],
  login: [
    validationMiddleware.validateUserLogin
  ],
  update: [
    validationMiddleware.validateUserUpdate,
    validationMiddleware.sanitizeHtml(['name'])
  ]
};

/**
 * Hotel validation middleware
 */
const hotelValidation = {
  create: [
    validationMiddleware.validateHotelCreate,
    validationMiddleware.sanitizeHtml(['name', 'description'])
  ],
  search: [
    validationMiddleware.validateHotelSearch
  ]
};

/**
 * Room validation middleware
 */
const roomValidation = {
  create: [
    validationMiddleware.validateRoomCreate,
    validationMiddleware.sanitizeHtml(['name', 'description'])
  ],
  availability: [
    validationMiddleware.validateRoomAvailability
  ]
};

/**
 * Booking validation middleware
 */
const bookingValidation = {
  create: [
    validationMiddleware.validateBookingCreate
  ]
};

/**
 * Review validation middleware
 */
const reviewValidation = {
  create: [
    validationMiddleware.validateReviewCreate,
    validationMiddleware.sanitizeHtml(['reviewText'])
  ]
};

/**
 * ============================================================================
 * UTILITY MIDDLEWARE FUNCTIONS
 * ============================================================================
 */

/**
 * Apply middleware array to router
 */
const applyMiddleware = (router, middlewareArray) => {
  middlewareArray.forEach(middleware => {
    if (typeof middleware === 'function') {
      router.use(middleware);
    }
  });
  return router;
};

/**
 * Create custom middleware stack
 */
const createMiddlewareStack = (...middlewareGroups) => {
  return middlewareGroups.flat();
};

/**
 * Conditional middleware - apply only if condition is met
 */
const conditional = (condition, middleware) => {
  return (req, res, next) => {
    if (condition(req)) {
      return middleware(req, res, next);
    }
    next();
  };
};

/**
 * ============================================================================
 * EXPORTS
 * ============================================================================
 */

module.exports = {
  // Individual middleware modules
  auth: authMiddleware,
  validation: validationMiddleware,
  logging: loggingMiddleware,
  rateLimit: rateLimitingMiddleware,
  security: securityMiddleware,
  errorHandler: errorController,

  // Middleware bundles
  bundles: {
    essentialSecurity,
    advancedSecurity,
    authentication,
    optionalAuthentication,
    logging,
    standardRateLimit,
    strictRateLimit
  },

  // Route-specific configurations
  routes: {
    public: publicRoutes,
    protected: protectedRoutes,
    admin: adminRoutes,
    auth: authRoutes,
    fileUpload: fileUploadRoutes,
    booking: bookingRoutes,
    search: searchRoutes
  },

  // Validation sets
  validation: {
    user: userValidation,
    hotel: hotelValidation,
    room: roomValidation,
    booking: bookingValidation,
    review: reviewValidation
  },

  // Utility functions
  utils: {
    applyMiddleware,
    createMiddlewareStack,
    conditional
  }
};