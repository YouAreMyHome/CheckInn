/**
 * Database Health Check Routes for CheckInn Hotel Booking Platform
 * 
 * Provides endpoints để monitor database health, connection status,
 * và performance metrics cho system administrators
 * 
 * @author CheckInn Team  
 * @version 2.0.0
 */

const express = require('express');
const { 
  getConnectionStatus, 
  healthCheck,
  isConnected 
} = require('../config/database');
const { authMiddleware, requireAdmin } = require('../middlewares/auth.middleware');
const { logger } = require('../middlewares/logging.middleware');

const router = express.Router();

/**
 * ============================================================================
 * DATABASE HEALTH CHECK ROUTES
 * ============================================================================
 */

/**
 * @route   GET /api/health/database
 * @desc    Database health check - Public endpoint
 * @access  Public
 * @returns {Object} Basic database health status
 */
router.get('/database', async (req, res) => {
  try {
    const health = await healthCheck();
    
    // Log health check request
    logger.info('Database health check requested', {
      type: 'health-check-request',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      status: health.status
    });

    // Return basic status for public access
    const publicHealth = {
      status: health.status,
      timestamp: new Date().toISOString(),
      uptime: health.uptime,
      responseTime: health.responseTime
    };

    res.status(health.status === 'healthy' ? 200 : 503).json({
      success: health.status === 'healthy',
      message: health.status === 'healthy' ? 'Database is healthy' : 'Database is unhealthy',
      data: publicHealth
    });

  } catch (error) {
    logger.error('Health check endpoint error', {
      type: 'health-check-error',
      error: error.message,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      message: 'Health check failed',
      data: {
        status: 'error',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * @route   GET /api/health/database/detailed
 * @desc    Detailed database health and statistics
 * @access  Admin only
 * @returns {Object} Comprehensive database metrics
 */
router.get('/database/detailed', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const health = await healthCheck();
    const connectionStatus = getConnectionStatus();

    // Enhanced health data for admins
    const detailedHealth = {
      ...health,
      connectionDetails: connectionStatus,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      serverUptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };

    logger.info('Detailed database health check requested', {
      type: 'detailed-health-check',
      userId: req.user.id,
      userRole: req.user.role,
      status: health.status
    });

    res.status(200).json({
      success: true,
      message: 'Detailed database health retrieved',
      data: detailedHealth
    });

  } catch (error) {
    logger.error('Detailed health check error', {
      type: 'detailed-health-check-error',
      userId: req.user?.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve detailed health data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/health/database/connection
 * @desc    Database connection status
 * @access  Admin only
 * @returns {Object} Connection details and statistics
 */
router.get('/database/connection', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const connectionStatus = getConnectionStatus();
    
    logger.info('Database connection status requested', {
      type: 'connection-status-check',
      userId: req.user.id,
      connectionStatus: connectionStatus.status
    });

    res.status(200).json({
      success: true,
      message: 'Database connection status retrieved',
      data: {
        ...connectionStatus,
        timestamp: new Date().toISOString(),
        poolInfo: {
          maxPoolSize: process.env.DB_MAX_POOL_SIZE || 10,
          minPoolSize: process.env.DB_MIN_POOL_SIZE || 2,
          currentConnections: 'Available in mongoose v6+' // Note: Actual pool metrics would need additional setup
        }
      }
    });

  } catch (error) {
    logger.error('Connection status check error', {
      type: 'connection-status-error',
      userId: req.user?.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve connection status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/health/database/ping
 * @desc    Ping database connection
 * @access  Admin only
 * @returns {Object} Ping result với response time
 */
router.post('/database/ping', authMiddleware, requireAdmin, async (req, res) => {
  try {
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected',
        data: {
          isConnected: false,
          timestamp: new Date().toISOString()
        }
      });
    }

    const startTime = Date.now();
    
    // Direct ping to database
    const mongoose = require('mongoose');
    await mongoose.connection.db.admin().ping();
    
    const responseTime = Date.now() - startTime;

    logger.info('Database ping requested', {
      type: 'database-ping',
      userId: req.user.id,
      responseTime: `${responseTime}ms`
    });

    res.status(200).json({
      success: true,
      message: 'Database ping successful',
      data: {
        isConnected: true,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Database ping error', {
      type: 'database-ping-error',
      userId: req.user?.id,
      error: error.message
    });

    res.status(503).json({
      success: false,
      message: 'Database ping failed',
      data: {
        isConnected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * ============================================================================
 * SYSTEM HEALTH ROUTES
 * ============================================================================
 */

/**
 * @route   GET /api/health
 * @desc    Overall system health check
 * @access  Public
 * @returns {Object} System health status
 */
router.get('/', async (req, res) => {
  try {
    const dbHealth = await healthCheck();
    
    // System health summary
    const systemHealth = {
      status: dbHealth.status === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.API_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      services: {
        database: {
          status: dbHealth.status,
          responseTime: dbHealth.responseTime
        },
        api: {
          status: 'healthy',
          port: process.env.PORT || 5000
        }
      }
    };

    // Add Redis status if configured
    if (process.env.REDIS_URL) {
      systemHealth.services.redis = {
        status: 'unknown', // Would need Redis ping implementation
        note: 'Redis status check not implemented yet'
      };
    }

    logger.info('System health check requested', {
      type: 'system-health-check',
      ip: req.ip,
      status: systemHealth.status
    });

    const statusCode = systemHealth.status === 'healthy' ? 200 : 207; // 207 Multi-Status for partial health
    
    res.status(statusCode).json({
      success: systemHealth.status === 'healthy',
      message: `System is ${systemHealth.status}`,
      data: systemHealth
    });

  } catch (error) {
    logger.error('System health check error', {
      type: 'system-health-error',
      error: error.message,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      message: 'System health check failed',
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Internal server error'
      }
    });
  }
});

module.exports = router;