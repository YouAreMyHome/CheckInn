import React from 'react';
import { Empty, Button } from 'antd';
import { Home } from 'lucide-react';

const EmptyState = ({ 
  title = 'Không có dữ liệu',
  description = 'Hiện tại chưa có thông tin để hiển thị',
  image = null,
  action = null,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <Empty
        image={image || Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500">{description}</p>
          </div>
        }
      >
        {action || (
          <Button 
            type="primary" 
            icon={<Home size={16} />}
            onClick={() => window.location.href = '/'}
          >
            Về trang chủ
          </Button>
        )}
      </Empty>
    </div>
  );
};

export default EmptyState;