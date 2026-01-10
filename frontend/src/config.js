// Backend API Configuration
// Update PRODUCTION_API_URL after deploying backend to Render

const PRODUCTION_API_URL = 'https://sjg-backend.onrender.com';  // Update this after Render deployment

const getBaseURL = () => {
    const hostname = window.location.hostname;

    // If we are on localhost, use localhost backend
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:8000';
    }

    // If on local network (192.168.x.x), use the same IP
    if (hostname.startsWith('192.168.')) {
        return `http://${hostname}:8000`;
    }

    // For production (Firebase hosting), use the production backend
    return PRODUCTION_API_URL;
};

export const API_BASE_URL = getBaseURL();
export const API_ENDPOINTS = {
    PRODUCTS: `${API_BASE_URL}/api/products/`,
    ORDERS: `${API_BASE_URL}/api/orders/`,
    STATS: `${API_BASE_URL}/api/dashboard/stats/`,
    CONTACT: `${API_BASE_URL}/api/contact/`,
    USERS: `${API_BASE_URL}/api/users/`,
    AUTH: `${API_BASE_URL}/api/`,
};
