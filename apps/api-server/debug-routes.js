// Test middleware components used in auth route
console.log('🔍 Testing middleware specifically...');

try {
  const middleware = require('./src/middlewares');
  console.log('✅ Middleware loaded');
  
  console.log('middleware.rateLimiting type:', typeof middleware.rateLimiting);
  console.log('middleware.rateLimiting.auth type:', typeof middleware.rateLimiting.auth);
  
  // Test if we can actually use the auth middleware
  if (typeof middleware.rateLimiting.auth === 'function') {
    console.log('✅ Auth rate limiting is a function');
  } else {
    console.log('❌ Auth rate limiting is NOT a function:', middleware.rateLimiting.auth);
  }
  
} catch (error) {
  console.log('❌ Middleware test error:', error.message);
}

// Test loading auth controller + middleware together
try {
  const AuthController = require('./src/controllers/auth.controller');
  const middleware = require('./src/middlewares');
  
  console.log('\n🔍 Testing route setup...');
  const express = require('express');
  const router = express.Router();
  
  // This should simulate the exact line from auth.routes.js
  router.post('/test', middleware.rateLimiting.auth, AuthController.register);
  console.log('✅ Route setup successful');
  
} catch (error) {
  console.log('❌ Route setup error:', error.message);
}