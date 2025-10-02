/**
 * Analytics Helper for CheckInn Platform
 * 
 * Advanced analytics và insights từ UserActivity data
 * Cung cấp business intelligence và performance metrics
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const UserActivity = require('../models/UserActivity.model');
const mongoose = require('mongoose');

/**
 * Analytics Helper Class
 * Comprehensive analytics và reporting utilities
 */
class AnalyticsHelper {

  /**
   * GET DASHBOARD ANALYTICS
   */

  /**
   * Get comprehensive dashboard overview
   * 
   * @param {Date} startDate - Start date for analysis
   * @param {Date} endDate - End date for analysis
   * @param {Object} filters - Additional filters
   * @returns {Object} Dashboard analytics data
   */
  static async getDashboardOverview(startDate, endDate, filters = {}) {
    const [
      trafficStats,
      conversionStats,
      userBehavior,
      deviceStats,
      geographicStats,
      performanceMetrics
    ] = await Promise.all([
      this.getTrafficStatistics(startDate, endDate, filters),
      this.getConversionStatistics(startDate, endDate, filters),
      this.getUserBehaviorStats(startDate, endDate, filters),
      this.getDeviceStatistics(startDate, endDate, filters),
      this.getGeographicStatistics(startDate, endDate, filters),
      this.getPerformanceStatistics(startDate, endDate, filters)
    ]);

    return {
      period: { startDate, endDate },
      traffic: trafficStats,
      conversions: conversionStats,
      userBehavior,
      devices: deviceStats,
      geography: geographicStats,
      performance: performanceMetrics,
      generatedAt: new Date()
    };
  }

