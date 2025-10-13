/**
 * OTP (One-Time Password) Service for CheckInn
 * 
 * Xử lý generate, verify, và manage OTP cho email verification
 * trong quy trình đăng ký người dùng
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const crypto = require('crypto');

/**
 * In-memory OTP storage (sử dụng Map cho development)
 * Production nên dùng Redis để scale và có TTL tự động
 */
class OTPService {
  constructor() {
    // Store OTP theo format: email -> { code, expiresAt, attempts }
    this.otpStore = new Map();
    
    // Config
    this.OTP_LENGTH = 6;
    this.OTP_EXPIRY_MINUTES = 5;
    this.MAX_ATTEMPTS = 5;
    this.RESEND_COOLDOWN_SECONDS = 60;
  }

  /**
   * Generate random 6-digit OTP
   */
  generateOTP() {
    const min = Math.pow(10, this.OTP_LENGTH - 1);
    const max = Math.pow(10, this.OTP_LENGTH) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  }

  /**
   * Lưu OTP vào storage
   * @param {string} email - Email người dùng
   * @returns {object} - { code, expiresAt }
   */
  createOTP(email) {
    const code = this.generateOTP();
    const expiresAt = Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000;
    const lastSentAt = Date.now();

    this.otpStore.set(email.toLowerCase(), {
      code,
      expiresAt,
      attempts: 0,
      lastSentAt,
    });

    console.log(`[OTP] Created for ${email}: ${code} (expires in ${this.OTP_EXPIRY_MINUTES}m)`);

    return { code, expiresAt };
  }

  /**
   * Verify OTP
   * @param {string} email - Email người dùng
   * @param {string} code - Mã OTP cần verify
   * @returns {object} - { success, message }
   */
  verifyOTP(email, code) {
    const normalizedEmail = email.toLowerCase();
    const otpData = this.otpStore.get(normalizedEmail);

    // Check if OTP exists
    if (!otpData) {
      return {
        success: false,
        message: 'Mã OTP không tồn tại hoặc đã hết hạn. Vui lòng yêu cầu mã mới.',
      };
    }

    // Check if OTP expired
    if (Date.now() > otpData.expiresAt) {
      this.otpStore.delete(normalizedEmail);
      return {
        success: false,
        message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.',
      };
    }

    // Check max attempts
    if (otpData.attempts >= this.MAX_ATTEMPTS) {
      this.otpStore.delete(normalizedEmail);
      return {
        success: false,
        message: 'Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.',
      };
    }

    // Verify code
    if (otpData.code !== code) {
      otpData.attempts += 1;
      return {
        success: false,
        message: `Mã OTP không chính xác. Còn ${this.MAX_ATTEMPTS - otpData.attempts} lần thử.`,
        attemptsLeft: this.MAX_ATTEMPTS - otpData.attempts,
      };
    }

    // Success - xóa OTP sau khi verify thành công
    this.otpStore.delete(normalizedEmail);
    console.log(`[OTP] Verified successfully for ${email}`);

    return {
      success: true,
      message: 'Xác thực OTP thành công!',
    };
  }

  /**
   * Check if can resend OTP (cooldown check)
   * @param {string} email - Email người dùng
   * @returns {object} - { canResend, remainingSeconds }
   */
  canResendOTP(email) {
    const normalizedEmail = email.toLowerCase();
    const otpData = this.otpStore.get(normalizedEmail);

    if (!otpData) {
      return { canResend: true, remainingSeconds: 0 };
    }

    const timeSinceLastSent = Date.now() - otpData.lastSentAt;
    const cooldownMs = this.RESEND_COOLDOWN_SECONDS * 1000;

    if (timeSinceLastSent < cooldownMs) {
      const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastSent) / 1000);
      return {
        canResend: false,
        remainingSeconds,
        message: `Vui lòng đợi ${remainingSeconds} giây trước khi gửi lại mã.`,
      };
    }

    return { canResend: true, remainingSeconds: 0 };
  }

  /**
   * Xóa OTP (cleanup hoặc user request)
   * @param {string} email - Email người dùng
   */
  deleteOTP(email) {
    const normalizedEmail = email.toLowerCase();
    this.otpStore.delete(normalizedEmail);
    console.log(`[OTP] Deleted for ${email}`);
  }

  /**
   * Get OTP info (for debugging)
   * @param {string} email - Email người dùng
   */
  getOTPInfo(email) {
    const normalizedEmail = email.toLowerCase();
    const otpData = this.otpStore.get(normalizedEmail);
    
    if (!otpData) {
      return null;
    }

    return {
      hasOTP: true,
      expiresAt: new Date(otpData.expiresAt).toISOString(),
      attempts: otpData.attempts,
      remainingAttempts: this.MAX_ATTEMPTS - otpData.attempts,
      isExpired: Date.now() > otpData.expiresAt,
    };
  }

  /**
   * Cleanup expired OTPs (chạy định kỳ)
   */
  cleanupExpiredOTPs() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [email, otpData] of this.otpStore.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStore.delete(email);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`[OTP] Cleaned up ${cleanedCount} expired OTPs`);
    }

    return cleanedCount;
  }
}

// Singleton instance
const otpService = new OTPService();

// Auto cleanup expired OTPs every 5 minutes
setInterval(() => {
  otpService.cleanupExpiredOTPs();
}, 5 * 60 * 1000);

module.exports = otpService;
