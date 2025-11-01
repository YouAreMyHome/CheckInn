
/**
 * User Model for CheckInn Hotel Booking Platform
 * 
 * Quản lý thông tin người dùng với 3 roles: Customer, HotelPartner, Admin
 * Bao gồm authentication, validation, và security features
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema định nghĩa cấu trúc dữ liệu User
const userSchema = new mongoose.Schema({
  // Thông tin cá nhân cơ bản
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true, // Tự động loại bỏ khoảng trắng đầu cuối
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // Đảm bảo email duy nhất trong hệ thống
    trim: true,
    lowercase: true, // Tự động chuyển về chữ thường
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    // TODO: Thêm validation format cho số điện thoại
  },
  // Bảo mật và xác thực
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8, // Tối thiểu 8 ký tự
    select: false, // Không trả về password khi query (bảo mật)
  },
  role: {
    type: String,
    enum: ['Customer', 'HotelPartner', 'Admin'], // 3 loại người dùng
    default: 'Customer', // Mặc định là khách hàng
  },
  // Xác thực và hồ sơ
  isEmailVerified: {
    type: Boolean,
    default: false, // Mặc định chưa xác thực email
  },
  avatar: {
    type: String,
    default: '', // URL ảnh đại diện
  },
  
  // Password reset functionality
  passwordChangedAt: Date, // Thời điểm thay đổi password gần nhất
  passwordResetToken: String, // Token để reset password
  passwordResetExpires: Date, // Thời hạn token reset
  
  // Email verification
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Security features
  active: {
    type: Boolean,
    default: true,
    select: false // Don't include in queries by default
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'inactive'],
    default: 'active'
  },
  statusUpdatedAt: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  lastActive: Date,
  lastIP: String,
  deviceInfo: {
    lastSeen: Date,
    userAgent: String,
    loginHistory: [{
      ip: String,
      userAgent: String,
      loginTime: { type: Date, default: Date.now },
      location: String
    }]
  },
  
  // Refresh token tracking
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
    isRevoked: { type: Boolean, default: false }
  }]
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
});

/**
 * Pre-save middleware: Hash password trước khi lưu
 * Chỉ hash khi password được thay đổi (tránh hash lại khi update thông tin khác)
 */
userSchema.pre('save', async function (next) {
  // Chỉ chạy khi password được modify
  if (!this.isModified('password')) return next();

  // Hash password với bcrypt cost 12 (cân bằng giữa bảo mật và performance)
  this.password = await bcrypt.hash(this.password, 12);
  
  // Set passwordChangedAt for password changes (not for new users)
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token is created after password change
  }

  next();
});

/**
 * Instance method: So sánh password
 * 
 * @param {string} candidatePassword - Password người dùng nhập vào
 * @param {string} userPassword - Password đã hash trong database
 * @returns {Promise<boolean>} - True nếu password khớp
 */
userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

/**
 * Check if password was changed after JWT token was issued
 * @param {number} JWTTimestamp - JWT issued at timestamp
 * @returns {boolean} True if password was changed after token
 */
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  
  // False means password not changed
  return false;
};

/**
 * Generate password reset token
 * @returns {string} Plain reset token (to send via email)
 */
userSchema.methods.createPasswordResetToken = function() {
  const crypto = require('crypto');
  
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and save to database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  // Set expiry time (10 minutes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
  // Return plain token (to send via email)
  return resetToken;
};

/**
 * Generate email verification token
 * @returns {string} Plain verification token
 */
userSchema.methods.createEmailVerificationToken = function() {
  const crypto = require('crypto');
  
  // Generate random token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and save to database
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  // Set expiry time (24 hours)
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  
  // Return plain token
  return verificationToken;
};

/**
 * Check if user account is locked
 */
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

/**
 * Increment login attempts
 */
userSchema.methods.incLoginAttempts = function() {
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
  const lockTime = parseInt(process.env.LOCK_TIME) * 60 * 1000 || 15 * 60 * 1000; // 15 minutes default
  
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // If we hit max attempts and it's not locked yet, lock account
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

/**
 * Reset login attempts
 */
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

/**
 * Add refresh token
 * @param {string} token - Refresh token
 */
userSchema.methods.addRefreshToken = function(token) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
  
  this.refreshTokens.push({
    token,
    expiresAt,
    isRevoked: false
  });
  
  // Keep only last 5 refresh tokens per user
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
  
  return this.save();
};

/**
 * Revoke refresh token
 * @param {string} token - Token to revoke
 */
userSchema.methods.revokeRefreshToken = function(token) {
  const tokenDoc = this.refreshTokens.find(t => t.token === token);
  if (tokenDoc) {
    tokenDoc.isRevoked = true;
    return this.save();
  }
  return Promise.resolve();
};

/**
 * Clean expired refresh tokens
 */
userSchema.methods.cleanExpiredTokens = function() {
  this.refreshTokens = this.refreshTokens.filter(
    token => token.expiresAt > new Date() && !token.isRevoked
  );
  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
