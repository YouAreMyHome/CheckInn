/**
 * Logging Middleware for CheckInn Hotel Booking Platform
 * 
 * Comprehensive request/response logging, performance monitoring,
 * error tracking, và security auditing
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const winston = require('winston');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { format } = winston;
const ActivityTracker = require('../utils/activityTracker');
const catchAsync = require('../utils/catchAsync');

/**
 * ============================================================================
 * WINSTON LOGGER CONFIGURATION
 * ============================================================================
 */

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Custom log format
 */
const customFormat = format.combine(
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  format.errors({ stack: true }),
  format.json(),
  format.prettyPrint()
);

/**
 * Console format for development
 */
const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({
    format: 'HH:mm:ss'
  }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = `\n${JSON.stringify(meta, null, 2)}`;
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

/**
 * Main logger instance
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: {
    service: 'CheckInn-API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
      )
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      format: customFormat
    }),

    // Daily rotating logs - using require() directly
    new (require('winston-daily-rotate-file'))({
      filename: path.join(logsDir, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      maxSize: '20m',
      format: customFormat
    })
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log')
    })
  ],
  
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log')
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

/**
 * ============================================================================
 * REQUEST LOGGING MIDDLEWARE
 * ============================================================================
 */

/**
 * Enhanced Morgan configuration
 */
const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

/**
 * Custom Morgan tokens
 */
morgan.token('user-id', (req) => {
  return req.user ? req.user._id : 'anonymous';
});

morgan.token('request-id', (req) => {
  return req.requestId || 'no-id';
});

morgan.token('real-ip', (req) => {
  return req.ip || req.connection.remoteAddress;
});

morgan.token('body-size', (req) => {
  return req.get('content-length') || '0';
});

/**
 * Request logging middleware
 */
const requestLogger = morgan(
  ':real-ip - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms - :body-size bytes',
  {
    stream: {
      write: (message) => {
        logger.info(message.trim(), { type: 'http-request' });
      }
    },
    skip: (req) => {
      // Skip health check và static files
      return req.url === '/api/health' || 
             req.url.startsWith('/static/') ||
             req.url.endsWith('.ico');
    }
  }
);

/**
 * ============================================================================
 * ADVANCED REQUEST/RESPONSE LOGGING
 * ============================================================================
 */

/**
 * Comprehensive request logger với security và performance tracking
 */
const advancedRequestLogger = catchAsync(async (req, res, next) => {
  const startTime = process.hrtime();
  const timestamp = new Date().toISOString();
  
  // Generate unique request ID
  req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Capture request details
  const requestInfo = {
    requestId: req.requestId,
    timestamp,
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    path: req.path,
    query: req.query,
    params: req.params,
    headers: {
      'user-agent': req.get('User-Agent'),
      'content-type': req.get('Content-Type'),
      'content-length': req.get('Content-Length'),
      'authorization': req.get('Authorization') ? '[REDACTED]' : undefined,
      'x-forwarded-for': req.get('X-Forwarded-For'),
      'x-real-ip': req.get('X-Real-IP')
    },
    ip: req.ip,
    ips: req.ips,
    secure: req.secure,
    protocol: req.protocol,
    userId: req.user?._id,
    userRole: req.user?.role,
    body: req.method !== 'GET' ? sanitizeRequestBody(req.body) : undefined
  };

  // Log request start
  logger.info('Request started', {
    type: 'request-start',
    ...requestInfo
  });

  // Capture original res.json method
  const originalJson = res.json;
  let responseBody = null;
  
  res.json = function(body) {
    responseBody = body;
    return originalJson.call(this, body);
  };

  // Capture response when finished
  res.on('finish', async () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds * 1000 + nanoseconds * 1e-6; // milliseconds
    
    const responseInfo = {
      requestId: req.requestId,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      duration: Math.round(duration * 100) / 100, // Round to 2 decimal places
      responseSize: res.get('Content-Length') || 0,
      headers: {
        'content-type': res.get('Content-Type'),
        'content-length': res.get('Content-Length'),
        'cache-control': res.get('Cache-Control')
      }
    };

    // Determine log level based on status code
    let logLevel = 'info';
    if (res.statusCode >= 400 && res.statusCode < 500) {
      logLevel = 'warn';
    } else if (res.statusCode >= 500) {
      logLevel = 'error';
    }

    // Log response
    logger[logLevel]('Request completed', {
      type: 'request-complete',
      ...requestInfo,
      response: {
        ...responseInfo,
        body: sanitizeResponseBody(responseBody, res.statusCode)
      }
    });

    // Track performance metrics
    await trackPerformanceMetrics(req, res, duration);
    
    // Track security events
    await trackSecurityEvents(req, res);
  });

  next();
});

/**
 * ============================================================================
 * ERROR LOGGING MIDDLEWARE
 * ============================================================================
 */

/**
 * Comprehensive error logging
 */
const errorLogger = (err, req, res, next) => {
  const errorInfo = {
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode || 500,
      isOperational: err.isOperational || false
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: sanitizeRequestBody(req.body),
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    },
    user: req.user ? {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    } : null
  };

  // Log error with appropriate level
  if (err.statusCode && err.statusCode < 500) {
    logger.warn('Client error occurred', {
      type: 'client-error',
      ...errorInfo
    });
  } else {
    logger.error('Server error occurred', {
      type: 'server-error',
      ...errorInfo
    });
  }

  // Track error in activity tracker
  ActivityTracker.trackActivity({
    activityType: 'error_occurred',
    req,
    userId: req.user?._id,
    customData: {
      errorName: err.name,
      errorMessage: err.message,
      statusCode: err.statusCode || 500,
      stack: err.stack
    }
  });

  next(err);
};

/**
 * ============================================================================
 * SECURITY LOGGING
 * ============================================================================
 */

/**
 * Security event logger
 */
const securityLogger = {
  logSuspiciousActivity: (req, activity) => {
    logger.warn('Suspicious activity detected', {
      type: 'security-alert',
      requestId: req.requestId,
      activity,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?._id,
      timestamp: new Date().toISOString()
    });
  },

  logAuthFailure: (req, reason) => {
    logger.warn('Authentication failure', {
      type: 'auth-failure',
      requestId: req.requestId,
      reason,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  },

  logRateLimitHit: (req, limit) => {
    logger.warn('Rate limit exceeded', {
      type: 'rate-limit',
      requestId: req.requestId,
      limit,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?._id,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * ============================================================================
 * HELPER FUNCTIONS
 * ============================================================================
 */

/**
 * Sanitize request body để remove sensitive data
 */
function sanitizeRequestBody(body) {
  if (!body || typeof body !== 'object') return body;

  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  const sanitized = { ...body };

  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Sanitize response body
 */
function sanitizeResponseBody(body, statusCode) {
  if (!body) return null;
  
  // Don't log response body for successful requests to reduce log size
  if (statusCode >= 200 && statusCode < 400) {
    return { message: 'Response body omitted for successful requests' };
  }
  
  return body;
}

/**
 * Track performance metrics
 */
async function trackPerformanceMetrics(req, res, duration) {
  // Track slow requests
  if (duration > 1000) { // Slower than 1 second
    await ActivityTracker.trackActivity({
      activityType: 'slow_request',
      req,
      userId: req.user?._id,
      customData: {
        duration,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode
      }
    });
  }

  // Track large responses
  const responseSize = parseInt(res.get('Content-Length')) || 0;
  if (responseSize > 1024 * 1024) { // Larger than 1MB
    await ActivityTracker.trackActivity({
      activityType: 'large_response',
      req,
      userId: req.user?._id,
      customData: {
        responseSize,
        method: req.method,
        url: req.url
      }
    });
  }
}

/**
 * Track security events
 */
async function trackSecurityEvents(req, res) {
  // Track failed authentication attempts
  if (res.statusCode === 401) {
    await ActivityTracker.trackActivity({
      activityType: 'auth_failure',
      req,
      customData: {
        reason: 'unauthorized',
        endpoint: req.url
      }
    });
  }

  // Track access denied events
  if (res.statusCode === 403) {
    await ActivityTracker.trackActivity({
      activityType: 'access_denied',
      req,
      userId: req.user?._id,
      customData: {
        reason: 'forbidden',
        endpoint: req.url
      }
    });
  }
}

/**
 * ============================================================================
 * EXPORT LOGGING MIDDLEWARE
 * ============================================================================
 */

module.exports = {
  logger,
  requestLogger,
  advancedRequestLogger,
  errorLogger,
  securityLogger,
  
  // Utility functions
  sanitizeRequestBody,
  sanitizeResponseBody
};