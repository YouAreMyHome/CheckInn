/**
 * Activity Tracker Utility for CheckInn Platform
 * 
 * Centralized utility để track user activities across toàn bộ application
 * Tự động log activities và phân tích behavior patterns
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const UserActivity = require('../models/UserActivity.model');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

/**
 * Activity Tracker Class
 * Main class để track và analyze user activities
 */
class ActivityTracker {
  
  /**
   * Track user activity with comprehensive data collection
   * 
   * @param {Object} options - Activity tracking options
   * @param {string} options.activityType - Type of activity
   * @param {Object} options.req - Express request object
   * @param {string} options.userId - User ID (optional for anonymous)
   * @param {Object} options.customData - Custom activity data
   * @param {number} options.duration - Activity duration in ms
   */
  static async trackActivity(options) {
    try {
      const { 
        activityType, 
        req, 
        userId = null, 
        customData = {}, 
        duration = 0 
      } = options;

      // Extract device and location info from request
      const deviceInfo = this.extractDeviceInfo(req);
      const locationInfo = this.extractLocationInfo(req);
      const sessionId = this.getSessionId(req);
      
      // Build activity data
      const activityData = {
        user: userId,
        sessionId,
        activityType,
        deviceInfo,
        locationInfo,
        duration,
        
        // Page/URL information
        activityData: {
          page: {
            url: req.originalUrl,
            path: req.path,
            method: req.method,
            referrer: req.get('Referer'),
            title: customData.pageTitle
          },
          element: customData.element,
          formData: customData.formData,
          customData
        },
        
        // Performance metrics (if available)
        performanceMetrics: customData.performanceMetrics,
        
        // E-commerce data (if applicable)
        ecommerceData: customData.ecommerceData,
        
        // A/B testing data
        experiments: customData.experiments || []
      };

      // Create activity record
      return await UserActivity.createActivity(activityData);
      
    } catch (error) {
      console.error('Error tracking activity:', error);
      // Don't throw error to avoid breaking main application flow
      return null;
    }
  }

  /**
   * Track page view with performance metrics
   */
  static async trackPageView(req, userId = null, customData = {}) {
    return this.trackActivity({
      activityType: 'page_view',
      req,
      userId,
      customData: {
        pageTitle: customData.title,
        performanceMetrics: customData.performanceMetrics,
        ...customData
      }
    });
  }

  /**
   * Track search activity
   */
  static async trackSearch(req, userId = null, searchData = {}) {
    return this.trackActivity({
      activityType: 'search',
      req,
      userId,
      customData: {
        searchData: {
          query: searchData.query,
          location: searchData.location,
          checkInDate: searchData.checkIn,
          checkOutDate: searchData.checkOut,
          guests: searchData.guests,
          filters: searchData.filters,
          resultsCount: searchData.resultsCount
        }
      }
    });
  }

  /**
   * Track hotel/room view with e-commerce data
   */
  static async trackProductView(req, userId = null, productData = {}) {
    const ecommerceData = {
      funnelStage: productData.type === 'hotel' ? 'consideration' : 'intent',
      productInteraction: {
        hotelId: productData.hotelId,
        roomId: productData.roomId,
        action: 'view',
        duration: productData.duration || 0,
        scrollDepth: productData.scrollDepth || 0
      }
    };

    return this.trackActivity({
      activityType: productData.type === 'hotel' ? 'hotel_view' : 'room_view',
      req,
      userId,
      duration: productData.duration,
      customData: { ecommerceData }
    });
  }

  /**
   * Track booking flow steps
   */
  static async trackBookingStep(req, userId = null, bookingData = {}) {
    const ecommerceData = {
      funnelStage: 'purchase',
      productInteraction: {
        hotelId: bookingData.hotelId,
        roomId: bookingData.roomId,
        action: 'book'
      }
    };

    return this.trackActivity({
      activityType: 'booking_step',
      req,
      userId,
      customData: {
        ecommerceData,
        step: bookingData.step,
        formData: bookingData.formData
      }
    });
  }

  /**
   * Track successful conversion (booking completion)
   */
  static async trackConversion(req, userId = null, conversionData = {}) {
    const ecommerceData = {
      funnelStage: 'purchase',
      conversion: {
        isConversion: true,
        conversionType: 'booking',
        value: conversionData.amount,
        bookingId: conversionData.bookingId
      },
      attribution: conversionData.attribution
    };

    return this.trackActivity({
      activityType: 'booking_complete',
      req,
      userId,
      customData: { ecommerceData }
    });
  }

  /**
   * Track authentication events
   */
  static async trackAuth(req, userId = null, authData = {}) {
    return this.trackActivity({
      activityType: authData.action || 'login',
      req,
      userId,
      customData: {
        success: authData.success,
        method: authData.method,
        provider: authData.provider
      }
    });
  }

