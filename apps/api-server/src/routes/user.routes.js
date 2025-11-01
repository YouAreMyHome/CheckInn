/**
 * User Routes for CheckInn Hotel Booking Platform
 * 
 * Defines all user-related API endpoints với proper middleware
 * và access control
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const express = require('express');
const UserController = require('../controllers/user.controller');
const middleware = require('../middlewares');

const router = express.Router();

/**
 * ============================================================================
 * PUBLIC ROUTES (No authentication required)
 * ============================================================================
 */

// User registration & authentication handled in auth.routes.js

/**
 * ============================================================================
 * PROTECTED ROUTES (Authentication required)
 * ============================================================================
 */

// Apply protected route middleware
router.use(middleware.auth.protect);

/**
 * Current User Operations
 */
router
  .route('/me')
  .get(UserController.getMe)
  .patch(UserController.updateMe)
  .delete(UserController.deleteMe);

router.patch('/me/change-password', UserController.changePassword);
router.get('/me/bookings', UserController.getMyBookings);
router.get('/me/reviews', UserController.getMyReviews);
router.get('/me/activity', UserController.getMyActivity);

/**
 * User Profile Management
 */
router.get('/profile/:id', UserController.getUserProfile);

/**
 * ============================================================================
 * ADMIN ONLY ROUTES
 * ============================================================================
 */

// Apply admin-only middleware
router.use(middleware.auth.restrictTo('Admin'));

/**
 * User Management (Admin)
 */
router
  .route('/')
  .get(UserController.getAllUsers)
  .post(UserController.createUser);

router
  .route('/:id')
  .get(UserController.getUserById)
  .patch(UserController.updateUser)
  .delete(UserController.deleteUser);

/**
 * Admin Analytics & Reports
 */
router.get('/analytics/overview', UserController.getUserAnalytics);
router.get('/analytics/activity', UserController.getActivityAnalytics);
router.get('/reports/registrations', UserController.getRegistrationReport);

/**
 * User Verification & Moderation
 */
router.patch('/:id/verify', UserController.verifyUser);
router.patch('/:id/block', UserController.blockUser);
router.patch('/:id/unblock', UserController.unblockUser);

module.exports = router;
