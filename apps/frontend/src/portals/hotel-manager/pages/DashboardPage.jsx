import { useAuth } from '../../../shared/hooks/useAuth';
import { Building2, BedDouble, Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  const stats = [
    { name: 'Total Hotels', value: '3', icon: Building2, change: '+1', changeType: 'positive' },
    { name: 'Available Rooms', value: '47', icon: BedDouble, change: '+5', changeType: 'positive' },
    { name: 'Active Bookings', value: '23', icon: Calendar, change: '+3', changeType: 'positive' },
    { name: 'Monthly Revenue', value: '$12,450', icon: DollarSign, change: '+12%', changeType: 'positive' },
  ];

  const recentBookings = [
    { id: 1, guest: 'John Doe', hotel: 'Grand Hotel', room: 'Deluxe Suite', checkIn: '2024-01-15', status: 'confirmed' },
    { id: 2, guest: 'Jane Smith', hotel: 'City Center Inn', room: 'Standard Room', checkIn: '2024-01-16', status: 'pending' },
    { id: 3, guest: 'Mike Johnson', hotel: 'Beachfront Resort', room: 'Ocean View', checkIn: '2024-01-17', status: 'confirmed' },
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Welcome back, {user?.name || 'Hotel Manager'}!
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Here's what's happening with your hotels today.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <item.icon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{item.value}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <span className={`font-medium ${item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change}
                    </span>
                    <span className="text-gray-500"> from last month</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Bookings</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Latest reservations across your hotels.</p>
            </div>
            <ul className="divide-y divide-gray-200">
              {recentBookings.map((booking) => (
                <li key={booking.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">{booking.guest.charAt(0)}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{booking.guest}</div>
                          <div className="text-sm text-gray-500">{booking.hotel} • {booking.room}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-sm text-gray-500 mr-4">Check-in: {booking.checkIn}</div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="bg-gray-50 px-4 py-3 sm:px-6">
              <div className="text-sm">
                <a href="/hotel-manager/bookings" className="font-medium text-blue-600 hover:text-blue-500">
                  View all bookings →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <a
                  href="/hotel-manager/hotels"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Manage Hotels
                </a>
                <a
                  href="/hotel-manager/rooms"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <BedDouble className="h-4 w-4 mr-2" />
                  Add Rooms
                </a>
                <a
                  href="/hotel-manager/analytics"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;