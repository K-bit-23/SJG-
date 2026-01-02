import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartDropdown from './CartDropdown';
import './Navbar.css';

const Navbar = ({ logo }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { getCartItemsCount } = useCart();
  const { user, isAuthenticated, openAuthModal, logout, login } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const cartItemsCount = getCartItemsCount();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Left: Logo */}
          <Link to="/" className="navbar-logo">
            <img src={logo} alt="SJG Logo" className="logo-svg" />
            <span className="logo-text">SJG<span className="logo-dot">.</span></span>
          </Link>

          {/* Center: Desktop Menu */}
          <div className="navbar-center">
            {user?.role === 'admin' ? (
              <span className="nav-link" style={{ cursor: 'default', color: '#333' }}>
                <i className="fas fa-shield-alt"></i>
                <span className="link-text">Admin Panel</span>
              </span>
            ) : (
              <>
                <Link to="/" className={`nav-link ${isActive('/')}`}>
                  <i className="fas fa-home"></i>
                  <span className="link-text">Home</span>
                </Link>
                <Link to="/products" className={`nav-link ${isActive('/products')}`}>
                  <i className="fas fa-box-open"></i>
                  <span className="link-text">Collection</span>
                </Link>
              </>
            )}
          </div>

          {/* Right: Actions */}
          <div className="navbar-actions">
            {user?.role !== 'admin' && (
              <>
                {/* Search Trigger */}
                <button className="icon-btn search-btn" aria-label="Search">
                  <i className="fas fa-search"></i>
                </button>

                {/* Cart */}
                <button
                  className={`icon-btn cart-btn ${isCartOpen ? 'active' : ''}`}
                  onClick={toggleCart}
                  aria-label="Cart"
                >
                  <i className="fas fa-shopping-bag"></i>
                  {cartItemsCount > 0 && (
                    <span className="cart-badge">{cartItemsCount}</span>
                  )}
                </button>
              </>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="user-menu-container">
                <button
                  className="user-profile-btn"
                  onClick={toggleUserMenu}
                  aria-label="User Profile"
                >
                  <img src={user.avatar} alt={user.name} />
                </button>

                {isUserMenuOpen && (
                  <div className="premium-dropdown">
                    <div className="dropdown-header">
                      <div className="user-info">
                        <h4>{user.name}</h4>
                        <p>{user.email}</p>
                        <span className={`role-badge ${user.role}`}>{user.role}</span>
                      </div>
                    </div>
                    <div className="dropdown-links">
                      {user.role === 'admin' ? (
                        <>
                          <Link to="/admin" className="dropdown-link admin-link">
                            <i className="fas fa-chart-line"></i> Dashboard
                          </Link>
                          <Link to="/admin/products" className="dropdown-link admin-link">
                            <i className="fas fa-box"></i> Products
                          </Link>
                          <Link to="/admin/orders" className="dropdown-link admin-link">
                            <i className="fas fa-shopping-cart"></i> Orders
                          </Link>
                          <Link to="/admin/customers" className="dropdown-link admin-link">
                            <i className="fas fa-users"></i> Customers
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link to="/profile" className="dropdown-link">
                            <i className="fas fa-user-circle"></i> Profile
                          </Link>
                          <Link to="/my-orders" className="dropdown-link">
                            <i className="fas fa-shopping-bag"></i> My Orders
                          </Link>
                        </>
                      )}
                      <div className="dropdown-divider"></div>
                      <button onClick={handleLogout} className="dropdown-link logout">
                        <i className="fas fa-sign-out-alt"></i> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button className="auth-btn" onClick={openAuthModal}>
                Sign In
              </button>
            )}

            {/* Mobile Toggle */}
            <button
              className={`mobile-toggle ${isMobileMenuOpen ? 'open' : ''}`}
              onClick={toggleMobileMenu}
              aria-label="Menu"
            >
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <div className="mobile-links">
            {user?.role !== 'admin' && (
              <>
                <Link to="/" className={`mobile-link ${isActive('/')}`}>Home</Link>
                <Link to="/products" className={`mobile-link ${isActive('/products')}`}>Collection</Link>
              </>
            )}
          </div>
          {isAuthenticated && (
            <div className="mobile-user-actions">
              {user.role !== 'admin' && (
                <Link to="/my-orders" className="mobile-action-btn">My Orders</Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" className="mobile-action-btn admin">Admin Panel</Link>
              )}
              <button onClick={handleLogout} className="mobile-action-btn logout">Logout</button>
            </div>
          )}
        </div>
      </div>

      {isCartOpen && <CartDropdown onClose={closeCart} />}
    </>
  );
};

export default Navbar;
