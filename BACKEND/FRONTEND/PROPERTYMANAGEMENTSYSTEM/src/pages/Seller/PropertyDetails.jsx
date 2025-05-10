import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SellerNavbar from '../../components/SellerNavbar';
import BuyerNavbar from '../../components/BuyerNavbar';
import { FaMapMarkerAlt, FaCompass } from 'react-icons/fa';

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCoords, setMapCoords] = useState({ lat: 20.5937, lng: 78.9629 }); // default India center
  
  const userRole = localStorage.getItem('role');
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');

  const directions = ['North', 'East', 'South', 'West'];
  const randomDirection = directions[Math.floor(Math.random() * directions.length)];

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetchPropertyDetails();
  }, [id, navigate, token]);

  const fetchPropertyDetails = async () => {
    setLoading(true);
    try {
      const endpoint = userRole === 'SELLER' || userRole === 'ADMIN' 
        ? `http://localhost:2509/api/properties/${id}`
        : `http://localhost:2509/api/public/properties/${id}`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch property details');
      }

      const data = await response.json();
      setProperty(data);
      
      // Check if the current user is the owner of this property
      if (userRole === 'SELLER' && data.sellerUsername === username) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error('Error fetching property details:', error);
      toast.error('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (!isOwner) return;
    
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:2509/api/properties/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete property');
      }

      toast.success('Property deleted successfully');
      navigate('/seller/properties');
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  };

  const handleEditProperty = () => {
    if (!isOwner) return;
    navigate(`/properties/edit/${id}`);
  };

  const nextImage = () => {
    if (property?.imageUrls?.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === property.imageUrls.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.imageUrls?.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? property.imageUrls.length - 1 : prevIndex - 1
      );
    }
  };

  const handleImageClick = () => {
    setShowFullImage(true);
  };

  const handleContactSeller = () => {
    // In a real application, this would open a contact form or messaging feature
    toast.info('Contact feature will be implemented soon!');
  };

  function getRandomIndiaCoords() {
    const lat = (Math.random() * (35 - 8)) + 8;
    const lng = (Math.random() * (92 - 68)) + 68;
    return { lat, lng };
  }

  const handleViewMap = () => {
    window.open('https://www.openstreetmap.org/edit#map=14/16.43401/80.63247', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {userRole === 'SELLER' ? <SellerNavbar /> : <BuyerNavbar />}
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        {userRole === 'SELLER' ? <SellerNavbar /> : <BuyerNavbar />}
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Property Not Found</h2>
            <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {userRole === 'SELLER' ? <SellerNavbar /> : <BuyerNavbar />}
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 transition"
          >
            <span className="mr-2">←</span> Back
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Property Images */}
          <div className="relative h-96 bg-gray-200">
            {property.imageUrls && property.imageUrls.length > 0 ? (
              <>
                <img 
                  src={property.imageUrls[currentImageIndex]} 
                  alt={`${property.title} - Image ${currentImageIndex + 1}`}
                  className="h-full w-full object-cover cursor-pointer"
                  onClick={handleImageClick}
                />
                
                {property.imageUrls.length > 1 && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-between p-4">
                      <button 
                        onClick={prevImage}
                        className="bg-white bg-opacity-70 rounded-full p-2 hover:bg-opacity-100 transition"
                      >
                        ←
                      </button>
                      <button 
                        onClick={nextImage}
                        className="bg-white bg-opacity-70 rounded-full p-2 hover:bg-opacity-100 transition"
                      >
                        →
                      </button>
                    </div>
                    
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {property.imageUrls.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No images available</p>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {property.imageUrls && property.imageUrls.length > 1 && (
            <div className="p-4 bg-gray-50">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {property.imageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Thumbnail ${index + 1}`}
                    className={`h-20 w-20 object-cover rounded cursor-pointer ${
                      index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Property Information */}
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                <p className="text-xl text-gray-600 mt-1">{property.location}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-700">₹{property.price.toLocaleString()}</div>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                  property.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {property.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-gray-600">Property Type</span>
                    <span className="font-medium">{property.propertyType}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600">Bedrooms</span>
                    <span className="font-medium">{property.bedrooms}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600">Bathrooms</span>
                    <span className="font-medium">{property.bathrooms}</span>
                  </div>
                  {property.area && (
                    <div className="flex flex-col">
                      <span className="text-gray-600">Area</span>
                      <span className="font-medium">{property.area} sq.ft</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-gray-600">Listed On</span>
                    <span className="font-medium">
                      {new Date(property.createdDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Amenities</h2>
                {property.amenities ? (
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.split(',').map((amenity, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                      >
                        {amenity.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No amenities listed</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
            </div>

            {/* Seller Information */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Seller Information</h2>
              <p className="text-gray-700 mb-2">
                <span className="font-medium">Name:</span> {property.sellerFullName}
              </p>
              {!isOwner && userRole === 'BUYER' && (
                <button
                  onClick={handleContactSeller}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Contact Seller
                </button>
              )}
            </div>

            {/* Action Buttons for Owner */}
            {isOwner && (
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={handleEditProperty}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                >
                  Edit Property
                </button>
                <button
                  onClick={handleDeleteProperty}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Delete Property
                </button>
              </div>
            )}

            <div className="flex flex-col">
              <span className="text-gray-600 flex items-center"><FaCompass className="mr-1" /> Facing</span>
              <span className="font-medium">{randomDirection}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-600 flex items-center"><FaMapMarkerAlt className="mr-1" /> Map</span>
              <span
                className="font-medium cursor-pointer hover:underline text-blue-600"
                onClick={handleViewMap}
                title="View random location on map"
              >
                <FaMapMarkerAlt className="inline text-red-500 text-lg" />
                <span className="ml-1">View on Map</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {showFullImage && property.imageUrls && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-7xl max-h-[90vh] p-4">
            <img
              src={property.imageUrls[currentImageIndex]}
              alt={`${property.title} - Full View`}
              className="max-h-[80vh] max-w-full object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
              onClick={() => setShowFullImage(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {showMapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl"
              onClick={() => setShowMapModal(false)}
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-2">Random Location in India</h2>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/India_location_map.svg/500px-India_location_map.svg.png"
              alt="Static Map UI"
              className="w-full rounded"
            />
            <p className="mt-2 text-sm text-gray-600">
              (This is a static map UI for demo purposes)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailsPage;