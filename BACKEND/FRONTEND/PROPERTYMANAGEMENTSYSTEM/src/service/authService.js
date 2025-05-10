import axios from 'axios';

const API_URL = '/api/auth';

const register = async (registerData) => {
  const formData = new FormData();
  
  formData.append('username', registerData.username);
  formData.append('password', registerData.password);
  formData.append('fullName', registerData.fullName);
  formData.append('email', registerData.email);
  formData.append('role', registerData.role);
  
  if (registerData.phone) {
    formData.append('phone', registerData.phone);
  }
  
  if (registerData.address) {
    formData.append('address', registerData.address);
  }
  
  if (registerData.profileImage) {
    formData.append('profileImage', registerData.profileImage);
  }

  try {
    const response = await axios.post(${API_URL}/register, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('fullName', response.data.fullName);
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: 'Registration failed. Please try again.'
    };
  }
};

const login = async (username, password) => {
  try {
    const response = await axios.post(${API_URL}/login, {
      username,
      password
    });
    
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('fullName', response.data.fullName);
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: 'Login failed. Please check your credentials.'
    };
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
  localStorage.removeItem('fullName');
};

const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

const getUserRole = () => {
  return localStorage.getItem('role');
};

const getToken = () => {
  return localStorage.getItem('token');
};

const authService = {
  register,
  login,
  logout,
  isAuthenticated,
  getUserRole,
  getToken
};

export default authService;