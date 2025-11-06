/**
 * Revenue Model for CheckInn Hotel Booking Platform
 * 
 * Tracking doanh thu theo ngày/tháng/năm cho hotel partners
 * - Daily revenue aggregation
 * - Monthly statistics
 * - Revenue by hotel
 * - Occupancy rate tracking
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const mongoose = require('mongoose');

/**
 * Revenue Schema - Aggregate revenue data
 * Tự động tính toán từ Booking model qua middleware
 */
const revenueSchema = new mongoose.Schema({
  // Reference
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel reference is required'],
    index: true
  },
  
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Partner reference is required'],
    index: true
  },
  
  // Time period
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true
  },
  
  year: {
    type: Number,
    required: true,
    index: true
  },
  
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
    index: true
  },
  
  day: {
    type: Number,
    required: true,
    min: 1,
    max: 31
  },
  
  // Revenue data
  totalRevenue: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  
  // Breakdown by booking status
  confirmedRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  
  completedRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  
  pendingRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Booking statistics
  totalBookings: {
    type: Number,
    default: 0,
    min: 0
  },
  
  confirmedBookings: {
    type: Number,
    default: 0,
    min: 0
  },
  
  cancelledBookings: {
    type: Number,
    default: 0,
    min: 0
  },
  
  completedBookings: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Room statistics
  totalRooms: {
    type: Number,
    default: 0,
    min: 0
  },
  
  occupiedRooms: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Calculated metrics
  occupancyRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100 // Percentage
  },
  
  averageBookingValue: {
    type: Number,
    default: 0,
    min: 0
  },
  
  cancellationRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100 // Percentage
  },
  
  // Currency
  currency: {
    type: String,
    default: 'VND',
    enum: ['VND', 'USD', 'EUR', 'GBP']
  },
  
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
revenueSchema.index({ hotel: 1, date: -1 });
revenueSchema.index({ partner: 1, date: -1 });
revenueSchema.index({ hotel: 1, year: 1, month: 1 });
revenueSchema.index({ partner: 1, year: 1, month: 1 });

// Unique constraint to prevent duplicate entries
revenueSchema.index({ hotel: 1, date: 1 }, { unique: true });

/**
 * Pre-save middleware: Calculate metrics
 */
revenueSchema.pre('save', function(next) {
  // Calculate occupancy rate
  if (this.totalRooms > 0) {
    this.occupancyRate = Math.round((this.occupiedRooms / this.totalRooms) * 100 * 100) / 100;
  }
  
  // Calculate average booking value
  if (this.totalBookings > 0) {
    this.averageBookingValue = Math.round(this.totalRevenue / this.totalBookings);
  }
  
  // Calculate cancellation rate
  if (this.totalBookings > 0) {
    this.cancellationRate = Math.round((this.cancelledBookings / this.totalBookings) * 100 * 100) / 100;
  }
  
  // Update lastUpdated
  this.lastUpdated = Date.now();
  
  next();
});

/**
 * Static method: Get revenue for date range
 */
revenueSchema.statics.getRevenueByDateRange = function(hotelId, startDate, endDate) {
  return this.find({
    hotel: hotelId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1 });
};

/**
 * Static method: Get monthly revenue summary
 */
revenueSchema.statics.getMonthlyRevenue = function(hotelId, year, month) {
  return this.aggregate([
    {
      $match: {
        hotel: mongoose.Types.ObjectId(hotelId),
        year: year,
        month: month
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalRevenue' },
        totalBookings: { $sum: '$totalBookings' },
        confirmedBookings: { $sum: '$confirmedBookings' },
        cancelledBookings: { $sum: '$cancelledBookings' },
        avgOccupancyRate: { $avg: '$occupancyRate' },
        avgBookingValue: { $avg: '$averageBookingValue' }
      }
    }
  ]);
};

/**
 * Static method: Get partner's total revenue across all hotels
 */
revenueSchema.statics.getPartnerRevenue = function(partnerId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        partner: mongoose.Types.ObjectId(partnerId),
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$hotel',
        totalRevenue: { $sum: '$totalRevenue' },
        totalBookings: { $sum: '$totalBookings' },
        avgOccupancyRate: { $avg: '$occupancyRate' }
      }
    },
    {
      $lookup: {
        from: 'hotels',
        localField: '_id',
        foreignField: '_id',
        as: 'hotelInfo'
      }
    },
    {
      $unwind: '$hotelInfo'
    },
    {
      $project: {
        hotelName: '$hotelInfo.name',
        totalRevenue: 1,
        totalBookings: 1,
        avgOccupancyRate: 1
      }
    }
  ]);
};

/**
 * Static method: Update or create revenue record
 */
revenueSchema.statics.updateRevenueForDate = async function(hotelId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Get all bookings for this date
  const Booking = mongoose.model('Booking');
  const Hotel = mongoose.model('Hotel');
  
  const bookings = await Booking.find({
    hotel: hotelId,
    checkIn: { $lte: endOfDay },
    checkOut: { $gte: startOfDay }
  });
  
  const hotel = await Hotel.findById(hotelId).populate('owner');
  
  if (!hotel) return null;
  
  // Calculate metrics
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'CheckedIn').length;
  const completedBookings = bookings.filter(b => b.status === 'Completed' || b.status === 'CheckedOut').length;
  const cancelledBookings = bookings.filter(b => b.status === 'Cancelled').length;
  
  const confirmedRevenue = bookings
    .filter(b => b.status === 'Confirmed' || b.status === 'CheckedIn')
    .reduce((sum, b) => sum + b.pricing.totalAmount, 0);
  
  const completedRevenue = bookings
    .filter(b => b.status === 'Completed' || b.status === 'CheckedOut')
    .reduce((sum, b) => sum + b.pricing.totalAmount, 0);
  
  const pendingRevenue = bookings
    .filter(b => b.status === 'Pending')
    .reduce((sum, b) => sum + b.pricing.totalAmount, 0);
  
  const totalRevenue = confirmedRevenue + completedRevenue;
  
  // Get room statistics
  const Room = mongoose.model('Room');
  const totalRooms = await Room.countDocuments({ hotel: hotelId, status: 'available' });
  const occupiedRooms = new Set(bookings.map(b => b.room.toString())).size;
  
  // Update or create revenue record
  const revenueData = {
    hotel: hotelId,
    partner: hotel.owner._id,
    date: startOfDay,
    year: startOfDay.getFullYear(),
    month: startOfDay.getMonth() + 1,
    day: startOfDay.getDate(),
    totalRevenue,
    confirmedRevenue,
    completedRevenue,
    pendingRevenue,
    totalBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    totalRooms,
    occupiedRooms,
    currency: hotel.currency || 'VND'
  };
  
  return await this.findOneAndUpdate(
    { hotel: hotelId, date: startOfDay },
    revenueData,
    { upsert: true, new: true, runValidators: true }
  );
};

module.exports = mongoose.model('Revenue', revenueSchema);
