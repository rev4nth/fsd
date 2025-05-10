import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PropertyCard = ({ property, onDelete, isOwner = false }) => {
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    navigate(`/properties/${property.id}`);  // Fixed missing backticks
  };
  
  // Set default image if none available
  const propertyImage = property.imageUrls && property.imageUrls.length > 0 
    ? property.imageUrls[0] 
    : 'https://via.placeholder.com/300x200?text=No+Image';
    
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div 
        className="h-48 bg-cover bg-center" 
        style={{ backgroundImage: `url(${propertyImage})` }}  // Fixed url syntax with backticks
      />
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{property.title}</h3>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            {property.isAvailable ? 'Available' : 'Booked'}
          </span>
        </div>
        
        <p className="text-gray-600 mb-2">{property.location}</p>
        <p className="text-lg font-bold text-green-700 mb-2">₹{property.price.toLocaleString()}</p>
        
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <span className="mr-3">{property.bedrooms} Beds</span>
          <span className="mr-3">{property.bathrooms} Baths</span>
          {property.area && <span>{property.area} sq.ft</span>}
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {property.propertyType && (
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
              {property.propertyType}
            </span>
          )}
          {property.amenities && property.amenities.split(',').map((amenity, index) => (
            <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
              {amenity.trim()}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between mt-3">
          <button
            onClick={handleViewDetails}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            View Details
          </button>
          
          {isOwner && (
            <div className="flex gap-2">
              <Link 
                to={`/properties/edit/${property.id}`}  // Fixed missing backticks
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
              >
                Edit
              </Link>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;