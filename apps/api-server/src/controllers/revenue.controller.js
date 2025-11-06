/**
 * Revenue Controller for CheckInn Hotel Booking Platform
 * 
 * Handles revenue tracking and analytics for hotel partners
 * - Daily/Monthly revenue reports
 * - Occupancy rate calculations
 * - Booking trends
 * - Financial analytics
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const Revenue = require('../models/Revenue.model');
const Transaction = require('../models/Transaction.model');
const Hotel = require('../models/Hotel.model');
const Booking = require('../models/Booking.model');
const Room = require('../models/Room.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @desc    Get revenue by hotel for date range
 * @route   GET /api/revenue/hotel/:hotelId
 * @access  Private (HotelPartner, Admin)
 */
exports.getHotelRevenue = catchAsync(async (req, res, next) => {
  const { hotelId } = req.params;
  const { startDate, endDate } = req.query;
  
  // Verify hotel ownership
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return next(new AppError('Hotel not found', 404));
  }
  
  if (req.user.role === 'HotelPartner' && hotel.owner.toString() !== req.user.id) {
    return next(new AppError('You do not have permission to view this hotel revenue', 403));
  }
  
  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1)); // Start of month
  const end = endDate ? new Date(endDate) : new Date(); // Today
  
  const revenues = await Revenue.getRevenueByDateRange(hotelId, start, end);
  
  // Calculate totals
  const totals = {
    totalRevenue: revenues.reduce((sum, r) => sum + r.totalRevenue, 0),
    totalBookings: revenues.reduce((sum, r) => sum + r.totalBookings, 0),
    confirmedBookings: revenues.reduce((sum, r) => sum + r.confirmedBookings, 0),
    completedBookings: revenues.reduce((sum, r) => sum + r.completedBookings, 0),
    cancelledBookings: revenues.reduce((sum, r) => sum + r.cancelledBookings, 0),
    avgOccupancyRate: revenues.length > 0 
      ? revenues.reduce((sum, r) => sum + r.occupancyRate, 0) / revenues.length 
      : 0,
    avgBookingValue: revenues.length > 0
      ? revenues.reduce((sum, r) => sum + r.averageBookingValue, 0) / revenues.length
      : 0
  };
  
  res.status(200).json({
    success: true,
    data: {
      hotel: {
        id: hotel._id,
        name: hotel.name
      },
      period: {
        start,
        end
      },
      dailyRevenues: revenues,
      totals
    }
  });
});

/**
 * @desc    Get monthly revenue summary for hotel
 * @route   GET /api/revenue/hotel/:hotelId/monthly
 * @access  Private (HotelPartner, Admin)
 */
exports.getMonthlyRevenue = catchAsync(async (req, res, next) => {
  const { hotelId } = req.params;
  const { year, month } = req.query;
  
  // Verify hotel ownership
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return next(new AppError('Hotel not found', 404));
  }
  
  if (req.user.role === 'HotelPartner' && hotel.owner.toString() !== req.user.id) {
    return next(new AppError('You do not have permission to view this hotel revenue', 403));
  }
  
  const targetYear = year ? parseInt(year) : new Date().getFullYear();
  const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
  
  const monthlyData = await Revenue.getMonthlyRevenue(hotelId, targetYear, targetMonth);
  
  res.status(200).json({
    success: true,
    data: {
      hotel: {
        id: hotel._id,
        name: hotel.name
      },
      period: {
        year: targetYear,
        month: targetMonth
      },
      summary: monthlyData[0] || {
        totalRevenue: 0,
        totalBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        avgOccupancyRate: 0,
        avgBookingValue: 0
      }
    }
  });
});

/**
 * @desc    Get occupancy rate analytics
 * @route   GET /api/revenue/hotel/:hotelId/occupancy
 * @access  Private (HotelPartner, Admin)
 */
exports.getOccupancyRate = catchAsync(async (req, res, next) => {
  const { hotelId } = req.params;
  const { startDate, endDate } = req.query;
  
  // Verify hotel ownership
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return next(new AppError('Hotel not found', 404));
  }
  
  if (req.user.role === 'HotelPartner' && hotel.owner.toString() !== req.user.id) {
    return next(new AppError('You do not have permission to view this data', 403));
  }
  
  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
  const end = endDate ? new Date(endDate) : new Date();
  
  const revenues = await Revenue.getRevenueByDateRange(hotelId, start, end);
  
  // Calculate occupancy statistics
  const occupancyData = revenues.map(r => ({
    date: r.date,
    occupancyRate: r.occupancyRate,
    occupiedRooms: r.occupiedRooms,
    totalRooms: r.totalRooms
  }));
  
  const avgOccupancy = revenues.length > 0
    ? revenues.reduce((sum, r) => sum + r.occupancyRate, 0) / revenues.length
    : 0;
  
  const maxOccupancy = revenues.length > 0
    ? Math.max(...revenues.map(r => r.occupancyRate))
    : 0;
  
  const minOccupancy = revenues.length > 0
    ? Math.min(...revenues.map(r => r.occupancyRate))
    : 0;
  
  res.status(200).json({
    success: true,
    data: {
      hotel: {
        id: hotel._id,
        name: hotel.name
      },
      period: {
        start,
        end
      },
      occupancy: {
        average: Math.round(avgOccupancy * 100) / 100,
        maximum: Math.round(maxOccupancy * 100) / 100,
        minimum: Math.round(minOccupancy * 100) / 100
      },
      dailyOccupancy: occupancyData
    }
  });
});

