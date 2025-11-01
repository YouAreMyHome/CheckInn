import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../shared/hooks/useAuth';
import { Eye, EyeOff, AlertCircle, Loader2, Mail, Lock, ArrowRight, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { useNotification } from '../../../shared/components/NotificationProvider';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotification();

  // Get redirect path from location state
  const redirectPath = location.state?.from?.pathname || '/';

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      notify.success('🌐 Kết nối internet đã được khôi phục!', 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      notify.warning('📡 Mất kết nối internet. Một số tính năng có thể không hoạt động.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [notify]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (error) setError('');
    
    // Real-time validation feedback
    if (name === 'email' && value && !value.includes('@')) {
      // Show subtle validation hint but don't block submission
    } else if (name === 'password' && value && value.length < 8) {
      // Show password strength hint
    }
  };

  const validateForm = () => {
    // Email validation
    if (!formData.email.trim()) {
      notify.validation('📧 Vui lòng nhập địa chỉ email.');
      return false;
    }
    
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      notify.validation('📧 Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại.');
      return false;
    }
    
    // Password validation
    if (!formData.password.trim()) {
      notify.validation('🔒 Vui lòng nhập mật khẩu.');
      return false;
    }
    
    if (formData.password.length < 6) {
      notify.validation('🔒 Mật khẩu phải có ít nhất 6 ký tự.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');

    console.log('FormData being sent:', formData);

    try {
      const response = await login(formData);
      
      if (response.success) {
        // Show success notification with user name
        const userName = response.data.user.name || response.data.user.fullName || 'User';
        notify.loginSuccess(userName);
        
        // Redirect based on user role
        const userRole = response.data.user.role;
        if (userRole === 'Admin') {
          navigate('/admin');
        } else if (userRole === 'HotelPartner') {
          navigate('/hotel-manager');
        } else {
          navigate(redirectPath);
        }
      }
    } catch (err) {
      console.log('Login error details:', err);
      
      // Determine error type and show appropriate notification
      let errorMessage = 'Đăng nhập thất bại';
      
      if (!navigator.onLine) {
        errorMessage = 'Không có kết nối mạng';
        notify.networkError('📡 Mất kết nối internet. Vui lòng kiểm tra mạng và thử lại.');
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'Kết nối quá chậm';
        notify.loginFailed('timeout');
      } else if (err.response?.status === 500 || err.message?.includes('server')) {
        errorMessage = 'Lỗi hệ thống';
        notify.loginFailed('server');
      } else if (err.message?.includes('tài khoản của bạn đã bị tạm khóa') || err.message?.includes('suspended')) {
        errorMessage = 'Tài khoản đã bị tạm khóa';
        notify.suspended('🚫 Tài khoản của bạn đã bị tạm dừng do vi phạm chính sách sử dụng. Chúng tôi sẽ hỗ trợ bạn giải quyết vấn đề này.');
      } else if (err.message?.includes('inactive') || err.message?.includes('không hoạt động')) {
        errorMessage = 'Tài khoản không hoạt động';
        notify.inactive('⚠️ Tài khoản của bạn hiện chưa được kích hoạt. Vui lòng kiểm tra email hoặc liên hệ hỗ trợ.');
      } else if (err.response?.status === 403 || err.message?.includes('Incorrect email or password') || err.message?.includes('không chính xác')) {
        errorMessage = 'Sai thông tin đăng nhập';
        notify.invalidCredentials('🔑 Thông tin đăng nhập không chính xác. Vui lòng kiểm tra lại email và mật khẩu.');
      } else if (err.response?.status === 429) {
        errorMessage = 'Đăng nhập quá nhiều lần';
        notify.warning('⏰ Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi 5 phút và thử lại.');
      } else {
        errorMessage = 'Lỗi không xác định';
        notify.loginFailed('unknown');
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Left side - Image/Branding */}
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
              Welcome back to CheckInn
            </motion.h1>
            <motion.p 
              className="text-xl text-blue-100 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Your trusted partner for finding the perfect accommodation. 
              Discover amazing hotels and create unforgettable memories.
            </motion.p>
            <motion.div 
              className="space-y-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-300" />
                <span className="text-blue-100">Best Price Guarantee</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-300" />
                <span className="text-blue-100">24/7 Customer Support</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-300" />
                <span className="text-blue-100">Instant Booking Confirmation</span>
              </div>
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

      {/* Right side - Login Form */}
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

          <div className="text-center lg:text-left mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-gray-900">
                Sign in to your account
              </h2>
              {/* Network Status Indicator */}
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                isOnline 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700 animate-pulse'
              }`}>
                {isOnline ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Create one here
              </Link>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-6 rounded-lg p-4 border ${
              error.includes('🚫') || error.includes('suspended') || error.includes('tạm khóa')
                ? 'bg-orange-50 border-orange-200 animate-pulse'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex">
                <AlertCircle className={`h-5 w-5 flex-shrink-0 ${
                  error.includes('🚫') || error.includes('suspended') || error.includes('tạm khóa')
                    ? 'text-orange-400'
                    : 'text-red-400'
                }`} />
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    error.includes('🚫') || error.includes('suspended') || error.includes('tạm khóa')
                      ? 'text-orange-800'
                      : 'text-red-800'
                  }`}>{error}</p>
                  {(error.includes('🚫') || error.includes('suspended') || error.includes('tạm khóa')) && (
                    <div className="mt-2 text-xs text-orange-700 bg-orange-100 p-2 rounded border-l-4 border-orange-400">
                      <p className="font-semibold">📞 Liên hệ hỗ trợ:</p>
                      <p>• Email: support@checkinn.com</p>
                      <p>• Hotline: 1900-1234 (8:00 - 22:00)</p>
                      <p>• Live Chat: checkinn.com/support</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

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
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.email.trim() || !formData.password.trim()}
              className={`
                w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
                transition-all duration-200 ease-in-out
                ${loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : !formData.email.trim() || !formData.password.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md transform hover:scale-105'
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                disabled:opacity-50 disabled:transform-none
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  <span className="animate-pulse">Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;