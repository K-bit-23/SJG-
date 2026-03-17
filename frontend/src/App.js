import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ChatBot from './components/ChatBot';
import FloatingShortcut from './components/FloatingShortcut';
import PageLoader from './components/PageLoader';
import Home from '../client/pages/Home';
import NotificationBar from './components/NotificationBar';

// Check if running in Electron
const isElectron = /electron/i.test(navigator.userAgent);
import AdminPanel from '../admin/pages/AdminPanel';
import Contact from '../client/pages/Contact';
import Products from '../client/pages/Products';
import Cart from '../client/pages/Cart';
import Checkout from '../client/pages/Checkout';
import api from './utils/api';
import Profile from './pages/Profile';
import Wishlist from '../client/pages/Wishlist';
import Orders from '../client/pages/Orders';
import PaymentSuccess from '../client/pages/PaymentSuccess';
import OrderTracking from '../client/pages/OrderTracking';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import Settings from '../client/pages/Settings';

import ScrollToTop from './components/ScrollToTop';

// Helper component for admin auto-redirect
const AdminRedirect = ({ children }) => {
  const { user, isLoaded } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && user && user.publicMetadata?.role === 'admin' && location.pathname === '/') {
      navigate('/admin');
    }
  }, [user, isLoaded, location.pathname, navigate]);

  return children;
};

// Layout wrapper to conditionally show Navbar/Footer
const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const isHomePage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] transition-colors duration-300">
      <NotificationBar />
      {!isAdminPage && <Navbar />}
      {!isAdminPage && <WhatsAppButton />}
      {!isAdminPage && <ChatBot />}
      {!isAdminPage && <FloatingShortcut />}
      {!isAdminPage && <ScrollToTop />}
      <main className={isAdminPage ? '' : 'flex-grow'}>
        {children}
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
};

const SettingsManager = ({ children }) => {
  const { user } = useAuth();
  
  useEffect(() => {
    // 1. Fetch Global App Settings
    const fetchGlobalSettings = async () => {
      try {
        const { data } = await api.get('/settings/');
        localStorage.setItem('appSettings', JSON.stringify(data));
      } catch (err) {
        console.warn("Using default settings. API unreachable.");
      }
    };
    fetchGlobalSettings();

    // Apply cached theme immediately
    const cachedSettings = localStorage.getItem('userSettings');
    if (cachedSettings) {
      try {
        const { dark_mode } = JSON.parse(cachedSettings);
        if (dark_mode) document.documentElement.classList.add('dark');
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) {
      document.documentElement.classList.remove('dark');
      return;
    }

    // 2. Fetch User Specific Settings
    const fetchUserSettings = async () => {
      try {
        const userEmail = user.emailAddresses ? user.emailAddresses[0].emailAddress : user.email;
        const { data } = await api.get(`/user-settings/${encodeURIComponent(userEmail)}/`);
        
        // Apply Dark Mode
        if (data.dark_mode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        // Apply Language
        localStorage.setItem('userSettings', JSON.stringify(data));
      } catch (err) {
        console.error("Failed to sync user settings:", err);
      }
    };
    fetchUserSettings();
  }, [user]);

  return children;
};

const DeepLinkHandler = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.onDeepLink) {
      window.electronAPI.onDeepLink((url) => {
        console.log("Deep link received:", url);
        // Protocol format: sjg-app://path?query
        const pathWithQuery = url.replace('sjg-app://', '');
        if (pathWithQuery) {
          // Navigate to the extracted path
          // Clean up the URL format if needed (sometimes it comes in as sjg-app:///path)
          const cleanPath = pathWithQuery.startsWith('/') ? pathWithQuery : '/' + pathWithQuery;
          navigate(cleanPath);
        }
      });
    }
  }, [navigate]);

  return children;
};

function App() {
  const { user, isLoaded } = useUser();
  const [pageLoading, setPageLoading] = React.useState(true);

  useEffect(() => {
    const hide = () => setTimeout(() => setPageLoading(false), 500);
    const safetyTimeout = setTimeout(hide, 1500);

    if (document.readyState === 'complete') {
      hide();
      clearTimeout(safetyTimeout);
    } else {
      const handleLoad = () => {
        hide();
        clearTimeout(safetyTimeout);
      };
      window.addEventListener('load', handleLoad);
      return () => {
        window.removeEventListener('load', handleLoad);
        clearTimeout(safetyTimeout);
      };
    }
  }, []);

  return (
    <Router>
      <PageLoader open={pageLoading} />
      <AuthProvider>
        <LanguageProvider>
          <NotificationProvider>
            <CartProvider>
              <WishlistProvider>
                <SettingsManager>
                  <AdminRedirect>
                    <DeepLinkHandler>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/admin/*" element={<AdminPanel />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/checkout" element={<Checkout />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/wishlist" element={<Wishlist />} />
                          <Route path="/orders" element={<Orders />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/payment-success" element={<PaymentSuccess />} />
                          <Route path="/track-order/:orderId" element={<OrderTracking />} />
                        </Routes>
                      </Layout>
                    </DeepLinkHandler>
                  </AdminRedirect>
                </SettingsManager>
              </WishlistProvider>
            </CartProvider>
          </NotificationProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
