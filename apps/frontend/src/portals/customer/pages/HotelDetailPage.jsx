import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Wifi, 
  Car, 
  Utensils, 
  Dumbbell, 
  Users, 
  Calendar,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Globe
} from 'lucide-react';
import { hotelService, roomService } from '@services';

const HotelDetailPage = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get search parameters for booking
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = parseInt(searchParams.get('guests')) || 1;

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        setLoading(true);
        const [hotelResponse, roomsResponse] = await Promise.all([
          hotelService.getHotelById(hotelId),
          roomService.getAvailableRooms(hotelId, { checkIn, checkOut, guests })
        ]);

        if (hotelResponse.success) {
          setHotel(hotelResponse.data);
        }

        if (roomsResponse.success) {
          setRooms(roomsResponse.data.rooms || []);
        }
      } catch (err) {
        setError('Failed to load hotel details');
        console.error('Hotel detail error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (hotelId) {
      fetchHotelDetails();
    }
  }, [hotelId, checkIn, checkOut, guests]);

  const handleBookRoom = (room) => {
    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }
    
    // Navigate to booking page with room and hotel details
    navigate(`/booking`, {
      state: {
        hotel,
        room,
        checkIn,
        checkOut,
        guests
      }
    });
  };

  const getAmenityIcon = (amenity) => {
    const iconMap = {
      'WiFi': Wifi,
      'Parking': Car,
      'Restaurant': Utensils,
      'Gym': Dumbbell,
      'Pool': Users,
      'Spa': CheckCircle
    };
    return iconMap[amenity] || CheckCircle;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error || 'Hotel not found'}</p>
              <button
                onClick={() => navigate('/search')}
                className="mt-3 text-sm text-red-600 hover:text-red-500 underline"
              >
                Back to Search
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-500 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Search
      </button>

      {/* Hotel Header */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        {/* Hotel Images */}
        <div className="h-64 sm:h-80 bg-gray-200 relative">
          {hotel.images && hotel.images.length > 0 ? (
            <img
              src={hotel.images[0]}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span>No Image Available</span>
            </div>
          )}
        </div>

        {/* Hotel Info */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
              <div className="flex items-center mb-2">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-600">{hotel.address}</span>
              </div>
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-4">
                  {renderStars(hotel.rating)}
                  <span className="ml-2 text-sm text-gray-600">
                    {hotel.rating} ({hotel.reviewCount || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6">
              <div className="text-right">
                <p className="text-sm text-gray-600">Starting from</p>
                <p className="text-3xl font-bold text-blue-600">
                  ${hotel.priceRange?.min || 'N/A'}
                  <span className="text-base font-normal text-gray-600">/night</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'rooms', name: 'Rooms & Rates' },
              { id: 'amenities', name: 'Amenities' },
              { id: 'reviews', name: 'Reviews' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h3 className="text-xl font-semibold mb-4">About this hotel</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {hotel.description || 'No description available for this hotel.'}
                </p>

                <h4 className="text-lg font-semibold mb-3">Location</h4>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{hotel.address}</span>
                </div>
                {hotel.phone && (
                  <div className="flex items-center text-gray-600 mb-2">
                    <Phone className="h-5 w-5 mr-2" />
                    <span>{hotel.phone}</span>
                  </div>
                )}
                {hotel.email && (
                  <div className="flex items-center text-gray-600 mb-2">
                    <Mail className="h-5 w-5 mr-2" />
                    <span>{hotel.email}</span>
                  </div>
                )}
                {hotel.website && (
                  <div className="flex items-center text-gray-600">
                    <Globe className="h-5 w-5 mr-2" />
                    <a
                      href={hotel.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-500"
                    >
                      {hotel.website}
                    </a>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3">Quick Info</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-medium">{hotel.checkInTime || '3:00 PM'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-medium">{hotel.checkOutTime || '11:00 AM'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Rooms:</span>
                      <span className="font-medium">{hotel.totalRooms || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year Built:</span>
                      <span className="font-medium">{hotel.yearBuilt || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rooms Tab */}
          {activeTab === 'rooms' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Available Rooms</h3>
                {checkIn && checkOut && (
                  <div className="text-sm text-gray-600">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    {checkIn} - {checkOut}
                  </div>
                )}
              </div>

              {rooms.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">
                    {checkIn && checkOut
                      ? 'No rooms available for selected dates'
                      : 'Please select dates to view availability'
                    }
                  </p>
                  <button
                    onClick={() => navigate('/search')}
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Modify Search
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {rooms.map((room) => (
                    <div key={room._id} className="border border-gray-200 rounded-lg p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-1">
                          {room.images && room.images.length > 0 ? (
                            <img
                              src={room.images[0]}
                              alt={room.type}
                              className="w-full h-40 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400">No Image</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="lg:col-span-2">
                          <h4 className="text-lg font-semibold mb-2">{room.type}</h4>
                          <p className="text-gray-600 mb-3">{room.description}</p>
                          
                          <div className="flex items-center mb-3">
                            <Users className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Max {room.maxOccupancy} guests
                            </span>
                          </div>

                          {room.amenities && room.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {room.amenities.slice(0, 3).map((amenity, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {amenity}
                                </span>
                              ))}
                              {room.amenities.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{room.amenities.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="lg:col-span-1">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600 mb-2">
                              ${room.price}
                              <span className="text-sm font-normal text-gray-600">/night</span>
                            </p>
                            
                            {room.available > 0 ? (
                              <div className="mb-4">
                                <p className="text-sm text-green-600 mb-2">
                                  {room.available} rooms available
                                </p>
                                <button
                                  onClick={() => handleBookRoom(room)}
                                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                                >
                                  Book Now
                                </button>
                              </div>
                            ) : (
                              <div className="mb-4">
                                <p className="text-sm text-red-600 mb-2">Not Available</p>
                                <button
                                  disabled
                                  className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed"
                                >
                                  Fully Booked
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Amenities Tab */}
          {activeTab === 'amenities' && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Hotel Amenities</h3>
              {hotel.amenities && hotel.amenities.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hotel.amenities.map((amenity, index) => {
                    const IconComponent = getAmenityIcon(amenity);
                    return (
                      <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <IconComponent className="h-6 w-6 text-blue-600 mr-3" />
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600">No amenities listed for this hotel.</p>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Guest Reviews</h3>
              <div className="text-center py-12">
                <p className="text-gray-600">Reviews feature will be implemented soon.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelDetailPage;