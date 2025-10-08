import { Routes, Route } from 'react-router-dom';
import HotelManagerLayout from './layout/HotelManagerLayout';

// Pages
import DashboardPage from './pages/DashboardPage';
import HotelsPage from './pages/HotelsPage';
import RoomsPage from './pages/RoomsPage';
import BookingsPage from './pages/BookingsPage';
import GuestsPage from './pages/GuestsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

const HotelManagerPortal = () => {
  return (
    <Routes>
      <Route path="/" element={<HotelManagerLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="hotels" element={<HotelsPage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="guests" element={<GuestsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

export default HotelManagerPortal;