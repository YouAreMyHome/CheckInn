/**
 * Simple Rate Limiting Middleware for CheckInn Hotel Booking Platform
 * 
 * Basic rate limiting functions để fix middleware dependencies
 * 
 * @author CheckInn Team
 * @version 2.0.0 - Simple
 */

const rateLimit = require('express-rate-limit');

/**
 * ============================================================================
 * BASIC RATE LIMITING
 * ============================================================================
 */

// Basic rate limiter
const basicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Auth rate limiter
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    error: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Pass-through middlewares
const progressiveSlowDown = (req, res, next) => next();
const rateLimitMonitor = (req, res, next) => next();

/**
 * ============================================================================
 * EXPORTS
 * ============================================================================
 */

module.exports = {
  generalRateLimit: basicRateLimit,
  authRateLimit,
  progressiveSlowDown,
  rateLimitMonitor,
  
  // Aliases
  basic: basicRateLimit,
  auth: authRateLimit
};