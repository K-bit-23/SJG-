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
        <div className="products-layout">
          <aside className="sidebar">
            <div className="filter-widget">
              <h3 className="widget-title">Categories</h3>
              <select value={category} onChange={handleCategoryChange}>
                <option value="all">All</option>
                <option value="notebooks">Notebooks</option>
                <option value="pens">Pens</option>
                <option value="art-supplies">Art Supplies</option>
              </select>
            </div>
            <div className="filter-widget">
              <h3 className="widget-title">Sort By</h3>
              <select value={sortBy} onChange={handleSortByChange}>
                <option value="default">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </aside>
          <main className="main-content">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <i className="fas fa-search"></i>
            </div>
            <div className="product-grid">
              {sortedProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                    <div className="product-overlay">
                      <button className="btn btn-primary" onClick={() => addToCart(product)}>Add to Cart</button>
                    </div>
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
