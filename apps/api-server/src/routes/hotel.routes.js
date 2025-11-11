
/**
 * Hotel Routes for CheckInn Hotel Booking Platform
 * 
 * Defines all hotel-related API endpoints với advanced search,
 * geolocation, và comprehensive business logic
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const express = require('express');
const HotelController = require('../controllers/hotel.controller');
const middleware = require('../middlewares');

const router = express.Router();

/**
 * ============================================================================
 * PUBLIC ROUTES (No authentication required)
 * ============================================================================
 */

/**
 * Hotel Discovery & Search
 */
router.get('/', HotelController.getAllHotels);
router.get('/search', HotelController.searchHotels);
router.get('/advanced-search', HotelController.advancedSearch);

/**
 * Geolocation-based Search
 */
router.get('/nearby', HotelController.findNearbyHotels);
router.get('/within/:distance/center/:latlng/unit/:unit', HotelController.getHotelsWithin);

/**
 * Featured & Special Hotels
 */
router.get('/featured', HotelController.getFeaturedHotels);
router.get('/top-rated', HotelController.getTopRatedHotels);

/**
 * Hotel Details
 */
router.get('/:id', HotelController.getHotelById);
router.get('/:id/rooms', HotelController.getHotelRooms);
router.get('/:id/reviews', HotelController.getHotelReviews);
router.get('/:id/amenities', HotelController.getHotelAmenities);

/**
 * ============================================================================
 * PROTECTED ROUTES (Authentication required)
 * ============================================================================
 */

// Apply authentication middleware
router.use(middleware.auth.protect);

/**
 * Hotel Management (Hotel Partners & Admin)
 */
router.post('/', 
  middleware.auth.restrictTo('HotelPartner', 'Admin'),
  HotelController.createHotel
);

router
  .route('/:id')
  .patch(
    middleware.auth.restrictTo('HotelPartner', 'Admin'),
    HotelController.updateHotel
  )
  .delete(
    middleware.auth.restrictTo('Admin'),
    HotelController.deleteHotel
  );

/**
 * Hotel Operations (Admin only)
 */
router.patch('/:id/verify', 
  middleware.auth.restrictTo('Admin'),
  HotelController.toggleHotelStatus
);

router.patch('/:id/feature', 
  middleware.auth.restrictTo('Admin'),
  HotelController.toggleHotelStatus
);

/**
 * Media Management  
 */
router.post('/:id/images', 
  middleware.auth.restrictTo('HotelPartner', 'Admin'),
  HotelController.setHotelImage
);

router.delete('/:id/images/:imageId', 
  middleware.auth.restrictTo('HotelPartner', 'Admin'),
  HotelController.setHotelImage
);

/**
 * ============================================================================
 * ANALYTICS & REPORTS 
 * ============================================================================
 */

/**
 * Hotel Analytics (Hotel Owners & Admin)
 */
router.get('/:id/analytics/overview', HotelController.getHotelAnalytics);
router.get('/:id/analytics/performance', HotelController.getPerformanceAnalytics);
router.get('/:id/analytics/revenue', HotelController.getRevenueAnalytics);

/**
 * System Analytics (Admin only)
 */
router.get('/analytics/platform', HotelController.getHotelAnalytics);

module.exports = router;
