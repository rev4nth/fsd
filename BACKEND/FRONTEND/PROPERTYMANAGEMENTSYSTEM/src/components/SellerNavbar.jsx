import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SellerNavbar = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const fullName = localStorage.getItem('fullName');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    
    toast.success('Logout successful');
    navigate('/');
  };

  return (
    <nav className="bg-green-800 text-white shadow-lg py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/seller" className="text-2xl font-bold text-white">
            RevoStay <span className="text-green-200">Seller</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-6">
          <span className="text-sm text-gray-200">
            Welcome, <span className="font-semibold">{fullName || username}</span>
          </span>
          
          <Link to="/seller" className="text-white hover:text-green-200 transition">
            Dashboard
          </Link>
          
          <Link to="/seller/properties" className="text-white hover:text-green-200 transition">
            My Properties
          </Link>
          
          <Link to="/seller/add-property" className="text-white hover:text-green-200 transition">
            Add Property
          </Link>
          
          <Link to="/seller/bookings" className="text-white hover:text-green-200 transition">
            Booking Requests
          </Link>
          
          <Link to="/profile" className="text-white hover:text-green-200 transition">
            Profile
          </Link>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default SellerNavbar;