import React, { useState, createContext, useContext } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info, Ban } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    console.warn('useNotification called outside NotificationProvider, using fallback');
    return {
      success: (msg) => console.log('✅ SUCCESS:', msg),
      error: (msg) => console.log('❌ ERROR:', msg),
      warning: (msg) => console.log('⚠️ WARNING:', msg),
      info: (msg) => console.log('ℹ️ INFO:', msg),
      suspended: (msg) => console.log('🚫 SUSPENDED:', msg),
      inactive: (msg) => console.log('⚠️ INACTIVE:', msg),
      invalidCredentials: (msg) => console.log('🔑 INVALID CREDENTIALS:', msg),
      networkError: (msg) => console.log('📡 NETWORK ERROR:', msg),
      validation: (msg) => console.log('📝 VALIDATION:', msg),
      loginSuccess: (userName) => console.log('🎉 LOGIN SUCCESS:', userName),
      loginFailed: (reason) => console.log('🚫 LOGIN FAILED:', reason),
    };
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };
    
    console.log('🔔 Adding notification:', { message, type, duration });
    setNotifications(prev => {
      console.log('📋 Current notifications count:', prev.length);
      const newNotifications = [...prev, notification];
      console.log('📋 New notifications count:', newNotifications.length);
      return newNotifications;
    });

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Notification methods
  const notify = {
    success: (message, duration) => addNotification(message, 'success', duration),
    error: (message, duration) => addNotification(message, 'error', duration),
    warning: (message, duration) => addNotification(message, 'warning', duration),
    info: (message, duration) => addNotification(message, 'info', duration),
    suspended: (message, duration = 0) => addNotification(message, 'suspended', duration), // 0 = no auto-dismiss
    inactive: (message, duration = 0) => addNotification(message, 'inactive', duration),
    invalidCredentials: (message, duration = 6000) => addNotification(message, 'invalidCredentials', duration),
    networkError: (message, duration = 8000) => addNotification(message, 'networkError', duration),
    validation: (message, duration = 4000) => addNotification(message, 'validation', duration),
    loginSuccess: (userName, duration = 3000) => addNotification(`🎉 Chào mừng ${userName} đã đăng nhập thành công!`, 'success', duration),
    loginFailed: (reason = 'unknown', duration = 6000) => {
      const messages = {
        credentials: '❌ Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin đăng nhập.',
        suspended: '🚫 Tài khoản đã bị tạm khóa do vi phạm chính sách. Vui lòng liên hệ bộ phận hỗ trợ.',
        inactive: '⚠️ Tài khoản không hoạt động. Vui lòng liên hệ bộ phận hỗ trợ để kích hoạt lại.',
        network: '📡 Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.',
        server: '🔧 Lỗi hệ thống. Chúng tôi đang khắc phục, vui lòng thử lại sau ít phút.',
        timeout: '⏰ Kết nối quá chậm. Vui lòng thử lại.',
        unknown: '❓ Đăng nhập thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề tiếp tục.'
      };
      addNotification(messages[reason] || messages.unknown, 'error', duration);
    }
  };

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <NotificationContainer 
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = ({ notifications, removeNotification }) => {
  console.log('🎯 NotificationContainer render - notifications count:', notifications.length);
  
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

const NotificationItem = ({ notification, onClose }) => {
  const { message, type } = notification;

  const getNotificationStyle = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-800',
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          animation: 'animate-bounce'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          animation: 'animate-pulse'
        };
      case 'invalidCredentials':
        return {
          bg: 'bg-red-50 border-red-300',
          text: 'text-red-900',
          icon: <AlertCircle className="h-5 w-5 text-red-600" />,
          animation: 'animate-pulse'
        };
      case 'networkError':
        return {
          bg: 'bg-purple-50 border-purple-200',
          text: 'text-purple-800',
          icon: <AlertCircle className="h-5 w-5 text-purple-500" />,
          animation: 'animate-pulse'
        };
      case 'validation':
        return {
          bg: 'bg-amber-50 border-amber-200',
          text: 'text-amber-800',
          icon: <AlertTriangle className="h-5 w-5 text-amber-500" />
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-800',
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />
        };
      case 'suspended':
        return {
          bg: 'bg-orange-50 border-orange-200',
          text: 'text-orange-800',
          icon: <Ban className="h-5 w-5 text-orange-500" />,
          animation: 'animate-pulse'
        };
      case 'inactive':
        return {
          bg: 'bg-gray-50 border-gray-200',
          text: 'text-gray-800', 
          icon: <AlertTriangle className="h-5 w-5 text-gray-500" />
        };
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          icon: <Info className="h-5 w-5 text-blue-500" />
        };
    }
  };

  const style = getNotificationStyle();

  return (
    <div className={`
      ${style.bg} ${style.animation || ''}
      border rounded-lg shadow-lg p-4 
      transform transition-all duration-300 ease-in-out
      hover:shadow-xl hover:scale-105
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className={style.animation && type === 'success' ? 'animate-bounce' : ''}>
            {style.icon}
          </div>
        </div>
        <div className="ml-3 w-0 flex-1">
          <div className={`text-sm font-medium ${style.text}`}>
            {message}
          </div>
          
          {/* Special content for suspended/inactive accounts */}
          {(type === 'suspended' || type === 'inactive') && (
            <div className="mt-3 p-3 bg-white/70 rounded-md border-l-4 border-orange-400">
              <div className="text-xs space-y-1">
                <p className="font-semibold text-orange-900">📞 Liên hệ hỗ trợ ngay:</p>
                <p className="text-orange-800">• Email: support@checkinn.com</p>
                <p className="text-orange-800">• Hotline: 1900-1234 (8:00-22:00)</p>
                <p className="text-orange-800">• Live Chat: checkinn.com/support</p>
                <p className="text-orange-800">• Thời gian hỗ trợ: 24/7</p>
              </div>
            </div>
          )}

          {/* Help text for network errors */}
          {type === 'networkError' && (
            <div className="mt-2 text-xs text-purple-700 bg-purple-100 p-2 rounded">
              <p>💡 <strong>Gợi ý khắc phục:</strong></p>
              <p>• Kiểm tra kết nối Wi-Fi hoặc 4G</p>
              <p>• Thử tải lại trang (F5)</p>
              <p>• Liên hệ IT nếu vấn đề tiếp tục</p>
            </div>
          )}

          {/* Help text for invalid credentials */}
          {type === 'invalidCredentials' && (
            <div className="mt-2 text-xs text-red-700 bg-red-100 p-2 rounded">
              <p>💡 <strong>Kiểm tra lại:</strong></p>
              <p>• Email đã đăng ký chưa?</p>
              <p>• Mật khẩu có phân biệt chữ hoa/thường</p>
              <p>• <a href="/forgot-password" className="underline">Quên mật khẩu?</a></p>
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className={`
              inline-flex ${style.text} hover:opacity-75 transition-opacity
            `}
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationProvider;