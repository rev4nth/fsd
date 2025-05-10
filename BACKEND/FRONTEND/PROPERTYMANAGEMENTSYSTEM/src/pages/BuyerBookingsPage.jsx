import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import BuyerNavbar from '../components/BuyerNavbar';

const BuyerBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  // First useEffect for authentication check
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      console.log('Auth check:', { hasToken: !!token, role });
      
      if (!token || role !== 'BUYER') {
        console.log('Auth failed, redirecting to login');
        navigate('/login');
        return false;
      }
      return true;
    };
    
    const isAuthenticated = checkAuth();
    setAuthChecked(isAuthenticated);
  }, [navigate]);

  // Second useEffect for data fetching (only runs if authenticated)
  useEffect(() => {
    if (authChecked) {
      fetchBookings();
      const interval = setInterval(fetchBookings, 30000);
      return () => clearInterval(interval);
    }
  }, [authChecked]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        navigate('/login');
        return;
      }

      console.log('Fetching bookings...');
      const response = await axios.get('http://localhost:2509/api/bookings/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response:', response);
      
      if (!response.data) {
        console.log('No data in response');
        setBookings([]);
        setLoading(false);
        return;
      }

      // Handle both array and single object responses
      const bookingsData = Array.isArray(response.data) ? response.data : [response.data];
      console.log('Bookings data:', bookingsData);

      const processedBookings = bookingsData.map(booking => {
        console.log('Processing booking with structure:', Object.keys(booking));
        return {
          id: booking.id || '',
          status: booking.status || 'PENDING',
          amount: booking.amount || 0,
          visitDate: booking.bookingDate || new Date().toISOString(),
          message: booking.message || '',
          property: {
            id: booking.propertyId || '',
            title: booking.propertyTitle || 'Unknown Property',
            location: booking.propertyLocation || 'Location not available'
          },
          seller: {
            name: booking.sellerFullName || 'Unknown Seller'
          },
          buyer: {
            name: booking.buyerFullName || 'Unknown Buyer'
          },
          transactionId: booking.transactionId || '',
          createdAt: booking.createdDate || booking.bookingDate || new Date().toISOString()
        };
      });

      console.log('Processed bookings:', processedBookings);
      setBookings(processedBookings);
      setError(null);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response?.status === 403) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
      } else {
        setError('Failed to fetch bookings. Please try again.');
        toast.error('Failed to fetch bookings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:2509/api/bookings/${bookingId}/status?status=CANCELLED`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        toast.success('Booking cancelled successfully');
        fetchBookings();
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusColor = (status) => {
    const statusUpper = status?.toUpperCase() || '';
    switch (statusUpper) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      console.error('Date formatting error:', err);
      return 'Invalid date';
    }
  };

  // Debug render
  console.log('Current state:', { loading, error, bookingsCount: bookings.length, authChecked });

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div 
        style={{ 
          background: 'yellow', 
          color: 'black', 
          padding: '16px', 
          textAlign: 'center', 
          fontWeight: 'bold' 
        }}
      >
        DEBUG: BuyerBookingsPage is rendering! If you see this, the component is mounted.
      </div>
      <BuyerNavbar />
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            My Bookings
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Track the status of your property visit requests
          </p>
        </div>

        {loading ? (
          <div className="mt-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading bookings...</p>
          </div>
        ) : error ? (
          <div className="mt-10 text-center">
            <h2 className="text-2xl font-bold text-red-600">Error</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={fetchBookings}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Retry
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="text-gray-500">You haven't made any bookings yet.</p>
            <button
              onClick={() => navigate('/buyer')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="mt-10">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {bookings.map((booking, index) => (
                  <li key={booking.id || index} className="hover:bg-gray-50 transition-colors duration-150">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {booking.property.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Location: {booking.property.location}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Seller: {booking.seller.name}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Transaction ID: {booking.transactionId}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            Booked on: {formatDate(booking.createdAt)}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            Amount: ${booking.amount}
                          </p>
                        </div>
                        {booking.status === 'PENDING' && (
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel Booking
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerBookingsPage;