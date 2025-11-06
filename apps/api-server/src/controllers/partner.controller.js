/**
 * Partner Controller for CheckInn Hotel Booking Platform
 * 
 * Handles partner-specific operations:
 * - Partner registration & onboarding
 * - Business verification
 * - Dashboard analytics
 * - Revenue & earnings
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const User = require('../models/User.model');
const Hotel = require('../models/Hotel.model');
const Booking = require('../models/Booking.model');
const Revenue = require('../models/Revenue.model');
const Transaction = require('../models/Transaction.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @desc    Complete partner registration (all steps at once)
 * @route   POST /api/partner/register-complete
 * @access  Public
 */
exports.registerPartnerComplete = catchAsync(async (req, res, next) => {
  const { 
    // Step 1: Basic Info
    name, email, phone, password,
    // Step 2: Business Info
    businessName, businessType, taxId, businessAddress,
    // Step 3: Bank Account
    bankAccount,
    // Step 4: Documents
    documents
  } = req.body;
  
  // Validate all required fields
  if (!name || !email || !phone || !password) {
    return next(new AppError('Basic information is required', 400));
  }
  
  if (!businessName || !businessAddress) {
    return next(new AppError('Business information is required', 400));
  }
  
  if (!bankAccount || !bankAccount.bankName || !bankAccount.accountNumber) {
    return next(new AppError('Bank account information is required', 400));
  }
  
  if (!documents || documents.length === 0) {
    return next(new AppError('At least one verification document is required', 400));
  }
  
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already registered', 400));
  }
  
  // Create partner account with all data
  const partner = await User.create({
    name,
    email,
    phone,
    password,
    role: 'HotelPartner',
    partnerInfo: {
      businessName,
      businessType: businessType || 'individual',
      taxId,
      businessAddress,
      bankAccount,
      verificationDocuments: documents.map(doc => ({
        type: doc.type,
        url: doc.url,
        status: 'pending'
      })),
      verificationStatus: 'in_review',
      onboardingCompleted: true,
      onboardingStep: 5
    }
  });
  
  // Generate JWT token for auto-login
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { id: partner._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  
  // Remove password from output
  partner.password = undefined;
  
  res.status(201).json({
    success: true,
    message: 'Partner registration completed successfully! Your account is under review.',
    data: {
      user: partner,
      token,
      estimatedReviewTime: '2-3 business days'
    }
  });
});

/**
 * @desc    Register as hotel partner (legacy - deprecated)
 * @route   POST /api/partner/register
 * @access  Public
 * @deprecated Use /api/partner/register-complete instead
 */
exports.registerPartner = catchAsync(async (req, res, next) => {
  const { name, email, phone, password, businessName, businessType } = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already registered', 400));
  }
  
  // Create partner account
  const partner = await User.create({
    name,
    email,
    phone,
    password,
    role: 'HotelPartner',
    'partnerInfo.businessName': businessName || name,
    'partnerInfo.businessType': businessType || 'individual',
    'partnerInfo.onboardingCompleted': false,
    'partnerInfo.onboardingStep': 1
  });
  
  // Remove password from output
  partner.password = undefined;
  
  res.status(201).json({
    success: true,
    message: 'Partner account created successfully. Please complete your business profile.',
    data: {
      user: partner,
      nextStep: 2,
      onboardingUrl: '/partner/onboarding/business-info'
    }
  });
});

/**
 * @desc    Update partner business information
 * @route   PUT /api/partner/business-info
 * @access  Private (HotelPartner)
 */
exports.updateBusinessInfo = catchAsync(async (req, res, next) => {
  const { businessName, businessType, taxId, businessAddress } = req.body;
  
  const partner = await User.findById(req.user.id);
  
  if (!partner) {
    return next(new AppError('Partner not found', 404));
  }
  
  // Update business info
  partner.partnerInfo = {
    ...partner.partnerInfo,
    businessName,
    businessType,
    taxId,
    businessAddress,
    onboardingStep: Math.max(partner.partnerInfo.onboardingStep, 2)
  };
  
  await partner.save();
  
  res.status(200).json({
    success: true,
    message: 'Business information updated successfully',
    data: {
      user: partner,
      nextStep: 3,
      onboardingUrl: '/partner/onboarding/bank-account'
    }
  });
});

/**
 * @desc    Update partner bank account
 * @route   PUT /api/partner/bank-account
 * @access  Private (HotelPartner)
 */
exports.updateBankAccount = catchAsync(async (req, res, next) => {
  const { bankName, accountNumber, accountHolder, swiftCode, branchName } = req.body;
  
  const partner = await User.findById(req.user.id);
  
  if (!partner) {
    return next(new AppError('Partner not found', 404));
  }
  
  // Update bank account
  partner.partnerInfo.bankAccount = {
    bankName,
    accountNumber,
    accountHolder,
    swiftCode,
    branchName
  };
  
  partner.partnerInfo.onboardingStep = Math.max(partner.partnerInfo.onboardingStep, 3);
  
  await partner.save();
  
  res.status(200).json({
    success: true,
    message: 'Bank account information saved successfully',
    data: {
      user: partner,
      nextStep: 4,
      onboardingUrl: '/partner/onboarding/documents'
    }
  });
});

/**
 * @desc    Upload verification documents
 * @route   POST /api/partner/documents
 * @access  Private (HotelPartner)
 */
exports.uploadDocuments = catchAsync(async (req, res, next) => {
  const { documents } = req.body; // Array of { type, url }
  
  const partner = await User.findById(req.user.id);
  
  if (!partner) {
    return next(new AppError('Partner not found', 404));
  }
  
  // Add documents to verification list
  if (!partner.partnerInfo.verificationDocuments) {
    partner.partnerInfo.verificationDocuments = [];
  }
  
  documents.forEach(doc => {
    partner.partnerInfo.verificationDocuments.push({
      type: doc.type,
      url: doc.url,
      status: 'pending'
    });
  });
  
  partner.partnerInfo.verificationStatus = 'in_review';
  partner.partnerInfo.onboardingStep = Math.max(partner.partnerInfo.onboardingStep, 4);
  
  await partner.save();
  
  res.status(200).json({
    success: true,
    message: 'Documents uploaded successfully. Your account is under review.',
    data: {
      user: partner,
      estimatedReviewTime: '2-3 business days'
    }
  });
});

/**
 * @desc    Complete partner onboarding
 * @route   POST /api/partner/complete-onboarding
 * @access  Private (HotelPartner)
 */
exports.completeOnboarding = catchAsync(async (req, res, next) => {
  const partner = await User.findById(req.user.id);
  
  if (!partner) {
    return next(new AppError('Partner not found', 404));
  }
  
  // Check if all required steps are completed
  if (partner.partnerInfo.onboardingStep < 4) {
    return next(new AppError('Please complete all onboarding steps', 400));
  }
  
  partner.partnerInfo.onboardingCompleted = true;
  partner.partnerInfo.onboardingStep = 5;
  
  await partner.save();
  
  res.status(200).json({
    success: true,
    message: 'Onboarding completed! You can now create your first hotel.',
    data: {
      user: partner,
      redirectUrl: '/partner/hotels/create'
    }
  });
});

/**
 * @desc    Get partner onboarding status
 * @route   GET /api/partner/onboarding-status
 * @access  Private (HotelPartner)
 */
exports.getOnboardingStatus = catchAsync(async (req, res, next) => {
  const partner = await User.findById(req.user.id).select('+partnerInfo');
  
  if (!partner) {
    return next(new AppError('Partner not found', 404));
  }
  
  const status = {
    currentStep: partner.partnerInfo.onboardingStep || 1,
    completed: partner.partnerInfo.onboardingCompleted || false,
    verificationStatus: partner.partnerInfo.verificationStatus || 'pending',
    steps: {
      basicInfo: partner.partnerInfo.onboardingStep >= 1,
      businessInfo: partner.partnerInfo.onboardingStep >= 2,
      bankAccount: partner.partnerInfo.onboardingStep >= 3,
      documents: partner.partnerInfo.onboardingStep >= 4,
      verified: partner.partnerInfo.verificationStatus === 'verified'
    }
  };
  
  res.status(200).json({
    success: true,
    data: status
  });
});

/**
 * @desc    Get partner dashboard overview
 * @route   GET /api/partner/dashboard
 * @access  Private (HotelPartner)
 */
