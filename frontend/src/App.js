import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ChatBot from './components/ChatBot';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import Contact from './pages/Contact';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import Settings from './pages/Settings';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import PaymentSuccess from './pages/PaymentSuccess';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import PageLoader from './components/PageLoader';
import { NotificationProvider } from './context/NotificationContext';
import NotificationBar from './components/NotificationBar';
import GlobalToaster from './components/GlobalToaster';

// Layout wrapper to conditionally show Navbar/Footer
const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const isHomePage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] transition-colors duration-300">
      {!isAdminPage && <Navbar />}
      {!isAdminPage && <WhatsAppButton />}
      {!isAdminPage && <ChatBot />}
      <main className={isAdminPage ? '' : 'flex-grow'}>
        {children}
      </main>
      {isHomePage && <Footer />}
    </div>
  );
};

const SettingsManager = ({ children }) => {
  const { user } = useAuth();
  
  React.useEffect(() => {
    // 1. Fetch Global App Settings
    const fetchGlobalSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings/');
        localStorage.setItem('appSettings', JSON.stringify(data));
      } catch (err) {
        console.warn("Using default settings. API unreachable.");
      }
    };
    fetchGlobalSettings();

    // Apply cached theme immediately
    const cachedSettings = localStorage.getItem('userSettings');
    if (cachedSettings) {
      const { dark_mode } = JSON.parse(cachedSettings);
      if (dark_mode) document.documentElement.classList.add('dark');
    }
  }, []);

  React.useEffect(() => {
    if (!user) {
      document.documentElement.classList.remove('dark');
      return;
    }

    // 2. Fetch User Specific Settings
    const fetchUserSettings = async () => {
      try {
        const { data } = await axios.get(`/api/user-settings/${encodeURIComponent(user.email)}/`);
        
        // Apply Dark Mode
        if (data.dark_mode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        // Apply Language (could be more complex, but let's store it)
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
  const [initialLoad, setInitialLoad] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 1500); // 1.5s simulated loader
    return () => clearTimeout(timer);
  }, []);

  if (initialLoad) return <PageLoader />;

  return (
    <NotificationProvider>
      <Router>
        <AuthProvider>
          <SettingsManager>
            <CartProvider>
              <NotificationBar />
              <Layout>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/profile" element={<Account />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/wishlist" element={<Wishlist />} />

                  {/* Admin routes — each tab gets its own URL */}
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/admin/dashboard" element={<AdminPanel />} />
                  <Route path="/admin/business" element={<AdminPanel />} />
                  <Route path="/admin/billing" element={<AdminPanel />} />
                  <Route path="/admin/inventory" element={<AdminPanel />} />
                  <Route path="/admin/orders" element={<AdminPanel />} />
                  <Route path="/admin/users" element={<AdminPanel />} />
                  <Route path="/admin/content" element={<AdminPanel />} />
                  <Route path="/admin/settings" element={<AdminPanel />} />
                </Routes>
              </Layout>
              <GlobalToaster />
            </CartProvider>
          </SettingsManager>
        </AuthProvider>
      </Router>
    </NotificationProvider>
  );
}

export default App;
