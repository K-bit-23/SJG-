import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Your One-Stop Stationery Shop</h1>
          <p>Find everything you need, from pens and paper to printing services.</p>
          <Link to="/products" className="btn btn-primary">Shop Now</Link>
        </div>
      </section>

      <section className="featured-products">
        <div className="container">
          <h2>Featured Products</h2>
          <div className="product-grid">
            {/* Placeholder for product cards */}
            <div className="product-card">
              <img src="https://picsum.photos/id/27/300/300" alt="Product 1" />
              <h3>Premium Notebooks</h3>
              <p>$12.99</p>
              <Link to="/products" className="btn btn-secondary">View Details</Link>
            </div>
            <div className="product-card">
              <img src="https://picsum.photos/id/1025/300/300" alt="Product 2" />
              <h3>Designer Pens</h3>
              <p>$8.99</p>
              <Link to="/products" className="btn btn-secondary">View Details</Link>
            </div>
            <div className="product-card">
              <img src="https://picsum.photos/id/107/300/300" alt="Product 3" />
              <h3>Art Supplies</h3>
              <p>$24.99</p>
              <Link to="/products" className="btn btn-secondary">View Details</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="services">
        <div className="container">
          <h2>Our Services</h2>
          <div className="service-grid">
            <div className="service-item">
              <i className="fas fa-print"></i>
              <h3>Xerox & Printing</h3>
              <p>High-quality printing and copying services for your documents.</p>
            </div>
            <div className="service-item">
              <i className="fas fa-book-open"></i>
              <h3>Book Binding</h3>
              <p>Professional binding for your reports and presentations.</p>
            </div>
            <div className="service-item">
              <i className="fas fa-id-card"></i>
              <h3>Lamination</h3>
              <p>Protect your important documents with our lamination services.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Stay in the Loop</h2>
          <p>Subscribe to our newsletter for the latest deals and new arrivals.</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button type="submit" className="btn btn-primary">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;