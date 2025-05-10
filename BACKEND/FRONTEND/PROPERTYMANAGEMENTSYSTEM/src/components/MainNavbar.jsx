import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const MainNavbar = () => {
  return (
    <div className="w-full">
      {/* Header with welcome message */}
      <div className="bg-blue-800 text-white py-4 px-6 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">Welcome to RevoStay</h2>
          <p className="text-sm mb-2">Explore Properties in Tenali, Vijayawada</p>
          <button className="bg-white text-blue-800 px-4 py-1 rounded-md text-sm font-medium hover:bg-blue-100 transition">
            Explore
          </button>
        </div>
      </div>

      {/* Main navigation bar */}
      <nav className="bg-white shadow-md py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-800">
            RevoStay
          </Link>
          
          <div className="flex gap-4">
            <Link
              to="/register"
              className="px-4 py-2 text-blue-800 border border-blue-800 rounded-md hover:bg-blue-50 transition"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default MainNavbar;