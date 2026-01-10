import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config';
import { useCart } from '../context/CartContext';
import './Home.css';

const Home = () => {
  const { addToCart } = useCart();
  const [banners, setBanners] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Banner Carousel Logic ---
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.HOME_CONTENT);
        const data = response.data;

        if (data.banners && data.banners.length > 0) setBanners(data.banners);
        else setBanners([
          { id: 1, title: "Premium Notebooks", price: "From ₹45", subtitle: "Classmate, Paperkraft & more", img: "https://rukminim1.flixcart.com/image/416/416/ktszgy80/notebook/x/h/d/classmate-pulse-1-single-line-notebook-300-pages-pack-of-1-original-imag72gzg5s4h2gy.jpeg?q=70" },
          { id: 2, title: "Art Supplies", price: "Up to 60% Off", subtitle: "Paints, Brushes, Canvas", img: "https://rukminim1.flixcart.com/image/416/416/k7w8eq80/art-set/y/p/h/16657-camel-original-imafpy5f5zggz5y4.jpeg?q=70" },
          { id: 3, title: "Office Essentials", price: "Files from ₹99", subtitle: "Organizers, Staplers & more", img: "https://rukminim1.flixcart.com/image/416/416/xif0q/file-folder/w/m/y/a4-cobra-files-spring-type-office-files-file-folder-for-display-original-imagm6z9gyh9z5sz.jpeg?q=70" }
        ]);

        if (data.services && data.services.length > 0) setServices(data.services);
        else setServices([
          { icon: "fas fa-print", title: "High-Quality Printing", description: "Color, B&W, and Large Format printing with crisp detail.", color_class: "blue-icon" },
          { icon: "fas fa-book-open", title: "Binding & Finishing", description: "Spiral, Hardcover, and Thesis binding for professional results.", color_class: "orange-icon" },
          { icon: "fas fa-id-card", title: "Lamination & ID Cards", description: "Protect your documents and create durable ID cards.", color_class: "green-icon" },
          { icon: "fas fa-pencil-ruler", title: "Custom Designing", description: "Graphic design services for visiting cards and brochures.", color_class: "purple-icon" }
        ]);

      } catch (error) {
        console.error("Error loading home content", error);
        // Fallback is handled by initial state or setBanners above if we used default params
      } finally {
        setLoading(false);
      }
    };

    fetchHomeContent();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (banners.length > 1) nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (loading && banners.length === 0) return <div className="home-loader">Loading...</div>;

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
              key={index}
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
            {services.map((service, index) => (
              <div key={index} className="service-card-modern">
                <div className={`service-icon-box ${service.color_class || 'blue-icon'}`}>
                  <i className={service.icon}></i>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
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