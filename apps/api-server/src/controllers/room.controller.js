/**
 * Room Controller for CheckInn Hotel Booking Platform
 * 
 * Manages room operations với availability checking, dynamic pricing,
 * inventory management, và booking logic
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const Room = require('../models/Room.model');
const Hotel = require('../models/Hotel.model');
const Booking = require('../models/Booking.model');
const ActivityTracker = require('../utils/activityTracker');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIResponse = require('../utils/apiResponse');
const mongoose = require('mongoose');

/**
 * Room Controller Class
 * Comprehensive room management với business logic
 */
class RoomController {

  /**
   * ============================================================================
   * ROOM CRUD OPERATIONS
   * ============================================================================
   */

  /**
   * Create new room
   * POST /api/rooms
   */
  static createRoom = catchAsync(async (req, res, next) => {
    const roomData = req.body;

    // Verify hotel ownership
    const hotel = await Hotel.findById(roomData.hotel);
    if (!hotel) {
      return next(new AppError('Hotel not found', 404));
    }

    // Check ownership (owner or admin can create rooms)
    if (hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('You do not have permission to add rooms to this hotel', 403));
    }

    // Create room
    const room = await Room.create(roomData);
    
    // Update hotel total rooms count
    await Hotel.findByIdAndUpdate(
      roomData.hotel,
      { $inc: { totalRooms: 1, availableRooms: 1 } }
    );

    // Populate hotel info
    await room.populate('hotel', 'name location');

    // Track room creation
    await ActivityTracker.trackActivity({
      activityType: 'room_create',
      req,
      userId: req.user._id,
      customData: {
        roomId: room._id,
        hotelId: room.hotel._id,
        roomType: room.type
      }
    });

    APIResponse.success(res, {
      message: 'Room created successfully',
      data: { room }
    }, 201);
  });

  /**
   * Get rooms with advanced filtering
   * GET /api/rooms
   */
  static getAllRooms = catchAsync(async (req, res, next) => {
    const {
      // Pagination
      page = 1,
      limit = 12,
      
      // Filters
      hotelId,
      type,
      minPrice,
      maxPrice,
      capacity,
      amenities,
      status = 'Available',
      
      // Availability check
      checkIn,
      checkOut,
      
      // Sort
      sortBy = 'pricing.basePrice',
      sortOrder = 'asc'
    } = req.query;

    let query = Room.find({ isActive: true });

    // Hotel filter
    if (hotelId) {
      if (!mongoose.isValidObjectId(hotelId)) {
        return next(new AppError('Invalid hotel ID', 400));
      }
      query = query.where('hotel', hotelId);
    }

    // Basic filters
    if (type) query = query.where('type', type);
    if (capacity) query = query.where('capacity').gte(parseInt(capacity));
    if (status) query = query.where('status', status);

    // Price range filter
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      query = query.where('pricing.basePrice', priceFilter);
    }

    // Amenities filter
    if (amenities) {
      const amenityList = Array.isArray(amenities) ? amenities : [amenities];
      query = query.where('amenities').in(amenityList);
    }

    // Availability filter
    if (checkIn && checkOut) {
      const availableRoomIds = await this.getAvailableRoomIds(
        new Date(checkIn), 
        new Date(checkOut)
      );
      query = query.where('_id').in(availableRoomIds);
    }

    // Count total
    const total = await Room.countDocuments(query.getFilter());

    // Execute query with pagination
    const rooms = await query
      .populate('hotel', 'name location starRating')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Track search
    await ActivityTracker.trackSearch(req, req.user?._id, {
      query: 'rooms',
      filters: { hotelId, type, minPrice, maxPrice, capacity },
      resultsCount: rooms.length
    });

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalRooms: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    APIResponse.success(res, {
      data: { rooms, pagination }
    });
  });

  /**
   * Get room by ID with availability info
   * GET /api/rooms/:id
   */
  static getRoomById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { checkIn, checkOut } = req.query;

    if (!mongoose.isValidObjectId(id)) {
      return next(new AppError('Invalid room ID', 400));
    }

    const room = await Room.findById(id)
      .populate('hotel', 'name location contact policies')
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'name avatar' },
        options: { limit: 10, sort: { createdAt: -1 } }
      });

    if (!room) {
      return next(new AppError('Room not found', 404));
    }

    // Check availability if dates provided
    let availability = null;
    if (checkIn && checkOut) {
      const isAvailable = await room.isAvailableForPeriod(
        new Date(checkIn), 
        new Date(checkOut)
      );
      
      const price = room.calculatePrice(new Date(checkIn), new Date(checkOut));
      
      availability = {
        isAvailable,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        nights: Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)),
        totalPrice: price
      };
    }

    // Increment view count
    await Room.findByIdAndUpdate(id, { $inc: { views: 1 } });

    // Track room view
    await ActivityTracker.trackProductView(req, req.user?._id, {
      type: 'room',
      hotelId: room.hotel._id,
      roomId: id,
      duration: 0
    });

    APIResponse.success(res, {
      data: { 
        room,
        availability
      }
    });
  });

  /**
   * Update room
   * PATCH /api/rooms/:id
   */
  static updateRoom = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updates = req.body;

    const room = await Room.findById(id).populate('hotel');
    if (!room) {
      return next(new AppError('Room not found', 404));
    }

    // Check ownership
    if (room.hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('You do not have permission to update this room', 403));
    }

    // Prevent updating protected fields
    const protectedFields = ['hotel', 'totalBookings', 'views', 'totalReviews'];
    protectedFields.forEach(field => delete updates[field]);

    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('hotel', 'name location');

    // Track update
    await ActivityTracker.trackActivity({
      activityType: 'room_update',
      req,
      userId: req.user._id,
      customData: {
        roomId: id,
        updatedFields: Object.keys(updates)
      }
    });

    APIResponse.success(res, {
      message: 'Room updated successfully',
      data: { room: updatedRoom }
    });
  });

  /**
   * Delete room (soft delete)
   * DELETE /api/rooms/:id
   */
  static deleteRoom = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const room = await Room.findById(id).populate('hotel');
    if (!room) {
      return next(new AppError('Room not found', 404));
    }

    // Check ownership
    if (room.hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('You do not have permission to delete this room', 403));
    }

    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      room: id,
      status: { $in: ['Confirmed', 'CheckedIn'] }
    });

    if (activeBookings > 0) {
      return next(new AppError('Cannot delete room with active bookings', 400));
    }

    // Soft delete
    await Room.findByIdAndUpdate(id, { 
      isActive: false,
      status: 'OutOfOrder'
    });

    // Update hotel room counts
    await Hotel.findByIdAndUpdate(
      room.hotel._id,
      { 
        $inc: { 
          totalRooms: -1,
          availableRooms: room.status === 'Available' ? -1 : 0
        }
      }
    );

    // Track deletion
    await ActivityTracker.trackActivity({
      activityType: 'room_delete',
      req,
      userId: req.user._id,
      customData: {
        roomId: id,
        hotelId: room.hotel._id
      }
    });

    APIResponse.success(res, {
      message: 'Room deleted successfully'
    });
  });

  /**
   * ============================================================================
   * AVAILABILITY & PRICING
   * ============================================================================
   */

  /**
   * Check room availability for specific dates
   * POST /api/rooms/check-availability
   */
  static checkAvailability = catchAsync(async (req, res, next) => {
    const { 
      roomIds, 
      hotelId, 
      checkIn, 
      checkOut, 
      guests = 1 
    } = req.body;

    if (!checkIn || !checkOut) {
      return next(new AppError('Check-in and check-out dates are required', 400));
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return next(new AppError('Check-out date must be after check-in date', 400));
    }

    let query = { isActive: true, status: 'Available' };
    
    // Filter by specific rooms or hotel
    if (roomIds && roomIds.length > 0) {
      query._id = { $in: roomIds };
    } else if (hotelId) {
      query.hotel = hotelId;
    }

    // Filter by capacity
    if (guests > 1) {
      query.capacity = { $gte: guests };
    }

    const rooms = await Room.find(query).populate('hotel', 'name location');

    // Check availability for each room
    const availabilityResults = await Promise.all(
      rooms.map(async (room) => {
        const isAvailable = await room.isAvailableForPeriod(checkInDate, checkOutDate);
        const price = isAvailable ? room.calculatePrice(checkInDate, checkOutDate) : null;
        
        return {
          room: {
            _id: room._id,
            name: room.name,
            type: room.type,
            capacity: room.capacity,
            amenities: room.amenities,
            images: room.images,
            hotel: room.hotel,
            pricing: room.pricing
          },
          isAvailable,
          totalPrice: price,
          nights: Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
        };
      })
    );

    // Track availability check
    await ActivityTracker.trackActivity({
      activityType: 'availability_check',
      req,
      userId: req.user?._id,
      customData: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        roomsChecked: rooms.length
      }
    });

    APIResponse.success(res, {
      data: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        availability: availabilityResults
      }
    });
  });

  /**
   * Get pricing for rooms in date range
   * POST /api/rooms/pricing
   */
  static getRoomPricing = catchAsync(async (req, res, next) => {
    const { roomId, checkIn, checkOut, promoCode } = req.body;

    if (!roomId || !checkIn || !checkOut) {
      return next(new AppError('Room ID, check-in and check-out dates are required', 400));
    }

    const room = await Room.findById(roomId).populate('hotel', 'name policies');
    if (!room) {
      return next(new AppError('Room not found', 404));
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    // Calculate base price
    const basePrice = room.calculatePrice(checkInDate, checkOutDate);
    
    // Calculate additional fees
    const pricing = {
      basePrice,
      nights,
      subtotal: basePrice,
      
      // Taxes and fees
      taxes: Math.round(basePrice * 0.1), // 10% tax
      serviceFee: Math.round(basePrice * 0.05), // 5% service fee
      
      // Discounts
      discount: 0,
      promoDiscount: 0,
      
      // Total
      total: 0
    };

    // Apply promo code if provided
    if (promoCode) {
      // TODO: Implement promo code logic
      const promoDiscount = await this.calculatePromoDiscount(promoCode, basePrice);
      pricing.promoDiscount = promoDiscount;
    }

    // Calculate total
    pricing.total = pricing.subtotal + pricing.taxes + pricing.serviceFee - 
                    pricing.discount - pricing.promoDiscount;

    // Track pricing request
    await ActivityTracker.trackActivity({
      activityType: 'pricing_check',
      req,
      userId: req.user?._id,
      customData: {
        roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice: pricing.total
      }
    });

    APIResponse.success(res, {
      data: {
        room: {
          _id: room._id,
          name: room.name,
          type: room.type,
          hotel: room.hotel
        },
        period: {
          checkIn: checkInDate,
          checkOut: checkOutDate,
          nights
        },
        pricing
      }
    });
  });

  /**
   * ============================================================================
   * ROOM MANAGEMENT FEATURES
   * ============================================================================
   */

  /**
   * Bulk update room status
   * PATCH /api/rooms/bulk-status
   */
  static bulkUpdateStatus = catchAsync(async (req, res, next) => {
    const { roomIds, status, reason } = req.body;

    if (!roomIds || !Array.isArray(roomIds) || roomIds.length === 0) {
      return next(new AppError('Room IDs array is required', 400));
    }

    const validStatuses = ['Available', 'Occupied', 'Maintenance', 'OutOfOrder', 'Cleaning'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    // Check if user has permission for all rooms
    const rooms = await Room.find({ _id: { $in: roomIds } }).populate('hotel', 'owner');
    
    const unauthorizedRooms = rooms.filter(room => 
      room.hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin'
    );

    if (unauthorizedRooms.length > 0) {
      return next(new AppError('You do not have permission to update some rooms', 403));
    }

    // Update rooms
    const result = await Room.updateMany(
      { _id: { $in: roomIds } },
      { 
        status,
        lastStatusUpdate: new Date(),
        statusReason: reason
      }
    );

    // Track bulk update
    await ActivityTracker.trackActivity({
      activityType: 'room_bulk_update',
      req,
      userId: req.user._id,
      customData: {
        roomIds,
        newStatus: status,
        reason,
        updatedCount: result.modifiedCount
      }
    });

    APIResponse.success(res, {
      message: `${result.modifiedCount} rooms updated successfully`,
      data: {
        updatedCount: result.modifiedCount,
        status,
        reason
      }
    });
  });

  /**
   * Get room occupancy report
   * GET /api/rooms/occupancy-report
   */
  static getOccupancyReport = catchAsync(async (req, res, next) => {
    const { 
      hotelId, 
      startDate, 
      endDate, 
      groupBy = 'day' 
    } = req.query;

    if (hotelId) {
      // Check hotel ownership
      const hotel = await Hotel.findById(hotelId);
      if (hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        return next(new AppError('Access denied', 403));
      }
    }

    const matchStage = {};
    if (hotelId) matchStage.hotel = mongoose.Types.ObjectId(hotelId);

    const dateFormat = groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';

    const occupancyData = await Booking.aggregate([
      {
        $match: {
          ...matchStage,
          checkIn: { $gte: new Date(startDate) },
          checkOut: { $lte: new Date(endDate) },
          status: { $in: ['Confirmed', 'CheckedIn', 'CheckedOut', 'Completed'] }
        }
      },
      {
        $lookup: {
          from: 'rooms',
          localField: 'room',
          foreignField: '_id',
          as: 'roomInfo'
        }
      },
      {
        $unwind: '$roomInfo'
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: dateFormat, date: '$checkIn' } },
            hotel: '$hotel'
          },
          occupiedRooms: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalAmount' },
          avgRoomRate: { $avg: '$pricing.totalAmount' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    APIResponse.success(res, {
      data: {
        period: { startDate, endDate, groupBy },
        occupancy: occupancyData
      }
    });
  });

  /**
   * ============================================================================
   * HELPER METHODS
   * ============================================================================
   */

  /**
   * Get available room IDs for date range
   */
  static async getAvailableRoomIds(checkInDate, checkOutDate) {
    // Find rooms that are NOT booked during the period
    const bookedRooms = await Booking.distinct('room', {
      status: { $in: ['Confirmed', 'CheckedIn'] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate }
        }
      ]
    });

    // Return available rooms
    return Room.distinct('_id', {
      _id: { $nin: bookedRooms },
      isActive: true,
      status: 'Available'
    });
  }

  /**
   * Calculate promo code discount
   */
  static async calculatePromoDiscount(promoCode, basePrice) {
    // TODO: Implement promo code logic
    // This would check against a PromoCode model
    return 0;
  }

  /**
   * Get room analytics
   */
  static getRoomAnalytics = catchAsync(async (req, res, next) => {
    const { roomId } = req.params;
    const { period = 30 } = req.query;

    const room = await Room.findById(roomId).populate('hotel', 'owner');
    if (!room) {
      return next(new AppError('Room not found', 404));
    }

    // Check permission
    if (room.hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('Access denied', 403));
    }

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (period * 24 * 60 * 60 * 1000));

    const analytics = await Booking.aggregate([
      {
        $match: {
          room: mongoose.Types.ObjectId(roomId),
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalAmount' },
          avgBookingValue: { $avg: '$pricing.totalAmount' },
          occupancyDays: { $sum: '$nights' }
        }
      }
    ]);

    const occupancyRate = analytics[0] ? 
      (analytics[0].occupancyDays / period * 100).toFixed(1) : 0;

    APIResponse.success(res, {
      data: {
        period: { days: period },
        analytics: analytics[0] || {},
        occupancyRate: parseFloat(occupancyRate)
      }
    });
  });
}

module.exports = RoomController;