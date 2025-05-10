import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BuyerNavbar from '../../components/BuyerNavbar';
import { toast } from 'react-toastify';

const BuyerBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:2509/api/bookings/my', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setBookings(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch bookings. Please try again later.');
        toast.error('Failed to fetch your bookings');
        setLoading(false);
        console.error('Error fetching bookings:', err);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:2509/api/bookings/${bookingId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update bookings list after cancellation
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'CANCELLED' } 
          : booking
      ));
      
      toast.success('Booking cancelled successfully');
    } catch (err) {
      toast.error('Failed to cancel booking');
      console.error('Error cancelling booking:', err);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div>
        <BuyerNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading your bookings...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <BuyerNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BuyerNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="bg-white shadow overflow-hidden rounded-lg p-10 text-center">
            <p className="text-lg text-gray-600">You don't have any bookings yet.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <li key={booking.id}>
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{booking.propertyTitle}</h3>
                        <p className="mt-1 text-sm text-gray-500">Location: {booking.propertyLocation}</p>
                        <p className="mt-1 text-sm text-gray-500">Seller: {booking.sellerFullName}</p>
                        <p className="mt-1 text-sm text-gray-500">Transaction ID: {booking.transactionId}</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                            booking.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Amount</p>
                        <p className="mt-1 text-sm text-gray-900">₹{booking.amount}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Booking Date</p>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(booking.bookingDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Created Date</p>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(booking.createdDate)}</p>
                      </div>
                    </div>
                    {booking.status !== 'CANCELLED' && (
                      <div className="mt-4">
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerBookingsPage;