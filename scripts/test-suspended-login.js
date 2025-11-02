/**
 * Test Suspended User Login Prevention
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test credentials
const testCredentials = {
  email: 'admin@checkinn.com',
  password: 'AdminPass123!'
};

async function testSuspendedUserLogin() {
  try {
    console.log('🧪 Testing Suspended User Login Prevention\n');

    // 1. First login as admin
    console.log('1️⃣ Login as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, testCredentials);
    
    if (!loginResponse.data.success) {
      throw new Error('Admin login failed');
    }
    
    const adminToken = loginResponse.data.data.token;
    const adminUserId = loginResponse.data.data.user.id;
    console.log('✅ Admin login successful');
    console.log('📋 Admin ID:', adminUserId);

    // 2. Create test user
    console.log('\n2️⃣ Creating test user...');
    const testUserData = {
      fullName: 'Test User',
      email: 'testuser@example.com',
      phone: '0987654321',
      role: 'Customer',
      status: 'active'
    };

    let testUserId;
    try {
      const createResponse = await axios.post(`${API_BASE}/admin/users`, testUserData, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      testUserId = createResponse.data.data.user._id;
      console.log('✅ Test user created:', testUserId);
    } catch (error) {
      // User might already exist
      console.log('ℹ️ User may already exist, fetching existing user...');
      const usersResponse = await axios.get(`${API_BASE}/admin/users?search=testuser@example.com`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (usersResponse.data.data.users.length > 0) {
        testUserId = usersResponse.data.data.users[0]._id;
        console.log('✅ Found existing test user:', testUserId);
      }
    }

    if (!testUserId) {
      throw new Error('Could not get test user ID');
    }

    // 3. Set a password for test user (if needed)
    console.log('\n3️⃣ Setting password for test user...');
    try {
      await axios.put(`${API_BASE}/admin/users/${testUserId}`, {
        password: 'TestPass123!'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Password set for test user');
    } catch (error) {
      console.log('ℹ️ Password update may have failed, continuing...');
    }

    // 4. Test login with active status
    console.log('\n4️⃣ Testing login with active status...');
    try {
      const activeLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'testuser@example.com',
        password: 'TestPass123!'
      });
      
      if (activeLoginResponse.data.success) {
        console.log('✅ Active user can login successfully');
        var testUserToken = activeLoginResponse.data.data.token;
      }
    } catch (error) {
      console.log('⚠️ Active login test failed:', error.response?.data?.message);
    }

    // 5. Suspend the user
    console.log('\n5️⃣ Suspending test user...');
    const suspendResponse = await axios.patch(
      `${API_BASE}/admin/users/${testUserId}/status`,
      { status: 'suspended' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (suspendResponse.data.success) {
      console.log('✅ User suspended successfully');
    }

    // 6. Test login attempt with suspended status
    console.log('\n6️⃣ Testing login with suspended status...');
    try {
      const suspendedLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'testuser@example.com',
        password: 'TestPass123!'
      });
      
      // If this succeeds, it's a bug!
      if (suspendedLoginResponse.data.success) {
        console.log('❌ BUG: Suspended user can still login!');
        console.log('🔧 This should be blocked by authentication');
      }
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ CORRECT: Suspended user login blocked');
        console.log('📋 Error message:', error.response.data.message);
      } else {
        console.log('⚠️ Unexpected error:', error.response?.data?.message);
      }
    }

    // 7. Test API access with old token (if we have one)
    if (testUserToken) {
      console.log('\n7️⃣ Testing API access with old token...');
      try {
        const profileResponse = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${testUserToken}` }
        });
        
        if (profileResponse.data.success) {
          console.log('❌ BUG: Suspended user can still use old token!');
        }
      } catch (error) {
        if (error.response?.status === 403) {
          console.log('✅ CORRECT: Old token blocked for suspended user');
          console.log('📋 Error message:', error.response.data.message);
        } else {
          console.log('⚠️ Unexpected error:', error.response?.data?.message);
        }
      }
    }

    // 8. Reactivate user
    console.log('\n8️⃣ Reactivating user...');
    await axios.patch(
      `${API_BASE}/admin/users/${testUserId}/status`,
      { status: 'active' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('✅ User reactivated');

    // 9. Test login after reactivation
    console.log('\n9️⃣ Testing login after reactivation...');
    try {
      const reactivatedLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'testuser@example.com',
        password: 'TestPass123!'
      });
      
      if (reactivatedLoginResponse.data.success) {
        console.log('✅ CORRECT: Reactivated user can login');
      }
    } catch (error) {
      console.log('⚠️ Reactivation login failed:', error.response?.data?.message);
    }

    console.log('\n🎯 Test completed!');

  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testSuspendedUserLogin();