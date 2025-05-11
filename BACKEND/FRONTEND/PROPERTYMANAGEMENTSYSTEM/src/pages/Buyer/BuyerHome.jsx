import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import BuyerNavbar from '../../components/BuyerNavbar';

const BuyerHome = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    visitDate: '',
    message: '',
    amount: '',
    transactionId: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  
  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'BUYER') {
      navigate('/login');
      return;
    }
    
    fetchProperties();
  }, [navigate]);

  const fetchProperties = async () => {
    try {
      const response = await axios.get('https://fsd-jz2r.onrender.com/api/public/properties');
      setProperties(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to fetch properties');
      setLoading(false);
    }
  };

  const handleBookProperty = (property) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to book a property');
      navigate('/login');
      return;
    }
    setSelectedProperty(property);
    setBookingData(prev => ({
      ...prev,
      amount: property.price.toString()
    }));
    setShowBookingModal(true);
  };

  const handleViewDetails = (property) => {
    navigate(`/properties/${property.id}`);
  };

  const generateTransactionId = () => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000000);
    return `TXN${timestamp}${random}`;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      if (!token) {
        toast.error('Please login to book a property');
        navigate('/login');
        return;
      }

      if (role !== 'BUYER') {
        toast.error('Only buyers can book properties');
        navigate('/login');
        return;
      }

      // First create the booking
      const response = await axios.post(
        `https://fsd-jz2r.onrender.com/api/bookings/property/${selectedProperty.id}`,
        {
          visitDate: bookingData.visitDate,
          message: bookingData.message,
          amount: selectedProperty.price
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        toast.success('Booking scheduled! You can complete payment from My Bookings.');
        setShowBookingModal(false);
        setBookingData({ visitDate: '', message: '' });
        navigate('/buyer/mybookings');
        return;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initiate booking');
      console.error('Booking error:', error);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://fsd-jz2r.onrender.com/api/bookings/${bookingId}/cancel`,
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

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !locationFilter || property.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesPrice = (!priceRange.min || property.price >= Number(priceRange.min)) &&
                        (!priceRange.max || property.price <= Number(priceRange.max));
    return matchesSearch && matchesLocation && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <BuyerNavbar />
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Available Properties
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Browse and book properties that match your requirements
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Min Price"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Max Price"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="mt-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="text-gray-500">No properties found matching your criteria.</p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105"
              >
                {property.imageUrls && property.imageUrls.length > 0 && (
                  <img
                    src={property.imageUrls[0]}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">{property.title}</h3>
                  <p className="mt-2 text-gray-600 line-clamp-2">{property.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-2xl font-bold text-indigo-600">₹{property.price}</span>
                    <span className="text-sm text-gray-500">{property.location}</span>
                  </div>
                  <div className="mt-4 flex space-x-4 text-sm text-gray-500">
                    <span>{property.bedrooms} beds</span>
                    <span>{property.bathrooms} baths</span>
                    {property.area && <span>{property.area} sq.ft</span>}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleViewDetails(property)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleBookProperty(property)}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                    >
                      Book Visit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedProperty && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Book Visit for {selectedProperty.title}
            </h3>
            <form onSubmit={handleBookingSubmit}>
              <div className="mb-4">
                <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700">
                  Preferred Visit Date
                </label>
                <input
                  type="date"
                  id="visitDate"
                  required
                  value={bookingData.visitDate}
                  onChange={(e) => setBookingData({ ...bookingData, visitDate: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  id="amount"
                  required
                  value={bookingData.amount}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message (Optional)
                </label>
                <textarea
                  id="message"
                  rows="3"
                  value={bookingData.message}
                  onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Add any specific requirements or questions"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Book Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerHome;
