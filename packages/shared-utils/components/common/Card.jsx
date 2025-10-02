import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  rounded = 'lg',
  border = false,
  hover = false,
  ...props
}) => {
  // Padding styles
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  // Shadow styles
  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  // Rounded styles
  const roundedStyles = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  // Base styles
  const baseStyles = 'bg-white';

  // Border styles
  const borderStyles = border ? 'border border-gray-200' : '';

  // Hover styles
  const hoverStyles = hover ? 'transition-shadow duration-200 hover:shadow-lg' : '';

  // Combine all styles
  const cardClasses = `
    ${baseStyles}
    ${paddingStyles[padding]}
    ${shadowStyles[shadow]}
    ${roundedStyles[rounded]}
    ${borderStyles}
    ${hoverStyles}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

// Card Header Component
export const CardHeader = ({ 
  title, 
  subtitle, 
  action, 
  className = '',
  titleClassName = '',
  subtitleClassName = '',
}) => {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div>
        {title && (
          <h3 className={`text-lg font-semibold text-gray-900 ${titleClassName}`}>
            {title}
          </h3>
        )}
        {subtitle && (
          <p className={`text-sm text-gray-600 mt-1 ${subtitleClassName}`}>
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

// Card Body Component
export const CardBody = ({ children, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

// Card Footer Component
export const CardFooter = ({ 
  children, 
  className = '',
  border = true,
  padding = true,
}) => {
  const borderClass = border ? 'border-t border-gray-200' : '';
  const paddingClass = padding ? 'pt-4 mt-4' : '';

  return (
    <div className={`${borderClass} ${paddingClass} ${className}`}>
      {children}
    </div>
  );
};

// Hotel Card Component (specialized)
export const HotelCard = ({
  hotel,
  onClick,
  showDistance = false,
  showPrice = true,
  className = '',
}) => {
  const {
    name,
    images = [],
    location,
    starRating,
    stats,
    price,
    distance,
  } = hotel;

  const mainImage = images[0]?.url || '/images/hotel-placeholder.jpg';

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${className}`}
      onClick={() => onClick && onClick(hotel)}
      padding="none"
    >
      {/* Image */}
      <div className="relative h-48 rounded-t-lg overflow-hidden">
        <img
          src={mainImage}
          alt={name}
          className="w-full h-full object-cover"
        />
        {showDistance && distance && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            {distance}
          </div>
        )}
        {starRating && (
          <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-semibold">
            ⭐ {starRating}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
          {name}
        </h3>
        
        {location && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
            📍 {location.city}, {location.district}
          </p>
        )}

        {stats && (
          <div className="flex items-center gap-2 mb-2">
            {stats.averageRating && (
              <span className="text-sm text-yellow-600">
                ⭐ {stats.averageRating}/5
              </span>
            )}
            {stats.totalReviews && (
              <span className="text-sm text-gray-500">
                ({stats.totalReviews} đánh giá)
              </span>
            )}
          </div>
        )}

        {showPrice && price && (
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-blue-600">
              {price.toLocaleString('vi-VN')}₫
            </span>
            <span className="text-sm text-gray-500">
              /đêm
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

// Stats Card Component
export const StatsCard = ({
  title,
  value,
  change,
  changeType = 'increase',
  icon,
  className = '',
}) => {
  const changeColors = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
    neutral: 'text-gray-600',
  };

  const changeIcons = {
    increase: '↗',
    decrease: '↘',
    neutral: '→',
  };

  return (
    <Card className={className} padding="lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${changeColors[changeType]} mt-1`}>
              {changeIcons[changeType]} {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-3xl text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  shadow: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  rounded: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl', 'full']),
  border: PropTypes.bool,
  hover: PropTypes.bool,
};

CardHeader.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  action: PropTypes.node,
  className: PropTypes.string,
  titleClassName: PropTypes.string,
  subtitleClassName: PropTypes.string,
};

CardBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  border: PropTypes.bool,
  padding: PropTypes.bool,
};

HotelCard.propTypes = {
  hotel: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  showDistance: PropTypes.bool,
  showPrice: PropTypes.bool,
  className: PropTypes.string,
};

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  change: PropTypes.string,
  changeType: PropTypes.oneOf(['increase', 'decrease', 'neutral']),
  icon: PropTypes.node,
  className: PropTypes.string,
};

export default Card;