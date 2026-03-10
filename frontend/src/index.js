import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';
import reportWebVitals from './reportWebVitals';
import ErrorBoundary from './components/ErrorBoundary';

// Configure Axios Base URL for connecting Firebase -> Render
// Configure Axios Base URL for connecting
const hostname = window.location.hostname;
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.');

axios.defaults.baseURL = isLocal
  ? `http://${hostname}:8000`
  : 'https://sjg-backend.onrender.com';

// Add interceptor to handle errors globally if needed
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

import { ClerkProvider } from '@clerk/clerk-react';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Use environment variable, fallback to actual key if not set to avoid needing a server restart
const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY || "pk_test_cHJlc2VudC1haXJlZGFsZS0zMi5jbGVyay5hY2NvdW50cy5kZXYk";
const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "pk_test_51So40YCPzKJNrNdNmmvUDOkSB2as457IIak8s4dWtCqmn9VORJwOkOKvIwobYlpi0V0nS1qTyexCqqZ3pNY37epa00FzPS4Qsk";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <Elements stripe={stripePromise}>
          <App />
        </Elements>
      </ClerkProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
