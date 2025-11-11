/**
 * Check Partner Verification Middleware
 * 
 * Ensures HotelPartner is verified before accessing protected resources
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const AppError = require('../utils/appError');

/**
 * Middleware to check if partner is verified
 * Must be used AFTER auth.protect and auth.restrictTo('HotelPartner')
 */
const checkPartnerVerified = (req, res, next) => {
  // Only check for HotelPartners
  if (req.user.role !== 'HotelPartner') {
    return next();
  }

  const verificationStatus = req.user.partnerInfo?.verificationStatus;

  // Allow access only if verified
  if (verificationStatus === 'verified') {
    return next();
  }

  // Pending
  if (verificationStatus === 'pending') {
    return next(
      new AppError(
        'Your partner application is pending review. Please wait for admin approval.',
        403
      )
    );
  }

  // Rejected
  if (verificationStatus === 'rejected') {
    const reason = req.user.partnerInfo?.rejectionReason || 'Application rejected';
    return next(
      new AppError(
        `Your partner application was rejected. Reason: ${reason}`,
        403
      )
    );
  }

  // No verification status (shouldn't happen)
  return next(
    new AppError(
      'Partner verification status not found. Please contact support.',
      403
    )
  );
};

module.exports = checkPartnerVerified;
