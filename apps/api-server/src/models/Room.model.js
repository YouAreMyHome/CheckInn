/**
 * Room Model for CheckInn Hotel Booking Platform
 * 
 * Quản lý thông tin phòng khách sạn với:
 * - Pricing & availability logic
 * - Room configuration & amenities
 * - Booking status tracking
 * - Performance optimization
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const mongoose = require('mongoose');

/**
 * Sub-schema: Cấu hình giường
 * Chi tiết về loại giường và số lượng
 */
const bedConfigSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['single', 'double', 'queen', 'king', 'sofa'],
    required: true
  },
  count: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  }
});

/**
 * Sub-schema: Pricing configuration
 * Quản lý giá phòng theo mùa và điều kiện đặc biệt
 */
const pricingSchema = new mongoose.Schema({
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  weekendSurcharge: {
    type: Number,
    default: 0,
    min: 0 // Phụ phí cuối tuần (%)
  },
  holidaySurcharge: {
    type: Number,
    default: 0,
    min: 0 // Phụ phí ngày lễ (%)
  },
  currency: {
    type: String,
    default: 'VND',
    enum: ['VND', 'USD', 'EUR', 'GBP']
  }
});

/**
 * Main Room Schema
 * Schema chính quản lý tất cả thông tin phòng
 */
const roomSchema = new mongoose.Schema({
  // === THÔNG TIN CƠ BẢN ===
  hotel: {
    type: mongoose.Schema.ObjectId,
    ref: 'Hotel',
    required: [true, 'Room must belong to a hotel'],
    index: true // Index cho query theo hotel
  },
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    maxlength: [100, 'Room name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Room type is required'],
    enum: [
      'Standard Single',
      'Standard Double', 
      'Deluxe Single',
      'Deluxe Double',
      'Suite',
      'Presidential Suite',
      'Family Room',
      'Twin Room'
    ],
    index: true // Index cho filter theo type
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // === CẤU HÌNH PHÒNG ===
  capacity: {
    type: Number,
    required: [true, 'Room capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [10, 'Capacity cannot exceed 10 people']
  },
  area: {
    type: Number,
    min: [10, 'Room area must be at least 10 sqm'],
    max: [1000, 'Room area cannot exceed 1000 sqm'] // Diện tích (m²)
  },
  bedConfiguration: [bedConfigSchema], // Cấu hình giường
  
  // === HÌNH ẢNH ===
  images: {
    type: [{
      url: { type: String, required: true },
      caption: { type: String },
      isPrimary: { type: Boolean, default: false }
    }],
    validate: {
      validator: function(arr) {
        return arr.length >= 1 && arr.length <= 15;
      },
      message: 'Room must have between 1 and 15 images'
    }
  },
  
  // === TIỆN ÍCH PHÒNG ===
  amenities: [{
    type: String,
    enum: [
      'air-conditioning', 'heating', 'wifi', 'tv', 'minibar', 
      'safe', 'balcony', 'city-view', 'sea-view', 'mountain-view',
      'bathtub', 'shower', 'hairdryer', 'coffee-maker', 'tea-kettle',
      'room-service', 'telephone', 'workspace', 'sofa', 'wardrobe'
    ]
  }],
  
  // === GIÁ CẢ ===
  pricing: {
    type: pricingSchema,
    required: true
  },
  
  // === TRẠNG THÁI & AVAILABILITY ===
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Maintenance', 'OutOfOrder', 'Cleaning'],
    default: 'Available',
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true // Phòng có đang được cho thuê không
  },
  
  // === BOOKING TRACKING ===
  currentBooking: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    default: null // Booking hiện tại (nếu có)
  },
  totalBookings: {
    type: Number,
    default: 0,
    min: 0 // Tổng số lần được đặt
  },
  
  // === PERFORMANCE METRICS ===
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    set: (val) => Math.round(val * 10) / 10
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  views: {
    type: Number,
    default: 0 // Số lượt xem
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * PERFORMANCE INDEXES
 */
// Compound index cho search phòng theo hotel + type + status
roomSchema.index({ hotel: 1, type: 1, status: 1 });

// Index cho filter theo capacity và giá
roomSchema.index({ capacity: 1, 'pricing.basePrice': 1 });

// Index cho search phòng available
roomSchema.index({ isActive: 1, status: 1 });

// Index cho sort theo rating
roomSchema.index({ averageRating: -1, totalReviews: -1 });

/**
 * VIRTUAL FIELDS
 */

// Virtual populate: Lấy reviews của phòng
roomSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'room',
  localField: '_id',
  options: { sort: { createdAt: -1 }, limit: 10 }
});

// Virtual populate: Lấy booking hiện tại với thông tin chi tiết
roomSchema.virtual('currentBookingDetails', {
  ref: 'Booking',
  foreignField: '_id',
  localField: 'currentBooking'
});

// Virtual: Tính occupancy rate
roomSchema.virtual('occupancyRate').get(function() {
  // Logic sẽ được implement trong controller
  return 0;
});

/**
 * PRE-SAVE MIDDLEWARE
 */
roomSchema.pre('save', function(next) {
  // Đảm bảo có ít nhất 1 ảnh primary
  if (this.images && this.images.length > 0) {
    const hasPrimary = this.images.some(img => img.isPrimary);
    if (!hasPrimary) {
      this.images[0].isPrimary = true;
    }
  }
  
  // Validate bed configuration
  if (this.bedConfiguration && this.bedConfiguration.length > 0) {
    const totalBeds = this.bedConfiguration.reduce((sum, bed) => sum + bed.count, 0);
    if (totalBeds > this.capacity) {
      return next(new Error('Total beds cannot exceed room capacity'));
    }
  }
  
  next();
});

/**
 * STATIC METHODS
 */

// Tìm phòng available trong khoảng thời gian
roomSchema.statics.findAvailableRooms = function(hotelId, checkIn, checkOut, options = {}) {
  // Logic sẽ được implement với aggregation pipeline
  return this.find({
    hotel: hotelId,
    isActive: true,
    status: 'Available',
    ...options
  });
};

// Tìm phòng theo giá và capacity
roomSchema.statics.findByPriceRange = function(minPrice, maxPrice, capacity) {
  return this.find({
    'pricing.basePrice': { $gte: minPrice, $lte: maxPrice },
    capacity: { $gte: capacity },
    isActive: true,
    status: 'Available'
  }).populate('hotel', 'name location');
};

/**
 * INSTANCE METHODS
 */

// Tính giá phòng theo ngày (bao gồm surcharge)
roomSchema.methods.calculatePrice = function(checkIn, checkOut) {
  const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  let totalPrice = this.pricing.basePrice * days;
  
  // TODO: Implement weekend/holiday surcharge logic
  
  return totalPrice;
};

// Check availability cho khoảng thời gian cụ thể
roomSchema.methods.isAvailableForPeriod = async function(checkIn, checkOut) {
  const Booking = mongoose.model('Booking');
  
  const conflictingBookings = await Booking.find({
    room: this._id,
    status: { $in: ['Confirmed', 'CheckedIn'] },
    $or: [
      {
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn }
      }
    ]
  });
  
  return conflictingBookings.length === 0;
};

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;