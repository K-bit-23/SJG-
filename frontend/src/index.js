import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ErrorBoundary from './components/ErrorBoundary';

import { ClerkProvider } from '@clerk/clerk-react';

const getEnv = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) return import.meta.env[key];
  if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
  return null;
};

const CLERK_PUBLISHABLE_KEY = getEnv('VITE_CLERK_PUBLISHABLE_KEY') || 
                              getEnv('REACT_APP_CLERK_PUBLISHABLE_KEY') || 
                              'pk_test_cHJlc2VudC1haXJlZGFsZS0zMi5jbGVyay5hY2NvdW50cy5kZXYk';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ClerkProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
