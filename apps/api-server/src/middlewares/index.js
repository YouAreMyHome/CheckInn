/**
 * Simple Middleware Index for CheckInn Hotel Booking Platform
 * 
 * Simplified middleware configuration với basic functionality
 * 
 * @author CheckInn Team
 * @version 2.0.0 - Simple
 */

const rateLimiting = require('./rateLimiting.middleware.simple');
const securityMiddleware = require('./security.middleware.simple');
const loggingMiddleware = require('./logging.middleware.simple');
const errorController = require('../controllers/error.controller.simple');

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

module.exports = {
  // Individual middleware
  rateLimiting,
  security: securityMiddleware,
  logging: loggingMiddleware,
  errorHandler: errorController.globalErrorHandler,
  
  // Middleware bundles
  basicSecurity,
  basicLogging,
  basicRateLimit,
  
  // Aliases for compatibility
  rateLimit: rateLimiting,
  
  // Setup functions
  setupGlobalErrorHandlers: errorController.setupGlobalErrorHandlers
};