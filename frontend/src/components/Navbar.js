import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartDropdown from './CartDropdown';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { getCartItemsCount } = useCart();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <i className="fas fa-store"></i>
          <span>SJG Stationery</span>
        </Link>

        <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link
            to="/"
            className={`navbar-link ${isActive('/')}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <i className="fas fa-home"></i>
            <span>Home</span>
          </Link>
          <Link
            to="/products"
            className={`navbar-link ${isActive('/products')}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <i className="fas fa-box"></i>
            <span>Products</span>
          </Link>
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-menu-wrapper">
              <button
                className="user-button"
                onClick={toggleUserMenu}
                aria-label="User Menu"
              >
                <img src={user.avatar} alt={user.name} className="user-avatar" />
                <span className="user-name">{user.name}</span>
                <span className={`user-role ${user.role}`}>{user.role}</span>
                <i className={`fas fa-chevron-down ${isUserMenuOpen ? 'rotate' : ''}`}></i>
              </button>

              {isUserMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <img src={user.avatar} alt={user.name} />
                    <div>
                      <p className="dropdown-name">{user.name}</p>
                      <p className="dropdown-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="user-dropdown-divider"></div>
                  <button className="dropdown-item">
                    <i className="fas fa-user"></i>
                    <span>Profile</span>
                  </button>
                  <button className="dropdown-item">
                    <i className="fas fa-cog"></i>
                    <span>Settings</span>
                  </button>
                  {user.role === 'admin' && (
                    <button className="dropdown-item">
                      <i className="fas fa-shield-alt"></i>
                      <span>Admin Panel</span>
                    </button>
                  )}
                  <div className="user-dropdown-divider"></div>
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="login-button"
              onClick={openAuthModal}
              aria-label="Login"
            >
              <i className="fas fa-user"></i>
              <span>Login</span>
            </button>
          )}

          <button
            className="cart-button"
            onClick={toggleCart}
            aria-label="Shopping Cart"
          >
            <i className="fas fa-shopping-cart"></i>
            {cartItemsCount > 0 && (
              <span className="cart-badge">{cartItemsCount}</span>
            )}
          </button>

          <button
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle Menu"
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>

      {isCartOpen && <CartDropdown onClose={closeCart} />}
    </nav>
  );
};

export default Navbar;
