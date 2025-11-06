/**
 * Partner Routes for CheckInn Hotel Booking Platform
 * 
 * Handles all partner/hotel-manager related endpoints
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const express = require('express');
const partnerController = require('../controllers/partner.controller');
const middleware = require('../middlewares');

const router = express.Router();

/**
 * ============================================================================
 * PUBLIC ROUTES
 * ============================================================================
 */

/**
 * Partner Registration - Complete (All steps at once)
 * NEW: Recommended approach
 */
router.post('/register-complete', 
  middleware.validation.validatePartnerRegistrationComplete,
  partnerController.registerPartnerComplete
);

/**
 * Partner Registration - Legacy (Multi-step)
 * @deprecated Use /register-complete instead
 */
router.post('/register', 
  middleware.validation.validatePartnerRegistration,
  partnerController.registerPartner
);

/**
 * Check Application Status by Email (Public)
 * No authentication required - users check their application progress
 */
router.get('/application-status/:email', 
  partnerController.getApplicationStatus
);

/**
 * ============================================================================
 * PROTECTED ROUTES (HotelPartner only)
 * ============================================================================
 */

// Apply authentication
router.use(middleware.auth.protect);
router.use(middleware.auth.restrictTo('HotelPartner'));

/**
 * Onboarding Flow
 */
router.get('/onboarding-status', partnerController.getOnboardingStatus);

router.put('/business-info',
  middleware.validation.validateBusinessInfo,
  partnerController.updateBusinessInfo
);

router.put('/bank-account',
  middleware.validation.validateBankAccount,
  partnerController.updateBankAccount
);

router.post('/documents',
  partnerController.uploadDocuments
);

router.post('/complete-onboarding',
  partnerController.completeOnboarding
);

/**
 * Dashboard & Analytics
 */
router.get('/dashboard', partnerController.getDashboard);

/**
 * Hotel Management
 */
router.get('/hotels', partnerController.getMyHotels);

/**
 * Financial Management
 */
router.get('/earnings', partnerController.getEarnings);

module.exports = router;
