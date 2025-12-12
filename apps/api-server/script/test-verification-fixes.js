/**
 * Manual Test Script - Partner Verification Bug Fixes (Phase 1)
 * 
 * Tests for Bug #1 and Bug #2 fixes
 * 
 * Usage: 
 * 1. Start API server: npm run dev
 * 2. Login as Admin to get token
 * 3. Update TOKEN and PARTNER_ID below
 * 4. Run: node script/test-verification-fixes.js
 */

require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZWUwYzE4Nzg2YTc2N2RiN2UyNjNlNyIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjI4ODAxMDUsImV4cCI6MTc2Mjk2NjUwNSwiYXVkIjoiQ2hlY2tJbm4tVXNlcnMiLCJpc3MiOiJDaGVja0lubiJ9.4QJFeiWcwpOXeuKtpT9ydCBr9X5rBE6JuaoIQsX8KDQ'; // Auto-generated token
const PARTNER_ID = '68d17a19ebaf8c19ef236615'; // Partner: Hotel Manager Test (pending)

// Test configuration
const config = {
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(80));
  log('cyan', `  ${title}`);
  console.log('='.repeat(80) + '\n');
}

async function testApproveVerifiedPartner() {
  section('TEST 1: Approve Already Verified Partner');
  
  try {
    log('blue', '→ Attempting to approve verified partner...');
    const response = await axios.patch(
      `${API_URL}/partner/applications/${PARTNER_ID}/approve`,
      {},
      config
    );
    
    log('red', '✗ FAILED: Should return error 400');
    console.log('Response:', response.data);
    return false;
  } catch (error) {
    if (error.response?.status === 400 && 
        error.response?.data?.message?.includes('already verified')) {
      log('green', '✓ PASSED: Correctly rejected with error 400');
      log('yellow', `  Message: ${error.response.data.message}`);
      return true;
    } else {
      log('red', `✗ FAILED: Unexpected error: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }
}

async function testApproveRejectedPartner() {
  section('TEST 2: Approve Rejected Partner');
  
  try {
    log('blue', '→ Attempting to approve rejected partner...');
    const response = await axios.patch(
      `${API_URL}/partner/applications/${PARTNER_ID}/approve`,
      {},
      config
    );
    
    log('red', '✗ FAILED: Should return error 400');
    console.log('Response:', response.data);
    return false;
  } catch (error) {
    if (error.response?.status === 400 && 
        error.response?.data?.message?.includes('rejected')) {
      log('green', '✓ PASSED: Correctly rejected with error 400');
      log('yellow', `  Message: ${error.response.data.message}`);
      return true;
    } else {
      log('red', `✗ FAILED: Unexpected error: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }
}

async function testApproveSuspendedPartner() {
  section('TEST 3: Approve Suspended Partner');
  
  try {
    log('blue', '→ Attempting to approve suspended partner...');
    const response = await axios.patch(
      `${API_URL}/partner/applications/${PARTNER_ID}/approve`,
      {},
      config
    );
    
    log('red', '✗ FAILED: Should return error 400');
    console.log('Response:', response.data);
    return false;
  } catch (error) {
    if (error.response?.status === 400 && 
        error.response?.data?.message?.includes('suspended')) {
      log('green', '✓ PASSED: Correctly rejected with error 400');
      log('yellow', `  Message: ${error.response.data.message}`);
      return true;
    } else {
      log('red', `✗ FAILED: Unexpected error: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }
}

async function testApprovePendingPartner() {
  section('TEST 4: Approve Pending Partner (Should Work)');
  
  try {
    log('blue', '→ Attempting to approve pending partner...');
    const response = await axios.patch(
      `${API_URL}/partner/applications/${PARTNER_ID}/approve`,
      {},
      config
    );
    
    if (response.data.success) {
      log('green', '✓ PASSED: Successfully approved pending partner');
      log('yellow', `  Status: ${response.data.data.partner.partnerInfo.verificationStatus}`);
      return true;
    } else {
      log('red', '✗ FAILED: Unexpected response');
      console.log('Response:', response.data);
      return false;
    }
  } catch (error) {
    log('red', `✗ FAILED: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testRejectVerifiedPartner() {
  section('TEST 5: Reject Verified Partner');
  
  try {
    log('blue', '→ Attempting to reject verified partner...');
    const response = await axios.patch(
      `${API_URL}/partner/applications/${PARTNER_ID}/reject`,
      { rejectionReason: 'Test rejection reason' },
      config
    );
    
    log('red', '✗ FAILED: Should return error 400');
    console.log('Response:', response.data);
    return false;
  } catch (error) {
    if (error.response?.status === 400 && 
        error.response?.data?.message?.includes('verified')) {
      log('green', '✓ PASSED: Correctly rejected with error 400');
      log('yellow', `  Message: ${error.response.data.message}`);
      return true;
    } else {
      log('red', `✗ FAILED: Unexpected error: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }
}

async function testRejectRejectedPartner() {
  section('TEST 6: Reject Already Rejected Partner');
  
  try {
    log('blue', '→ Attempting to reject already rejected partner...');
    const response = await axios.patch(
      `${API_URL}/partner/applications/${PARTNER_ID}/reject`,
      { rejectionReason: 'Test rejection reason' },
      config
    );
    
    log('red', '✗ FAILED: Should return error 400');
    console.log('Response:', response.data);
    return false;
  } catch (error) {
    if (error.response?.status === 400 && 
        error.response?.data?.message?.includes('already rejected')) {
      log('green', '✓ PASSED: Correctly rejected with error 400');
      log('yellow', `  Message: ${error.response.data.message}`);
      return true;
    } else {
      log('red', `✗ FAILED: Unexpected error: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }
}

async function testRejectPendingPartner() {
  section('TEST 7: Reject Pending Partner (Should Work)');
  
  try {
    log('blue', '→ Attempting to reject pending partner...');
    const response = await axios.patch(
      `${API_URL}/partner/applications/${PARTNER_ID}/reject`,
      { rejectionReason: 'Invalid business license documentation' },
      config
    );
    
    if (response.data.success) {
      log('green', '✓ PASSED: Successfully rejected pending partner');
      log('yellow', `  Status: ${response.data.data.partner.partnerInfo.verificationStatus}`);
      log('yellow', `  Reason: ${response.data.data.partner.partnerInfo.rejectionReason}`);
      return true;
    } else {
      log('red', '✗ FAILED: Unexpected response');
      console.log('Response:', response.data);
      return false;
    }
  } catch (error) {
    log('red', `✗ FAILED: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.clear();
  log('cyan', '\n' + '█'.repeat(80));
  log('cyan', '  PARTNER VERIFICATION BUG FIXES - PHASE 1 TEST SUITE');
  log('cyan', '█'.repeat(80) + '\n');

  if (TOKEN === 'YOUR_ADMIN_TOKEN_HERE' || PARTNER_ID === 'YOUR_PARTNER_ID_HERE') {
    log('red', '\n✗ ERROR: Please update TOKEN and PARTNER_ID in the script first!\n');
    log('yellow', 'Instructions:');
    log('yellow', '1. Login as Admin and copy the token');
    log('yellow', '2. Find a test partner ID from database');
    log('yellow', '3. Update TOKEN and PARTNER_ID constants in this file');
    log('yellow', '4. Run the script again\n');
    process.exit(1);
  }

  log('yellow', `API URL: ${API_URL}`);
  log('yellow', `Partner ID: ${PARTNER_ID}`);
  log('yellow', `Initial Partner Status: pending\n`);

  const results = [];

  // Test sequence with current pending partner
  log('blue', '\n🧪 Running Phase 1 Validation Tests...\n');
  
  // Test 1: Approve pending partner (should work)
  log('yellow', 'Step 1: Testing approve pending partner (should succeed)...');
  results.push(await testApprovePendingPartner());
  
  // After approval, partner status should be 'verified'
  // Test 2: Try to approve again (should fail - already verified)
  log('yellow', '\nStep 2: Testing approve already verified partner (should fail)...');
  results.push(await testApproveVerifiedPartner());
  
  // Test 3: Try to reject a verified partner (should fail)
  log('yellow', '\nStep 3: Testing reject verified partner (should fail)...');
  results.push(await testRejectVerifiedPartner());

  // Summary
  section('TEST SUMMARY');
  const passed = results.filter(r => r === true).length;
  const failed = results.filter(r => r === false).length;
  const total = results.length;

  log('cyan', `Total Tests: ${total}`);
  log('green', `Passed: ${passed}`);
  log('red', `Failed: ${failed}`);
  
  if (failed === 0 && total > 0) {
    log('green', '\n✓ ALL TESTS PASSED!\n');
  } else if (total === 0) {
    log('yellow', '\n⚠️  No tests were run. Uncomment test calls above.\n');
  } else {
    log('red', `\n✗ ${failed} test(s) failed.\n`);
  }
}

// Run tests
runAllTests().catch(error => {
  log('red', `\n✗ Test suite error: ${error.message}\n`);
  process.exit(1);
});
