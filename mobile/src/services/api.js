import axios from 'axios';
import { API_BASE_URL } from '../constants';

// Configure axios for mobile app
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for authentication
axios.interceptors.request.use(
  (config) => {
    // Add auth token if available
    // const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.log('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

export default axios;