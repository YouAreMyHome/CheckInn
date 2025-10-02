import React from 'react';
import PropTypes from 'prop-types';

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const colorClasses = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white',
    green: 'text-green-600',
    red: 'text-red-600',
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Loading Skeleton Component
export const LoadingSkeleton = ({ 
  width = 'w-full', 
  height = 'h-4', 
  rounded = 'rounded',
  className = '' 
}) => {
  return (
    <div 
      className={`
        animate-pulse bg-gray-200 ${width} ${height} ${rounded} ${className}
      `}
    />
  );
};

// Card Loading Skeleton
export const LoadingCard = ({ showImage = true, lines = 3 }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
      {showImage && (
        <LoadingSkeleton 
          width="w-full" 
          height="h-48" 
          rounded="rounded-lg" 
          className="mb-4" 
        />
      )}
      <div className="space-y-2">
        <LoadingSkeleton width="w-3/4" height="h-5" />
        {Array.from({ length: lines }).map((_, index) => (
          <LoadingSkeleton 
            key={index}
            width={index === lines - 1 ? 'w-1/2' : 'w-full'} 
            height="h-4" 
          />
        ))}
      </div>
    </div>
  );
};

// Table Loading Skeleton
export const LoadingTable = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <LoadingSkeleton key={index} width="w-24" height="h-4" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <LoadingSkeleton 
                  key={colIndex} 
                  width={colIndex === 0 ? 'w-32' : 'w-20'} 
                  height="h-4" 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Page Loading Component
export const PageLoading = ({ message = 'Đang tải...' }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
};

// Overlay Loading Component
export const OverlayLoading = ({ message = 'Đang xử lý...', show = true }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 text-center shadow-xl">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-700">{message}</p>
      </div>
    </div>
  );
};

// Button Loading Component
export const ButtonLoading = ({ size = 'sm' }) => {
  return <LoadingSpinner size={size} color="white" />;
};

// Main Loading Component
const Loading = ({ 
  type = 'spinner',
  size = 'md',
  color = 'blue',
  message,
  fullScreen = false,
  overlay = false,
  className = '',
  ...props
}) => {
  if (type === 'skeleton') {
    return <LoadingSkeleton {...props} className={className} />;
  }

  if (type === 'card') {
    return <LoadingCard {...props} />;
  }

  if (type === 'table') {
    return <LoadingTable {...props} />;
  }

  if (fullScreen) {
    return <PageLoading message={message} />;
  }

  if (overlay) {
    return <OverlayLoading message={message} show={true} />;
  }

  const content = (
    <div className={`flex items-center justify-center ${className}`}>
      <LoadingSpinner size={size} color={color} />
      {message && <span className="ml-2 text-gray-600">{message}</span>}
    </div>
  );

  return content;
};

Loading.propTypes = {
  type: PropTypes.oneOf(['spinner', 'skeleton', 'card', 'table']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['blue', 'gray', 'white', 'green', 'red']),
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
  overlay: PropTypes.bool,
  className: PropTypes.string,
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['blue', 'gray', 'white', 'green', 'red']),
};

LoadingSkeleton.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  rounded: PropTypes.string,
  className: PropTypes.string,
};

LoadingCard.propTypes = {
  showImage: PropTypes.bool,
  lines: PropTypes.number,
};

LoadingTable.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.number,
};

PageLoading.propTypes = {
  message: PropTypes.string,
};

OverlayLoading.propTypes = {
  message: PropTypes.string,
  show: PropTypes.bool,
};

ButtonLoading.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
};

export default Loading;