/**
 * JWT Utilities for CheckInn Hotel Booking Platform
 * 
 * Comprehensive JWT token management với access/refresh tokens,
 * verification, và security features
 * 
 * @author CheckInn Team
 * @version 2.0.0
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const AppError = require('./appError');

/**
 * Generate JWT access token
 * @param {string} id - User ID
 * @param {Object} payload - Additional payload data
 * @returns {string} JWT token
 */
const generateToken = (id, payload = {}) => {
  return jwt.sign(
    { 
      id, 
      ...payload,
      type: 'access'
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: 'CheckInn',
      audience: 'CheckInn-Users'
    }
  );
};

/**
 * Generate JWT refresh token
 * @param {string} id - User ID
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (id) => {
  return jwt.sign(
    { 
      id, 
      type: 'refresh',
      jti: crypto.randomUUID() // Unique token ID for tracking
    }, 
    process.env.JWT_REFRESH_SECRET, 
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: 'CheckInn',
      audience: 'CheckInn-Users'
    }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - JWT secret
 * @returns {Promise<Object>} Decoded token payload
 */
const verifyToken = async (token, secret = process.env.JWT_SECRET) => {
  try {
    return await promisify(jwt.verify)(token, secret);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token format', 401);
    } else if (error.name === 'TokenExpiredError') {
      throw new AppError('Token has expired', 401);
    } else if (error.name === 'NotBeforeError') {
      throw new AppError('Token not active yet', 401);
    }
    throw new AppError('Token verification failed', 401);
  }
};

/**
 * Generate password reset token
 * @returns {string} Crypto token for password reset
 */
const generatePasswordResetToken = () => {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token to store in database
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  return { resetToken, passwordResetToken };
};

/**
 * Generate email verification token
 * @param {string} email - User email
 * @returns {string} JWT token for email verification
 */
const generateEmailVerificationToken = (email) => {
  return jwt.sign(
    { 
      email, 
      type: 'email_verification',
      timestamp: Date.now()
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '24h', // Email verification expires in 24 hours
      issuer: 'CheckInn',
      audience: 'CheckInn-Users'
    }
  );
};

/**
 * Create and set JWT cookie
 * @param {Object} res - Express response object
 * @param {string} token - JWT token
 * @param {string} name - Cookie name
 */
const createSendTokenCookie = (res, token, name = 'jwt') => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie(name, token, cookieOptions);
};

/**
 * Extract token from request (headers, cookies, query)
 * @param {Object} req - Express request object
 * @returns {string|null} JWT token or null
 */
const extractToken = (req) => {
  let token = null;
  
  // 1. Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Check cookies
  else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // 3. Check query parameters (for email verification links)
  else if (req.query && req.query.token) {
    token = req.query.token;
  }
  
  return token;
};

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
  return jwt.decode(token, { complete: true });
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  createSendTokenCookie,
  extractToken,
  decodeToken
};
