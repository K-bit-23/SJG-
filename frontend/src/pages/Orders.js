import React, { useState } from 'react';
import './Orders.css';

const Orders = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const orders = [
    {
      icon: 'fas fa-box',
      title: 'Order #12345 - Pens and Notebooks',
      date: 'Placed on: 2023-10-27',
      status: 'Status: Shipped',
      description: 'A recent order of office supplies.',
      details: [
        'Item: Blue Pens (x10)',
        'Item: A5 Lined Notebook (x5)',
        'Total: $25.00',
        'Shipping Address: 123 Main St, Anytown, USA',
      ],
    },
    {
      icon: 'fas fa-print',
      title: 'Order #12346 - Printing Services',
      date: 'Placed on: 2023-10-25',
      status: 'Status: Delivered',
      description: 'Bulk printing job.',
      details: [
        'Service: A4 Color Printing (x100)',
        'Finishing: Stapled',
        'Total: $50.00',
        'Delivery Address: 456 Oak Ave, Anytown, USA',
      ],
    },
    {
        icon: 'fas fa-book-open',
        title: 'Order #12347 - Book Binding',
        date: 'Placed on: 2023-10-22',
        status: 'Status: Delivered',
        description: 'Spiral binding for a presentation.',
        details: [
          'Service: Spiral Binding (x2)',
          'Cover: Clear Acetate',
          'Total: $15.00',
          'Pickup: Ready for pickup at store',
        ],
      },
  ];

  const toggleDropdown = (index) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <div className="orders-container">
      <div className="container">
        <h2 className="page-title">Your Orders</h2>
        {orders.length > 0 ? (
          <div className="order-list">
            {orders.map((order, index) => (
              <div key={index} className="order-card">
                <div className="order-card-header" onClick={() => toggleDropdown(index)}>
                  <div className="order-header-left">
                    <i className={order.icon}></i>
                    <h3>{order.title}</h3>
                  </div>
                  <i className={`fas fa-chevron-down ${openIndex === index ? 'open' : ''}`}></i>
                </div>
                <div className={`order-card-body ${openIndex === index ? 'open' : ''}`}>
                  <p>{order.description}</p>
                  <p>{order.date}</p>
                  <p>{order.status}</p>
                  <ul>
                    {order.details.map((detail, i) => (
                      <li key={i}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>You have no recent orders.</p>
        )}
      </div>
    </div>
  );
};

export default Orders;
