
/**
 * Hotel Controller for CheckInn Hotel Booking Platform
 * 
 * Enhanced hotel management với geospatial search, advanced filters,
 * performance optimization, và comprehensive business logic
 * 
 * @author CheckInn Team
 * @version 2.0.0
 */

const Hotel = require('../models/Hotel.model');
const Room = require('../models/Room.model');
const Review = require('../models/Review.model');
const ActivityTracker = require('../utils/activityTracker');
const AnalyticsHelper = require('../utils/analyticsHelper');
const { sendResponse } = require('../utils/apiResponse');
const APIFeatures = require('../utils/apiFeatures');
const APIResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

/**
 * Hotel Controller Class
 * Enhanced với advanced search, geospatial queries, và analytics
 */
class HotelController {

  /**
   * ============================================================================
   * HOTEL CRUD OPERATIONS
   * ============================================================================
   */

  /**
   * Create new hotel
   * POST /api/hotels
   */
  static createHotel = catchAsync(async (req, res, next) => {
    // Ensure owner is set to current user
    const hotelData = { 
      ...req.body, 
      owner: req.user._id,
      isActive: true,
      isVerified: req.user.role === 'Admin' // Auto-verify if admin creates
    };

    // Validate required fields
    if (!hotelData.location?.coordinates || hotelData.location.coordinates.length !== 2) {
      return next(new AppError('Valid coordinates [longitude, latitude] are required', 400));
    }

    // Create hotel
    const newHotel = await Hotel.create(hotelData);

    // Populate owner info
    await newHotel.populate('owner', 'name email');

    // Track hotel creation
    await ActivityTracker.trackActivity({
      activityType: 'hotel_create',
      req,
      userId: req.user._id,
      customData: {
        hotelId: newHotel._id,
        hotelName: newHotel.name
      }
    });

    APIResponse.success(res, {
      message: 'Hotel created successfully',
      data: { hotel: newHotel }
    }, 201);
  });

  /**
   * Get all hotels with advanced filtering
   * GET /api/hotels
   */
  static getAllHotels = catchAsync(async (req, res, next) => {
    const {
      // Pagination
      page = 1,
      limit = 12,
      
      // Location-based search
      latitude,
      longitude,
      radius = 50, // km
      
      // Basic filters
      city,
      country,
      minPrice,
      maxPrice,
      starRating,
      amenities,
      
      // Advanced filters
      minRating = 0,
      availability,
      roomTypes,
      
      // Search & Sort
      search,
      sortBy = 'averageRating',
      sortOrder = 'desc'
    } = req.query;

    let query = Hotel.find({ isActive: true });
    let aggregationPipeline = [];

    // Geospatial search if coordinates provided
    if (latitude && longitude) {
      const nearbyHotels = await Hotel.findNearby(
        parseFloat(longitude), 
        parseFloat(latitude), 
        parseInt(radius)
      );
      
      const hotelIds = nearbyHotels.map(h => h._id);
      query = query.where('_id').in(hotelIds);
      
      // Track geospatial search
      await ActivityTracker.trackSearch(req, req.user?._id, {
        location: `${latitude},${longitude}`,
        radius: radius,
        resultsCount: hotelIds.length
      });
    }

    // Location filters
    if (city) {
      query = query.where('location.city').regex(new RegExp(city, 'i'));
    }
    if (country) {
      query = query.where('location.country').regex(new RegExp(country, 'i'));
    }

    // Price range filter
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseInt(minPrice);
      if (maxPrice) priceFilter.$lte = parseInt(maxPrice);
      query = query.where('priceRange.min').gte(priceFilter.$gte || 0);
      if (priceFilter.$lte) {
        query = query.where('priceRange.max').lte(priceFilter.$lte);
      }
    }

    // Star rating filter
    if (starRating) {
      const ratings = Array.isArray(starRating) ? starRating : [starRating];
      query = query.where('starRating').in(ratings.map(r => parseInt(r)));
    }

    // Average rating filter
    if (minRating > 0) {
      query = query.where('averageRating').gte(parseFloat(minRating));
    }

    // Amenities filter
    if (amenities) {
      const amenityList = Array.isArray(amenities) ? amenities : [amenities];
      query = query.where('amenities').in(amenityList);
    }

    // Text search
    if (search) {
      query = query.where({
        $text: { $search: search }
      });
    }

    // Availability filter (requires room availability check)
    if (availability) {
      const availableHotelIds = await this.getAvailableHotels(availability);
      query = query.where('_id').in(availableHotelIds);
    }

    // Count total for pagination
    const total = await Hotel.countDocuments(query.getFilter());

    // Apply sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Secondary sort by rating if not primary
    if (sortBy !== 'averageRating') {
      sortOptions.averageRating = -1;
    }

    // Execute query with pagination
    const hotels = await query
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('owner', 'name')
      .select('-__v');

    // Track search activity
    await ActivityTracker.trackSearch(req, req.user?._id, {
      query: search,
      filters: { city, country, starRating, amenities, minPrice, maxPrice },
      resultsCount: hotels.length,
      sortBy,
      page
    });

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalHotels: total,
      limit: parseInt(limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    APIResponse.success(res, {
      data: {
        hotels,
        pagination,
        searchMeta: {
          query: search,
          filters: { city, country, starRating, minRating },
          resultCount: hotels.length
        }
      }
    });
  });

