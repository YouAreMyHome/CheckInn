import { clsx } from 'clsx';
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({ 
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  ...props 
}, ref) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300',
    outline: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
          {typeof children === 'string' ? 'Loading...' : children}
        </>
      ) : (
        <>
          {Icon && <Icon className="h-4 w-4 mr-2" />}
          {children}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;