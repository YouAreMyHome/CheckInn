// Validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      message: 'Mật khẩu là bắt buộc'
    };
  }
  
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Mật khẩu phải có ít nhất 8 ký tự'
    };
  }
  
  // Check for complex password requirements (matching backend)
  const complexPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  if (!complexPasswordRegex.test(password)) {
    return {
      isValid: false,
      message: 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt (@$!%*?&)'
    };
  }
  
  return {
    isValid: true,
    message: ''
  };
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export const validatePhone = (phone) => {
  // Vietnamese phone number: 10-11 digits, can start with 0
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone);
};

export const validateConfirmPassword = (password, confirmPassword) => {
  return password === confirmPassword;
};

// Form validation helper
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    if (rule.required && !validateRequired(value)) {
      errors[field] = rule.messages?.required || 'Trường này là bắt buộc';
    } else if (rule.email && value && !validateEmail(value)) {
      errors[field] = rule.messages?.email || 'Email không hợp lệ';
    } else if (rule.password && value && !validatePassword(value)) {
      errors[field] = rule.messages?.password || 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (rule.phone && value && !validatePhone(value)) {
      errors[field] = rule.messages?.phone || 'Số điện thoại không hợp lệ';
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validationUtils = {
  validateEmail,
  validatePassword,
  validateRequired,
  validatePhone,
  validateConfirmPassword,
  validateForm
};

export default validationUtils;