  /**
   * Get hotel by ID with comprehensive details
   * GET /api/hotels/:id
   */
  static getHotelById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { includeRooms = true, includeReviews = true } = req.query;

    if (!mongoose.isValidObjectId(id)) {
      return next(new AppError('Invalid hotel ID', 400));
    }

    let hotel = await Hotel.findById(id)
      .populate('owner', 'name email phone')
      .populate({
        path: 'rooms',
        match: { isActive: true },
        select: 'name type capacity pricing status images amenities',
        options: { sort: { 'pricing.basePrice': 1 } }
      });

    if (!hotel) {
      return next(new AppError('Hotel not found', 404));
    }

    // Include recent reviews if requested
    if (includeReviews) {
      hotel = await hotel.populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'name avatar'
        },
        options: { limit: 10, sort: { createdAt: -1 } }
      });
    }

    // Increment view count
    await Hotel.findByIdAndUpdate(id, { $inc: { views: 1 } });

    // Track hotel view
    await ActivityTracker.trackProductView(req, req.user?._id, {
      type: 'hotel',
      hotelId: id,
      duration: 0 // Will be updated by frontend
    });

    APIResponse.success(res, {
      data: { hotel }
    });
  });

  /**
   * Update hotel
   * PATCH /api/hotels/:id
   */
  static updateHotel = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updates = req.body;

    // Check if hotel exists and user has permission
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return next(new AppError('Hotel not found', 404));
    }

    // Check ownership or admin rights
    if (hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('You do not have permission to update this hotel', 403));
    }

    // Prevent updating certain protected fields
    const protectedFields = ['owner', 'totalReviews', 'views', 'bookings'];
    protectedFields.forEach(field => delete updates[field]);

    // If non-admin updates hotel, reset verification
    if (req.user.role !== 'Admin' && Object.keys(updates).length > 0) {
      updates.isVerified = false;
      updates.verificationDate = null;
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
        runValidators: true
      }
    ).populate('owner', 'name email');

    // Track hotel update
    await ActivityTracker.trackActivity({
      activityType: 'hotel_update',
      req,
      userId: req.user._id,
      customData: {
        hotelId: id,
        updatedFields: Object.keys(updates)
      }
    });

    APIResponse.success(res, {
      message: 'Hotel updated successfully',
      data: { hotel: updatedHotel }
    });
  });

  /**
   * Delete hotel (soft delete)
   * DELETE /api/hotels/:id
   */
  static deleteHotel = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return next(new AppError('Hotel not found', 404));
    }

    // Check ownership or admin rights
    if (hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('You do not have permission to delete this hotel', 403));
    }

    // Check for active bookings
    const activeBookings = await mongoose.model('Booking').countDocuments({
      hotel: id,
      status: { $in: ['Confirmed', 'CheckedIn'] }
    });

    if (activeBookings > 0) {
      return next(new AppError('Cannot delete hotel with active bookings', 400));
    }

    // Soft delete
    await Hotel.findByIdAndUpdate(id, { 
      isActive: false,
      deletedAt: new Date()
    });

    // Track hotel deletion
    await ActivityTracker.trackActivity({
      activityType: 'hotel_delete',
      req,
      userId: req.user._id,
      customData: {
        hotelId: id,
        hotelName: hotel.name
      }
    });

    APIResponse.success(res, {
      message: 'Hotel deleted successfully'
    });
  });

  /**
   * ============================================================================
   * ADVANCED SEARCH & FILTERS
   * ============================================================================
   */

  /**
   * Search hotels with advanced filters and facets
   * POST /api/hotels/search
   */
  static advancedSearch = catchAsync(async (req, res, next) => {
    const {
      // Search criteria
      query = '',
      location,
      checkIn,
      checkOut,
      guests = 1,
      rooms = 1,
      
      // Filters
      priceRange = {},
      starRating = [],
      amenities = [],
      hotelTypes = [],
      
      // Options
      page = 1,
      limit = 12,
      sortBy = 'relevance'
    } = req.body;

    const pipeline = [];

    // Match stage - basic filters
    const matchStage = {
      isActive: true,
      isVerified: true
    };

    // Text search
    if (query.trim()) {
      matchStage.$text = { $search: query };
    }

    // Location filter
    if (location?.coordinates) {
      pipeline.push({
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [location.coordinates[0], location.coordinates[1]]
          },
          distanceField: 'distance',
          maxDistance: (location.radius || 50) * 1000,
          spherical: true,
          query: matchStage
        }
      });
    } else {
      pipeline.push({ $match: matchStage });
    }

    // Price range filter
    if (priceRange.min || priceRange.max) {
      const priceFilter = {};
      if (priceRange.min) priceFilter['priceRange.min'] = { $gte: priceRange.min };
      if (priceRange.max) priceFilter['priceRange.max'] = { $lte: priceRange.max };
      pipeline.push({ $match: priceFilter });
    }

    // Star rating filter
    if (starRating.length > 0) {
      pipeline.push({ $match: { starRating: { $in: starRating } } });
    }

    // Amenities filter
    if (amenities.length > 0) {
      pipeline.push({ $match: { amenities: { $all: amenities } } });
    }

    // Availability filter (if dates provided)
    if (checkIn && checkOut) {
      const availableHotelIds = await this.getHotelsWithAvailability(
        new Date(checkIn), 
        new Date(checkOut), 
        guests,
        rooms
      );
      pipeline.push({ $match: { _id: { $in: availableHotelIds } } });
    }

    // Add room count and availability info
    pipeline.push({
      $lookup: {
        from: 'rooms',
        localField: '_id',
        foreignField: 'hotel',
        as: 'roomsInfo',
        pipeline: [
          { $match: { isActive: true } },
          {
            $group: {
              _id: null,
              totalRooms: { $sum: 1 },
              minPrice: { $min: '$pricing.basePrice' },
              maxPrice: { $max: '$pricing.basePrice' },
              roomTypes: { $addToSet: '$type' }
            }
          }
        ]
      }
    });

    // Sorting
    const sortStage = {};
    switch (sortBy) {
      case 'price_low':
        sortStage['roomsInfo.minPrice'] = 1;
        break;
      case 'price_high':
        sortStage['roomsInfo.minPrice'] = -1;
        break;
      case 'rating':
        sortStage.averageRating = -1;
        break;
      case 'popularity':
        sortStage.views = -1;
        break;
      case 'distance':
        if (location?.coordinates) {
          sortStage.distance = 1;
        } else {
          sortStage.averageRating = -1;
        }
        break;
      default:
        sortStage.averageRating = -1;
    }
    
    pipeline.push({ $sort: sortStage });

    // Pagination
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Project final fields
    pipeline.push({
      $project: {
        name: 1,
        description: 1,
        shortDescription: 1,
        images: 1,
        location: 1,
        amenities: 1,
        starRating: 1,
        averageRating: 1,
        totalReviews: 1,
        priceRange: 1,
        distance: 1,
        roomsInfo: { $arrayElemAt: ['$roomsInfo', 0] }
      }
    });

    // Execute aggregation
    const hotels = await Hotel.aggregate(pipeline);

    // Get total count for pagination
    const countPipeline = pipeline.slice(0, -3); // Remove skip, limit, project
    countPipeline.push({ $count: 'total' });
    const totalResult = await Hotel.aggregate(countPipeline);
    const total = totalResult[0]?.total || 0;

    // Track advanced search
    await ActivityTracker.trackSearch(req, req.user?._id, {
      query,
      location: location?.name,
      checkIn,
      checkOut,
      filters: { priceRange, starRating, amenities },
      resultsCount: hotels.length
    });

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalHotels: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    APIResponse.success(res, {
      data: {
        hotels,
        pagination,
        searchCriteria: {
          query,
          location,
          checkIn,
          checkOut,
          guests,
          rooms
        }
      }
    });
  });

  /**
   * ============================================================================
   * ANALYTICS & INSIGHTS
   * ============================================================================
   */

  /**
   * Get hotel analytics (Owner/Admin)
   * GET /api/hotels/:id/analytics
   */
  static getHotelAnalytics = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { period = 30 } = req.query;

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return next(new AppError('Hotel not found', 404));
    }

    // Check permission
    if (hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('Access denied', 403));
    }

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (period * 24 * 60 * 60 * 1000));

    // Get various analytics
    const [
      viewStats,
      bookingStats,
      revenueStats,
      reviewStats,
      occupancyStats
    ] = await Promise.all([
      this.getViewAnalytics(id, startDate, endDate),
      this.getBookingAnalytics(id, startDate, endDate),
      this.getRevenueAnalytics(id, startDate, endDate),
      this.getReviewAnalytics(id, startDate, endDate),
      this.getOccupancyAnalytics(id, startDate, endDate)
    ]);

    APIResponse.success(res, {
      data: {
        period: { days: period, startDate, endDate },
        views: viewStats,
        bookings: bookingStats,
        revenue: revenueStats,
        reviews: reviewStats,
        occupancy: occupancyStats,
        generatedAt: new Date()
      }
    });
  });

  /**
   * ============================================================================
   * HELPER METHODS
   * ============================================================================
   */

  /**
   * Get hotels with room availability for given dates
   */
  static async getHotelsWithAvailability(checkIn, checkOut, guests, roomsNeeded) {
    const Booking = mongoose.model('Booking');
    
    // Find rooms that are NOT booked during the period
    const unavailableRooms = await Booking.distinct('room', {
      status: { $in: ['Confirmed', 'CheckedIn'] },
      $or: [
        {
          checkIn: { $lt: checkOut },
          checkOut: { $gt: checkIn }
        }
      ]
    });

    // Find available rooms
    const availableRooms = await Room.find({
      _id: { $nin: unavailableRooms },
      isActive: true,
      status: 'Available',
      capacity: { $gte: guests }
    }).select('hotel').lean();

    // Group by hotel and count available rooms
    const hotelAvailability = {};
    availableRooms.forEach(room => {
      const hotelId = room.hotel.toString();
      hotelAvailability[hotelId] = (hotelAvailability[hotelId] || 0) + 1;
    });

    // Return hotels with enough available rooms
    return Object.keys(hotelAvailability)
      .filter(hotelId => hotelAvailability[hotelId] >= roomsNeeded)
      .map(hotelId => mongoose.Types.ObjectId(hotelId));
  }

  /**
   * Get available hotels (simplified version)
   */
  static async getAvailableHotels(availability) {
    // Implementation depends on availability format
    // This is a simplified version
    return Hotel.distinct('_id', { availableRooms: { $gt: 0 } });
  }

  /**
   * Analytics helper methods
   */
  static async getViewAnalytics(hotelId, startDate, endDate) {
    return ActivityTracker.getUserJourney(hotelId); // Placeholder
  }

  static async getBookingAnalytics(hotelId, startDate, endDate) {
    const Booking = mongoose.model('Booking');
    return Booking.aggregate([
      {
        $match: {
          hotel: mongoose.Types.ObjectId(hotelId),
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          bookings: { $sum: 1 },
          revenue: { $sum: '$pricing.totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  static async getRevenueAnalytics(hotelId, startDate, endDate) {
    // Implementation for revenue analytics
    return {};
  }

  static async getReviewAnalytics(hotelId, startDate, endDate) {
    return Review.getReviewStats(hotelId);
  }

  static async getOccupancyAnalytics(hotelId, startDate, endDate) {
    // Implementation for occupancy analytics
    return {};
  }
}

// Export individual methods for backward compatibility
module.exports = HotelController;

// Also export individual methods
exports.createHotel = HotelController.createHotel;
exports.getAllHotels = HotelController.getAllHotels;
exports.getHotelById = HotelController.getHotelById;
exports.updateHotel = HotelController.updateHotel;
exports.deleteHotel = HotelController.deleteHotel;
exports.advancedSearch = HotelController.advancedSearch;
exports.getHotelAnalytics = HotelController.getHotelAnalytics;
