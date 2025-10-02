/**
 * Simple Error Controller for CheckInn Hotel Booking Platform
 * 
 * Basic error handling để fix middleware dependencies
 * 
 * @author CheckInn Team
 * @version 2.0.0 - Simple
 */

/**
 * ============================================================================
 * BASIC ERROR HANDLING
 * ============================================================================
 */

// Global error handler
const globalErrorHandler = (error, req, res, next) => {
  console.error('Global Error:', error.message);
  
  // Default error response
  const statusCode = error.statusCode || error.status || 500;
  const message = error.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    error: error.name || 'SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      details: error 
    })
  });
};

// Setup global error handlers
const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err.message);
    console.error(err.stack);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
    console.error(err.stack);
  });

  console.log('✅ Global error handlers configured');
};

/**
 * ============================================================================
 * EXPORTS
 * ============================================================================
 */

module.exports = {
  globalErrorHandler,
  setupGlobalErrorHandlers,
  
  // Alias for compatibility
  default: globalErrorHandler
};