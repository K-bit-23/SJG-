// Detect the host of the current page to connect to the same backend IP
const getBaseURL = () => {
    const hostname = window.location.hostname;

    // If we are on localhost, use localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:8000';
    }

    // Otherwise, use the IP address of the machine running the app
    return `http://${hostname}:8000`;
};

export const API_BASE_URL = getBaseURL();
export const API_ENDPOINTS = {
    PRODUCTS: `${API_BASE_URL}/api/products/`,
    ORDERS: `${API_BASE_URL}/api/orders/`,
    STATS: `${API_BASE_URL}/api/dashboard/stats/`,
    AUTH: `${API_BASE_URL}/api/`,
};
