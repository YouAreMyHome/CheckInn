/**
 * Admin User Management Routes
 * 
 * All routes require Admin role authentication
 * Protected by auth middleware and role checking
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  updateUserStatus
} = require('../controllers/admin.user.controller');

// Import middlewares
const { protect } = require('../middlewares/auth.simple.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const {
  validateUserCreate,
  validateUserUpdate,
  validateUserStatus,
  validateBulkDelete,
  validateUserQuery,
  validateUserId
} = require('../middlewares/userValidation.middleware');

const router = express.Router();

// Apply authentication and admin role protection to all routes
router.use(protect);
router.use(restrictTo('Admin'));

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filtering, searching and pagination
 * @access  Admin only
 * @query   page, limit, search, role, status, sortBy, sortOrder
 */
router.get('/', validateUserQuery, getUsers);

/**
 * @route   POST /api/admin/users
 * @desc    Create new user
 * @access  Admin only
 * @body    name, email, phone, role, status, location, password (optional)
 */
router.post('/', validateUserCreate, createUser);

/**
 * @route   DELETE /api/admin/users/bulk
 * @desc    Bulk delete multiple users
 * @access  Admin only
 * @body    userIds: Array of user IDs
 */
router.delete('/bulk', validateBulkDelete, bulkDeleteUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get single user by ID with detailed info
 * @access  Admin only
 */
router.get('/:id', (req, res, next) => {
  console.log('🎯 Route hit: GET /:id with ID =', req.params.id);
  next();
}, validateUserId, getUser);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user information
 * @access  Admin only
 * @body    Any user fields (except sensitive ones)
 */
router.put('/:id', validateUserUpdate, updateUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user (soft delete)
 * @access  Admin only
 */
router.delete('/:id', validateUserId, deleteUser);

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Update user status (active/suspended/inactive)
 * @access  Admin only
 * @body    status: 'active' | 'suspended' | 'inactive'
 */
router.patch('/:id/status', validateUserStatus, updateUserStatus);

module.exports = router;