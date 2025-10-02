/**
 * CheckInn API Server - Ultra Simple Version
 * 
 * Chỉ sử dụng Express và MongoDB cơ bản
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'CheckInn API is running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Start server without database first
console.log('🚀 Starting CheckInn API Server...');

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Try to connect to database after server starts
  if (process.env.MONGO_URI) {
    console.log('🔄 Connecting to MongoDB...');
    mongoose.connect(process.env.MONGO_URI)
      .then(() => {
        console.log('✅ MongoDB connected successfully');
      })
      .catch(err => {
        console.log('⚠️  MongoDB connection failed:', err.message);
        console.log('🔄 Server will continue without database');
      });
  } else {
    console.log('⚠️  No MONGO_URI found, skipping database connection');
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️  Shutting down server...');
  server.close(async () => {
    console.log('✅ Server closed');
    if (mongoose.connection.readyState === 1) {
      try {
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
      } catch (error) {
        console.log('⚠️  Database close error:', error.message);
      }
    }
    process.exit(0);
  });
});

module.exports = app;