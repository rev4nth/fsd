import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar';

const AdminHome = () => {
  const navigate = useNavigate();
  
  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'ADMIN') {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Admin Dashboard
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Manage RevoStay platform, users, and properties
          </p>
        </div>
        
        <div className="mt-10">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <p className="text-gray-700">
              Welcome to the admin dashboard. From here, you can manage users, view all property listings, handle reports, and configure system settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;