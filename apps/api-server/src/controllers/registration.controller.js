/**
 * Multi-Step Registration Controller for CheckInn
 * 
 * Quy trình đăng ký 5 bước:
 * 1. Nhập Email → check exists + send OTP
 * 2. Verify OTP
 * 3. Đặt mật khẩu
 * 4. Nhập số điện thoại
 * 5. Hoàn tất đăng ký
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const User = require('../models/User.model');
const otpService = require('../utils/otp');
const { sendOTPEmail } = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendResponse } = require('../utils/apiResponse');

/**
 * In-memory storage for registration session data
 * Production: nên dùng Redis với TTL 30 phút
 */
const registrationSessions = new Map();

/**
 * BƯỚC 1: Send OTP to Email
 * POST /auth/register/send-otp
 * Body: { email }
 */
exports.sendOTPForRegistration = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Vui lòng nhập địa chỉ email', 400));
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 1) Check if email already registered
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return next(
      new AppError(
        'Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.',
        400
      )
    );
  }

  // 2) Check resend cooldown
  const { canResend, remainingSeconds, message } = otpService.canResendOTP(normalizedEmail);
  if (!canResend) {
    return next(new AppError(message, 429));
  }

  // 3) Generate and save OTP
  const { code, expiresAt } = otpService.createOTP(normalizedEmail);

  // 4) Send OTP email
  try {
    await sendOTPEmail({ email: normalizedEmail, name: 'User' }, code);
    console.log(`[Registration] OTP sent to ${normalizedEmail}`);
  } catch (error) {
    console.error('[Registration] Error sending OTP email:', error);
    otpService.deleteOTP(normalizedEmail);
    return next(
      new AppError('Không thể gửi email. Vui lòng thử lại sau.', 500)
    );
  }

  // 5) Initialize registration session
  registrationSessions.set(normalizedEmail, {
    email: normalizedEmail,
    step: 1, // Đang ở bước verify OTP
    createdAt: Date.now(),
  });

  sendResponse(res, 200, true, 'Mã OTP đã được gửi đến email của bạn', {
    email: normalizedEmail,
    expiresAt: new Date(expiresAt).toISOString(),
    expiryMinutes: 5,
  });
});

/**
 * BƯỚC 2: Verify OTP
 * POST /auth/register/verify-otp
 * Body: { email, otp }
 */
exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new AppError('Vui lòng nhập email và mã OTP', 400));
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 1) Check registration session exists
  const session = registrationSessions.get(normalizedEmail);
  if (!session) {
    return next(
      new AppError('Phiên đăng ký không tồn tại. Vui lòng bắt đầu lại.', 400)
    );
  }

  // 2) Verify OTP
  const verifyResult = otpService.verifyOTP(normalizedEmail, otp);

  if (!verifyResult.success) {
    return next(new AppError(verifyResult.message, 400));
  }

  // 3) Update session - chuyển sang bước 2 (set password)
  session.step = 2;
  session.emailVerified = true;
  session.verifiedAt = Date.now();

  sendResponse(res, 200, true, 'Xác thực OTP thành công!', {
    email: normalizedEmail,
    nextStep: 'password',
    message: 'Vui lòng đặt mật khẩu cho tài khoản',
  });
});

/**
 * BƯỚC 3: Set Password
 * POST /auth/register/set-password
 * Body: { email, password, confirmPassword }
 */
exports.setPassword = catchAsync(async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    return next(
      new AppError('Vui lòng nhập đầy đủ thông tin mật khẩu', 400)
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 1) Check session exists and email verified
  const session = registrationSessions.get(normalizedEmail);
  if (!session || !session.emailVerified) {
    return next(
      new AppError(
        'Phiên đăng ký không hợp lệ. Vui lòng xác thực email trước.',
        400
      )
    );
  }

  // 2) Validate passwords match
  if (password !== confirmPassword) {
    return next(new AppError('Mật khẩu xác nhận không khớp', 400));
  }

  // 3) Validate password strength (basic)
  if (password.length < 8) {
    return next(new AppError('Mật khẩu phải có ít nhất 8 ký tự', 400));
  }

  // Optional: Check password strength with regex
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    return next(
      new AppError(
        'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số',
        400
      )
    );
  }

  // 4) Update session
  session.step = 3;
  session.password = password; // Sẽ được hash khi tạo user
  session.passwordSetAt = Date.now();

  sendResponse(res, 200, true, 'Mật khẩu đã được thiết lập thành công', {
    email: normalizedEmail,
    nextStep: 'phone',
    message: 'Vui lòng nhập số điện thoại',
  });
});

/**
 * BƯỚC 4: Set Phone Number
 * POST /auth/register/set-phone
 * Body: { email, phone }
 */
