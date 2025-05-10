import React from 'react';

const ProfileCard = ({ profile }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-24"></div>
      
      <div className="flex flex-col items-center -mt-12 pb-5">
        <img 
          src={profile.profileImageUrl || '/default-avatar.png'} 
          alt="Profile" 
          className="w-24 h-24 rounded-full border-4 border-white object-cover"
        />
        
        <h2 className="mt-4 text-xl font-bold text-gray-800">{profile.fullName}</h2>
        <p className="text-gray-600">@{profile.username}</p>
        <span className="px-3 py-1 mt-2 bg-blue-100 text-blue-800 rounded-full text-sm">
          {profile.role}
        </span>
        
        <div className="w-full px-6 mt-6">
          <div className="flex items-center mb-3">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <span className="ml-2 text-gray-700">{profile.email}</span>
          </div>
          
          {profile.phone && (
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              <span className="ml-2 text-gray-700">{profile.phone}</span>
            </div>
          )}
          
          {profile.address && (
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span className="ml-2 text-gray-700">{profile.address}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;