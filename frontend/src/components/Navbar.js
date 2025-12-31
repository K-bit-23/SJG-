import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ cartCount }) => {
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
          <li className="nav-item dropdown">
            <Link to="/products" className="nav-links">Products</Link>
            <div className="dropdown-content">
              {/* Product cards will be rendered here */}
            </div>
          </li>
          <li className="nav-item">
            <Link to="/services" className="nav-links">Services</Link>
          </li>
          <li className="nav-item">
            <Link to="/orders" className="nav-links">Your Orders</Link>
          </li>
          <li className="nav-item">
            <Link to="/contact" className="nav-links">Contact</Link>
          </li>
        </ul>
        <ul className="nav-menu-right">
          <li className="nav-item">
            <Link to="/cart" className="nav-links cart-icon">
              <i className="fas fa-shopping-cart"></i>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>
          </li>
          <li className="nav-item dropdown">
            <span className="nav-links">Admin</span>
            <div className="dropdown-content">
              <Link to="/admin/users">Users</Link>
            </div>
          </li>
          <li className="nav-item">
            <Link to="/login" className="nav-links">Login</Link>
          </li>
          <li className="nav-item">
            <Link to="/register" className="nav-links">Register</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
