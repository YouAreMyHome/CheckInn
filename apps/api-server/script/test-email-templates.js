/**
 * Script kiểm tra giao diện tất cả Email Templates
 * Gửi tất cả các mẫu email đến địa chỉ test để xem trước
 * 
 * Usage: node script/test-email-templates.js
 */

const nodemailer = require('nodemailer');
const pug = require('pug');
const path = require('path');
require('dotenv').config();

// ========== CẤU HÌNH ==========
const TEST_EMAIL = 'consauchetduoi@gmail.com';
const FROM_EMAIL = `CheckInn Hotel Booking <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`;

// ========== DỮ LIỆU MẪU ==========
const sampleData = {
  // Welcome Email
  welcome: {
    template: 'welcome',
    subject: '[TEST] Chào mừng đến với CheckInn!',
    data: {
      firstName: 'Nguyễn Văn A',
      url: 'https://checkinn.vn',
      logoLink: 'https://checkinn.vn',
      companyAddress: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
      pageTitle: 'Chào mừng đến với CheckInn'
    }
  },

  // Verify Email
  verifyEmail: {
    template: 'verify-email',
    subject: '[TEST] Xác thực Email của bạn',
    data: {
      firstName: 'Nguyễn Văn A',
      verificationUrl: 'https://checkinn.vn/verify?token=abc123xyz456',
      logoLink: 'https://checkinn.vn',
      companyAddress: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
      pageTitle: 'Xác thực Email của bạn'
    }
  },

  // OTP Verification
  otpVerification: {
    template: 'otp-verification',
    subject: '[TEST] Mã xác thực OTP của bạn',
    data: {
      firstName: 'Nguyễn Văn A',
      otpCode: '123456',
      logoLink: 'https://checkinn.vn',
      companyAddress: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
      pageTitle: 'Mã xác thực OTP của bạn'
    }
  },

  // Booking Confirmation
  bookingConfirmation: {
    template: 'booking-confirmation',
    subject: '[TEST] Đặt phòng của bạn đã được xác nhận!',
    data: {
      customerName: 'Nguyễn Văn A',
      bookingId: 'CKN-12345678',
      checkInDate: 'Thứ Hai, 10/11/2025',
      checkOutDate: 'Thứ Ba, 11/11/2025',
      hotelName: 'Khách sạn Mường Thanh Luxury',
      hotelAddress: '12 Võ Nguyên Giáp, Đà Nẵng, Việt Nam',
      roomType: '1x Phòng Deluxe Hướng Biển (2 người lớn)',
      cancellationPolicy: 'Không hoàn hủy. Mọi thay đổi hoặc hủy sẽ bị tính phí.',
      totalPaid: '2.500.000 VNĐ',
      manageBookingLink: 'https://checkinn.vn/manage/CKN-12345678',
      logoLink: 'https://checkinn.vn',
      companyAddress: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
      pageTitle: 'Đặt phòng của bạn đã được xác nhận!'
    }
  },

  // Booking Cancelled
  bookingCancelled: {
    template: 'booking-cancelled',
    subject: '[TEST] Đặt phòng của bạn đã được hủy',
    data: {
      customerName: 'Nguyễn Văn A',
      bookingId: 'CKN-12345678',
      hotelName: 'Khách sạn Mường Thanh Luxury',
      cancellationDate: 'Thứ Năm, 06/11/2025',
      refundStatus: 'Một khoản hoàn tiền trị giá 2.500.000 VNĐ sẽ được xử lý và gửi về tài khoản ngân hàng của bạn trong vòng 5-7 ngày làm việc.',
      findBookingLink: 'https://checkinn.vn',
      logoLink: 'https://checkinn.vn',
      companyAddress: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
      pageTitle: 'Đặt phòng của bạn đã được hủy'
    }
  },

  // Password Reset
  passwordReset: {
    template: 'password-reset',
    subject: '[TEST] Yêu cầu đặt lại mật khẩu',
    data: {
      customerName: 'Nguyễn Văn A',
      expiryTime: '30 phút',
      resetLink: 'https://checkinn.vn/reset-password?token=SOME_SECURE_TOKEN_123',
      logoLink: 'https://checkinn.vn',
      companyAddress: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
      pageTitle: 'Yêu cầu đặt lại mật khẩu'
    }
  }
};

