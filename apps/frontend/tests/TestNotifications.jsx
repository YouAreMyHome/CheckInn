import React from 'react';
import { useNotification } from '../src/shared/components/NotificationProvider';

const TestNotifications = () => {
  const notify = useNotification();

  const testNotifications = [
    {
      label: '✅ Success Login',
      action: () => notify.loginSuccess('Nguyễn Văn An')
    },
    {
      label: '❌ Invalid Credentials', 
      action: () => notify.invalidCredentials('🔑 Thông tin đăng nhập không chính xác.')
    },
    {
      label: '🚫 Suspended Account',
      action: () => notify.suspended('🚫 Tài khoản đã bị tạm khóa do vi phạm chính sách.')
    },
    {
      label: '⚠️ Inactive Account',
      action: () => notify.inactive('⚠️ Tài khoản chưa được kích hoạt.')
    },
    {
      label: '📡 Network Error',
      action: () => notify.networkError('📡 Lỗi kết nối mạng. Vui lòng thử lại.')
    },
    {
      label: '📝 Validation Error',
      action: () => notify.validation('📧 Địa chỉ email không hợp lệ.')
    },
    {
      label: '⚠️ Rate Limit Warning',
      action: () => notify.warning('⏰ Quá nhiều lần thử. Vui lòng đợi 5 phút.')
    },
    {
      label: '🔧 Server Error',
      action: () => notify.loginFailed('server')
    },
    {
      label: '⏰ Timeout Error',
      action: () => notify.loginFailed('timeout')
    },
    {
      label: '❓ Unknown Error',
      action: () => notify.loginFailed('unknown')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🧪 Notification System Test
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testNotifications.map((test, index) => (
              <button
                key={index}
                onClick={test.action}
                className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-left transition-colors"
              >
                <span className="font-medium text-blue-900">{test.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">📋 Test Instructions:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Click each button to test different notification types</li>
              <li>• Check that notifications appear in top-right corner</li>
              <li>• Verify auto-dismiss timers work correctly</li>
              <li>• Test manual close buttons</li>
              <li>• Suspended/Inactive notifications should not auto-dismiss</li>
              <li>• Contact info should appear for suspended accounts</li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <a 
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Real Login →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestNotifications;