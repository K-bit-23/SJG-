import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section about">
            <h3 className="footer-title">SJG Stationery</h3>
            <p>
              Your one-stop shop for all your stationery needs in Erode. We offer a wide
              variety of products and services to help you stay organized and creative.
            </p>
            <div className="footer-social">
              <a href="https://wa.me/919360024821" target="_blank" rel="noopener noreferrer" className="social-icon whatsapp">
                <i className="fab fa-whatsapp"></i>
              </a>
              <a href="mailto:sjgvxerox@gmail.com" className="social-icon email">
                <i className="fas fa-envelope"></i>
              </a>
            </div>
          </div>
          <div className="footer-section links">
            <h3 className="footer-title">Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
            </ul>
          </div>
          <div className="footer-section contact">
            <h3 className="footer-title">Contact Us</h3>
            <ul>
              <li><i className="fas fa-map-marker-alt"></i> Sakthi Nagar, Thindal, Erode - 638012</li>
              <li>
                <i className="fas fa-phone"></i>
                <a href="tel:+919360024821">+91 93600 24821</a>
              </li>
              <li>
                <i className="fas fa-envelope"></i>
                <a href="mailto:sjgvxerox@gmail.com">sjgvxerox@gmail.com</a>
              </li>
              <li>
                <i className="fab fa-whatsapp"></i>
                <a href="https://wa.me/919360024821" target="_blank" rel="noopener noreferrer">WhatsApp Us</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 SJG Stationery, Erode. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
