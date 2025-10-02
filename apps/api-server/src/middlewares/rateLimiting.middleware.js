/**
 * Rate Limiting Middleware for CheckInn Hotel Booking Platform
 * 
 * Advanced rate limiting với multiple strategies, user-based limits,
 * dynamic throttling, và comprehensive monitoring
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');
const ActivityTracker = require('../utils/activityTracker');
const { logger } = require('./logging.middleware');
const AppError = require('../utils/appError');

/**
 * ============================================================================
 * REDIS CONFIGURATION
 * ============================================================================
 */

// Redis client for rate limiting (fallback to memory if Redis unavailable)
let redisClient;
let redisStore;

try {
  redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB || 1
  });

  redisStore = new RedisStore({
    client: redisClient,
    prefix: 'CheckInn:rateLimit:'
  });

  logger.info('Redis connected for rate limiting');
} catch (error) {
  logger.warn('Redis unavailable, using memory store for rate limiting', { error: error.message });
  redisStore = undefined;
}

/**
 * ============================================================================
 * RATE LIMITING CONFIGURATIONS
 * ============================================================================
 */

/**
 * General API rate limiting
 */
const generalRateLimit = rateLimit({
  store: redisStore,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Different limits based on user role
    if (req.user?.role === 'Admin') return 1000;
    if (req.user?.role === 'HotelPartner') return 500;
    if (req.user?.role === 'Guest') return 200;
    return 100; // Anonymous users
  },
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  // Custom key generator
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user ? `user:${req.user._id}` : `ip:${req.ip}`;
  },
  
  // Custom handler
  handler: async (req, res, next) => {
    const rateLimitInfo = {
      ip: req.ip,
      userId: req.user?._id,
      userAgent: req.get('User-Agent'),
      endpoint: req.path,
      method: req.method,
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining,
      resetTime: req.rateLimit.resetTime
    };

    // Log rate limit hit
    logger.warn('General rate limit exceeded', {
      type: 'rate-limit-hit',
      ...rateLimitInfo
    });

    // Track in activity tracker
    await ActivityTracker.trackActivity({
      activityType: 'rate_limit_hit',
      req,
      userId: req.user?._id,
      customData: rateLimitInfo
    });

    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
      limit: req.rateLimit.limit,
      remaining: 0
    });
  },

  // Skip successful requests that don't modify data
  skip: (req) => {
    return req.method === 'GET' && req.path.startsWith('/api/health');
  }
});

/**
 * Authentication rate limiting (stricter)
 */
const authRateLimit = rateLimit({
  store: redisStore,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Very strict for auth endpoints
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req) => `auth:${req.ip}:${req.body.email || 'unknown'}`,
  
  handler: async (req, res) => {
    logger.warn('Authentication rate limit exceeded', {
      type: 'auth-rate-limit-hit',
      ip: req.ip,
      email: req.body.email,
      endpoint: req.path,
      userAgent: req.get('User-Agent')
    });

    await ActivityTracker.trackActivity({
      activityType: 'auth_rate_limit_hit',
      req,
      customData: {
        email: req.body.email,
        attempts: 5
      }
    });

    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
      retryAfter: 15 * 60,
      securityNote: 'Multiple failed attempts detected. Account may be temporarily restricted.'
    });
  }
});

/**
 * Booking rate limiting (prevent spam bookings)
 */
const bookingRateLimit = rateLimit({
  store: redisStore,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 bookings per hour per user
  message: {
    success: false,
    message: 'Too many booking attempts. Please try again later.',
    retryAfter: '1 hour'
  },
  
  keyGenerator: (req) => `booking:${req.user?._id || req.ip}`,
  
  handler: async (req, res) => {
    logger.warn('Booking rate limit exceeded', {
      type: 'booking-rate-limit-hit',
      userId: req.user?._id,
      ip: req.ip,
      hotelId: req.body.hotelId,
      roomId: req.body.roomId
    });

    await ActivityTracker.trackActivity({
      activityType: 'booking_rate_limit_hit',
      req,
      userId: req.user?._id,
      customData: {
        hotelId: req.body.hotelId,
        roomId: req.body.roomId,
        attempts: 10
      }
    });

    res.status(429).json({
      success: false,
      message: 'Too many booking attempts. Please try again later.',
      retryAfter: 60 * 60,
      suggestion: 'Consider contacting the hotel directly if you need immediate assistance.'
    });
  }
});

/**
 * Search rate limiting (prevent search spam)
 */
const searchRateLimit = rateLimit({
  store: redisStore,
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 searches per 5 minutes
  message: {
    success: false,
    message: 'Too many search requests. Please slow down.',
    retryAfter: '5 minutes'
  },
  
  keyGenerator: (req) => `search:${req.user?._id || req.ip}`,
  
  handler: async (req, res) => {
    await ActivityTracker.trackActivity({
      activityType: 'search_rate_limit_hit',
      req,
      userId: req.user?._id,
      customData: {
        searchQuery: req.query,
        attempts: 50
      }
    });

    res.status(429).json({
      success: false,
      message: 'Too many search requests. Please slow down.',
      retryAfter: 5 * 60
    });
  }
});

/**
 * ============================================================================
 * SLOW DOWN MIDDLEWARE (PROGRESSIVE DELAYS)
 * ============================================================================
 */

/**
 * Progressive slowdown for repeated requests
 */
const progressiveSlowDown = slowDown({
  store: redisStore,
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 10, // Allow 10 requests per window without delay
  delayMs: () => 500, // Delay each request by 500ms (updated for v2+)
  validate: { delayMs: false }, // Disable validation warning
  maxDelayMs: 10000, // Maximum delay of 10 seconds
  
  keyGenerator: (req) => req.user ? `slowdown:user:${req.user._id}` : `slowdown:ip:${req.ip}`,
  
  onLimitReached: async (req, res) => {
    logger.info('Progressive slowdown activated', {
      type: 'slowdown-activated',
      userId: req.user?._id,
      ip: req.ip,
      delay: req.slowDown.delay
    });

    await ActivityTracker.trackActivity({
      activityType: 'progressive_slowdown',
      req,
      userId: req.user?._id,
      customData: {
        delay: req.slowDown.delay,
        requestsInWindow: req.slowDown.hits
      }
    });
  }
});

/**
 * ============================================================================
 * DYNAMIC RATE LIMITING
 * ============================================================================
 */

/**
 * Dynamic rate limiting based on system load và user behavior
 */
const dynamicRateLimit = (baseLimit = 100) => {
  return rateLimit({
    store: redisStore,
    windowMs: 15 * 60 * 1000,
    
    // Dynamic limit calculation
    max: async (req) => {
      let limit = baseLimit;
      
      // Adjust based on user role
      if (req.user?.role === 'Admin') limit *= 10;
      else if (req.user?.role === 'HotelPartner') limit *= 5;
      else if (req.user?.role === 'Guest') limit *= 2;
      
      // Adjust based on system load (simulate)
      const systemLoad = await getSystemLoad();
      if (systemLoad > 80) limit *= 0.5; // Reduce by 50% under high load
      else if (systemLoad > 60) limit *= 0.75; // Reduce by 25% under medium load
      
      // Adjust based on user reputation
      if (req.user?.reputation) {
        if (req.user.reputation > 90) limit *= 1.5; // Increase for high reputation
        else if (req.user.reputation < 30) limit *= 0.5; // Reduce for low reputation
      }
      
      return Math.floor(limit);
    },
    
    keyGenerator: (req) => req.user ? `dynamic:${req.user._id}` : `dynamic:${req.ip}`,
    
    handler: async (req, res) => {
      await ActivityTracker.trackActivity({
        activityType: 'dynamic_rate_limit_hit',
        req,
        userId: req.user?._id,
        customData: {
          calculatedLimit: req.rateLimit.limit,
          systemLoad: await getSystemLoad()
        }
      });

      res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Limit adjusted based on current system conditions.',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000)
      });
    }
  });
};

/**
 * ============================================================================
 * SPECIALIZED RATE LIMITERS
 * ============================================================================
 */

/**
 * File upload rate limiting
 */
const uploadRateLimit = rateLimit({
  store: redisStore,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: {
    success: false,
    message: 'Too many file uploads. Please try again later.',
    retryAfter: '1 hour'
  },
  
  keyGenerator: (req) => `upload:${req.user?._id || req.ip}`,
  
  handler: async (req, res) => {
    await ActivityTracker.trackActivity({
      activityType: 'upload_rate_limit_hit',
      req,
      userId: req.user?._id
    });

    res.status(429).json({
      success: false,
      message: 'Too many file uploads. Please try again later.',
      retryAfter: 60 * 60
    });
  }
});

/**
 * Password reset rate limiting
 */
const passwordResetRateLimit = rateLimit({
  store: redisStore,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 password reset attempts per hour
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again later.',
    retryAfter: '1 hour'
  },
  
  keyGenerator: (req) => `pwd-reset:${req.ip}:${req.body.email}`,
  
  handler: async (req, res) => {
    logger.warn('Password reset rate limit exceeded', {
      type: 'password-reset-rate-limit',
      ip: req.ip,
      email: req.body.email
    });

    res.status(429).json({
      success: false,
      message: 'Too many password reset attempts. Please try again later.',
      retryAfter: 60 * 60,
      securityNote: 'Multiple reset attempts detected. Please contact support if you continue having issues.'
    });
  }
});

/**
 * ============================================================================
 * MONITORING & ANALYTICS
 * ============================================================================
 */

/**
 * Rate limit monitoring middleware
 */
const rateLimitMonitor = async (req, res, next) => {
  // Track rate limit usage
  if (req.rateLimit) {
    const usage = {
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining,
      used: req.rateLimit.limit - req.rateLimit.remaining,
      resetTime: req.rateLimit.resetTime,
      percentage: ((req.rateLimit.limit - req.rateLimit.remaining) / req.rateLimit.limit) * 100
    };

    // Warn when approaching limit
    if (usage.percentage > 80) {
      await ActivityTracker.trackActivity({
        activityType: 'rate_limit_warning',
        req,
        userId: req.user?._id,
        customData: {
          usage,
          warningLevel: usage.percentage > 95 ? 'critical' : 'high'
        }
      });
    }

    // Add usage info to response headers
    res.set({
      'X-RateLimit-Limit': req.rateLimit.limit,
      'X-RateLimit-Remaining': req.rateLimit.remaining,
      'X-RateLimit-Reset': Math.round(req.rateLimit.resetTime / 1000),
      'X-RateLimit-Used': usage.used
    });
  }

  next();
};

/**
 * ============================================================================
 * HELPER FUNCTIONS
 * ============================================================================
 */

/**
 * Get system load (simulated - in production, use actual system metrics)
 */
async function getSystemLoad() {
  // In production, this would check actual CPU, memory, etc.
  // For now, return a random value between 0-100
  return Math.floor(Math.random() * 100);
}

/**
 * Create custom rate limiter
 */
function createRateLimit(options) {
  const defaultOptions = {
    store: redisStore,
    windowMs: 15 * 60 * 1000,
    standardHeaders: true,
    legacyHeaders: false,
    
    handler: async (req, res) => {
      await ActivityTracker.trackActivity({
        activityType: 'custom_rate_limit_hit',
        req,
        userId: req.user?._id,
        customData: {
          rateLimiterName: options.name || 'custom',
          limit: req.rateLimit.limit
        }
      });

      res.status(429).json({
        success: false,
        message: options.message || 'Rate limit exceeded',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000)
      });
    }
  };

  return rateLimit({ ...defaultOptions, ...options });
}

/**
 * ============================================================================
 * EXPORT RATE LIMITING MIDDLEWARE
 * ============================================================================
 */

module.exports = {
  // General rate limiters
  generalRateLimit,
  authRateLimit,
  bookingRateLimit,
  searchRateLimit,
  uploadRateLimit,
  passwordResetRateLimit,
  
  // Advanced rate limiters
  progressiveSlowDown,
  dynamicRateLimit,
  
  // Monitoring
  rateLimitMonitor,
  
  // Utilities
  createRateLimit,
  
  // Redis client for external use
  redisClient
};