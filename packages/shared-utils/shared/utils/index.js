// Utility functions for CheckInn OTA

export const calculateNights = (checkInDate, checkOutDate) => {
  if (!checkInDate || !checkOutDate) return 0;
  
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const timeDiff = checkOut.getTime() - checkIn.getTime();
  const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return Math.max(0, dayDiff);
};

export const isValidDateRange = (checkInDate, checkOutDate) => {
  if (!checkInDate || !checkOutDate) return false;
  
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return checkIn >= today && checkOut > checkIn;
};

// Date utilities
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '';
  
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY HH:mm':
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    default:
      return `${day}/${month}/${year}`;
  }
};

export const parseDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString);
};

export const isDateAfter = (date1, date2) => {
  return new Date(date1) > new Date(date2);
};

export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Currency utilities
export const formatCurrency = (amount, currency = 'VND') => {
  if (!amount && amount !== 0) return '';
  
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'VND' ? 0 : 2,
  });
  
  return formatter.format(amount);
};

export const formatNumber = (number) => {
  if (!number && number !== 0) return '';
  return new Intl.NumberFormat('vi-VN').format(number);
};

// String utilities
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + suffix;
};

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Validation utilities
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone);
};

export const isValidPassword = (password) => {
  return password && password.length >= 8;
};

// Array utilities
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (direction === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
};

export const filterBy = (array, filters) => {
  return array.filter(item => {
    return Object.keys(filters).every(key => {
      const filterValue = filters[key];
      const itemValue = item[key];
      
      if (filterValue === null || filterValue === undefined || filterValue === '') {
        return true;
      }
      
      if (Array.isArray(filterValue)) {
        return filterValue.includes(itemValue);
      }
      
      if (typeof filterValue === 'string') {
        return itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
      }
      
      return itemValue === filterValue;
    });
  });
};

// Object utilities
export const isEmpty = (obj) => {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
};

export const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

export const pick = (obj, keys) => {
  const result = {};
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

// URL utilities
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item));
      } else {
        searchParams.append(key, value);
      }
    }
  });
  
  return searchParams.toString();
};

export const parseQueryString = (queryString) => {
  const params = {};
  const searchParams = new URLSearchParams(queryString);
  
  for (let [key, value] of searchParams) {
    if (params[key]) {
      if (Array.isArray(params[key])) {
        params[key].push(value);
      } else {
        params[key] = [params[key], value];
      }
    } else {
      params[key] = value;
    }
  }
  
  return params;
};

// Local Storage utilities
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// Debounce utility
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Throttle utility
export const throttle = (func, delay) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, delay);
    }
  };
};

// Device detection
export const isMobile = () => {
  return window.innerWidth <= 768;
};

export const isTablet = () => {
  return window.innerWidth > 768 && window.innerWidth <= 1024;
};

export const isDesktop = () => {
  return window.innerWidth > 1024;
};

// Image utilities
export const getImageUrl = (imagePath, size = 'original') => {
  if (!imagePath) return '/images/placeholder.jpg';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Handle Cloudinary URLs with size transformation
  if (imagePath.includes('cloudinary')) {
    const sizeTransforms = {
      thumbnail: 'c_thumb,w_150,h_150',
      small: 'c_fill,w_300,h_200',
      medium: 'c_fill,w_600,h_400',
      large: 'c_fill,w_1200,h_800',
      original: ''
    };
    
    const transform = sizeTransforms[size] || '';
    return transform ? imagePath.replace('/upload/', `/upload/${transform}/`) : imagePath;
  }
  
  return imagePath;
};

// Error handling theo API Documentation format
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const data = error.response.data;
    
    // Format theo API Documentation
    if (data && typeof data === 'object') {
      return {
        message: data.message || getStatusMessage(error.response.status),
        status: error.response.status,
        errors: data.errors || null,
        success: false,
        data: null
      };
    }
    
    return {
      message: getStatusMessage(error.response.status),
      status: error.response.status,
      errors: null,
      success: false,
      data: null
    };
  } else if (error.request) {
    // Network error
    return {
      message: 'Lỗi kết nối mạng. Vui lòng kiểm tra và thử lại.',
      status: 0,
      errors: null,
      success: false,
      data: null
    };
  } else {
    // Other error
    return {
      message: error.message || 'Đã xảy ra lỗi không xác định',
      status: -1,
      errors: null,
      success: false,
      data: null
    };
  }
};

// Get status message theo API Documentation
const getStatusMessage = (status) => {
  const statusMessages = {
    400: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra và thử lại.',
    401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    403: 'Bạn không có quyền truy cập tính năng này.',
    404: 'Không tìm thấy dữ liệu yêu cầu.',
    429: 'Quá nhiều yêu cầu, vui lòng thử lại sau',
    500: 'Lỗi hệ thống. Vui lòng thử lại sau.',
  };
  
  return statusMessages[status] || 'Đã xảy ra lỗi';
};

const utils = {
  formatDate,
  parseDate,
  isDateAfter,
  getDaysBetween,
  formatCurrency,
  formatNumber,
  capitalize,
  truncateText,
  slugify,
  isValidEmail,
  isValidPhone,
  isValidPassword,
  groupBy,
  sortBy,
  filterBy,
  isEmpty,
  omit,
  pick,
  buildQueryString,
  parseQueryString,
  storage,
  debounce,
  throttle,
  isMobile,
  isTablet,
  isDesktop,
  getImageUrl,
  handleApiError,
};

export default utils;