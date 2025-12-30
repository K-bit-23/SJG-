import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhoneAlt, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would handle form submission here (e.g., send an email)
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you shortly.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="contact-container">
      <div className="container">
        <h2 className="page-title">Contact Us</h2>
        <div className="contact-content">
          <div className="contact-info">
            <h3>Get in Touch</h3>
            <p><FontAwesomeIcon icon={faMapMarkerAlt} /> Sakthi Nagar, 5th Street, Sengodam Pallam, Thindal, Erode – 638012</p>
            <p><FontAwesomeIcon icon={faPhoneAlt} /> +91 98765 43210</p>
            <p><FontAwesomeIcon icon={faEnvelope} /> info@sjgstationary.com</p>
            <div className="map-container">
              {/* Replace with your actual Google Maps embed code */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3911.83746927367!2d77.6917413147926!3d11.34003299194243!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba96d86895c2465%3A0x8b3c8a485f80562f!2sSengodampalayam%2C%20Erode%2C%20Tamil%20Nadu%20638012!5e0!3m2!1sen!2sin!4v1678886475045!5m2!1sen!2sin"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
          <div className="contact-form">
            <h3>Send us a Message</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows="6" value={formData.message} onChange={handleChange} required></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;