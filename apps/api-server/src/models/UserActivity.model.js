/**
 * UserActivity Model for CheckInn Hotel Booking Platform
 * 
 * Theo dõi và phân tích hành vi người dùng với:
 * - User behavior tracking & analytics
 * - Security monitoring & fraud detection
 * - Performance optimization insights
 * - Marketing attribution & conversion funnel
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const mongoose = require('mongoose');

/**
 * Sub-schema: Device & Browser Information
 * Thông tin chi tiết về thiết bị và trình duyệt
 */
const deviceInfoSchema = new mongoose.Schema({
  userAgent: String, // Full user agent string
  browser: {
    name: String,    // Chrome, Firefox, Safari, etc.
    version: String
  },
  os: {
    name: String,    // Windows, macOS, iOS, Android
    version: String
  },
  device: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    },
    model: String,   // iPhone 12, Samsung Galaxy, etc.
    vendor: String   // Apple, Samsung, etc.
  },
  screen: {
    width: Number,
    height: Number,
    pixelRatio: Number
  }
});

/**
 * Sub-schema: Location Information
 * Thông tin địa lý và mạng
 */
const locationInfoSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
    index: true
  },
  country: String,
  region: String,
  city: String,
  timezone: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  isp: String,      // Internet Service Provider
  isVPN: {
    type: Boolean,
    default: false
  },
  isTor: {
    type: Boolean,
    default: false
  }
});

/**
 * Sub-schema: Page Performance Metrics
 * Metrics về performance của trang web
 */
const performanceMetricsSchema = new mongoose.Schema({
  loadTime: Number,        // Thời gian load trang (ms)
  domContentLoaded: Number, // DOMContentLoaded time (ms)
  firstPaint: Number,      // First Paint time (ms)
  firstContentfulPaint: Number, // First Contentful Paint (ms)
  largestContentfulPaint: Number, // LCP (ms)
  cumulativeLayoutShift: Number,  // CLS score
  firstInputDelay: Number,        // FID (ms)
  totalBlockingTime: Number       // TBT (ms)
});

/**
 * Sub-schema: Search & Filter Data
 * Dữ liệu tìm kiếm và lọc
 */
const searchDataSchema = new mongoose.Schema({
  query: String,           // Search query string
  location: String,        // Location searched
  checkInDate: Date,       // Check-in date searched
  checkOutDate: Date,      // Check-out date searched
  guests: Number,          // Number of guests
  priceRange: {
    min: Number,
    max: Number
  },
  filters: {
    starRating: [Number],  // Star ratings selected
    amenities: [String],   // Amenities filtered
    roomType: [String],    // Room types filtered
    hotelType: [String]    // Hotel types filtered
  },
  sortBy: String,          // Sort criteria used
  resultsCount: Number     // Number of results returned
});

/**
 * Sub-schema: E-commerce Tracking
 * Theo dõi hành vi mua hàng và conversion
 */
const ecommerceDataSchema = new mongoose.Schema({
  // Funnel stages
  funnelStage: {
    type: String,
    enum: [
      'awareness',     // Landing page, search
      'interest',      // Hotel listing, filtering
      'consideration', // Hotel details, comparison
      'intent',        // Room selection, date selection
      'purchase',      // Booking form, payment
      'retention'      // Review, repeat booking
    ]
  },
  
  // Product interaction
  productInteraction: {
    hotelId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Hotel'
    },
    roomId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Room'
    },
    action: {
      type: String,
      enum: ['view', 'wishlist', 'compare', 'book', 'abandon']
    },
    duration: Number,    // Time spent on product (seconds)
    scrollDepth: Number  // Scroll depth percentage
  },
  
  // Conversion data
  conversion: {
    isConversion: {
      type: Boolean,
      default: false
    },
    conversionType: {
      type: String,
      enum: ['booking', 'signup', 'newsletter', 'contact']
    },
    value: Number,       // Conversion value (booking amount)
    bookingId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Booking'
    }
  },
  
  // Attribution
  attribution: {
    source: String,      // google, facebook, direct, email
    medium: String,      // organic, cpc, social, referral
    campaign: String,    // Campaign name
    content: String,     // Ad content
    term: String,        // Search term
    firstTouch: Boolean, // Is this first touch?
    lastTouch: Boolean   // Is this last touch before conversion?
  }
});

