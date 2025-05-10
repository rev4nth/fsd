import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import SellerNavbar from '../components/SellerNavbar';

const SellerBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'SELLER') {
      navigate('/login');
      return;
    }
    fetchBookings();
    const interval = setInterval(fetchBookings, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      if (!token || role !== 'SELLER') {
        navigate('/login');
        return;
      }
      const response = await axios.get('http://localhost:2509/api/bookings/seller', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setBookings(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error('Failed to fetch bookings');
      if (error.response && error.response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
      }
    }
  };

  const handleBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      if (!token || role !== 'SELLER') {
        navigate('/login');
        return;
      }
      const response = await axios.put(
        `http://localhost:2509/api/bookings/${bookingId}/status?status=${status}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      toast.success(`Booking ${status.toLowerCase()} successfully`);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update booking status');
      if (error.response && error.response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerNavbar />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Booking Requests
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Manage property visit requests from potential buyers
          </p>
        </div>
        {loading ? (
          <div className="mt-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="text-gray-500">No booking requests yet.</p>
          </div>
        ) : (
          <div className="mt-10">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <li key={booking.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {booking.propertyTitle || 'Property Title Not Available'}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Requested by: {booking.buyerFullName || 'Unknown Buyer'}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Visit Date: {booking.visitDate ? new Date(booking.visitDate).toLocaleDateString() : 'N/A'}
                          </p>
                          <p className="mt-2 sm:mt-0 sm:ml-6 flex items-center text-sm text-gray-500">
                            Amount: ₹{booking.amount || 'N/A'}
                          </p>
                          <p className="mt-2 sm:mt-0 sm:ml-6 flex items-center text-sm text-gray-500">
                            Payment Status: <span className={booking.paymentId ? 'text-green-600 ml-1' : 'text-yellow-600 ml-1'}>
                              {booking.paymentId ? 'Paid' : 'Pending'}
                            </span>
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Requested on: {booking.createdDate ? new Date(booking.createdDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      {booking.message && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Message: {booking.message}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons: Show for PENDING status regardless of payment */}
                      {booking.status === 'PENDING' && (
                        <div className="mt-4 flex space-x-3">
                          <button
                            onClick={() => handleBookingStatus(booking.id, 'CONFIRMED')}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleBookingStatus(booking.id, 'REJECTED')}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {/* Complete Button: Show for CONFIRMED status when payment is made */}
                      {booking.paymentId && booking.status === 'CONFIRMED' && (
                        <div className="mt-4 flex space-x-3">
                          <button
                            onClick={() => handleBookingStatus(booking.id, 'COMPLETED')}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Complete Visit
                          </button>
                        </div>
                      )}
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

export default SellerBookingsPage;