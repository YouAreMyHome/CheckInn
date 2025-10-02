import React from 'react';
import { Spin } from 'antd';

const LoadingSpinner = ({ size = 'default', tip = 'Đang tải...', className = '' }) => {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <Spin size={size} tip={tip} />
    </div>
  );
};

export default LoadingSpinner;