/**
 * Main UserActivity Schema
 * Schema chính theo dõi tất cả hoạt động người dùng
 */
const userActivitySchema = new mongoose.Schema({
  // === USER REFERENCE ===
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    sparse: true,   // Có thể null cho anonymous users
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true     // Session tracking cho anonymous users
  },
  fingerprint: {
    type: String,
    index: true     // Browser fingerprint for tracking
  },
  
  // === ACTIVITY TYPE ===
  activityType: {
    type: String,
    required: true,
    enum: [
      // Authentication
      'login', 'logout', 'register', 'password_reset',
      
      // Navigation
      'page_view', 'page_leave', 'navigation',
      
      // Search & Discovery
      'search', 'filter', 'sort', 'pagination',
      
      // Product Interaction
      'hotel_view', 'room_view', 'image_gallery', 'map_view',
      'wishlist_add', 'wishlist_remove', 'comparison_add',
      
      // Booking Flow
      'booking_start', 'booking_step', 'booking_abandon', 'booking_complete',
      'payment_start', 'payment_complete', 'payment_fail',
      
      // Content Interaction
      'review_read', 'review_write', 'review_helpful',
      'contact_form', 'newsletter_signup',
      
      // Errors & Issues
      'error_404', 'error_500', 'javascript_error', 'api_error', 'validation_error',
      
      // Security
      'suspicious_activity', 'rate_limit_hit', 'failed_login'
    ],
    index: true
  },
  
  // === ACTIVITY DETAILS ===
  activityData: {
    // Page/URL information
    page: {
      url: String,
      title: String,
      referrer: String,
      path: String
    },
    
    // Interaction details
    element: {
      type: String,      // button, link, form, image
      id: String,        // Element ID
      className: String, // CSS class
      text: String,      // Element text content
      position: {        // Element position on page
        x: Number,
        y: Number
      }
    },
    
    // Form data (for form submissions)
    formData: {
      formName: String,
      fields: [String],  // Field names interacted with
      errors: [String],  // Validation errors encountered
      completionTime: Number // Time to complete form (seconds)
    },
    
    // Custom event data
    customData: mongoose.Schema.Types.Mixed
  },
  
  // === CONTEXT INFORMATION ===
  deviceInfo: deviceInfoSchema,
  locationInfo: locationInfoSchema,
  performanceMetrics: performanceMetricsSchema,
  
  // === BUSINESS SPECIFIC DATA ===
  searchData: searchDataSchema,
  ecommerceData: ecommerceDataSchema,
  
  // === TIMING ===
  timestamp: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number,
    min: 0 // Duration of activity in milliseconds
  },
  
  // === FLAGS & STATUS ===
  isBot: {
    type: Boolean,
    default: false,
    index: true
  },
  isSuspicious: {
    type: Boolean,
    default: false,
    index: true
  },
  isProcessed: {
    type: Boolean,
    default: false,
    index: true // For batch processing
  },
  
  // === A/B TESTING ===
  experiments: [{
    name: String,        // Experiment name
    variant: String,     // A, B, C, etc.
    startDate: Date,
    endDate: Date
  }]
}, {
  timestamps: true,
  // Optimize for read performance
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * PERFORMANCE INDEXES
 * Tối ưu cho các query patterns phổ biến
 */

// Primary indexes
userActivitySchema.index({ timestamp: -1 }); // Time-series queries
userActivitySchema.index({ user: 1, timestamp: -1 }); // User activity timeline
userActivitySchema.index({ sessionId: 1, timestamp: 1 }); // Session analysis
userActivitySchema.index({ activityType: 1, timestamp: -1 }); // Activity type analysis

// Compound indexes for analytics
userActivitySchema.index({ 
  activityType: 1, 
  'locationInfo.country': 1, 
  timestamp: -1 
}); // Geographic analysis

userActivitySchema.index({ 
  'ecommerceData.funnelStage': 1, 
  timestamp: -1 
}); // Funnel analysis

userActivitySchema.index({ 
  'deviceInfo.device.type': 1, 
  timestamp: -1 
}); // Device analysis

// Security & monitoring indexes
userActivitySchema.index({ 'locationInfo.ip': 1, timestamp: -1 });
userActivitySchema.index({ isSuspicious: 1, timestamp: -1 });
userActivitySchema.index({ isBot: 1, timestamp: -1 });

// A/B testing indexes
userActivitySchema.index({ 'experiments.name': 1, 'experiments.variant': 1 });

/**
 * VIRTUAL FIELDS
 */

// Virtual: Get user's local time
userActivitySchema.virtual('localTime').get(function() {
  if (this.locationInfo?.timezone && this.timestamp) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: this.locationInfo.timezone,
      dateStyle: 'full',
      timeStyle: 'long'
    }).format(this.timestamp);
  }
  return this.timestamp;
});

// Virtual: Check if activity happened today
userActivitySchema.virtual('isToday').get(function() {
  const today = new Date();
  const activityDate = new Date(this.timestamp);
  return activityDate.toDateString() === today.toDateString();
});

// Virtual: Device category for analytics
userActivitySchema.virtual('deviceCategory').get(function() {
  const deviceType = this.deviceInfo?.device?.type;
  if (!deviceType || deviceType === 'unknown') return 'Other';
  
  switch(deviceType) {
    case 'mobile': return 'Mobile';
    case 'tablet': return 'Tablet';
    case 'desktop': return 'Desktop';
    default: return 'Other';
  }
});

/**
 * PRE-SAVE MIDDLEWARE
 */
userActivitySchema.pre('save', function(next) {
  // Auto-detect bot based on user agent
  if (this.deviceInfo?.userAgent) {
    const botPatterns = [
      /bot/i, /spider/i, /crawler/i, /scraper/i, 
      /lighthouse/i, /pagespeed/i, /gtmetrix/i
    ];
    this.isBot = botPatterns.some(pattern => pattern.test(this.deviceInfo.userAgent));
  }
  
  // Flag suspicious activity
  this.isSuspicious = this.checkSuspiciousActivity();
  
  // Generate fingerprint if not exists
  if (!this.fingerprint && this.deviceInfo) {
    this.fingerprint = this.generateFingerprint();
  }
  
  next();
});

/**
 * STATIC METHODS
 */

// Get user journey for a session
userActivitySchema.statics.getUserJourney = function(sessionId, limit = 100) {
  return this.find({ sessionId })
    .sort({ timestamp: 1 })
    .limit(limit)
    .select('activityType activityData.page timestamp duration')
    .lean();
};

// Get conversion funnel data
userActivitySchema.statics.getConversionFunnel = function(startDate, endDate, filters = {}) {
  const pipeline = [
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate },
        'ecommerceData.funnelStage': { $exists: true },
        ...filters
      }
    },
    {
      $group: {
        _id: '$ecommerceData.funnelStage',
        totalUsers: { $addToSet: '$user' },
        totalSessions: { $addToSet: '$sessionId' },
        totalEvents: { $sum: 1 }
      }
    },
    {
      $project: {
        stage: '$_id',
        uniqueUsers: { $size: '$totalUsers' },
        uniqueSessions: { $size: '$totalSessions' },
        totalEvents: 1
      }
    },
    { $sort: { stage: 1 } }
  ];
  
  return this.aggregate(pipeline);
};

