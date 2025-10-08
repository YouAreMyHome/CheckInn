import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Star, Wifi, Car, Coffee, Waves } from 'lucide-react';

const HomePage = () => {
  const [searchData, setSearchData] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchData);
    navigate(`/customer/search?${params.toString()}`);
  };

  const featuredHotels = [
    {
      id: 1,
      name: "Sunset Beach Resort",
      location: "Da Nang, Vietnam",
      price: 1200000,
      rating: 4.8,
      reviews: 324,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500",
      amenities: ['wifi', 'pool', 'parking', 'restaurant']
    },
    {
      id: 2,
      name: "Royal Hotel Saigon",
      location: "Ho Chi Minh City, Vietnam",
      price: 2500000,
      rating: 4.6,
      reviews: 892,
      image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=500",
      amenities: ['wifi', 'gym', 'spa', 'restaurant']
    },
    {
      id: 3,
      name: "Mountain View Lodge",
      location: "Sa Pa, Vietnam",
      price: 800000,
      rating: 4.7,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1587874304494-461dd4e4d9e1?w=500",
      amenities: ['wifi', 'restaurant', 'mountain-view', 'hiking']
    }
  ];

  const destinations = [
    { name: "Ho Chi Minh City", hotels: 245, image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=300" },
    { name: "Hanoi", hotels: 189, image: "https://images.unsplash.com/photo-1509390144773-04ecb9c60809?w=300" },
    { name: "Da Nang", hotels: 156, image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=300" },
    { name: "Nha Trang", hotels: 132, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300" }
  ];

  const getAmenityIcon = (amenity) => {
    const icons = {
      wifi: <Wifi className="h-4 w-4" />,
      pool: <Waves className="h-4 w-4" />,
      parking: <Car className="h-4 w-4" />,
      restaurant: <Coffee className="h-4 w-4" />
    };
    return icons[amenity] || <div className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Stay
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
              Discover amazing hotels, resorts, and unique accommodations around Vietnam
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      onChange={(e) => setSearchData({...searchData, guests: e.target.value})}
                    >
                      {[1,2,3,4,5,6,7,8].map(num => (
                        <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button type="submit" className="btn-primary px-8 py-3 text-lg">
                  <Search className="h-5 w-5 mr-2" />
                  Search Hotels
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Destinations</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore the most popular cities and discover amazing places to stay
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((destination, index) => (
              <div
                key={index}
                className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/customer/search?destination=${destination.name}`)}
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Hotels</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hand-picked hotels that offer exceptional experiences and value
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/customer/hotel/${hotel.id}`)}
              >
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="card-content">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900 ml-1">{hotel.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {hotel.location}
                  </p>

                  <div className="flex items-center space-x-2 mb-3">
                    {hotel.amenities.slice(0, 4).map((amenity, index) => (
                      <div key={index} className="text-gray-400" title={amenity}>
                        {getAmenityIcon(amenity)}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        {hotel.price.toLocaleString('vi-VN')}₫
                      </span>
                      <span className="text-gray-600 text-sm"> / night</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {hotel.reviews} reviews
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
    </div>
  );
};

export default HomePage;