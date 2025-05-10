import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserProfile = ({ profile: initialProfile, updateProfile }) => {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };

  // Handle image selection
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/profile', 
        {
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          address: profile.address
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        if (updateProfile) updateProfile();
      } else {
        toast.error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!selectedImage) return;
    
    setUpdating(true);
    const formData = new FormData();
    formData.append('profileImage', selectedImage);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/profile/image', 
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Profile image updated successfully');
        setProfile({
          ...profile,
          profileImageUrl: response.data.profileImageUrl
        });
        setSelectedImage(null);
        setImagePreview(null);
        if (updateProfile) updateProfile();
      } else {
        toast.error(response.data.message || 'Failed to update profile image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload profile image');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Edit Profile</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
          >
            Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={handleProfileUpdate}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 flex flex-col items-center mb-6">
            <div className="w-32 h-32 mb-4 relative rounded-full overflow-hidden">
              <img
                src={imagePreview || profile.profileImageUrl || '/default-avatar.png'}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex flex-col items-center w-full max-w-xs">
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <label
                htmlFor="profileImage"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md cursor-pointer text-center w-full mb-2"
              >
                Select New Image
              </label>
              
              {selectedImage && (
                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={updating}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md w-full"
                >
                  {updating ? 'Uploading...' : 'Upload Image'}
                </button>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={profile.username}
              disabled
              className="bg-gray-100 text-gray-700 border border-gray-300 rounded-md py-2 px-3 w-full"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
              Role
            </label>
            <input
              id="role"
              name="role"
              type="text"
              value={profile.role}
              disabled
              className="bg-gray-100 text-gray-700 border border-gray-300 rounded-md py-2 px-3 w-full"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={profile.fullName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`border border-gray-300 rounded-md py-2 px-3 w-full ${
                !isEditing ? 'bg-gray-100' : 'bg-white'
              }`}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={profile.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`border border-gray-300 rounded-md py-2 px-3 w-full ${
                !isEditing ? 'bg-gray-100' : 'bg-white'
              }`}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              value={profile.phone || ''}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`border border-gray-300 rounded-md py-2 px-3 w-full ${
                !isEditing ? 'bg-gray-100' : 'bg-white'
              }`}
            />
          </div>
          
          <div className="mb-4 md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={profile.address || ''}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows="3"
              className={`border border-gray-300 rounded-md py-2 px-3 w-full ${
                !isEditing ? 'bg-gray-100' : 'bg-white'
              }`}
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end mt-4 space-x-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default UserProfile;