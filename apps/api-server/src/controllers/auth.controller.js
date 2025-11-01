
/**
 * Authentication Controller for CheckInn Hotel Booking Platform
 * 
 * Complete JWT authentication system với registration, login, logout,
 * password reset, email verification, và refresh token functionality
 * 
 * @author CheckInn Team
 * @version 2.0.0
 */

const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { 
  generateToken, 
  generateRefreshToken, 
  verifyToken,
  createSendTokenCookie 
} = require('../utils/jwt');
const { sendResponse } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { 
  sendWelcomeEmail, 
  sendPasswordResetEmail, 
  sendEmailVerification 
} = require('../utils/email');

const createSendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Set JWT cookie
  createSendTokenCookie(res, token);

  // Remove password from output
  user.password = undefined;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  sendResponse(res, statusCode, true, 'Authentication successful', {
    token,
    refreshToken,
    user,
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;

  // Log incoming data for debugging
  console.log('Registration attempt:', { name, email, phone, role, passwordLength: password?.length });

  // 1) Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with this email already exists.', 400));
  }

  // 2) Create new user
  try {
    const newUser = await User.create({
      name,
      email,
      phone,
      password,
      role,
    });
    
    // 3) Send welcome email (don't wait for it to complete)
    const welcomeURL = `${req.protocol}://${req.get('host')}/verify-email`;
    sendWelcomeEmail(newUser, welcomeURL).catch(error => {
      console.error('Error sending welcome email:', error);
      // Don't fail registration if email fails
    });
    
    // 4) Generate token and send response
    createSendToken(newUser, 201, res);
  } catch (error) {
    console.error('User creation error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return next(new AppError(`Validation failed: ${validationErrors.join(', ')}`, 400));
    }
    return next(error);
  }
});

exports.login = catchAsync(async (req, res, next) => {
  console.log('Login request body:', req.body);
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password +status');

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Incorrect email or password.', 401));
  }

  // 3) Check if user account is active
  if (user.status === 'suspended') {
    return next(new AppError('Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ bộ phận hỗ trợ để biết thêm chi tiết.', 403));
  }
  
  if (user.status === 'inactive') {
    return next(new AppError('Tài khoản của bạn đang không hoạt động. Vui lòng liên hệ bộ phận hỗ trợ để kích hoạt lại.', 403));
  }

  // 4) If everything ok, send token to client
  createSendToken(user, 200, res);
});

/**
 * ============================================================================
 * AUTHENTICATION METHODS
 * ============================================================================
 */

/**
 * User logout
 * POST /api/auth/logout
 */
exports.logout = catchAsync(async (req, res, next) => {
  // Clear JWT cookie
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // Expire in 10 seconds
    httpOnly: true
  });

  // If refresh token provided, revoke it
  const { refreshToken } = req.body;
  if (refreshToken && req.user) {
    await req.user.revokeRefreshToken(refreshToken);
  }

  sendResponse(res, 200, true, 'Logged out successfully');
});

/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 401));
  }

  try {
    // Verify refresh token
    const decoded = await verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Get user and check if refresh token is valid
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    // Check if refresh token exists and is not revoked
    const tokenDoc = user.refreshTokens.find(t => 
      t.token === refreshToken && 
      !t.isRevoked && 
      t.expiresAt > new Date()
    );

    if (!tokenDoc) {
      return next(new AppError('Invalid or expired refresh token', 401));
    }

    // Generate new tokens
    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Revoke old refresh token and add new one
    await user.revokeRefreshToken(refreshToken);
    await user.addRefreshToken(newRefreshToken);

    // Set new JWT cookie
    createSendTokenCookie(res, newAccessToken);

    sendResponse(res, 200, true, 'Token refreshed successfully', {
      token: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    return next(new AppError('Invalid refresh token', 401));
  }
});

/**
 * ============================================================================
 * PASSWORD RESET FUNCTIONALITY
 * ============================================================================
 */

/**
 * Forgot password - send reset token to email
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  // 2) Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    // 3) Send token to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
    
    await sendPasswordResetEmail(user, resetURL);

    sendResponse(res, 200, true, 'Token sent to email!');
    
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later.', 500));
  }
});

/**
 * Reset password with token
 * PATCH /api/auth/reset-password/:token
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired and there is a user, set new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property (done in pre-save middleware)

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

/**
 * Update password (for logged-in users)
 * PATCH /api/auth/update-password
 */
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if posted current password is correct
  if (!(await user.comparePassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is incorrect.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

/**
 * ============================================================================
 * EMAIL VERIFICATION
 * ============================================================================
 */

/**
 * Verify email with token
 * POST /api/auth/verify-email
 */
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return next(new AppError('Verification token is required', 400));
  }

  try {
    // Verify JWT token
    const decoded = await verifyToken(token);
    
    // Get user and verify email
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return next(new AppError('Invalid verification token', 400));
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    sendResponse(res, 200, true, 'Email verified successfully', {
      user: {
        id: user._id,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    return next(new AppError('Invalid or expired verification token', 400));
  }
});

/**
 * Resend verification email
 * POST /api/auth/resend-verification
 */
exports.resendVerificationEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Email is required', 400));
  }

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('No user found with that email address', 404));
  }

  // Check if already verified
  if (user.isEmailVerified) {
    return next(new AppError('Email is already verified', 400));
  }

  try {
    // Generate new verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    const verifyURL = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${verificationToken}`;
    await sendEmailVerification(user, verifyURL);

    sendResponse(res, 200, true, 'Verification email sent successfully');

  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Error sending verification email. Please try again.', 500));
  }
});

/**
 * ============================================================================
 * USER PROFILE METHODS
 * ============================================================================
 */

/**
 * Get current user profile
 * GET /api/auth/me
 */
exports.getMe = (req, res) => {
  // The user is already available in req.user from the protect middleware
  sendResponse(res, 200, true, 'User data retrieved successfully', { user: req.user });
};

/**
 * Update current user profile
 * PATCH /api/auth/update-me
 */
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates. Please use /update-password.', 400));
  }

  // 2) Filter out unwanted field names that are not allowed to be updated
  const allowedFields = ['name', 'phone', 'avatar', 'preferences'];
  const filteredBody = {};
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      filteredBody[field] = req.body[field];
    }
  });

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  sendResponse(res, 200, true, 'Profile updated successfully', { user: updatedUser });
});

/**
 * Deactivate current user account (soft delete)
 * DELETE /api/auth/delete-me
 */
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  sendResponse(res, 204, true, 'Account deactivated successfully');
});
