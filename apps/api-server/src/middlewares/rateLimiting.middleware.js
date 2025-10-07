/**
 * Simple Rate Limiting Middleware for CheckInn Hotel Booking Platform
 * 
 * Simplified rate limiting without complex configurations that cause errors
 * 
 * @author CheckInn Team
 * @version 2.0.0 - Fixed
 */

const rateLimit = require('express-rate-limit');

/**
 * ============================================================================
 * BASIC RATE LIMITERS
 * ============================================================================
 */

/**
 * General API rate limiting
 */
const basic = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Authentication endpoints rate limiting
 */
const auth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    error: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Password reset rate limiting
 */
const passwordReset = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.',
    error: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * API endpoints rate limiting
 */
const api = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs for API endpoints
  message: {
    success: false,
    message: 'Too many API requests, please try again later.',
    error: 'API_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * File upload rate limiting
 */
const upload = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 file uploads per hour
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.',
    error: 'UPLOAD_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * ============================================================================
 * MIDDLEWARE BUNDLE EXPORTS
 * ============================================================================
 */

module.exports = {
  basic,
  auth,
  passwordReset,
  api,
  upload,
  
  // Aliases for backward compatibility
  general: basic,
  authentication: auth,
  apiLimit: api
};