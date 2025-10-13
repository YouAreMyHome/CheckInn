/**
 * Registration Routes for CheckInn
 * 
 * Multi-step registration process với OTP verification
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const express = require('express');
const registrationController = require('../controllers/registration.controller');

const router = express.Router();

/**
 * Multi-Step Registration Routes
 * Validation được xử lý trong controller để đơn giản hơn
 */

// BƯỚC 1: Gửi OTP đến email
router.post('/send-otp', registrationController.sendOTPForRegistration);

// BƯỚC 2: Xác thực OTP
router.post('/verify-otp', registrationController.verifyOTP);

// BƯỚC 3: Đặt mật khẩu
router.post('/set-password', registrationController.setPassword);

// BƯỚC 4: Nhập số điện thoại
router.post('/set-phone', registrationController.setPhone);

// BƯỚC 5: Hoàn tất đăng ký
router.post('/complete', registrationController.completeRegistration);

// Helper: Get session info (for debugging - có thể xóa ở production)
router.get(
  '/session/:email',
  registrationController.getRegistrationSession
);

module.exports = router;
