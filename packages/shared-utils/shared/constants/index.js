// Application Constants
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'Customer',
  PARTNER: 'Partner',
  HOTEL_PARTNER: 'HotelPartner',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'SuperAdmin',
  SUPPORT: 'Support'
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  CHECKED_IN: 'CheckedIn',
  CHECKED_OUT: 'CheckedOut',
  NO_SHOW: 'NoShow'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  REFUNDED: 'Refunded'
};

// Hotel Categories
export const HOTEL_CATEGORIES = {
  LUXURY: 'Luxury',
  BUSINESS: 'Business',
  BOUTIQUE: 'Boutique',
  RESORT: 'Resort',
  BUDGET: 'Budget',
  HOSTEL: 'Hostel'
};

// Room Types
export const ROOM_TYPES = {
  STANDARD: 'Standard',
  DELUXE: 'Deluxe',
  SUITE: 'Suite',
  PREMIUM: 'Premium',
  EXECUTIVE: 'Executive',
  FAMILY: 'Family'
};

// Navigation Routes
export const ROUTES = {
  // Public Routes
  HOME: '/',
  SEARCH: '/search',
  HOTEL_DETAIL: '/hotel/:id',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // User Routes
  USER_DASHBOARD: '/dashboard',
  USER_PROFILE: '/profile',
  MY_BOOKINGS: '/my-bookings',
  BOOKING: '/booking/:id',
  BOOKING_CONFIRMATION: '/booking-confirmation/:id',
  
  // Hotel Partner Routes
  HOTEL_DASHBOARD: '/hotel',
  HOTEL_ROOMS: '/hotel/rooms',
  HOTEL_BOOKINGS: '/hotel/bookings',
  HOTEL_REPORTS: '/hotel/reports',
  HOTEL_SETTINGS: '/hotel/settings',
  
  // Admin Routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_HOTELS: '/admin/hotels',
  ADMIN_USERS: '/admin/users',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_TRANSACTIONS: '/admin/transactions',
  ADMIN_SETTINGS: '/admin/settings'
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  ME: '/auth/me',
  
  // Hotels
  HOTELS: '/hotels',
  HOTEL_SEARCH: '/hotels/search',
  MY_HOTELS: '/hotels/my/hotels',
  
  // Bookings
  BOOKINGS: '/bookings',
  MY_BOOKINGS: '/bookings/my',
  
  // Users
  USERS: '/users',
  
  // Admin
  ADMIN_STATS: '/admin/stats',
};

// Form Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{10,11}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
  SEARCH_PAGE_SIZE: 12,
};

// Image Upload
export const IMAGE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILES: 10,
};

// Currencies
export const CURRENCIES = {
  VND: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
};

// Languages
export const LANGUAGES = {
  VI: { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  EN: { code: 'en', name: 'English', flag: '🇺🇸' },
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DATETIME_DISPLAY: 'DD/MM/YYYY HH:mm',
  DATETIME_API: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'checkin_token',
  REFRESH_TOKEN: 'checkin_refresh_token',
  USER: 'checkin_user',
  LANGUAGE: 'checkin_language',
  CURRENCY: 'checkin_currency',
  SEARCH_HISTORY: 'checkin_search_history',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra và thử lại.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền truy cập tính năng này.',
  NOT_FOUND: 'Không tìm thấy dữ liệu yêu cầu.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra và thử lại.',
  SERVER_ERROR: 'Lỗi hệ thống. Vui lòng thử lại sau.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Đăng nhập thành công!',
  REGISTER: 'Đăng ký tài khoản thành công!',
  BOOKING_CREATED: 'Đặt phòng thành công!',
  BOOKING_CANCELLED: 'Hủy phòng thành công!',
  PROFILE_UPDATED: 'Cập nhật thông tin thành công!',
  PASSWORD_CHANGED: 'Đổi mật khẩu thành công!',
};

const constants = {
  API_BASE_URL,
  USER_ROLES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  HOTEL_CATEGORIES,
  ROOM_TYPES,
  ROUTES,
  API_ENDPOINTS,
  VALIDATION_RULES,
  PAGINATION,
  IMAGE_UPLOAD,
  CURRENCIES,
  LANGUAGES,
  DATE_FORMATS,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};

export default constants;