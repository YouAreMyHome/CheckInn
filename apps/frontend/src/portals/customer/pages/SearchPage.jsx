import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Star, Filter, Grid, List } from 'lucide-react';
import { hotelService } from '@services';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState({
    destination: searchParams.get('destination') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: searchParams.get('guests') || '1'
  });
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    rating: 0,
    amenities: [],
    hotelType: ''
  });
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('rating');

  const amenitiesList = [
    'Free WiFi', 'Swimming Pool', 'Spa', 'Fitness Center', 
    'Restaurant', 'Bar', 'Parking', 'Pet Friendly', 
    'Airport Shuttle', 'Business Center'
  ];

  const hotelTypes = [
    'Hotel', 'Resort', 'Apartment', 'Villa', 'Hostel', 'Boutique'
  ];

  useEffect(() => {
    if (searchQuery.destination) {
      handleSearch();
    }
  }, [handleSearch, searchQuery.destination]);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        ...searchQuery,
        ...filters,
        sortBy
      };
      
      const response = await hotelService.searchHotels(params);
      
      if (response.success) {
        setHotels(response.data.hotels || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, sortBy]);

  const handleInputChange = (e) => {
    setSearchQuery({
      ...searchQuery,
      [e.target.name]: e.target.value
    });
  };

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };

  const handleAmenityToggle = (amenity) => {
    const updatedAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    
    handleFilterChange('amenities', updatedAmenities);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search Form */}
            <div className="flex-1 max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="destination"
                    placeholder="Where are you going?"
                    value={searchQuery.destination}
                    onChange={handleInputChange}
                    className="pl-10 w-full h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    name="checkIn"
                    value={searchQuery.checkIn}
                    onChange={handleInputChange}
                    className="pl-10 w-full h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    name="checkOut"
                    value={searchQuery.checkOut}
                    onChange={handleInputChange}
                    className="pl-10 w-full h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    name="guests"
                    value={searchQuery.guests}
                    onChange={handleInputChange}
                    className="pl-10 w-full h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1,2,3,4,5,6,7,8].map(num => (
                      <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="btn-primary px-8 py-3 disabled:opacity-50"
            >
              <Search className="h-5 w-5 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="flex items-center mb-6">
                <Filter className="h-5 w-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange[0]}
                    onChange={(e) => handleFilterChange('priceRange', [+e.target.value, filters.priceRange[1]])}
                    className="w-20 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], +e.target.value])}
                    className="w-20 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Minimum Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map(rating => (
                    <label key={rating} className="flex items-center">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={filters.rating === rating}
                        onChange={(e) => handleFilterChange('rating', +e.target.value)}
                        className="mr-2"
                      />
                      <div className="flex items-center">
                        {[...Array(rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">{rating}+ stars</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Hotel Type */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Hotel Type</h4>
                <select
                  value={filters.hotelType}
                  onChange={(e) => handleFilterChange('hotelType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="">All Types</option>
                  {hotelTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Amenities</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {amenitiesList.map(amenity => (
                    <label key={amenity} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.amenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSearch}
                className="w-full btn-primary py-2"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {searchQuery.destination && `Hotels in ${searchQuery.destination}`}
                </h2>
                <p className="text-gray-600">
                  {hotels.length} properties found
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="distance">Distance</option>
                </select>

                {/* View Mode */}
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-600 mt-4">Searching for hotels...</p>
              </div>
            )}

            {/* Results Grid/List */}
            {!loading && hotels.length > 0 && (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
                {hotels.map(hotel => (
                  <HotelCard key={hotel._id} hotel={hotel} viewMode={viewMode} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && hotels.length === 0 && searchQuery.destination && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hotels found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hotel Card Component
const HotelCard = ({ hotel, viewMode }) => {
  const cardClass = viewMode === 'grid' 
    ? 'bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow'
    : 'bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow flex';

  return (
    <Link to={`/hotel/${hotel._id}`} className={cardClass}>
      <div className={viewMode === 'grid' ? '' : 'w-1/3'}>
        <img
          src={hotel.images?.[0] || '/placeholder-hotel.jpg'}
          alt={hotel.name}
          className="w-full h-48 object-cover"
        />
      </div>
      <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {hotel.name}
          </h3>
          <div className="flex items-center text-sm text-gray-600">
            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
            {hotel.rating?.toFixed(1) || 'N/A'}
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm line-clamp-1">{hotel.address}</span>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {hotel.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {hotel.amenities?.slice(0, 3).map(amenity => (
              <span key={amenity} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {amenity}
              </span>
            ))}
            {hotel.amenities?.length > 3 && (
              <span className="text-xs text-gray-500">+{hotel.amenities.length - 3} more</span>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">
              ${hotel.priceRange?.min || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">per night</div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SearchPage;