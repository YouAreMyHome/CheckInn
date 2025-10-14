/**
 * Create Admin Test User Script
 * 
 * Script để tạo admin user cho testing admin authentication system
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Admin user data
const adminUser = {
  name: 'Admin User',
  email: 'admin@checkinn.com',
  phone: '0987654321',
  password: 'AdminPass123!',
  role: 'Admin'
};

/**
 * Create admin user
 */
async function createAdminUser() {
  console.log('🔐 Creating Admin Test User');
  console.log('===========================\n');

  try {
    // Try to create admin user (this will also test server connection)
    console.log('1️⃣ Creating admin user...');
    const response = await axios.post(`${API_BASE}/auth/register`, adminUser);

    if (response.data.success) {
      console.log('✅ Admin user created successfully!');
      console.log(`   Name: ${adminUser.name}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Password: ${adminUser.password}\n`);
      
      console.log('🎯 You can now login at: http://localhost:5173/admin/login');
      console.log('   Use the credentials above to access admin panel\n');
    } else {
      console.log('❌ Failed to create admin user');
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}\n`);
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Cannot connect to server');
      console.log('   Please make sure the API server is running on port 5000');
      console.log('   Command: cd apps/api-server && npm run start\n');
      return; // Exit if server not running
    } else if (error.response?.status === 400) {
      const message = error.response?.data?.message || '';
      if (message.includes('duplicate') || message.includes('already exists') || message.includes('E11000')) {
        console.log('ℹ️  Admin user already exists!');
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Password: ${adminUser.password}`);
        console.log('   You can login with these credentials\n');
        
        // Try to update role if user exists but not admin
        await updateUserRole();
      } else {
        console.log('❌ Registration failed:');
        console.log(`   ${message}\n`);
      }
    } else if (error.response?.status === 404) {
      console.log('❌ Registration endpoint not found');
      console.log('   Please check if the API server is running properly');
      console.log('   Expected endpoint: POST /api/auth/register\n');
    } else {
      console.log('❌ Error creating admin user:');
      console.log(`   ${error.response?.data?.message || error.message}\n`);
    }
  }
}

/**
 * Update existing user role to Admin
 */
async function updateUserRole() {
  try {
    console.log('3️⃣ Checking if user needs role update...');
    
    // First, try to login to get user info
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: adminUser.email,
      password: adminUser.password
    });

    if (loginResponse.data.success) {
      const user = loginResponse.data.data.user;
      
      if (user.role !== 'Admin') {
        console.log(`   Current role: ${user.role}`);
        console.log('   ⚠️  User exists but role is not Admin');
        console.log('   Manual action required: Update user role in database to "Admin"');
        console.log('   MongoDB command:');
        console.log(`   db.users.updateOne({email:"${adminUser.email}"}, {$set:{role:"Admin"}})\n`);
      } else {
        console.log('✅ User already has Admin role!');
        console.log('   Ready for admin login\n');
      }
    }
  } catch (error) {
    console.log('   Could not verify user role');
    console.log('   If login fails, check password or create user manually\n');
  }
}

/**
 * Test admin login
 */
async function testAdminLogin() {
  console.log('4️⃣ Testing admin login...');
  
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: adminUser.email,
      password: adminUser.password
    });

    if (response.data.success) {
      const user = response.data.data.user;
      
      if (user.role === 'Admin') {
        console.log('✅ Admin login test successful!');
        console.log(`   Welcome: ${user.name}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Email: ${user.email}\n`);
      } else {
        console.log('❌ Login successful but user is not Admin');
        console.log(`   Current role: ${user.role}`);
        console.log('   Please update role to Admin in database\n');
      }
    } else {
      console.log('❌ Login failed');
      console.log(`   ${response.data.message}\n`);
    }
  } catch (error) {
    console.log('❌ Login test failed:');
    console.log(`   ${error.response?.data?.message || error.message}\n`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('CheckInn Admin User Setup');
  console.log('=========================');
  console.log('Creating admin user for testing authentication system\n');

  await createAdminUser();
  await testAdminLogin();

  console.log('Setup Complete!');
  console.log('===============');
  console.log('Admin authentication system is ready for testing');
  console.log('Visit: http://localhost:5173/admin/login\n');
}

// Run the script
main().catch(console.error);