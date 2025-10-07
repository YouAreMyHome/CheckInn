/**
 * Booking Routes for CheckInn Hotel Booking Platform
 * 
 * Defines all booking-related API endpoints với complex business logic
 * và proper access control
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const express = require('express');
const BookingController = require('../controllers/booking.controller');
const middleware = require('../middlewares');

const router = express.Router();

/**
 * ============================================================================
 * PROTECTED ROUTES (Authentication required for all booking operations)
 * ============================================================================
 */

// Apply booking-specific middleware with enhanced security


/**
 * Booking Management
 */
router
  .route('/')
  .post(BookingController.createBooking)
  .get(BookingController.getAllBookings); // Admin & hotel owners only (handled in controller)

/**
 * User Booking Operations
 */
router.get('/my-bookings', BookingController.getMyBookings);

router
  .route('/:id')
  .get(BookingController.getBookingById);

/**
 * Booking Status Management
 */
router.patch('/:id/confirm', BookingController.confirmBooking);
router.patch('/:id/cancel', BookingController.cancelBooking);

/**
 * Hotel Staff Operations (Check-in/Check-out)
 */
router.patch('/:id/check-in', BookingController.checkInBooking);
router.patch('/:id/check-out', BookingController.checkOutBooking);

/**
 * ============================================================================
 * ANALYTICS & REPORTS
 * ============================================================================
 */

/**
 * Booking Analytics (Hotel Owners & Admin)
 */
router.get('/analytics/overview', BookingController.getBookingAnalytics);

module.exports = router;
