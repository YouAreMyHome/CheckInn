import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { adminAuthService } from '../services/adminAuthService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { useNotification } from '../../../shared/components/NotificationProvider';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshAuthState } = useAuth();
  const notify = useNotification();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Check for messages from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

  // Form validation
  const validateForm = () => {
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors when user starts typing
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Use admin auth service for enhanced security
      const result = await adminAuthService.adminLogin(formData.email, formData.password);
      console.log('Login result:', result); // Debug log
      
      setSuccessMessage('Login successful! Redirecting...');
      
      // Store remember me preference
      if (formData.rememberMe) {
        localStorage.setItem('adminRememberMe', 'true');
      } else {
        localStorage.removeItem('adminRememberMe');
      }
      
      // Show success notification with admin name
      const adminName = result.data?.user?.name || result.data?.user?.fullName || 'Admin';
      notify.loginSuccess(adminName);
      
      // Debug logging
      console.log('Admin login successful, user data:', result.data?.user);
      console.log('Token stored:', localStorage.getItem('token'));
      console.log('User stored:', localStorage.getItem('user'));
      
      // Refresh AuthContext state immediately
      refreshAuthState();
      
      // Redirect to admin dashboard after short delay
      setTimeout(() => {
        console.log('Redirecting to /admin...');
        navigate('/admin');
      }, 1000);
      
    } catch (err) {
      setLoading(false);
      console.log('Admin login error details:', err);
      
      // Determine error type and show appropriate notification for admin
      let errorMessage = 'Đăng nhập thất bại';
      
      if (!navigator.onLine) {
        errorMessage = 'Không có kết nối mạng';
        notify.networkError('📡 Mất kết nối internet. Admin Portal cần kết nối ổn định để bảo mật.');
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'Kết nối quá chậm';
        notify.loginFailed('timeout');
      } else if (err.response?.status === 500 || err.message?.includes('server')) {
        errorMessage = 'Lỗi hệ thống';
        notify.loginFailed('server');
      } else if (err.message?.includes('tài khoản của bạn đã bị tạm khóa') || err.message?.includes('suspended')) {
        errorMessage = 'Tài khoản Admin đã bị tạm khóa';
        notify.suspended('🚫 Tài khoản Admin của bạn đã bị tạm dừng. Đây là vấn đề bảo mật nghiêm trọng - vui lòng liên hệ quản trị viên cấp cao ngay lập tức.');
      } else if (err.message?.includes('inactive') || err.message?.includes('không hoạt động')) {
        errorMessage = 'Tài khoản Admin không hoạt động';
        notify.inactive('⚠️ Tài khoản Admin chưa được kích hoạt hoặc đã bị vô hiệu hóa. Vui lòng liên hệ IT để được hỗ trợ.');
      } else if (err.response?.status === 403 || err.message?.includes('Incorrect email or password') || err.message?.includes('không chính xác')) {
        errorMessage = 'Thông tin đăng nhập Admin không đúng';
        notify.invalidCredentials('🔑 Thông tin đăng nhập Admin không chính xác. Lưu ý: Admin Portal yêu cầu bảo mật cao.');
      } else if (err.message?.includes('role') || err.message?.includes('quyền')) {
        errorMessage = 'Không có quyền truy cập Admin';
        notify.warning('🔒 Tài khoản này không có quyền truy cập Admin Portal. Chỉ Admin được phép truy cập.');
      } else if (err.response?.status === 429) {
        errorMessage = 'Quá nhiều lần thử đăng nhập';
        notify.warning('⏰ Quá nhiều lần thử đăng nhập. Admin Portal bị khóa tạm thời 10 phút để bảo mật.');
      } else {
        errorMessage = 'Lỗi đăng nhập Admin';
        notify.loginFailed('unknown');
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Admin Portal
          </h2>
          <p className="text-blue-200">
            Sign in to access the administration panel
          </p>
          
          {/* Debug - Test Notification Button */}
          <button
            type="button"
            onClick={() => notify.success('🧪 Test notification hoạt động!')}
            className="mt-2 text-xs text-blue-300 hover:text-white underline"
          >
            Test Notification
          </button>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                placeholder="Enter your admin email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-300 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/30 rounded bg-white/10"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-blue-200">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link 
                  to="/admin/forgot-password" 
                  className="text-blue-300 hover:text-white transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`flex items-center space-x-2 p-4 rounded-lg border ${
                error.includes('🚫') || error.includes('suspended') || error.includes('tạm khóa')
                  ? 'bg-orange-500/20 border-orange-500/40 animate-pulse'
                  : 'bg-red-500/20 border-red-500/30'
              }`}>
                <AlertCircle className={`h-5 w-5 flex-shrink-0 ${
                  error.includes('🚫') || error.includes('suspended') || error.includes('tạm khóa')
                    ? 'text-orange-400'
                    : 'text-red-400'
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    error.includes('🚫') || error.includes('suspended') || error.includes('tạm khóa')
                      ? 'text-orange-200'
                      : 'text-red-200'
                  }`}>{error}</p>
                  {(error.includes('🚫') || error.includes('suspended') || error.includes('tạm khóa')) && (
                    <p className="text-orange-300 text-xs mt-1">
                      📞 Liên hệ: support@checkinn.com hoặc hotline: 1900-1234
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="flex items-center space-x-2 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <p className="text-green-200 text-sm">{successMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In to Admin Panel'
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-200 text-sm font-medium">Security Notice</p>
                <p className="text-amber-300 text-xs mt-1">
                  This is a secure admin area. All login attempts are logged and monitored.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-blue-300 text-sm">
            © 2025 CheckInn Admin Portal. All rights reserved.
          </p>
          <p className="text-blue-400 text-xs mt-1">
            Need help? Contact{' '}
            <a href="mailto:admin-support@checkinn.com" className="text-blue-200 hover:text-white transition-colors">
              admin-support@checkinn.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;