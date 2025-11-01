import { useNotification } from '../shared/components/NotificationProvider';

const NotificationTest = () => {
  const notify = useNotification();

  const testNotifications = () => {
    notify.success('✅ Test thành công!');
    
    setTimeout(() => {
      notify.error('❌ Test lỗi!');
    }, 1000);
    
    setTimeout(() => {
      notify.warning('⚠️ Test cảnh báo!');
    }, 2000);
    
    setTimeout(() => {
      notify.suspended('🚫 Test tài khoản bị khóa!');
    }, 3000);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Notification Test</h2>
      <button
        onClick={testNotifications}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test All Notifications
      </button>
    </div>
  );
};

export default NotificationTest;