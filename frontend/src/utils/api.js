import axios from 'axios';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000/api/'
  : 'https://sjg-backend.onrender.com/api/';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Handle Authentication Errors
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // 2. Global Alert Dispatch
    let errorMessage = "Backend Connection Error";
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      errorMessage = error.response.data?.message || error.response.data?.detail || `Server Error (${error.response.status})`;
    } else if (error.request) {
      // Request was made but no response was received (e.g., ECONNREFUSED)
      errorMessage = "Cannot reach server. Please check if the backend is running.";
    } else {
      errorMessage = error.message;
    }

    // Dispatch custom event for NotificationProvider
    window.dispatchEvent(new CustomEvent('backend-error', { 
      detail: { message: errorMessage, type: 'error' } 
    }));

    return Promise.reject(error);
  }
);

export default api;