/**
 * User Controller for CheckInn Hotel Booking Platform
 * 
 * Handles user management, authentication, and profile operations
 * Includes comprehensive security and validation
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const User = require('../models/User.model');
const ActivityTracker = require('../utils/activityTracker');
const FraudDetection = require('../utils/fraudDetection');
const jwt = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIResponse = require('../utils/apiResponse');

/**
 * User Controller Class
 * Comprehensive user management với security features
 */
class UserController {

  /**
   * ============================================================================
   * AUTHENTICATION ENDPOINTS
   * ============================================================================
   */

  /**
   * Register new user
   * POST /api/users/register
   */
  static register = catchAsync(async (req, res, next) => {
    const { name, email, phone, password, role = 'Customer' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      // Track failed registration attempt
      await ActivityTracker.trackAuth(req, null, {
        action: 'register',
        success: false,
        reason: 'email_exists'
      });
      
      return next(new AppError('Email already registered', 400));
    }

    // Fraud detection for registration
    const riskAssessment = await FraudDetection.calculateRiskScore(
      ActivityTracker.getSessionId(req), 'session', 60
    );

    if (riskAssessment.riskScore >= 80) {
      await ActivityTracker.trackAuth(req, null, {
        action: 'register',
        success: false,
        reason: 'high_risk_score'
      });
      
      return next(new AppError('Registration temporarily unavailable', 429));
    }

    // Create new user
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      role
    });

    // Generate JWT token
    const token = jwt.generateToken(newUser._id);

    // Remove password from response
    newUser.password = undefined;

    // Track successful registration
    await ActivityTracker.trackAuth(req, newUser._id, {
      action: 'register',
      success: true,
      method: 'email'
    });

    // Set secure cookie
    const cookieOptions = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    res.cookie('jwt', token, cookieOptions);

