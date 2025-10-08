/**
 * Room Model for CheckInn Hotel Booking Platform
 * 
 * Advanced room management with booking availability
 * 
 * @author CheckInn Team
 * @version 2.0.0
 */

const mongoose = require('mongoose');

// Room amenities schema
const roomAmenitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String },
  description: { type: String }
}, { _id: false });

// Bed configuration schema
const bedConfigSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['single', 'double', 'queen', 'king', 'sofa-bed'],
    required: true 
  },
  count: { 
    type: Number, 
    required: true, 
    min: [1, 'Bed count must be at least 1'] 
  }
}, { _id: false });

// Pricing schema with dynamic rates
const pricingSchema = new mongoose.Schema({
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'VND',
    enum: ['VND', 'USD', 'EUR']
  },
  discountPercent: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  // Seasonal or special pricing
  specialRates: [{
    name: String, // e.g., "Weekend Rate", "Holiday Rate"
    startDate: Date,
    endDate: Date,
    rate: Number,
    isActive: { type: Boolean, default: true }
  }]
}, { _id: false });

// Room images schema
const roomImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String },
  isPrimary: { type: Boolean, default: false }
}, { _id: false });

// Main Room Schema
const roomSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    maxlength: [100, 'Room name cannot exceed 100 characters']
  },
  
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  
  type: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['standard', 'deluxe', 'suite', 'presidential', 'family', 'accessible'],
    index: true
  },
  
  description: {
    type: String,
    required: [true, 'Room description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Hotel Association
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel reference is required'],
    index: true
  },
  
  // Room Specifications
  size: {
    value: { 
      type: Number, 
      required: [true, 'Room size is required'],
      min: [1, 'Room size must be positive'] 
    },
    unit: { 
      type: String, 
      enum: ['sqm', 'sqft'], 
      default: 'sqm' 
    }
  },
  
  capacity: {
    adults: {
      type: Number,
      required: [true, 'Adult capacity is required'],
      min: [1, 'Adult capacity must be at least 1'],
      max: [20, 'Adult capacity cannot exceed 20']
    },
    children: {
      type: Number,
      default: 0,
      min: [0, 'Children capacity cannot be negative'],
      max: [10, 'Children capacity cannot exceed 10']
    },
    totalGuests: {
      type: Number,
      required: true
    }
  },
  
  bedConfiguration: [bedConfigSchema],
  
  // Room Features
  amenities: [roomAmenitySchema],
  
  features: {
    hasBalcony: { type: Boolean, default: false },
    hasSeaView: { type: Boolean, default: false },
    hasCityView: { type: Boolean, default: false },
    hasKitchen: { type: Boolean, default: false },
    hasWorkSpace: { type: Boolean, default: false },
    smokingAllowed: { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: false },
    wheelchairAccessible: { type: Boolean, default: false }
  },
  
  // Media
  images: [roomImageSchema],
  
  // Pricing
  pricing: {
    type: pricingSchema,
    required: [true, 'Pricing information is required']
  },
  
  // Availability & Status
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'out-of-service'],
    default: 'available',
    index: true
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Booking Configuration
  bookingSettings: {
    minStay: {
      type: Number,
      default: 1,
      min: [1, 'Minimum stay must be at least 1 night']
    },
    maxStay: {
      type: Number,
      default: 30,
      min: [1, 'Maximum stay must be positive']
    },
    advanceBooking: {
      type: Number,
      default: 365, // days
      min: [1, 'Advance booking period must be positive']
    },
    instantBooking: {
      type: Boolean,
      default: false
    }
  },
  
  // Analytics & Stats
  stats: {
    totalBookings: {
      type: Number,
      default: 0,
      min: [0, 'Total bookings cannot be negative']
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative']
    },
    occupancyRate: {
      type: Number,
      default: 0,
      min: [0, 'Occupancy rate cannot be negative'],
      max: [100, 'Occupancy rate cannot exceed 100%']
    }
  },
  
  // Maintenance & Housekeeping
  lastCleaned: {
    type: Date,
    default: Date.now
  },
  
  lastMaintenance: Date,
  
  nextMaintenance: Date,
  
  // SEO & Search
  searchKeywords: [String]
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
roomSchema.index({ hotel: 1, status: 1 });
roomSchema.index({ hotel: 1, type: 1, isActive: 1 });
roomSchema.index({ 'capacity.adults': 1, 'pricing.basePrice': 1 });
roomSchema.index({ 'stats.averageRating': -1 });

// Virtual for current price (considering discounts and special rates)
roomSchema.virtual('currentPrice').get(function() {
  let price = this.pricing.basePrice;
  
  // Apply discount
  if (this.pricing.discountPercent > 0) {
    price = price * (1 - this.pricing.discountPercent / 100);
  }
  
  // Check for active special rates
  const today = new Date();
  const activeSpecialRate = this.pricing.specialRates?.find(rate => 
    rate.isActive && 
    rate.startDate <= today && 
    rate.endDate >= today
  );
  
  if (activeSpecialRate) {
    price = activeSpecialRate.rate;
  }
  
  return Math.round(price);
});

