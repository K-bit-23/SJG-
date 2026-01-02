import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { ProductProvider } from './context/ProductContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import FloatingContactIcons from './components/FloatingContactIcons';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Products from './pages/Products';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import AdminDashboard from './pages/admin/AdminDashboard';
import InventoryManagement from './pages/admin/InventoryManagement';
import OrderManagement from './pages/admin/OrderManagement';
import UserManagement from './pages/admin/UserManagement';
import './App.css';
import './animations.css';

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user?.role === 'admin') {
    return (
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/inventory" element={<InventoryManagement />} />
        <Route path="/admin/orders" element={<OrderManagement />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="*" element={<Navigate to="/admin" />} />
      </Routes>
    );
  } else {
    return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }
};

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <OrderProvider>
          <CartProvider>
            <Router>
              <div className="App">
                <Navbar logo="/logo.svg" />
                <AuthModal />
                <FloatingContactIcons />
                <main className="main-content">
                  <AppRoutes />
                </main>
                <Footer />
              </div>
            </Router>
          </CartProvider>
        </OrderProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
