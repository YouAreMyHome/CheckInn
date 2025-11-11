/**
 * Hotels Management Page - Admin Portal
 * 
 * Features:
 * - View all hotels in the system
 * - Filter by status, category, city, verification
 * - Search hotels by name
 * - Approve/Reject/Suspend hotels
 * - Toggle featured status
 * - View hotel details
 * - Stats overview
 * 
 * @author CheckInn Team
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Search, Filter, Star, MapPin, Phone, Mail, 
  Globe, CheckCircle, XCircle, AlertCircle, Eye, Edit,
  Ban, Award, TrendingUp, Loader2, MoreVertical, Clock
} from 'lucide-react';
import axios from 'axios';
import { useNotification } from '@components/NotificationProvider';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const HotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    verified: 'all',
    featured: 'all'
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    verified: 0
  });
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const { showNotification } = useNotification();

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.verified !== 'all') params.append('isVerified', filters.verified);
      if (filters.featured !== 'all') params.append('isFeatured', filters.featured);
      
      const response = await axios.get(`${API_URL}/hotels?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const hotelsData = response.data.data.hotels || response.data.data;
        setHotels(Array.isArray(hotelsData) ? hotelsData : []);
        calculateStats(hotelsData);
      }
    } catch (err) {
      console.error('Error fetching hotels:', err);
      showNotification('error', 'Failed to load hotels');
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const calculateStats = (hotelsData) => {
    const total = hotelsData.length;
    const active = hotelsData.filter(h => h.status === 'active').length;
    const pending = hotelsData.filter(h => h.status === 'pending').length;
    const suspended = hotelsData.filter(h => h.status === 'suspended').length;
    const verified = hotelsData.filter(h => h.isVerified).length;
    setStats({ total, active, pending, suspended, verified });
  };

  const handleStatusChange = async (hotelId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/hotels/${hotelId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification('success', `Hotel ${newStatus} successfully`);
      fetchHotels();
    } catch (error) {
      showNotification('error', error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleToggleVerified = async (hotelId, currentVerified) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/hotels/${hotelId}`,
        { isVerified: !currentVerified },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification('success', `Hotel ${!currentVerified ? 'verified' : 'unverified'} successfully`);
      fetchHotels();
    } catch (err) {
      console.error('Error toggling verification:', err);
      showNotification('error', 'Failed to update verification status');
    }
  };

  const handleToggleFeatured = async (hotelId, currentFeatured) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/hotels/${hotelId}`,
        { isFeatured: !currentFeatured },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification('success', `Hotel ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`);
      fetchHotels();
    } catch (err) {
      console.error('Error toggling featured:', err);
      showNotification('error', 'Failed to update featured status');
    }
  };

  const filteredHotels = hotels.filter(hotel =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.location?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              Hotel Management
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Oversee all hotels in the system
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <StatsCard icon={Building2} label="Total Hotels" value={stats.total} color="blue" />
          <StatsCard icon={CheckCircle} label="Active" value={stats.active} color="green" />
          <StatsCard icon={Clock} label="Pending" value={stats.pending} color="yellow" />
          <StatsCard icon={Ban} label="Suspended" value={stats.suspended} color="red" />
          <StatsCard icon={Award} label="Verified" value={stats.verified} color="purple" />
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search hotels or cities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="budget">Budget</option>
              <option value="business">Business</option>
              <option value="luxury">Luxury</option>
              <option value="resort">Resort</option>
              <option value="boutique">Boutique</option>
            </select>

            {/* Verified Filter */}
            <select
              value={filters.verified}
              onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Verification</option>
              <option value="true">Verified</option>
              <option value="false">Not Verified</option>
            </select>
          </div>
        </div>

        {/* Hotels Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hotels found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHotels.map((hotel) => (
                    <HotelRow
                      key={hotel._id}
                      hotel={hotel}
                      onStatusChange={handleStatusChange}
                      onToggleVerified={handleToggleVerified}
                      onToggleFeatured={handleToggleFeatured}
                      onViewDetails={() => {
                        setSelectedHotel(hotel);
                        setShowDetails(true);
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Hotel Details Modal */}
      <AnimatePresence>
        {showDetails && selectedHotel && (
          <HotelDetailsModal
            hotel={selectedHotel}
            onClose={() => {
              setShowDetails(false);
              setSelectedHotel(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Stats Card Component
// eslint-disable-next-line no-unused-vars
const StatsCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm p-4"
    >
      <div className="flex items-center">
        <div className={`${colors[color]} p-3 rounded-lg`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Hotel Row Component
const HotelRow = ({ hotel, onStatusChange, onToggleVerified, onToggleFeatured, onViewDetails }) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
      suspended: { bg: 'bg-red-100', text: 'text-red-800', label: 'Suspended' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`${badge.bg} ${badge.text} px-2 py-1 text-xs font-medium rounded-full`}>
        {badge.label}
      </span>
    );
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {hotel.images?.[0]?.url ? (
              <img src={hotel.images[0].url} alt={hotel.name} className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-gray-500" />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 flex items-center">
              {hotel.name}
              {hotel.isVerified && <CheckCircle className="h-4 w-4 text-blue-600 ml-1" />}
              {hotel.isFeatured && <Award className="h-4 w-4 text-yellow-600 ml-1" />}
            </div>
            <div className="text-sm text-gray-500">{hotel.category}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{hotel.location?.city}</div>
        <div className="text-sm text-gray-500">{hotel.location?.country}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 capitalize">{hotel.category}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
          <span className="text-sm text-gray-900">{hotel.stats?.averageRating?.toFixed(1) || '0.0'}</span>
          <span className="text-sm text-gray-500 ml-1">({hotel.stats?.totalReviews || 0})</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(hotel.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="relative inline-block">
          <button
            onClick={() => setShowActions(!showActions)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
              >
                <div className="py-1">
                  <button onClick={onViewDetails} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <Eye className="h-4 w-4 mr-2" />View Details
                  </button>
                  {hotel.status === 'pending' && (
                    <button onClick={() => onStatusChange(hotel._id, 'active')} className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-100 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />Approve
                    </button>
                  )}
                  {hotel.status === 'active' && (
                    <button onClick={() => onStatusChange(hotel._id, 'suspended')} className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100 flex items-center">
                      <Ban className="h-4 w-4 mr-2" />Suspend
                    </button>
                  )}
                  {hotel.status === 'suspended' && (
                    <button onClick={() => onStatusChange(hotel._id, 'active')} className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-100 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />Activate
                    </button>
                  )}
                  <button onClick={() => onToggleVerified(hotel._id, hotel.isVerified)} className="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-gray-100 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />{hotel.isVerified ? 'Unverify' : 'Verify'}
                  </button>
                  <button onClick={() => onToggleFeatured(hotel._id, hotel.isFeatured)} className="w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-gray-100 flex items-center">
                    <Award className="h-4 w-4 mr-2" />{hotel.isFeatured ? 'Unfeature' : 'Feature'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </td>
    </tr>
  );
};

// Hotel Details Modal Component
const HotelDetailsModal = ({ hotel, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                {hotel.name}
                {hotel.isVerified && <CheckCircle className="h-6 w-6 text-blue-600 ml-2" />}
                {hotel.isFeatured && <Award className="h-6 w-6 text-yellow-600 ml-2" />}
              </h2>
              <p className="text-gray-500 mt-1">{hotel.category} · {hotel.starRating} Star</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location & Contact */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2" />Location
                </h3>
                <p className="text-sm text-gray-600">{hotel.location?.address}</p>
                <p className="text-sm text-gray-600">{hotel.location?.city}, {hotel.location?.country}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Phone className="h-5 w-5 text-blue-600 mr-2" />Contact
                </h3>
                <p className="text-sm text-gray-600 flex items-center">
                  <Phone className="h-4 w-4 mr-2" />{hotel.contact?.phone}
                </p>
                <p className="text-sm text-gray-600 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />{hotel.contact?.email}
                </p>
                {hotel.contact?.website && (
                  <p className="text-sm text-blue-600 flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    <a href={hotel.contact.website} target="_blank" rel="noopener noreferrer">{hotel.contact.website}</a>
                  </p>
                )}
              </div>
            </div>

            {/* Stats & Info */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />Statistics
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">Rating</p>
                    <p className="font-medium">{hotel.stats?.averageRating?.toFixed(1) || '0.0'} / 5.0</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">Reviews</p>
                    <p className="font-medium">{hotel.stats?.totalReviews || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">Bookings</p>
                    <p className="font-medium">{hotel.stats?.totalBookings || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">Views</p>
                    <p className="font-medium">{hotel.stats?.viewCount || 0}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Price Range</h3>
                <p className="text-sm text-gray-600">
                  {hotel.priceRange?.min?.toLocaleString()} - {hotel.priceRange?.max?.toLocaleString()} {hotel.currency}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-600">{hotel.description}</p>
          </div>

          {/* Amenities */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.slice(0, 10).map((amenity, index) => (
                  <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {amenity.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HotelsPage;