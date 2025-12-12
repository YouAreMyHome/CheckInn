/**
 * Test Utilities and Helpers
 * 
 * Provides helper functions for creating test data
 */

const User = require('../src/models/User.model');
const jwt = require('jsonwebtoken');

/**
 * Create test admin user
 */
async function createAdminUser(overrides = {}) {
  const adminData = {
    name: 'Test Admin',
    email: 'admin.test@checkinn.com',
    password: 'AdminTest123!',
    phone: '0987654321',
    role: 'Admin',
    status: 'active',
    ...overrides
  };

  const admin = await User.create(adminData);
  return admin;
}

/**
 * Create test hotel partner
 */
async function createPartner(overrides = {}) {
  const partnerData = {
    name: 'Test Partner',
    email: 'partner.test@checkinn.com',
    password: 'PartnerTest123!',
    phone: '0123456789',
    role: 'HotelPartner',
    status: 'active',
    partnerInfo: {
      businessName: 'Test Hotel',
      businessType: 'individual',
      businessAddress: {
        street: '123 Test St',
        city: 'Ho Chi Minh City',
        state: 'Ho Chi Minh',
        country: 'Vietnam',
        zipCode: '700000'
      },
      taxId: '1234567890',
      verificationStatus: 'pending',
      ...overrides.partnerInfo
    },
    ...overrides
  };

  const partner = await User.create(partnerData);
  return partner;
}

/**
 * Generate JWT token for user
 */
function generateToken(userId) {
  return jwt.sign(
    { id: userId, type: 'access' },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
}

/**
 * Create authenticated request headers
 */
function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

module.exports = {
  createAdminUser,
  createPartner,
  generateToken,
  authHeaders
};
