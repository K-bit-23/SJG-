import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="container">
        <h2 className="page-title">About SJG Stationary & Xerox</h2>

        <div className="about-section">
          <h3>Our Story</h3>
          <p>Founded in 2013, SJG Stationary & Xerox started as a small family-run shop with a simple mission: to provide the local community with high-quality stationary and reliable printing services at affordable prices. Over the years, we've grown our product selection and expanded our services, but our commitment to our customers remains the same. We are proud to be a part of the Erode community and look forward to serving you for many years to come.</p>
        </div>

        <div className="about-section">
          <h3>Our Mission</h3>
          <p>Our mission is to be your trusted one-stop shop for all your stationary and printing needs. We strive to offer a wide variety of products, exceptional customer service, and a welcoming atmosphere. We are constantly looking for new ways to improve and innovate, ensuring that we always meet the evolving needs of our customers.</p>
        </div>

        <div className="about-section team-section">
          <h3>Meet the Team</h3>
          <div className="team-grid">
            <div className="team-member">
              <img src="https://via.placeholder.com/150x150" alt="Team Member 1" />
              <h4>Mr. S.J. Ganesan</h4>
              <p>Founder & CEO</p>
            </div>
            <div className="team-member">
              <img src="https://via.placeholder.com/150x150" alt="Team Member 2" />
              <h4>Mrs. G. Malliga</h4>
              <p>Managing Partner</p>
            </div>
            <div className="team-member">
              <img src="https://via.placeholder.com/150x150" alt="Team Member 3" />
              <h4>Mr. G. Saravanan</h4>
              <p>Store Manager</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;