    APIResponse.success(res, {
      message: 'User registered successfully',
      data: {
        user: newUser,
        token
      }
    }, 201);
  });

  /**
   * User login
   * POST /api/users/login
   */
  static login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Check fraud risk before authentication
    const sessionId = ActivityTracker.getSessionId(req);
    const riskAssessment = await FraudDetection.calculateRiskScore(sessionId, 'session', 30);
    
    if (riskAssessment.riskScore >= 60) {
      await ActivityTracker.trackAuth(req, null, {
        action: 'login',
        success: false,
        reason: 'high_risk_score'
      });
      
      return next(new AppError('Please complete security verification', 429));
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user || !(await user.comparePassword(password, user.password))) {
      // Track failed login
      await ActivityTracker.trackAuth(req, user?._id, {
        action: 'login',
        success: false,
        reason: 'invalid_credentials'
      });
      
      return next(new AppError('Invalid email or password', 401));
    }

    // Check if user account is active
    if (user.role === 'Customer' && !user.isEmailVerified) {
      return next(new AppError('Please verify your email address first', 401));
    }

    // Generate JWT token
    const token = jwt.generateToken(user._id);

    // Update last login
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    // Remove password from response
    user.password = undefined;

    // Track successful login
    await ActivityTracker.trackAuth(req, user._id, {
      action: 'login',
      success: true,
      method: 'email'
    });

    // Set secure cookie
    const cookieOptions = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    res.cookie('jwt', token, cookieOptions);

    APIResponse.success(res, {
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  });

  /**
   * User logout
   * POST /api/users/logout
   */
  static logout = catchAsync(async (req, res, next) => {
    // Track logout activity
    await ActivityTracker.trackAuth(req, req.user?._id, {
      action: 'logout',
      success: true
    });

    // Clear JWT cookie
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    APIResponse.success(res, {
      message: 'Logged out successfully'
    });
  });

  /**
   * ============================================================================
   * PROFILE MANAGEMENT
   * ============================================================================
   */

  /**
   * Get current user profile
   * GET /api/users/me
   */
  static getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id)
      .populate('totalBookings', 'status totalAmount createdAt')
      .populate('favoriteHotels', 'name location images');

    // Track profile view
    await ActivityTracker.trackPageView(req, req.user._id, {
      pageTitle: 'User Profile'
    });

    APIResponse.success(res, {
      data: { user }
    });
  });

  /**
   * Update user profile
   * PATCH /api/users/me
   */
  static updateMe = catchAsync(async (req, res, next) => {
    const allowedFields = ['name', 'phone', 'avatar', 'dateOfBirth'];
    const updates = {};

    // Filter allowed fields
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Validate phone number if provided
    if (updates.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(updates.phone)) {
      return next(new AppError('Invalid phone number format', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    // Track profile update
    await ActivityTracker.trackActivity({
      activityType: 'profile_update',
      req,
      userId: req.user._id,
      customData: {
        updatedFields: Object.keys(updates)
      }
    });

    APIResponse.success(res, {
      message: 'Profile updated successfully',
      data: { user }
    });
  });

  /**
   * Update user password
   * PATCH /api/users/update-password
   */
  static updatePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new AppError('Please provide all required fields', 400));
    }

    if (newPassword !== confirmPassword) {
      return next(new AppError('New passwords do not match', 400));
    }

    if (newPassword.length < 8) {
      return next(new AppError('Password must be at least 8 characters long', 400));
    }

    // Get user with current password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    if (!(await user.comparePassword(currentPassword, user.password))) {
      return next(new AppError('Current password is incorrect', 401));
    }

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    // Generate new token
    const token = jwt.generateToken(user._id);

    // Track password change
    await ActivityTracker.trackActivity({
      activityType: 'password_change',
      req,
      userId: req.user._id
    });

    APIResponse.success(res, {
      message: 'Password updated successfully',
      data: { token }
    });
  });

  /**
   * ============================================================================
   * PASSWORD RESET
   * ============================================================================
   */

  /**
   * Forgot password - Send reset token
   * POST /api/users/forgot-password
   */
  static forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Please provide email address', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Don't reveal whether user exists or not
      return APIResponse.success(res, {
        message: 'If email exists, password reset instructions have been sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Track password reset request
    await ActivityTracker.trackActivity({
      activityType: 'password_reset_request',
      req,
      userId: user._id
    });

    // TODO: Send email with reset token
    // await emailService.sendPasswordReset(user.email, resetToken);

    APIResponse.success(res, {
      message: 'Password reset instructions have been sent to your email',
      // In development, include token
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  });

  /**
   * Reset password with token
   * PATCH /api/users/reset-password/:token
   */
  static resetPassword = catchAsync(async (req, res, next) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Validate inputs
    if (!password || !confirmPassword) {
      return next(new AppError('Please provide password and confirm password', 400));
    }

    if (password !== confirmPassword) {
      return next(new AppError('Passwords do not match', 400));
    }

    if (password.length < 8) {
      return next(new AppError('Password must be at least 8 characters long', 400));
    }

    // Hash token and find user
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = new Date();
    
    await user.save();

    // Generate new JWT token
    const jwtToken = jwt.generateToken(user._id);

    // Track password reset completion
    await ActivityTracker.trackActivity({
      activityType: 'password_reset_complete',
      req,
      userId: user._id
    });

    APIResponse.success(res, {
      message: 'Password reset successful',
      data: { token: jwtToken }
    });
  });

  /**
   * ============================================================================
   * USER MANAGEMENT (Admin)
   * ============================================================================
   */

  /**
   * Get all users (Admin only)
   * GET /api/users
   */
  static getAllUsers = catchAsync(async (req, res, next) => {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (role) query.role = role;
    if (status === 'active') query.isEmailVerified = true;
    if (status === 'inactive') query.isEmailVerified = false;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // Track admin activity
    await ActivityTracker.trackActivity({
      activityType: 'admin_user_list',
      req,
      userId: req.user._id,
      customData: { query, resultsCount: users.length }
    });

    APIResponse.success(res, {
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  });

  /**
   * Get user by ID (Admin only)
   * GET /api/users/:id
   */
  static getUserById = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('hotels', 'name status')
      .populate('bookings', 'status totalAmount createdAt');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Track admin activity
    await ActivityTracker.trackActivity({
      activityType: 'admin_user_view',
      req,
      userId: req.user._id,
      customData: { targetUserId: user._id }
    });

    APIResponse.success(res, {
      data: { user }
    });
  });

  /**
   * Update user status (Admin only)
   * PATCH /api/users/:id/status
   */
  static updateUserStatus = catchAsync(async (req, res, next) => {
    const { status, reason } = req.body;
    const allowedStatuses = ['active', 'inactive', 'blocked'];

    if (!allowedStatuses.includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Update user status
    const updates = {};
    if (status === 'active') {
      updates.isEmailVerified = true;
    } else if (status === 'inactive') {
      updates.isEmailVerified = false;
    } else if (status === 'blocked') {
      updates.isEmailVerified = false;
      updates.isBlocked = true;
      updates.blockedAt = new Date();
      updates.blockReason = reason;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    // Track admin action
    await ActivityTracker.trackActivity({
      activityType: 'admin_user_status_update',
      req,
      userId: req.user._id,
      customData: {
        targetUserId: user._id,
        newStatus: status,
        reason
      }
    });

    APIResponse.success(res, {
      message: `User status updated to ${status}`,
      data: { user: updatedUser }
    });
  });

  /**
   * Delete user (Admin only)
   * DELETE /api/users/:id
   */
  static deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Prevent deleting admin users
    if (user.role === 'Admin') {
      return next(new AppError('Cannot delete admin users', 403));
    }

    await User.findByIdAndDelete(req.params.id);

    // Track admin action
    await ActivityTracker.trackActivity({
      activityType: 'admin_user_delete',
      req,
      userId: req.user._id,
      customData: {
        deletedUserId: user._id,
        deletedUserEmail: user.email
      }
    });

    APIResponse.success(res, {
      message: 'User deleted successfully'
    });
  });

  /**
   * ============================================================================
   * USER ANALYTICS & INSIGHTS
   * ============================================================================
   */

  /**
   * Get user activity analytics
   * GET /api/users/me/analytics
   */
  static getUserAnalytics = catchAsync(async (req, res, next) => {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));

    // Get user behavior insights
    const insights = await ActivityTracker.getUserBehaviorInsights(req.user._id, days);
    
    // Get booking statistics
    const bookingStats = await this.getUserBookingStats(req.user._id, startDate);
    
    // Get favorite hotels
    const favorites = await this.getUserFavorites(req.user._id);

    APIResponse.success(res, {
      data: {
        period: { days, startDate },
        activityInsights: insights,
        bookingStats,
        favorites,
        generatedAt: new Date()
      }
    });
  });

  /**
   * Helper: Get user booking statistics
   */
  static async getUserBookingStats(userId, startDate) {
    const Booking = require('../models/Booking.model');
    
    return Booking.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: '$pricing.totalAmount' },
          avgBookingValue: { $avg: '$pricing.totalAmount' },
          statusBreakdown: {
            $push: '$status'
          }
        }
      }
    ]);
  }

  /**
   * Helper: Get user favorite hotels
   */
  static async getUserFavorites(userId) {
    // Implementation depends on how favorites are stored
    // This could be a separate Favorite model or embedded in User
    return [];
  }
}

module.exports = UserController;