  /**
   * Track errors and issues
   */
  static async trackError(req, userId = null, errorData = {}) {
    return this.trackActivity({
      activityType: errorData.type || 'error_500',
      req,
      userId,
      customData: {
        error: {
          message: errorData.message,
          stack: errorData.stack,
          statusCode: errorData.statusCode,
          endpoint: req.originalUrl
        }
      }
    });
  }

  /**
   * Extract device information from request
   */
  static extractDeviceInfo(req) {
    const userAgent = req.get('User-Agent') || '';
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    return {
      userAgent,
      browser: {
        name: result.browser.name,
        version: result.browser.version
      },
      os: {
        name: result.os.name,
        version: result.os.version
      },
      device: {
        type: result.device.type || 'desktop',
        model: result.device.model,
        vendor: result.device.vendor
      },
      screen: {
        width: req.body?.screenWidth || req.query?.screenWidth,
        height: req.body?.screenHeight || req.query?.screenHeight,
        pixelRatio: req.body?.pixelRatio || req.query?.pixelRatio || 1
      }
    };
  }

  /**
   * Extract location information from request
   */
  static extractLocationInfo(req) {
    const ip = this.getClientIP(req);
    const geo = geoip.lookup(ip);

    return {
      ip,
      country: geo?.country,
      region: geo?.region,
      city: geo?.city,
      timezone: geo?.timezone,
      coordinates: geo ? {
        latitude: geo.ll[0],
        longitude: geo.ll[1]
      } : null,
      isp: null, // Would need additional service
      isVPN: false, // Would need VPN detection service
      isTor: false  // Would need Tor detection service
    };
  }

  /**
   * Get or generate session ID
   */
  static getSessionId(req) {
    // Try to get from session
    if (req.session?.id) {
      return req.session.id;
    }
    
    // Try to get from cookies
    if (req.cookies?.sessionId) {
      return req.cookies.sessionId;
    }
    
    // Generate new session ID
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Get real client IP address
   */
  static getClientIP(req) {
    return req.headers['cf-connecting-ip'] ||
           req.headers['x-real-ip'] ||
           req.headers['x-forwarded-for']?.split(',')[0] ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           req.ip ||
           '127.0.0.1';
  }

  /**
   * Batch process activities for analytics
   */
  static async processUnprocessedActivities(limit = 1000) {
    try {
      const activities = await UserActivity.find({
        isProcessed: false,
        timestamp: { 
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      })
      .limit(limit)
      .sort({ timestamp: 1 });

      for (const activity of activities) {
        await this.processActivity(activity);
        activity.isProcessed = true;
        await activity.save();
      }

      console.log(`Processed ${activities.length} activities`);
      return activities.length;
      
    } catch (error) {
      console.error('Error processing activities:', error);
      throw error;
    }
  }

  /**
   * Process individual activity for insights
   */
  static async processActivity(activity) {
    // Update user session data
    if (activity.user) {
      await this.updateUserSessionStats(activity);
    }

    // Update conversion funnel data
    if (activity.ecommerceData?.funnelStage) {
      await this.updateFunnelStats(activity);
    }

    // Detect and flag suspicious activity
    if (activity.isSuspicious) {
      await this.handleSuspiciousActivity(activity);
    }

    // Update real-time metrics
    await this.updateRealTimeMetrics(activity);
  }

  /**
   * Update user session statistics
   */
  static async updateUserSessionStats(activity) {
    // Implementation for user behavior analysis
    // This could update user preferences, activity patterns, etc.
  }

  /**
   * Update conversion funnel statistics
   */
  static async updateFunnelStats(activity) {
    // Implementation for funnel analysis
    // This could update conversion rates, drop-off points, etc.
  }

  /**
   * Handle suspicious activity detection
   */
  static async handleSuspiciousActivity(activity) {
    // Implementation for security monitoring
    // This could trigger alerts, block IPs, etc.
    console.warn('Suspicious activity detected:', {
      ip: activity.locationInfo?.ip,
      activityType: activity.activityType,
      timestamp: activity.timestamp
    });
  }

  /**
   * Update real-time metrics
   */
  static async updateRealTimeMetrics(activity) {
    // Implementation for real-time dashboard updates
    // This could use Redis, WebSockets, etc.
  }

  /**
   * Get user behavior insights
   */
  static async getUserBehaviorInsights(userId, days = 30) {
    const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    
    return UserActivity.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
          lastActivity: { $max: '$timestamp' },
          avgDuration: { $avg: '$duration' }
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  /**
   * Get conversion rate analytics
   */
  static async getConversionAnalytics(startDate, endDate, filters = {}) {
    return UserActivity.getConversionFunnel(startDate, endDate, filters);
  }

  /**
   * Get real-time dashboard data
   */
  static async getRealTimeDashboard(minutes = 30) {
    return UserActivity.getRealTimeStats(minutes);
  }
}

module.exports = ActivityTracker;