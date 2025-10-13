import { AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

const ErrorMessage = ({ 
  error, 
  onRetry = null, 
  className = '',
  variant = 'default',
  showIcon = true 
}) => {
  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.message) return error.message;
    return 'Something went wrong. Please try again.';
  };

  const variants = {
    default: 'bg-red-50 border border-red-200 text-red-700',
    minimal: 'text-red-600',
    card: 'bg-white border border-red-200 shadow-sm text-red-700'
  };

  return (
    <div className={clsx(
      'rounded-lg p-4',
      variants[variant],
      className
    )}>
      <div className="flex items-center space-x-3">
        {showIcon && (
          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium">
            {getErrorMessage(error)}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center space-x-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;