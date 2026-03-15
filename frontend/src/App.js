import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ChatBot from './components/ChatBot';
import FloatingShortcut from './components/FloatingShortcut';
import NotificationBar from './components/NotificationBar';
import PageLoader from './components/PageLoader';
import Home from '../client/pages/Home';
import AdminPanel from '../admin/pages/AdminPanel';
import Contact from '../client/pages/Contact';
import Products from '../client/pages/Products';
import Cart from '../client/pages/Cart';
import Checkout from '../client/pages/Checkout';
import api from './utils/api';
import Profile from '../client/pages/Profile';
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
      {!isAdminPage && <Navbar />}
      {!isAdminPage && <NotificationBar />}
      {!isAdminPage && <WhatsAppButton />}
      {!isAdminPage && <ChatBot />}
      {!isAdminPage && <FloatingShortcut />}
      {!isAdminPage && <ScrollToTop />}
      <main className={isAdminPage ? '' : 'flex-grow'}>
        {children}
      </main>
      {isHomePage && <Footer />}
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

function App() {
  const { user, isLoaded } = useUser();
  const [pageLoading, setPageLoading] = React.useState(true);

  useEffect(() => {
    // Hide loader when page has fully loaded (including assets)
    const hide = () => setTimeout(() => setPageLoading(false), 500);
    if (document.readyState === 'complete') {
      hide();
    } else {
      window.addEventListener('load', hide);
      return () => window.removeEventListener('load', hide);
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <NotificationProvider>
            <CartProvider>
              <WishlistProvider>
              <SettingsManager>
                <PageLoader open={pageLoading} />
                <AdminRedirect>
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
