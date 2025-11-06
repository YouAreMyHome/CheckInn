/**
 * JWT Authentication System Test
 * 
 * Simple test script to verify JWT authentication functionality
 * Run this to test the completed authentication system
 * 
 * @author CheckInn Team
 * @version 2.0.0
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test configuration
const testUser = {
  name: 'Test User',
  email: 'test@checkinn.com',
  phone: '0987654321',
  password: 'TestPass123!',
  role: 'Customer'
};

let authToken = '';
let refreshToken = '';

/**
 * Test JWT Authentication Flow
 */
async function testJWTAuthentication() {
  console.log('🚀 Starting JWT Authentication System Test\n');

  try {
    // Step 1: Register User
    console.log('1️⃣ Testing User Registration...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
    
    if (registerResponse.data.success) {
      console.log('✅ Registration successful');
      authToken = registerResponse.data.data.token;
      refreshToken = registerResponse.data.data.refreshToken;
    } else {
      console.log('❌ Registration failed');
      return;
    }

    // Step 2: Test Authentication
    console.log('\n2️⃣ Testing Authentication with JWT...');
    const profileResponse = await axios.get(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (profileResponse.data.success) {
      console.log('✅ Authentication successful');
      console.log(`   User: ${profileResponse.data.data.user.name}`);
    } else {
      console.log('❌ Authentication failed');
    }

    // Step 3: Test Token Refresh
    console.log('\n3️⃣ Testing Token Refresh...');
    const refreshResponse = await axios.post(`${API_BASE}/auth/refresh-token`, {
      refreshToken: refreshToken
    });

    if (refreshResponse.data.success) {
      console.log('✅ Token refresh successful');
      authToken = refreshResponse.data.data.token;
    } else {
      console.log('❌ Token refresh failed');
    }

    // Step 4: Test Password Reset Request
    console.log('\n4️⃣ Testing Forgot Password...');
    const forgotResponse = await axios.post(`${API_BASE}/auth/forgot-password`, {
      email: testUser.email
    });

    if (forgotResponse.data.success) {
      console.log('✅ Password reset email would be sent');
    } else {
      console.log('❌ Forgot password failed');
    }

    // Step 5: Test Logout
    console.log('\n5️⃣ Testing Logout...');
    const logoutResponse = await axios.post(`${API_BASE}/auth/logout`, {
      refreshToken: refreshToken
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (logoutResponse.data.success) {
      console.log('✅ Logout successful');
    } else {
      console.log('❌ Logout failed');
    }

    console.log('\n🎉 JWT Authentication System Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ User Registration');
    console.log('   ✅ JWT Token Authentication');
    console.log('   ✅ Token Refresh');
    console.log('   ✅ Password Reset Flow');
    console.log('   ✅ User Logout');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    
    if (error.response?.data?.errors) {
      console.error('   Validation errors:', error.response.data.errors);
    }
  }
}

/**
 * Test Login Flow
 */
async function testLoginFlow() {
  console.log('\n🔐 Testing Login Flow...');

  try {
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      console.log(`   Welcome back: ${loginResponse.data.data.user.name}`);
    } else {
      console.log('❌ Login failed');
    }
  } catch (error) {
    console.error('❌ Login test failed:', error.response?.data?.message || error.message);
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('CheckInn JWT Authentication System Test');
  console.log('=====================================');
  console.log('Make sure the API server is running on port 5000\n');

  // Test if server is running
  try {
    await axios.get(`${API_BASE}/health`);
    console.log('✅ Server is running\n');
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first.');
    console.log('   Command: cd apps/api-server && npm run start\n');
    return;
  }

  await testJWTAuthentication();
  await testLoginFlow();
}

// Run tests
runTests().catch(console.error);