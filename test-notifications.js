/**
 * Test Notification System
 * 
 * Script để test hệ thống thông báo UI
 */

// Add to browser console to test notifications
window.testNotifications = function() {
  console.log('🧪 Testing Notification System...');
  
  // Test different notification types
  const notifications = [
    { type: 'success', message: '✅ Đăng nhập thành công! Chào mừng bạn trở lại.' },
    { type: 'error', message: '❌ Email hoặc mật khẩu không chính xác. Vui lòng thử lại.' },
    { type: 'warning', message: '⚠️ Tài khoản của bạn sắp hết hạn. Vui lòng gia hạn.' },
    { type: 'info', message: 'ℹ️ Hệ thống sẽ bảo trì vào lúc 2:00 AM ngày mai.' },
    { 
      type: 'suspended', 
      message: '🚫 Tài khoản đã bị tạm khóa do vi phạm chính sách sử dụng. Vui lòng liên hệ bộ phận hỗ trợ để được giải quyết.' 
    },
    { 
      type: 'inactive', 
      message: '⚠️ Tài khoản không hoạt động. Vui lòng liên hệ bộ phận hỗ trợ để kích hoạt lại.' 
    }
  ];

  // Show notifications with delay
  notifications.forEach((notif, index) => {
    setTimeout(() => {
      console.log(`Showing ${notif.type} notification:`, notif.message);
      // You would call notify[notif.type](notif.message) here if available
    }, index * 1500);
  });
};

// Test user status scenarios
window.testUserStatusScenarios = function() {
  console.log('🧪 Testing User Status Scenarios...');
  
  const scenarios = [
    {
      scenario: 'Login Success',
      user: 'Nguyễn Văn A',
      message: '✅ Chào mừng Nguyễn Văn A đã đăng nhập thành công!'
    },
    {
      scenario: 'Account Suspended',
      user: 'User123',
      message: '🚫 Tài khoản Admin của bạn đã bị tạm dừng. Vui lòng liên hệ quản trị viên cấp cao để được hỗ trợ.'
    },
    {
      scenario: 'Status Update - Suspended',
      user: 'Trần Thị B',
      message: '🚫 Đã tạm khóa tài khoản của Trần Thị B'
    },
    {
      scenario: 'Status Update - Activated',
      user: 'Lê Văn C',
      message: '✅ Đã kích hoạt tài khoản của Lê Văn C'
    },
    {
      scenario: 'User Deleted',
      user: 'Spam User',
      message: '✅ Đã xóa tài khoản của Spam User'
    }
  ];

  scenarios.forEach((test, index) => {
    setTimeout(() => {
      console.log(`📱 ${test.scenario}:`, test.message);
    }, index * 1000);
  });
};

console.log('✅ Notification test functions ready!');
console.log('Run: window.testNotifications() or window.testUserStatusScenarios()');