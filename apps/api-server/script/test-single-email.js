/**
 * Script test email đơn lẻ
 * Gửi một email template cụ thể để kiểm tra nhanh
 * 
 * Usage: 
 *   node script/test-single-email.js welcome
 *   node script/test-single-email.js otp
 *   node script/test-single-email.js verify
 *   node script/test-single-email.js booking-confirmation
 *   node script/test-single-email.js booking-cancelled
 *   node script/test-single-email.js password-reset
 */

const { sendTestEmail, sampleData } = require('./test-email-templates');

const templateMap = {
  'welcome': 'welcome',
  'verify': 'verifyEmail',
  'verify-email': 'verifyEmail',
  'otp': 'otpVerification',
  'otp-verification': 'otpVerification',
  'booking': 'bookingConfirmation',
  'booking-confirmation': 'bookingConfirmation',
  'cancel': 'bookingCancelled',
  'booking-cancelled': 'bookingCancelled',
  'password': 'passwordReset',
  'password-reset': 'passwordReset',
  'reset': 'passwordReset'
};

async function main() {
  const templateArg = process.argv[2];

  if (!templateArg) {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   TEST SINGLE EMAIL TEMPLATE - CheckInn                ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log('Usage: node script/test-single-email.js <template>\n');
    console.log('Available templates:');
    console.log('  • welcome             - Email chào mừng');
    console.log('  • verify              - Xác thực email');
    console.log('  • otp                 - Mã OTP');
    console.log('  • booking             - Xác nhận đặt phòng');
    console.log('  • cancel              - Hủy đặt phòng');
    console.log('  • password            - Đặt lại mật khẩu');
    console.log('\nExample: node script/test-single-email.js welcome\n');
    process.exit(1);
  }

  const templateKey = templateMap[templateArg.toLowerCase()];

  if (!templateKey || !sampleData[templateKey]) {
    console.error(`❌ Template không tồn tại: ${templateArg}`);
    console.log('\n💡 Templates có sẵn:', Object.keys(templateMap).join(', '));
    process.exit(1);
  }

  const config = sampleData[templateKey];

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   TEST SINGLE EMAIL - CheckInn                         ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  console.log(`📧 Template: ${config.template}`);
  console.log(`📬 Email: consauchetduoi@gmail.com`);
  console.log(`📝 Subject: ${config.subject}\n`);

  const result = await sendTestEmail(config.template, config.subject, config.data);

  if (result.success) {
    console.log('\n🎉 Email đã được gửi thành công!');
    console.log('📬 Vui lòng kiểm tra hộp thư: consauchetduoi@gmail.com');
    console.log('💡 Lưu ý: Email có thể vào folder Spam/Junk\n');
  } else {
    console.log('\n❌ Gửi email thất bại!');
    console.log(`Error: ${result.error}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('\n💥 Lỗi:', error.message);
    process.exit(1);
  });
}
