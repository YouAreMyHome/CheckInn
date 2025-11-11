/**
 * Test Hotel Management API
 * 
 * Test các endpoints:
 * - GET /api/hotels - Get all hotels
 * - PATCH /api/hotels/:id - Update hotel (status, verification, featured)
 * - Admin operations
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Colors for console output
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

// Test credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@checkinn.com',
  password: 'AdminPass123!'
};

let adminToken = null;
let testHotelId = null;

/**
 * Login as admin
 */
async function loginAsAdmin() {
  try {
    log.info('Logging in as Admin...');
    const response = await axios.post(`${API_URL}/auth/login`, ADMIN_CREDENTIALS);
    
    if (response.data.success) {
      adminToken = response.data.data.token;
      log.success('Admin login successful');
      return true;
    }
  } catch (error) {
    log.error(`Admin login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 1: Get all hotels
 */
async function testGetAllHotels() {
  try {
    log.info('Testing GET /api/hotels...');
    const response = await axios.get(`${API_URL}/hotels`);
    
    if (response.data.success) {
      const hotels = response.data.data.hotels || response.data.data;
      log.success(`Retrieved ${hotels.length} hotels`);
      
      if (hotels.length > 0) {
        testHotelId = hotels[0]._id;
        log.info(`Using hotel ID: ${testHotelId}`);
        log.info(`Hotel: ${hotels[0].name} (${hotels[0].status})`);
      }
      
      return true;
    }
  } catch (error) {
    log.error(`Get hotels failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 2: Get hotels with filters
 */
async function testGetHotelsWithFilters() {
  try {
    log.info('Testing GET /api/hotels with filters...');
    
    // Test pending hotels
    const pendingResponse = await axios.get(`${API_URL}/hotels?status=pending`);
    const pendingHotels = pendingResponse.data.data.hotels || pendingResponse.data.data;
    log.success(`Found ${pendingHotels.length} pending hotels`);
    
    // Test verified hotels
    const verifiedResponse = await axios.get(`${API_URL}/hotels?isVerified=true`);
    const verifiedHotels = verifiedResponse.data.data.hotels || verifiedResponse.data.data;
    log.success(`Found ${verifiedHotels.length} verified hotels`);
    
    return true;
  } catch (error) {
    log.error(`Filter test failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 3: Update hotel status (Admin only)
 */
async function testUpdateHotelStatus() {
  if (!testHotelId || !adminToken) {
    log.warn('Skipping status update test - no hotel ID or admin token');
    return false;
  }

  try {
    log.info(`Testing PATCH /api/hotels/${testHotelId} - Update status...`);
    
    const response = await axios.patch(
      `${API_URL}/hotels/${testHotelId}`,
      { status: 'active' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (response.data.success) {
      log.success(`Hotel status updated to: ${response.data.data.hotel.status}`);
      return true;
    }
  } catch (error) {
    log.error(`Update status failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 4: Toggle hotel verification (Admin only)
 */
async function testToggleVerification() {
  if (!testHotelId || !adminToken) {
    log.warn('Skipping verification test - no hotel ID or admin token');
    return false;
  }

  try {
    log.info(`Testing PATCH /api/hotels/${testHotelId} - Toggle verification...`);
    
    const response = await axios.patch(
      `${API_URL}/hotels/${testHotelId}`,
      { isVerified: true },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (response.data.success) {
      log.success(`Hotel verification status: ${response.data.data.hotel.isVerified}`);
      return true;
    }
  } catch (error) {
    log.error(`Toggle verification failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 5: Toggle featured status (Admin only)
 */
async function testToggleFeatured() {
  if (!testHotelId || !adminToken) {
    log.warn('Skipping featured test - no hotel ID or admin token');
    return false;
  }

  try {
    log.info(`Testing PATCH /api/hotels/${testHotelId} - Toggle featured...`);
    
    const response = await axios.patch(
      `${API_URL}/hotels/${testHotelId}`,
      { isFeatured: true },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (response.data.success) {
      log.success(`Hotel featured status: ${response.data.data.hotel.isFeatured}`);
      return true;
    }
  } catch (error) {
    log.error(`Toggle featured failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 6: Reject hotel with reason (Admin only)
 */
async function testRejectHotel() {
  if (!testHotelId || !adminToken) {
    log.warn('Skipping rejection test - no hotel ID or admin token');
    return false;
  }

  try {
    log.info(`Testing PATCH /api/hotels/${testHotelId} - Reject with reason...`);
    
    const response = await axios.patch(
      `${API_URL}/hotels/${testHotelId}`,
      { 
        status: 'rejected',
        rejectionReason: 'Incomplete business documentation. Please provide valid business license and tax registration.'
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (response.data.success) {
      log.success('Hotel rejected successfully');
      log.info(`Reason: ${response.data.data.hotel.rejectionReason}`);
      return true;
    }
  } catch (error) {
    log.error(`Rejection failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 7: Approve hotel (Admin only)
 */
async function testApproveHotel() {
  if (!testHotelId || !adminToken) {
    log.warn('Skipping approval test - no hotel ID or admin token');
    return false;
  }

  try {
    log.info(`Testing PATCH /api/hotels/${testHotelId} - Approve hotel...`);
    
    const response = await axios.patch(
      `${API_URL}/hotels/${testHotelId}`,
      { 
        status: 'active',
        isVerified: true
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (response.data.success) {
      log.success('Hotel approved and verified successfully');
      log.info(`Status: ${response.data.data.hotel.status}, Verified: ${response.data.data.hotel.isVerified}`);
      return true;
    }
  } catch (error) {
    log.error(`Approval failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Testing Hotel Management API');
  console.log('='.repeat(60) + '\n');

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0
  };

  // Test 1: Get all hotels (public)
  if (await testGetAllHotels()) results.passed++;
  else results.failed++;

  // Test 2: Get hotels with filters (public)
  if (await testGetHotelsWithFilters()) results.passed++;
  else results.failed++;

  // Login as admin
  if (!await loginAsAdmin()) {
    log.error('Cannot proceed with admin tests - login failed');
    results.skipped += 5;
  } else {
    // Test 3-7: Admin operations
    if (await testUpdateHotelStatus()) results.passed++;
    else results.failed++;

    if (await testToggleVerification()) results.passed++;
    else results.failed++;

    if (await testToggleFeatured()) results.passed++;
    else results.failed++;

    if (await testRejectHotel()) results.passed++;
    else results.failed++;

    if (await testApproveHotel()) results.passed++;
    else results.failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(60));
  console.log(`${colors.green}✓ Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}✗ Failed: ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}⊘ Skipped: ${results.skipped}${colors.reset}`);
  console.log('='.repeat(60) + '\n');
}

// Run tests
runAllTests().catch(console.error);
