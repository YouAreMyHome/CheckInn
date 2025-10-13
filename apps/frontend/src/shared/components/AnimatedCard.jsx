import { motion } from 'framer-motion';

const AnimatedCard = ({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up',
  hover = true,
  ...props 
}) => {
  const directions = {
    up: { y: 30, opacity: 0 },
    down: { y: -30, opacity: 0 },
    left: { x: -30, opacity: 0 },
    right: { x: 30, opacity: 0 }
  };

  const hoverEffect = hover ? {
    y: -5,
    scale: 1.02,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
  } : {};

  return (
    <motion.div
      className={`card ${className}`}
      initial={directions[direction]}
      whileInView={{ 
        x: 0, 
        y: 0, 
        opacity: 1,
        transition: { 
          duration: 0.5, 
          delay: delay,
          ease: "easeOut"
        }
      }}
      whileHover={hoverEffect}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;