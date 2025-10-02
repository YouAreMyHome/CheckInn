
/**
 * API Routes Index for CheckInn Hote// Mount route modules - simple versions only for now
router.use('/auth', authRoutes);           // Authentication & authorization
router.use('/users', userRoutes);         // User management
router.use('/health', healthRoutes);      // Health monitoring & diagnostics
// router.use('/hotels', hotelRoutes);       // Hotel operations  
// router.use('/rooms', roomRoutes);         // Room management
// router.use('/bookings', bookingRoutes);   // Booking system
// router.use('/reviews', reviewRoutes);     // Review systemg Platform
 * 
 * Main router để organize tất cả các API routes
 * Includes middleware setup và route configuration
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();

// Import route modules - using simple versions for now
const authRoutes = require('./auth.routes.simple');
const userRoutes = require('./user.routes.simple');
const healthRoutes = require('./health.routes.simple');
// const hotelRoutes = require('./hotel.routes');
// const roomRoutes = require('./room.routes');  
// const bookingRoutes = require('./booking.routes');
// const reviewRoutes = require('./review.routes');

// API Documentation route
router.get('/', (req, res) => {
  res.json({
    message: 'CheckInn API v1.0.0',
    status: 'Active',
    endpoints: {
      authentication: '/api/auth',
      users: '/api/users',
      health: '/api/health'
      // hotels: '/api/hotels',
      // rooms: '/api/rooms', 
      // bookings: '/api/bookings',
      // reviews: '/api/reviews'
    },
    documentation: '/api/docs',
    timestamp: new Date().toISOString()
  });
});

// Mount route modules - simple versions only for now
router.use('/auth', authRoutes);           // Authentication & authorization
router.use('/users', userRoutes);         // User management
router.use('/health', healthRoutes);      // Health monitoring & diagnostics
// router.use('/hotels', hotelRoutes);       // Hotel operations
// router.use('/rooms', roomRoutes);         // Room management
// router.use('/bookings', bookingRoutes);   // Booking system
// router.use('/reviews', reviewRoutes);     // Review system

// Basic health check endpoint (lightweight)
router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API version endpoint
router.get('/version', (req, res) => {
  res.json({
    version: '1.0.0',
    build: process.env.BUILD_NUMBER || 'dev',
    node: process.version
  });
});

module.exports = router;
