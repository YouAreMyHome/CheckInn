/**
 * Test Partner Applications API
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`)
};

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@checkinn.com',
  password: 'AdminPass123!'
};

let adminToken = null;
let testPartnerId = null;

async function loginAsAdmin() {
  try {
    log.info('Logging in as Admin...');
    const response = await axios.post(`${API_URL}/auth/login`, ADMIN_CREDENTIALS);
    
    if (response.data.success && response.data.data.token) {
      adminToken = response.data.data.token;
      log.success('Admin login successful');
      return true;
    }
    
    log.error('Admin login failed: Invalid response');
    return false;
  } catch (error) {
    log.error(`Admin login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function getAllApplications() {
  try {
    log.info('Testing GET /api/partner/applications...');
    const response = await axios.get(`${API_URL}/partner/applications`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const { partners, stats } = response.data.data;
    log.success(`Retrieved ${partners.length} partner applications`);
    log.info(`Stats: ${stats.pending} pending, ${stats.verified} verified, ${stats.rejected} rejected`);
    
    if (partners.length > 0) {
      testPartnerId = partners[0]._id;
      log.info(`Test partner ID: ${testPartnerId}`);
      log.info(`Test partner: ${partners[0].name} (${partners[0].email})`);
      log.info(`Status: ${partners[0].partnerInfo?.verificationStatus || 'N/A'}`);
    } else {
      log.warn('No partners found in database');
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to get applications: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testFilters() {
  try {
    log.info('Testing filters...');
    
    // Test pending filter
    const pendingResponse = await axios.get(`${API_URL}/partner/applications?verificationStatus=pending`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    log.success(`Found ${pendingResponse.data.data.partners.length} pending applications`);
    
    // Test search
    const searchResponse = await axios.get(`${API_URL}/partner/applications?search=test`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    log.success(`Search returned ${searchResponse.data.data.partners.length} results`);
    
    return true;
  } catch (error) {
    log.error(`Filter test failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function approveApplication() {
  if (!testPartnerId) {
    log.warn('Skipping approve test - no partner ID');
    return false;
  }
  
  try {
    log.info(`Testing PATCH /api/partner/applications/${testPartnerId}/approve...`);
    const response = await axios.patch(
      `${API_URL}/partner/applications/${testPartnerId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (response.data.success) {
      log.success('Partner approved successfully');
      log.info(`Status: ${response.data.data.partner.partnerInfo.verificationStatus}`);
      return true;
    }
    
    log.error('Approval failed');
    return false;
  } catch (error) {
    log.error(`Approval failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function rejectApplication() {
  if (!testPartnerId) {
    log.warn('Skipping reject test - no partner ID');
    return false;
  }
  
  try {
    log.info(`Testing PATCH /api/partner/applications/${testPartnerId}/reject...`);
    const response = await axios.patch(
      `${API_URL}/partner/applications/${testPartnerId}/reject`,
      { rejectionReason: 'Test rejection - incomplete documents' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (response.data.success) {
      log.success('Partner rejected successfully');
      log.info(`Status: ${response.data.data.partner.partnerInfo.verificationStatus}`);
      log.info(`Reason: ${response.data.data.partner.partnerInfo.rejectionReason}`);
      return true;
    }
    
    log.error('Rejection failed');
    return false;
  } catch (error) {
    log.error(`Rejection failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('============================================================');
  console.log('🧪 Testing Partner Applications API');
  console.log('============================================================\n');
  
  const results = {
    passed: 0,
    failed: 0
  };
  
  // Login
  if (await loginAsAdmin()) {
    results.passed++;
  } else {
    results.failed++;
    log.error('Cannot proceed without admin access');
    printResults(results);
    return;
  }
  
  // Get all applications
  if (await getAllApplications()) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test filters
  if (await testFilters()) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Note: Skip approve/reject to keep data clean
  log.info('\nℹ️  Skipping approve/reject tests to preserve data');
  log.info('   Use frontend UI at /admin/partner-verifications to test workflows');
  
  printResults(results);
}

function printResults(results) {
  console.log('\n============================================================');
  console.log('📊 Test Results Summary');
  console.log('============================================================');
  console.log(`${colors.green}✓ Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}✗ Failed: ${results.failed}${colors.reset}`);
  console.log('============================================================\n');
}

runTests();
