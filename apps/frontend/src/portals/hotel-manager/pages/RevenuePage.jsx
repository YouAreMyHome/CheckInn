/**
 * Revenue Dashboard Page
 * 
 * Comprehensive revenue analytics with:
 * - Date range picker
 * - Revenue trend line chart
 * - Bookings bar chart
 * - Statistics cards (total revenue, average, growth)
 * - Occupancy rate gauge
 * - Export functionality
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, DollarSign, Calendar, Download, 
  Loader2, AlertCircle, ArrowUp, ArrowDown
} from 'lucide-react';
import { useRevenueWithDateRange } from '@hooks/useRevenue';
import { formatCurrency } from '@services/revenueService';

const RevenuePage = () => {
  const {
    dateRange,
    setDateRange,
    hotelRevenueData,
    occupancyData,
    bookingTrendsData,
    isLoading,
    error
  } = useRevenueWithDateRange();

  // Chart colors
  const COLORS = {
    primary: '#3B82F6',
    secondary: '#10B981',
    tertiary: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6'
  };

  const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Handle date change
  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  // Export functionality
  const handleExport = () => {
    // In production, this would generate PDF or CSV
    const dataToExport = {
      dateRange,
      revenue: hotelRevenueData?.data,
      occupancy: occupancyData?.data,
      bookings: bookingTrendsData?.data
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${dateRange.startDate}-to-${dateRange.endDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Failed to load revenue data</p>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  // Extract data
  const revenue = hotelRevenueData?.data || {};
  const occupancy = occupancyData?.data || {};
  const bookings = bookingTrendsData?.data || {};

  // Calculate summary stats
  const totalRevenue = revenue.totalRevenue || 0;
  const averageRevenue = revenue.averageRevenue || 0;
  const growthRate = bookings.growthRate || 0;
  const totalBookings = bookings.totalBookings || 0;

  // Format chart data
  const revenueChartData = revenue.dailyRevenue?.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: item.totalRevenue,
    bookings: item.bookings
  })) || [];

  const bookingsChartData = bookings.monthlyData?.map(item => ({
    month: item._id,
    bookings: item.count,
    revenue: item.totalRevenue
  })) || [];

  const occupancyChartData = [
    { name: 'Occupied', value: occupancy.averageOccupancy || 0 },
    { name: 'Available', value: 100 - (occupancy.averageOccupancy || 0) }
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Revenue Analytics
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Track your revenue, bookings, and occupancy rates
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(start.getDate() - 7);
                  setDateRange({
                    startDate: start.toISOString().split('T')[0],
                    endDate: end.toISOString().split('T')[0]
                  });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Last 7 Days
              </button>
              <button
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(start.getDate() - 30);
                  setDateRange({
                    startDate: start.toISOString().split('T')[0],
                    endDate: end.toISOString().split('T')[0]
                  });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Last 30 Days
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Revenue */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(totalRevenue)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Average Revenue */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Average Daily</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(averageRevenue)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                    <dd className="text-lg font-medium text-gray-900">{totalBookings}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Rate */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {growthRate >= 0 ? (
                    <ArrowUp className="h-6 w-6 text-green-600" />
                  ) : (
                    <ArrowDown className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Growth Rate</dt>
                    <dd className={`text-lg font-medium ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(2)}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1: Revenue Trend & Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trend Line Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={COLORS.primary} 
                  strokeWidth={2}
                  dot={{ fill: COLORS.primary }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bookings Bar Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings by Month</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="bookings" fill={COLORS.secondary} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2: Occupancy Rate & Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Occupancy Rate Pie Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Occupancy Rate</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={occupancyChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {occupancyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <p className="text-3xl font-bold text-gray-900">
                {occupancy.averageOccupancy?.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500">Average Occupancy</p>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Statistics</h3>
            <div className="space-y-4">
              {/* Peak Occupancy */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Peak Occupancy</p>
                  <p className="text-xs text-gray-500">Highest occupancy rate</p>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {occupancy.peakOccupancy?.toFixed(1)}%
                </p>
              </div>

              {/* Lowest Occupancy */}
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Lowest Occupancy</p>
                  <p className="text-xs text-gray-500">Minimum occupancy rate</p>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {occupancy.lowestOccupancy?.toFixed(1)}%
                </p>
              </div>

              {/* Revenue Per Booking */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Revenue Per Booking</p>
                  <p className="text-xs text-gray-500">Average revenue per reservation</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalBookings > 0 ? totalRevenue / totalBookings : 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenuePage;
