import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Debug logging
  console.log('ProtectedRoute - Auth State:', {
    isAuthenticated,
    user,
    loading,
    allowedRoles,
    userRole: user?.role
  });

  if (loading) {
    console.log('ProtectedRoute - Still loading...');
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Redirect to appropriate login page based on required role
    if (allowedRoles.includes('Admin')) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/customer/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // If admin role required but user isn't admin, redirect to admin login
    if (allowedRoles.includes('Admin') && user?.role !== 'Admin') {
      return <Navigate to="/admin/login" replace />;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">You don't have permission to access this area.</p>
          <button
            onClick={() => window.history.back()}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;