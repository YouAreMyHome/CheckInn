import { Routes, Route } from 'react-router-dom';
import CustomerLayout from './components/CustomerLayout';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import HotelDetailPage from './pages/HotelDetailPage';
import BookingPage from './pages/BookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import LoginPage from './pages/LoginPage';
import MultiStepRegisterPage from './pages/MultiStepRegisterPage';
import ProfilePage from './pages/ProfilePage';
import BookingsPage from './pages/BookingsPage';

const CustomerPortal = () => {
  return (
    <Routes>
      {/* Auth routes (no layout) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<MultiStepRegisterPage />} />
      
      {/* Main app routes (with layout) */}
      <Route path="/*" element={
        <CustomerLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/hotel/:hotelId" element={<HotelDetailPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-bookings" element={<BookingsPage />} />
          </Routes>
        </CustomerLayout>
      } />
    </Routes>
  );
};

export default CustomerPortal;