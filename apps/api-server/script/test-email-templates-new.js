const pug = require('pug');
const fs = require('fs');
const path = require('path');

// Test data cho các email templates
const testData = {
  'welcome': {
    pageTitle: 'Chào mừng - CheckInn',
    logoLink: 'https://checkinn.vn',
    firstName: 'Nguyễn Văn A',
    cityName: 'Hồ Chí Minh',
    hotelCount: '2,500',
    exploreLink: 'https://checkinn.vn/search',
    companyAddress: '123 Đường ABC, Quận 1, TP.HCM'
  },
  'booking-confirmation': {
    pageTitle: 'Xác nhận đặt phòng - CheckInn',
    logoLink: 'https://checkinn.vn',
    customerName: 'Nguyễn Văn A',
    bookingId: 'CHK-2024-001234',
    hotelName: 'Khách sạn Grand Palace',
    hotelAddress: '456 Đường XYZ, Quận 1, TP.HCM',
    checkInDate: '15/11/2024 14:00',
    checkOutDate: '17/11/2024 12:00',
    roomType: 'Phòng Deluxe King (2 giường)',
    totalPaid: '2,850,000 VND',
    cancellationPolicy: 'Hủy miễn phí trước 24h. Phí hủy 50% trong vòng 24h.',
    manageBookingLink: 'https://checkinn.vn/booking/CHK-2024-001234',
    companyAddress: '123 Đường ABC, Quận 1, TP.HCM'
  },
  'otp-verification': {
    pageTitle: 'Xác thực OTP - CheckInn',
    logoLink: 'https://checkinn.vn',
    firstName: 'Nguyễn Văn A',
    otpCode: '1 2 3 4 5 6',
    companyAddress: '123 Đường ABC, Quận 1, TP.HCM'
  },
  'password-reset': {
    pageTitle: 'Đặt lại mật khẩu - CheckInn',
    logoLink: 'https://checkinn.vn',
    customerName: 'Nguyễn Văn A',
    resetLink: 'https://checkinn.vn/reset-password?token=abc123def456',
    expiryTime: '1 giờ',
    companyAddress: '123 Đường ABC, Quận 1, TP.HCM'
  },
  'booking-cancelled': {
    pageTitle: 'Hủy đặt phòng - CheckInn',
    logoLink: 'https://checkinn.vn',
    customerName: 'Nguyễn Văn A',
    bookingId: 'CHK-2024-001234',
    hotelName: 'Khách sạn Grand Palace',
    cancellationDate: '10/11/2024 10:30',
    refundStatus: 'Hoàn tiền 2,850,000 VND sẽ được xử lý trong 5-7 ngày làm việc qua phương thức thanh toán ban đầu.',
    findBookingLink: 'https://checkinn.vn/search',
    companyAddress: '123 Đường ABC, Quận 1, TP.HCM'
  }
};

// Function để render email
function renderEmail(templateName, data) {
  const templatePath = path.join(__dirname, 'src', 'views', 'emails', `${templateName}.pug`);
  try {
    const html = pug.renderFile(templatePath, data);
    const outputPath = path.join(__dirname, `${templateName}-preview.html`);
    fs.writeFileSync(outputPath, html);
    console.log(`✅ ${templateName}.pug rendered successfully -> ${templateName}-preview.html`);
    return true;
  } catch (error) {
    console.error(`❌ Error rendering ${templateName}.pug:`, error.message);
    return false;
  }
}

// Render tất cả email templates
console.log('🚀 Rendering CheckInn Email Templates...\n');

let successCount = 0;

Object.keys(testData).forEach(templateName => {
  if (renderEmail(templateName, testData[templateName])) {
    successCount++;
  }
});

console.log(`\n📊 Results: ${successCount}/${Object.keys(testData).length} templates rendered successfully`);
console.log('📁 Check the generated HTML files to preview the emails in your browser');

if (successCount === Object.keys(testData).length) {
  console.log('\n🎉 All email templates rendered successfully!');
  console.log('💡 Tip: Open the HTML files in your browser to see the beautiful new design');
} else {
  console.log('\n⚠️  Some templates failed to render. Check the errors above.');
}