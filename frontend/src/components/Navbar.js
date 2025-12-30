import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          SJG Stationary & Xerox
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-links">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/products" className="nav-links">Products</Link>
          </li>
          <li className="nav-item">
            <Link to="/services" className="nav-links">Services</Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-links">About</Link>
          </li>
          <li className="nav-item">
            <Link to="/contact" className="nav-links">Contact</Link>
          </li>
          <li className="nav-item">
            <Link to="/cart" className="nav-links cart-icon">
              <i className="fas fa-shopping-cart"></i>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;