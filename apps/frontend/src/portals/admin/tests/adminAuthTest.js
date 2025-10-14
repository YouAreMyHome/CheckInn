/**
 * Admin Authentication Flow Test
 * 
 * Test script for the admin authentication system
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

// Test the admin auth service
import { adminAuthService } from '../apps/frontend/src/portals/admin/services/adminAuthService';

// Test configurations
const testConfigs = {
  validAdminUser: {
    email: 'admin@checkinn.com',
    password: 'AdminPass123!'
  },
  invalidUser: {
    email: 'customer@checkinn.com',
    password: 'CustomerPass123!'
  },
  nonExistentUser: {
    email: 'nonexistent@checkinn.com',
    password: 'WrongPass123!'
  }
};

/**
 * Test admin login functionality
 */
async function testAdminLogin() {
  console.log('🔐 Testing Admin Login Functionality');
  console.log('=====================================\n');

  // Test 1: Valid admin login
  console.log('1️⃣ Testing valid admin login...');
  try {
    const result = await adminAuthService.adminLogin(
      testConfigs.validAdminUser.email,
      testConfigs.validAdminUser.password
    );
    console.log('✅ Valid admin login successful');
    console.log(`   Welcome: ${result.user.name}`);
    console.log(`   Role: ${result.user.role}`);
  } catch (error) {
    console.log('❌ Valid admin login failed:', error.message);
  }

  console.log();

  // Test 2: Non-admin user login
  console.log('2️⃣ Testing non-admin user rejection...');
  try {
    await adminAuthService.adminLogin(
      testConfigs.invalidUser.email,
      testConfigs.invalidUser.password
    );
    console.log('❌ Non-admin user was allowed (This should not happen!)');
  } catch (error) {
    console.log('✅ Non-admin user correctly rejected:', error.message);
  }

  console.log();

  // Test 3: Invalid credentials
  console.log('3️⃣ Testing invalid credentials...');
  try {
    await adminAuthService.adminLogin(
      testConfigs.nonExistentUser.email,
      testConfigs.nonExistentUser.password
    );
    console.log('❌ Invalid credentials were accepted (This should not happen!)');
  } catch (error) {
    console.log('✅ Invalid credentials correctly rejected:', error.message);
  }
}

/**
 * Test forgot password functionality
 */
async function testForgotPassword() {
  console.log('\n📧 Testing Forgot Password Functionality');
  console.log('=========================================\n');

  // Test 1: Valid admin email
  console.log('1️⃣ Testing forgot password with valid admin email...');
  try {
    await adminAuthService.adminForgotPassword(testConfigs.validAdminUser.email);
    console.log('✅ Forgot password email sent successfully');
  } catch (error) {
    console.log('❌ Forgot password failed:', error.message);
  }

  console.log();

  // Test 2: Invalid email format
  console.log('2️⃣ Testing forgot password with invalid email...');
  try {
    await adminAuthService.adminForgotPassword('invalid-email');
    console.log('❌ Invalid email was accepted (This should not happen!)');
  } catch (error) {
    console.log('✅ Invalid email correctly rejected:', error.message);
  }
}

/**
 * Test reset password functionality
 */
async function testResetPassword() {
  console.log('\n🔑 Testing Reset Password Functionality');
  console.log('=======================================\n');

  const mockToken = 'mock-reset-token-123';
  const newPassword = 'NewAdminPass123!';
  const confirmPassword = 'NewAdminPass123!';

  // Test 1: Valid token and passwords
  console.log('1️⃣ Testing password reset with valid data...');
  try {
    await adminAuthService.adminResetPassword(mockToken, newPassword, confirmPassword);
    console.log('✅ Password reset successful');
  } catch (error) {
    console.log('❌ Password reset failed:', error.message);
  }

  console.log();

  // Test 2: Invalid token
  console.log('2️⃣ Testing password reset with invalid token...');
  try {
    await adminAuthService.adminResetPassword('invalid-token', newPassword, confirmPassword);
    console.log('❌ Invalid token was accepted (This should not happen!)');
  } catch (error) {
    console.log('✅ Invalid token correctly rejected:', error.message);
  }

  console.log();

  // Test 3: Mismatched passwords
  console.log('3️⃣ Testing password reset with mismatched passwords...');
  try {
    await adminAuthService.adminResetPassword(mockToken, newPassword, 'DifferentPass123!');
    console.log('❌ Mismatched passwords were accepted (This should not happen!)');
  } catch (error) {
    console.log('✅ Mismatched passwords correctly rejected:', error.message);
  }
}

/**
 * Test audit logging functionality
 */
function testAuditLogging() {
  console.log('\n📝 Testing Audit Logging Functionality');
  console.log('======================================\n');

  // Test activity tracking
  console.log('1️⃣ Testing activity tracking...');
  try {
    adminAuthService.trackAdminActivity('test_activity', {
      testData: 'This is a test activity',
      timestamp: new Date().toISOString()
    });
    
    const logs = adminAuthService.getAdminAuditLogs();
    const lastLog = logs[logs.length - 1];
    
    if (lastLog && lastLog.activity === 'test_activity') {
      console.log('✅ Activity tracking successful');
      console.log(`   Activity: ${lastLog.activity}`);
      console.log(`   Timestamp: ${lastLog.timestamp}`);
    } else {
      console.log('❌ Activity tracking failed');
    }
  } catch (error) {
    console.log('❌ Activity tracking error:', error.message);
  }

  console.log();

  // Test session management
  console.log('2️⃣ Testing session management...');
  try {
    const sessionId = adminAuthService.getSessionId();
    if (sessionId && sessionId.startsWith('admin_')) {
      console.log('✅ Session management working');
      console.log(`   Session ID: ${sessionId}`);
    } else {
      console.log('❌ Session management failed');
    }
  } catch (error) {
    console.log('❌ Session management error:', error.message);
  }
}

/**
 * Test admin role validation
 */
function testAdminValidation() {
  console.log('\n🛡️ Testing Admin Role Validation');
  console.log('=================================\n');

  // Mock different user types
  const users = [
    { role: 'Admin', name: 'Admin User' },
    { role: 'Customer', name: 'Customer User' },
    { role: 'HotelPartner', name: 'Hotel Partner' },
    null
  ];

  users.forEach((user, index) => {
    console.log(`${index + 1}️⃣ Testing role: ${user ? user.role : 'No user'}...`);
    
    // Mock current user
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }

    const isAdmin = adminAuthService.isAdmin();
    const expected = user && user.role === 'Admin';
    
    if (isAdmin === expected) {
      console.log(`✅ Role validation correct: ${isAdmin ? 'Admin' : 'Not admin'}`);
    } else {
      console.log(`❌ Role validation failed: Expected ${expected}, got ${isAdmin}`);
    }
  });

  // Cleanup
  localStorage.removeItem('user');
}

/**
 * Main test runner
 */
async function runAdminAuthTests() {
  console.log('🎯 CheckInn Admin Authentication System Tests');
  console.log('============================================');
  console.log('Testing all components of the admin auth system\n');

  try {
    await testAdminLogin();
    await testForgotPassword();
    await testResetPassword();
    testAuditLogging();
    testAdminValidation();

    console.log('\n🎉 Admin Authentication Tests Complete!');
    console.log('======================================');
    console.log('Review the results above to ensure all components are working correctly.');
    console.log('Note: Some tests may fail if backend APIs are not yet implemented.');
    
  } catch (error) {
    console.error('\n❌ Test runner failed:', error.message);
  }
}

// Export for use in development
export { runAdminAuthTests, testConfigs };

// Auto-run if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.runAdminAuthTests = runAdminAuthTests;
  console.log('🧪 Admin auth tests loaded. Run `runAdminAuthTests()` in console to execute.');
} else {
  // Node environment
  runAdminAuthTests().catch(console.error);
}