/**
 * @desc    Get booking trends for hotel
 * @route   GET /api/revenue/hotel/:hotelId/trends
 * @access  Private (HotelPartner, Admin)
 */
exports.getBookingTrends = catchAsync(async (req, res, next) => {
  const { hotelId } = req.params;
  const { period = '30d' } = req.query; // 7d, 30d, 90d, 1y
  
  // Verify hotel ownership
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return next(new AppError('Hotel not found', 404));
  }
  
  if (req.user.role === 'HotelPartner' && hotel.owner.toString() !== req.user.id) {
    return next(new AppError('You do not have permission to view this data', 403));
  }
  
  // Calculate date range based on period
  const end = new Date();
  const start = new Date();
  
  switch(period) {
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case '90d':
      start.setDate(start.getDate() - 90);
      break;
    case '1y':
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setDate(start.getDate() - 30);
  }
  
  const revenues = await Revenue.getRevenueByDateRange(hotelId, start, end);
  
  // Calculate trends
  const trends = {
    bookings: revenues.map(r => ({
      date: r.date,
      total: r.totalBookings,
      confirmed: r.confirmedBookings,
      cancelled: r.cancelledBookings,
      cancellationRate: r.cancellationRate
    })),
    revenue: revenues.map(r => ({
      date: r.date,
      total: r.totalRevenue,
      confirmed: r.confirmedRevenue,
      completed: r.completedRevenue
    }))
  };
  
  // Calculate growth rates
  const midpoint = Math.floor(revenues.length / 2);
  const firstHalf = revenues.slice(0, midpoint);
  const secondHalf = revenues.slice(midpoint);
  
  const firstHalfRevenue = firstHalf.reduce((sum, r) => sum + r.totalRevenue, 0);
  const secondHalfRevenue = secondHalf.reduce((sum, r) => sum + r.totalRevenue, 0);
  
  const revenueGrowth = firstHalfRevenue > 0
    ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100
    : 0;
  
  const firstHalfBookings = firstHalf.reduce((sum, r) => sum + r.totalBookings, 0);
  const secondHalfBookings = secondHalf.reduce((sum, r) => sum + r.totalBookings, 0);
  
  const bookingGrowth = firstHalfBookings > 0
    ? ((secondHalfBookings - firstHalfBookings) / firstHalfBookings) * 100
    : 0;
  
  res.status(200).json({
    success: true,
    data: {
      hotel: {
        id: hotel._id,
        name: hotel.name
      },
      period: {
        start,
        end,
        duration: period
      },
      trends,
      growth: {
        revenue: Math.round(revenueGrowth * 100) / 100,
        bookings: Math.round(bookingGrowth * 100) / 100
      }
    }
  });
});

/**
 * @desc    Update revenue data for specific date
 * @route   POST /api/revenue/hotel/:hotelId/update
 * @access  Private (System/Admin only)
 */
exports.updateRevenueData = catchAsync(async (req, res, next) => {
  const { hotelId } = req.params;
  const { date } = req.body;
  
  const targetDate = date ? new Date(date) : new Date();
  
  const revenue = await Revenue.updateRevenueForDate(hotelId, targetDate);
  
  if (!revenue) {
    return next(new AppError('Failed to update revenue data', 500));
  }
  
  res.status(200).json({
    success: true,
    message: 'Revenue data updated successfully',
    data: revenue
  });
});

/**
 * @desc    Get partner's revenue across all hotels
 * @route   GET /api/revenue/partner/summary
 * @access  Private (HotelPartner)
 */
exports.getPartnerRevenueSummary = catchAsync(async (req, res, next) => {
  const partnerId = req.user.id;
  const { startDate, endDate } = req.query;
  
  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
  const end = endDate ? new Date(endDate) : new Date();
  
  const revenueByHotel = await Revenue.getPartnerRevenue(partnerId, start, end);
  
  const totalRevenue = revenueByHotel.reduce((sum, h) => sum + h.totalRevenue, 0);
  const totalBookings = revenueByHotel.reduce((sum, h) => sum + h.totalBookings, 0);
  const avgOccupancy = revenueByHotel.length > 0
    ? revenueByHotel.reduce((sum, h) => sum + h.avgOccupancyRate, 0) / revenueByHotel.length
    : 0;
  
  res.status(200).json({
    success: true,
    data: {
      period: {
        start,
        end
      },
      summary: {
        totalRevenue,
        totalBookings,
        avgOccupancyRate: Math.round(avgOccupancy * 100) / 100,
        totalHotels: revenueByHotel.length
      },
      byHotel: revenueByHotel
    }
  });
});

module.exports = exports;
