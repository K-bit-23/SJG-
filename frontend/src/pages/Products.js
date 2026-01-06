import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext'; // Import Context
// import productsData, { categories } from '../data/productsData'; // Removed static
import './Products.css';

const Products = () => {
  const { products: contextProducts } = useProducts(); // Use Context
  const productsData = contextProducts; // Alias for compatibility

  // Dynamic Categories
  const categories = ['All', ...new Set(productsData.map(p => p.category))];

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minRating, setMinRating] = useState(0);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { addToCart } = useCart();

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, priceRange, selectedBrands, minRating]);

  // Sidebar State
  const [expanded, setExpanded] = useState({
    categories: true,
    price: true,
    brand: true,
    ratings: true
  });

  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handlePriceMinChange = (e) => {
    const min = parseInt(e.target.value) || 0;
    setPriceRange([min, priceRange[1]]);
  };

  const handlePriceMaxChange = (e) => {
    const max = parseInt(e.target.value) || 10000;
    setPriceRange([priceRange[0], max]);
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setPriceRange([0, 10000]);
    setSelectedBrands([]);
    setMinRating(0);
    setCurrentPage(1);
  };

  const filteredProducts = productsData.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesBrand = selectedBrands.length === 0 ||
      (product.brand && selectedBrands.includes(product.brand)) ||
      selectedBrands.some(brand => product.name.includes(brand));
    // Check if rating exists, default to 0 if not (API might not have rating)
    const matchesRating = (product.rating || 0) >= minRating;
    return matchesCategory && matchesPrice && matchesBrand && matchesRating;
  });

  // Calculate Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div className="products-page-container">

      {/* --- Sidebar Filters --- */}
      <aside className="products-sidebar">
        <div className="sidebar-header">
          <h3>Filters</h3>
          <button className="clear-btn" onClick={clearFilters}>CLEAR ALL</button>
        </div>

        {/* Categories Section */}
        <div className="filter-section">
          <div className="filter-header" onClick={() => toggleSection('categories')}>
            <span>CATEGORIES</span>
            <i className={`fas fa-chevron-${expanded.categories ? 'up' : 'down'}`}></i>
          </div>
          {expanded.categories && (
            <div className="filter-body">
              <div
                className={`sidebar-item ${selectedCategory === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('All')}
              >
                <i className="fas fa-chevron-left"></i> All Categories
              </div>
              {categories.filter(c => c !== 'All').map(cat => (
                <div
                  key={cat}
                  className={`sidebar-item ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="filter-section">
          <div className="filter-header" onClick={() => toggleSection('price')}>
            <span>PRICE</span>
            <i className={`fas fa-chevron-${expanded.price ? 'up' : 'down'}`}></i>
          </div>
          {expanded.price && (
            <div className="filter-body">
              <div className="price-inputs sidebar-price">
                <select className="price-select" onChange={handlePriceMinChange} value={priceRange[0]}>
                  <option value="0">Min</option>
                  <option value="100">₹100</option>
                  <option value="500">₹500</option>
                </select>
                <span className="to-text">to</span>
                <select className="price-select" onChange={handlePriceMaxChange} value={priceRange[1]}>
                  <option value="1000">₹1000</option>
                  <option value="2000">₹2000</option>
                  <option value="10000">₹10000+</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Brand Section */}
        <div className="filter-section">
          <div className="filter-header" onClick={() => toggleSection('brand')}>
            <span>BRAND</span>
            <i className={`fas fa-chevron-${expanded.brand ? 'up' : 'down'}`}></i>
          </div>
          {expanded.brand && (
            <div className="filter-body">
              {['Classmate', 'Parker', 'Camlin', 'Paperkraft'].map(brand => (
                <label key={brand} className="sidebar-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                  />
                  <span className="checkmark"></span>
                  {brand}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Ratings Section */}
        <div className="filter-section">
          <div className="filter-header" onClick={() => toggleSection('ratings')}>
            <span>CUSTOMER RATINGS</span>
            <i className={`fas fa-chevron-${expanded.ratings ? 'up' : 'down'}`}></i>
          </div>
          {expanded.ratings && (
            <div className="filter-body">
              {[4, 3].map(rating => (
                <label key={rating} className="sidebar-checkbox-label">
                  <input
                    type="checkbox"
                    checked={minRating === rating}
                    onChange={() => setMinRating(minRating === rating ? 0 : rating)}
                  />
                  <span className="checkmark"></span>
                  {rating}★ & above
                </label>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="products-main">
        {/* Header Info */}
        <div className="products-header-info">
          <h2>Stationery & Office Supplies</h2>
          <span>(Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} items)</span>
        </div>

        <div className="product-grid-premium">
          {currentItems.length > 0 ? (
            currentItems.map(product => (
              <div key={product.id} className="premium-product-card" title={product.name}>

                <div className="card-image-section">
                  <img src={product.image} alt={product.name} />
                  {product.stock <= 0 && <span className="oos-badge">OUT OF STOCK</span>}
                  <div className="wishlist-icon">
                    <i className="fas fa-heart"></i>
                  </div>
                </div>

                <div className="card-content-section">
                  <h3 className="premium-card-title">{product.name}</h3>

                  <div className="card-rating-row">
                    <div className="rating-badge">
                      {product.rating} <i className="fas fa-star"></i>
                    </div>
                  </div>

                  <div className="premium-card-price">
                    ₹{product.price.toLocaleString('en-IN')}
                    {product.originalPrice && <span className="original-price">₹{product.originalPrice}</span>}
                  </div>

                  <button
                    className={`premium-add-btn ${product.stock <= 0 ? 'disabled' : ''}`}
                    onClick={(e) => product.stock > 0 && handleAddToCart(e, product)}
                    disabled={product.stock <= 0}
                  >
                    {product.stock <= 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-products-found">
              <img src="https://rukminim1.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png?q=90" alt="No Result" style={{ maxWidth: '200px', marginBottom: '20px' }} />
              <h3>Sorry, no results found!</h3>
              <p>Please check the spelling or try searching for something else.</p>
            </div>
          )}
        </div>

        {/* --- Pagination Controls --- */}
        {filteredProducts.length > itemsPerPage && (
          <div className="pagination">
            <button
              className="page-btn prev"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => paginate(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="page-btn next"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

export default Products;
