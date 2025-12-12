/**
 * Partner Controller Unit Tests
 * 
 * Tests controller logic with mocked dependencies
 * Focus on business logic validation without DB calls
 */

// ⚠️ CRITICAL: Mock MUST be declared BEFORE imports to work properly
jest.mock('../../src/models/User.model');

// Import controller AFTER mock setup
const partnerController = require('../../src/controllers/partner.controller');
const User = require('../../src/models/User.model');
const AppError = require('../../src/utils/appError');

describe('Partner Controller - Approve Application', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    // Reset ALL mocks before each test
    jest.clearAllMocks();
    jest.resetAllMocks();

    // Setup request mock
    mockReq = {
      params: { id: '507f1f77bcf86cd799439011' },
      user: { _id: 'admin123' }
    };

    // Setup response mock
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Setup next mock
    mockNext = jest.fn();
  });

  describe('✅ Success Cases', () => {
    test('Should approve pending partner application', async () => {
      const mockPartnerInfo = {
        verificationStatus: 'pending',
        verifiedAt: undefined,
        verifiedBy: undefined
      };
      
      const mockPartner = {
        _id: '507f1f77bcf86cd799439011',
        role: 'HotelPartner',
        status: 'active',
        partnerInfo: mockPartnerInfo,
        save: jest.fn(async function() {
          // Simulate Mongoose save - make changes persistent and return this
          console.log('[MOCK DEBUG] save() called, will return this partner');
          // Return actual partner object, not just `this`
          return mockPartner;
        })
      };

      // Setup mock BEFORE calling controller
      User.findById.mockResolvedValue(mockPartner);
      
      // Verify mock is set up
      console.log('[TEST DEBUG] User.findById is mocked:', jest.isMockFunction(User.findById));

      try {
        await partnerController.approvePartnerApplication(mockReq, mockRes, mockNext);
      } catch (error) {
        console.log('[TEST DEBUG] Controller threw error:', error);
      }

      // Debug: Check if mock was called
      console.log('[TEST DEBUG] User.findById called:', User.findById.mock.calls.length);
      console.log('[TEST DEBUG] mockPartner.save called:', mockPartner.save.mock.calls.length);
      console.log('[TEST DEBUG] mockNext called:', mockNext.mock.calls.length);
      console.log('[TEST DEBUG] mockRes.status called:', mockRes.status.mock.calls.length);
      
      if (mockNext.mock.calls.length > 0) {
        console.log('[TEST DEBUG] mockNext called with:', mockNext.mock.calls[0][0]);
      }

      expect(User.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockPartner.partnerInfo.verificationStatus).toBe('verified');
      expect(mockPartner.partnerInfo.verifiedAt).toBeDefined();
      expect(mockPartner.partnerInfo.verifiedBy).toBe('admin123');
      expect(mockPartner.status).toBe('active');
      expect(mockPartner.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: expect.stringContaining('approved')
      }));
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('❌ Error Cases - Bug #1: Status Validation', () => {
    test('Should reject if partner already verified', async () => {
      const mockPartner = {
        _id: '507f1f77bcf86cd799439011',
        role: 'HotelPartner',
        status: 'active',
        partnerInfo: {
          verificationStatus: 'verified'
        }
      };

      User.findById.mockResolvedValue(mockPartner);

      await partnerController.approvePartnerApplication(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toContain('already verified');
      expect(error.statusCode).toBe(400);
    });

    test('Should reject if partner application was rejected', async () => {
      const mockPartner = {
        _id: '507f1f77bcf86cd799439011',
        role: 'HotelPartner',
        status: 'inactive',
        partnerInfo: {
          verificationStatus: 'rejected'
        }
      };

      User.findById.mockResolvedValue(mockPartner);

      await partnerController.approvePartnerApplication(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toContain('rejected');
      expect(error.message).toContain('resubmit');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('❌ Error Cases - Bug #2: Suspended Check', () => {
    test('Should reject if partner account is suspended', async () => {
      const mockPartner = {
        _id: '507f1f77bcf86cd799439011',
        role: 'HotelPartner',
        status: 'suspended',
        partnerInfo: {
          verificationStatus: 'pending'
        }
      };

      User.findById.mockResolvedValue(mockPartner);

      await partnerController.approvePartnerApplication(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toContain('suspended');
      expect(error.message).toContain('unsuspend');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('❌ Error Cases - Not Found', () => {
    test('Should return 404 if partner not found', async () => {
      User.findById.mockResolvedValue(null);

      await partnerController.approvePartnerApplication(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toContain('not found');
      expect(error.statusCode).toBe(404);
    });

    test('Should return 404 if user is not HotelPartner role', async () => {
      const mockCustomer = {
        _id: '507f1f77bcf86cd799439011',
        role: 'Customer',
        status: 'active'
      };

      User.findById.mockResolvedValue(mockCustomer);

      await partnerController.approvePartnerApplication(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toContain('not found');
      expect(error.statusCode).toBe(404);
    });
  });
});

describe('Partner Controller - Reject Application', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: { id: '507f1f77bcf86cd799439011' },
      body: { rejectionReason: 'Invalid business license' },
      user: { _id: 'admin123' }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockNext = jest.fn();
  });

  describe('✅ Success Cases', () => {
    test('Should reject pending partner application with valid reason', async () => {
      const mockPartnerInfo = {
        verificationStatus: 'pending',
        rejectionReason: undefined
      };
      
      const mockPartner = {
        _id: '507f1f77bcf86cd799439011',
        role: 'HotelPartner',
        status: 'active',
        partnerInfo: mockPartnerInfo,
        save: jest.fn().mockImplementation(function() {
          return Promise.resolve(this);
        })
      };

      User.findById.mockResolvedValue(mockPartner);

      await partnerController.rejectPartnerApplication(mockReq, mockRes, mockNext);

      expect(mockPartner.partnerInfo.verificationStatus).toBe('rejected');
      expect(mockPartner.partnerInfo.rejectionReason).toBe('Invalid business license');
      expect(mockPartner.status).toBe('inactive');
      expect(mockPartner.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('❌ Error Cases - Validation', () => {
    test('Should reject if rejection reason is missing', async () => {
      mockReq.body.rejectionReason = '';

      const mockPartner = {
        _id: '507f1f77bcf86cd799439011',
        role: 'HotelPartner',
        status: 'active',
        partnerInfo: {
          verificationStatus: 'pending'
        }
      };

      User.findById.mockResolvedValue(mockPartner);

      await partnerController.rejectPartnerApplication(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toContain('required');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('❌ Error Cases - Bug #1: Status Validation', () => {
    test('Should reject if partner already verified', async () => {
      const mockPartner = {
        _id: '507f1f77bcf86cd799439011',
        role: 'HotelPartner',
        status: 'active',
        partnerInfo: {
          verificationStatus: 'verified'
        }
      };

      User.findById.mockResolvedValue(mockPartner);

      await partnerController.rejectPartnerApplication(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toContain('verified');
      expect(error.statusCode).toBe(400);
    });

    test('Should reject if partner already rejected', async () => {
      const mockPartner = {
        _id: '507f1f77bcf86cd799439011',
        role: 'HotelPartner',
        status: 'inactive',
        partnerInfo: {
          verificationStatus: 'rejected'
        }
      };

      User.findById.mockResolvedValue(mockPartner);

      await partnerController.rejectPartnerApplication(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toContain('already rejected');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('❌ Error Cases - Not Found', () => {
    test('Should return 404 if partner not found', async () => {
      User.findById.mockResolvedValue(null);

      await partnerController.rejectPartnerApplication(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toContain('not found');
      expect(error.statusCode).toBe(404);
    });
  });
});
