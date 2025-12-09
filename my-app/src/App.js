
import React, { useState } from 'react';
import './App.css';
import Header from './Header';
import ProductList from './ProductList';
import Cart from './Cart';

const App = () => {
  const [products, setProducts] = useState([
    { id: 1, name: 'Product 1', price: 10, image: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Product 2', price: 20, image: 'https://via.placeholder.com/150' },
    { id: 3, name: 'Product 3', price: 30, image: 'https://via.placeholder.com/150' },
  ]);

  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
  };

  return (
    <div className="App">
      <Header />
      <ProductList products={products} addToCart={addToCart} />
      <Cart cartItems={cartItems} />
    </div>
  );
};

export default App;
