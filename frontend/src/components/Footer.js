import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section about">
            <h3 className="footer-title">SJG STATIONERY</h3>
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
              <li><i className="fas fa-map-marker-alt"></i> SAKTHI NAGAR THINDAL-638012, ERODE</li>
              <li><i className="fas fa-phone"></i> 9360024821</li>
              <li><i className="fas fa-envelope"></i> sjgvxerox@gmail.com</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SJG STATIONERY. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
