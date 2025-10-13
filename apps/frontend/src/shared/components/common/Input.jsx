import { clsx } from 'clsx';
import { forwardRef } from 'react';

const Input = forwardRef(({ 
  className = '', 
  error, 
  icon: Icon,
  ...props 
}, ref) => {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <input
        ref={ref}
        className={clsx(
          'block w-full px-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
          {
            'pl-10': Icon,
            'border-red-300': error,
            'border-gray-300': !error,
          },
          className
        )}
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';

export default Input;