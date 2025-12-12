// routes/booking.routes.js
const express = require('express');
const BookingController = require('../controllers/booking.controller');
// Import auth middleware từ file bạn đã upload
const auth = require('../middlewares/auth.middleware'); 

const router = express.Router();

// --- 1. PROTECT ALL ROUTES ---
// Mọi booking đều cần đăng nhập. 
router.use(auth.protect); 

// --- 2. CUSTOMER ROUTES ---
router.get('/my-bookings', BookingController.getMyBookings);
router.post('/', BookingController.createBooking); // Tạo booking
router.patch('/:id/cancel', BookingController.cancelBooking); // Hủy booking
router.get('/:id', BookingController.getBookingById); // Xem chi tiết

// --- 3. PARTNER / ADMIN ROUTES ---
// Chỉ Partner và Admin mới được xem list tổng hoặc confirm/checkin
router.use(auth.restrictTo('HotelPartner', 'Admin'));

router.get('/', BookingController.getAllBookings);
router.patch('/:id/confirm', BookingController.confirmBooking);
router.patch('/:id/check-in', BookingController.checkInBooking);
router.patch('/:id/check-out', BookingController.checkOutBooking);
router.get('/analytics/overview', BookingController.getBookingAnalytics);

module.exports = router;