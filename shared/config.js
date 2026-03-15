// Shared configuration constants
export const CONFIG = {
  // API Configuration
  API_BASE_URL: process.env.NODE_ENV === 'production'
    ? 'https://sjg-backend.onrender.com/api'
    : 'http://localhost:8000/api',

  // App Information
  APP_NAME: 'SJG - Stationery Junction Group',
  APP_VERSION: '1.0.0',

  // Firebase Configuration (add your actual config)
  FIREBASE_CONFIG: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
  },

  // Colors (consistent across apps)
  COLORS: {
    primary: '#3498db',
    secondary: '#2ecc71',
    accent: '#e74c3c',
    background: '#f5f5f5',
    white: '#ffffff',
    black: '#000000',
    gray: '#666666',
    lightGray: '#f8f9fa',
  },

  // Storage Keys
  STORAGE_KEYS: {
    USER_TOKEN: 'user_token',
    USER_DATA: 'user_data',
    CART_ITEMS: 'cart_items',
    THEME: 'theme',
  },

  // API Endpoints
  ENDPOINTS: {
    PRODUCTS: '/products/',
    CATEGORIES: '/categories/',
    CART: '/cart/',
    ORDERS: '/orders/',
    USERS: '/users/',
    AUTH: '/auth/',
  },

  // Screen Names (for navigation consistency)
  SCREENS: {
    HOME: 'Home',
    PRODUCTS: 'Products',
    PRODUCT_DETAIL: 'ProductDetail',
    CART: 'Cart',
    PROFILE: 'Profile',
    LOGIN: 'Login',
    REGISTER: 'Register',
    CHECKOUT: 'Checkout',
  },
};

export default CONFIG;