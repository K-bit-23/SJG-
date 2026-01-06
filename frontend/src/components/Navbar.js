import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = ({ logo }) => {
  const { user, logout, isAuthenticated, openAuthModal } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search:', searchTerm);
    navigate('/products');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <nav className="navbar">
      {/* 1. Logo Section */}
      <div className="navbar-section-left">
        <Link to="/" className="navbar-brand">
          {logo && <img src={logo} alt="SJG Logo" className="navbar-logo-img" style={{ height: '50px', marginRight: '10px' }} />}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="logo-text">SJG Stationery</span>
            <span className="logo-sub">Quality & Service</span>
          </div>
        </Link>

        {/* Home & Shop Now (Moved to Left) */}
        <div className="nav-links-left desktop-only">
          <Link to="/" className="nav-link">
            <i className="fas fa-home"></i>
            <span>Home</span>
          </Link>

        </div>
      </div>

      {/* 2. Search Bar (Center) */}
      <div className="navbar-search">
        <form onSubmit={handleSearch} className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search for items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-btn-icon">
            <i className="fas fa-search"></i>
          </button>
        </form>
        <Link to="/products" className="shop-now-btn">
          <i className="fas fa-shopping-bag"></i> Shop Now
        </Link>
      </div>

      {/* 3. Right Actions */}
      <div className="navbar-section-right desktop-only">

        {/* Cart */}
        <Link to="/cart" className="nav-link" style={{ position: 'relative' }}>
          <i className="fas fa-shopping-cart"></i>
          <span>Cart</span>
          {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
        </Link>

        {/* Track Order */}
        <Link to="/track-order" className="nav-link track-link">
          <i className="fas fa-map-marker-alt"></i>
          <span>Track Order</span>
        </Link>

        {/* Login / Profile (Moved to Right Most) */}
        {isAuthenticated ? (
          <div className="user-menu-container">
            <Link to="/my-orders" className="nav-link">
              <i className="fas fa-user-circle" style={{ fontSize: '20px' }}></i>
              <span>{user?.name}</span>
            </Link>
            <div className="dropdown-menu">
              {user?.role === 'admin' && (
                <Link to="/admin" className="dropdown-item">
                  <i className="fas fa-shield-alt"></i> Admin Panel
                </Link>
              )}
              <Link to="/my-orders" className="dropdown-item">
                <i className="fas fa-box"></i> My Orders
              </Link>
              <div onClick={handleLogout} className="dropdown-item" style={{ cursor: 'pointer' }}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </div>
            </div>
          </div>
        ) : (
          <div className="nav-link" onClick={() => openAuthModal('login')} style={{ cursor: 'pointer' }}>
            <div className="icon-stack" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <i className="fas fa-user"></i>
              <span>Login</span>
            </div>
          </div>
        )}

      </div>

      {/* Mobile Toggle */}
      <button
        className="mobile-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <span className="logo-text">SJG Stationery</span>
            </div>

            <div className="mobile-nav-links">
              <Link to="/" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fas fa-home"></i> Home
              </Link>
              <Link to="/products" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fas fa-shopping-bag"></i> Shop Now
              </Link>
              <Link to="/cart" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fas fa-shopping-cart"></i> Cart
                {cartItemsCount > 0 && <span className="mobile-badge">{cartItemsCount}</span>}
              </Link>
              <Link to="/track-order" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fas fa-map-marker-alt"></i> Track Order
              </Link>

              <div className="mobile-menu-divider"></div>

              {isAuthenticated ? (
                <>
                  <div className="mobile-user-info">
                    <i className="fas fa-user-circle"></i>
                    <span>{user?.name}</span>
                  </div>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                      <i className="fas fa-shield-alt"></i> Admin Panel
                    </Link>
                  )}
                  <Link to="/my-orders" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                    <i className="fas fa-box"></i> My Orders
                  </Link>
                  <div onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="mobile-nav-link logout-link">
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </div>
                </>
              ) : (
                <div className="mobile-nav-link login-link" onClick={() => { openAuthModal('login'); setIsMobileMenuOpen(false); }}>
                  <i className="fas fa-user"></i> Login
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
