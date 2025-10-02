import React from 'react';
import { Card } from 'antd';
import { MapPin, Star, Wifi, Car, Coffee, Utensils } from 'lucide-react';

const { Meta } = Card;

const HotelCard = ({ hotel, onClick }) => {
  const {
    name,
    location,
    rating,
    price,
    images,
    amenities = [],
    reviews
  } = hotel || {};

  const handleClick = () => {
    if (onClick) {
      onClick(hotel);
    }
  };

  const renderAmenityIcon = (amenity) => {
    const icons = {
      wifi: <Wifi size={16} />,
      parking: <Car size={16} />,
      breakfast: <Coffee size={16} />,
      restaurant: <Utensils size={16} />
    };
    return icons[amenity.toLowerCase()] || null;
  };

  return (
    <Card
      hoverable
      className="hotel-card shadow-sm border-0"
      onClick={handleClick}
      cover={
        <div className="relative h-48 overflow-hidden">
          <img
            alt={name}
            src={images?.[0] || '/placeholder-hotel.jpg'}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {rating && (
            <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
              <Star size={12} fill="currentColor" />
              {rating}
            </div>
          )}
        </div>
      }
    >
      <Meta
        title={
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {name}
            </h3>
            {location && (
              <div className="flex items-center text-gray-500 text-sm">
                <MapPin size={14} className="mr-1" />
                {location.address || location}
              </div>
            )}
          </div>
        }
        description={
          <div className="space-y-3">
            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {amenities.slice(0, 4).map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                  >
                    {renderAmenityIcon(amenity)}
                    <span className="capitalize">{amenity}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              {reviews && (
                <div className="text-sm text-gray-500">
                  {reviews.total} đánh giá
                </div>
              )}
              {price && (
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    {typeof price === 'number' 
                      ? `${price.toLocaleString('vi-VN')}₫` 
                      : price}
                  </div>
                  <div className="text-xs text-gray-500">/ đêm</div>
                </div>
              )}
            </div>
          </div>
        }
      />
    </Card>
  );
};

export default HotelCard;