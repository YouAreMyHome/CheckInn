import { useAuth } from '../../../shared/hooks/useAuth';
import { Users, Building2, CheckCircle, AlertTriangle, BarChart3, Shield } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  const stats = [
    { name: 'Total Users', value: '2,847', icon: Users, change: '+12%', changeType: 'positive' },
    { name: 'Active Hotels', value: '156', icon: Building2, change: '+8%', changeType: 'positive' },
    { name: 'Pending Verifications', value: '23', icon: CheckCircle, change: '+5', changeType: 'neutral' },
    { name: 'Security Alerts', value: '3', icon: AlertTriangle, change: '-2', changeType: 'positive' },
  ];

  const recentActivity = [
    { id: 1, type: 'user_registration', message: 'New user John Doe registered', time: '2 hours ago' },
    { id: 2, type: 'hotel_verification', message: 'Grand Hotel verification completed', time: '4 hours ago' },
    { id: 3, type: 'security_alert', message: 'Multiple login attempts detected', time: '6 hours ago' },
    { id: 4, type: 'review_reported', message: 'Review reported for inappropriate content', time: '8 hours ago' },
  ];

  const pendingActions = [
    { id: 1, title: 'Hotel Verification', description: 'Oceanview Resort pending approval', priority: 'high' },
    { id: 2, title: 'User Report', description: 'Spam user account reported', priority: 'medium' },
    { id: 3, title: 'System Update', description: 'Security patch requires deployment', priority: 'high' },
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Admin Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {user?.name || 'Administrator'}. Here's your system overview.
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