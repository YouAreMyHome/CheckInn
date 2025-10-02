/**
 * Booking Model for CheckInn Hotel Booking Platform
 * 
 * Quản lý đặt phòng với:
 * - Payment status tracking
 * - Guest information management
 * - Cancellation policies
 * - Revenue calculation
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const mongoose = require('mongoose');

/**
 * Sub-schema: Thông tin khách
 * Quản lý thông tin chi tiết của từng khách
 */
const guestSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please provide a valid email'
    }
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^\+?[\d\s\-\(\)]{10,}$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  isMainGuest: {
    type: Boolean,
    default: false // Khách chính (người đặt phòng)
  },
  dateOfBirth: Date,
  nationality: String
});

/**
 * Sub-schema: Pricing breakdown
 * Chi tiết giá tiền và các khoản phí
 */
const pricingSchema = new mongoose.Schema({
  baseAmount: {
    type: Number,
    required: true,
    min: 0 // Giá phòng cơ bản
  },
  taxes: {
    type: Number,
    default: 0,
    min: 0 // Thuế VAT
  },
  serviceCharges: {
    type: Number,
    default: 0,
    min: 0 // Phí dịch vụ
  },
  extraCharges: [{
    name: { type: String, required: true }, // Tên phí (extra bed, pet fee, etc.)
    amount: { type: Number, required: true, min: 0 },
    description: String
  }],
  discountAmount: {
    type: Number,
    default: 0,
    min: 0 // Số tiền giảm giá
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0 // Tổng tiền cuối cùng
  },
  currency: {
    type: String,
    default: 'VND',
    enum: ['VND', 'USD', 'EUR', 'GBP']
  }
});

/**
 * Sub-schema: Payment information
 * Thông tin thanh toán và transaction
 */
const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'e_wallet', 'vnpay', 'momo'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded', 'Partially_Refunded'],
    default: 'Pending',
    index: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true // Unique nhưng cho phép null
  },
  paidAt: Date,
  refundedAt: Date,
  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentGateway: {
    type: String,
    enum: ['vnpay', 'momo', 'stripe', 'paypal', 'manual']
  }
});

/**
 * Main Booking Schema
 * Schema chính quản lý tất cả thông tin đặt phòng
 */
const bookingSchema = new mongoose.Schema({
  // === BOOKING REFERENCES ===
  bookingNumber: {
    type: String,
    unique: true,
    index: true // Format: CI-2024-000001
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    index: true // Có thể null cho guest booking
  },
  hotel: {
    type: mongoose.Schema.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel is required'],
    index: true
  },
  room: {
    type: mongoose.Schema.ObjectId,
    ref: 'Room',
    required: [true, 'Room is required'],
    index: true
  },
  
  // === BOOKING DATES ===
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required'],
    index: true
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required'],
    index: true,
    validate: {
      validator: function(checkOut) {
        return checkOut > this.checkIn;
      },
      message: 'Check-out date must be after check-in date'
    }
  },
  nights: {
    type: Number,
    min: 1
  },
  
  // === GUEST INFORMATION ===
  guests: [guestSchema],
  totalGuests: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  
  // === BOOKING STATUS ===
  status: {
    type: String,
    enum: [
      'Pending',        // Chờ xác nhận
      'Confirmed',      // Đã xác nhận
      'CheckedIn',      // Đã check-in
      'CheckedOut',     // Đã check-out
      'Cancelled',      // Đã hủy
      'NoShow',         // Không xuất hiện
      'Completed'       // Hoàn thành
    ],
    default: 'Pending',
    index: true
  },
  
  // === PRICING ===
  pricing: {
    type: pricingSchema,
    required: true
  },
  
  // === PAYMENT ===
  payment: {
    type: paymentSchema,
    required: true
  },
  
  // === SPECIAL REQUESTS ===
  specialRequests: [{
    type: {
      type: String,
      enum: ['early_checkin', 'late_checkout', 'airport_pickup', 'room_decoration', 'dietary_requirements', 'other']
    },
    description: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined', 'completed'],
      default: 'pending'
    }
  }],
  
  // === CANCELLATION INFO ===
  cancellation: {
    reason: String,
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    refundPolicy: {
      type: String,
      enum: ['full', 'partial', 'none'],
      default: 'none'
    },
    refundPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  
  // === CONTACT INFO (for guest bookings) ===
  contactEmail: {
    type: String,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !this.user || !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please provide a valid email'
    }
  },
  contactPhone: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^\+?[\d\s\-\(\)]{10,}$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  
  // === ADDITIONAL INFO ===
  source: {
    type: String,
    enum: ['website', 'mobile_app', 'phone', 'walk_in', 'partner'],
    default: 'website'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  // === TIMESTAMPS ===
  confirmedAt: Date,
  checkedInAt: Date,
  checkedOutAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * PERFORMANCE INDEXES
 */
// Compound indexes cho các query patterns phổ biến
bookingSchema.index({ hotel: 1, status: 1, checkIn: 1 });
bookingSchema.index({ user: 1, status: 1, createdAt: -1 });
bookingSchema.index({ room: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ 'payment.status': 1, createdAt: -1 });
bookingSchema.index({ status: 1, checkIn: 1, checkOut: 1 });

// Text index cho search
bookingSchema.index({ bookingNumber: 'text', contactEmail: 'text' });

/**
 * VIRTUAL FIELDS
 */

// Virtual: Tính số đêm
bookingSchema.virtual('numberOfNights').get(function() {
  if (this.checkIn && this.checkOut) {
    return Math.ceil((this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual: Tính revenue cho hotel
bookingSchema.virtual('revenue').get(function() {
  if (this.status === 'Completed' && this.payment.status === 'Completed') {
    return this.pricing.totalAmount;
  }
  return 0;
});

// Virtual: Check if can be cancelled
bookingSchema.virtual('canBeCancelled').get(function() {
  const now = new Date();
  const checkInTime = new Date(this.checkIn);
  const timeDiff = checkInTime.getTime() - now.getTime();
  const hoursUntilCheckIn = timeDiff / (1000 * 3600);
  
  return this.status === 'Confirmed' && hoursUntilCheckIn > 24;
});

/**
 * PRE-SAVE MIDDLEWARE
 */
bookingSchema.pre('save', function(next) {
  // Auto-generate booking number
  if (this.isNew && !this.bookingNumber) {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    this.bookingNumber = `CI-${year}-${random}`;
  }
  
  // Calculate nights
  if (this.checkIn && this.checkOut) {
    this.nights = Math.ceil((this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24));
  }
  
  // Ensure at least one main guest
  if (this.guests && this.guests.length > 0) {
    const hasMainGuest = this.guests.some(guest => guest.isMainGuest);
    if (!hasMainGuest) {
      this.guests[0].isMainGuest = true;
    }
  }
  
  // Set total guests
  if (this.guests) {
    this.totalGuests = this.guests.length;
  }
  
  next();
});

/**
 * POST-SAVE MIDDLEWARE
 */
bookingSchema.post('save', async function(doc) {
  // Update room status when booking is confirmed
  if (doc.status === 'Confirmed') {
    await mongoose.model('Room').findByIdAndUpdate(
      doc.room,
      { currentBooking: doc._id }
    );
  }
  
  // Update hotel booking count
  if (doc.status === 'Completed') {
    await mongoose.model('Hotel').findByIdAndUpdate(
      doc.hotel,
      { $inc: { bookings: 1 } }
    );
  }
});

/**
 * STATIC METHODS
 */

// Tìm booking theo số booking
bookingSchema.statics.findByBookingNumber = function(bookingNumber) {
  return this.findOne({ bookingNumber })
    .populate('user', 'name email phone')
    .populate('hotel', 'name location contact')
    .populate('room', 'name type pricing');
};

// Lấy booking theo khách sạn và thời gian
bookingSchema.statics.findHotelBookings = function(hotelId, startDate, endDate) {
  return this.find({
    hotel: hotelId,
    checkIn: { $gte: startDate },
    checkOut: { $lte: endDate }
  }).populate('room', 'name type')
    .populate('user', 'name email');
};

// Revenue report cho hotel
bookingSchema.statics.getRevenueReport = function(hotelId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        hotel: mongoose.Types.ObjectId(hotelId),
        status: 'Completed',
        'payment.status': 'Completed',
        checkIn: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$checkIn' } },
        totalRevenue: { $sum: '$pricing.totalAmount' },
        bookingCount: { $sum: 1 },
        avgBookingValue: { $avg: '$pricing.totalAmount' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

/**
 * INSTANCE METHODS
 */

// Cancel booking
bookingSchema.methods.cancelBooking = async function(reason, cancelledBy) {
  if (!this.canBeCancelled) {
    throw new Error('Booking cannot be cancelled');
  }
  
  this.status = 'Cancelled';
  this.cancellation = {
    reason,
    cancelledAt: new Date(),
    cancelledBy
  };
  
  // Free up the room
  await mongoose.model('Room').findByIdAndUpdate(
    this.room,
    { $unset: { currentBooking: 1 } }
  );
  
  return this.save();
};

// Calculate refund amount
bookingSchema.methods.calculateRefund = function() {
  if (this.status !== 'Cancelled') return 0;
  
  const refundPercentage = this.cancellation?.refundPercentage || 0;
  return (this.pricing.totalAmount * refundPercentage) / 100;
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;