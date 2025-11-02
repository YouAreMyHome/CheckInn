import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Calendar, 
  Users, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  Info,
  Clock
} from 'lucide-react';
import { bookingService } from '@services';
import { useAuth } from '@hooks/useAuth';

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { hotel, room, checkIn, checkOut, guests } = location.state || {};
  
  const [guestInfo, setGuestInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialRequests: ''
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingStep, setBookingStep] = useState(1);
  
  useEffect(() => {
    // Redirect if no booking data
    if (!hotel || !room || !checkIn || !checkOut) {
      navigate('/search');
    }
  }, [hotel, room, checkIn, checkOut, navigate]);

  const calculateNights = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotalCost = () => {
    const nights = calculateNights();
    const roomCost = room?.price || 0;
    const subtotal = nights * roomCost;
    const taxes = subtotal * 0.12; // 12% tax
    const total = subtotal + taxes;
    
    return {
      nights,
      roomCost,
      subtotal,
      taxes,
      total
    };
  };

  const handleGuestInfoChange = (e) => {
    setGuestInfo({
      ...guestInfo,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentInfoChange = (e) => {
    setPaymentInfo({
      ...paymentInfo,
      [e.target.name]: e.target.value
    });
  };

  const validateGuestInfo = () => {
    const { firstName, lastName, email, phone } = guestInfo;
    return firstName && lastName && email && phone;
  };

  const validatePaymentInfo = () => {
    const { cardNumber, expiryDate, cvv, cardholderName } = paymentInfo;
    return cardNumber && expiryDate && cvv && cardholderName;
  };

  const handleSubmitBooking = async () => {
    if (!validateGuestInfo() || !validatePaymentInfo()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const bookingData = {
        hotelId: hotel._id,
        roomId: room._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests,
        guestInfo,
        paymentInfo: {
          ...paymentInfo,
          // In real app, payment would be processed by payment gateway
          cardNumber: '****-****-****-' + paymentInfo.cardNumber.slice(-4)
        },
        ...calculateTotalCost()
      };

      const response = await bookingService.createBooking(bookingData);
      
      if (response.success) {
        // Navigate to confirmation page
        navigate('/booking-confirmation', {
          state: {
            booking: response.data,
            hotel,
            room
          }
        });
      } else {
        setError(response.message || 'Failed to create booking');
      }
    } catch (err) {
      setError('Failed to process booking. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!hotel || !room) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Booking Error</h3>
              <p className="mt-1 text-sm text-red-700">Missing booking information. Please start over.</p>
              <button
                onClick={() => navigate('/search')}
                className="mt-3 text-sm text-red-600 hover:text-red-500 underline"
              >
                Back to Search
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const costBreakdown = calculateTotalCost();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-500 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Hotel Details
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            {/* Progress Steps */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center">
                <div className={`flex items-center ${bookingStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${bookingStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium">Guest Information</span>
                </div>
                <div className="flex-1 border-t border-gray-200 mx-4"></div>
                <div className={`flex items-center ${bookingStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${bookingStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium">Payment Details</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {bookingStep === 1 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Guest Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={guestInfo.firstName}
                        onChange={handleGuestInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={guestInfo.lastName}
                        onChange={handleGuestInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={guestInfo.email}
                        onChange={handleGuestInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={guestInfo.phone}
                        onChange={handleGuestInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      name="specialRequests"
                      value={guestInfo.specialRequests}
                      onChange={handleGuestInfoChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any special requests or preferences..."
                    />
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={() => {
                        if (validateGuestInfo()) {
                          setBookingStep(2);
                          setError('');
                        } else {
                          setError('Please fill in all required guest information fields');
                        }
                      }}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {bookingStep === 2 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Payment Information</h2>
                    <button
                      onClick={() => setBookingStep(1)}
                      className="text-blue-600 hover:text-blue-500 text-sm"
                    >
                      Back to Guest Info
                    </button>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                    <div className="flex">
                      <Info className="h-5 w-5 text-blue-400" />
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">
                          This is a demo. No real payment will be processed.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={paymentInfo.cardNumber}
                        onChange={handlePaymentInfoChange}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={paymentInfo.expiryDate}
                        onChange={handlePaymentInfoChange}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={paymentInfo.cvv}
                        onChange={handlePaymentInfoChange}
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        name="cardholderName"
                        value={paymentInfo.cardholderName}
                        onChange={handlePaymentInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={handleSubmitBooking}
                      disabled={loading}
                      className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5 mr-2" />
                          Complete Booking
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
            <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
            
            {/* Hotel Info */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900">{hotel.name}</h4>
              <div className="flex items-center mt-1">
                <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-600">{hotel.address}</span>
              </div>
              <div className="flex items-center mt-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(hotel.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">{hotel.rating}</span>
              </div>
            </div>

            {/* Room Info */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">{room.type}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{checkIn} - {checkOut}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{guests} guest{guests > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{costBreakdown.nights} night{costBreakdown.nights > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Room rate (${room.price} × {costBreakdown.nights} nights)</span>
                <span>${costBreakdown.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Taxes & fees</span>
                <span>${costBreakdown.taxes.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-blue-600">${costBreakdown.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Policies */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Booking Policies</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Free cancellation until 24 hours before check-in</p>
                <p>• Check-in: {hotel.checkInTime || '3:00 PM'}</p>
                <p>• Check-out: {hotel.checkOutTime || '11:00 AM'}</p>
                <p>• Valid photo ID required at check-in</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;