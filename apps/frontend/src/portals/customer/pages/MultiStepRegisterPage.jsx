/**
 * Multi-Step Registration Page for CheckInn
 * 
 * 5-step registration process:
 * 1. Enter Email
 * 2. Verify OTP
 * 3. Set Password
 * 4. Enter Phone
 * 5. Complete Registration
 * 
 * @author CheckInn Team
 * @version 2.0.0
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@hooks/useAuth';
import { 
  Mail, 
  Shield, 
  Lock, 
  Phone, 
  User, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2,
  ArrowRight,
  ArrowLeft,
  Clock
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MultiStepRegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
    phone: '',
    name: ''
  });

  // Progress calculation
  const progress = ((currentStep + 1) / 5) * 100;

  // Handle form input changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  /**
   * BƯỚC 1: Send OTP to Email
   */
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/register/send-otp`, {
        email: formData.email,
      });

      if (response.data.success) {
        setCurrentStep(1);
        startOTPTimer();
        // Success notification will be handled in UI
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * BƯỚC 2: Verify OTP
   */
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter the 6-digit OTP code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/register/verify-otp`, {
        email: formData.email,
        otp: formData.otp,
      });

      if (response.data.success) {
        setCurrentStep(2);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid OTP code';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * BƯỚC 3: Set Password
   */
  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/register/set-password`, {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.data.success) {
        setCurrentStep(3);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to set password';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * BƯỚC 4: Set Phone Number
   */
  const handleSetPhone = async (e) => {
    e.preventDefault();
    if (!formData.phone) {
      setError('Please enter your phone number');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/register/set-phone`, {
        email: formData.email,
        phone: formData.phone,
      });

      if (response.data.success) {
        setCurrentStep(4);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid phone number';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * BƯỚC 5: Complete Registration
   */
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.name.length < 2) {
      setError('Please enter your full name');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const registrationResponse = await axios.post(`${API_URL}/register/complete`, {
        email: formData.email,
        name: formData.name,
      });

      if (registrationResponse.data.success) {
        setSuccess('🎉 Account created successfully! Signing you in...');
        
        // Auto-login after successful registration
        try {
          const loginResponse = await login({
            email: formData.email,
            password: formData.password
          });
          
          if (loginResponse.success) {
            setSuccess('✅ Welcome! Redirecting to your dashboard...');
            
            // Delay redirect to show success message
            setTimeout(() => {
              // Redirect based on user role (similar to LoginPage logic)
              const userRole = loginResponse.data.user.role;
              if (userRole === 'Admin') {
                navigate('/admin');
              } else if (userRole === 'HotelPartner') {
                navigate('/hotel-manager');
              } else {
                navigate('/'); // Redirect to home page for regular customers
              }
            }, 1500);
          }
        } catch (loginErr) {
          // If auto-login fails, redirect to login page
          console.error('Auto-login failed:', loginErr);
          setSuccess('Account created! Redirecting to login...');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to complete registration';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend OTP
   */
  const handleResendOTP = async () => {
    if (otpTimer > 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/register/send-otp`, {
        email: formData.email,
      });

      if (response.data.success) {
        startOTPTimer();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to resend OTP';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * OTP Timer (60 seconds cooldown)
   */
  const startOTPTimer = () => {
    setOtpTimer(60);

    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Back to previous step
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  /**
   * Animation variants
   */
  const containerVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 50, transition: { duration: 0.3 } },
  };

  /**
   * Steps configuration
   */
  const steps = [
    {
      title: 'Email',
      icon: Mail,
      description: 'Enter your email address',
    },
    {
      title: 'Verify',
      icon: Shield,
      description: 'Enter OTP code',
    },
    {
      title: 'Password',
      icon: Lock,
      description: 'Set your password',
    },
    {
      title: 'Phone',
      icon: Phone,
      description: 'Enter phone number',
    },
    {
      title: 'Complete',
      icon: User,
      description: 'Complete registration',
    },
  ];

  /**
   * Render step content
   */
  const renderStepContent = () => {
    const currentStepConfig = steps[currentStep];
    const IconComponent = currentStepConfig.icon;

    switch (currentStep) {
      case 0:
        return (
          <div>
            <div className="text-center mb-8">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <IconComponent className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enter your email</h3>
              <p className="text-gray-600">We'll send you a verification code</p>
            </div>

            <form onSubmit={handleSendOTP} className="space-y-6">
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
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Sending...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        );

      case 1:
        return (
          <div>
            <div className="text-center mb-8">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <IconComponent className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enter verification code</h3>
              <p className="text-gray-600">
                We've sent a 6-digit code to <strong>{formData.email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength={6}
                    value={formData.otp}
                    onChange={(e) => handleChange('otp', e.target.value.replace(/\D/g, ''))}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-2xl tracking-widest"
                    placeholder="000000"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Code
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>

              <div className="text-center">
                {otpTimer > 0 ? (
                  <div className="flex items-center justify-center space-x-2 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Resend code in {otpTimer}s</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50"
                  >
                    Resend verification code
                  </button>
                )}
              </div>
            </form>
          </div>
        );

      case 2:
        return (
          <div>
            <div className="text-center mb-8">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <IconComponent className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Create a password</h3>
              <p className="text-gray-600">Choose a strong password to secure your account</p>
            </div>

            <form onSubmit={handleSetPassword} className="space-y-6">
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
                    required
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your password"
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
                <p className="mt-2 text-xs text-gray-500">
                  Must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
              </div>

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
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Setting Password...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        );

      case 3:
        return (
          <div>
            <div className="text-center mb-8">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <IconComponent className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Add your phone</h3>
              <p className="text-gray-600">We'll use this to contact you if needed</p>
            </div>

            <form onSubmit={handleSetPhone} className="space-y-6">
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
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        );

      case 4:
        return (
          <div>
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Almost done!</h3>
              <p className="text-gray-600">Just tell us your name to complete registration</p>
            </div>

            <form onSubmit={handleCompleteRegistration} className="space-y-6">
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
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Creating Account & Signing In...
                  </>
                ) : (
                  <>
                    Complete Registration 🎉
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Left side - Branding/Image */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div 
            className="max-w-md"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.h1 
              className="text-4xl font-bold mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Join CheckInn Today
            </motion.h1>
            <motion.p 
              className="text-xl text-blue-100 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Create your account to unlock exclusive deals and manage your bookings with ease.
            </motion.p>
            
            {/* Progress Indicator */}
            <motion.div 
              className="mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-blue-100 text-sm">Step {currentStep + 1} of 5</span>
                <span className="text-blue-100 text-sm">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-blue-800/50 rounded-full h-2">
                <motion.div 
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </motion.div>

            {/* Steps Navigation */}
            <motion.div 
              className="space-y-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <div 
                    key={index} 
                    className={`flex items-center space-x-3 ${
                      isCompleted ? 'text-white' : 
                      isCurrent ? 'text-blue-200' : 'text-blue-300/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-white/20' : 
                      isCurrent ? 'bg-blue-500' : 'bg-blue-800/30'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <IconComponent className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{step.title}</div>
                      <div className="text-sm opacity-75">{step.description}</div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
        
        {/* Decorative shapes */}
        <motion.div 
          className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-20 left-20 w-20 h-20 bg-white/10 rounded-full"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        ></motion.div>
      </motion.div>

      {/* Right side - Registration Form */}
      <motion.div 
        className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <motion.div 
          className="mx-auto w-full max-w-sm lg:w-96"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
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

          {/* Mobile Progress */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Step {currentStep + 1} of 5</span>
              <span className="text-gray-600 text-sm">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div 
                className="bg-blue-600 rounded-full h-2 transition-all duration-300"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

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

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep > 0 && currentStep < 4 && (
            <div className="mt-6">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default MultiStepRegisterPage;