exports.setPhone = catchAsync(async (req, res, next) => {
  const { email, phone } = req.body;

  if (!email || !phone) {
    return next(new AppError('Vui lòng nhập email và số điện thoại', 400));
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 1) Check session exists and password set
  const session = registrationSessions.get(normalizedEmail);
  if (!session || !session.password) {
    return next(
      new AppError(
        'Phiên đăng ký không hợp lệ. Vui lòng đặt mật khẩu trước.',
        400
      )
    );
  }

  // 2) Validate phone format (Vietnamese)
  const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
  if (!phoneRegex.test(phone)) {
    return next(
      new AppError('Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng.', 400)
    );
  }

  // 3) Check if phone already used
  const existingPhone = await User.findOne({ phone });
  if (existingPhone) {
    return next(
      new AppError('Số điện thoại này đã được sử dụng. Vui lòng dùng số khác.', 400)
    );
  }

  // 4) Update session
  session.step = 4;
  session.phone = phone;
  session.phoneSetAt = Date.now();

  sendResponse(res, 200, true, 'Số điện thoại đã được thiết lập', {
    email: normalizedEmail,
    phone,
    nextStep: 'complete',
    message: 'Sẵn sàng hoàn tất đăng ký',
  });
});

/**
 * BƯỚC 5: Complete Registration
 * POST /auth/register/complete
 * Body: { email, name }
 */
exports.completeRegistration = catchAsync(async (req, res, next) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return next(new AppError('Vui lòng nhập email và tên đầy đủ', 400));
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 1) Check session complete
  const session = registrationSessions.get(normalizedEmail);
  if (!session || !session.emailVerified || !session.password || !session.phone) {
    return next(
      new AppError(
        'Phiên đăng ký không đầy đủ. Vui lòng hoàn thành các bước trước.',
        400
      )
    );
  }

  // 2) Double check email not registered (race condition)
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    registrationSessions.delete(normalizedEmail);
    return next(new AppError('Email đã được đăng ký bởi người khác', 400));
  }

  // 3) Create user account
  try {
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: session.phone,
      password: session.password, // Will be hashed by pre-save middleware
      role: 'Customer', // Default role
      emailVerified: true, // Already verified via OTP
    });

    // 4) Clean up session
    registrationSessions.delete(normalizedEmail);

    // 5) Send welcome email (non-blocking)
    const { sendWelcomeEmail } = require('../utils/email');
    const welcomeURL = `${req.protocol}://${req.get('host')}/dashboard`;
    sendWelcomeEmail(newUser, welcomeURL).catch((error) => {
      console.error('Error sending welcome email:', error);
    });

    // 6) Generate JWT token
    const { generateToken, createSendTokenCookie } = require('../utils/jwt');
    const token = generateToken(newUser._id);
    createSendTokenCookie(res, token);

    // Remove password from output
    newUser.password = undefined;

    sendResponse(res, 201, true, 'Đăng ký tài khoản thành công! 🎉', {
      token,
      user: newUser,
      message: 'Chúc mừng! Tài khoản của bạn đã được tạo thành công.',
    });

    console.log(`[Registration] Completed for ${normalizedEmail}`);
  } catch (error) {
    console.error('[Registration] Error creating user:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return next(
        new AppError(`Validation failed: ${validationErrors.join(', ')}`, 400)
      );
    }

    return next(error);
  }
});

/**
 * Helper: Get registration session info (for debugging)
 * GET /auth/register/session/:email
 */
exports.getRegistrationSession = catchAsync(async (req, res, next) => {
  const { email } = req.params;
  const normalizedEmail = email.toLowerCase().trim();

  const session = registrationSessions.get(normalizedEmail);
  if (!session) {
    return next(new AppError('Phiên đăng ký không tồn tại', 404));
  }

  // Don't expose password
  const safeSession = { ...session };
  if (safeSession.password) {
    safeSession.password = '***HIDDEN***';
  }

  const otpInfo = otpService.getOTPInfo(normalizedEmail);

  sendResponse(res, 200, true, 'Thông tin phiên đăng ký', {
    session: safeSession,
    otp: otpInfo,
  });
});

/**
 * Cleanup expired sessions (chạy định kỳ)
 * Sessions expire after 30 minutes
 */
setInterval(() => {
  const now = Date.now();
  const SESSION_EXPIRY = 30 * 60 * 1000; // 30 minutes
  let cleanedCount = 0;

  for (const [email, session] of registrationSessions.entries()) {
    if (now - session.createdAt > SESSION_EXPIRY) {
      registrationSessions.delete(email);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`[Registration] Cleaned up ${cleanedCount} expired sessions`);
  }
}, 10 * 60 * 1000); // Run every 10 minutes

module.exports = exports;
