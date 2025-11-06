/**
 * Test Admin Self-Restriction
 * Kiểm tra xem Admin có thể thao tác trên chính tài khoản của mình không
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@checkinn.com',
  password: 'AdminPass123!'
};

let adminToken = '';
let adminUserId = '';

/**
 * 1. Login as Admin
 */
async function loginAsAdmin() {
  console.log('\n🔐 Step 1: Login as Admin...');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, ADMIN_CREDENTIALS);
    
    if (response.data.success) {
      adminToken = response.data.data.token;
      adminUserId = response.data.data.user._id;
      console.log('✅ Login successful');
      console.log(`   Admin ID: ${adminUserId}`);
      console.log(`   Token: ${adminToken.substring(0, 20)}...`);
      return true;
    } else {
      console.log('❌ Login failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Login error:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * 2. Test: Admin tries to change their own status
 */
async function testChangeOwnStatus() {
  console.log('\n🧪 Test 2: Admin tries to change their own status...');
  try {
    const response = await axios.patch(
      `${API_URL}/admin/users/${adminUserId}/status`,
      { status: 'suspended' },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    console.log('❌ TEST FAILED: Admin was able to change their own status!');
    console.log('   Response:', response.data);
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ TEST PASSED: Admin cannot change their own status');
      console.log('   Message:', error.response.data.message);
      return true;
    } else {
      console.log('⚠️  Unexpected error:', error.response?.data?.message || error.message);
      return false;
    }
  }
}

/**
 * 3. Test: Admin tries to update their own role
 */
async function testChangeOwnRole() {
  console.log('\n🧪 Test 3: Admin tries to change their own role...');
  try {
    const response = await axios.put(
      `${API_URL}/admin/users/${adminUserId}`,
      { role: 'Customer' },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    console.log('❌ TEST FAILED: Admin was able to change their own role!');
    console.log('   Response:', response.data);
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ TEST PASSED: Admin cannot change their own role');
      console.log('   Message:', error.response.data.message);
      return true;
    } else {
      console.log('⚠️  Unexpected error:', error.response?.data?.message || error.message);
      return false;
    }
  }
}

/**
 * 4. Test: Admin tries to delete their own account
 */
async function testDeleteOwnAccount() {
  console.log('\n🧪 Test 4: Admin tries to delete their own account...');
  try {
    const response = await axios.delete(
      `${API_URL}/admin/users/${adminUserId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    console.log('❌ TEST FAILED: Admin was able to delete their own account!');
    console.log('   Response:', response.data);
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ TEST PASSED: Admin cannot delete their own account');
      console.log('   Message:', error.response.data.message);
      return true;
    } else {
      console.log('⚠️  Unexpected error:', error.response?.data?.message || error.message);
      return false;
    }
  }
}

/**
 * 5. Test: Admin tries to update their own status via update endpoint
 */
async function testUpdateOwnStatus() {
  console.log('\n🧪 Test 5: Admin tries to update their own status via update endpoint...');
  try {
    const response = await axios.put(
      `${API_URL}/admin/users/${adminUserId}`,
      { status: 'inactive' },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    console.log('❌ TEST FAILED: Admin was able to update their own status!');
    console.log('   Response:', response.data);
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ TEST PASSED: Admin cannot update their own status via update endpoint');
      console.log('   Message:', error.response.data.message);
      return true;
    } else {
      console.log('⚠️  Unexpected error:', error.response?.data?.message || error.message);
      return false;
    }
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Test Admin Self-Restriction Feature                      ║');
  console.log('║  Kiểm tra Admin không thể thao tác trên tài khoản bản thân ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Step 1: Login
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without login. Exiting...');
    return;
  }

  // Run tests
  const results = {
    changeStatus: await testChangeOwnStatus(),
    changeRole: await testChangeOwnRole(),
    deleteAccount: await testDeleteOwnAccount(),
    updateStatus: await testUpdateOwnStatus()
  };

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  TEST SUMMARY                                              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`Change Status (Direct):    ${results.changeStatus ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Change Role:               ${results.changeRole ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Delete Account:            ${results.deleteAccount ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Update Status (via PUT):   ${results.updateStatus ? '✅ PASS' : '❌ FAIL'}`);

  const totalPassed = Object.values(results).filter(r => r).length;
  const totalTests = Object.keys(results).length;
  
  console.log('\n' + '='.repeat(60));
  console.log(`TOTAL: ${totalPassed}/${totalTests} tests passed`);
  console.log('='.repeat(60));

  if (totalPassed === totalTests) {
    console.log('\n🎉 All tests passed! Admin self-restriction is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.');
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
