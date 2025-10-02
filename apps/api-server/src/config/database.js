
/**
 * Enhanced MongoDB Database Configuration for CheckInn Hotel Booking Platform
 * 
 * Production-ready MongoDB connecti    console.log(`
    ✅ MongoDB Connected Successfully!
    
    🏢  Database: ${mongoose.connection.name}
    🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}
    🔗 Connection Pool: ${options.minPoolSize}-${options.maxPoolSize} connections
    📊 Monitoring: Active
    `);pooling, monitoring,
 * error handling, và performance optimization
 * 
 * @author CheckInn Team
 * @version 2.0.0
 */

const mongoose = require('mongoose');
const { logger } = require('../middlewares/logging.middleware');

/**
 * ============================================================================
 * DATABASE CONNECTION CONFIGURATION
 * ============================================================================
 */

/**
 * MongoDB connection options với production optimizations
 */
const getConnectionOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    // Connection Pool Settings
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || (isProduction ? 50 : 10), // Maximum connections
    minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || (isProduction ? 5 : 2),   // Minimum connections
    maxIdleTimeMS: parseInt(process.env.DB_MAX_IDLE_TIME) || 30000, // Close idle connections after 30s
    
    // Connection Timeouts
    serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT) || 5000, // 5s timeout
    socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000, // 45s socket timeout
    connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT) || 10000, // 10s connect timeout
    
    // Write Concern & Read Preference
    writeConcern: {
      w: isProduction ? 'majority' : 1, // Write acknowledgment
      j: isProduction, // Journal acknowledgment in production
      wtimeout: 10000 // Write timeout
    },
    readPreference: 'primary', // Always read from primary
    readConcern: { level: 'local' }, // Read concern level
    
    // Retry Logic
    retryWrites: true, // Retry failed writes
    retryReads: true,  // Retry failed reads
    
    // Heartbeat & Monitoring
    heartbeatFrequencyMS: 10000, // Heartbeat every 10s
    
    // Authentication
    authSource: process.env.DB_AUTH_SOURCE || 'admin',
    
    // App Name for monitoring
    appName: `CheckInn-API-${process.env.NODE_ENV || 'development'}`
  };
};

/**
 * ============================================================================
 * CONNECTION MANAGEMENT
 * ============================================================================
 */

let isConnected = false;
let connectionAttempts = 0;
const maxRetries = parseInt(process.env.DB_MAX_RETRIES) || 5;

/**
 * Enhanced MongoDB connection với retry logic
 */
