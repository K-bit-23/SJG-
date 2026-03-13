import React from 'react';
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
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import PaymentSuccess from './pages/PaymentSuccess';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import PageLoader from './components/PageLoader';

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
      <main className={isAdminPage ? '' : 'flex-grow'}>
        {children}
      </main>
      {isHomePage && <Footer />}
    </div>
  );
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
    <Router>
      <AuthProvider>
        <CartProvider>
          <Layout>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/products" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/profile" element={<Profile />} />
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
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
