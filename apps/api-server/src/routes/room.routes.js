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
const RoomController = require('../controllers/room.controller');
const middleware = require('../middlewares');

const router = express.Router();

/**
 * ============================================================================
 * PUBLIC ROUTES (No authentication required)  
 * ============================================================================
 */

/**
 * Room Discovery & Search
 */
router.get('/', RoomController.getAllRooms);
router.get('/:id', RoomController.getRoomById);

/**
 * Availability & Pricing (Public for browsing)
 */
router.post('/check-availability', RoomController.checkAvailability);
router.post('/pricing', RoomController.getRoomPricing);

/**
 * ============================================================================
 * PROTECTED ROUTES (Authentication required)
 * ============================================================================
 */

// Apply protected route middleware for authenticated operations


/**
 * Room Management (Hotel Owners & Admin)
 */
router.post('/', RoomController.createRoom);

router
  .route('/:id')
  .patch(RoomController.updateRoom)
  .delete(RoomController.deleteRoom);

/**
 * Room Operations
 */
router.patch('/bulk-status', RoomController.bulkUpdateStatus);
router.get('/:id/analytics', RoomController.getRoomAnalytics);

/**
 * ============================================================================
 * ADMIN & HOTEL OWNER ROUTES
 * ============================================================================
 */

/**
 * Reports & Analytics  
 */
router.get('/reports/occupancy', RoomController.getOccupancyReport);

module.exports = router;
