import React from 'react';
import './Services.css';

const Services = () => {
  const services = [
    {
      icon: 'fas fa-print',
      title: 'Xerox & Printing',
      description: 'We offer high-speed, high-quality black and white and color printing and copying services. We can handle everything from single pages to large-volume jobs.',
      details: [
        'A4, A3, and custom sizes',
        'Single and double-sided printing',
        'High-resolution color printing',
        'Bulk printing discounts',
      ],
    },
    {
      icon: 'fas fa-book-open',
      title: 'Book Binding',
      description: 'Give your documents a professional finish with our binding services. We offer spiral, comb, and other binding options to suit your needs.',
      details: [
        'Spiral binding',
        'Comb binding',
        'Perfect binding (for softcover books)',
        'Custom covers',
      ],
    },
    {
      icon: 'fas fa-id-card',
      title: 'Lamination',
      description: 'Protect your important documents, photos, and IDs from damage with our lamination services. We offer a variety of sizes and finishes.',
      details: [
        'ID card lamination',
        'Document lamination (up to A3 size)',
        'Gloss and matte finishes',
        'Durable and long-lasting',
      ],
    },
    {
      icon: 'fas fa-camera',
      title: 'Passport Photos',
      description: 'Get professional passport, visa, and ID photos taken in-store. We ensure your photos meet all official requirements.',
      details: [
        'Guaranteed to meet government standards',
        'Digital and print copies available',
        'Fast and convenient service',
      ],
    },
  ];

  return (
    <div className="services-container">
      <div className="container">
        <h2 className="page-title">Our Services</h2>
        <div className="service-grid-full">
          {services.map((service, index) => (
            <div key={index} className="service-card-full">
              <div className="service-card-header">
                <i className={service.icon}></i>
                <h3>{service.title}</h3>
              </div>
              <div className="service-card-body">
                <p>{service.description}</p>
                <ul>
                  {service.details.map((detail, i) => (
                    <li key={i}>{detail}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;