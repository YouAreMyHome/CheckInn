import { Loader } from 'lucide-react';
import { clsx } from 'clsx';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '',
  text = null 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-gray-600',
    white: 'text-white'
  };

  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center space-y-2">
        <Loader 
          className={clsx(
            'animate-spin',
            sizeClasses[size],
            colorClasses[color]
          )} 
        />
        {text && (
          <p className={clsx(
            'text-sm font-medium',
            colorClasses[color]
          )}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;