import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import productsData from '../data/productsData';
import './Home.css';

const Home = () => {
  const { addToCart } = useCart();

  // Get first 3 products for featured section
  const featuredProducts = productsData.slice(0, 3);

  const handleAddToCart = (product) => {
    addToCart(product);
    // Optional: Show toast notification
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to SJG Stationery</h1>
          <p className="hero-subtitle">Your One-Stop Shop for All Stationery Needs</p>
          <p className="hero-description">Quality products, excellent service, and unbeatable prices</p>
          <Link to="/products" className="btn btn-hero">
            <i className="fas fa-shopping-bag"></i>
            <span>Shop Now</span>
          </Link>
        </div>
      </section>

      {/* Shop Details Section */}
      <section className="shop-details">
        <div className="container">
          <h2 className="section-title">About Our Shop</h2>
          <div className="details-grid">
            <div className="detail-card">
              <div className="detail-icon">
                <i className="fas fa-store"></i>
              </div>
              <h3>Who We Are</h3>
              <p>SJG Stationery has been serving Erode for over 10 years, providing high-quality stationery products and printing services to students, professionals, and businesses.</p>
            </div>
            <div className="detail-card">
              <div className="detail-icon">
                <i className="fas fa-clock"></i>
              </div>
              <h3>Business Hours</h3>
              <p><strong>Monday - Saturday:</strong> 9:00 AM - 8:00 PM</p>
              <p><strong>Sunday:</strong> 10:00 AM - 6:00 PM</p>
            </div>
            <div className="detail-card">
              <div className="detail-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <h3>Location</h3>
              <p>Sakthi Nagar, Thindal</p>
              <p>Erode - 638012</p>
              <a href="https://maps.google.com/?q=Sakthi+Nagar+Thindal+Erode" target="_blank" rel="noopener noreferrer" className="map-link">
                <i className="fas fa-directions"></i> Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-print"></i>
              </div>
              <h3>Xerox & Printing</h3>
              <p>High-quality black & white and color printing services. Fast turnaround time guaranteed.</p>
              <ul className="service-features">
                <li><i className="fas fa-check"></i> Document Printing</li>
                <li><i className="fas fa-check"></i> Photo Printing</li>
                <li><i className="fas fa-check"></i> Large Format Printing</li>
              </ul>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-book"></i>
              </div>
              <h3>Book Binding</h3>
              <p>Professional binding services for reports, presentations, and documents.</p>
              <ul className="service-features">
                <li><i className="fas fa-check"></i> Spiral Binding</li>
                <li><i className="fas fa-check"></i> Hardcover Binding</li>
                <li><i className="fas fa-check"></i> Thesis Binding</li>
              </ul>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-id-card"></i>
              </div>
              <h3>Lamination</h3>
              <p>Protect your important documents with our lamination services.</p>
              <ul className="service-features">
                <li><i className="fas fa-check"></i> ID Card Lamination</li>
                <li><i className="fas fa-check"></i> Certificate Lamination</li>
                <li><i className="fas fa-check"></i> Photo Lamination</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-products">
        <div className="container">
          <h2 className="section-title">Featured Products</h2>
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  <div className="product-overlay">
                    <button
                      className="quick-add-btn"
                      onClick={() => handleAddToCart(product)}
                    >
                      <i className="fas fa-cart-plus"></i>
                    </button>
                  </div>
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-price">${product.price.toFixed(2)}</p>
                  <button
                    className="btn-add-cart"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="view-all">
            <Link to="/products" className="btn btn-secondary">
              View All Products
              <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us">
        <div className="container">
          <h2 className="section-title">Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">
                <i className="fas fa-thumbs-up"></i>
              </div>
              <h3>Quality Products</h3>
              <p>We source only the best stationery products from trusted brands</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <i className="fas fa-shipping-fast"></i>
              </div>
              <h3>Fast Service</h3>
              <p>Quick turnaround time for all printing and binding services</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <h3>Affordable Prices</h3>
              <p>Competitive pricing without compromising on quality</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <i className="fas fa-headset"></i>
              </div>
              <h3>Expert Support</h3>
              <p>Friendly staff ready to help with all your stationery needs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <h2 className="section-title">Get In Touch</h2>
          <div className="contact-grid">
            <div className="contact-card">
              <div className="contact-icon">
                <i className="fas fa-phone"></i>
              </div>
              <h3>Phone</h3>
              <a href="tel:+919360024821">+91 93600 24821</a>
            </div>
            <div className="contact-card">
              <div className="contact-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <h3>Email</h3>
              <a href="mailto:sjgvxerox@gmail.com">sjgvxerox@gmail.com</a>
            </div>
            <div className="contact-card">
              <div className="contact-icon">
                <i className="fab fa-whatsapp"></i>
              </div>
              <h3>WhatsApp</h3>
              <a href="https://wa.me/919360024821" target="_blank" rel="noopener noreferrer">Chat with us</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;