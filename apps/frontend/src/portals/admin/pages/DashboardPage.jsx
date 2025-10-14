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
  Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';

const DashboardPage = () => {
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
              <div className="hidden md:block">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
                  <Shield className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
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
                    <span className={`font-medium ${
                      item.changeType === 'positive' ? 'text-green-600' : 
                      item.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {item.change}
                    </span>
                    <span className="text-gray-500"> from last month</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Activity */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Latest system activities and events.</p>
            </div>
            <ul className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <li key={activity.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">{activity.message}</div>
                      <div className="text-sm text-gray-500">{activity.time}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="bg-gray-50 px-4 py-3 sm:px-6">
              <div className="text-sm">
                <a href="#" className="font-medium text-red-600 hover:text-red-500">
                  View all activities →
                </a>
              </div>
            </div>
          </div>

          {/* Pending Actions */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Pending Actions</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Items requiring your attention.</p>
            </div>
            <ul className="divide-y divide-gray-200">
              {pendingActions.map((action) => (
                <li key={action.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{action.title}</div>
                        <div className="text-sm text-gray-500">{action.description}</div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        action.priority === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {action.priority}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="bg-gray-50 px-4 py-3 sm:px-6">
              <div className="text-sm">
                <a href="/admin/verifications" className="font-medium text-red-600 hover:text-red-500">
                  View all pending →
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
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
                <a
                  href="/admin/users"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </a>
                <a
                  href="/admin/hotels"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Manage Hotels
                </a>
                <a
                  href="/admin/verifications"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verifications
                </a>
                <a
                  href="/admin/reports"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Reports
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