/**
 * Hotel Model for CheckInn Hotel Booking Platform
 * 
 * Schema phức tạp quản lý thông tin khách sạn với:
 * - Geospatial indexing cho tìm kiếm theo vị trí
 * - Full-text search cho tên và mô tả
 * - Business logic cho booking và rating
 * - Performance optimization với strategic indexing
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Sub-schema: Thông tin địa chỉ với geospatial support
 * Hỗ trợ tìm kiếm khách sạn gần nhất với MongoDB 2dsphere index
 */
const locationSchema = new mongoose.Schema({
  address: { type: String, required: true, trim: true }, // Địa chỉ chi tiết
  city: { type: String, required: true, trim: true }, // Thành phố (indexed)
  state: { type: String, trim: true }, // Tỉnh/Bang (optional)
  country: { type: String, required: true, trim: true }, // Quốc gia
  zipCode: { type: String, trim: true }, // Mã bưu điện
  coordinates: {
    type: [Number], // [longitude, latitude] - GeoJSON format
    index: '2dsphere', // MongoDB geospatial index
    validate: {
      validator: function(val) {
        return val.length === 2;
      },
      message: 'Coordinates must contain exactly 2 values [longitude, latitude]'
    }
  },
});

/**
 * Sub-schema: Thông tin liên hệ khách sạn
 * Validation regex để đảm bảo format đúng
 */
const contactSchema = new mongoose.Schema({
  phone: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^\+?[\d\s\-\(\)]{10,}$/.test(v); // Regex cho phone format
      },
      message: 'Please provide a valid phone number'
    }
  },
  email: { 
    type: String, 
    required: true,
    lowercase: true, // Tự động chuyển chữ thường
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please provide a valid email'
    }
  },
  website: { type: String }, // URL website (optional)
});

/**
 * Sub-schema: Chính sách khách sạn
 * Quản lý check-in/out, hủy phòng, phụ phí
 */
const policySchema = new mongoose.Schema({
  checkIn: { type: String, default: '14:00' }, // Giờ check-in mặc định
  checkOut: { type: String, default: '12:00' }, // Giờ check-out mặc định
  
  // Chính sách hủy phòng
  cancellation: {
    type: { type: String, enum: ['flexible', 'moderate', 'strict'], default: 'moderate' },
    hoursBeforeCheckIn: { type: Number, default: 24 }, // Số giờ trước khi check-in
    refundPercentage: { type: Number, min: 0, max: 100, default: 100 } // % hoàn tiền
  },
  
  // Chính sách giường phụ
  extraBed: {
    available: { type: Boolean, default: false }, // Có cho phép giường phụ
    price: { type: Number, default: 0 } // Giá giường phụ/đêm
  },
  
  // Chính sách thú cưng
  pet: {
    allowed: { type: Boolean, default: false }, // Có cho phép thú cưng
    fee: { type: Number, default: 0 } // Phí thú cưng/đêm
  }
});

/**
 * Main Hotel Schema
 * Schema chính quản lý tất cả thông tin khách sạn
 */
const hotelSchema = new mongoose.Schema({
  // === THÔNG TIN CƠ BẢN ===
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true,
    maxlength: [100, 'Hotel name cannot exceed 100 characters'],
    index: 'text' // Full-text search index
  },
  slug: {
    type: String,
    unique: true, // URL-friendly identifier (auto-generated)
    index: true
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Reference to User model
    required: [true, 'Hotel must have an owner'],
    index: true // Indexed for owner queries
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    index: 'text' // Full-text search trên mô tả
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
    // Auto-generated từ description nếu không có
  },
  
  // === HÌNH ẢNH ===
  images: {
    type: [{
      url: { type: String, required: true }, // URL hình ảnh
      caption: { type: String }, // Chú thích (optional)
      isPrimary: { type: Boolean, default: false } // Ảnh chính
    }],
    validate: {
      validator: function(arr) {
        return arr.length >= 1 && arr.length <= 20; // 1-20 ảnh
      },
      message: 'Hotel must have between 1 and 20 images'
    }
  },
  // === VỊ TRÍ VÀ LIÊN HỆ ===
  location: {
    type: locationSchema,
    required: true,
    index: '2dsphere' // Geospatial index cho tìm kiếm theo vị trí
  },
  contact: {
    type: contactSchema,
    required: true
  },
  
  // === TIỆN ÍCH ===
  amenities: [{
    type: String,
    enum: [
      'wifi', 'parking', 'pool', 'gym', 'spa', 'restaurant', 'bar', 
      'room-service', 'laundry', 'concierge', 'business-center', 
      'meeting-rooms', 'airport-shuttle', 'pet-friendly', 'accessible'
    ] // Danh sách tiện ích chuẩn
  }],
  // === ĐÁNH GIÁ VÀ XẾP HẠNG ===
  starRating: {
    type: Number,
    min: [1, 'Star rating must be at least 1'],
    max: [5, 'Star rating cannot exceed 5'],
    required: [true, 'Star rating is required'], // Hạng sao khách sạn (1-5)
  },
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
    set: (val) => Math.round(val * 10) / 10, // Làm tròn 1 chữ số thập phân
    index: true // Indexed cho sort theo rating
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0 // Tổng số đánh giá
  },
  
  // === GIÁ CẢ ===
  priceRange: {
    min: { type: Number, default: 0, min: 0 }, // Giá thấp nhất
    max: { type: Number, default: 0, min: 0 }, // Giá cao nhất
    currency: { type: String, default: 'USD', enum: ['USD', 'EUR', 'VND', 'GBP'] }
  },
  policies: policySchema, // Các chính sách khách sạn
  
  // === TRẠNG THÁI ===
  isActive: {
    type: Boolean,
    default: true, // Khách sạn có đang hoạt động
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false, // Đã được admin xác thực chưa
    index: true
  },
  verificationDate: Date, // Ngày xác thực
  
  // === THÔNG TIN PHÒNG ===
  totalRooms: {
    type: Number,
    default: 0,
    min: 0 // Tổng số phòng
  },
  availableRooms: {
    type: Number,
    default: 0,
    min: 0 // Số phòng còn trống
  },
  
  // === PERFORMANCE TRACKING ===
  views: {
    type: Number,
    default: 0 // Số lượt xem
  },
  bookings: {
    type: Number,
    default: 0 // Số lượng đặt phòng
  }
}, {
  timestamps: true, // Tự động thêm createdAt, updatedAt
  toJSON: { virtuals: true }, // Include virtuals khi convert to JSON
  toObject: { virtuals: true }, // Include virtuals khi convert to Object
});

/**
 * PERFORMANCE INDEXES
 * Strategic indexing cho các query patterns phổ biến
 */

// Full-text search index cho tìm kiếm khách sạn
hotelSchema.index({ name: 'text', description: 'text' });

// Compound index cho search theo city + rating
hotelSchema.index({ 'location.city': 1, starRating: -1 });

// Index cho sort theo rating và reviews
hotelSchema.index({ averageRating: -1, totalReviews: -1 });

// Index cho filter theo khoảng giá
hotelSchema.index({ 'priceRange.min': 1, 'priceRange.max': 1 });

// Index cho query khách sạn theo owner
hotelSchema.index({ owner: 1, isActive: 1 });

// Compound index cho listing khách sạn được xác thực
hotelSchema.index({ isActive: 1, isVerified: 1, averageRating: -1 });

/**
 * VIRTUAL FIELDS
 * Calculated fields không lưu trong database
 */

// Virtual populate: Lấy danh sách phòng của khách sạn
hotelSchema.virtual('rooms', {
  ref: 'Room',
  foreignField: 'hotel',
  localField: '_id',
});

// Virtual populate: Lấy 5 review mới nhất
hotelSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'hotel',
  localField: '_id',
  options: { sort: { createdAt: -1 }, limit: 5 }
});

// Virtual field: Tỷ lệ lấp đầy phòng (tính theo %)
hotelSchema.virtual('occupancyRate').get(function() {
  if (this.totalRooms === 0) return 0;
  return Math.round(((this.totalRooms - this.availableRooms) / this.totalRooms) * 100);
});

/**
 * PRE-SAVE MIDDLEWARE
 * Business logic chạy trước khi lưu document
 */
hotelSchema.pre('save', function(next) {
  // Auto-generate slug từ tên khách sạn (URL-friendly)
  if (this.isModified('name') || this.isNew) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  
  // Tự động tạo shortDescription từ description nếu chưa có
  if (this.isModified('description') && !this.shortDescription) {
    this.shortDescription = this.description.substring(0, 150) + '...';
  }
  
  // Đảm bảo có ít nhất 1 ảnh chính (isPrimary)
  if (this.images && this.images.length > 0) {
    const hasPrimary = this.images.some(img => img.isPrimary);
    if (!hasPrimary) {
      this.images[0].isPrimary = true; // Set ảnh đầu tiên làm ảnh chính
    }
  }
  
  next();
});

/**
 * STATIC METHOD: Tìm khách sạn gần nhất
 * Sử dụng MongoDB $geoNear aggregation với 2dsphere index
 * 
 * @param {number} longitude - Kinh độ
 * @param {number} latitude - Vĩ độ 
 * @param {number} radiusInKm - Bán kính tìm kiếm (km), mặc định 10km
 * @param {object} options - Filter bổ sung
 * @returns {Promise} - Array khách sạn với khoảng cách
 */
hotelSchema.statics.findNearby = function(longitude, latitude, radiusInKm = 10, options = {}) {
  const pipeline = [
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        distanceField: 'distance', // Thêm field distance vào kết quả
        maxDistance: radiusInKm * 1000, // Convert km -> meters
        spherical: true, // Tính toán trên hình cầu (Trái Đất)
        query: { isActive: true, isVerified: true, ...options } // Chỉ lấy KS active & verified
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

/**
 * INSTANCE METHOD: Tính khoảng cách đến 1 điểm
 * Sử dụng công thức Haversine để tính khoảng cách trên hình cầu
 * 
 * @param {number} longitude - Kinh độ đích
 * @param {number} latitude - Vĩ độ đích
 * @returns {number} - Khoảng cách tính theo km
 */
hotelSchema.methods.distanceTo = function(longitude, latitude) {
  const R = 6371; // Bán kính Trái Đất (km)
  
  // Convert độ sang radian
  const dLat = (latitude - this.location.coordinates[1]) * Math.PI / 180;
  const dLon = (longitude - this.location.coordinates[0]) * Math.PI / 180;
  
  // Haversine formula
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.location.coordinates[1] * Math.PI / 180) * 
    Math.cos(latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c; // Khoảng cách theo km
};

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;
