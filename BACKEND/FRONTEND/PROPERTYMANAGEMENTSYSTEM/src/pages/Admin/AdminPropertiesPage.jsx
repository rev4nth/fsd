import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNavbar from '../../components/AdminNavbar';
import { useNavigate } from 'react-router-dom';

const AdminPropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://fsd-jz2r.onrender.com/api/properties', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProperties(response.data);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <div>
      <AdminNavbar />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">All Properties</h1>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <div key={property.id} className="bg-white p-4 rounded shadow">
                <img src={property.imageUrls?.[0] || '/placeholder.jpg'} alt={property.title} className="h-40 w-full object-cover rounded" />
                <h2 className="text-lg font-semibold mt-2">{property.title}</h2>
                <p className="text-gray-600">{property.location}</p>
                <p className="text-green-700 font-bold">₹{property.price}</p>
                <button
                  className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  onClick={() => navigate(`/admin/properties/edit/${property.id}`)}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPropertiesPage;
