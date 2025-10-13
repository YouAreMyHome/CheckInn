/**
 * Validation Middleware for CheckInn Hotel Booking Platform
 * 
 * Comprehensive input validation, sanitization, và data integrity checks
 * sử dụng Joi và custom validators
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const Joi = require('joi');
const mongoose = require('mongoose');
const validator = require('validator');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ActivityTracker = require('../utils/activityTracker');

/**
 * ============================================================================
 * CORE VALIDATION SCHEMAS
 * ============================================================================
 */

/**
 * User validation schemas
 */
const userSchemas = {
  register: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-ZÀ-ỹ\s]+$/)
      .required()
      .messages({
        'string.pattern.base': 'Name can only contain letters and spaces',
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 50 characters'
      }),
    
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address'
      }),
    
    password: Joi.string()
      .min(8)
      .max(128)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.max': 'Password cannot exceed 128 characters'
      }),
    
    phone: Joi.string()
      .pattern(/^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/)
      .required()
      .messages({
        'string.pattern.base': 'Please provide a valid Vietnamese phone number'
      }),
    
    role: Joi.string()
      .valid('Customer', 'HotelPartner', 'Admin')
      .default('Customer'),
    
    dateOfBirth: Joi.date()
      .max('now')
      .min('1900-01-01')
      .optional(),
    
    gender: Joi.string()
      .valid('Male', 'Female', 'Other')
      .optional()
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required(),
    
    password: Joi.string()
      .required(),
    
    rememberMe: Joi.boolean()
      .default(false)
  }),

  updateProfile: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-ZÀ-ỹ\s]+$/),
    
    phone: Joi.string()
      .pattern(/^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/),
    
    dateOfBirth: Joi.date()
      .max('now')
      .min('1900-01-01'),
    
    gender: Joi.string()
      .valid('Male', 'Female', 'Other'),
    
    address: Joi.object({
      street: Joi.string().max(100),
      city: Joi.string().max(50),
      state: Joi.string().max(50),
      country: Joi.string().max(50),
      zipCode: Joi.string().max(20)
    }),
    
    preferences: Joi.object({
      language: Joi.string().valid('vi', 'en').default('vi'),
      currency: Joi.string().valid('VND', 'USD', 'EUR').default('VND'),
      notifications: Joi.object({
        email: Joi.boolean().default(true),
        sms: Joi.boolean().default(false),
        push: Joi.boolean().default(true)
      })
    })
  })
};

/**
 * Hotel validation schemas
 */
const hotelSchemas = {
  create: Joi.object({
    name: Joi.string()
      .min(3)
      .max(100)
      .required()
      .messages({
        'string.min': 'Hotel name must be at least 3 characters',
        'string.max': 'Hotel name cannot exceed 100 characters'
      }),
    
    description: Joi.string()
      .min(50)
      .max(2000)
      .required()
      .messages({
        'string.min': 'Description must be at least 50 characters',
        'string.max': 'Description cannot exceed 2000 characters'
      }),
    
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      zipCode: Joi.string().required()
    }).required(),
    
    location: Joi.object({
      type: Joi.string().valid('Point').default('Point'),
      coordinates: Joi.array()
        .items(Joi.number())
        .length(2)
        .required()
        .custom((value, helpers) => {
          const [lng, lat] = value;
          if (lng < -180 || lng > 180) {
            return helpers.error('any.invalid', { message: 'Longitude must be between -180 and 180' });
          }
          if (lat < -90 || lat > 90) {
            return helpers.error('any.invalid', { message: 'Latitude must be between -90 and 90' });
          }
          return value;
        })
    }).required(),
    
    contact: Joi.object({
      phone: Joi.string()
        .pattern(/^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/)
        .required(),
      email: Joi.string().email().required(),
      website: Joi.string().uri().optional()
    }).required(),
    
    starRating: Joi.number()
      .min(1)
      .max(5)
      .required(),
    
    amenities: Joi.array()
      .items(Joi.string())
      .min(1)
      .required(),
    
    policies: Joi.object({
      checkIn: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
      checkOut: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
      cancellation: Joi.string().required(),
      petPolicy: Joi.string().optional(),
      smokingPolicy: Joi.string().optional()
    }).required(),
    
    images: Joi.array()
      .items(Joi.string().uri())
      .min(1)
      .max(20)
      .required()
  }),

  search: Joi.object({
    location: Joi.string().optional(),
    coordinates: Joi.array().items(Joi.number()).length(2).optional(),
    radius: Joi.number().min(1).max(100).default(10),
    checkIn: Joi.date().min('now').optional(),
    checkOut: Joi.date().when('checkIn', {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref('checkIn')),
      otherwise: Joi.optional()
    }),
    guests: Joi.number().min(1).max(10).default(1),
    rooms: Joi.number().min(1).max(5).default(1),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().when('minPrice', {
      is: Joi.exist(),
      then: Joi.number().min(Joi.ref('minPrice')),
      otherwise: Joi.number().min(0)
    }),
    starRating: Joi.array().items(Joi.number().min(1).max(5)).optional(),
    amenities: Joi.array().items(Joi.string()).optional(),
    sortBy: Joi.string()
      .valid('price', 'rating', 'distance', 'name', 'popularity')
      .default('popularity'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20)
  })
};

/**
 * Room validation schemas
 */
const roomSchemas = {
  create: Joi.object({
    hotel: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid hotel ID format'
      }),
    
    name: Joi.string()
      .min(3)
      .max(100)
      .required(),
    
    type: Joi.string()
      .valid('Standard', 'Deluxe', 'Suite', 'Presidential', 'Family', 'Business')
      .required(),
    
    capacity: Joi.number()
      .min(1)
      .max(10)
      .required(),
    
    bedConfiguration: Joi.array()
      .items(Joi.object({
        type: Joi.string().valid('Single', 'Double', 'Queen', 'King', 'Sofa').required(),
        quantity: Joi.number().min(1).max(5).required()
      }))
      .min(1)
      .required(),
    
    size: Joi.number()
      .min(10)
      .max(500)
      .required(),
    
    pricing: Joi.object({
      basePrice: Joi.number().min(0).required(),
      currency: Joi.string().valid('VND', 'USD').default('VND'),
      weekendSurcharge: Joi.number().min(0).default(0),
      holidaySurcharge: Joi.number().min(0).default(0)
    }).required(),
    
    amenities: Joi.array()
      .items(Joi.string())
      .min(1)
      .required(),
    
    images: Joi.array()
      .items(Joi.string().uri())
      .min(1)
      .max(15)
      .required(),
    
    policies: Joi.object({
      smokingAllowed: Joi.boolean().default(false),
      petsAllowed: Joi.boolean().default(false),
      extraBedAvailable: Joi.boolean().default(false),
      maxExtraBeds: Joi.number().min(0).max(3).default(0)
    })
  }),

  availability: Joi.object({
    roomIds: Joi.array()
      .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
      .optional(),
    
    hotelId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .when('roomIds', {
        is: Joi.array().length(0).optional(),
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
    
    checkIn: Joi.date()
      .min('now')
      .required(),
    
    checkOut: Joi.date()
      .min(Joi.ref('checkIn'))
      .required(),
    
    guests: Joi.number()
      .min(1)
      .max(10)
      .default(1)
  })
};

/**
 * Booking validation schemas
 */
const bookingSchemas = {
  create: Joi.object({
    hotelId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required(),
    
    roomId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required(),
    
    checkIn: Joi.date()
      .min('now')
      .required(),
    
    checkOut: Joi.date()
      .min(Joi.ref('checkIn'))
      .required(),
    
    guests: Joi.array()
      .items(Joi.object({
        firstName: Joi.string().min(1).max(50).required(),
        lastName: Joi.string().min(1).max(50).required(),
        age: Joi.number().min(0).max(120).optional(),
        idNumber: Joi.string().max(50).optional(),
        isMainGuest: Joi.boolean().default(false)
      }))
      .min(1)
      .max(10)
      .required(),
    
    specialRequests: Joi.string()
      .max(500)
      .optional(),
    
    promoCode: Joi.string()
      .max(20)
      .optional(),
    
    paymentMethod: Joi.string()
      .valid('Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Cash')
      .default('Credit Card')
  })
};

/**
 * Review validation schemas
 */
const reviewSchemas = {
  create: Joi.object({
    bookingId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required(),
    
    hotelId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required(),
    
    roomId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required(),
    
    overallRating: Joi.number()
      .min(1)
      .max(5)
      .required(),
    
    detailedRating: Joi.object({
      cleanliness: Joi.number().min(1).max(5).required(),
      comfort: Joi.number().min(1).max(5).required(),
      location: Joi.number().min(1).max(5).required(),
      facilities: Joi.number().min(1).max(5).required(),
      staff: Joi.number().min(1).max(5).required(),
      valueForMoney: Joi.number().min(1).max(5).required()
    }).required(),
    
    reviewText: Joi.string()
      .min(10)
      .max(2000)
      .required(),
    
    pros: Joi.array()
      .items(Joi.string().max(100))
      .max(5)
      .optional(),
    
    cons: Joi.array()
      .items(Joi.string().max(100))
      .max(5)
      .optional(),
    
    images: Joi.array()
      .items(Joi.string().uri())
      .max(10)
      .optional()
  })
};

/**
 * ============================================================================
 * VALIDATION MIDDLEWARE FUNCTIONS
 * ============================================================================
 */

/**
 * Generic validation middleware factory
 */
const validate = (schema, property = 'body') => {
  return catchAsync(async (req, res, next) => {
    const startTime = Date.now();
    
    // Get data to validate
    const dataToValidate = req[property];
    
    // Log validation attempt
    console.log(`Validation for ${property}:`, dataToValidate);
    
    // Validate data
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      // Format validation errors
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      console.log('Validation errors:', errors);

      // Track validation failure
      await ActivityTracker.trackActivity({
        activityType: 'validation_error',
        req,
        userId: req.user?._id,
        customData: {
          validationErrors: errors,
          validationTime: Date.now() - startTime,
          property
        }
      });

      return next(new AppError('Validation failed', 400, { errors }));
    }

    // Replace request data với validated và sanitized data
    req[property] = value;
    
    // Track successful validation
    const validationTime = Date.now() - startTime;
    if (validationTime > 100) { // Only track slow validations
      await ActivityTracker.trackActivity({
        activityType: 'slow_validation',
        req,
        userId: req.user?._id,
        customData: {
          validationTime,
          property,
          dataSize: JSON.stringify(dataToValidate).length
        }
      });
    }

    next();
  });
};

/**
 * ============================================================================
 * SPECIALIZED VALIDATORS
 * ============================================================================
 */

/**
 * MongoDB ObjectId validator
 */
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!mongoose.isValidObjectId(id)) {
      return next(new AppError(`Invalid ${paramName} format`, 400));
    }
    
    next();
  };
};

/**
 * File upload validator
 */
const validateFileUpload = (options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles = 10
  } = options;

  return (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const errors = [];

    // Check file count
    if (req.files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
    }

    // Validate each file
    req.files.forEach((file, index) => {
      // Check file size
      if (file.size > maxSize) {
        errors.push(`File ${index + 1} exceeds maximum size of ${maxSize / 1024 / 1024}MB`);
      }

      // Check mime type
      if (!allowedMimeTypes.includes(file.mimetype)) {
        errors.push(`File ${index + 1} has invalid type. Allowed: ${allowedMimeTypes.join(', ')}`);
      }
    });

    if (errors.length > 0) {
      return next(new AppError('File validation failed', 400, { errors }));
    }

    next();
  };
};

/**
 * Sanitize HTML content
 */
const sanitizeHtml = (fields = []) => {
  return (req, res, next) => {
    fields.forEach(field => {
      const value = req.body[field];
      if (typeof value === 'string') {
        // Basic HTML sanitization
        req.body[field] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
          .trim();
      }
    });
    next();
  };
};

/**
 * Rate limiting validator
 */
const validateRateLimit = (windowMs, maxRequests, keyGenerator) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = keyGenerator ? keyGenerator(req) : req.ip;
    const now = Date.now();
    const userRequests = requests.get(key) || [];

    // Remove old requests
    const validRequests = userRequests.filter(time => now - time < windowMs);

    if (validRequests.length >= maxRequests) {
      return next(new AppError('Rate limit exceeded', 429));
    }

    // Add current request
    validRequests.push(now);
    requests.set(key, validRequests);

    next();
  };
};

/**
 * ============================================================================
 * EXPORT VALIDATION MIDDLEWARE
 * ============================================================================
 */

module.exports = {
  // Validation schemas
  userSchemas,
  hotelSchemas,
  roomSchemas,
  bookingSchemas,
  reviewSchemas,
  
  // Middleware functions
  validate,
  validateObjectId,
  validateFileUpload,
  sanitizeHtml,
  validateRateLimit,
  
  // Authentication validators
  validateRegister: validate(userSchemas.register),
  validateLogin: validate(userSchemas.login),
  validateEmail: (req, res, next) => {
    const emailSchema = Joi.object({
      email: Joi.string().email().required()
    });
    
    const { error, value } = emailSchema.validate(req.body);
    if (error) {
      return next(new AppError('Valid email is required', 400));
    }
    req.body = value;
    next();
  },
  validatePasswordReset: (req, res, next) => {
    const resetSchema = Joi.object({
      password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required(),
      passwordConfirm: Joi.string().valid(Joi.ref('password')).required()
    });
    
    const { error, value } = resetSchema.validate(req.body);
    if (error) {
      return next(new AppError('Password validation failed', 400));
    }
    req.body = value;
    next();
  },
  validatePasswordUpdate: (req, res, next) => {
    const updateSchema = Joi.object({
      passwordCurrent: Joi.string().required(),
      password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required(),
      passwordConfirm: Joi.string().valid(Joi.ref('password')).required()
    });
    
    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return next(new AppError('Password update validation failed', 400));
    }
    req.body = value;
    next();
  },
  validateUserUpdate: validate(userSchemas.updateProfile),
  
  validateHotelCreate: validate(hotelSchemas.create),
  validateHotelSearch: validate(hotelSchemas.search, 'query'),
  
  validateRoomCreate: validate(roomSchemas.create),
  validateRoomAvailability: validate(roomSchemas.availability),
  
  validateBookingCreate: validate(bookingSchemas.create),
  
  validateReviewCreate: validate(reviewSchemas.create)
};