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
// import RegisterPage from './portals/customer/pages/RegisterPage'; // Old version - backed up as RegisterPage.old.jsx
import MultiStepRegisterPage from './portals/customer/pages/MultiStepRegisterPage';
import SearchPage from './portals/customer/pages/SearchPage';
import HotelDetailPage from './portals/customer/pages/HotelDetailPage';
import BookingPage from './portals/customer/pages/BookingPage';
import ProfilePage from './portals/customer/pages/ProfilePage';
import ForgotPasswordPage from './portals/customer/pages/ForgotPasswordPage';

// Auth Components
import { AuthProvider } from './shared/context/AuthContext.jsx';
import ProtectedRoute from './shared/components/ProtectedRoute';
import { NotificationProvider } from './shared/components/NotificationProvider';

// Shared Components
import ErrorBoundary from './shared/components/ErrorBoundarySimple';
import TestPage from './TestPage';
import TestNotifications from './TestNotifications';
import AdminAuthDemo from './portals/admin/components/AdminAuthDemo';
import NotificationTest from './components/NotificationTest';

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
            <NotificationProvider>
              <div className="min-h-screen bg-gray-50">
                <Routes>
                {/* Test Routes */}
                <Route path="/test" element={<TestPage />} />
                <Route path="/test-notifications" element={<TestNotifications />} />
                <Route path="/test-notifications-old" element={<NotificationTest />} />
                <Route path="/admin-auth-demo" element={<AdminAuthDemo />} />
                
                {/* Customer Portal Routes */}
                <Route path="/" element={<CustomerLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="search" element={<SearchPage />} />
                  <Route path="hotel/:id" element={<HotelDetailPage />} />
                  <Route path="booking" element={<BookingPage />} />
                  <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                </Route>
                
                {/* Auth Routes - Outside CustomerLayout for full-page design */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<MultiStepRegisterPage />} />
                {/* Old single-step registration backed up as RegisterPage.old.jsx */}
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                
                {/* Hotel Manager Portal - Protected */}
                <Route 
                  path="/hotel-manager/*" 
                  element={
                    <ProtectedRoute allowedRoles={['HotelPartner']}>
                      <HotelManagerPortal />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin Portal - Handles its own auth */}
                <Route 
                  path="/admin/*" 
                  element={<AdminPortal />} 
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
            </NotificationProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