const connectDB = async () => {
  // Prevent multiple simultaneous connection attempts
  if (mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB already connected');
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2) {
    console.log('🔄 MongoDB connection in progress');
    return new Promise((resolve, reject) => {
      mongoose.connection.once('connected', () => resolve(mongoose.connection));
      mongoose.connection.once('error', reject);
    });
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    const error = new Error('MONGO_URI environment variable is not defined');
    console.error('❌ Database configuration error:', error.message);
    throw error;
  }

  const options = getConnectionOptions();
  
  console.log(`🔄 Attempting MongoDB connection (${connectionAttempts + 1}/${maxRetries})`);

  try {
    connectionAttempts++;
    
    // Set connection timeout
    const connectionPromise = mongoose.connect(mongoUri, options);
    
    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Connection timeout after 15 seconds'));
      }, 15000);
    });

    await Promise.race([connectionPromise, timeoutPromise]);
    
    isConnected = true;
    connectionAttempts = 0; // Reset attempts on successful connection

    logger.info('MongoDB connected successfully', {
      type: 'db-connection-success',
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      dbName: mongoose.connection.name,
      readyState: mongoose.connection.readyState,
      poolSize: options.maxPoolSize
    });

    console.log(`
    ✅ MongoDB Connected Successfully!
    
    🏗️  Database: ${mongoose.connection.name}
    🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}
    🔗 Connection Pool: ${options.minPoolSize}-${options.maxPoolSize} connections
    🛡️  Security: ${options.ssl ? 'SSL Enabled' : 'SSL Disabled'}
    📊 Monitoring: Active
    `);

    return mongoose.connection;

  } catch (error) {
    console.error(`❌ MongoDB connection failed (${connectionAttempts}/${maxRetries}):`, error.message);

    if (connectionAttempts < maxRetries) {
      const retryDelay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000); // Exponential backoff, max 30s
      
      console.log(`🔄 Retrying MongoDB connection in ${retryDelay/1000}s...`);

      console.log(`❌ Connection failed. Retrying in ${retryDelay/1000}s... (${connectionAttempts}/${maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return connectDB(); // Recursive retry
    } else {
      console.error(`❌ MongoDB connection failed after all retries: ${error.message}`);

      console.error(`❌ MongoDB connection failed after ${maxRetries} attempts`);
      
      if (process.env.NODE_ENV === 'production') {
        process.exit(1); // Exit in production
      } else {
        throw error; // Throw in development for debugging
      }
    }
  }
};

/**
 * ============================================================================
 * CONNECTION EVENT HANDLERS
 * ============================================================================
 */

/**
 * Setup MongoDB connection event listeners
 */
const setupConnectionEvents = () => {
  // Connection successful
  mongoose.connection.on('connected', () => {
    isConnected = true;
    logger.info('Mongoose connected to MongoDB', {
      type: 'mongoose-connected',
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      dbName: mongoose.connection.name
    });
  });

  // Connection error
  mongoose.connection.on('error', (error) => {
    isConnected = false;
    logger.error('Mongoose connection error', {
      type: 'mongoose-error',
      error: {
        name: error.name,
        message: error.message,
        code: error.code
      }
    });
    
    console.error('❌ MongoDB Error:', error.message);
  });

  // Connection disconnected
  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    logger.warn('Mongoose disconnected from MongoDB', {
      type: 'mongoose-disconnected',
      timestamp: new Date().toISOString()
    });
    
    console.log('⚠️  MongoDB Disconnected');

    // Attempt reconnection in production
    if (process.env.NODE_ENV === 'production') {
      setTimeout(connectDB, 5000);
    }
  });

  // Application termination
  process.on('SIGINT', async () => {
    await gracefulDisconnect('SIGINT');
  });

  process.on('SIGTERM', async () => {
    await gracefulDisconnect('SIGTERM');
  });

  // Connection restored
  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    logger.info('Mongoose reconnected to MongoDB', {
      type: 'mongoose-reconnected',
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ MongoDB Reconnected');
  });

  // Connection timeout
  mongoose.connection.on('timeout', () => {
    logger.warn('Mongoose connection timeout', {
      type: 'mongoose-timeout',
      timestamp: new Date().toISOString()
    });
  });

  // Index build events
  mongoose.connection.on('index', (details) => {
    logger.info('Index built', {
      type: 'index-built',
      details
    });
  });
};

/**
 * ============================================================================
 * CONNECTION UTILITIES
 * ============================================================================
 */

/**
 * Graceful disconnect từ MongoDB
 */
const gracefulDisconnect = async (signal) => {
  logger.info('Closing MongoDB connection', {
    type: 'db-disconnect-start',
    signal,
    timestamp: new Date().toISOString()
  });

  try {
    await mongoose.connection.close();
    isConnected = false;
    
    logger.info('MongoDB connection closed successfully', {
      type: 'db-disconnect-success',
      signal
    });
    
    console.log('✅ MongoDB connection closed gracefully');
  } catch (error) {
    logger.error('Error closing MongoDB connection', {
      type: 'db-disconnect-error',
      error: error.message
    });
    
    console.error('❌ Error closing MongoDB connection:', error.message);
  }
};

/**
 * Get database connection status
 */
const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    status: states[mongoose.connection.readyState],
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    collections: Object.keys(mongoose.connection.collections),
    models: mongoose.modelNames()
  };
};

/**
 * Database health check
 */
const healthCheck = async () => {
  try {
    if (!isConnected || mongoose.connection.readyState !== 1) {
      return {
        status: 'unhealthy',
        message: 'Database not connected',
        readyState: mongoose.connection.readyState
      };
    }

    // Ping database
    const startTime = Date.now();
    await mongoose.connection.db.admin().ping();
    const responseTime = Date.now() - startTime;

    // Get database stats
    const stats = await mongoose.connection.db.stats();
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      collections: stats.collections,
      dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
      indexSize: `${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`,
      documents: stats.objects,
      indexes: stats.indexes,
      uptime: process.uptime()
    };

  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    
    return {
      status: 'unhealthy',
      error: error.message,
      readyState: mongoose.connection.readyState
    };
  }
};

/**
 * ============================================================================
 * INITIALIZATION
 * ============================================================================
 */

// Setup connection events when module loads
setupConnectionEvents();

/**
 * ============================================================================
 * EXPORTS
 * ============================================================================
 */

module.exports = {
  connectDB,
  gracefulDisconnect,
  getConnectionStatus,
  healthCheck,
  setupConnectionEvents,
  
  // Utilities
  get isConnected() {
    return isConnected;
  },
  
  get connection() {
    return mongoose.connection;
  }
};
