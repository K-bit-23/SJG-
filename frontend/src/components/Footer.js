import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section about">
            <h3 className="footer-title">SJG Stationary</h3>
            <p>
              Your one-stop shop for all your stationary needs. We offer a wide
              variety of products to help you stay organized and creative.
            </p>
          </div>
          <div className="footer-section links">
            <h3 className="footer-title">Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Shop</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/contact">Address</Link></li>
            </ul>
          </div>
          <div className="footer-section contact">
            <h3 className="footer-title">Contact Us</h3>
            <ul>
              <li><i className="fas fa-map-marker-alt"></i> 123 Main Street, Anytown, USA</li>
              <li><i className="fas fa-phone"></i> (123) 456-7890</li>
              <li><i className="fas fa-envelope"></i> info@sjgstationary.com</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 SJG Stationary. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
