/**
 * Revenue Routes for CheckInn Hotel Booking Platform
 * 
 * Handles revenue tracking and analytics endpoints
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const express = require('express');
const revenueController = require('../controllers/revenue.controller');
const middleware = require('../middlewares');

const router = express.Router();

/**
 * ============================================================================
 * PROTECTED ROUTES (Authentication required)
 * ============================================================================
 */

// Apply authentication
router.use(middleware.auth.protect);

/**
 * Partner Revenue Summary (HotelPartner only)
 */
router.get('/partner/summary',
  middleware.auth.restrictTo('HotelPartner'),
  revenueController.getPartnerRevenueSummary
);

/**
 * Hotel Revenue Analytics (HotelPartner, Admin)
 */
router.get('/hotel/:hotelId',
  middleware.auth.restrictTo('HotelPartner', 'Admin'),
  revenueController.getHotelRevenue
);

router.get('/hotel/:hotelId/monthly',
  middleware.auth.restrictTo('HotelPartner', 'Admin'),
  revenueController.getMonthlyRevenue
);

router.get('/hotel/:hotelId/occupancy',
  middleware.auth.restrictTo('HotelPartner', 'Admin'),
  revenueController.getOccupancyRate
);

router.get('/hotel/:hotelId/trends',
  middleware.auth.restrictTo('HotelPartner', 'Admin'),
  revenueController.getBookingTrends
);

/**
 * System/Admin only - Update revenue data
 */
router.post('/hotel/:hotelId/update',
  middleware.auth.restrictTo('Admin'),
  revenueController.updateRevenueData
);

module.exports = router;
