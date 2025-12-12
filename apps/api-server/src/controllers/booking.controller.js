/**
 * Booking Controller for CheckInn Hotel Booking Platform
 * * Implements:
 * 1. ACID Transactions for Booking Creation
 * 2. Server-side Pricing Calculation (Security)
 * 3. Double-check Availability (Anti-Overbooking)
 * 4. Role-based Data Access
 * * @author CheckInn Team
 * @version 2.0.0
 */

const mongoose = require('mongoose');
const Booking = require('../models/Booking.model');
const Room = require('../models/Room.model');
const Hotel = require('../models/Hotel.model');
const Transaction = require('../models/Transaction.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

/**
 * 1. CREATE BOOKING (Complex Transaction)
 */
exports.createBooking = catchAsync(async (req, res, next) => {
  const { 
    hotel: hotelId, 
    room: roomId, 
    checkIn, 
    checkOut, 
    guests, 
    paymentMethod,
    notes 
  } = req.body;

  // 1. Start Database Transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 2. Validate Entities
    const hotel = await Hotel.findById(hotelId).session(session);
    const room = await Room.findById(roomId).session(session);

    if (!hotel || !room) {
      throw new AppError('Hotel or Room not found', 404);
    }

    // 3. Double-Check Availability (CRITICAL STEP)
    // Query: Tìm booking đã confirm nằm trong khoảng ngày này
    const existingBooking = await Booking.findOne({
      room: roomId,
      status: { $in: ['Confirmed', 'CheckedIn'] },
      $or: [
        { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } }
      ]
    }).session(session);

    if (existingBooking) {
      throw new AppError('Room is already booked for these dates. Please choose another room.', 409);
    }

    // 4. Server-side Price Calculation (Do not trust client price)
    // Sử dụng method calculatePrice mà tôi đã thấy trong Room Model của bạn
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const guestList = Array.isArray(guests) ? guests : []; 
    // Giả sử req.body.guests là mảng thông tin khách, lấy số lượng để tính tiền
    const guestCount = guestList.length > 0 ? guestList.length : 1;

    const priceDetails = room.calculatePrice(startDate, endDate, guestCount);

    // 5. Construct Booking Object
    const newBooking = await Booking.create([{
      bookingNumber: `CI-${Date.now()}`, // Fallback if pre-save hook fails inside transaction
      user: req.user._id,
      hotel: hotelId,
      room: roomId,
      checkIn: startDate,
      checkOut: endDate,
      guests: guestList,
      totalGuests: guestCount,
      status: 'Pending', // Chờ thanh toán
      pricing: {
        baseAmount: priceDetails.basePrice,
        taxes: priceDetails.taxes,
        totalAmount: priceDetails.total,
        currency: 'VND'
      },
      payment: {
        method: paymentMethod || 'credit_card',
        status: 'Pending'
      },
      notes
    }], { session });

    const booking = newBooking[0];

    // 6. Create Initial Transaction Record (For Revenue Tracking)
    await Transaction.create([{
      transactionId: `TXN-${Date.now()}`,
      booking: booking._id,
      hotel: hotelId,
      user: req.user._id,
      partner: hotel.owner,
      type: 'payment',
      status: 'pending',
      amount: priceDetails.total,
      currency: 'VND',
      partnerAmount: priceDetails.total * 0.9, // Ví dụ: 10% platform fee
      paymentMethod: paymentMethod || 'credit_card',
      paymentGateway: 'manual' // Hoặc 'vnpay', 'stripe' tùy integration sau này
    }], { session });

    // 7. Commit Transaction
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Booking initialized successfully. Please proceed to payment.',
      data: { 
        booking,
        paymentUrl: `/api/payment/checkout/${booking._id}` // Mock payment URL
      }
    });

  } catch (error) {
    // 8. Rollback on Fail
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

/**
 * 2. GET ALL BOOKINGS (Advanced Filtering)
 * Role Logic:
 * - Admin: See all
 * - Partner: See bookings for THEIR hotels only
 * - Customer: Redirect to getMyBookings
 */
exports.getAllBookings = catchAsync(async (req, res, next) => {
  let filter = {};

  // ROLE-BASED FILTERING
  if (req.user.role === 'HotelPartner') {
    // Step 1: Find all hotels owned by this partner
    const myHotels = await Hotel.find({ owner: req.user._id }).select('_id');
    const hotelIds = myHotels.map(h => h._id);
    
    // Step 2: Filter bookings by these hotels
    filter = { hotel: { $in: hotelIds } };
  } else if (req.user.role === 'Customer') {
    filter = { user: req.user._id };
  }

  // Combine with query params filter (using APIFeatures)
  const features = new APIFeatures(Booking.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const bookings = await features.query
    .populate('user', 'name email')
    .populate('room', 'name type')
    .populate('hotel', 'name');

  res.status(200).json({
    success: true,
    results: bookings.length,
    data: { bookings }
  });
});

/**
 * 3. GET MY BOOKINGS (For Customers)
 */
exports.getMyBookings = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Booking.find({ user: req.user._id }), 
    req.query
  )
    .filter()
    .sort()
    .paginate();

  const bookings = await features.query
    .populate('hotel', 'name location images')
    .populate('room', 'name type');

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: { bookings }
  });
});

