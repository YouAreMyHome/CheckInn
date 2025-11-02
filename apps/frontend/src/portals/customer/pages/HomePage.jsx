import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Calendar, Users, Star, Wifi, Car, Coffee, Waves, TrendingUp, Award, Clock, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { hotelService } from '@services';
import LoadingSpinner from '@components/LoadingSpinner';
import ErrorMessage from '@components/ErrorMessage';

const HomePage = () => {
  const [searchData, setSearchData] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    rooms: 1
  });
  const navigate = useNavigate();

  // Fetch featured hotels from backend
  const { 
    data: featuredHotelsData, 
    isLoading: featuredLoading, 
    error: featuredError 
  } = useQuery({
    queryKey: ['featured-hotels'],
    queryFn: () => hotelService.getHotels({ 
      limit: 6, 
      sort: '-rating.average',
      'rating.average': { $gte: 4.0 }
    }),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  });

  // For destinations, we'll use static data for now since grouping by city 
  // requires backend aggregation that might not be implemented yet
  const destinationsLoading = false;

  // Process featured hotels data
  const featuredHotels = useMemo(() => {
    if (!featuredHotelsData?.hotels && !featuredHotelsData?.data?.hotels) {
      // Return mock data for development
      return [
        {
          id: "mock-1",
          name: "Sunset Beach Resort",
          location: "Da Nang, Da Nang",
          price: 1200000,
          rating: 4.8,
          reviews: 324,
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500",
          amenities: ['wifi', 'pool', 'parking', 'restaurant'],
          isVerified: true,
          badge: 'top-rated'
        },
        {
          id: "mock-2", 
          name: "Royal Hotel Saigon",
          location: "Ho Chi Minh City, Ho Chi Minh",
          price: 2500000,
          rating: 4.6,
          reviews: 892,
          image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=500",
          amenities: ['wifi', 'gym', 'spa', 'restaurant'],
          isVerified: true,
          badge: null
        },
        {
          id: "mock-3",
          name: "Mountain View Lodge", 
          location: "Sa Pa, Lao Cai",
          price: 800000,
          rating: 4.7,
          reviews: 156,
          image: "https://images.unsplash.com/photo-1587874304494-461dd4e4d9e1?w=500",
          amenities: ['wifi', 'restaurant', 'mountain-view', 'hiking'],
          isVerified: false,
          badge: 'trending'
        }
      ];
    }
    
    const hotels = featuredHotelsData?.hotels || featuredHotelsData?.data?.hotels || [];
    
    return hotels.map(hotel => ({
      id: hotel._id || hotel.id,
      name: hotel.name,
      location: `${hotel.location?.city || 'Unknown City'}, ${hotel.location?.state || 'Vietnam'}`,
      price: hotel.pricing?.basePrice || hotel.rooms?.[0]?.price || 0,
      rating: hotel.rating?.average || 0,
      reviews: hotel.rating?.count || 0,
      image: hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500",
      amenities: hotel.amenities?.slice(0, 4) || [],
      isVerified: hotel.verification?.isVerified || false,
      badge: hotel.analytics?.trend === 'up' ? 'trending' : hotel.rating?.average >= 4.5 ? 'top-rated' : null
    }));
  }, [featuredHotelsData]);

  // Process destinations data  
  const popularDestinations = useMemo(() => {
    // Default destinations - always return these for now
    return [
      { name: "Ho Chi Minh City", state: "Ho Chi Minh", hotels: 245, image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=300" },
      { name: "Hanoi", state: "Ha Noi", hotels: 189, image: "https://images.unsplash.com/photo-1509390144773-04ecb9c60809?w=300" },
      { name: "Da Nang", state: "Da Nang", hotels: 156, image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=300" },
      { name: "Nha Trang", state: "Khanh Hoa", hotels: 132, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300" }
    ];
  }, []);



  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!searchData.destination.trim()) {
      alert('Please enter a destination');
      return;
    }

    // Build search params
    const params = new URLSearchParams({
      destination: searchData.destination,
      ...(searchData.checkIn && { checkIn: searchData.checkIn }),
      ...(searchData.checkOut && { checkOut: searchData.checkOut }),
      guests: searchData.guests.toString(),
      rooms: searchData.rooms.toString()
    });
    
    navigate(`/search?${params.toString()}`);
  };

  // Quick search for popular destinations
  const handleDestinationClick = (destination) => {
    const params = new URLSearchParams({
      destination: destination.name,
      guests: '2',
      rooms: '1'
    });
    navigate(`/search?${params.toString()}`);
  };

  const getAmenityIcon = (amenity) => {
    const normalizedAmenity = typeof amenity === 'string' ? amenity.toLowerCase() : '';
    const icons = {
      wifi: <Wifi className="h-4 w-4" />,
      'free wifi': <Wifi className="h-4 w-4" />,
      internet: <Wifi className="h-4 w-4" />,
      pool: <Waves className="h-4 w-4" />,
      'swimming pool': <Waves className="h-4 w-4" />,
      parking: <Car className="h-4 w-4" />,
      'free parking': <Car className="h-4 w-4" />,
      restaurant: <Coffee className="h-4 w-4" />,
      'dining': <Coffee className="h-4 w-4" />,
      gym: <Users className="h-4 w-4" />,
      fitness: <Users className="h-4 w-4" />,
      spa: <Star className="h-4 w-4" />,
      'air conditioning': <TrendingUp className="h-4 w-4" />,
      'mountain-view': <MapPin className="h-4 w-4" />,
      hiking: <MapPin className="h-4 w-4" />
    };
    return icons[normalizedAmenity] || <div className="h-4 w-4 rounded bg-gray-300" />;
  };

  return (
    <motion.div 
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div 
            className="text-center mb-12"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Find Your Perfect Stay
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Discover amazing hotels, resorts, and unique accommodations around Vietnam
            </motion.p>
          </motion.div>

          {/* Search Form */}
          <motion.div 
            className="max-w-5xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.form 
              onSubmit={handleSearch} 
              className="bg-white rounded-lg shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Where are you going?
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="City, hotel, or landmark"
                      className="input pl-10"
                      value={searchData.destination}
                      onChange={(e) => setSearchData({...searchData, destination: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      className="input pl-10"
                      value={searchData.checkIn}
                      onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      className="input pl-10"
                      value={searchData.checkOut}
                      onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guests
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <select
                      className="input pl-10"
                      value={searchData.guests}
                      onChange={(e) => setSearchData({...searchData, guests: parseInt(e.target.value)})}
                    >
                      {[1,2,3,4,5,6,7,8].map(num => (
                        <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rooms
                  </label>
                  <div className="relative">
                    <Coffee className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <select
                      className="input pl-10"
                      value={searchData.rooms}
                      onChange={(e) => setSearchData({...searchData, rooms: parseInt(e.target.value)})}
                    >
                      {[1,2,3,4,5].map(num => (
                        <option key={num} value={num}>{num} room{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <motion.button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 text-lg rounded-lg transition-colors duration-200 flex items-center justify-center mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search Hotels
                </motion.button>
              </div>
            </motion.form>
          </motion.div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Destinations</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore the most popular cities and discover amazing places to stay
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {destinationsLoading ? (
              // Loading skeleton for destinations
              [...Array(4)].map((_, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden shadow-md">
                  <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                  <div className="absolute bottom-4 left-4 space-y-2">
                    <div className="h-4 w-24 bg-white/30 rounded animate-pulse"></div>
                    <div className="h-3 w-16 bg-white/20 rounded animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : (
              popularDestinations.map((destination, index) => (
                <motion.div
                  key={index}
                  className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleDestinationClick(destination)}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  viewport={{ once: true }}
                >
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-semibold">{destination.name}</h3>
                    <p className="text-sm text-gray-200">{destination.hotels} hotels</p>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Hotels</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hand-picked hotels that offer exceptional experiences and value
            </p>
          </motion.div>

          {featuredError ? (
            <ErrorMessage 
              error={featuredError}
              onRetry={() => window.location.reload()}
              className="max-w-md mx-auto"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredLoading ? (
                // Loading skeleton for hotels
                [...Array(6)].map((_, index) => (
                  <div key={index} className="card">
                    <div className="w-full h-48 bg-gray-200 animate-pulse rounded-t-lg"></div>
                    <div className="card-content space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="h-5 w-32 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-4 w-12 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                      <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                      <div className="flex space-x-2">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-4 w-4 bg-gray-200 animate-pulse rounded"></div>
                        ))}
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                featuredHotels.map((hotel, index) => (
                  <motion.div
                    key={hotel.id}
                    className="card hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/hotel/${hotel.id}`)}
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    viewport={{ once: true }}
                  >
                    <div className="relative">
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      {hotel.badge && (
                        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                          hotel.badge === 'trending' 
                            ? 'bg-red-500 text-white' 
                            : 'bg-yellow-400 text-gray-900'
                        }`}>
                          {hotel.badge === 'trending' ? (
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="h-3 w-3" />
                              <span>Trending</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <Award className="h-3 w-3" />
                              <span>Top Rated</span>
                            </div>
                          )}
                        </div>
                      )}
                      {hotel.isVerified && (
                        <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          ✓ Verified
                        </div>
                      )}
                    </div>
                    
                    <div className="card-content">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{hotel.name}</h3>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-900 ml-1">
                            {hotel.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 flex items-center">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        {hotel.location}
                      </p>

                      <div className="flex items-center space-x-2 mb-3">
                        {hotel.amenities.slice(0, 4).map((amenity, index) => (
                          <div key={index} className="text-gray-400" title={amenity}>
                            {getAmenityIcon(amenity)}
                          </div>
                        ))}
                        {hotel.amenities.length > 4 && (
                          <span className="text-xs text-gray-500">+{hotel.amenities.length - 4}</span>
                        )}
                      </div>

                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">
                            {hotel.price.toLocaleString('vi-VN')}₫
                          </span>
                          <span className="text-gray-600 text-sm"> / night</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {hotel.reviews} review{hotel.reviews !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CheckInn?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Search</h3>
              <p className="text-gray-600">
                Find the perfect hotel with our advanced search and filtering options
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Best Prices</h3>
              <p className="text-gray-600">
                Get the best deals and exclusive rates on thousands of hotels
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">
                Our customer support team is here to help you anytime, anywhere
              </p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default HomePage;