
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

// Apply search-specific middleware for authenticated routes
middleware.utils.applyMiddleware(router, middleware.routes.search);

/**
 * Hotel Management (Hotel Partners & Admin)
 */
router.post('/', HotelController.createHotel);

router
  .route('/:id')
  .patch(HotelController.updateHotel)
  .delete(HotelController.deleteHotel);

/**
 * Hotel Operations
 */
router.patch('/:id/verify', HotelController.toggleHotelStatus);
router.patch('/:id/feature', HotelController.toggleHotelStatus);

/**
 * Media Management  
 */
router.post('/:id/images', HotelController.setHotelImage);
router.delete('/:id/images/:imageId', HotelController.setHotelImage);

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
