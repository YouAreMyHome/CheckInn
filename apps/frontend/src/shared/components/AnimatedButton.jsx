import { motion } from 'framer-motion';

const AnimatedButton = ({ 
  children, 
  onClick, 
  className = '', 
  type = 'button',
  disabled = false,
  variant = 'primary',
  ...props 
}) => {
  const baseClasses = "font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
    outline: "border border-gray-300 hover:border-gray-400 text-gray-700 bg-transparent"
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;