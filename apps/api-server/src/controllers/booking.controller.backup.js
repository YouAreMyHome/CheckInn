/**
 * Booking Controller for CheckInn Hotel Booking Platform
 * 
 * Manages booking operations với complex reservation flow, payment tracking,
 * cancellation policies, và guest management
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const Booking = require('../models/Booking.model');
const Room = require('../models/Room.model');
const Hotel = require('../models/Hotel.model');
const User = require('../models/User.model');
const ActivityTracker = require('../utils/activityTracker');
const FraudDetection = require('../utils/fraudDetection');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIResponse = require('../utils/apiResponse');
const mongoose = require('mongoose');

/**
 * Booking Controller Class
 * Comprehensive booking management với business logic
 */
class BookingController {

  /**
   * ============================================================================
   * BOOKING CREATION & MANAGEMENT
   * ============================================================================
   */

  /**
   * Create new booking (với validation và fraud check)
   * POST /api/bookings
   */
  static createBooking = catchAsync(async (req, res, next) => {
    const {
      hotelId,
      roomId,
      checkIn,
      checkOut,
      guests,
      specialRequests,
      promoCode,
      paymentMethod = 'Credit Card'
    } = req.body;

    // Input validation
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const now = new Date();

    if (checkInDate <= now) {
      return next(new AppError('Check-in date must be in the future', 400));
    }

    if (checkInDate >= checkOutDate) {
      return next(new AppError('Check-out date must be after check-in date', 400));
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    if (nights > 30) {
      return next(new AppError('Maximum stay is 30 nights', 400));
    }

    // Fraud detection check
    const fraudScore = await FraudDetection.checkBookingFraud(req.user._id, {
      hotelId,
      roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guests.length,
      totalGuests: guests.length,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    if (fraudScore > 80) {
      await ActivityTracker.trackActivity({
        activityType: 'booking_fraud_blocked',
        req,
        userId: req.user._id,
        customData: { fraudScore, hotelId, roomId }
      });
      return next(new AppError('Booking blocked due to security concerns', 403));
    }

    // Verify room and hotel
    const room = await Room.findById(roomId).populate('hotel');
    if (!room || !room.hotel) {
      return next(new AppError('Room not found', 404));
    }

    if (room.hotel._id.toString() !== hotelId) {
      return next(new AppError('Room does not belong to specified hotel', 400));
    }

    // Check availability
    const isAvailable = await room.isAvailableForPeriod(checkInDate, checkOutDate);
    if (!isAvailable) {
      return next(new AppError('Room is not available for selected dates', 409));
    }

    // Check capacity
    const totalGuests = guests.length;
    if (totalGuests > room.capacity) {
      return next(new AppError(`Room capacity exceeded. Maximum: ${room.capacity} guests`, 400));
    }

    // Calculate pricing
    const basePrice = room.calculatePrice(checkInDate, checkOutDate);
    const taxes = Math.round(basePrice * 0.1); // 10% tax
    const serviceFee = Math.round(basePrice * 0.05); // 5% service fee
    
    let discount = 0;
    if (promoCode) {
      // TODO: Implement promo code validation
      discount = await this.validateAndCalculatePromoDiscount(promoCode, basePrice);
    }

    const totalAmount = basePrice + taxes + serviceFee - discount;

    // Generate booking reference
    const bookingReference = await this.generateBookingReference();

    // Create booking
    const bookingData = {
      bookingReference,
      user: req.user._id,
      hotel: hotelId,
      room: roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      guests,
      totalGuests,
      specialRequests,
      
      pricing: {
        basePrice,
        taxes,
        serviceFee,
        discount,
        totalAmount
      },

      payment: {
        method: paymentMethod,
        status: 'Pending',
        currency: 'VND'
      },

      status: 'Pending',
      fraudScore
    };

    const booking = await Booking.create(bookingData);
    
    // Populate booking details
    await booking.populate([
      { path: 'hotel', select: 'name location contact policies' },
      { path: 'room', select: 'name type amenities images' },
      { path: 'user', select: 'name email phone' }
    ]);

    // Update room booking count
    await Room.findByIdAndUpdate(roomId, { 
      $inc: { totalBookings: 1 },
      lastBookedAt: new Date()
    });

    // Track booking creation
    await ActivityTracker.trackPurchase(req, req.user._id, {
      bookingId: booking._id,
      hotelId,
      roomId,
      value: totalAmount,
      currency: 'VND',
      nights,
      guests: totalGuests
    });

    // Track potential fraud if score is high
    if (fraudScore > 50) {
      await ActivityTracker.trackActivity({
        activityType: 'booking_high_fraud_score',
        req,
        userId: req.user._id,
        customData: { fraudScore, bookingId: booking._id }
      });
    }

    APIResponse.success(res, {
      message: 'Booking created successfully',
      data: { 
        booking,
        paymentRequired: true,
        nextStep: 'payment'
      }
    }, 201);
  });

  /**
   * Get user bookings với filtering
   * GET /api/bookings/my-bookings
   */
  static getMyBookings = catchAsync(async (req, res, next) => {
    const {
      page = 1,
      limit = 10,
      status,
      sort = '-createdAt'
    } = req.query;

    let query = Booking.find({ user: req.user._id });

    // Status filter
    if (status) {
      const statusArray = Array.isArray(status) ? status : [status];
      query = query.where('status').in(statusArray);
    }

    // Count total
    const total = await Booking.countDocuments(query.getFilter());

    // Execute query với pagination
    const bookings = await query
      .populate('hotel', 'name location starRating images')
      .populate('room', 'name type images amenities')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalBookings: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    // Track view
    await ActivityTracker.trackActivity({
      activityType: 'bookings_view',
      req,
      userId: req.user._id,
      customData: { bookingsCount: bookings.length }
    });

    APIResponse.success(res, {
      data: { bookings, pagination }
    });
  });

  /**
   * Get booking by ID
   * GET /api/bookings/:id
   */
  static getBookingById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return next(new AppError('Invalid booking ID', 400));
    }

    const booking = await Booking.findById(id)
      .populate('hotel', 'name location contact policies images')
      .populate('room', 'name type amenities images policies')
      .populate('user', 'name email phone');

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Check access permission
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isHotelOwner = booking.hotel.owner && booking.hotel.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isHotelOwner && !isAdmin) {
      return next(new AppError('Access denied', 403));
    }

    // Add cancellation policy info
    const cancellationInfo = await this.getCancellationInfo(booking);

    APIResponse.success(res, {
      data: { 
        booking,
        cancellationInfo
      }
    });
  });

  /**
   * ============================================================================
   * BOOKING STATUS MANAGEMENT
   * ============================================================================
   */

  /**
   * Confirm booking (after payment)
   * PATCH /api/bookings/:id/confirm
   */
  static confirmBooking = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { paymentId, paymentMethod } = req.body;

    const booking = await Booking.findById(id).populate('room hotel');
    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Only booking owner or admin can confirm
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('Access denied', 403));
    }

    if (booking.status !== 'Pending') {
      return next(new AppError('Only pending bookings can be confirmed', 400));
    }

    // Check if room is still available
    const isStillAvailable = await booking.room.isAvailableForPeriod(
      booking.checkIn, 
      booking.checkOut
    );

    if (!isStillAvailable) {
      // Auto-cancel booking
      await Booking.findByIdAndUpdate(id, {
        status: 'Cancelled',
        cancellationReason: 'Room no longer available',
        cancelledAt: new Date()
      });

      return next(new AppError('Room is no longer available. Booking has been cancelled.', 409));
    }

    // Update booking status
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        status: 'Confirmed',
        confirmedAt: new Date(),
        'payment.status': 'Completed',
        'payment.paymentId': paymentId,
        'payment.method': paymentMethod || booking.payment.method,
        'payment.paidAt': new Date()
      },
      { new: true }
    ).populate('hotel room user');

    // Update hotel và room statistics
    await Promise.all([
      Hotel.findByIdAndUpdate(booking.hotel._id, { 
        $inc: { totalBookings: 1 },
        lastBookingAt: new Date()
      }),
      Room.findByIdAndUpdate(booking.room._id, {
        lastBookedAt: new Date()
      })
    ]);

    // Track confirmation
    await ActivityTracker.trackActivity({
      activityType: 'booking_confirmed',
      req,
      userId: req.user._id,
      customData: {
        bookingId: id,
        paymentId,
        totalAmount: booking.pricing.totalAmount
      }
    });

    APIResponse.success(res, {
      message: 'Booking confirmed successfully',
      data: { booking: updatedBooking }
    });
  });

  /**
   * Cancel booking với policy check
   * PATCH /api/bookings/:id/cancel
   */
  static cancelBooking = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id).populate('hotel room');
    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Check permission
    const isOwner = booking.user.toString() === req.user._id.toString();
    const isHotelOwner = booking.hotel.owner && booking.hotel.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isHotelOwner && !isAdmin) {
      return next(new AppError('Access denied', 403));
    }

    // Check if cancellable
    const cancellableStatuses = ['Pending', 'Confirmed'];
    if (!cancellableStatuses.includes(booking.status)) {
      return next(new AppError('This booking cannot be cancelled', 400));
    }

    // Calculate refund based on cancellation policy
    const cancellationResult = await booking.cancelBooking(reason, req.user._id);

    // Track cancellation
    await ActivityTracker.trackActivity({
      activityType: 'booking_cancelled',
      req,
      userId: req.user._id,
      customData: {
        bookingId: id,
        reason,
        refundAmount: cancellationResult.refundAmount,
        cancellationFee: cancellationResult.cancellationFee,
        cancelledBy: isOwner ? 'guest' : (isHotelOwner ? 'hotel' : 'admin')
      }
    });

    APIResponse.success(res, {
      message: 'Booking cancelled successfully',
      data: {
        booking: cancellationResult.booking,
        refund: {
          amount: cancellationResult.refundAmount,
          fee: cancellationResult.cancellationFee,
          processingTime: '3-5 business days'
        }
      }
    });
  });

  /**
   * Check-in booking
   * PATCH /api/bookings/:id/check-in
   */
  static checkInBooking = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { actualGuests, notes } = req.body;

    const booking = await Booking.findById(id).populate('hotel room user');
    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Only hotel staff or admin can check-in guests
    const isHotelOwner = booking.hotel.owner && booking.hotel.owner.toString() === req.user._id.toString();
    if (!isHotelOwner && req.user.role !== 'Admin') {
      return next(new AppError('Only hotel staff can check-in guests', 403));
    }

    if (booking.status !== 'Confirmed') {
      return next(new AppError('Only confirmed bookings can be checked in', 400));
    }

    // Check if check-in date is appropriate
    const today = new Date();
    const checkInDate = new Date(booking.checkIn);
    const daysDifference = (checkInDate - today) / (1000 * 60 * 60 * 24);

    if (daysDifference > 1) {
      return next(new AppError('Check-in is too early', 400));
    }

    if (daysDifference < -1) {
      return next(new AppError('Check-in is too late. Please contact support.', 400));
    }

    // Update booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        status: 'CheckedIn',
        actualCheckIn: new Date(),
        actualGuests: actualGuests || booking.totalGuests,
        checkInNotes: notes
      },
      { new: true }
    ).populate('hotel room user');

    // Update room status
    await Room.findByIdAndUpdate(booking.room._id, {
      status: 'Occupied',
      lastStatusUpdate: new Date()
    });

    // Track check-in
    await ActivityTracker.trackActivity({
      activityType: 'booking_checkin',
      req,
      userId: req.user._id,
      customData: {
        bookingId: id,
        guestId: booking.user._id,
        actualGuests: actualGuests || booking.totalGuests,
        roomId: booking.room._id
      }
    });

    APIResponse.success(res, {
      message: 'Guest checked in successfully',
      data: { booking: updatedBooking }
    });
  });

  /**
   * Check-out booking
   * PATCH /api/bookings/:id/check-out
   */
  static checkOutBooking = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { additionalCharges = [], notes, roomCondition = 'Good' } = req.body;

    const booking = await Booking.findById(id).populate('hotel room user');
    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Only hotel staff or admin can check-out guests
    const isHotelOwner = booking.hotel.owner && booking.hotel.owner.toString() === req.user._id.toString();
    if (!isHotelOwner && req.user.role !== 'Admin') {
      return next(new AppError('Only hotel staff can check-out guests', 403));
    }

    if (booking.status !== 'CheckedIn') {
      return next(new AppError('Only checked-in bookings can be checked out', 400));
    }

    // Calculate additional charges
    let totalAdditionalCharges = 0;
    if (additionalCharges.length > 0) {
      totalAdditionalCharges = additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
    }

    // Update booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        status: 'CheckedOut',
        actualCheckOut: new Date(),
        checkOutNotes: notes,
        roomCondition,
        additionalCharges,
        finalAmount: booking.pricing.totalAmount + totalAdditionalCharges
      },
      { new: true }
    ).populate('hotel room user');

    // Update room status
    const roomStatus = roomCondition === 'Good' ? 'Cleaning' : 'Maintenance';
    await Room.findByIdAndUpdate(booking.room._id, {
      status: roomStatus,
      lastStatusUpdate: new Date()
    });

    // Track check-out
    await ActivityTracker.trackActivity({
      activityType: 'booking_checkout',
      req,
      userId: req.user._id,
      customData: {
        bookingId: id,
        guestId: booking.user._id,
        roomCondition,
        additionalCharges: totalAdditionalCharges,
        roomId: booking.room._id
      }
    });

    APIResponse.success(res, {
      message: 'Guest checked out successfully',
      data: { 
        booking: updatedBooking,
        additionalCharges: totalAdditionalCharges > 0 ? {
          amount: totalAdditionalCharges,
          items: additionalCharges
        } : null
      }
    });
  });

  /**
   * ============================================================================
   * BOOKING ANALYTICS & REPORTS
   * ============================================================================
   */

  /**
   * Get booking analytics for hotel owner
   * GET /api/bookings/analytics
   */
  static getBookingAnalytics = catchAsync(async (req, res, next) => {
    const { 
      hotelId, 
      period = 30,
      startDate,
      endDate 
    } = req.query;

    // Date range
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      const endDateCalc = new Date();
      const startDateCalc = new Date(endDateCalc.getTime() - (period * 24 * 60 * 60 * 1000));
      dateFilter = {
        createdAt: {
          $gte: startDateCalc,
          $lte: endDateCalc
        }
      };
    }

    let matchStage = { ...dateFilter };
    
    // Hotel filter (only if user is hotel owner)
    if (hotelId) {
      const hotel = await Hotel.findById(hotelId);
      if (hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        return next(new AppError('Access denied', 403));
      }
      matchStage.hotel = mongoose.Types.ObjectId(hotelId);
    } else if (req.user.role !== 'Admin') {
      // Regular users can only see their own hotel analytics
      const userHotels = await Hotel.find({ owner: req.user._id }).select('_id');
      matchStage.hotel = { $in: userHotels.map(h => h._id) };
    }

    const analytics = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalAmount' },
          avgBookingValue: { $avg: '$pricing.totalAmount' },
          
          // Status breakdown
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'Confirmed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          },

          // Metrics
          totalNights: { $sum: '$nights' },
          totalGuests: { $sum: '$totalGuests' },
          avgStayDuration: { $avg: '$nights' }
        }
      }
    ]);

    // Monthly trend
    const monthlyTrend = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$pricing.totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const result = analytics[0] || {
      totalBookings: 0,
      totalRevenue: 0,
      avgBookingValue: 0,
      confirmedBookings: 0,
      cancelledBookings: 0,
      completedBookings: 0,
      totalNights: 0,
      totalGuests: 0,
      avgStayDuration: 0
    };

    // Calculate additional metrics
    result.cancellationRate = result.totalBookings > 0 ? 
      ((result.cancelledBookings / result.totalBookings) * 100).toFixed(1) : 0;
    
    result.occupancyRate = result.totalNights > 0 ? 
      ((result.totalNights / (period || 30)) * 100).toFixed(1) : 0;

    APIResponse.success(res, {
      data: {
        analytics: result,
        monthlyTrend,
        period: { days: period, startDate, endDate }
      }
    });
  });

  /**
   * ============================================================================
   * ADMIN & HOTEL MANAGEMENT
   * ============================================================================
   */

  /**
   * Get all bookings (admin/hotel owner)
   * GET /api/bookings
   */
  static getAllBookings = catchAsync(async (req, res, next) => {
    const {
      page = 1,
      limit = 20,
      hotelId,
      status,
      startDate,
      endDate,
      guestName,
      sort = '-createdAt'
    } = req.query;

    let query = Booking.find();

    // Access control
    if (req.user.role !== 'Admin') {
      // Hotel owners can only see their hotel bookings
      const userHotels = await Hotel.find({ owner: req.user._id }).select('_id');
      if (userHotels.length === 0) {
        return APIResponse.success(res, {
          data: { bookings: [], pagination: { totalBookings: 0 } }
        });
      }
      query = query.where('hotel').in(userHotels.map(h => h._id));
    }

    // Filters
    if (hotelId) query = query.where('hotel', hotelId);
    if (status) query = query.where('status', status);
    
    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      query = query.where('checkIn', dateFilter);
    }

    if (guestName) {
      const users = await User.find({
        name: { $regex: guestName, $options: 'i' }
      }).select('_id');
      query = query.where('user').in(users.map(u => u._id));
    }

    // Count total
    const total = await Booking.countDocuments(query.getFilter());

    // Execute query
    const bookings = await query
      .populate('hotel', 'name location')
      .populate('room', 'name type')
      .populate('user', 'name email phone')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalBookings: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    APIResponse.success(res, {
      data: { bookings, pagination }
    });
  });

  /**
   * ============================================================================
   * HELPER METHODS
   * ============================================================================
   */

  /**
   * Generate unique booking reference
   */
  static async generateBookingReference() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let reference;
    let exists = true;

    while (exists) {
      reference = 'BK';
      for (let i = 0; i < 8; i++) {
        reference += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      const existingBooking = await Booking.findOne({ bookingReference: reference });
      exists = !!existingBooking;
    }

    return reference;
  }

  /**
   * Get cancellation policy information
   */
  static async getCancellationInfo(booking) {
    const now = new Date();
    const checkInDate = new Date(booking.checkIn);
    const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);

    let cancellationFee = 0;
    let canCancel = true;
    let refundAmount = booking.pricing.totalAmount;

    // Cancellation policy logic
    if (booking.status === 'CheckedIn' || booking.status === 'CheckedOut') {
      canCancel = false;
      refundAmount = 0;
    } else if (hoursUntilCheckIn < 24) {
      // Less than 24 hours - 50% fee
      cancellationFee = booking.pricing.totalAmount * 0.5;
      refundAmount = booking.pricing.totalAmount - cancellationFee;
    } else if (hoursUntilCheckIn < 72) {
      // Less than 72 hours - 25% fee
      cancellationFee = booking.pricing.totalAmount * 0.25;
      refundAmount = booking.pricing.totalAmount - cancellationFee;
    }
    // More than 72 hours - free cancellation

    return {
      canCancel,
      cancellationFee,
      refundAmount,
      hoursUntilCheckIn: Math.max(0, hoursUntilCheckIn),
      policy: 'Free cancellation up to 72 hours before check-in'
    };
  }

  /**
   * Validate promo code và calculate discount
   */
  static async validateAndCalculatePromoDiscount(promoCode, basePrice) {
    // TODO: Implement promo code validation logic
    // This would check against a PromoCode model
    return 0;
  }
}

module.exports = BookingController;