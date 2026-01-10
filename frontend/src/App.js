import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { ProductProvider } from './context/ProductContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import FloatingContactIcons from './components/FloatingContactIcons';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import ChatBot from './components/ChatBot';
import CookieConsent from './components/CookieConsent';
import TrackOrder from './pages/TrackOrder';
import Cart from './pages/Cart';
import Login from './pages/Login'; // Added
import Register from './pages/Register'; // Added
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import InventoryManagement from './pages/admin/InventoryManagement';
import OrderManagement from './pages/admin/OrderManagement';
import UserManagement from './pages/admin/UserManagement';
import OfflineBilling from './pages/admin/OfflineBilling';
import HomePageEditor from './pages/admin/HomePageEditor';
import ChatBotSettings from './pages/admin/ChatBotSettings';
// import './App.css';
// import './animations.css';

const AppRoutes = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
          <p style={{ fontSize: '1.2rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Admin Routes - Explicitly defined first */}
      <Route path="/admin/*" element={
        isAuthenticated && user?.role === 'admin' ? <AdminRoutes /> : <Navigate to="/" />
      } />

      {/* User Routes - Fallback for everything else (Available to ALL) */}
      <Route path="/*" element={<UserRoutes />} />
    </Routes>
  );
};

const AdminRoutes = () => (
  <AdminLayout>
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/inventory" element={<InventoryManagement />} />
      <Route path="/orders" element={<OrderManagement />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/billing" element={<OfflineBilling />} />
      <Route path="/content/home" element={<HomePageEditor />} />
      <Route path="/chatbot" element={<ChatBotSettings />} />
    </Routes>
  </AdminLayout>
);

const UserRoutes = () => {
  const location = useLocation();
  const hideFooter = location.pathname === '/products';

  return (
    <>
      <Navbar logo="/sjg-logo.jpg" />
      <AuthModal />
      <FloatingContactIcons />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        </Routes>
      </main>
      <ChatBot />
      <CookieConsent />
      {!hideFooter && <Footer />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <OrderProvider>
          <CartProvider>
            <Router>
              <div className="App">
                <AppRoutes />
              </div>
            </Router>
          </CartProvider>
        </OrderProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
