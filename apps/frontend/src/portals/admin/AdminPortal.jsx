import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layout/AdminLayout';
import ProtectedRoute from '../../shared/components/ProtectedRoute';

// Auth Pages
import AdminLoginPage from './pages/AdminLoginPage';
import AdminForgotPasswordPage from './pages/AdminForgotPasswordPage';
import AdminResetPasswordPage from './pages/AdminResetPasswordPage';

// Protected Pages
import DashboardPage from './pages/DashboardPage';
import EnhancedDashboardPage from './pages/EnhancedDashboardPage';
import UsersPage from './pages/UsersPage';
import HotelsPage from './pages/HotelsPage';
import VerificationsPage from './pages/VerificationsPage';
import ReportsPage from './pages/ReportsPage';
import ReviewsPage from './pages/ReviewsPage';
import SecurityPage from './pages/SecurityPage';
import SettingsPage from './pages/SettingsPage';

const AdminPortal = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<AdminLoginPage />} />
      <Route path="/forgot-password" element={<AdminForgotPasswordPage />} />
      <Route path="/reset-password" element={<AdminResetPasswordPage />} />
      
      {/* Protected Admin Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EnhancedDashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="hotels" element={<HotelsPage />} />
        <Route path="verifications" element={<VerificationsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="security" element={<SecurityPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      {/* Redirect any other admin routes to login */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default AdminPortal;