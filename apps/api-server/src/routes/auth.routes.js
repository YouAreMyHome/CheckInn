
/**
 * Authentication Routes for CheckInn Hotel Booking Platform
 * 
 * Handles user authentication, registration, password management,
 * và security features
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const express = require('express');
const AuthController = require('../controllers/auth.controller');
const middleware = require('../middlewares');

const router = express.Router();

/**
 * ============================================================================
 * PUBLIC AUTHENTICATION ROUTES
 * ============================================================================
 */

/**
 * User Registration & Login
 */
router.post('/register', middleware.rateLimiting.auth, AuthController.register);
router.post('/login', middleware.rateLimiting.auth, AuthController.login);
router.post('/logout', AuthController.logout);

/**
 * Password Management
 */
router.post('/forgot-password', middleware.rateLimiting.auth, AuthController.forgotPassword);
router.patch('/reset-password/:token', AuthController.resetPassword);

/**
 * Account Verification
 */
router.post('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification', middleware.rateLimiting.auth, AuthController.resendVerificationEmail);

/**
 * Social Authentication (Future implementation)
 */
// router.get('/google', UserController.googleAuth);
// router.get('/facebook', UserController.facebookAuth);

/**
 * ============================================================================
 * PROTECTED AUTHENTICATION ROUTES
 * ============================================================================
 */

// Apply authentication middleware for protected routes
middleware.utils.applyMiddleware(router, middleware.bundles.authentication);

/**
 * Current User Info
 */
router.get('/me', UserController.getMe);
router.patch('/change-password', UserController.changePassword);

/**
 * Session Management
 */
router.post('/refresh-token', UserController.refreshToken);
router.post('/validate-token', UserController.validateToken);

module.exports = router;