exports.getDashboard = catchAsync(async (req, res, next) => {
  const partnerId = req.user.id;
  
  // Get partner's hotels
  const hotels = await Hotel.find({ owner: partnerId });
  const hotelIds = hotels.map(h => h._id);
  
  // Get statistics
  const totalHotels = hotels.length;
  const activeHotels = hotels.filter(h => h.status === 'active').length;
  
  // Get bookings
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const bookings = await Booking.find({
    hotel: { $in: hotelIds }
  });
  
  const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
  const todayCheckIns = bookings.filter(b => {
    const checkIn = new Date(b.checkIn);
    checkIn.setHours(0, 0, 0, 0);
    return checkIn.getTime() === today.getTime();
  }).length;
  
  // Get today's revenue
  const todayRevenue = await Revenue.findOne({
    partner: partnerId,
    date: today
  });
  
  // Get this month's revenue
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthRevenues = await Revenue.find({
    partner: partnerId,
    date: { $gte: startOfMonth }
  });
  
  const monthlyRevenue = monthRevenues.reduce((sum, r) => sum + r.totalRevenue, 0);
  const monthlyBookings = monthRevenues.reduce((sum, r) => sum + r.totalBookings, 0);
  
  res.status(200).json({
    success: true,
    data: {
      hotels: {
        total: totalHotels,
        active: activeHotels
      },
      bookings: {
        pending: pendingBookings,
        todayCheckIns
      },
      revenue: {
        today: todayRevenue?.totalRevenue || 0,
        thisMonth: monthlyRevenue
      },
      statistics: {
        totalBookings: monthlyBookings,
        avgOccupancyRate: monthRevenues.length > 0
          ? monthRevenues.reduce((sum, r) => sum + r.occupancyRate, 0) / monthRevenues.length
          : 0
      }
    }
  });
});

/**
 * @desc    Get partner's hotels
 * @route   GET /api/partner/hotels
 * @access  Private (HotelPartner)
 */
exports.getMyHotels = catchAsync(async (req, res, next) => {
  const hotels = await Hotel.find({ owner: req.user.id })
    .populate('owner', 'name email')
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: hotels.length,
    data: {
      hotels
    }
  });
});

/**
 * @desc    Get partner earnings
 * @route   GET /api/partner/earnings
 * @access  Private (HotelPartner)
 */
exports.getEarnings = catchAsync(async (req, res, next) => {
  const partnerId = req.user.id;
  const { startDate, endDate } = req.query;
  
  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1)); // Start of month
  const end = endDate ? new Date(endDate) : new Date(); // Today
  
  const earnings = await Transaction.getPartnerEarnings(partnerId, start, end);
  
  // Get pending payouts
  const pendingPayouts = await Transaction.find({
    partner: partnerId,
    status: 'completed',
    payoutStatus: 'pending'
  });
  
  const pendingAmount = pendingPayouts.reduce((sum, t) => sum + t.partnerAmount, 0);
  
  res.status(200).json({
    success: true,
    data: {
      period: {
        start,
        end
      },
      earnings: earnings[0] || {
        totalEarnings: 0,
        totalTransactions: 0,
        totalPlatformFee: 0,
        totalGrossRevenue: 0
      },
      pendingPayout: pendingAmount
    }
  });
});

/**
 * @desc    Get application status by email (Public endpoint)
 * @route   GET /api/partner/application-status/:email
 * @access  Public
 */
exports.getApplicationStatus = catchAsync(async (req, res, next) => {
  const { email } = req.params;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Invalid email format', 400));
  }

  // Find user by email (HotelPartner only)
  const user = await User.findOne({ 
    email: email.toLowerCase(),
    role: 'HotelPartner'
  }).select('name email phone partnerInfo verificationStatus onboardingProgress createdAt updatedAt');

  if (!user) {
    return next(new AppError('No application found with this email', 404));
  }

  // Prepare response data (no sensitive info)
  const applicationData = {
    name: user.name,
    email: user.email,
    phone: user.phone,
    businessName: user.partnerInfo?.businessName || 'N/A',
    businessType: user.partnerInfo?.businessType || 'N/A',
    verificationStatus: user.partnerInfo?.verificationStatus || 'pending',
    onboardingProgress: user.onboardingProgress || {
      businessInfoCompleted: false,
      bankAccountCompleted: false,
      documentsUploaded: false
    },
    createdAt: user.createdAt, // For frontend compatibility
    updatedAt: user.updatedAt,
    // Add rejection reason if rejected
    rejectionReason: user.partnerInfo?.verificationStatus === 'rejected' ? user.partnerInfo?.rejectionReason : null
  };

  res.status(200).json({
    success: true,
    message: 'Application status retrieved successfully',
    data: applicationData
  });
});

module.exports = exports;
