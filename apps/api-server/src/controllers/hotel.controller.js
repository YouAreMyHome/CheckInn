/**
 * Hotel Controller for CheckInn Hotel Booking Platform
 * 
 * Business logic implementation for hotel management
 * 
 * @author CheckInn Team
 * @version 2.0.0
 */

const Hotel = require('../models/Hotel.model');
const Room = require('../models/Room.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

/**
 * Get all hotels with filtering and pagination
 */
const getAllHotels = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    category,
    city,
    minRating,
    maxPrice,
    minPrice,
    sortBy = '-stats.averageRating'
  } = req.query;

  const options = {
    category,
    city,
    minRating: parseFloat(minRating) || 0,
    maxPrice: parseFloat(maxPrice),
    minPrice: parseFloat(minPrice),
    limit: parseInt(limit),
    skip: (parseInt(page) - 1) * parseInt(limit),
    sortBy
  };

  const hotels = await Hotel.search(req.query.search, options);
  const total = await Hotel.countDocuments({ status: 'active' });

  res.status(200).json({
    success: true,
    message: 'Hotels retrieved successfully',
    data: {
      hotels,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalHotels: total,
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    }
  });
});

/**
 * Search hotels with advanced filters
 */
const searchHotels = catchAsync(async (req, res, next) => {
  const { q: query, ...filters } = req.query;
  
  if (!query) {
    return next(new AppError('Search query is required', 400));
  }

  const hotels = await Hotel.search(query, filters);

  res.status(200).json({
    success: true,
    message: `Found ${hotels.length} hotels matching "${query}"`,
    data: {
      query,
      hotels,
      count: hotels.length
    }
  });
});

/**
 * Advanced search with multiple criteria
 */
const advancedSearch = catchAsync(async (req, res, next) => {
  const {
    location,
    checkIn,
    checkOut,
    guests = 1,
    rooms = 1,
    ...filters
  } = req.query;

  // Build search criteria
  const searchCriteria = { ...filters };
  
  if (location) {
    searchCriteria.city = location;
  }

  const hotels = await Hotel.search(null, searchCriteria);

  // TODO: Filter by room availability based on dates and capacity
  // This would require checking Room availability

  res.status(200).json({
    success: true,
    message: 'Advanced search completed',
    data: {
      searchCriteria: {
        location,
        checkIn,
        checkOut,
        guests: parseInt(guests),
        rooms: parseInt(rooms)
      },
      hotels,
      count: hotels.length
    }
  });
});

/**
 * Get hotel by ID with detailed information
 */
const getHotelById = catchAsync(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id)
    .populate('owner', 'name email phone')
    .populate('roomCount')
    .populate('availableRooms');

  if (!hotel) {
    return next(new AppError('Hotel not found', 404));
  }

  // Increment view count (optional analytics)
  // hotel.stats.viewCount = (hotel.stats.viewCount || 0) + 1;
  // await hotel.save();

  res.status(200).json({
    success: true,
    message: 'Hotel details retrieved successfully',
    data: { hotel }
  });
});

/**
 * Create new hotel (Business owners only)
 */
const createHotel = catchAsync(async (req, res, next) => {
  // Add owner from authenticated user
  req.body.owner = req.user._id;
  
  // Set initial status
  req.body.status = 'pending';
  
  const hotel = await Hotel.create(req.body);
  
  await hotel.populate('owner', 'name email');

  res.status(201).json({
    success: true,
    message: 'Hotel created successfully. Pending verification.',
    data: { hotel }
  });
});

/**
 * Update hotel (Owner or Admin only)
 */
const updateHotel = catchAsync(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return next(new AppError('Hotel not found', 404));
  }

  // Check ownership (implemented in middleware or here)
  if (!hotel.isOwner(req.user._id) && req.user.role !== 'Admin') {
    return next(new AppError('You can only update your own hotels', 403));
  }

  // Prevent status changes by non-admin users
  if (req.body.status && req.user.role !== 'Admin') {
    delete req.body.status;
  }

  Object.assign(hotel, req.body);
  await hotel.save();

  res.status(200).json({
    success: true,
    message: 'Hotel updated successfully',
    data: { hotel }
  });
});

/**
 * Delete hotel (Owner or Admin only)
 */
const deleteHotel = catchAsync(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return next(new AppError('Hotel not found', 404));
  }

  // Check ownership
  if (!hotel.isOwner(req.user._id) && req.user.role !== 'Admin') {
    return next(new AppError('You can only delete your own hotels', 403));
  }

  // Soft delete - change status to inactive
  hotel.status = 'inactive';
  await hotel.save();

  res.status(200).json({
    success: true,
    message: 'Hotel deleted successfully',
    data: null
  });
});

/**
 * Find nearby hotels using geospatial search
 */
const findNearbyHotels = catchAsync(async (req, res, next) => {
  const { lat, lng, maxDistance = 10000 } = req.query;

  if (!lat || !lng) {
    return next(new AppError('Latitude and longitude are required', 400));
  }

  const hotels = await Hotel.findNearby(
    [parseFloat(lng), parseFloat(lat)], 
    parseInt(maxDistance)
  );

  res.status(200).json({
    success: true,
    message: `Found ${hotels.length} nearby hotels`,
    data: {
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      maxDistance: parseInt(maxDistance),
      hotels
    }
  });
});

/**
 * Get hotels within a specific distance
 */
const getHotelsWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const hotels = await Hotel.find({
    'location.coordinates': {
      $geoWithin: { $centerSphere: [[lng, lat], radius] }
    },
    status: 'active'
  });

  res.status(200).json({
    success: true,
    message: `Hotels within ${distance} ${unit} of ${lat}, ${lng}`,
    data: {
      count: hotels.length,
      hotels
    }
  });
});

/**
 * Get featured hotels
 */
const getFeaturedHotels = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  
  const hotels = await Hotel.find({
    status: 'active',
    isFeatured: true
  })
  .sort('-stats.averageRating')
  .limit(limit)
  .populate('owner', 'name');

  res.status(200).json({
    success: true,
    message: 'Featured hotels retrieved',
    data: { hotels }
  });
});

/**
 * Get top rated hotels
 */
const getTopRatedHotels = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  
  const hotels = await Hotel.find({
    status: 'active',
    'stats.averageRating': { $gte: 4.0 },
    'stats.totalReviews': { $gte: 5 }
  })
  .sort('-stats.averageRating -stats.totalReviews')
  .limit(limit);

  res.status(200).json({
    success: true,
    message: 'Top rated hotels retrieved',
    data: { hotels }
  });
});

/**
 * Get hotel amenities
 */
const getHotelAmenities = catchAsync(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id).select('amenities name');

  if (!hotel) {
    return next(new AppError('Hotel not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Hotel amenities retrieved',
    data: {
      hotelName: hotel.name,
      amenities: hotel.amenities
    }
  });
});

/**
 * Get hotel reviews (delegated to Review controller)
 */
const getHotelReviews = catchAsync(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id).select('name stats.averageRating stats.totalReviews');

  if (!hotel) {
    return next(new AppError('Hotel not found', 404));
  }

  // This would typically populate reviews, but for now return basic info
  res.status(200).json({
    success: true,
    message: 'Hotel reviews retrieved',
    data: {
      hotelName: hotel.name,
      ratingStats: {
        averageRating: hotel.stats.averageRating,
        totalReviews: hotel.stats.totalReviews
      },
      reviews: [] // TODO: Populate from Review model
    }
  });
});

/**
 * Get hotel rooms
 */
const getHotelRooms = catchAsync(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return next(new AppError('Hotel not found', 404));
  }

  // TODO: Get rooms from Room model
  const rooms = []; // await Room.find({ hotel: req.params.id, status: 'available' });

  res.status(200).json({
    success: true,
    message: 'Hotel rooms retrieved',
    data: {
      hotelName: hotel.name,
      rooms
    }
  });
});

/**
 * ADMIN FUNCTIONS
 */

/**
 * Toggle hotel verification status (Admin only)
 */
const toggleHotelStatus = catchAsync(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return next(new AppError('Hotel not found', 404));
  }

  const { status, isVerified, isFeatured } = req.body;

  if (status) hotel.status = status;
  if (typeof isVerified === 'boolean') hotel.isVerified = isVerified;
  if (typeof isFeatured === 'boolean') hotel.isFeatured = isFeatured;

  await hotel.save();

  res.status(200).json({
    success: true,
    message: 'Hotel status updated successfully',
    data: { 
      hotel: {
        _id: hotel._id,
        name: hotel.name,
        status: hotel.status,
        isVerified: hotel.isVerified,
        isFeatured: hotel.isFeatured
      }
    }
  });
});

/**
 * Get hotel analytics
 */
const getHotelAnalytics = catchAsync(async (req, res, next) => {
  const hotelId = req.params.id;
  
  const hotel = await Hotel.findById(hotelId);
  
  if (!hotel) {
    return next(new AppError('Hotel not found', 404));
  }

  const analytics = {
    basicStats: {
      totalBookings: hotel.stats.totalBookings,
      averageRating: hotel.stats.averageRating,
      totalReviews: hotel.stats.totalReviews,
      responseRate: hotel.stats.responseRate
    },
    // TODO: Add more analytics from booking data
    monthlyBookings: [],
    revenueData: [],
    occupancyRate: 0
  };

  res.status(200).json({
    success: true,
    message: 'Hotel analytics retrieved',
    data: { analytics }
  });
});

// Additional helper methods
const setHotelImage = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Image upload functionality - To be implemented',
    data: { message: 'Use file upload middleware here' }
  });
});

const getNearbyHotels = getAllHotels; // Alias
const addToFavorites = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Favorites functionality - To be implemented with User model'
  });
});

const removeFromFavorites = addToFavorites; // Alias

// Placeholder methods for complex features
const uploadHotelImages = setHotelImage;
const deleteHotelImage = setHotelImage;
const getPerformanceAnalytics = getHotelAnalytics;
const getRevenueAnalytics = getHotelAnalytics;
const getPlatformAnalytics = getHotelAnalytics;

module.exports = {
  getAllHotels,
  searchHotels,
  advancedSearch,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  findNearbyHotels,
  getHotelsWithin,
  getFeaturedHotels,
  getTopRatedHotels,
  getHotelAmenities,
  getHotelReviews,
  getHotelRooms,
  toggleHotelStatus,
  getHotelAnalytics,
  
  // Aliases and placeholders
  getNearbyHotels,
  addToFavorites,
  removeFromFavorites,
  setHotelImage,
  uploadHotelImages,
  deleteHotelImage,
  getPerformanceAnalytics,
  getRevenueAnalytics,
  getPlatformAnalytics
};