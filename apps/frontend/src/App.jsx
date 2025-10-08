import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Portal Components
import CustomerPortal from './portals/customer/CustomerPortal';
import HotelManagerPortal from './portals/hotel-manager/HotelManagerPortal';
import AdminPortal from './portals/admin/AdminPortal';

// Customer Layout and Pages
import CustomerLayout from './portals/customer/components/CustomerLayout';
import HomePage from './portals/customer/pages/HomePage';
import LoginPage from './portals/customer/pages/LoginPage';
import RegisterPage from './portals/customer/pages/RegisterPage';
import SearchPage from './portals/customer/pages/SearchPage';
import HotelDetailPage from './portals/customer/pages/HotelDetailPage';
import BookingPage from './portals/customer/pages/BookingPage';
import ProfilePage from './portals/customer/pages/ProfilePage';

// Auth Components
import { AuthProvider } from './shared/context/AuthContext.jsx';
import ProtectedRoute from './shared/components/ProtectedRoute';

// Shared Components
import ErrorBoundary from './shared/components/ErrorBoundary';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Customer Portal Routes */}
                <Route path="/" element={<CustomerLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="search" element={<SearchPage />} />
                  <Route path="hotel/:id" element={<HotelDetailPage />} />
                  <Route path="booking" element={<BookingPage />} />
                  <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                </Route>
                
                {/* Hotel Manager Portal - Protected */}
                <Route 
                  path="/hotel-manager/*" 
                  element={
                    <ProtectedRoute allowedRoles={['HotelPartner']}>
                      <HotelManagerPortal />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin Portal - Admin only */}
                <Route 
                  path="/admin/*" 
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <AdminPortal />
                    </ProtectedRoute>
                  } 
                />
                
                {/* 404 Page */}
                <Route path="*" element={<div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-8">Page not found</p>
                    <a href="/" className="btn-primary">Back to Home</a>
                  </div>
                </div>} />
              </Routes>
            </div>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
