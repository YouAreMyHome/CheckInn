import { useAuth } from '../../../shared/hooks/useAuth';
import { 
  Users, 
  Building2, 
  CheckCircle, 
  AlertTriangle, 
  BarChart3, 
  Shield,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  Activity,
  Eye,
  UserCheck,
  Zap,
  Bell,
  Settings,
  Download
} from 'lucide-react';
import { useState, useEffect } from 'react';

const EnhancedDashboardPage = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { 
      name: 'Total Users', 
      value: '2,847', 
      icon: Users, 
      change: '+12%', 
      changeType: 'positive',
      description: 'Active registered users'
    },
    { 
      name: 'Active Hotels', 
      value: '156', 
      icon: Building2, 
      change: '+8%', 
      changeType: 'positive',
      description: 'Verified hotel partners'
    },
    { 
      name: 'Monthly Revenue', 
      value: '$47,890', 
      icon: DollarSign, 
      change: '+15.3%', 
      changeType: 'positive',
      description: 'Commission earnings'
    },
    { 
      name: 'Security Alerts', 
      value: '3', 
      icon: AlertTriangle, 
      change: '-2', 
      changeType: 'positive',
      description: 'Active security issues'
    },
  ];

  const recentActivity = [
    { 
      id: 1, 
      type: 'user_registration', 
      icon: UserCheck,
      message: 'New user John Doe registered', 
      time: '2 hours ago',
      status: 'success' 
    },
    { 
      id: 2, 
      type: 'hotel_verification', 
      icon: Building2,
      message: 'Grand Hotel verification completed', 
      time: '4 hours ago',
      status: 'success' 
    },
    { 
      id: 3, 
      type: 'security_alert', 
      icon: Shield,
      message: 'Multiple login attempts detected', 
      time: '6 hours ago',
      status: 'warning' 
    },
    { 
      id: 4, 
      type: 'review_reported', 
      icon: AlertTriangle,
      message: 'Review reported for inappropriate content', 
      time: '8 hours ago',
      status: 'danger' 
    },
    {
      id: 5,
      type: 'payment_processed',
      icon: DollarSign,
      message: 'Payment of $2,340 processed successfully',
      time: '12 hours ago',
      status: 'success'
    }
  ];

  const pendingActions = [
    { 
      id: 1, 
      title: 'Hotel Verification', 
      description: 'Oceanview Resort pending approval', 
      priority: 'high',
      category: 'verification',
      dueDate: '2 days'
    },
    { 
      id: 2, 
      title: 'User Report Investigation', 
      description: 'Spam user account reported by multiple users', 
      priority: 'medium',
      category: 'moderation',
      dueDate: '5 days'
    },
    { 
      id: 3, 
      title: 'System Security Update', 
      description: 'Critical security patch requires deployment', 
      priority: 'high',
      category: 'security',
      dueDate: '1 day'
    },
  ];

  const quickStats = [
    { label: 'Today\'s Bookings', value: '142', trend: '+23%', color: 'blue' },
    { label: 'Online Hotels', value: '134', trend: '+5%', color: 'green' },
    { label: 'Pending Reviews', value: '28', trend: '-12%', color: 'yellow' },
    { label: 'Active Support Tickets', value: '7', trend: '-43%', color: 'purple' },
  ];

  const topHotels = [
    { name: 'Grand Palace Hotel', bookings: 45, revenue: '$12,890', rating: 4.8 },
    { name: 'Oceanview Resort', bookings: 38, revenue: '$9,560', rating: 4.7 },
    { name: 'City Center Inn', bookings: 33, revenue: '$8,240', rating: 4.6 },
    { name: 'Mountain Lodge', bookings: 29, revenue: '$7,330', rating: 4.9 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user?.name || 'Administrator'}
                </h1>
                <p className="text-blue-100 text-lg">
                  {currentTime.toLocaleDateString('vi-VN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <div className="flex items-center mt-4 space-x-4">
                  <div className="flex items-center text-blue-100">
                    <Activity className="h-4 w-4 mr-1" />
                    <span className="text-sm">System Status: All Good</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <Zap className="h-4 w-4 mr-1" />
                    <span className="text-sm">Performance: Optimal</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <button className="bg-white/10 backdrop-blur-md rounded-xl p-3 hover:bg-white/20 transition-colors">
                  <Bell className="h-6 w-6 text-white" />
                </button>
                <button className="bg-white/10 backdrop-blur-md rounded-xl p-3 hover:bg-white/20 transition-colors">
                  <Settings className="h-6 w-6 text-white" />
                </button>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((item, index) => (
            <div key={item.name} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${
                    index === 0 ? 'bg-blue-100' :
                    index === 1 ? 'bg-green-100' :
                    index === 2 ? 'bg-purple-100' : 'bg-red-100'
                  }`}>
                    <item.icon className={`h-6 w-6 ${
                      index === 0 ? 'text-blue-600' :
                      index === 1 ? 'text-green-600' :
                      index === 2 ? 'text-purple-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div className="flex items-center space-x-1">
                    {item.changeType === 'positive' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm font-semibold ${
                      item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.change}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {item.value}
                  </h3>
                  <p className="text-gray-600 font-medium mt-1">{item.name}</p>
                  <p className="text-gray-500 text-sm mt-2">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Real-time Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className={`text-2xl font-bold ${
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'yellow' ? 'text-yellow-600' : 'text-purple-600'
                }`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                <div className={`text-xs font-medium mt-1 ${
                  stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.trend}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  Recent Activity
                </h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-lg ${
                      activity.status === 'success' ? 'bg-green-100' :
                      activity.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <activity.icon className={`h-4 w-4 ${
                        activity.status === 'success' ? 'text-green-600' :
                        activity.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pending Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-600" />
                Pending Actions
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {pendingActions.map((action) => (
                  <div key={action.id} className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{action.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        action.priority === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {action.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Due: {action.dueDate}</span>
                      <button className="text-blue-600 hover:text-blue-700 font-medium">
                        Action →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Hotels & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performing Hotels */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-600" />
                Top Performing Hotels
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topHotels.map((hotel, index) => (
                  <div key={hotel.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{hotel.name}</h4>
                        <p className="text-sm text-gray-500">{hotel.bookings} bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{hotel.revenue}</p>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600 ml-1">{hotel.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-purple-600" />
                Quick Actions
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="/admin/users"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <Users className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700 mt-2">Manage Users</span>
                </a>
                <a
                  href="/admin/hotels"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all group"
                >
                  <Building2 className="h-8 w-8 text-green-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700 mt-2">Manage Hotels</span>
                </a>
                <a
                  href="/admin/verifications"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all group"
                >
                  <CheckCircle className="h-8 w-8 text-orange-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700 mt-2">Verifications</span>
                </a>
                <a
                  href="/admin/reports"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all group"
                >
                  <BarChart3 className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700 mt-2">View Reports</span>
                </a>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium">
                  <Download className="h-4 w-4 mr-2" />
                  Export Dashboard Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboardPage;