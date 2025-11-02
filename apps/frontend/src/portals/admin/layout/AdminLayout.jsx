import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Shield, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  LogOut,
  Menu,
  X,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@hooks/useAuth';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout(() => {
      navigate('/admin/login');
    });
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, current: location.pathname === '/admin' },
    { name: 'Users', href: '/admin/users', icon: Users, current: location.pathname.startsWith('/admin/users') },
    { name: 'Hotels', href: '/admin/hotels', icon: Building2, current: location.pathname.startsWith('/admin/hotels') },
    { name: 'Verifications', href: '/admin/verifications', icon: CheckCircle, current: location.pathname.startsWith('/admin/verifications') },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3, current: location.pathname.startsWith('/admin/reports') },
    { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare, current: location.pathname.startsWith('/admin/reviews') },
    { name: 'Security', href: '/admin/security', icon: Shield, current: location.pathname.startsWith('/admin/security') },
    { name: 'Settings', href: '/admin/settings', icon: Settings, current: location.pathname.startsWith('/admin/settings') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)} />
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition ease-in-out duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-red-600">CheckInn Admin</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'bg-red-100 text-red-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`${item.current ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'} mr-4 flex-shrink-0 h-6 w-6`} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">{user?.name?.charAt(0) || 'A'}</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name || 'Admin'}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-red-600">CheckInn Admin</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'bg-red-100 text-red-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <item.icon className={`${item.current ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'} mr-3 flex-shrink-0 h-6 w-6`} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">{user?.name?.charAt(0) || 'A'}</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name || 'Admin'}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;