import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import UserProfile from './UserProfile';
import ProfileCard from './ProfileCard';
import ChangePassword from './ChangePassword';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
     
      setProfile(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile information');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Account</h1>
     
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`inline-block py-4 px-6 font-medium text-center rounded-t-lg ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
              }`}
            >
              Profile
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('security')}
              className={`inline-block py-4 px-6 font-medium text-center rounded-t-lg ${
                activeTab === 'security'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
              }`}
            >
              Security
            </button>
          </li>
        </ul>
      </div>
     
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ProfileCard profile={profile} />
        </div>
        <div className="lg:col-span-2">
          {activeTab === 'profile' && (
            <UserProfile profile={profile} updateProfile={fetchUserProfile} />
          )}
          {activeTab === 'security' && (
            <ChangePassword />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;