
/**
 * CheckInn API// Import simplified database functions
const { connectDB, gracefulDisconnect } = require('./src/config/database.simple');* 
 * Production-ready Express server với comprehensive middleware,
 * security measures, monitoring, và error handling
 * 
 * @author CheckInn Team
 * @version 2.0.0
 */

// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

// Import database functions
let connectDB, gracefulDisconnect;
try {
  const dbModule = require('./src/config/database.simple');
  connectDB = dbModule.connectDB;
  gracefulDisconnect = dbModule.gracefulDisconnect;
  console.log('✅ Database config loaded successfully');
} catch (error) {
  console.log('⚠️  Database config not found:', error.message);
  connectDB = null;
  gracefulDisconnect = null;
}

/**
 * ============================================================================
 * APPLICATION SETUP
 * ============================================================================
 */

// Create Express application
const app = express();

// Trust proxy (for accurate IP addresses behind reverse proxy)
app.set('trust proxy', 1);

// Disable X-Powered-By header for security
app.disable('x-powered-by');

/**
 * ============================================================================
 * BASIC MIDDLEWARE SETUP
 * ============================================================================
 */

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

/**
 * ============================================================================
 * STATIC FILES
 * ============================================================================
 */

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'public')));

/**
 * ============================================================================
 * HEALTH CHECKS & MONITORING
 * ============================================================================
 */

// Health check endpoint (before rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic info endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🏨 Welcome to CheckInn API',
    version: '2.0.0',
    status: 'Running',
    documentation: '/api/docs',
    health: '/health',
    timestamp: new Date().toISOString(),
    features: [
      'Advanced Security',
      'Rate Limiting',
      'Request Logging',
      'Error Tracking',
      'Performance Monitoring'
    ]
  });
});

/**
 * ============================================================================
 * API ROUTES
 * ============================================================================
 */

// Try to load API routes with simple middleware
try {
  const mainRouter = require('./src/routes');
  app.use('/api', mainRouter);
  console.log('✅ API routes loaded successfully with simple middleware');
} catch (error) {
  console.log('⚠️  API routes not loaded:', error.message);
  console.log('🔄 Server will continue with basic endpoints only');
}

// API documentation route (if implemented)
app.get('/api/docs', (req, res) => {
  res.json({
    message: 'API Documentation',
    version: '2.0.0',
    endpoints: {
      authentication: '/api/auth',
      users: '/api/users',
      hotels: '/api/hotels',
      rooms: '/api/rooms',
      bookings: '/api/bookings',
      reviews: '/api/reviews'
    },
    postman: {
      collection: '/api/postman-collection',
      environment: '/api/postman-environment'
    }
  });
});

/**
 * ============================================================================
 * API ROUTES
 * ============================================================================
 */

// Basic API endpoints
app.get('/api', (req, res) => {
  res.json({
    message: 'CheckInn API v2.0.0',
    status: 'Active',
    endpoints: {
      health: '/health',
      api: '/api'
    },
    timestamp: new Date().toISOString()
  });
});

// Connect to MongoDB when server starts
if (connectDB) {
  connectDB().catch(err => {
    console.error('⚠️  Failed to connect to MongoDB:', err.message);
    console.log('🔄 Server will continue without database');
  });
} else {
  console.log('⚠️  No database connection function available');
}

/**
 * ============================================================================
 * ERROR HANDLING
 * ============================================================================
 */

// Handle undefined routes (404) - Fixed wildcard syntax
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    error: 'NOT_FOUND'
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error.message);
  
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    error: error.name || 'SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

/**
 * ============================================================================
 * SERVER STARTUP
 * ============================================================================
 */

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Server started successfully on ${HOST}:${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🕒 Started at: ${new Date().toISOString()}`);
  console.log(`
  🚀 CheckInn API Server is running!
  
  📍 Server: http://${HOST}:${PORT}
  🌐 Environment: ${process.env.NODE_ENV || 'development'}
  ❤️  Health: http://${HOST}:${PORT}/health
  🔗 API Info: http://${HOST}:${PORT}/api
  
  Ready to accept connections!
  `);
});

/**
 * ============================================================================
 * GRACEFUL SHUTDOWN
 * ============================================================================
 */

// Handle graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️  Received ${signal}. Shutting down gracefully...`);

  server.close(async (err) => {
    if (err) {
      console.error('❌ Error during server shutdown:', err.message);
      process.exit(1);
    }

    console.log('✅ Server closed successfully');

    // Close database connection gracefully
    try {
      if (gracefulDisconnect) {
        await gracefulDisconnect();
      } else {
        console.log('✅ Server shutdown complete');
      }
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during database disconnection:', error.message);
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown - timeout exceeded');
    process.exit(1);
  }, 30000);
};

// Listen for shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle process warnings
process.on('warning', (warning) => {
  console.warn('⚠️  Process warning:', warning.message);
});

// Export app for testing
module.exports = app;
