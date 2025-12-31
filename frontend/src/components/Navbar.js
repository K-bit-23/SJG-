import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo.svg';

const Navbar = ({ cartCount }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="SJG Stationary & Xerox" />
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-links"><i className="fas fa-home"></i>Home</Link>
          </li>
          <li className="nav-item dropdown">
            <Link to="/products" className="nav-links"><i className="fas fa-box-open"></i>Products</Link>
            <div className="dropdown-content">
              {/* Product cards will be rendered here */}
            </div>
          </li>
          <li className="nav-item">
            <Link to="/services" className="nav-links"><i className="fas fa-concierge-bell"></i>Services</Link>
          </li>
          <li className="nav-item">
            <Link to="/orders" className="nav-links"><i className="fas fa-receipt"></i>Your Orders</Link>
          </li>
          <li className="nav-item">
            <Link to="/contact" className="nav-links"><i className="fas fa-address-book"></i>Contact</Link>
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
            <span className="nav-links"><i className="fas fa-user-shield"></i>Admin</span>
            <div className="dropdown-content">
              <Link to="/admin/users">Users</Link>
            </div>
          </li>
          <li className="nav-item">
            <Link to="/login" className="nav-links"><i className="fas fa-sign-in-alt"></i>Login</Link>
          </li>
          <li className="nav-item">
            <Link to="/register" className="nav-links"><i className="fas fa-user-plus"></i>Register</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
