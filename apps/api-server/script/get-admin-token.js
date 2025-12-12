/**
 * Get Admin Token Helper
 * 
 * Login as admin and get JWT token for testing
 * 
 * Usage: node script/get-admin-token.js
 */

require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Admin credentials - update if needed
const ADMIN_EMAIL = 'admin@checkinn.com';
const ADMIN_PASSWORD = 'AdminPass123!'; // From create-admin-user.js script

async function getAdminToken() {
  try {
    console.log('🔐 Logging in as admin...');
    console.log(`   Email: ${ADMIN_EMAIL}\n`);

    const response = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (response.data.success && response.data.data.token) {
      const token = response.data.data.token;
      const user = response.data.data.user;

      console.log('✅ Login successful!\n');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('USER INFO:');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log(`Name:   ${user.name}`);
      console.log(`Email:  ${user.email}`);
      console.log(`Role:   ${user.role}`);
      console.log(`Status: ${user.status}`);
      console.log('═══════════════════════════════════════════════════════════════\n');

      console.log('═══════════════════════════════════════════════════════════════');
      console.log('JWT TOKEN:');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log(token);
      console.log('═══════════════════════════════════════════════════════════════\n');

      console.log('📋 COPY & PASTE INTO TEST SCRIPT:\n');
      console.log(`const TOKEN = '${token}';\n`);

      console.log('🧪 TEST API REQUEST:\n');
      console.log('curl -X GET \\');
      console.log(`  ${API_URL}/partner/applications \\`);
      console.log(`  -H "Authorization: Bearer ${token}"\n`);

      return token;
    } else {
      console.error('❌ Login failed: Invalid response');
      console.log('Response:', response.data);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Login failed!\n');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data?.message);
      
      if (error.response.status === 401) {
        console.error('\n💡 TIP: Check admin password. Default is "admin123"');
        console.error('   If password is different, update ADMIN_PASSWORD in this script.');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to API server!');
      console.error(`   URL: ${API_URL}`);
      console.error('\n💡 TIP: Make sure API server is running:');
      console.error('   cd apps/api-server');
      console.error('   npm run dev');
    } else {
      console.error('Error:', error.message);
    }
    
    process.exit(1);
  }
}

// Run
getAdminToken();
