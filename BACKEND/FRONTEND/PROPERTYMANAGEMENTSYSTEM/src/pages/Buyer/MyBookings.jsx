import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BuyerNavbar from '../../components/BuyerNavbar';
import { toast } from 'react-toastify';

const MyBookings = () => {
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handlePayment = async (booking) => {
    try {
      const token = localStorage.getItem('token');
      
      // First get a fresh order from the backend
      const orderResponse = await axios.post(
        `http://localhost:2509/api/payments/create-order?amount=${Number(booking.amount).toFixed(2)}&currency=INR`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!orderResponse.data || !orderResponse.data.orderId) {
        throw new Error('Failed to create payment order');
      }

      // Wait for Razorpay to load
      const waitForRazorpay = () => {
        return new Promise((resolve) => {
          if (window.Razorpay) {
            resolve();
          } else {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve();
            script.onerror = () => {
              throw new Error('Razorpay SDK failed to load');
            };
            document.body.appendChild(script);
          }
        });
      };

      // Wait for Razorpay to be available
      await waitForRazorpay();

      // Initialize Razorpay payment
      const options = {
        key: "rzp_test_vXVnFBJPBn8Llt", // Replace with your actual test Key ID
        amount: booking.amount * 100, // Amount in paise
        currency: "INR",
        name: "RevoStay",
        description: `Booking for ${booking.propertyTitle}`,
        order_id: orderResponse.data.orderId,
        handler: async function (response) {
          try {
            // Update booking status with payment details
            const updateResponse = await axios.put(
              `http://localhost:2509/api/bookings/${booking.id}/status`,
              {
                status: 'CONFIRMED',
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                orderId: response.razorpay_order_id
              },
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (updateResponse.data) {
              toast.success('Payment successful! Booking confirmed.');
              // Refresh bookings list
              fetchBookings();
            }
          } catch (error) {
            toast.error('Failed to confirm booking after payment');
            console.error('Payment verification error:', error);
          }
        },
        prefill: {
          name: localStorage.getItem('username'),
          email: localStorage.getItem('email')
        },
        theme: {
          color: "#3399cc"
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      toast.error('Failed to initiate payment: ' + (error.response?.data?.message || error.message));
      console.error('Payment error:', error);
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:2509/api/bookings/${bookingId}/status`,
        { status: 'COMPLETED' },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      toast.success('Booking confirmed!');
      // Refresh the bookings list
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'COMPLETED' } : b));
    } catch (error) {
      toast.error('Failed to confirm booking');
    }
  };

  // --- Cancel Booking Handler ---
  const handleCancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:2509/api/bookings/${bookingId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBookings(bookings =>
        bookings.map(b =>
          b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
        )
      );
      toast.success('Booking cancelled successfully');
    } catch (err) {
      toast.error('Failed to cancel booking');
      console.error('Error cancelling booking:', err);
    }
  };

  console.log('Bookings data:', bookings);

  return (
    <div>
      <BuyerNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading your bookings...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        ) : bookings.length === 0 ? (
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
                        <p className="text-sm font-medium text-gray-500">Payment Status</p>
                        <p className={`mt-1 text-sm ${booking.paymentId ? 'text-green-600' : 'text-yellow-600'}`}>
                          {booking.paymentId ? 'Paid' : 'Pending'}
                        </p>
                      </div>
                    </div>
                    {booking.status === 'PENDING' && !booking.paymentId && (
                      <div className="mt-4">
                        <button
                          onClick={() => handlePayment(booking)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Complete Payment
                        </button>
                      </div>
                    )}
                    {booking.status === 'CONFIRMED' && booking.paymentId && (
                      <div className="mt-4">
                        <button
                          onClick={() => handleConfirmBooking(booking.id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                        >
                          Confirm Booking
                        </button>
                      </div>
                    )}
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

export default MyBookings; 