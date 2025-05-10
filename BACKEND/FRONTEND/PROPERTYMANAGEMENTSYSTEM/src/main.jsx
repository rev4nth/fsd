import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import axios from 'axios';
import { toast } from 'react-toastify';

// Set base URL for API requests
axios.defaults.baseURL = 'http://localhost:2509'; // Adjust to your Spring Boot server port

// Add request interceptor to include JWT token in headers
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Handle 401 (Unauthorized) and 403 (Forbidden) errors
      if (error.response.status === 401 || error.response.status === 403) {
        // Only show the message if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          toast.error('Your session has expired. Please login again.');
          // Clear local storage
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('role');
          localStorage.removeItem('fullName');
          // Redirect to login page
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);