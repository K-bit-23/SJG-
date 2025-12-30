import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>SJG Stationary & Xerox</h4>
          <p>Sakthi Nagar, 5th Street, Sengodam Pallam, Thindal, Erode – 638012</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/products">Products</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faFacebookF} /></a>
            <a href="#" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faInstagram} /></a>
            <a href="#" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faTwitter} /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2023 SJG Stationary & Xerox. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;