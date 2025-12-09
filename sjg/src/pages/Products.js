import React, { useState, useEffect } from 'react';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In a real application, you would fetch this data from an API
    const dummyProducts = [
      { id: 1, name: 'Classic Notebook', price: 5.99, image: 'https://via.placeholder.com/250x250' },
      { id: 2, name: 'Gel Pens (Set of 12)', price: 8.50, image: 'https://via.placeholder.com/250x250' },
      { id: 3, name: 'Sticky Notes', price: 3.00, image: 'https://via.placeholder.com/250x250' },
      { id: 4, name: 'Highlighters (Assorted)', price: 6.25, image: 'https://via.placeholder.com/250x250' },
      { id: 5, name: 'A4 Printing Paper', price: 12.00, image: 'https://via.placeholder.com/250x250' },
      { id: 6, name: 'Stapler & Staples', price: 7.50, image: 'https://via.placeholder.com/250x250' },
      { id: 7, name: 'Envelopes (Pack of 50)', price: 4.75, image: 'https://via.placeholder.com/250x250' },
      { id: 8, name: 'Scissors', price: 3.50, image: 'https://via.placeholder.com/250x250' },
    ];
    setProducts(dummyProducts);
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
              <p>${product.price.toFixed(2)}</p>
              <button className="btn btn-primary">Add to Cart</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;