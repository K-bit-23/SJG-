import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext'; // Import Context
// import productsData, { categories } from '../data/productsData'; // Removed static
import './Products.css';

const Products = () => {
  const { products: contextProducts } = useProducts(); // Use Context
  const productsData = contextProducts; // Alias for compatibility

  // Dynamic Categories
  const categories = ['All', ...new Set(productsData.map(p => p.category))];

  const location = useLocation();
  const navigate = useNavigate();

  // Parse Query Params
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category'); // e.g. "notebooks"

  // Helper to map URL param to readable Category Name (simple mapping)
  const mapParamToCategory = (param) => {
    if (!param) return 'All';
    if (param === 'notebooks') return 'Notebooks'; // Match exact Category string in DB
    if (param === 'pens') return 'Pens';
    if (param === 'art') return 'Art Supplies';
    if (param === 'office') return 'Office'; // Adjust based on actual data
    return 'All';
  };

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minRating, setMinRating] = useState(0);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { addToCart } = useCart();

  // Reset pagination when filters change
  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, priceRange, selectedBrands, minRating]);

  // Sync URL to State on Load/Change
  useEffect(() => {
    const catParam = queryParams.get('category');
    if (catParam) {
      // This assumes your product categories in DB match mapped names
      // Ideally, you'd have a robust map or slugs
      // For now, I'll attempt a direct match or simple Title Case
      const matchedCat = categories.find(c => c.toLowerCase().includes(catParam.toLowerCase()));
      if (matchedCat) {
        setSelectedCategory(matchedCat);
      }
    }
  }, [location.search, categories]);


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
    <div className={`products-page-container full-width`}>
      <main className="products-main full-width-grid">
        {/* Header Info */}
        <div className="products-header-info">
          <h2>Stationery & Office Supplies</h2>
          {/* 
            You might want to restore simple top-bar filters (e.g. Sort by Price/Category) 
            if sidebar is gone, but the request was specifically to 'Remove Side Filter'.
          */}
          <span>(Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} items)</span>
        </div>

        <div className="product-grid-premium">
          {currentItems.length > 0 ? (
            currentItems.map(product => (
              <div
                key={product.id}
                className="premium-product-card"
                title={product.name}
                onClick={() => navigate(`/product/${product.id}`)}
                style={{ cursor: 'pointer' }}
              >

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
    </div >
  );
};

export default Products;
