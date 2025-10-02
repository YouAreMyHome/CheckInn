/**
 * Fraud Detection Utility for CheckInn Platform
 * 
 * Advanced security monitoring và fraud detection system
 * Phát hiện và ngăn chặn các hoạt động đáng ngờ
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const UserActivity = require('../models/UserActivity.model');
const mongoose = require('mongoose');

/**
 * Fraud Detection Class
 * Comprehensive fraud detection và security monitoring
 */
class FraudDetection {

  /**
   * RISK SCORING SYSTEM
   */

  /**
   * Calculate risk score for a user/session
   * 
   * @param {string} identifier - User ID hoặc session ID
   * @param {string} type - 'user' hoặc 'session'
   * @param {number} timeWindow - Time window in minutes (default 60)
   * @returns {Object} Risk assessment result
   */
  static async calculateRiskScore(identifier, type = 'session', timeWindow = 60) {
    const startTime = new Date(Date.now() - (timeWindow * 60 * 1000));
    
    const query = type === 'user' ? 
      { user: identifier } : 
      { sessionId: identifier };
    
    query.timestamp = { $gte: startTime };

    const activities = await UserActivity.find(query).sort({ timestamp: 1 });
    
    if (activities.length === 0) {
      return { riskScore: 0, factors: [], recommendation: 'safe' };
    }

    let riskScore = 0;
    const riskFactors = [];

    // Analyze various risk factors
    riskScore += this.analyzeActivityFrequency(activities, riskFactors);
    riskScore += this.analyzeLocationAnomaly(activities, riskFactors);
    riskScore += this.analyzeDeviceAnomaly(activities, riskFactors);
    riskScore += this.analyzeBehaviorPattern(activities, riskFactors);
    riskScore += this.analyzePaymentRisk(activities, riskFactors);
    
    // Normalize score to 0-100
    riskScore = Math.min(riskScore, 100);
    
    const recommendation = this.getRiskRecommendation(riskScore);
    
    return {
      identifier,
      type,
      riskScore: Math.round(riskScore),
      factors: riskFactors,
      recommendation,
      evaluatedAt: new Date(),
      activitiesAnalyzed: activities.length
    };
  }

  /**
   * Analyze activity frequency for suspicious patterns
   */
  static analyzeActivityFrequency(activities, riskFactors) {
    let score = 0;
    
    // Too many requests in short time
    const pageViews = activities.filter(a => a.activityType === 'page_view');
    if (pageViews.length > 50) {
      score += 25;
      riskFactors.push({
        type: 'high_frequency',
        severity: 'high',
        description: `${pageViews.length} page views in time window`,
        score: 25
      });
    }
    
    // Rapid booking attempts
    const bookingAttempts = activities.filter(a => a.activityType.includes('booking'));
    if (bookingAttempts.length > 10) {
      score += 30;
      riskFactors.push({
        type: 'rapid_booking',
        severity: 'high',
        description: `${bookingAttempts.length} booking attempts`,
        score: 30
      });
    }
    
    // Very short session duration (bot-like)
    const avgDuration = activities.reduce((sum, a) => sum + (a.duration || 0), 0) / activities.length;
    if (avgDuration < 500) { // Less than 500ms average
      score += 20;
      riskFactors.push({
        type: 'short_duration',
        severity: 'medium',
        description: `Average activity duration: ${avgDuration}ms`,
        score: 20
      });
    }
    
    return score;
  }

  /**
   * Analyze location anomalies
   */
  static analyzeLocationAnomaly(activities, riskFactors) {
    let score = 0;
    
    const locations = activities
      .map(a => a.locationInfo)
      .filter(loc => loc && loc.country);
    
    if (locations.length === 0) return score;
    
    // Multiple countries in short time
    const uniqueCountries = [...new Set(locations.map(loc => loc.country))];
    if (uniqueCountries.length > 2) {
      score += 35;
      riskFactors.push({
        type: 'location_jumping',
        severity: 'high',
        description: `Activity from ${uniqueCountries.length} countries: ${uniqueCountries.join(', ')}`,
        score: 35
      });
    }
    
    // VPN/Proxy usage
    const vpnUsage = locations.some(loc => loc.isVPN);
    if (vpnUsage) {
      score += 15;
      riskFactors.push({
        type: 'vpn_usage',
        severity: 'medium',
        description: 'VPN or proxy detected',
        score: 15
      });
    }
    
    // Tor usage
    const torUsage = locations.some(loc => loc.isTor);
    if (torUsage) {
      score += 40;
      riskFactors.push({
        type: 'tor_usage',
        severity: 'critical',
        description: 'Tor network usage detected',
        score: 40
      });
    }
    
    return score;
  }

  /**
   * Analyze device anomalies
   */
  static analyzeDeviceAnomaly(activities, riskFactors) {
    let score = 0;
    
    const devices = activities
      .map(a => a.deviceInfo)
      .filter(device => device);
    
    if (devices.length === 0) return score;
    
    // Multiple user agents
    const uniqueUserAgents = [...new Set(devices.map(d => d.userAgent))];
    if (uniqueUserAgents.length > 3) {
      score += 25;
      riskFactors.push({
        type: 'multiple_user_agents',
        severity: 'high',
        description: `${uniqueUserAgents.length} different user agents`,
        score: 25
      });
    }
    
    // Headless browser detection
    const headlessPatterns = [
      'HeadlessChrome', 'PhantomJS', 'Selenium', 'Puppeteer'
    ];
    const hasHeadless = devices.some(d => 
      headlessPatterns.some(pattern => d.userAgent?.includes(pattern))
    );
    if (hasHeadless) {
      score += 50;
      riskFactors.push({
        type: 'headless_browser',
        severity: 'critical',
        description: 'Headless browser detected',
        score: 50
      });
    }
    
    // Suspicious screen resolution
    const unusualScreens = devices.filter(d => 
      d.screen && (d.screen.width < 100 || d.screen.height < 100)
    );
    if (unusualScreens.length > 0) {
      score += 20;
      riskFactors.push({
        type: 'unusual_screen',
        severity: 'medium',
        description: 'Unusual screen resolution detected',
        score: 20
      });
    }
    
    return score;
  }

  /**
   * Analyze behavior patterns
   */
  static analyzeBehaviorPattern(activities, riskFactors) {
    let score = 0;
    
    // No mouse/keyboard interaction (pure programmatic)
    const interactionTypes = ['click', 'scroll', 'form_submit'];
    const hasInteraction = activities.some(a => 
      interactionTypes.some(type => a.activityType.includes(type))
    );
    
    if (!hasInteraction && activities.length > 10) {
      score += 30;
      riskFactors.push({
        type: 'no_interaction',
        severity: 'high',
        description: 'No user interaction detected',
        score: 30
      });
    }
    
    // Linear browsing pattern (too perfect)
    const pageViews = activities
      .filter(a => a.activityType === 'page_view')
      .map(a => a.activityData?.page?.path);
    
    const isLinearPattern = this.checkLinearPattern(pageViews);
    if (isLinearPattern && pageViews.length > 5) {
      score += 20;
      riskFactors.push({
        type: 'linear_pattern',
        severity: 'medium',
        description: 'Too perfect browsing pattern',
        score: 20
      });
    }
    
    // Rapid form submission without viewing
    const formSubmissions = activities.filter(a => a.activityType === 'booking_step');
    const rapidSubmissions = formSubmissions.filter((submission, index) => {
      if (index === 0) return false;
      const timeDiff = submission.timestamp - formSubmissions[index - 1].timestamp;
      return timeDiff < 5000; // Less than 5 seconds between steps
    });
    
    if (rapidSubmissions.length > 2) {
      score += 25;
      riskFactors.push({
        type: 'rapid_form_filling',
        severity: 'high',
        description: 'Unusually fast form completion',
        score: 25
      });
    }
    
    return score;
  }

