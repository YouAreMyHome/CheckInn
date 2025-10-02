/**
 * Simple Logging Middleware for CheckInn Hotel Booking Platform
 * 
 * Basic logging functions để fix middleware dependencies
 * 
 * @author CheckInn Team
 * @version 2.0.0 - Simple
 */

/**
 * ============================================================================
 * BASIC LOGGING MIDDLEWARE
 * ============================================================================
 */

// Request logger
const requestLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
};

// Advanced request logger
const advancedRequestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

// Error logger
const errorLogger = (error, req, res, next) => {
  console.error(`Error: ${error.message} - ${req.method} ${req.url}`);
  next(error);
};

// Pass-through logger
const logger = {
  info: (message, meta) => console.log(`INFO: ${message}`, meta || ''),
  error: (message, meta) => console.error(`ERROR: ${message}`, meta || ''),
  warn: (message, meta) => console.warn(`WARN: ${message}`, meta || ''),
  debug: (message, meta) => console.log(`DEBUG: ${message}`, meta || '')
};

/**
 * ============================================================================
 * EXPORTS
 * ============================================================================
 */

module.exports = {
  requestLogger,
  advancedRequestLogger,
  errorLogger,
  logger
};