/**
 * 4. GET BOOKING BY ID (Security Protected)
 */
exports.getBookingById = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('hotel', 'name location contact')
    .populate('room', 'name type pricing images')
    .populate('user', 'name email phone');

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  // SECURITY CHECK: Access Control
  // Chỉ cho phép xem nếu: Là chủ booking OR Là chủ khách sạn OR Là Admin
  const isOwner = booking.user._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'Admin';
  
  // Check Hotel Owner (cần query thêm hotel để biết owner)
  let isHotelOwner = false;
  if (req.user.role === 'HotelPartner') {
    const hotel = await Hotel.findById(booking.hotel._id);
    isHotelOwner = hotel.owner.toString() === req.user._id.toString();
  }

  if (!isOwner && !isAdmin && !isHotelOwner) {
    return next(new AppError('You do not have permission to view this booking', 403));
  }

  res.status(200).json({
    success: true,
    data: { booking }
  });
});

/**
 * 5. CONFIRM BOOKING (Admin/Partner/System Webhook)
 */
exports.confirmBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));

  // Check Permissions (Only Partner/Admin can manually confirm)
  // Thực tế thường dùng Webhook từ Payment Gateway
  if (req.user.role === 'Customer') {
    return next(new AppError('Customers cannot manually confirm bookings', 403));
  }

  booking.status = 'Confirmed';
  booking.payment.status = 'Completed'; // Giả sử confirm là đã thanh toán
  booking.confirmedAt = Date.now();
  await booking.save();

  // Update Revenue/Transaction status here if needed

  res.status(200).json({
    success: true,
    data: { booking }
  });
});

/**
 * 6. CANCEL BOOKING
 */
exports.cancelBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));

  // Access Control
  const isOwner = booking.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'Admin';
  
  if (!isOwner && !isAdmin) {
    return next(new AppError('You are not allowed to cancel this booking', 403));
  }

  // Business Rule: Check cancellation policy (Virtual field canBeCancelled)
  // Nếu là Customer thì phải check rule, Admin thì bypass
  if (isOwner && !isAdmin && !booking.canBeCancelled) {
    return next(new AppError('Booking cannot be cancelled (too close to check-in date or policy restriction)', 400));
  }

  await booking.cancelBooking(req.body.reason || 'User requested cancellation', req.user._id);

  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully',
    data: { booking }
  });
});

/**
 * 7. STAFF OPERATIONS (Check-in / Check-out)
 */
exports.checkInBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));

  if (booking.status !== 'Confirmed') {
    return next(new AppError(`Cannot check-in. Booking status is ${booking.status}`, 400));
  }

  booking.status = 'CheckedIn';
  booking.checkedInAt = Date.now();
  await booking.save();

  res.status(200).json({ success: true, data: { booking } });
});

exports.checkOutBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));

  booking.status = 'CheckedOut'; // Or 'Completed'
  booking.checkedOutAt = Date.now();
  await booking.save();

  // Trigger: Ask for Review
  // Trigger: Release Room

  res.status(200).json({ success: true, data: { booking } });
});

/**
 * 8. ANALYTICS (Stub for now)
 */
exports.getBookingAnalytics = catchAsync(async (req, res, next) => {
  // Implement aggregation pipeline here later
  res.status(200).json({
    success: true,
    message: 'Analytics feature coming soon'
  });
});