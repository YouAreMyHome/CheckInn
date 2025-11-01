/**
 * Test Admin User Management APIs
 * 
 * Test script để kiểm tra tất cả endpoints của admin user management
 * Bao gồm authentication, CRUD operations, và error handling
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const axios = require('axios');

// Cấu hình API base
const API_BASE = 'http://localhost:5000/api';
let authToken = '';

/**
 * Utility functions
 */
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',     // Cyan
    success: '\x1b[32m',  // Green
    error: '\x1b[31m',    // Red
    warning: '\x1b[33m',  // Yellow
    reset: '\x1b[0m'      // Reset
  };
  
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
};

const makeRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data && (method === 'post' || method === 'put' || method === 'patch')) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      data: error.response?.data || error.message, 
      status: error.response?.status || 500 
    };
  }
};

/**
 * Test Authentication
 */
const testAuthentication = async () => {
  log('=== TESTING AUTHENTICATION ===', 'info');
  
  // Test admin login
  log('Testing admin login...', 'info');
  const loginResult = await makeRequest('post', '/auth/login', {
    email: 'admin@checkinn.com', // Thay đổi theo admin user thực tế
    password: 'admin123',         // Thay đổi theo password thực tế
    rememberMe: true
  });

  if (loginResult.success && loginResult.data.data?.token) {
    authToken = loginResult.data.data.token;
    log('✅ Admin login successful', 'success');
    log(`Token: ${authToken.substring(0, 20)}...`, 'info');
    return true;
  } else {
    log(`❌ Admin login failed: ${JSON.stringify(loginResult.data)}`, 'error');
    return false;
  }
};

/**
 * Test User CRUD Operations
 */
const testUserCRUD = async () => {
  log('=== TESTING USER CRUD OPERATIONS ===', 'info');

  // Test Get Users
  log('Testing get users...', 'info');
  const getUsersResult = await makeRequest('get', '/admin/users?page=1&limit=10', null, authToken);
  
  if (getUsersResult.success) {
    log('✅ Get users successful', 'success');
    log(`Total users: ${getUsersResult.data.data?.pagination?.total || 'Unknown'}`, 'info');
  } else {
    log(`❌ Get users failed: ${JSON.stringify(getUsersResult.data)}`, 'error');
  }

  // Test Create User
  log('Testing create user...', 'info');
  const createUserData = {
    fullName: 'Test User Admin',
    email: `test.admin.${Date.now()}@example.com`,
    password: 'TestPass123!@#',
    role: 'Customer',
    phoneNumber: '+1234567890',
    dateOfBirth: '1990-01-15',
    gender: 'Male'
  };

  const createUserResult = await makeRequest('post', '/admin/users', createUserData, authToken);
  let createdUserId = null;

  if (createUserResult.success) {
    createdUserId = createUserResult.data.data?.user?._id;
    log('✅ Create user successful', 'success');
    log(`Created user ID: ${createdUserId}`, 'info');
  } else {
    log(`❌ Create user failed: ${JSON.stringify(createUserResult.data)}`, 'error');
  }

  // Test Get Single User
  if (createdUserId) {
    log('Testing get single user...', 'info');
    const getUserResult = await makeRequest('get', `/admin/users/${createdUserId}`, null, authToken);
    
    if (getUserResult.success) {
      log('✅ Get single user successful', 'success');
    } else {
      log(`❌ Get single user failed: ${JSON.stringify(getUserResult.data)}`, 'error');
    }

    // Test Update User
    log('Testing update user...', 'info');
    const updateUserData = {
      fullName: 'Updated Test User Admin',
      phoneNumber: '+0987654321'
    };

    const updateUserResult = await makeRequest('put', `/admin/users/${createdUserId}`, updateUserData, authToken);
    
    if (updateUserResult.success) {
      log('✅ Update user successful', 'success');
    } else {
      log(`❌ Update user failed: ${JSON.stringify(updateUserResult.data)}`, 'error');
    }

    // Test Update User Status
    log('Testing update user status...', 'info');
    const statusUpdateResult = await makeRequest('patch', `/admin/users/${createdUserId}/status`, { isActive: false }, authToken);
    
    if (statusUpdateResult.success) {
      log('✅ Update user status successful', 'success');
    } else {
      log(`❌ Update user status failed: ${JSON.stringify(statusUpdateResult.data)}`, 'error');
    }

    // Test Delete User
    log('Testing delete user...', 'info');
    const deleteUserResult = await makeRequest('delete', `/admin/users/${createdUserId}`, null, authToken);
    
    if (deleteUserResult.success) {
      log('✅ Delete user successful', 'success');
    } else {
      log(`❌ Delete user failed: ${JSON.stringify(deleteUserResult.data)}`, 'error');
    }
  }
};

/**
 * Test Bulk Operations
 */
const testBulkOperations = async () => {
  log('=== TESTING BULK OPERATIONS ===', 'info');

  // Tạo multiple users để test bulk operations
  const userIds = [];
  
  for (let i = 1; i <= 3; i++) {
    const createUserData = {
      fullName: `Bulk Test User ${i}`,
      email: `bulk.test.${i}.${Date.now()}@example.com`,
      password: 'BulkTest123!@#',
      role: 'Customer'
    };

    const result = await makeRequest('post', '/admin/users', createUserData, authToken);
    if (result.success && result.data.data?.user?._id) {
      userIds.push(result.data.data.user._id);
    }
  }

  if (userIds.length > 0) {
    log(`Created ${userIds.length} users for bulk testing`, 'info');

    // Test Bulk Delete
    log('Testing bulk delete users...', 'info');
    const bulkDeleteResult = await makeRequest('delete', '/admin/users/bulk', { userIds }, authToken);
    
    if (bulkDeleteResult.success) {
      log('✅ Bulk delete users successful', 'success');
    } else {
      log(`❌ Bulk delete users failed: ${JSON.stringify(bulkDeleteResult.data)}`, 'error');
    }
  } else {
    log('⚠️  No users created for bulk testing', 'warning');
  }
};

/**
 * Test Search and Filtering
 */
const testSearchFiltering = async () => {
  log('=== TESTING SEARCH AND FILTERING ===', 'info');

  // Test search
  log('Testing user search...', 'info');
  const searchResult = await makeRequest('get', '/admin/users?search=admin', null, authToken);
  
  if (searchResult.success) {
    log('✅ User search successful', 'success');
  } else {
    log(`❌ User search failed: ${JSON.stringify(searchResult.data)}`, 'error');
  }

  // Test filter by role
  log('Testing filter by role...', 'info');
  const roleFilterResult = await makeRequest('get', '/admin/users?role=Admin', null, authToken);
  
  if (roleFilterResult.success) {
    log('✅ Role filter successful', 'success');
  } else {
    log(`❌ Role filter failed: ${JSON.stringify(roleFilterResult.data)}`, 'error');
  }

  // Test filter by status
  log('Testing filter by status...', 'info');
  const statusFilterResult = await makeRequest('get', '/admin/users?isActive=true', null, authToken);
  
  if (statusFilterResult.success) {
    log('✅ Status filter successful', 'success');
  } else {
    log(`❌ Status filter failed: ${JSON.stringify(statusFilterResult.data)}`, 'error');
  }
};

/**
 * Test Error Handling
 */
const testErrorHandling = async () => {
  log('=== TESTING ERROR HANDLING ===', 'info');

  // Test invalid user ID
  log('Testing invalid user ID...', 'info');
  const invalidIdResult = await makeRequest('get', '/admin/users/invalid-id', null, authToken);
  
  if (!invalidIdResult.success && invalidIdResult.status === 400) {
    log('✅ Invalid ID error handling successful', 'success');
  } else {
    log(`❌ Invalid ID error handling failed: ${JSON.stringify(invalidIdResult.data)}`, 'error');
  }

  // Test duplicate email
  log('Testing duplicate email...', 'info');
  const duplicateEmailData = {
    fullName: 'Duplicate Email User',
    email: 'admin@checkinn.com', // Assuming this email already exists
    password: 'DuplicateTest123!@#',
    role: 'Customer'
  };

  const duplicateEmailResult = await makeRequest('post', '/admin/users', duplicateEmailData, authToken);
  
  if (!duplicateEmailResult.success && duplicateEmailResult.status === 400) {
    log('✅ Duplicate email error handling successful', 'success');
  } else {
    log(`❌ Duplicate email error handling failed: ${JSON.stringify(duplicateEmailResult.data)}`, 'error');
  }

  // Test unauthorized access (without token)
  log('Testing unauthorized access...', 'info');
  const unauthorizedResult = await makeRequest('get', '/admin/users', null, null);
  
  if (!unauthorizedResult.success && unauthorizedResult.status === 401) {
    log('✅ Unauthorized access error handling successful', 'success');
  } else {
    log(`❌ Unauthorized access error handling failed: ${JSON.stringify(unauthorizedResult.data)}`, 'error');
  }
};

/**
 * Main test function
 */
const runAllTests = async () => {
  log('🚀 STARTING ADMIN USER MANAGEMENT API TESTS', 'info');
  log('===============================================', 'info');

  try {
    // Test authentication first
    const authSuccess = await testAuthentication();
    
    if (!authSuccess) {
      log('❌ Authentication failed. Skipping other tests.', 'error');
      return;
    }

    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Run CRUD tests
    await testUserCRUD();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Run bulk operation tests
    await testBulkOperations();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Run search and filtering tests
    await testSearchFiltering();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Run error handling tests
    await testErrorHandling();

    log('===============================================', 'info');
    log('✅ ALL TESTS COMPLETED', 'success');

  } catch (error) {
    log(`❌ Test execution failed: ${error.message}`, 'error');
  }
};

// Export for use as module or run directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testAuthentication,
  testUserCRUD,
  testBulkOperations,
  testSearchFiltering,
  testErrorHandling,
  runAllTests
};