// ========== TẠO TRANSPORTER ==========
function createTransporter() {
  const emailService = process.env.EMAIL_SERVICE;
  
  console.log('📧 Email Service:', emailService || 'smtp/gmail (default)');
  
  // SMTP/Gmail Configuration
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

// ========== GỬI EMAIL ==========
async function sendTestEmail(templateName, subject, data) {
  try {
    console.log(`\n📨 Đang gửi: ${templateName}...`);
    
    // Render HTML từ Pug template
    const templatePath = path.join(
      __dirname,
      '../src/views/emails',
      `${templateName}.pug`
    );

    const html = pug.renderFile(templatePath, data);

    // Tạo mail options
    const mailOptions = {
      from: FROM_EMAIL,
      to: TEST_EMAIL,
      subject: subject,
      html: html
    };

    // Gửi email
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ ${templateName} - Sent successfully!`);
    console.log(`   Message ID: ${info.messageId}`);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ ${templateName} - Failed:`, error.message);
    return { success: false, error: error.message };
  }
}

// ========== MAIN FUNCTION ==========
async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   TEST EMAIL TEMPLATES - CheckInn Hotel Booking        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📬 Email nhận test: ${TEST_EMAIL}`);
  console.log(`📤 Email gửi: ${FROM_EMAIL}`);
  console.log('');
  console.log('⏳ Bắt đầu kiểm tra kết nối...');

  // Test connection
  const transporter = createTransporter();
  try {
    await transporter.verify();
    console.log('✅ Kết nối email server thành công!\n');
  } catch (error) {
    console.error('❌ Lỗi kết nối email server:', error.message);
    console.log('\n💡 Hướng dẫn:');
    console.log('   1. Kiểm tra file .env có đủ thông tin:');
    console.log('      - EMAIL_SERVICE (smtp/gmail)');
    console.log('      - EMAIL_HOST (smtp.gmail.com)');
    console.log('      - EMAIL_PORT (587)');
    console.log('      - EMAIL_USERNAME (your-email@gmail.com)');
    console.log('      - EMAIL_PASSWORD (app password)');
    console.log('   2. Nếu dùng Gmail, cần tạo App Password:');
    console.log('      https://myaccount.google.com/apppasswords');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('Gửi tất cả email templates...\n');

  const results = [];

  // Gửi từng email với delay để tránh rate limit
  for (const [key, config] of Object.entries(sampleData)) {
    const result = await sendTestEmail(config.template, config.subject, config.data);
    results.push({ template: key, ...result });
    
    // Delay 2 giây giữa mỗi email
    if (Object.keys(sampleData).indexOf(key) < Object.keys(sampleData).length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Tổng kết
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 KẾT QUẢ TỔNG HỢP:');
  console.log('═══════════════════════════════════════════════════════\n');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${result.template}`);
  });

  console.log('\n' + '─'.repeat(55));
  console.log(`Thành công: ${successful}/${results.length}`);
  console.log(`Thất bại: ${failed}/${results.length}`);
  console.log('─'.repeat(55));

  if (successful === results.length) {
    console.log('\n🎉 TẤT CẢ EMAIL ĐÃ ĐƯỢC GỬI THÀNH CÔNG!');
    console.log(`📬 Vui lòng kiểm tra hộp thư: ${TEST_EMAIL}`);
    console.log('💡 Lưu ý: Email có thể vào folder Spam/Junk');
  } else {
    console.log('\n⚠️  MỘT SỐ EMAIL KHÔNG GỬI ĐƯỢC!');
    console.log('💡 Kiểm tra lại cấu hình email và thử lại.');
  }

  console.log('\n' + '═'.repeat(55) + '\n');
  process.exit(0);
}

// ========== RUN ==========
if (require.main === module) {
  main().catch(error => {
    console.error('\n💥 Lỗi nghiêm trọng:', error);
    process.exit(1);
  });
}

module.exports = { sendTestEmail, sampleData };
