import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import './App.css';

function App() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products/')
      .then(response => response.json())
      .then(data => setProducts(data));
  }, []);

  const addToCart = (product) => {
    setCart([...cart, { ...product, quantity: 1 }]);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(product => product.id !== productId));
  };

  const updateCart = (productId, quantity) => {
    setCart(
      cart.map(product =>
        product.id === productId ? { ...product, quantity: quantity } : product
      )
    );
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar cartCount={cart.length} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products products={products} addToCart={addToCart} />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} updateCart={updateCart} />} />
            <Route path="/orders" element={<Orders />} />
            <Routae path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <a href="https://wa.me/1234567890" className="whatsapp-icon" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-whatsapp"></i>
        </a>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
