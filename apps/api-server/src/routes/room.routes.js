/**
 * Room Routes for CheckInn Hotel Booking Platform
 * 
 * Defines all room-related API endpoints với proper middleware
 * và business logic routing
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const middleware = require('../middlewares');

/**
 * ============================================================================
 * PUBLIC ROUTES (No authentication required)  
 * ============================================================================
 */

/**
 * GET /api/rooms/availability - Search available rooms (CRITICAL: Must be before /:id)
 * Query params: hotelId, checkIn, checkOut, guests
 */
router.get('/availability', roomController.getAvailableRooms);

/**
 * GET /api/rooms/:id - Get single room details
 */
router.get('/:id', roomController.getRoomById);

/**
 * GET /api/rooms/hotel/:hotelId - Get all rooms for a hotel
 * Supports filtering, sorting, pagination via APIFeatures
 */
router.get('/hotel/:hotelId', roomController.getRoomsByHotel);

/**
 * ============================================================================
 * PROTECTED ROUTES (Authentication required)
 * ============================================================================
 */

// Apply authentication middleware for all routes below
router.use(middleware.auth.protect);

/**
 * POST /api/rooms - Create new room (HotelPartner/Admin only)
 * Validates hotel ownership before creation
 */
router.post('/', 
  middleware.auth.restrictTo('HotelPartner', 'Admin'), 
  roomController.createRoom
);

/**
 * PATCH /api/rooms/:id - Update room details (HotelPartner/Admin only)
 * Validates hotel ownership before update
 */
router.patch('/:id', 
  middleware.auth.restrictTo('HotelPartner', 'Admin'), 
  roomController.updateRoom
);

/**
 * DELETE /api/rooms/:id - Delete room (HotelPartner/Admin only)
 * Blocks deletion if room has future bookings
 */
router.delete('/:id', 
  middleware.auth.restrictTo('HotelPartner', 'Admin'), 
  roomController.deleteRoom
);

/**
 * ============================================================================
 * FUTURE FEATURES (Not yet implemented - returns 501)
 * ============================================================================
 */
router.patch('/bulk-status', 
  middleware.auth.restrictTo('HotelPartner', 'Admin'),
  roomController.bulkUpdateStatus
);

router.get('/analytics/:id',
  middleware.auth.restrictTo('HotelPartner', 'Admin'),
  roomController.getRoomAnalytics
);

module.exports = router;
