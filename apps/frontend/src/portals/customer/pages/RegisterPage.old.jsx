import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle, Loader2, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { authService } from '../../../shared/services';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Customer',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/;
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid Vietnamese phone number (e.g., 0901234567)';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    return newErrors;
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength < 2) return { level: 'weak', color: 'bg-red-500', text: 'Weak' };
    if (strength < 4) return { level: 'medium', color: 'bg-yellow-500', text: 'Medium' };
    return { level: 'strong', color: 'bg-green-500', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess('');

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword: _, agreeToTerms: __, ...registrationData } = formData;
      const response = await authService.register(registrationData);

      if (response.success) {
        setSuccess('Registration successful! Please check your email to verify your account.');
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Registration successful! Please log in.' }
          });
        }, 2000);
      } else {
        setErrors({ general: response.message || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: error.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Registration Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Back to Home Link - Desktop */}
          <div className="hidden lg:block mb-8">
            <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>

          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">CheckInn</span>
            </Link>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create your account
            </h2>
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number (e.g., 0901234567)"
                />
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${(passwordStrength.level === 'weak' ? 25 : passwordStrength.level === 'medium' ? 50 : 100)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.level === 'weak' ? 'text-red-600' :
                      passwordStrength.level === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="Customer">Customer - Book and manage reservations</option>
                <option value="HotelPartner">Hotel Partner - Manage hotel properties</option>
              </select>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className={`mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                  errors.agreeToTerms ? 'border-red-300' : ''
                }`}
              />
              <label htmlFor="agreeToTerms" className="ml-3 text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-green-700 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-6">
              Join CheckInn Community
            </h1>
            <p className="text-xl text-green-100 mb-8">
              Start your journey with us. Whether you're looking for the perfect stay or wanting to list your property, we've got you covered.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span className="text-green-100">Free account with instant access</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span className="text-green-100">Exclusive member discounts</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span className="text-green-100">Personalized recommendations</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span className="text-green-100">Priority customer support</span>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 bg-white/10 rounded-full"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-white/5 rounded-full"></div>
      </div>
    </div>
  );
};

export default RegisterPage;