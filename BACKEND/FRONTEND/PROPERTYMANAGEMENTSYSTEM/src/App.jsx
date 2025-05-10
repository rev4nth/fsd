import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BuyerHome from './pages/Buyer/BuyerHome';
import SellerHome from './pages/Seller/SellerHome';
import AdminHome from './pages/Admin/AdminHome';
import ProfilePage from './components/ProfilePage';

// Seller pages
import SellerPropertiesPage from './pages/Seller/SellerPropertiesPage';
import PropertyDetails from './pages/Seller/PropertyDetails';
import AddPropertyModal from './pages/Seller/AddPropertyModal';
import SellerBookingsPage from './pages/SellerBookingsPage';

// Buyer pages
import BuyerPropertiesPage from './pages/BuyerPropertiesPage';
import BuyerBookingsPage from './pages/Buyer/BuyerBookingsPage';
import MyBookings from './pages/Buyer/MyBookings';

// Admin pages
import AdminPropertiesPage from './pages/Admin/AdminPropertiesPage';
import AdminEditPropertyPage from './pages/Admin/AdminEditPropertyPage';

// Protected route component
const ProtectedRoute = ({ element, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (role && userRole !== role) {
    // If the user doesn't have the required role, redirect to their home page
    if (userRole === 'ADMIN') {
      return <Navigate to="/admin" />;
    } else if (userRole === 'BUYER') {
      return <Navigate to="/buyer" />;
    } else if (userRole === 'SELLER') {
      return <Navigate to="/seller" />;
    } else {
      // Fallback if role is unknown
      return <Navigate to="/" />;
    }
  }
  
  return element;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes with role-based access */}
          <Route 
            path="/admin" 
            element={<ProtectedRoute element={<AdminHome />} role="ADMIN" />} 
          />
          {/* Admin property management routes */}
          <Route 
            path="/admin/properties" 
            element={<ProtectedRoute element={<AdminPropertiesPage />} role="ADMIN" />} 
          />
          <Route 
            path="/admin/properties/edit/:id" 
            element={<ProtectedRoute element={<AdminEditPropertyPage />} role="ADMIN" />} 
          />
          <Route 
            path="/buyer" 
            element={<ProtectedRoute element={<BuyerHome />} role="BUYER" />} 
          />
          
          {/* Seller routes */}
          <Route 
            path="/seller" 
            element={<ProtectedRoute element={<SellerHome />} role="SELLER" />} 
          />
          <Route 
            path="/seller/properties" 
            element={<ProtectedRoute element={<SellerPropertiesPage />} role="SELLER" />} 
          />
          <Route 
            path="/seller/property/:id" 
            element={<ProtectedRoute element={<PropertyDetails />} role="SELLER" />} 
          />
          <Route 
            path="/seller/add-property" 
            element={<ProtectedRoute element={<AddPropertyModal />} role="SELLER" />} 
          />
          <Route 
            path="/seller/bookings" 
            element={<ProtectedRoute element={<SellerBookingsPage />} role="SELLER" />} 
          />
          
          {/* Buyer routes */}
          <Route
            path="/buyer/properties"
            element={
              <ProtectedRoute role="BUYER">
                <BuyerPropertiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/bookings"
            element={
              <ProtectedRoute role="BUYER">
                <BuyerBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/mybookings"
            element={<MyBookings />}
          />
          
          {/* Property Details route - accessible to both buyers and sellers */}
          <Route
            path="/properties/:id"
            element={
              <ProtectedRoute element={<PropertyDetails />} role={null} />
            }
          />
          
          {/* Profile route - accessible to all authenticated users */}
          <Route 
            path="/profile" 
            element={<ProtectedRoute element={<ProfilePage />} role={null} />} 
          />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;