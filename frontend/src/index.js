import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ErrorBoundary from './components/ErrorBoundary';
import { ClerkProvider } from '@clerk/clerk-react';
import { NotificationProvider } from './context/NotificationContext';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const getEnv = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) return import.meta.env[key];
  if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
  return null;
};

const CLERK_PUBLISHABLE_KEY = getEnv('VITE_CLERK_PUBLISHABLE_KEY') || 
                              getEnv('REACT_APP_CLERK_PUBLISHABLE_KEY') || 
                              'pk_test_cHJlc2VudC1haXJlZGFsZS0zMi5jbGVyay5hY2NvdW50cy5kZXYk';

const STRIPE_PUBLISHABLE_KEY = getEnv('VITE_STRIPE_PUBLISHABLE_KEY') || 
                               getEnv('REACT_APP_STRIPE_PUBLISHABLE_KEY');

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key. Please set VITE_CLERK_PUBLISHABLE_KEY in your .env file");
}

if (!STRIPE_PUBLISHABLE_KEY) {
  console.warn("Stripe Publishable Key is missing. Payments will not work.");
}

const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <NotificationProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </NotificationProvider>
    </ClerkProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
