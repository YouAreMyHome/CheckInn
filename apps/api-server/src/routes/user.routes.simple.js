/**
 * Simple User Routes for Testing
 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Users endpoint' });
});

module.exports = router;