/**
 * Simple Authentication Routes for Testing
 */

const express = require('express');
const router = express.Router();

// Simple test routes without complex middleware
router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint' });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout endpoint' });
});

module.exports = router;