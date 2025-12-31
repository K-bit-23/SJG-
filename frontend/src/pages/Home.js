import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Discover Your Perfect Stationery</h1>
          <p className="hero-subtitle">High-quality products for all your creative and professional needs.</p>
          <Link to="/products" className="btn btn-primary hero-btn">Shop All Products</Link>
        </div>
      </header>

      <section className="featured-categories-section">
        <div className="container">
          <h2 className="section-title">Featured Categories</h2>
          <div className="category-grid">
            <div className="category-card">
              <Link to="/products?category=notebooks">
                <img src="https://via.placeholder.com/300x300/6e8efb/fff?text=Notebooks" alt="Notebooks" />
                <h3>Notebooks</h3>
              </Link>
            </div>
            <div className="category-card">
              <Link to="/products?category=pens">
                <img src="https://via.placeholder.com/300x300/a777e3/fff?text=Pens" alt="Pens" />
                <h3>Pens</h3>
              </Link>
            </div>
            <div className="category-card">
              <Link to="/products?category=art-supplies">
                <img src="https://via.placeholder.com/300x300/f07b3f/fff?text=Art+Supplies" alt="Art Supplies" />
                <h3>Art Supplies</h3>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="new-arrivals-section">
        <div className="container">
          <h2 className="section-title">New Arrivals</h2>
          <div className="product-grid">
            {/* Add new arrival product items here */}
          </div>
          <div className="text-center">
            <Link to="/products" className="btn btn-secondary">View More</Link>
          </div>
        </div>
      </section>

      <section className="our-services-section">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="service-grid">
            <div className="service-card">
              <i className="fas fa-print"></i>
              <h3>Xerox & Printing</h3>
              <p>Fast and reliable printing services for all your documents.</p>
            </div>
            <div className="service-card">
              <i className="fas fa-book-open"></i>
              <h3>Book Binding</h3>
              <p>Professional binding for your reports, presentations, and projects.</p>
            </div>
            <div className="service-card">
              <i className="fas fa-id-card"></i>
              <h3>Lamination</h3>
              <p>Durable lamination to protect your important documents.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Join Our Newsletter</h2>
          <p>Get the latest updates on new products and special offers.</p>
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
