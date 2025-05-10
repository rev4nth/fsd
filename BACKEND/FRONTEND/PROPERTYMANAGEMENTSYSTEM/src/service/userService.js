import axios from 'axios';

const API_URL = '/api/profile';

// Set up axios interceptor to add the auth token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const getUserProfile = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: 'Failed to fetch user profile.'
    };
  }
};

const updateUserProfile = async (profileData) => {
  try {
    const response = await axios.put(API_URL, profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: 'Failed to update user profile.'
    };
  }
};

const updateProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    
    const response = await axios.post(`${API_URL}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: 'Failed to upload profile image.'
    };
  }
};

const userService = {
  getUserProfile,
  updateUserProfile,
  updateProfileImage
};

export default userService;