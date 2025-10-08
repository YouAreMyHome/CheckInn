import { Routes, Route } from 'react-router-dom';
import AdminLayout from './layout/AdminLayout';

// Pages
import DashboardPage from './pages/DashboardPage';
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
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="hotels" element={<HotelsPage />} />
        <Route path="verifications" element={<VerificationsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="security" element={<SecurityPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

export default AdminPortal;