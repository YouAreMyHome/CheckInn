import { AlertCircle, Ban, AlertTriangle, Phone, Mail, MessageCircle } from 'lucide-react';

const AccountStatusAlert = ({ error }) => {
  const isSuspended = error.includes('🚫') || error.includes('suspended') || error.includes('tạm khóa');
  const isInactive = error.includes('⚠️') || error.includes('inactive') || error.includes('không hoạt động');
  
  const getStatusIcon = () => {
    if (isSuspended) return <Ban className="h-6 w-6 text-orange-500" />;
    if (isInactive) return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
    return <AlertCircle className="h-6 w-6 text-red-500" />;
  };

  const getStatusColor = () => {
    if (isSuspended) return 'orange';
    if (isInactive) return 'yellow';
    return 'red';
  };

  const statusColor = getStatusColor();

  return (
    <div className={`
      p-6 rounded-xl border-2 shadow-lg
      ${statusColor === 'orange' ? 'bg-orange-50 border-orange-200' : ''}
      ${statusColor === 'yellow' ? 'bg-yellow-50 border-yellow-200' : ''}
      ${statusColor === 'red' ? 'bg-red-50 border-red-200' : ''}
      ${isSuspended ? 'animate-pulse' : ''}
    `}>
      <div className="flex items-start space-x-4">
        <div className={`
          p-3 rounded-full
          ${statusColor === 'orange' ? 'bg-orange-100' : ''}
          ${statusColor === 'yellow' ? 'bg-yellow-100' : ''}
          ${statusColor === 'red' ? 'bg-red-100' : ''}
        `}>
          {getStatusIcon()}
        </div>
        
        <div className="flex-1">
          <h3 className={`
            text-lg font-semibold mb-2
            ${statusColor === 'orange' ? 'text-orange-800' : ''}
            ${statusColor === 'yellow' ? 'text-yellow-800' : ''}
            ${statusColor === 'red' ? 'text-red-800' : ''}
          `}>
            {isSuspended ? 'Tài khoản bị tạm khóa' : isInactive ? 'Tài khoản không hoạt động' : 'Lỗi đăng nhập'}
          </h3>
          
          <p className={`
            text-sm mb-4
            ${statusColor === 'orange' ? 'text-orange-700' : ''}
            ${statusColor === 'yellow' ? 'text-yellow-700' : ''}
            ${statusColor === 'red' ? 'text-red-700' : ''}
          `}>
            {error}
          </p>

          {(isSuspended || isInactive) && (
            <div className={`
              p-4 rounded-lg border-l-4
              ${statusColor === 'orange' ? 'bg-orange-100 border-orange-400' : ''}
              ${statusColor === 'yellow' ? 'bg-yellow-100 border-yellow-400' : ''}
            `}>
              <h4 className={`
                font-semibold text-sm mb-3 flex items-center
                ${statusColor === 'orange' ? 'text-orange-800' : ''}
                ${statusColor === 'yellow' ? 'text-yellow-800' : ''}
              `}>
                <Phone className="h-4 w-4 mr-2" />
                Liên hệ hỗ trợ ngay:
              </h4>
              
              <div className={`
                space-y-2 text-xs
                ${statusColor === 'orange' ? 'text-orange-700' : ''}
                ${statusColor === 'yellow' ? 'text-yellow-700' : ''}
              `}>
                <div className="flex items-center space-x-2">
                  <Mail className="h-3 w-3" />
                  <span>Email: support@checkinn.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-3 w-3" />
                  <span>Hotline: 1900-1234 (8:00 - 22:00 hàng ngày)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-3 w-3" />
                  <span>Live Chat: checkinn.com/support</span>
                </div>
              </div>

              {isSuspended && (
                <div className="mt-3 p-2 bg-white/50 rounded text-xs">
                  <p className="font-semibold text-orange-800">Lưu ý:</p>
                  <p className="text-orange-700">Tài khoản có thể bị khóa do vi phạm chính sách sử dụng hoặc hoạt động bất thường. Vui lòng liên hệ để được hỗ trợ mở khóa.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountStatusAlert;