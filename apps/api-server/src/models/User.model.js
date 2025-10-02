
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

const User = mongoose.model('User', userSchema);

module.exports = User;
