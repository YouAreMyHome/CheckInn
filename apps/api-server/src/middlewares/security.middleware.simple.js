/**
 * Simple Security Middleware for CheckInn Hotel Booking Platform
 * 
 * Basic security functions để fix middleware dependencies
 * 
 * @author CheckInn Team
 * @version 2.0.0 - Simple
 */

const helmet = require('helmet');
const cors = require('cors');

/**
 * ============================================================================
 * BASIC SECURITY MIDDLEWARE
 * ============================================================================
 */

// Security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  crossOriginEmbedderPolicy: false
});

// CORS middleware
const corsMiddleware = cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Pass-through security middlewares
const xssProtection = (req, res, next) => next();
const mongoSanitize = (req, res, next) => next();
const hppProtection = (req, res, next) => next();
const intelligentCompression = (req, res, next) => next();
const detectSuspiciousActivity = (req, res, next) => next();
const securityMonitor = (req, res, next) => next();

/**
 * ============================================================================
 * EXPORTS
 * ============================================================================
 */

module.exports = {
  securityHeaders,
  cors: corsMiddleware,
  xssProtection,
  mongoSanitize,
  hppProtection,
  intelligentCompression,
  detectSuspiciousActivity,
  securityMonitor
};