  /**
   * Analyze payment-related risks
   */
  static analyzePaymentRisk(activities, riskFactors) {
    let score = 0;
    
    const paymentActivities = activities.filter(a => 
      ['payment_start', 'payment_complete', 'booking_complete'].includes(a.activityType)
    );
    
    if (paymentActivities.length === 0) return score;
    
    // Multiple payment attempts with failures
    const paymentFails = activities.filter(a => a.activityType === 'payment_fail');
    if (paymentFails.length > 3) {
      score += 30;
      riskFactors.push({
        type: 'multiple_payment_fails',
        severity: 'high',
        description: `${paymentFails.length} failed payment attempts`,
        score: 30
      });
    }
    
    // High-value transactions from new sessions
    const highValueBookings = activities.filter(a => 
      a.activityType === 'booking_complete' && 
      a.ecommerceData?.conversion?.value > 5000000 // > 5M VND
    );
    
    if (highValueBookings.length > 0) {
      score += 15;
      riskFactors.push({
        type: 'high_value_transaction',
        severity: 'medium',
        description: `High-value booking: ${highValueBookings[0].ecommerceData.conversion.value}`,
        score: 15
      });
    }
    
    return score;
  }

  /**
   * Check for linear browsing pattern
   */
  static checkLinearPattern(pageViews) {
    if (pageViews.length < 3) return false;
    
    // Check if pages follow a predictable sequence
    const sequences = [
      ['/hotels', '/hotel/', '/booking'],
      ['/search', '/hotels', '/hotel/'],
      ['/', '/search', '/hotels']
    ];
    
    return sequences.some(sequence => {
      return sequence.every((page, index) => {
        return index < pageViews.length && 
               pageViews[index]?.includes(page);
      });
    });
  }

  /**
   * Get risk recommendation based on score
   */
  static getRiskRecommendation(riskScore) {
    if (riskScore >= 80) return 'block';
    if (riskScore >= 60) return 'challenge';
    if (riskScore >= 40) return 'monitor';
    if (riskScore >= 20) return 'caution';
    return 'safe';
  }

  /**
   * MONITORING FUNCTIONS
   */

  /**
   * Monitor real-time suspicious activities
   */
  static async monitorSuspiciousActivities(minutes = 30) {
    const startTime = new Date(Date.now() - (minutes * 60 * 1000));
    
    const suspiciousActivities = await UserActivity.find({
      timestamp: { $gte: startTime },
      $or: [
        { isSuspicious: true },
        { 'locationInfo.isTor': true },
        { 'locationInfo.isVPN': true },
        { isBot: true }
      ]
    }).populate('user', 'name email');
    
    // Group by session for analysis
    const sessionGroups = {};
    suspiciousActivities.forEach(activity => {
      if (!sessionGroups[activity.sessionId]) {
        sessionGroups[activity.sessionId] = [];
      }
      sessionGroups[activity.sessionId].push(activity);
    });
    
    const alerts = [];
    
    for (const [sessionId, activities] of Object.entries(sessionGroups)) {
      const riskAssessment = await this.calculateRiskScore(sessionId, 'session', minutes);
      
      if (riskAssessment.riskScore >= 60) {
        alerts.push({
          sessionId,
          riskScore: riskAssessment.riskScore,
          factors: riskAssessment.factors,
          recommendation: riskAssessment.recommendation,
          activitiesCount: activities.length,
          user: activities[0].user,
          lastActivity: Math.max(...activities.map(a => a.timestamp)),
          actions: this.getRecommendedActions(riskAssessment)
        });
      }
    }
    
    return alerts.sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Get recommended security actions
   */
  static getRecommendedActions(riskAssessment) {
    const actions = [];
    
    if (riskAssessment.riskScore >= 80) {
      actions.push('immediate_block');
      actions.push('ip_blacklist');
      actions.push('admin_notification');
    } else if (riskAssessment.riskScore >= 60) {
      actions.push('captcha_challenge');
      actions.push('additional_verification');
      actions.push('rate_limit');
    } else if (riskAssessment.riskScore >= 40) {
      actions.push('increased_monitoring');
      actions.push('session_tracking');
    }
    
    // Specific actions based on risk factors
    riskAssessment.factors.forEach(factor => {
      switch (factor.type) {
        case 'tor_usage':
          actions.push('tor_block');
          break;
        case 'headless_browser':
          actions.push('bot_challenge');
          break;
        case 'multiple_payment_fails':
          actions.push('payment_review');
          break;
        case 'high_value_transaction':
          actions.push('manual_review');
          break;
      }
    });
    
    return [...new Set(actions)];
  }

  /**
   * FRAUD PREVENTION
   */

  /**
   * Block suspicious IP addresses
   */
  static async blockSuspiciousIPs(threshold = 80, timeWindow = 60) {
    const startTime = new Date(Date.now() - (timeWindow * 60 * 1000));
    
    const suspiciousIPs = await UserActivity.aggregate([
      {
        $match: {
          timestamp: { $gte: startTime },
          'locationInfo.ip': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$locationInfo.ip',
          activities: { $sum: 1 },
          sessions: { $addToSet: '$sessionId' },
          suspiciousCount: {
            $sum: { $cond: ['$isSuspicious', 1, 0] }
          },
          botActivities: {
            $sum: { $cond: ['$isBot', 1, 0] }
          }
        }
      },
      {
        $match: {
          $or: [
            { activities: { $gt: 100 } },
            { suspiciousCount: { $gt: 10 } },
            { botActivities: { $gt: 20 } }
          ]
        }
      }
    ]);
    
    const blockedIPs = [];
    
    for (const ipData of suspiciousIPs) {
      // Calculate detailed risk for this IP
      const activities = await UserActivity.find({
        'locationInfo.ip': ipData._id,
        timestamp: { $gte: startTime }
      });
      
      if (activities.length > 0) {
        // Use session-based analysis for the most active session
        const sessionCounts = {};
        activities.forEach(activity => {
          sessionCounts[activity.sessionId] = (sessionCounts[activity.sessionId] || 0) + 1;
        });
        
        const mostActiveSession = Object.keys(sessionCounts)
          .reduce((a, b) => sessionCounts[a] > sessionCounts[b] ? a : b);
        
        const riskAssessment = await this.calculateRiskScore(mostActiveSession, 'session', timeWindow);
        
        if (riskAssessment.riskScore >= threshold) {
          blockedIPs.push({
            ip: ipData._id,
            riskScore: riskAssessment.riskScore,
            activities: ipData.activities,
            sessions: ipData.sessions.length,
            reason: riskAssessment.factors.map(f => f.type).join(', '),
            blockedAt: new Date()
          });
        }
      }
    }
    
    return blockedIPs;
  }

  /**
   * Generate fraud detection report
   */
  static async generateFraudReport(startDate, endDate) {
    const totalActivities = await UserActivity.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate }
    });
    
    const suspiciousActivities = await UserActivity.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate },
      isSuspicious: true
    });
    
    const botActivities = await UserActivity.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate },
      isBot: true
    });
    
    const alerts = await this.monitorSuspiciousActivities(
      Math.floor((endDate - startDate) / (1000 * 60))
    );
    
    const topRiskyIPs = await UserActivity.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          isSuspicious: true
        }
      },
      {
        $group: {
          _id: '$locationInfo.ip',
          count: { $sum: 1 },
          country: { $first: '$locationInfo.country' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    return {
      period: { startDate, endDate },
      summary: {
        totalActivities,
        suspiciousActivities,
        botActivities,
        suspiciousRate: (suspiciousActivities / totalActivities * 100).toFixed(2),
        botRate: (botActivities / totalActivities * 100).toFixed(2)
      },
      alerts: alerts.slice(0, 20), // Top 20 alerts
      topRiskyIPs,
      generatedAt: new Date()
    };
  }

  /**
   * UTILITY FUNCTIONS
   */

  /**
   * Flag activity as suspicious
   */
  static async flagActivity(activityId, reason, flaggedBy) {
    return UserActivity.findByIdAndUpdate(activityId, {
      isSuspicious: true,
      $push: {
        flags: {
          reason,
          flaggedBy,
          flaggedAt: new Date()
        }
      }
    });
  }

  /**
   * Get fraud statistics
   */
  static async getFraudStatistics(days = 30) {
    const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    
    return UserActivity.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          totalActivities: { $sum: 1 },
          suspiciousActivities: {
            $sum: { $cond: ['$isSuspicious', 1, 0] }
          },
          botActivities: {
            $sum: { $cond: ['$isBot', 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }
}

module.exports = FraudDetection;