/**
 * Simple Health Routes for Testing  
 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Health check passed',
    timestamp: new Date().toISOString()
  });
});

router.get('/detailed', (req, res) => {
  res.json({
    status: 'OK',
    database: 'connected',
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;