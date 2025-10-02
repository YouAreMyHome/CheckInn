/**
 * Format utilities for displaying data in consistent format
 */

/**
 * Format currency with locale support
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'VND')
 * @param {string} locale - Locale string (default: 'vi-VN')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'VND', locale = 'vi-VN') => {
  if (amount == null || isNaN(amount)) return '0 ₫';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currency codes
    return `${new Intl.NumberFormat(locale).format(amount)} ₫`;
  }
};

/**
 * Format large numbers with K, M, B suffixes
 * @param {number} num - Number to format
 * @param {number} precision - Decimal places (default: 1)
 * @returns {string} Formatted number string
 */
export const formatNumber = (num, precision = 1) => {
  if (num == null || isNaN(num)) return '0';
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1000000000) {
    return (num / 1000000000).toFixed(precision) + 'B';
  } else if (absNum >= 1000000) {
    return (num / 1000000).toFixed(precision) + 'M';
  } else if (absNum >= 1000) {
    return (num / 1000).toFixed(precision) + 'K';
  }
  
  return num.toString();
};

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'full')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  const options = {
    short: { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    },
    long: { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    },
    full: { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }
  };
  
  return dateObj.toLocaleDateString('vi-VN', options[format] || options.short);
};

/**
 * Format time duration (in minutes) to readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return '0 phút';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes} phút`;
  } else if (remainingMinutes === 0) {
    return `${hours} giờ`;
  } else {
    return `${hours} giờ ${remainingMinutes} phút`;
  }
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Vietnamese phone numbers
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  } else if (cleaned.length === 11 && cleaned.startsWith('84')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  
  return phone;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text || '';
  
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Format rating to display with stars
 * @param {number} rating - Rating value (0-5)
 * @param {number} precision - Decimal places (default: 1)
 * @returns {string} Formatted rating string
 */
export const formatRating = (rating, precision = 1) => {
  if (rating == null || isNaN(rating)) return '0.0';
  
  const clampedRating = Math.max(0, Math.min(5, rating));
  return clampedRating.toFixed(precision);
};