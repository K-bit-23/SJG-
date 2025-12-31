import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ cartCount }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            SJG Stationary
          </Link>
          <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
              </li>
              <li className="nav-item">
                <Link to="/products" className="nav-link" onClick={() => setIsMenuOpen(false)}>Products</Link>
              </li>
              <li className="nav-item">
                <Link to="/services" className="nav-link" onClick={() => setIsMenuOpen(false)}>Services</Link>
              </li>
              <li className="nav-item">
                <Link to="/contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>Contact</Link>
              </li>
            </ul>
          </nav>
          <div className="header-actions">
            <Link to="/cart" className="cart-link">
              <i className="fas fa-shopping-cart"></i>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>
            <Link to="/login" className="btn btn-primary">Login</Link>
            <button className="menu-toggle" onClick={toggleMenu}>
              <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;