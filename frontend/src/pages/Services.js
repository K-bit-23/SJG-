import React from 'react';
import './Services.css';

const Services = () => {
  const services = [
    {
      icon: 'fas fa-print',
      title: 'Xerox & Printing',
      description: 'High-speed, high-quality black and white and color printing and copying services.',
    },
    {
      icon: 'fas fa-book-open',
      title: 'Book Binding',
      description: 'Professional binding for your reports, presentations, and projects.',
    },
    {
      icon: 'fas fa-id-card',
      title: 'Lamination',
      description: 'Durable lamination to protect your important documents.',
    },
    {
      icon: 'fas fa-camera',
      title: 'Passport Photos',
      description: 'Get professional passport, visa, and ID photos taken in-store.',
    },
  ];

  return (
    <div className="services-page">
      <div className="container">
        <h1 className="page-title">Our Services</h1>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">
                <i className={service.icon}></i>
              </div>
              <div className="service-content">
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
