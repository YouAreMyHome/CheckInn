import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  MapPin, 
  Calendar, 
  Users, 
  Phone, 
  Mail,
  Download,
  Home
} from 'lucide-react';

const BookingConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { booking, hotel, room } = location.state || {};

  if (!booking || !hotel || !room) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find your booking confirmation.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600">
          Your reservation has been successfully confirmed. A confirmation email has been sent to your email address.
        </p>
      </div>

      {/* Booking Details Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="bg-green-50 px-6 py-4 border-b border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-green-800">Booking Confirmation</h2>
              <p className="text-sm text-green-600">Confirmation Number: <strong>{booking.confirmationNumber || booking._id}</strong></p>
            </div>
            <button className="flex items-center text-green-600 hover:text-green-700 text-sm">
              <Download className="h-4 w-4 mr-1" />
              Download PDF
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hotel Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Hotel Information</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">{hotel.name}</h4>
                  <div className="flex items-center mt-1 text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">{hotel.address}</span>
                  </div>
                </div>
                
                {hotel.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="text-sm">{hotel.phone}</span>
                  </div>
                )}
                
                {hotel.email && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="text-sm">{hotel.email}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Check-in Instructions</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Check-in time: {hotel.checkInTime || '3:00 PM'}</p>
                    <p>• Check-out time: {hotel.checkOutTime || '11:00 AM'}</p>
                    <p>• Please bring a valid photo ID</p>
                    <p>• Present this confirmation at check-in</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{room.type}</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
                    </div>
                    <div>
                      <span className="font-medium">Nights: </span>
                      {booking.nights || Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24))}
                    </div>
                  </div>
                </div>

                {/* Guest Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Guest Information</h4>
                  <div className="text-sm text-gray-600">
                    <p>{booking.guestInfo?.firstName} {booking.guestInfo?.lastName}</p>
                    <p>{booking.guestInfo?.email}</p>
                    <p>{booking.guestInfo?.phone}</p>
                  </div>
                </div>

                {/* Special Requests */}
                {booking.guestInfo?.specialRequests && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Special Requests</h4>
                    <p className="text-sm text-gray-600">{booking.guestInfo.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Room rate (${room.price} × {booking.nights || 1} nights)</span>
                  <span>${booking.subtotal?.toFixed(2) || (room.price * (booking.nights || 1)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxes & fees</span>
                  <span>${booking.taxes?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Paid</span>
                    <span className="text-green-600">${booking.total?.toFixed(2) || room.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-300">
                <p className="text-xs text-gray-500">
                  Payment method: **** **** **** {booking.paymentInfo?.cardNumber?.slice(-4) || '****'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200"
        >
          <Home className="h-5 w-5 mr-2" />
          Back to Home
        </button>
        <button
          onClick={() => navigate('/my-bookings')}
          className="flex items-center justify-center border border-blue-600 text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition duration-200"
        >
          View My Bookings
        </button>
      </div>

      {/* Important Information */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Important Information</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>• A confirmation email has been sent to {booking.guestInfo?.email}</p>
          <p>• Please save this confirmation for your records</p>
          <p>• For any changes or cancellations, contact the hotel directly or use our customer service</p>
          <p>• Cancellation policy: Free cancellation until 24 hours before check-in</p>
          <p>• For assistance, call our 24/7 customer service at +1-800-CHECKIN</p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;