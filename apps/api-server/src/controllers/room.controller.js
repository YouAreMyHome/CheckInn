/**
 * Room Controller for CheckInn Hotel Booking Platform
 * Implemented Logic: CRUD, Availability Check, Dynamic Pricing
 */
const Room = require('../models/Room.model');
const Hotel = require('../models/Hotel.model');
const Booking = require('../models/Booking.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// --- HELPER: Check Ownership ---
const checkHotelOwnership = async (hotelId, userId, userRole) => {
  if (userRole === 'Admin') return true;
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) throw new AppError('Hotel not found', 404);
  if (hotel.owner.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to perform this action on this hotel', 403);
  }
  return hotel;
};

/**
 * 1. CREATE ROOM
 * Logic: Chỉ Owner/Admin mới được tạo. Validate số lượng giường.
 */
exports.createRoom = catchAsync(async (req, res, next) => {
  const { hotel } = req.body;

  // 1. Validate Ownership
  await checkHotelOwnership(hotel, req.user.id, req.user.role);

  // 2. Create Room
  const newRoom = await Room.create(req.body);

  // 3. Update Hotel Stats (Optional but recommended for consistency)
  // Logic này có thể dùng hooks trong Model, nhưng trigger ở đây cho rõ ràng
  await Hotel.findByIdAndUpdate(hotel, { $inc: { 'stats.totalRooms': 1 } });

  res.status(201).json({
    success: true,
    data: { room: newRoom }
  });
});

/**
 * 2. GET AVAILABLE ROOMS (SEARCH ENGINE CORE)
 * Logic: Tìm phòng chưa bị book trong khoảng ngày user chọn
 */
exports.getAvailableRooms = catchAsync(async (req, res, next) => {
  const { hotelId, checkIn, checkOut, guests } = req.query;

  if (!hotelId || !checkIn || !checkOut) {
    return next(new AppError('Please provide hotelId, checkIn and checkOut dates', 400));
  }

  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);

  // 1. Tìm các Booking bị trùng ngày (Overlapping Bookings)
  // Logic: (StartA < EndB) && (EndA > StartB)
  const bookedRoomIds = await Booking.find({
    hotel: hotelId,
    status: { $in: ['Confirmed', 'CheckedIn'] },
    $or: [
      { checkIn: { $lt: endDate }, checkOut: { $gt: startDate } }
    ]
  }).distinct('room'); // Chỉ lấy mảng ID phòng

  // 2. Query Rooms: Thuộc khách sạn này AND Không nằm trong bookedRoomIds
  const query = {
    hotel: hotelId,
    status: 'available',
    isActive: true,
    _id: { $nin: bookedRoomIds } // EXCLUDE booked rooms
  };

  // Filter capacity if provided
  if (guests) {
    query['capacity.totalGuests'] = { $gte: parseInt(guests) };
  }

  const rooms = await Room.find(query);

  // 3. Calculate Dynamic Price for each room (Virtual field logic in Model)
  // Frontend cần biết giá chính xác cho khoảng ngày này
  const roomsWithPrice = rooms.map(room => {
    const priceDetails = room.calculatePrice(startDate, endDate, guests || 1);
    return {
      ...room.toObject(),
      currentBookingPrice: priceDetails // Trả về chi tiết giá (Total, Tax, etc.)
    };
  });

  res.status(200).json({
    success: true,
    count: rooms.length,
    data: { rooms: roomsWithPrice }
  });
});

/**
 * 3. UPDATE ROOM
 */
exports.updateRoom = catchAsync(async (req, res, next) => {
  const room = await Room.findById(req.params.id);
  if (!room) return next(new AppError('Room not found', 404));

  // Check Owner
  await checkHotelOwnership(room.hotel, req.user.id, req.user.role);

  // Update
  const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: { room: updatedRoom }
  });
});

/**
 * 4. DELETE ROOM (Soft Delete or Hard Delete?)
 * Khuyến nghị: Soft Delete (set status = 'out-of-service') nếu đã có booking lịch sử.
 */
exports.deleteRoom = catchAsync(async (req, res, next) => {
  const room = await Room.findById(req.params.id);
  if (!room) return next(new AppError('Room not found', 404));

  await checkHotelOwnership(room.hotel, req.user.id, req.user.role);

  // Check if room has future bookings?
  const futureBookings = await Booking.findOne({
    room: room._id,
    checkIn: { $gte: new Date() },
    status: { $in: ['Confirmed', 'Pending'] }
  });

  if (futureBookings) {
    return next(new AppError('Cannot delete room with active future bookings. Please cancel bookings first.', 400));
  }

  await Room.findByIdAndDelete(req.params.id);
  // await Hotel.findByIdAndUpdate(room.hotel, { $inc: { 'stats.totalRooms': -1 } });

  res.status(204).json({
    success: true,
    data: null
  });
});

/**
 * 5. GET ROOMS BY HOTEL (For Partner Dashboard)
 */
exports.getRoomsByHotel = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Room.find({ hotel: req.params.hotelId }), 
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const rooms = await features.query;

  res.status(200).json({
    success: true,
    count: rooms.length,
    data: { rooms }
  });
});

// Alias for getRoomById
exports.getRoomById = catchAsync(async (req, res, next) => {
  const room = await Room.findById(req.params.id).populate('hotel', 'name location');
  if (!room) return next(new AppError('Room not found', 404));

  res.status(200).json({
    success: true,
    data: { room }
  });
});

// --- Exports ---
module.exports = {
  createRoom: exports.createRoom,
  getAvailableRooms: exports.getAvailableRooms, // Route: GET /api/rooms/availability
  updateRoom: exports.updateRoom,
  deleteRoom: exports.deleteRoom,
  getRoomsByHotel: exports.getRoomsByHotel,
  getRoomById: exports.getRoomById,
  // Keep empty placeholders for features not yet implemented to avoid crash
  bulkUpdateStatus: (req, res) => res.status(501).json({ message: 'Not Implemented' }),
  getRoomAnalytics: (req, res) => res.status(501).json({ message: 'Not Implemented' })
};