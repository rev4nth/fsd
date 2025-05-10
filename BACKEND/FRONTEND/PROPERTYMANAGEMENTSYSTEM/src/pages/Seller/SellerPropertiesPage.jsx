import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SellerNavbar from '../../components/SellerNavbar';
import PropertyCard from './PropertyCard';
import AddPropertyModal from './AddPropertyModal';
import EditPropertyModal from './EditPropertyModal';

const SellerPropertiesPage = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Check authentication on component mount
  useEffect(() => {
    if (!token) {
      toast.error('Please login to access this page');
      navigate('/login');
      return;
    }

    if (role !== 'SELLER') {
      toast.error('You do not have permission to access this page');
      navigate('/');
      return;
    }

    fetchProperties();
  }, [navigate, token, role]);

  const handleAuthError = () => {
    toast.error('Your session has expired. Please login again.');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:2509/api/properties/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch properties');
        } else {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error(`Failed to load properties: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:2509/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete property');
        } else {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
      }

      // Remove the deleted property from state
      setProperties(properties.filter(property => property.id !== propertyId));
      toast.success('Property deleted successfully');
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error(`Failed to delete property: ${error.message}`);
    }
  };

  const handleAddProperty = () => {
    setShowAddModal(true);
  };

  const handlePropertyAdded = () => {
    fetchProperties();
    setShowAddModal(false);
  };

  const handleEditProperty = (property) => {
    setSelectedProperty(property);
    setShowEditModal(true);
  };

  const handlePropertyUpdated = () => {
    fetchProperties();
    setShowEditModal(false);
    setSelectedProperty(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerNavbar />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <button
            onClick={handleAddProperty}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Add New Property
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                onDelete={() => handleDeleteProperty(property.id)}
                onEdit={() => handleEditProperty(property)}
                isOwner={true}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">You haven't listed any properties yet.</p>
            <button
              onClick={handleAddProperty}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Add Your First Property
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddPropertyModal 
          onClose={() => setShowAddModal(false)} 
          onPropertyAdded={handlePropertyAdded}
        />
      )}

      {showEditModal && selectedProperty && (
        <EditPropertyModal
          property={selectedProperty}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProperty(null);
          }}
          onPropertyUpdated={handlePropertyUpdated}
        />
      )}
    </div>
  );
};

export default SellerPropertiesPage;