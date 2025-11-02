/**
 * Test User Status Update API
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const TEST_USER_ID = '507f1f77bcf86cd799439011'; // MongoDB ObjectId format

// Test admin credentials
const adminCredentials = {
  email: 'admin@checkinn.com',
  password: 'AdminPass123!'
};

async function testUserStatusUpdate() {
  try {
    console.log('🧪 Testing User Status Update API\n');

    // 1. Login as admin to get token
    console.log('1️⃣ Admin login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, adminCredentials);
    
    if (!loginResponse.data.success) {
      throw new Error('Admin login failed');
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Admin login successful\n');

    // 2. Get users list to see current structure
    console.log('2️⃣ Fetching users list...');
    const usersResponse = await axios.get(`${API_BASE}/admin/users?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (usersResponse.data.success && usersResponse.data.data.users.length > 0) {
      console.log('✅ Users fetched successfully');
      const firstUser = usersResponse.data.data.users[0];
      console.log('📋 Sample user structure:', {
        id: firstUser._id,
        name: firstUser.name || firstUser.fullName,
        email: firstUser.email,
        status: firstUser.status,
        active: firstUser.active
      });

      // 3. Test status update with real user ID
      console.log('\n3️⃣ Testing status update...');
      const statusUpdateResponse = await axios.patch(
        `${API_BASE}/admin/users/${firstUser._id}/status`,
        { status: firstUser.status === 'active' ? 'suspended' : 'active' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (statusUpdateResponse.data.success) {
        console.log('✅ Status update successful');
        console.log('📄 Response:', statusUpdateResponse.data);
      } else {
        console.log('❌ Status update failed:', statusUpdateResponse.data.message);
      }
    } else {
      console.log('⚠️  No users found, testing with dummy ID...');
      
      // Test with dummy ID to see error response
      try {
        await axios.patch(
          `${API_BASE}/admin/users/${TEST_USER_ID}/status`,
          { status: 'suspended' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.log('❌ Expected error for dummy ID:', error.response?.data);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('URL:', error.config?.url);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testUserStatusUpdate();