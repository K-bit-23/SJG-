import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="container">
        <h1 className="page-title">About Us</h1>
        <div className="about-content">
          <div className="about-image">
            <img src="https://picsum.photos/id/1019/800/600" alt="About Us" />
          </div>
          <div className="about-text">
            <h2>Your Trusted Partner for Stationery and Printing Needs</h2>
            <p>SJG Stationery is a leading provider of high-quality stationery, office supplies, and printing services. We are dedicated to providing our customers with the best products and services at competitive prices.</p>
            <p>Our mission is to be a one-stop solution for all your stationery and printing needs, offering a wide range of products and services to meet the demands of students, professionals, and businesses alike.</p>
            <p>We pride ourselves on our commitment to customer satisfaction and strive to provide a seamless and enjoyable shopping experience. Our knowledgeable and friendly staff are always ready to assist you with any questions or requests you may have.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
