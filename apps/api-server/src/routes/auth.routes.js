
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
router.post('/register', 
  middleware.validation.validateRegister,
  middleware.rateLimiting.auth, 
  AuthController.register
);

router.post('/login', 
  // middleware.validation.validateLogin,  // Temporarily disabled for debugging
  middleware.rateLimiting.auth, 
  AuthController.login
);

router.post('/logout', AuthController.logout);

/**
 * Token Management
 */
router.post('/refresh-token', AuthController.refreshToken);

/**
 * Password Management
 */
router.post('/forgot-password', 
  middleware.validation.validateEmail,
  middleware.rateLimiting.auth, 
  AuthController.forgotPassword
);

router.patch('/reset-password/:token', 
  middleware.validation.validatePasswordReset,
  AuthController.resetPassword
);

router.patch('/update-password', 
  middleware.auth.protect,
  middleware.validation.validatePasswordUpdate,
  AuthController.updatePassword
);

/**
 * Account Verification
 */
router.post('/verify-email', AuthController.verifyEmail);

router.post('/resend-verification', 
  middleware.validation.validateEmail,
  middleware.rateLimiting.auth, 
  AuthController.resendVerificationEmail
);

/**
 * Social Authentication (Future implementation)
 */
// router.get('/google', UserController.googleAuth);
// router.get('/facebook', UserController.facebookAuth);

/**
 * ============================================================================
 * PROTECTED ROUTES
 * ============================================================================
 */
router.use(middleware.auth.protect); // All routes after this middleware are protected

/**
 * User Profile Management (Protected)
 */
router.get('/me', AuthController.getMe);

/**
 * Account Management (Protected)  
 */
router.patch('/update-me', 
  middleware.validation.validateUserUpdate,
  AuthController.updateMe
);

router.delete('/delete-me', AuthController.deleteMe);

module.exports = router;
