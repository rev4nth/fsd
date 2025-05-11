import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavbar from '../components/MainNavbar';
import axios from 'axios';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await axios.get('https://fsd-jz2r.onrender.com/api/public/properties');
      setProperties(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setLoading(false);
    }
  };

  const handlePropertyClick = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Find Your Dream Property
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Browse properties in Tenali and Vijayawada for rent or purchase
          </p>
        </div>
        
        {loading ? (
          <div className="mt-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <div
                key={property.id}
                onClick={handlePropertyClick}
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition duration-300 hover:scale-105"
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
