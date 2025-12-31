import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
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
      <div className="App">
        <Navbar cartCount={cart.length} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products products={products} addToCart={addToCart} />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} updateCart={updateCart} />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