  /**
   * Get traffic statistics
   */
  static async getTrafficStatistics(startDate, endDate, filters = {}) {
    const pipeline = [
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          isBot: { $ne: true },
          ...filters
        }
      },
      {
        $group: {
          _id: null,
          totalPageViews: {
            $sum: { $cond: [{ $eq: ['$activityType', 'page_view'] }, 1, 0] }
          },
          uniqueVisitors: { $addToSet: '$sessionId' },
          uniqueUsers: { $addToSet: '$user' },
          bounceRate: { $avg: { $cond: [{ $eq: ['$duration', 0] }, 1, 0] } },
          avgSessionDuration: { $avg: '$duration' },
          topPages: { $push: '$activityData.page.path' },
          topReferrers: { $push: '$activityData.page.referrer' }
        }
      },
      {
        $project: {
          totalPageViews: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          registeredUsers: { 
            $size: { 
              $filter: { 
                input: '$uniqueUsers', 
                cond: { $ne: ['$$this', null] } 
              } 
            } 
          },
          bounceRate: { $multiply: ['$bounceRate', 100] },
          avgSessionDuration: { $divide: ['$avgSessionDuration', 1000] }, // Convert to seconds
          topPages: 1,
          topReferrers: 1
        }
      }
    ];

    const [result] = await UserActivity.aggregate(pipeline);
    return result || {};
  }

  /**
   * Get conversion statistics
   */
  static async getConversionStatistics(startDate, endDate, filters = {}) {
    const pipeline = [
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          'ecommerceData.conversion.isConversion': { $exists: true },
          ...filters
        }
      },
      {
        $group: {
          _id: '$ecommerceData.conversion.conversionType',
          totalConversions: { $sum: 1 },
          totalValue: { $sum: '$ecommerceData.conversion.value' },
          avgValue: { $avg: '$ecommerceData.conversion.value' },
          uniqueUsers: { $addToSet: '$user' }
        }
      }
    ];

    const conversions = await UserActivity.aggregate(pipeline);
    
    // Calculate conversion rates
    const totalVisitors = await this.getTotalUniqueVisitors(startDate, endDate, filters);
    
    return conversions.map(conv => ({
      ...conv,
      conversionRate: totalVisitors > 0 ? (conv.totalConversions / totalVisitors * 100) : 0,
      uniqueUsers: conv.uniqueUsers.length
    }));
  }

  /**
   * Get user behavior statistics
   */
  static async getUserBehaviorStats(startDate, endDate, filters = {}) {
    const pipeline = [
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          ...filters
        }
      },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' },
          avgDuration: { $avg: '$duration' }
        }
      },
      {
        $project: {
          activityType: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          avgDuration: { $divide: ['$avgDuration', 1000] }
        }
      },
      { $sort: { count: -1 } }
    ];

    return UserActivity.aggregate(pipeline);
  }

  /**
   * Get device statistics
   */
  static async getDeviceStatistics(startDate, endDate, filters = {}) {
    const pipeline = [
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          'deviceInfo.device.type': { $exists: true },
          ...filters
        }
      },
      {
        $group: {
          _id: {
            deviceType: '$deviceInfo.device.type',
            browser: '$deviceInfo.browser.name',
            os: '$deviceInfo.os.name'
          },
          sessions: { $addToSet: '$sessionId' },
          pageViews: { $sum: { $cond: [{ $eq: ['$activityType', 'page_view'] }, 1, 0] } },
          conversions: { $sum: { $cond: [{ $eq: ['$ecommerceData.conversion.isConversion', true] }, 1, 0] } }
        }
      },
      {
        $project: {
          deviceType: '$_id.deviceType',
          browser: '$_id.browser',
          os: '$_id.os',
          sessions: { $size: '$sessions' },
          pageViews: 1,
          conversions: 1,
          conversionRate: {
            $cond: [
              { $gt: ['$pageViews', 0] },
              { $multiply: [{ $divide: ['$conversions', '$pageViews'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { sessions: -1 } }
    ];

    return UserActivity.aggregate(pipeline);
  }

  /**
   * Get geographic statistics
   */
  static async getGeographicStatistics(startDate, endDate, filters = {}) {
    const pipeline = [
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          'locationInfo.country': { $exists: true },
          ...filters
        }
      },
      {
        $group: {
          _id: {
            country: '$locationInfo.country',
            city: '$locationInfo.city'
          },
          sessions: { $addToSet: '$sessionId' },
          users: { $addToSet: '$user' },
          pageViews: { $sum: { $cond: [{ $eq: ['$activityType', 'page_view'] }, 1, 0] } },
          bookings: { $sum: { $cond: [{ $eq: ['$activityType', 'booking_complete'] }, 1, 0] } }
        }
      },
      {
        $project: {
          country: '$_id.country',
          city: '$_id.city',
          sessions: { $size: '$sessions' },
          users: { $size: { $filter: { input: '$users', cond: { $ne: ['$$this', null] } } } },
          pageViews: 1,
          bookings: 1,
          conversionRate: {
            $cond: [
              { $gt: ['$sessions', 0] },
              { $multiply: [{ $divide: ['$bookings', '$sessions'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { sessions: -1 } }
    ];

    return UserActivity.aggregate(pipeline);
  }

  /**
   * Get performance statistics
   */
  static async getPerformanceStatistics(startDate, endDate, filters = {}) {
    const pipeline = [
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          'performanceMetrics.loadTime': { $exists: true },
          ...filters
        }
      },
      {
        $group: {
          _id: '$activityData.page.path',
          avgLoadTime: { $avg: '$performanceMetrics.loadTime' },
          avgFCP: { $avg: '$performanceMetrics.firstContentfulPaint' },
          avgLCP: { $avg: '$performanceMetrics.largestContentfulPaint' },
          avgCLS: { $avg: '$performanceMetrics.cumulativeLayoutShift' },
          avgFID: { $avg: '$performanceMetrics.firstInputDelay' },
          sampleSize: { $sum: 1 },
          slowPages: {
            $sum: { $cond: [{ $gt: ['$performanceMetrics.loadTime', 3000] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          page: '$_id',
          avgLoadTime: { $round: ['$avgLoadTime', 2] },
          avgFCP: { $round: ['$avgFCP', 2] },
          avgLCP: { $round: ['$avgLCP', 2] },
          avgCLS: { $round: ['$avgCLS', 4] },
          avgFID: { $round: ['$avgFID', 2] },
          sampleSize: 1,
          slowPagePercentage: {
            $round: [{ $multiply: [{ $divide: ['$slowPages', '$sampleSize'] }, 100] }, 2]
          }
        }
      },
      { $sort: { avgLoadTime: -1 } }
    ];

    return UserActivity.aggregate(pipeline);
  }

  /**
   * FUNNEL ANALYSIS
   */

  /**
   * Get detailed conversion funnel analysis
   */
  static async getConversionFunnel(startDate, endDate, filters = {}) {
    const funnelStages = ['awareness', 'interest', 'consideration', 'intent', 'purchase'];
    
    const pipeline = [
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          'ecommerceData.funnelStage': { $in: funnelStages },
          ...filters
        }
      },
      {
        $group: {
          _id: {
            stage: '$ecommerceData.funnelStage',
            sessionId: '$sessionId'
          },
          firstActivity: { $min: '$timestamp' },
          lastActivity: { $max: '$timestamp' },
          user: { $first: '$user' }
        }
      },
      {
        $group: {
          _id: '$_id.stage',
          uniqueSessions: { $addToSet: '$_id.sessionId' },
          uniqueUsers: { $addToSet: '$user' },
          avgTimeInStage: { $avg: { $subtract: ['$lastActivity', '$firstActivity'] } }
        }
      },
      {
        $project: {
          stage: '$_id',
          sessions: { $size: '$uniqueSessions' },
          users: { $size: { $filter: { input: '$uniqueUsers', cond: { $ne: ['$$this', null] } } } },
          avgTimeInStage: { $divide: ['$avgTimeInStage', 1000] } // Convert to seconds
        }
      }
    ];

    const funnelData = await UserActivity.aggregate(pipeline);
    
    // Calculate conversion rates between stages
    const sortedData = funnelStages.map(stage => {
      const data = funnelData.find(item => item.stage === stage) || { stage, sessions: 0, users: 0 };
      return data;
    });

    // Add conversion rates
    for (let i = 1; i < sortedData.length; i++) {
      const current = sortedData[i];
      const previous = sortedData[i - 1];
      current.conversionRate = previous.sessions > 0 ? 
        (current.sessions / previous.sessions * 100) : 0;
      current.dropOffRate = 100 - current.conversionRate;
    }

    return sortedData;
  }

  /**
   * USER JOURNEY ANALYSIS
   */

  /**
   * Get user journey patterns
   */
  static async getUserJourneyPatterns(startDate, endDate, limit = 10) {
    const pipeline = [
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          user: { $ne: null }
        }
      },
      {
        $sort: { user: 1, timestamp: 1 }
      },
      {
        $group: {
          _id: '$user',
          journey: {
            $push: {
              activity: '$activityType',
              timestamp: '$timestamp',
              page: '$activityData.page.path'
            }
          },
          totalActivities: { $sum: 1 },
          firstActivity: { $min: '$timestamp' },
          lastActivity: { $max: '$timestamp' }
        }
      },
      {
        $project: {
          journey: { $slice: ['$journey', 20] }, // Limit journey length
          totalActivities: 1,
          sessionDuration: { $subtract: ['$lastActivity', '$firstActivity'] },
          converted: {
            $in: ['booking_complete', '$journey.activity']
          }
        }
      },
      { $sort: { totalActivities: -1 } },
      { $limit: limit }
    ];

    return UserActivity.aggregate(pipeline);
  }

  /**
   * COHORT ANALYSIS
   */

  /**
   * Get user cohort analysis
   */
  static async getCohortAnalysis(startDate, endDate, period = 'week') {
    // Implementation for cohort analysis
    // This would analyze user retention over time periods
    const groupBy = period === 'week' ? 
      { $week: '$timestamp' } : 
      { $month: '$timestamp' };

    const pipeline = [
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          user: { $ne: null }
        }
      },
      {
        $group: {
          _id: {
            user: '$user',
            period: groupBy
          },
          firstActivity: { $min: '$timestamp' },
          activities: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.period',
          newUsers: { $addToSet: '$_id.user' },
          totalActivities: { $sum: '$activities' }
        }
      },
      { $sort: { _id: 1 } }
    ];

    return UserActivity.aggregate(pipeline);
  }

  /**
   * A/B TESTING ANALYSIS
   */

  /**
   * Get A/B test results
   */
  static async getABTestResults(experimentName, startDate, endDate) {
    const pipeline = [
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          'experiments.name': experimentName
        }
      },
      {
        $unwind: '$experiments'
      },
      {
        $match: {
          'experiments.name': experimentName
        }
      },
      {
        $group: {
          _id: '$experiments.variant',
          sessions: { $addToSet: '$sessionId' },
          users: { $addToSet: '$user' },
          conversions: {
            $sum: { $cond: [{ $eq: ['$ecommerceData.conversion.isConversion', true] }, 1, 0] }
          },
          totalEvents: { $sum: 1 }
        }
      },
      {
        $project: {
          variant: '$_id',
          sessions: { $size: '$sessions' },
          users: { $size: { $filter: { input: '$users', cond: { $ne: ['$$this', null] } } } },
          conversions: 1,
          conversionRate: {
            $cond: [
              { $gt: ['$sessions', 0] },
              { $multiply: [{ $divide: ['$conversions', '$sessions'] }, 100] },
              0
            ]
          },
          totalEvents: 1
        }
      }
    ];

    return UserActivity.aggregate(pipeline);
  }

  /**
   * HELPER METHODS
   */

  /**
   * Get total unique visitors for conversion rate calculation
   */
  static async getTotalUniqueVisitors(startDate, endDate, filters = {}) {
    const [result] = await UserActivity.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          isBot: { $ne: true },
          ...filters
        }
      },
      {
        $group: {
          _id: null,
          uniqueVisitors: { $addToSet: '$sessionId' }
        }
      },
      {
        $project: {
          count: { $size: '$uniqueVisitors' }
        }
      }
    ]);

    return result?.count || 0;
  }

  /**
   * Generate automated insights
   */
  static async generateInsights(startDate, endDate) {
    const insights = [];
    
    // Get basic metrics
    const overview = await this.getDashboardOverview(startDate, endDate);
    
    // Traffic insights
    if (overview.traffic.bounceRate > 70) {
      insights.push({
        type: 'warning',
        category: 'traffic',
        message: `High bounce rate detected: ${overview.traffic.bounceRate.toFixed(1)}%`,
        recommendation: 'Consider improving page load speed and content relevancy'
      });
    }

    // Conversion insights
    const bookingConversions = overview.conversions.find(c => c._id === 'booking');
    if (bookingConversions && bookingConversions.conversionRate < 2) {
      insights.push({
        type: 'warning',
        category: 'conversion',
        message: `Low booking conversion rate: ${bookingConversions.conversionRate.toFixed(2)}%`,
        recommendation: 'Optimize booking flow and reduce friction points'
      });
    }

    // Performance insights
    const slowPages = overview.performance.filter(p => p.avgLoadTime > 3000);
    if (slowPages.length > 0) {
      insights.push({
        type: 'warning',
        category: 'performance',
        message: `${slowPages.length} pages have slow load times`,
        recommendation: 'Optimize images, reduce JavaScript, and improve server response time'
      });
    }

    return insights;
  }
}

module.exports = AnalyticsHelper;