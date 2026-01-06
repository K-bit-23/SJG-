import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import productsData from '../data/productsData';
import './Home.css';

const Home = () => {
  const { addToCart } = useCart();

  // --- Banner Carousel Logic ---
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      id: 1,
      title: "Premium Notebooks",
      price: "From ₹45",
      subtitle: "Classmate, Paperkraft & more",
      img: "https://rukminim1.flixcart.com/image/416/416/ktszgy80/notebook/x/h/d/classmate-pulse-1-single-line-notebook-300-pages-pack-of-1-original-imag72gzg5s4h2gy.jpeg?q=70",
    },
    {
      id: 2,
      title: "Art Supplies",
      price: "Up to 60% Off",
      subtitle: "Paints, Brushes, Canvas",
      img: "https://rukminim1.flixcart.com/image/416/416/k7w8eq80/art-set/y/p/h/16657-camel-original-imafpy5f5zggz5y4.jpeg?q=70",
    },
    {
      id: 3,
      title: "Office Essentials",
      price: "Files from ₹99",
      subtitle: "Organizers, Staplers & more",
      img: "https://rukminim1.flixcart.com/image/416/416/xif0q/file-folder/w/m/y/a4-cobra-files-spring-type-office-files-file-folder-for-display-original-imagm6z9gyh9z5sz.jpeg?q=70",
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      // nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="home-page">

      {/* 1. HERO BANNER */}
      <section className="modern-hero-section">
        <button className="carousel-nav-btn prev-btn" onClick={prevSlide}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <button className="carousel-nav-btn next-btn" onClick={nextSlide}>
          <i className="fas fa-chevron-right"></i>
        </button>

        <div className="modern-banner-container">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`modern-banner-slide ${index === currentSlide ? 'active' : ''}`}
            >
              <div className="decor decor-1"></div>
              <div className="decor decor-2"></div>
              <div className="decor decor-3"></div>

              <div className="banner-content-inner">
                <div className="banner-image-box">
                  <img src={banner.img} alt={banner.title} />
                </div>
                <div className="banner-text-info">
                  <h2 className="banner-title">{banner.title}</h2>
                  <div className="banner-price">{banner.price}</div>
                  <div className="banner-subtitle">{banner.subtitle}</div>
                  <Link to="/products" className="banner-cta">Shop Now</Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="carousel-indicators">
          {banners.map((_, index) => (
            <span
              key={index}
              className={`indicator-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            ></span>
          ))}
        </div>
      </section>

      {/* 2. SERVICES SECTION */}
      <section className="modern-section services-section">
        <div className="section-container">
          <h2 className="modern-section-title">Our Premium Services</h2>
          <p className="modern-section-subtitle">Beyond just stationery, we offer professional business solutions.</p>

          <div className="services-grid-modern">
            <div className="service-card-modern">
              <div className="service-icon-box blue-icon">
                <i className="fas fa-print"></i>
              </div>
              <h3>High-Quality Printing</h3>
              <p>Color, B&W, and Large Format printing with crisp detail.</p>
            </div>
            <div className="service-card-modern">
              <div className="service-icon-box orange-icon">
                <i className="fas fa-book-open"></i>
              </div>
              <h3>Binding & Finishing</h3>
              <p>Spiral, Hardcover, and Thesis binding for professional results.</p>
            </div>
            <div className="service-card-modern">
              <div className="service-icon-box green-icon">
                <i className="fas fa-id-card"></i>
              </div>
              <h3>Lamination & ID Cards</h3>
              <p>Protect your documents and create durable ID cards.</p>
            </div>
            <div className="service-card-modern">
              <div className="service-icon-box purple-icon">
                <i className="fas fa-pencil-ruler"></i>
              </div>
              <h3>Custom Designing</h3>
              <p>Graphic design services for visiting cards and brochures.</p>
            </div>
          </div>
        </div>
      </section>

      {/* REMOVED: About Us Text Section */}

      {/* REMOVED: Featured Products & Portfolio Sections */}

      {/* 4. TRUST STRIP (Simplified) */}
      <div className="trust-strip-modern">
        <div className="ts-item">
          <i className="fas fa-truck"></i>
          <div>
            <h4>Fast Delivery</h4>
            <p>Across Erode City</p>
          </div>
        </div>
        <div className="ts-item">
          <i className="fas fa-shield-alt"></i>
          <div>
            <h4>Secure Payment</h4>
            <p>100% Safe Transactions</p>
          </div>
        </div>
        <div className="ts-item">
          <i className="fas fa-headset"></i>
          <div>
            <h4>Online Support</h4>
            <p>Dedicated Support Team</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;