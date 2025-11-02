/**
 * Simple Test Suspended User Login Prevention
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testSimpleSuspendedLogin() {
  try {
    console.log('🧪 Simple Test: Suspended User Login Prevention\n');

    // 1. Login as admin first
    console.log('1️⃣ Login as admin...');
    const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@checkinn.com',
      password: 'AdminPass123!'
    });
    
    const adminToken = adminLogin.data.data.token;
    console.log('✅ Admin login successful');

    // 2. Get admin user ID from the users list
    console.log('\n2️⃣ Getting admin user info...');
    const usersResponse = await axios.get(`${API_BASE}/admin/users?search=admin@checkinn.com`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (usersResponse.data.data.users.length === 0) {
      throw new Error('Admin user not found');
    }
    
    const adminUser = usersResponse.data.data.users[0];
    console.log('✅ Admin user found:', {
      id: adminUser._id,
      email: adminUser.email,
      status: adminUser.status
    });

    // 3. Suspend admin user (be careful!)
    console.log('\n3️⃣ Suspending admin user...');
    const suspendResponse = await axios.patch(
      `${API_BASE}/admin/users/${adminUser._id}/status`,
      { status: 'suspended' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('✅ Admin user suspended');

    // 4. Try to login again
    console.log('\n4️⃣ Testing login with suspended status...');
    try {
      const suspendedLogin = await axios.post(`${API_BASE}/auth/login`, {
        email: 'admin@checkinn.com',
        password: 'AdminPass123!'
      });
      
      if (suspendedLogin.data.success) {
        console.log('❌ BUG FOUND: Suspended user can still login!');
        console.log('🚨 This is a security vulnerability!');
      }
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ CORRECT: Suspended user login blocked');
        console.log('📋 Error:', error.response.data.message);
      } else {
        console.log('⚠️ Unexpected error:', error.response?.status, error.response?.data?.message);
      }
    }

    // 5. Try to use existing token
    console.log('\n5️⃣ Testing existing token after suspension...');
    try {
      const profileResponse = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (profileResponse.data.success) {
        console.log('❌ BUG FOUND: Suspended user can still use existing token!');
        console.log('🚨 Tokens should be invalidated when user is suspended!');
      }
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ CORRECT: Existing token blocked after suspension');
        console.log('📋 Error:', error.response.data.message);
      } else {
        console.log('⚠️ Unexpected error:', error.response?.status, error.response?.data?.message);
      }
    }

    // 6. IMPORTANT: Reactivate admin user so we can continue
    console.log('\n6️⃣ Reactivating admin user...');
    try {
      // We need to use a different approach since our token might be invalid
      // We'll try with the same token first, if it fails we have a problem
      await axios.patch(
        `${API_BASE}/admin/users/${adminUser._id}/status`,
        { status: 'active' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      console.log('✅ Admin user reactivated');
    } catch (error) {
      console.log('❌ PROBLEM: Cannot reactivate admin user!');
      console.log('💡 You may need to manually update the database:');
      console.log(`   db.users.updateOne({email:"admin@checkinn.com"}, {$set:{status:"active"}})`);
      return;
    }

    console.log('\n🎯 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run test
testSimpleSuspendedLogin();