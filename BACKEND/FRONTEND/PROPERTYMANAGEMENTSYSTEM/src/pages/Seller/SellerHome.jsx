import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
//import SellerNavbar
import SellerNavbar from './../../components/SellerNavbar';

const SellerHome = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  
  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'SELLER') {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:2509/api/bookings/seller/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setSummary(response.data);
      } catch (err) {
        setError('Failed to load summary');
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerNavbar />
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Seller Dashboard
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Manage your property listings in Tenali and Vijayawada
          </p>
        </div>
        
        <div className="mt-10">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <p className="text-gray-700">
              Your seller dashboard is ready. Here you can list new properties, manage existing listings, and view inquiries from potential buyers.
            </p>
          </div>
        </div>

        {error && <div className="text-red-600 text-center mt-4">{error}</div>}

        {summary && (
          <div className="mt-10">
            <div className="bg-white shadow-lg rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Booking Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="bg-white shadow rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-blue-700">{summary.total}</div>
                  <div className="text-gray-600 mt-2">Total Bookings</div>
                </div>
                <div className="bg-white shadow rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-green-700">{summary.confirmed}</div>
                  <div className="text-gray-600 mt-2">Confirmed</div>
                </div>
                <div className="bg-white shadow rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-red-700">{summary.rejected}</div>
                  <div className="text-gray-600 mt-2">Rejected</div>
                </div>
                <div className="bg-white shadow rounded-lg p-6 text-center col-span-2 md:col-span-3">
                  <div className="text-2xl font-bold text-yellow-700">₹{summary.revenue}</div>
                  <div className="text-gray-600 mt-2">Total Confirmed Revenue</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerHome;