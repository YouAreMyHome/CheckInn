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

/**
 * Create test user with role
 */
async function createTestUser(role = 'Customer', overrides = {}) {
  const baseData = {
    name: `Test ${role}`,
    email: `${role.toLowerCase()}.${Date.now()}@test.com`,
    password: 'Test123!',
    phone: `09${Math.floor(Math.random() * 100000000)}`,
    role: role,
    status: 'active',
    ...overrides
  };

  if (role === 'HotelPartner') {
    baseData.partnerInfo = {
      businessName: 'Test Hotel Business',
      businessType: 'individual',
      businessAddress: {
        street: '123 Test St',
        city: 'Ho Chi Minh City',
        state: 'Ho Chi Minh',
        country: 'Vietnam',
        zipCode: '700000'
      },
      taxId: '1234567890',
      verificationStatus: 'verified',
      verifiedAt: new Date(),
      ...overrides.partnerInfo
    };
  }

  return await User.create(baseData);
}

/**
 * Create test hotel
 */
async function createTestHotel(ownerId, overrides = {}) {
  const Hotel = require('../src/models/Hotel.model');
  
  const hotelData = {
    name: `Test Hotel ${Date.now()}`,
    owner: ownerId,
    description: 'A test hotel for integration testing',
    category: 'business',
    starRating: 3,
    location: {
      address: '456 Hotel Street',
      city: 'Ho Chi Minh City',
      state: 'Ho Chi Minh',
      country: 'Vietnam',
      zipCode: '700000',
      coordinates: [106.6297, 10.8231]
    },
    contact: {
      phone: '0283456789',
      email: 'contact@testhotel.com',
      website: 'https://testhotel.com'
    },
    amenities: [
      { name: 'WiFi', icon: 'wifi', category: 'general' },
      { name: 'Parking', icon: 'parking', category: 'transport' },
      { name: 'Pool', icon: 'pool', category: 'recreation' }
    ],
    priceRange: {
      min: 100,
      max: 500
    },
    currency: 'USD',
    policies: {
      checkInTime: '14:00',
      checkOutTime: '12:00',
      cancellationPolicy: 'flexible',
      childrenPolicy: 'Children of all ages are welcome',
      petPolicy: 'not-allowed',
      smokingPolicy: 'not-allowed'
    },
    status: 'active',
    isVerified: true,
    stats: {
      totalRooms: 0,
      averageRating: 0,
      totalReviews: 0
    },
    ...overrides
  };

  return await Hotel.create(hotelData);
}

/**
 * Create test room with valid schema fields
 * @param {ObjectId} hotelId - Hotel ID
 * @param {Object} overrides - Fields to override
 */
async function createTestRoom(hotelId, overrides = {}) {
  const Room = require('../src/models/Room.model');
  
  const roomData = {
    name: `Test Room ${Date.now()}`,
    roomNumber: `${Math.floor(Math.random() * 900) + 100}`,
    type: 'deluxe',
    description: 'A comfortable test room',
    hotel: hotelId,
    size: {
      value: 30,
      unit: 'sqm'
    },
    capacity: {
      adults: 2,
      children: 0,
      totalGuests: 2
    },
    bedConfiguration: [
      { type: 'queen', count: 1 }
    ],
    pricing: {
      basePrice: 100,
      currency: 'USD'
    },
    amenities: [
      { name: 'WiFi', icon: 'wifi', description: 'High-speed internet' },
      { name: 'TV', icon: 'tv', description: 'Smart TV' }
    ],
    status: 'available',
    isActive: true,
    ...overrides
  };

  return await Room.create(roomData);
}

/**
 * Create test booking with valid schema fields
 * @param {Object} data - Booking data (customer, hotel, room, checkIn, checkOut)
 * @param {Object} overrides - Fields to override
 */
async function createTestBooking(data, overrides = {}) {
  const Booking = require('../src/models/Booking.model');
  
  const { customer, hotel, room, checkIn, checkOut } = data;
  const totalAmount = overrides.totalAmount || 750;
  
  const bookingData = {
    customer,
    hotel,
    room,
    checkIn,
    checkOut,
    totalGuests: 2,
    status: 'Confirmed',
    pricing: {
      baseAmount: totalAmount,
      taxes: 0,
      serviceCharges: 0,
      discountAmount: 0,
      totalAmount: totalAmount,
      currency: 'USD'
    },
    payment: {
      method: 'credit_card',
      status: 'Completed',
      amount: totalAmount,
      currency: 'USD',
      paidAt: new Date()
    },
    ...overrides
  };

  return await Booking.create(bookingData);
}

module.exports = {
  createAdminUser,
  createPartner,
  generateToken,
  authHeaders,
  createTestUser,
  createTestHotel,
  createTestRoom,
  createTestBooking
};
