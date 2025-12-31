import React, { useState } from 'react';
import './Products.css';

const Products = ({ products, addToCart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleSortByChange = (event) => {
    setSortBy(event.target.value);
  };

  const filteredProducts = products
    .filter(product => {
      return product.name.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .filter(product => {
      return category === 'all' || product.category === category;
    });

  const sortedProducts = filteredProducts.sort((a, b) => {
    if (sortBy === 'price-asc') {
      return a.price - b.price;
    } else if (sortBy === 'price-desc') {
      return b.price - a.price;
    } else {
      return 0;
    }
  });

  return (
    <div className="products-page">
      <div className="container">
        <h1 className="page-title">Our Products</h1>

        <div className="filters-bar">
          <div className="filter-item">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="filter-item">
            <select value={category} onChange={handleCategoryChange}>
              <option value="all">All Categories</option>
              <option value="notebooks">Notebooks</option>
              <option value="pens">Pens</option>
              <option value="art-supplies">Art Supplies</option>
            </select>
          </div>
          <div className="filter-item">
            <select value={sortBy} onChange={handleSortByChange}>
              <option value="default">Sort By</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="product-grid">
          {sortedProducts.map(product => (
            <div key={product.id} className="product-card">
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p>${product.price.toFixed(2)}</p>
              <button className="btn btn-primary" onClick={() => addToCart(product)}>Add to Cart</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;
