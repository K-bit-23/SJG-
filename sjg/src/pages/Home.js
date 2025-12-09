import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="hero-section">
        <div className="hero-content">
          <h1>Welcome to SJG Stationary & Xerox</h1>
          <p>Your One-Stop Shop for All Stationary and Printing Needs</p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary">Shop Now</Link>
            <Link to="/services" className="btn btn-secondary">Our Services</Link>
          </div>
        </div>
      </header>

      <section className="about-us-section">
        <div className="container">
          <h2>About Us</h2>
          <p>SJG Stationary & Xerox has been serving the Erode community for over 10 years, providing high-quality stationary products and reliable printing services. We are committed to customer satisfaction and offer a wide range of products to meet your needs.</p>
          <Link to="/about" className="btn btn-tertiary">Learn More</Link>
        </div>
      </section>

      <section className="featured-products-section">
        <div className="container">
          <h2>Featured Products</h2>
          <div className="product-grid">
            {/* Add featured product items here */}
            <div className="product-card">
              <img src="https://via.placeholder.com/250x250" alt="Product 1" />
              <h3>Product Name 1</h3>
              <p>$10.00</p>
              <button className="btn btn-primary">Add to Cart</button>
            </div>
            <div className="product-card">
              <img src="https://via.placeholder.com/250x250" alt="Product 2" />
              <h3>Product Name 2</h3>
              <p>$15.00</p>
              <button className="btn btn-primary">Add to Cart</button>
            </div>
            <div className="product-card">
              <img src="https://via.placeholder.com/250x250" alt="Product 3" />
              <h3>Product Name 3</h3>
              <p>$20.00</p>
              <button className="btn btn-primary">Add to Cart</button>
            </div>
          </div>
          <Link to="/products" className="btn btn-tertiary">View All Products</Link>
        </div>
      </section>

      <section className="our-services-section">
        <div className="container">
          <h2>Our Services</h2>
          <div className="service-grid">
            <div className="service-card">
              <i className="fas fa-print"></i>
              <h3>Xerox & Printing</h3>
              <p>High-quality black & white and color printing services.</p>
            </div>
            <div className="service-card">
              <i className="fas fa-book-open"></i>
              <h3>Book Binding</h3>
              <p>Spiral and comb binding for your documents and projects.</p>
            </div>
            <div className="service-card">
              <i className="fas fa-id-card"></i>
              <h3>Lamination</h3>
              <p>Protect your important documents with our lamination services.</p>
            </div>
          </div>
          <Link to="/services" className="btn btn-tertiary">Explore Our Services</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;