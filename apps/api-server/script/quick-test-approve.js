/**
 * Quick API Test - Approve Partner
 */

require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZWUwYzE4Nzg2YTc2N2RiN2UyNjNlNyIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjI4ODAxMDUsImV4cCI6MTc2Mjk2NjUwNSwiYXVkIjoiQ2hlY2tJbm4tVXNlcnMiLCJpc3MiOiJDaGVja0lubiJ9.4QJFeiWcwpOXeuKtpT9ydCBr9X5rBE6JuaoIQsX8KDQ';
const PARTNER_ID = '68d17a19ebaf8c19ef236615';

async function test() {
  try {
    console.log('Testing API: PATCH /api/partner/applications/:id/approve');
    console.log(`Partner ID: ${PARTNER_ID}\n`);

    const response = await axios.patch(
      `${API_URL}/partner/applications/${PARTNER_ID}/approve`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ ERROR!');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message);
    console.log('Full response:', JSON.stringify(error.response?.data, null, 2));
  }
}

test();