// Virtual for total capacity
roomSchema.virtual('totalCapacity').get(function() {
  return this.capacity.adults + this.capacity.children;
});

// Virtual for bed summary
roomSchema.virtual('bedSummary').get(function() {
  return this.bedConfiguration.map(bed => 
    `${bed.count} ${bed.type} bed${bed.count > 1 ? 's' : ''}`
  ).join(', ');
});

// Pre-save middleware
roomSchema.pre('save', function(next) {
  // Calculate total guests capacity
  this.capacity.totalGuests = this.capacity.adults + this.capacity.children;
  
  // Validate bed configuration
  if (!this.bedConfiguration || this.bedConfiguration.length === 0) {
    return next(new Error('At least one bed configuration is required'));
  }
  
  // Ensure room number is unique within hotel
  if (this.isModified('roomNumber') || this.isModified('hotel')) {
    this.constructor.findOne({
      hotel: this.hotel,
      roomNumber: this.roomNumber,
      _id: { $ne: this._id }
    }).then(existingRoom => {
      if (existingRoom) {
        return next(new Error('Room number must be unique within the hotel'));
      }
      next();
    }).catch(next);
  } else {
    next();
  }
});

// Instance methods
roomSchema.methods.isAvailableForDates = async function(checkIn, checkOut) {
  // Check basic availability
  if (this.status !== 'available' || !this.isActive) {
    return false;
  }
  
  // TODO: Check against existing bookings
  // const Booking = mongoose.model('Booking');
  // const conflictingBookings = await Booking.find({
  //   room: this._id,
  //   status: { $in: ['confirmed', 'checked-in'] },
  //   $or: [
  //     { checkIn: { $lte: checkOut }, checkOut: { $gte: checkIn } }
  //   ]
  // });
  // return conflictingBookings.length === 0;
  
  return true; // Simplified for now
};

roomSchema.methods.calculatePrice = function(checkIn, checkOut, guests = 1) {
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  const basePrice = this.currentPrice;
  
  // Additional guest charges (if capacity exceeded)
  let extraGuestCharge = 0;
  if (guests > this.capacity.adults) {
    const extraGuests = guests - this.capacity.adults;
    extraGuestCharge = extraGuests * (basePrice * 0.3); // 30% per extra guest
  }
  
  const subtotal = (basePrice + extraGuestCharge) * nights;
  
  return {
    basePrice,
    nights,
    extraGuestCharge,
    subtotal,
    taxes: subtotal * 0.1, // 10% tax
    total: subtotal * 1.1
  };
};

roomSchema.methods.updateRating = async function() {
  // TODO: Calculate from Review model
  // const Review = mongoose.model('Review');
  // const stats = await Review.aggregate([
  //   { $match: { room: this._id } },
  //   { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  // ]);
  
  // if (stats.length > 0) {
  //   this.stats.averageRating = Math.round(stats[0].avgRating * 10) / 10;
  //   this.stats.totalReviews = stats[0].count;
  //   await this.save();
  // }
  
  return this;
};

roomSchema.methods.addBooking = async function() {
  this.stats.totalBookings += 1;
  return this.save();
};

// Static methods
roomSchema.statics.findAvailableRooms = async function(hotelId, checkIn, checkOut, guests = 1, filters = {}) {
  const baseQuery = {
    hotel: hotelId,
    status: 'available',
    isActive: true,
    'capacity.totalGuests': { $gte: guests }
  };
  
  // Apply filters
  if (filters.type) baseQuery.type = filters.type;
  if (filters.minPrice) baseQuery['pricing.basePrice'] = { $gte: filters.minPrice };
  if (filters.maxPrice) {
    baseQuery['pricing.basePrice'] = { 
      ...baseQuery['pricing.basePrice'], 
      $lte: filters.maxPrice 
    };
  }
  
  const rooms = await this.find(baseQuery)
    .populate('hotel', 'name location')
    .sort({ 'pricing.basePrice': 1 });
  
  // Filter by actual availability (would check bookings)
  const availableRooms = [];
  for (const room of rooms) {
    const isAvailable = await room.isAvailableForDates(checkIn, checkOut);
    if (isAvailable) {
      availableRooms.push({
        ...room.toObject(),
        priceCalculation: room.calculatePrice(checkIn, checkOut, guests)
      });
    }
  }
  
  return availableRooms;
};

roomSchema.statics.getHotelRoomTypes = function(hotelId) {
  return this.aggregate([
    { $match: { hotel: mongoose.Types.ObjectId(hotelId), isActive: true } },
    { 
      $group: { 
        _id: '$type', 
        count: { $sum: 1 },
        minPrice: { $min: '$pricing.basePrice' },
        maxPrice: { $max: '$pricing.basePrice' },
        avgRating: { $avg: '$stats.averageRating' }
      } 
    },
    { $sort: { minPrice: 1 } }
  ]);
};

module.exports = mongoose.model('Room', roomSchema);