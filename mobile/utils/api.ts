import axios from 'axios';

// Replace with your local Django backend IP or deployed backend URL
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://sjg-backend.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
