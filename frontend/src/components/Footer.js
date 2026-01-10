import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-modern">
      <div className="footer-container">
        <div className="footer-top">

          {/* Column 1: About */}
          <div className="footer-col about-col">
            <h3 className="footer-logo">
              <img src="/sjg-logo.jpg" alt="Logo" style={{ height: '40px', verticalAlign: 'middle', marginRight: '10px', borderRadius: '50%' }} />
              SJG Stationery
            </h3>
            <p className="footer-desc">
              Your trusted partner for all stationery, printing, and business needs.
              Quality products and professional services under one roof.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-link"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
              <a href="#" className="social-link"><i className="fab fa-whatsapp"></i></a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col links-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Shop Products</Link></li>
              <li><Link to="/cart">My Cart</Link></li>
              <li><Link to="/track-order">Track Order</Link></li>
              <li><Link to="/profile">My Account</Link></li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="footer-col links-col">
            <h4 className="footer-heading">Our Services</h4>
            <ul className="footer-links">
              <li><a href="#">Printing Services</a></li>
              <li><a href="#">Binding & Lamination</a></li>
              <li><a href="#">ID Card Creation</a></li>
              <li><a href="#">Custom Notebooks</a></li>
              <li><a href="#">Graphic Design</a></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="footer-col contact-col">
            <h4 className="footer-heading">Contact Us</h4>
            <ul className="contact-info">
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <span>Sakthi Nagar, Thindal,<br />Erode - 638012</span>
              </li>
              <li>
                <i className="fas fa-phone-alt"></i>
                <span>+91 93600 24821</span>
              </li>
              <li>
                <i className="fas fa-envelope"></i>
                <span>sjgvxerox@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          <div className="copyright">
            &copy; {new Date().getFullYear()} SJG Stationery. All Rights Reserved.
          </div>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
