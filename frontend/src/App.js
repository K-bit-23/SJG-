import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ChatBot from './components/ChatBot';
import FloatingShortcut from './components/FloatingShortcut';
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
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';

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
    <div className="flex flex-col min-h-screen bg-[#f1f3f6]">
      {!isAdminPage && <Navbar />}
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

function App() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      api.get(`/settings/${encodeURIComponent(user.emailAddresses[0].emailAddress)}/`)
        .then(res => {
          if (res.data.dark_mode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        })
        .catch(err => console.log("No settings found yet"));
    }
  }, [user, isLoaded]);

  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <CartProvider>
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
          </CartProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
