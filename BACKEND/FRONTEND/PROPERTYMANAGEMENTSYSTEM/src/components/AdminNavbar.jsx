import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminNavbar = () => {
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
    <nav className="bg-gray-800 p-4 flex space-x-4">
      <Link to="/admin/properties" className="text-white hover:text-yellow-300">All Properties</Link>
      <div className="flex items-center gap-6">
        <span className="text-sm text-gray-300">
          Welcome, <span className="font-semibold">{fullName || username}</span>
        </span>
        
        <Link to="/admin" className="text-white hover:text-blue-400 transition">
          Dashboard
        </Link>
        
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;