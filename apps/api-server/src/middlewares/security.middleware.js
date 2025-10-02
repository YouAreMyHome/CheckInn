/**
 * Security Middleware for CheckInn Hotel Booking Platform
 * 
 * Comprehensive security measures including CORS, CSRF protection,
 * input sanitization, security headers, và threat detection
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const ActivityTracker = require('../utils/activityTracker');
const { logger } = require('./logging.middleware');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * ============================================================================
 * HELMET SECURITY HEADERS
 * ============================================================================
 */

/**
 * Comprehensive security headers configuration
 */
const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Allow inline scripts (tighten in production)
        "https://apis.google.com",
        "https://www.gstatic.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Allow inline styles
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "*.cloudinary.com", // Image hosting
        "*.amazonaws.com"   // AWS S3
      ],
      connectSrc: [
        "'self'",
        "https://api.checkin.com",
        "https://maps.googleapis.com"
      ],
      frameSrc: [
        "'self'",
        "https://www.google.com" // Google Maps
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    },
    reportOnly: process.env.NODE_ENV === 'development'
  },

  // Cross Origin Embedder Policy
  crossOriginEmbedderPolicy: false, // Disable for compatibility

  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },

  // Expect CT
  expectCt: {
    maxAge: 86400,
    enforce: process.env.NODE_ENV === 'production'
  },

  // Feature Policy / Permissions Policy
  permissionsPolicy: {
    camera: ['none'],
    microphone: ['none'],
    geolocation: ['self'],
    payment: ['self']
  },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // HSTS (HTTP Strict Transport Security)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },

  // IE No Open
  ieNoOpen: true,

  // No Sniff
  noSniff: true,

  // Origin Agent Cluster
  originAgentCluster: true,

  // Referrer Policy
  referrerPolicy: {
    policy: ['no-referrer-when-downgrade']
  },

  // X-Frame-Options
  frameguard: {
    action: 'deny'
  }
});

/**
 * ============================================================================
 * CORS CONFIGURATION
 * ============================================================================
 */

/**
 * CORS options với environment-based origins
 */
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',           // React dev server
      'http://localhost:5173',           // Vite dev server
      'https://checkin.com',             // Production frontend
      'https://www.checkin.com',
      'https://admin.checkin.com',       // Admin dashboard
      'https://partner.checkin.com'      // Hotel partner portal
    ];

    // Allow requests với no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS policy violation', {
        type: 'cors-violation',
        origin,
        timestamp: new Date().toISOString()
      });
      callback(new AppError('CORS policy violation', 403));
    }
  },

  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Request-ID',
    'X-Forwarded-For'
  ],

  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Request-ID'
  ],

  credentials: true, // Allow cookies
  maxAge: 86400 // 24 hours
};

/**
 * ============================================================================
 * INPUT SANITIZATION
 * ============================================================================
 */

/**
 * MongoDB injection protection
 */
const mongoSanitizeOptions = {
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn('MongoDB injection attempt detected', {
      type: 'mongo-injection-attempt',
      key,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url
    });

    // Track suspicious activity
    ActivityTracker.trackActivity({
      activityType: 'mongo_injection_attempt',
      req,
      userId: req.user?._id,
      customData: { key, suspiciousValue: true }
    });
  }
};

/**
 * XSS protection với custom configuration
 */
const xssProtection = xss({
  onIgnoreTag: (tag, html, options) => {
    logger.warn('XSS attempt detected', {
      type: 'xss-attempt',
      tag,
      html: html.substring(0, 100), // Log first 100 chars
      ip: options.req?.ip,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * HTTP Parameter Pollution protection
 */
const hppProtection = hpp({
  whitelist: [
    'amenities',
    'starRating',
    'sort',
    'fields',
    'tags'
  ]
});

/**
 * ============================================================================
 * ADVANCED SECURITY MIDDLEWARE
 * ============================================================================
 */

/**
 * Request signature verification
 */
const verifyRequestSignature = (secret) => {
  return catchAsync(async (req, res, next) => {
    const signature = req.get('X-Signature');
    
    if (!signature) {
      return next(new AppError('Missing request signature', 400));
    }

    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      logger.warn('Invalid request signature', {
        type: 'invalid-signature',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      return next(new AppError('Invalid request signature', 400));
    }

    next();
  });
};

/**
 * IP whitelist middleware
 */
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      logger.warn('IP not in whitelist', {
        type: 'ip-not-whitelisted',
        ip: clientIP,
        userAgent: req.get('User-Agent')
      });

      return next(new AppError('Access denied', 403));
    }

    next();
  };
};

/**
 * Suspicious activity detection
 */
const detectSuspiciousActivity = catchAsync(async (req, res, next) => {
  const suspiciousPatterns = [
    // SQL injection patterns
    /(union|select|insert|delete|update|drop|create|alter|exec|execute)/i,
    // Script injection patterns
    /<script|javascript:|vbscript:|onload|onerror|onclick/i,
    // Path traversal patterns
    /\.\.[\/\\]/,
    // Command injection patterns
    /[;&|`$]/
  ];

  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params
  });

  const suspiciousFound = suspiciousPatterns.some(pattern => 
    pattern.test(requestData)
  );

  if (suspiciousFound) {
    logger.warn('Suspicious activity detected', {
      type: 'suspicious-activity',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      data: requestData.substring(0, 500) // Log first 500 chars
    });

    await ActivityTracker.trackActivity({
      activityType: 'suspicious_activity_detected',
      req,
      userId: req.user?._id,
      customData: {
        suspiciousPatterns: true,
        riskLevel: 'high'
      }
    });

    return next(new AppError('Suspicious activity detected', 400));
  }

  next();
});

/**
 * ============================================================================
 * CSRF PROTECTION
 * ============================================================================
 */

/**
 * Simple CSRF token middleware
 */
const csrfProtection = {
  // Generate CSRF token
  generateToken: (req, res, next) => {
    if (!req.session.csrfToken) {
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }
    res.locals.csrfToken = req.session.csrfToken;
    next();
  },

  // Verify CSRF token
  verifyToken: (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next(); // Skip for safe methods
    }

    const token = req.get('X-CSRF-Token') || req.body.csrfToken;
    const sessionToken = req.session?.csrfToken;

    if (!token || !sessionToken || token !== sessionToken) {
      logger.warn('CSRF token validation failed', {
        type: 'csrf-validation-failed',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        hasToken: !!token,
        hasSessionToken: !!sessionToken
      });

      return next(new AppError('CSRF token validation failed', 403));
    }

    next();
  }
};

/**
 * ============================================================================
 * SECURITY MONITORING
 * ============================================================================
 */

/**
 * Security event monitoring middleware
 */
const securityMonitor = catchAsync(async (req, res, next) => {
  // Monitor for multiple failed requests from same IP
  const failedRequests = await getFailedRequestCount(req.ip);
  
  if (failedRequests > 10) {
    logger.warn('Multiple failed requests detected', {
      type: 'multiple-failed-requests',
      ip: req.ip,
      count: failedRequests,
      userAgent: req.get('User-Agent')
    });

    await ActivityTracker.trackActivity({
      activityType: 'multiple_failed_requests',
      req,
      customData: {
        failedCount: failedRequests,
        riskLevel: 'medium'
      }
    });
  }

  // Monitor for unusual user agent strings
  const userAgent = req.get('User-Agent');
  if (isUnusualUserAgent(userAgent)) {
    logger.info('Unusual user agent detected', {
      type: 'unusual-user-agent',
      userAgent,
      ip: req.ip
    });
  }

  next();
});

/**
 * ============================================================================
 * CONTENT VALIDATION
 * ============================================================================
 */

/**
 * File upload security
 */
const secureFileUpload = {
  // Validate file types
  validateFileType: (allowedTypes = ['image/jpeg', 'image/png', 'image/webp']) => {
    return (req, res, next) => {
      if (!req.files || req.files.length === 0) {
        return next();
      }

      const invalidFiles = req.files.filter(file => 
        !allowedTypes.includes(file.mimetype)
      );

      if (invalidFiles.length > 0) {
        logger.warn('Invalid file type uploaded', {
          type: 'invalid-file-type',
          files: invalidFiles.map(f => ({ name: f.originalname, type: f.mimetype })),
          ip: req.ip,
          userId: req.user?._id
        });

        return next(new AppError('Invalid file type', 400));
      }

      next();
    };
  },

  // Scan files for malware (placeholder - integrate with actual scanner)
  scanForMalware: catchAsync(async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    // Placeholder for malware scanning
    // In production, integrate with ClamAV or similar
    for (const file of req.files) {
      const isMalicious = await simulateMalwareScan(file);
      
      if (isMalicious) {
        logger.error('Malware detected in upload', {
          type: 'malware-detected',
          filename: file.originalname,
          ip: req.ip,
          userId: req.user?._id
        });

        await ActivityTracker.trackActivity({
          activityType: 'malware_detected',
          req,
          userId: req.user?._id,
          customData: {
            filename: file.originalname,
            riskLevel: 'critical'
          }
        });

        return next(new AppError('Malicious file detected', 400));
      }
    }

    next();
  })
};

/**
 * ============================================================================
 * HELPER FUNCTIONS
 * ============================================================================
 */

/**
 * Get failed request count for IP (placeholder implementation)
 */
async function getFailedRequestCount(ip) {
  // In production, this would query Redis or database
  return Math.floor(Math.random() * 20); // Simulated
}

/**
 * Check if user agent is unusual
 */
function isUnusualUserAgent(userAgent) {
  if (!userAgent) return true;
  
  const suspiciousPatterns = [
    /bot|crawler|spider/i,
    /curl|wget|python/i,
    /scanner|exploit/i
  ];

  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Simulate malware scanning
 */
async function simulateMalwareScan(file) {
  // Placeholder - in production use actual malware scanner
  return false; // Assume clean for demo
}

/**
 * ============================================================================
 * COMPRESSION MIDDLEWARE
 * ============================================================================
 */

/**
 * Intelligent compression based on content type
 */
const intelligentCompression = compression({
  filter: (req, res) => {
    // Don't compress if client doesn't accept encoding
    if (req.headers['x-no-compression']) {
      return false;
    }

    // Don't compress already compressed content
    const contentType = res.get('Content-Type');
    if (contentType && contentType.includes('image/')) {
      return false;
    }

    return compression.filter(req, res);
  },
  
  level: 6, // Compression level (1-9, 6 is good balance)
  threshold: 1024, // Only compress if larger than 1KB
  
  // Custom compression for different content types
  strategy: compression.Z_DEFAULT_STRATEGY
});

/**
 * ============================================================================
 * EXPORT SECURITY MIDDLEWARE
 * ============================================================================
 */

module.exports = {
  // Core security middleware
  securityHeaders,
  cors: cors(corsOptions),
  xssProtection,
  mongoSanitize: mongoSanitize(mongoSanitizeOptions),
  hppProtection,
  intelligentCompression,

  // Advanced security
  verifyRequestSignature,
  ipWhitelist,
  detectSuspiciousActivity,
  securityMonitor,

  // CSRF protection
  csrfProtection,

  // File upload security
  secureFileUpload,

  // Configuration objects
  corsOptions,
  mongoSanitizeOptions
};