// Get real-time analytics
userActivitySchema.statics.getRealTimeStats = function(minutes = 30) {
  const startTime = new Date(Date.now() - (minutes * 60 * 1000));
  
  return this.aggregate([
    { $match: { timestamp: { $gte: startTime }, isBot: { $ne: true } } },
    {
      $group: {
        _id: null,
        totalPageViews: {
          $sum: { $cond: [{ $eq: ['$activityType', 'page_view'] }, 1, 0] }
        },
        uniqueVisitors: { $addToSet: '$sessionId' },
        activeUsers: { $addToSet: '$user' },
        topPages: { $push: '$activityData.page.path' },
        deviceBreakdown: { $push: '$deviceInfo.device.type' }
      }
    },
    {
      $project: {
        totalPageViews: 1,
        uniqueVisitors: { $size: '$uniqueVisitors' },
        activeUsers: { $size: { $filter: { input: '$activeUsers', cond: { $ne: ['$$this', null] } } } },
        topPages: 1,
        deviceBreakdown: 1
      }
    }
  ]);
};

// Performance analytics
userActivitySchema.statics.getPerformanceMetrics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate },
        'performanceMetrics.loadTime': { $exists: true }
      }
    },
    {
      $group: {
        _id: '$activityData.page.path',
        avgLoadTime: { $avg: '$performanceMetrics.loadTime' },
        avgFCP: { $avg: '$performanceMetrics.firstContentfulPaint' },
        avgLCP: { $avg: '$performanceMetrics.largestContentfulPaint' },
        avgCLS: { $avg: '$performanceMetrics.cumulativeLayoutShift' },
        sampleSize: { $sum: 1 }
      }
    },
    { $sort: { avgLoadTime: -1 } }
  ]);
};

/**
 * INSTANCE METHODS
 */

// Check if activity is suspicious
userActivitySchema.methods.checkSuspiciousActivity = function() {
  // Multiple rapid requests from same IP
  if (this.activityType === 'page_view' && this.duration < 100) return true;
  
  // VPN/Tor usage with high-value actions
  if ((this.locationInfo?.isVPN || this.locationInfo?.isTor) && 
      ['booking_complete', 'payment_complete'].includes(this.activityType)) {
    return true;
  }
  
  // Unusual device characteristics
  if (this.deviceInfo?.screen?.width < 100 || this.deviceInfo?.screen?.height < 100) {
    return true;
  }
  
  return false;
};

// Generate browser fingerprint
userActivitySchema.methods.generateFingerprint = function() {
  const crypto = require('crypto');
  
  const components = [
    this.deviceInfo?.userAgent || '',
    this.deviceInfo?.screen?.width || 0,
    this.deviceInfo?.screen?.height || 0,
    this.deviceInfo?.screen?.pixelRatio || 1,
    this.locationInfo?.timezone || '',
    this.deviceInfo?.browser?.name || '',
    this.deviceInfo?.os?.name || ''
  ];
  
  const fingerprint = components.join('|');
  return crypto.createHash('sha256').update(fingerprint).digest('hex').substring(0, 16);
};

// Create activity event (static helper)
userActivitySchema.statics.createActivity = async function(activityData) {
  try {
    const activity = new this(activityData);
    await activity.save();
    
    // Trigger real-time analytics if needed
    if (['booking_complete', 'payment_complete'].includes(activity.activityType)) {
      // Emit event for real-time dashboard
      // EventEmitter.emit('conversion', activity);
    }
    
    return activity;
  } catch (error) {
    console.error('Error creating user activity:', error);
    throw error;
  }
};

/**
 * TTL INDEX for data retention
 * Auto-delete records older than 2 years
 */
userActivitySchema.index(
  { timestamp: 1 }, 
  { 
    expireAfterSeconds: 63072000, // 2 years in seconds
    partialFilterExpression: { 
      activityType: { 
        $nin: ['booking_complete', 'payment_complete', 'register'] // Keep important events
      } 
    }
  }
);

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

module.exports = UserActivity;