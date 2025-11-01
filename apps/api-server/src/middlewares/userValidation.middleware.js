/**
 * User Validation Middleware
 * 
 * Validates request data for user operations
 * Used with admin user management endpoints
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const { body, param, query, validationResult } = require('express-validator');
const AppError = require('../utils/appError');
const User = require('../models/User.model');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return next(new AppError(`Validation failed: ${errorMessages.map(e => e.message).join(', ')}`, 400));
  }
  
  next();
};

/**
 * Validate user creation data
 */
const validateUserCreate = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .custom(async (email, { req }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('Email already exists');
      }
      return true;
    }),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('role')
    .isIn(['Customer', 'HotelPartner', 'Admin'])
    .withMessage('Role must be Customer, HotelPartner, or Admin'),

  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Valid date of birth is required')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13) {
        throw new Error('User must be at least 13 years old');
      }
      if (age > 120) {
        throw new Error('Invalid date of birth');
      }
      
      return true;
    }),

  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),

  handleValidationErrors
];

/**
 * Validate user update data
 */
const validateUserUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Valid user ID is required'),

  body('fullName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Full name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .custom(async (email, { req }) => {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      if (existingUser) {
        throw new Error('Email already exists');
      }
      return true;
    }),

  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('role')
    .optional()
    .isIn(['Customer', 'HotelPartner', 'Admin'])
    .withMessage('Role must be Customer, HotelPartner, or Admin'),

  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Valid date of birth is required')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13) {
        throw new Error('User must be at least 13 years old');
      }
      if (age > 120) {
        throw new Error('Invalid date of birth');
      }
      
      return true;
    }),

  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  handleValidationErrors
];

/**
 * Validate user status update
 */
const validateUserStatus = [
  param('id')
    .isMongoId()
    .withMessage('Valid user ID is required'),

  body('status')
    .isIn(['active', 'suspended', 'inactive'])
    .withMessage('Status must be active, suspended, or inactive'),

  handleValidationErrors
];

/**
 * Validate bulk operations
 */
const validateBulkDelete = [
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('userIds must be a non-empty array'),

  body('userIds.*')
    .isMongoId()
    .withMessage('All user IDs must be valid MongoDB ObjectIds'),

  handleValidationErrors
];

/**
 * Validate query parameters for user listing
 */
const validateUserQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query must not exceed 100 characters'),

  query('role')
    .optional()
    .isIn(['Customer', 'HotelPartner', 'Admin'])
    .withMessage('Role must be Customer, HotelPartner, or Admin'),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  query('sortBy')
    .optional()
    .isIn(['fullName', 'email', 'role', 'createdAt', 'lastLogin'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),

  handleValidationErrors
];

/**
 * Validate user ID parameter
 */
const validateUserId = [
  param('id')
    .isMongoId()
    .withMessage('Valid user ID is required'),

  handleValidationErrors
];

module.exports = {
  validateUserCreate,
  validateUserUpdate,
  validateUserStatus,
  validateBulkDelete,
  validateUserQuery,
  validateUserId,
  handleValidationErrors
};