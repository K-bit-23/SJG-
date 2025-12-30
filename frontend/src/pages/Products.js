import React, { useState, useEffect } from 'react';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/products/')
      .then(response => response.json())
      .then(data => setProducts(data));
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="products-container">
      <div className="container">
        <h2 className="page-title">Our Products</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for products..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="product-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p>${product.price}</p>
              <button className="btn btn-primary">Add to Cart</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;